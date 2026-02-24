package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	mem "picobot-memory-extract/memory"
)

type server struct {
	runtime *mem.ProjectMemoryRuntime
	store   *mem.MemoryStore
}

type retrieveRequest struct {
	UserID string `json:"user_id"`
	Query  string `json:"query"`
	Limit  int    `json:"limit"`
}

type memoryItem struct {
	Content string  `json:"content"`
	Score   float64 `json:"score"`
}

type retrieveResponse struct {
	MemoryBlock string       `json:"memory_block"`
	Items       []memoryItem `json:"items"`
}

type captureRequest struct {
	UserID           string         `json:"user_id"`
	SessionID        string         `json:"session_id"`
	UserMessage      string         `json:"user_message"`
	AssistantMessage string         `json:"assistant_message"`
	Metadata         map[string]any `json:"metadata"`
}

type writeRequest struct {
	UserID  string `json:"user_id"`
	Target  string `json:"target"`
	Content string `json:"content"`
	Append  *bool  `json:"append"`
}

type okResponse struct {
	OK bool `json:"ok"`
}

func main() {
	root := strings.TrimSpace(os.Getenv("MEMORY_WORKSPACE"))
	if root == "" {
		root = "."
	}
	absRoot, err := filepath.Abs(root)
	if err != nil {
		log.Fatalf("failed to resolve MEMORY_WORKSPACE: %v", err)
	}

	runtime, err := mem.NewProjectMemoryRuntime(absRoot, 300, 8, 7, nil)
	if err != nil {
		log.Fatalf("failed to initialize memory runtime: %v", err)
	}

	s := &server{
		runtime: runtime,
		store:   runtime.Store,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/v1/memory/retrieve", s.handleRetrieve)
	mux.HandleFunc("/v1/memory/capture", s.handleCapture)
	mux.HandleFunc("/v1/memory/write", s.handleWrite)

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8081"
	}
	addr := ":" + port
	log.Printf("memory-service listening on %s (workspace=%s)", addr, absRoot)
	if err := http.ListenAndServe(addr, withJSONMiddleware(mux)); err != nil {
		log.Fatal(err)
	}
}

func withJSONMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		next.ServeHTTP(w, r)
	})
}

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true})
}

func (s *server) handleRetrieve(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var req retrieveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	query := strings.TrimSpace(req.Query)
	if req.Limit <= 0 {
		req.Limit = 8
	}
	memoryBlock, err := s.runtime.BuildSystemPromptBlock(query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	recent := s.store.Recent(req.Limit)
	items := make([]memoryItem, 0, len(recent))
	for idx, entry := range recent {
		// Simple descending placeholder score for contract compatibility.
		score := 1.0 - (float64(idx) * 0.05)
		if score < 0 {
			score = 0
		}
		items = append(items, memoryItem{
			Content: entry.Text,
			Score:   score,
		})
	}

	_ = json.NewEncoder(w).Encode(retrieveResponse{
		MemoryBlock: memoryBlock,
		Items:       items,
	})
}

func (s *server) handleCapture(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var req captureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if strings.TrimSpace(req.UserMessage) == "" && strings.TrimSpace(req.AssistantMessage) == "" {
		writeError(w, http.StatusBadRequest, "user_message or assistant_message is required")
		return
	}

	if err := s.runtime.CaptureTurn(req.UserMessage, req.AssistantMessage); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = json.NewEncoder(w).Encode(okResponse{OK: true})
}

func (s *server) handleWrite(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var req writeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	target := strings.TrimSpace(req.Target)
	content := strings.TrimSpace(req.Content)
	if target == "" || content == "" {
		writeError(w, http.StatusBadRequest, "target and content are required")
		return
	}
	appendFlag := true
	if req.Append != nil {
		appendFlag = *req.Append
	}

	switch target {
	case "today":
		if err := s.store.AppendToday(content); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	case "long":
		if appendFlag {
			prev, err := s.store.ReadLongTerm()
			if err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if strings.TrimSpace(prev) != "" {
				content = strings.TrimRight(prev, "\n") + "\n" + content
			}
		}
		if err := s.store.WriteLongTerm(content); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	default:
		writeError(w, http.StatusBadRequest, "target must be 'today' or 'long'")
		return
	}

	_ = json.NewEncoder(w).Encode(okResponse{OK: true})
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// parseIntEnv reads int env with fallback.
func parseIntEnv(key string, fallback int) int {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	val, err := strconv.Atoi(raw)
	if err != nil || val <= 0 {
		return fallback
	}
	return val
}

func must(err error) {
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
