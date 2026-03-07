// vite.config.js
import { defineConfig } from "file:///E:/WebAPP/VibeOnboarding/node_modules/vite/dist/node/index.js";
import react from "file:///E:/WebAPP/VibeOnboarding/node_modules/@vitejs/plugin-react-swc/index.js";
import { VitePWA } from "file:///E:/WebAPP/VibeOnboarding/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["selangor-parlimen.svg", "icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "VibeSelangor",
        short_name: "VibeSelangor",
        description: "Selangor Builder Sprint 2026 \u2014 Now Everyone Can Build (NECB)",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#CE1126",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Builder Dashboard",
            short_name: "Dashboard",
            description: "Go to your builder dashboard",
            url: "/?page=dashboard",
            icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]
          },
          {
            name: "Builder Showcase",
            short_name: "Showcase",
            description: "View all builder projects",
            url: "/?page=showcase",
            icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]
          }
        ],
        categories: ["education", "productivity", "social"],
        lang: "ms-MY"
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
        // Don't enable SW in dev to avoid caching issues
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1e3
  },
  server: {
    proxy: {
      "/api/kracked": {
        target: "https://krackeddevs.com",
        changeOrigin: true,
        secure: false,
        timeout: 15e3,
        rewrite: (path) => path.replace(/^\/api\/kracked/, ""),
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            console.error("[Proxy /api/kracked] Error:", err.message);
            if (res && !res.headersSent) {
              res.writeHead(502, { "Content-Type": "text/plain" });
              res.end(`Kracked proxy error: ${err.message}`);
            }
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxXZWJBUFBcXFxcVmliZU9uYm9hcmRpbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFdlYkFQUFxcXFxWaWJlT25ib2FyZGluZ1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovV2ViQVBQL1ZpYmVPbmJvYXJkaW5nL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnc2VsYW5nb3ItcGFybGltZW4uc3ZnJywgJ2ljb25zL2ljb24tMTkyLnN2ZycsICdpY29ucy9pY29uLTUxMi5zdmcnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnVmliZVNlbGFuZ29yJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnVmliZVNlbGFuZ29yJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGFuZ29yIEJ1aWxkZXIgU3ByaW50IDIwMjYgXHUyMDE0IE5vdyBFdmVyeW9uZSBDYW4gQnVpbGQgKE5FQ0IpJyxcclxuICAgICAgICBzdGFydF91cmw6ICcvJyxcclxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwYTBhMGEnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI0NFMTEyNicsXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdC1wcmltYXJ5JyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0xOTIuc3ZnJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tNTEyLnN2ZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIHNob3J0Y3V0czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnQnVpbGRlciBEYXNoYm9hcmQnLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnRGFzaGJvYXJkJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHbyB0byB5b3VyIGJ1aWxkZXIgZGFzaGJvYXJkJyxcclxuICAgICAgICAgICAgdXJsOiAnLz9wYWdlPWRhc2hib2FyZCcsXHJcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbnMvaWNvbi0xOTIuc3ZnJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0J1aWxkZXIgU2hvd2Nhc2UnLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnU2hvd2Nhc2UnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ZpZXcgYWxsIGJ1aWxkZXIgcHJvamVjdHMnLFxyXG4gICAgICAgICAgICB1cmw6ICcvP3BhZ2U9c2hvd2Nhc2UnLFxyXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnL2ljb25zL2ljb24tMTkyLnN2ZycsIHNpemVzOiAnMTkyeDE5MicgfV1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIGNhdGVnb3JpZXM6IFsnZWR1Y2F0aW9uJywgJ3Byb2R1Y3Rpdml0eScsICdzb2NpYWwnXSxcclxuICAgICAgICBsYW5nOiAnbXMtTVknLFxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYyfSddLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7IG1heEVudHJpZXM6IDEwLCBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZTogeyBzdGF0dXNlczogWzAsIDIwMF0gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ3N0YXRpY1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dzdGF0aWMtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiBmYWxzZSAvLyBEb24ndCBlbmFibGUgU1cgaW4gZGV2IHRvIGF2b2lkIGNhY2hpbmcgaXNzdWVzXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpL2tyYWNrZWQnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9rcmFja2VkZGV2cy5jb20nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIHRpbWVvdXQ6IDE1MDAwLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9rcmFja2VkLywgJycpLFxyXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5KSA9PiB7XHJcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCByZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5IC9hcGkva3JhY2tlZF0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBpZiAocmVzICYmICFyZXMuaGVhZGVyc1NlbnQpIHtcclxuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMiwgeyAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nIH0pO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoYEtyYWNrZWQgcHJveHkgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUSxTQUFTLG9CQUFvQjtBQUM3UixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGVBQWUsQ0FBQyx5QkFBeUIsc0JBQXNCLG9CQUFvQjtBQUFBLE1BQ25GLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsV0FBVztBQUFBLFVBQ1Q7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFlBQVk7QUFBQSxZQUNaLGFBQWE7QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUssdUJBQXVCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDMUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPLENBQUMsRUFBRSxLQUFLLHVCQUF1QixPQUFPLFVBQVUsQ0FBQztBQUFBLFVBQzFEO0FBQUEsUUFDRjtBQUFBLFFBQ0EsWUFBWSxDQUFDLGFBQWEsZ0JBQWdCLFFBQVE7QUFBQSxRQUNsRCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLHNDQUFzQztBQUFBLFFBQ3JELGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQUEsY0FDaEUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDMUM7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksSUFBSSxlQUFlLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxjQUNoRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBQSxZQUMxQztBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxRQUNULFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxtQkFBbUIsRUFBRTtBQUFBLFFBQ3JELFdBQVcsQ0FBQyxVQUFVO0FBQ3BCLGdCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssTUFBTSxRQUFRO0FBQ3BDLG9CQUFRLE1BQU0sK0JBQStCLElBQUksT0FBTztBQUN4RCxnQkFBSSxPQUFPLENBQUMsSUFBSSxhQUFhO0FBQzNCLGtCQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixhQUFhLENBQUM7QUFDbkQsa0JBQUksSUFBSSx3QkFBd0IsSUFBSSxPQUFPLEVBQUU7QUFBQSxZQUMvQztBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
