import React, { useState, useEffect, useMemo } from 'react';
import { Users, Folder, Sunrise, Sun, Moon, Coffee, Flag, PartyPopper, Gift, Hammer, Zap, Cpu, MessageSquare, Bot, Cloud, CloudRain, CloudLightning, Wind, Maximize2, Minimize2, X, HelpCircle } from 'lucide-react';
import GalleryShowcase from '../components/GalleryShowcase';
import { localIntelligence, callNvidiaLLM, ZARULIJAM_SYSTEM_PROMPT } from '../lib/nvidia';
import {
    DISTRICT_INFO,
    ANCHOR_PATH_TO_DISTRICT,
    MANUAL_REGION_DISTRICT,
    BUNDLED_HOVER_DISTRICTS,
    DEFAULT_MAP_FILL,
    TERMINAL_CONTEXT,
    DEPLOY_COMMAND
} from '../constants';
import {
    normalizeDistrict,
    extractFillFromStyle,
    readKualaLumpurShowcaseCache,
    writeKualaLumpurShowcaseCache,
    extractShowcaseProjectUrls,
    parseKrackedProjectDetail,
    extractKrackedDescription,
    downloadCSV
} from '../utils';

const LandingPage = ({
    profiles,
    submissions,
    session,
    handleJoinClick,
    isMobileView,
    setPublicPage,
    setSelectedDetailProfile,
    isTerminalEnlarged,
    setIsTerminalEnlarged,
    holidayConfig
}) => {
    // Map State
    const [activeRegion, setActiveRegion] = useState(null);
    const [activeDistrictHoverKey, setActiveDistrictHoverKey] = useState(null);
    const [selectedDistrictKey, setSelectedDistrictKey] = useState(null);
    const [mapRegions, setMapRegions] = useState([]);
    const [mapViewMode, setMapViewMode] = useState('builders'); // 'builders' or 'projects'

    // Mascot & Weather State
    const [showMascotModal, setShowMascotModal] = useState(false);
    const [weatherData, setWeatherData] = useState({ temp: '--', condition: 'Loading...' });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatMode, setChatMode] = useState('local'); // 'ai' or 'local'
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = React.useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Mascot Responses — Focused on site navigation with chill Malaysian vibe
    const handleSendMessage = async (e, text = null) => {
        if (e) e.preventDefault();
        const input = text || chatInput;
        if (!input.trim() || isAiLoading) return;

        const userMsg = { role: 'user', text: input };
        setChatMessages(prev => [...prev, userMsg]);
        if (!text) setChatInput('');

        if (chatMode === 'ai') {
            setIsAiLoading(true);
            try {
                const history = chatMessages.map(m => ({
                    role: m.role === 'bot' ? 'assistant' : 'user',
                    content: m.text
                }));
                const response = await callNvidiaLLM(ZARULIJAM_SYSTEM_PROMPT, input, 'meta/llama-3.3-70b-instruct', history);
                setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
            } catch (error) {
                console.error('AI Error:', error);
                // Fallback to local if AI fails
                const fallback = localIntelligence(input, chatMessages.map(m => ({
                    role: m.role === 'bot' ? 'assistant' : 'user',
                    content: m.text
                })));
                setChatMessages(prev => [...prev, { role: 'bot', text: `(AI Offline) ${fallback}` }]);
            } finally {
                setIsAiLoading(false);
            }
        } else {
            // Local Mode
            setTimeout(() => {
                const response = localIntelligence(input, chatMessages.map(m => ({
                    role: m.role === 'bot' ? 'assistant' : 'user',
                    content: m.text
                })));
                const botMsg = { role: 'bot', text: response };
                setChatMessages(prev => [...prev, botMsg]);
            }, 600);
        }
    };

    const SUGGESTED_QUESTIONS = [
        "macam mana nak join?",
        "apa itu necb?",
        "7-day sprint tu apa?",
        "tools apa yang perlu?",
        "siapa ijam?"
    ];

    // Mouse Tracking for Mascot Eyes
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isTerminalEnlarged || showMascotModal) {
                setMousePos({ x: e.clientX, y: e.clientY });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isTerminalEnlarged, showMascotModal]);

    // Sequential Animation State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [typedCommand, setTypedCommand] = useState('');
    const [typedTimestamp, setTypedTimestamp] = useState('');
    const [typedGreeting, setTypedGreeting] = useState('');
    const [typingPhase, setTypingPhase] = useState('command'); // command -> timestamp -> greeting

    // Weather Fetching (Shah Alam, Selangor)
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=3.0738&longitude=101.5183&current_weather=true');
                const data = await res.json();
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;

                let condition = 'Clear';
                if (code >= 1 && code <= 3) condition = 'Cloudy';
                else if (code >= 45 && code <= 48) condition = 'Foggy';
                else if (code >= 51 && code <= 67) condition = 'Raining';
                else if (code >= 71 && code <= 86) condition = 'Snowing';
                else if (code >= 95) condition = 'Storm';

                setWeatherData({ temp, condition });
            } catch (e) {
                setWeatherData({ temp: '30', condition: 'Sunny' }); // Fallback
            }
        };
        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 600000); // Update every 10 mins
        return () => clearInterval(weatherInterval);
    }, []);

    const WeatherIcon = ({ condition, size = 16 }) => {
        if (condition.includes('Rain')) return <CloudRain size={size} color="#3b82f6" />;
        if (condition.includes('Storm')) return <CloudLightning size={size} color="#fbbf24" />;
        if (condition.includes('Cloud')) return <Cloud size={size} color="#64748b" />;
        return <Sun size={size} color="#f59e0b" fill="#f59e0b" />;
    };

    const IjamBotMascot = ({ size = 24, mousePos }) => {
        // Calculate eye position based on mousePos
        const eyeX = (mousePos.x / window.innerWidth - 0.5) * 4;
        const eyeY = (mousePos.y / window.innerHeight - 0.5) * 4;

        return (
            <div style={{ position: 'relative', width: size, height: size }}>
                <div style={{ background: 'var(--selangor-red)', padding: '4px', borderRadius: '6px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width={size * 0.75} height={size * 0.75} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="2" />
                        <path d="M12 7v4" />
                        <line x1="8" y1="16" x2="8" y2="16.01" style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }} strokeWidth="3" />
                        <line x1="16" y1="16" x2="16" y2="16.01" style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }} strokeWidth="3" />
                    </svg>
                </div>
            </div>
        );
    };

    // Ticking Clock for Prompt
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Snapshot of greeting info once to avoid typing restarts
    const staticGreeting = useMemo(() => {
        const now = new Date();
        const hour = now.getHours();
        const date = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Kaomoji Collections
        const KAOMOJI = {
            MORNING: ['(o^▽^o)', '(´• ω •`)', '(⌒_⌒;)', '(*/ω＼)', '(o_ _)o'],
            AFTERNOON: ['(⌐■_■)', '(¯h¯)', '(¬‿¬)', '(^_−)☆', '(˙꒳˙)'],
            EVENING: ['( ☕_☕ )', '(￣▽￣)', '( ´ ▽ ` )', '(o_ _)o', '(・・ ) ?'],
            NIGHT: ['( ☾ )', '(－_－) zzZ', '(x_x)', '(o_ _)o 💤', '(⇀‸↼‶)'],
            VIBE: ['(ﾉ^ヮ^)ﾉ*:・ﾟ✧', '(✿◠‿◠)', '(☆▽☆)', '( ˙꒳​˙ )', '(b ᵔ▽ᵔ)b']
        };

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        let timeLabel = "SELAMAT DATANG!";
        let timeIcon = getRandom(KAOMOJI.VIBE);

        if (hour >= 5 && hour < 12) { timeLabel = "SELAMAT PAGI!"; timeIcon = getRandom(KAOMOJI.MORNING); }
        else if (hour >= 12 && hour < 15) { timeLabel = "SELAMAT TENGAHARI!"; timeIcon = getRandom(KAOMOJI.AFTERNOON); }
        else if (hour >= 15 && hour < 19) { timeLabel = "SELAMAT PETANG!"; timeIcon = getRandom(KAOMOJI.EVENING); }
        else if (hour >= 19 || hour < 5) { timeLabel = "SELAMAT MALAM!"; timeIcon = getRandom(KAOMOJI.NIGHT); }

        // Combine with holiday greeting if available
        let finalGreetingText = `${timeIcon} ${timeLabel}`;
        if (holidayConfig) {
            finalGreetingText += ` & ${holidayConfig.botLabel}! ${getRandom(KAOMOJI.VIBE)}`;
        } else {
            finalGreetingText += ` READY TO VIBE? ${getRandom(KAOMOJI.VIBE)}`;
        }

        return {
            timestamp: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
            text: finalGreetingText
        };
    }, [holidayConfig]);

    // Sequential Typing
    useEffect(() => {
        let index = 0;
        const typingTimer = setInterval(() => {
            if (typingPhase === 'command') {
                if (index < DEPLOY_COMMAND.length) {
                    setTypedCommand(DEPLOY_COMMAND.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typingTimer);
                    setTimeout(() => {
                        setTypingPhase('timestamp');
                    }, 400);
                }
            } else if (typingPhase === 'timestamp') {
                if (index < staticGreeting.timestamp.length) {
                    setTypedTimestamp(staticGreeting.timestamp.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typingTimer);
                    setTimeout(() => {
                        setTypingPhase('greeting');
                    }, 300);
                }
            } else if (typingPhase === 'greeting') {
                if (index < staticGreeting.text.length) {
                    setTypedGreeting(staticGreeting.text.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typingTimer);
                }
            }
        }, 30);

        return () => clearInterval(typingTimer);
    }, [typingPhase, staticGreeting]);

    // KL Showcase State
    const [kualaLumpurShowcase, setKualaLumpurShowcase] = useState([]);
    const [krackedDescription, setKrackedDescription] = useState('KrackedDevs');
    const [isKualaLumpurLoading, setIsKualaLumpurLoading] = useState(false);
    const [pendingKualaLumpurOpen, setPendingKualaLumpurOpen] = useState(false);

    // Derived Map Data
    const hoveredRegionData = mapRegions.find((region) => region.id === activeRegion) || null;
    const selectedDistrictName = selectedDistrictKey ? DISTRICT_INFO[selectedDistrictKey]?.name : null;

    const loadMapGeometry = async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}selangor-parlimen.svg`);
            const svgText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgNS = 'http://www.w3.org/2000/svg';
            const scratchSvg = document.createElementNS(svgNS, 'svg');
            scratchSvg.setAttribute('width', '660');
            scratchSvg.setAttribute('height', '724');
            scratchSvg.style.position = 'absolute';
            scratchSvg.style.opacity = '0';
            scratchSvg.style.pointerEvents = 'none';
            document.body.appendChild(scratchSvg);

            const paths = Array.from(doc.querySelectorAll('path'))
                .map((pathEl, index) => {
                    const style = pathEl.getAttribute('style') || '';
                    const d = pathEl.getAttribute('d') || '';
                    const fill = extractFillFromStyle(style);
                    const id = pathEl.getAttribute('id') || `region-${index}`;

                    if (!d || !style.includes('fill:') || !style.includes('stroke:#000000') || !style.includes('stroke-width:2')) {
                        return null;
                    }
                    if (!fill.startsWith('#')) return null;

                    const probePath = document.createElementNS(svgNS, 'path');
                    probePath.setAttribute('d', d);
                    scratchSvg.appendChild(probePath);
                    const box = probePath.getBBox();
                    scratchSvg.removeChild(probePath);

                    return {
                        id,
                        d,
                        fill,
                        centerX: box.x + (box.width / 2),
                        centerY: box.y + (box.height / 2),
                    };
                })
                .filter(Boolean);

            const anchorCenters = paths
                .filter((region) => ANCHOR_PATH_TO_DISTRICT[region.id])
                .map((region) => ({
                    districtKey: ANCHOR_PATH_TO_DISTRICT[region.id],
                    x: region.centerX,
                    y: region.centerY
                }));

            const annotatedRegions = paths.map((region) => {
                const fixedDistrictKey = MANUAL_REGION_DISTRICT[region.id] || ANCHOR_PATH_TO_DISTRICT[region.id];
                if (fixedDistrictKey) {
                    return { ...region, districtKey: fixedDistrictKey };
                }

                let nearestDistrictKey = null;
                let nearestDistance = Number.POSITIVE_INFINITY;
                anchorCenters.forEach((anchor) => {
                    const dx = region.centerX - anchor.x;
                    const dy = region.centerY - anchor.y;
                    const dist = (dx * dx) + (dy * dy);
                    if (dist < nearestDistance) {
                        nearestDistance = dist;
                        nearestDistrictKey = anchor.districtKey;
                    }
                });

                return { ...region, districtKey: nearestDistrictKey };
            });

            document.body.removeChild(scratchSvg);
            setMapRegions(annotatedRegions);
        } catch (error) {
            console.error('Failed to load Selangor map geometry', error);
            setMapRegions([]);
        }
    };

    const districtShowcase = useMemo(() => {
        if (!selectedDistrictName) return [];

        const normalizedSelected = normalizeDistrict(selectedDistrictName);
        const isDistrictMatch = (districtValue) => {
            const itemDistrict = normalizeDistrict(districtValue || '');
            if (!itemDistrict || !normalizedSelected) return false;
            return itemDistrict === normalizedSelected ||
                itemDistrict.includes(normalizedSelected) ||
                normalizedSelected.includes(itemDistrict);
        };

        if (mapViewMode === 'builders') {
            const districtBuilders = profiles
                .filter(p => !['owner', 'admin'].includes(p.role))
                .filter(p => isDistrictMatch(p.district))
                .map(p => ({
                    id: `builder-${p.id}`,
                    name: p.full_name || 'Anonymous Builder',
                    handle: p.threads_handle || '',
                    role: p.role,
                    district: p.district,
                    builder_profile: p
                }));
            return districtBuilders;
        }

        // Project Showcase Logic: Deduplicate and Include Day 0
        const submissionMap = new Map();
        submissions.forEach(s => {
            const profile = profiles.find(p => p.id === s.user_id);
            if (profile && ['owner', 'admin'].includes(profile.role)) return;

            if (isDistrictMatch(s.district || profile?.district)) {
                const existing = submissionMap.get(s.user_id);
                if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
                    submissionMap.set(s.user_id, s);
                }
            }
        });

        // Convert Map to list
        const districtSubmissions = Array.from(submissionMap.values()).map(item => ({
            id: `project-${item.id}`,
            submission_url: item.submission_url,
            project_name: item.project_name || 'Untitled Project',
            one_liner: item.one_liner || 'Builder update from VibeSelangor community.',
            builder_profile: profiles.find(p => p.id === item.user_id)
        }));

        // Add Day 0 Builders who don't have submissions yet
        const day0Builders = profiles
            .filter(p => !['owner', 'admin'].includes(p.role))
            .filter(p => {
                if (!p.district || !p.idea_title) return false;
                if (submissionMap.has(p.id)) return false; // Already have a submission

                return isDistrictMatch(p.district);
            })
            .map(p => ({
                id: `day0-${p.id}`,
                submission_url: '#',
                project_name: p.idea_title,
                one_liner: p.problem_statement || 'Building the future of Selangor.',
                builder_profile: p
            }));

        const combined = [...day0Builders, ...districtSubmissions];

        if (selectedDistrictKey === 'kuala_lumpur') {
            const enrichedKL = kualaLumpurShowcase.map(record => ({
                ...record,
                isKD: true,
                favicon: 'https://www.google.com/s2/favicons?sz=64&domain=krackeddevs.com'
            }));
            return [...enrichedKL, ...combined];
        }

        return combined;
    }, [selectedDistrictKey, selectedDistrictName, submissions, kualaLumpurShowcase, mapViewMode, profiles]);

    const builderCountsByDistrict = useMemo(() => {
        const counts = {};
        profiles
            .filter(p => !['owner', 'admin'].includes(p.role))
            .forEach(p => {
                if (!p.district) return;
                const norm = normalizeDistrict(p.district);
                counts[norm] = (counts[norm] || 0) + 1;
            });

        return counts;
    }, [profiles]);

    const submissionCountsByDistrict = useMemo(() => {
        const counts = {};
        const latestSubmissionByUser = new Map();
        const uniqueUsersWithProjects = new Set();

        // 1. Identify users with formal submissions
        submissions.forEach(s => {
            const profile = profiles.find(p => p.id === s.user_id);
            if (profile && ['owner', 'admin'].includes(profile.role)) return;
            uniqueUsersWithProjects.add(s.user_id);

            const existing = latestSubmissionByUser.get(s.user_id);
            if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
                latestSubmissionByUser.set(s.user_id, s);
            }
        });

        // 2. Add users with idea titles (Day 0) who don't have submissions yet
        profiles.forEach(p => {
            if (['owner', 'admin'].includes(p.role)) return;
            if (p.idea_title && !uniqueUsersWithProjects.has(p.id)) {
                uniqueUsersWithProjects.add(p.id);
            }
        });

        // 3. Map these unique project owners to their district
        uniqueUsersWithProjects.forEach(userId => {
            const profile = profiles.find(p => p.id === userId);
            // Check submission district first, then profile district
            const latestSub = latestSubmissionByUser.get(userId);
            const districtText = (latestSub?.district || profile?.district || '').trim();

            if (districtText) {
                const norm = normalizeDistrict(districtText);
                counts[norm] = (counts[norm] || 0) + 1;
            }
        });

        // Include KrackedDevs showcase projects for Kuala Lumpur
        const klNorm = normalizeDistrict('Kuala Lumpur');
        counts[klNorm] = (counts[klNorm] || 0) + kualaLumpurShowcase.length;

        return counts;
    }, [profiles, submissions, kualaLumpurShowcase]);

    const getHeatmapColor = (count) => {
        if (count === 0) return '#e5e7eb'; // Gray — no submissions
        if (count === 1) return '#ef4444'; // Red
        if (count === 2) return '#f97316'; // Orange
        if (count === 3) return '#eab308'; // Yellow
        if (count === 4) return '#84cc16'; // Lime
        return '#22c55e';                  // Green — 5+
    };

    const districtLabelNodes = useMemo(() => {
        if (!mapRegions.length) return [];
        const groups = {};
        mapRegions.forEach(region => {
            const key = region.districtKey;
            if (!groups[key]) {
                groups[key] = { districtKey: key, sumX: 0, sumY: 0, count: 0 };
            }
            groups[key].sumX += region.centerX;
            groups[key].sumY += region.centerY;
            groups[key].count += 1;
        });
        return Object.values(groups).map(g => {
            const districtInfo = DISTRICT_INFO[g.districtKey];
            const normName = districtInfo ? normalizeDistrict(districtInfo.name) : null;
            return {
                districtKey: g.districtKey,
                x: g.sumX / g.count,
                y: g.sumY / g.count,
                builderCount: normName ? (builderCountsByDistrict[normName] || 0) : 0,
                submissionCount: normName ? (submissionCountsByDistrict[normName] || 0) : 0
            };
        });
    }, [mapRegions, builderCountsByDistrict, submissionCountsByDistrict]);

    const topDistricts = useMemo(() => {
        const source = mapViewMode === 'builders' ? builderCountsByDistrict : submissionCountsByDistrict;
        return Object.entries(source)
            .map(([norm, count]) => {
                const matchedInfo = Object.values(DISTRICT_INFO).find(info => normalizeDistrict(info.name) === norm);
                const isKL = norm === 'kualalumpur' || norm === 'kuala_lumpur' || (matchedInfo && normalizeDistrict(matchedInfo.name) === 'kualalumpur');
                const displayLabel = matchedInfo ? matchedInfo.name : (isKL ? 'Kuala Lumpur' : norm);
                const finalLabel = isKL ? `${displayLabel} [HQ]` : displayLabel;
                return [finalLabel, count];
            })
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [builderCountsByDistrict, submissionCountsByDistrict, mapViewMode]);

    useEffect(() => {
        let isCancelled = false;
        const loadKualaLumpurShowcase = async () => {
            const cached = readKualaLumpurShowcaseCache('kl_showcase_cache_v1');

            // Render cached showcase immediately while verifying if new submissions exist.
            if (cached?.records?.length) {
                setKualaLumpurShowcase(cached.records);
                setKrackedDescription(cached.description || 'KrackedDevs');
            }

            try {
                setIsKualaLumpurLoading(true);
                const listingResponse = await fetch('/api/kracked/showcase');
                const listingHtml = await listingResponse.text();
                if (isCancelled) return;

                const projectUrls = extractShowcaseProjectUrls(listingHtml);
                const latestSignature = projectUrls.join('|');
                const cachedSignature = Array.isArray(cached?.projectUrls) ? cached.projectUrls.join('|') : '';
                const hasNewSubmissions = latestSignature !== cachedSignature;

                // If listing is unchanged and cache exists, skip detail refetch.
                if (!hasNewSubmissions && cached?.records?.length) {
                    return;
                }

                const [homeResponse, records] = await Promise.all([
                    fetch('/api/kracked/'),
                    Promise.all(projectUrls.map(async (path, index) => {
                        try {
                            const detailResponse = await fetch(`/api/kracked${path}`);
                            const detailHtml = await detailResponse.text();
                            return parseKrackedProjectDetail(detailHtml, path, index);
                        } catch (error) {
                            return null;
                        }
                    }))
                ]);

                if (isCancelled) return;
                const homeHtml = await homeResponse.text();
                const cleanRecords = records.filter(Boolean);
                const description = extractKrackedDescription(homeHtml);

                setKrackedDescription(description);
                setKualaLumpurShowcase(cleanRecords);
                writeKualaLumpurShowcaseCache('kl_showcase_cache_v1', {
                    projectUrls,
                    total: projectUrls.length,
                    description,
                    records: cleanRecords,
                    updatedAt: Date.now()
                });
            } catch (error) {
                if (!isCancelled) {
                    console.error('Failed to scrape Kuala Lumpur showcase', error);
                    if (!cached?.records?.length) setKualaLumpurShowcase([]);
                }
            } finally {
                if (!isCancelled) setIsKualaLumpurLoading(false);
            }
        };

        loadKualaLumpurShowcase();
        loadMapGeometry();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!pendingKualaLumpurOpen) return;
        if (isKualaLumpurLoading) return;
        setSelectedDistrictKey('kuala_lumpur');
        setPendingKualaLumpurOpen(false);
    }, [pendingKualaLumpurOpen, isKualaLumpurLoading]);

    return (
        <>
            <section id="how-it-works" className="hero" style={{ paddingTop: '8px', paddingBottom: '40px' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="pill pill-red" style={{ marginBottom: '12px' }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h1 className="text-huge">Built for <span style={{ color: 'var(--selangor-red)' }}>Selangor</span>. Connecting and growing the builder community.</h1>
                        <button className="btn btn-red" style={{ marginTop: '12px' }} onClick={handleJoinClick}>Join the Cohort</button>
                    </div>
                    <div style={{ gridColumn: 'span 5' }}>
                        <div className="neo-card no-jitter" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className="pill" style={{ background: 'black', color: 'white', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={handleJoinClick}>PORTAL_ACCESS</span>
                                    <button
                                        onClick={() => setIsTerminalEnlarged(true)}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Maximize2 size={18} />
                                    </button>
                                </div>
                                <div className="weather-widget" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontWeight: '800', fontSize: '12px', color: '#444' }}>
                                    <span className="weather-location" style={{ opacity: 0.6 }}>SELANGOR:</span>
                                    <div className="weather-temp" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <WeatherIcon condition={weatherData.condition} />
                                        <span>{weatherData.temp}°C</span>
                                    </div>
                                </div>
                            </div>
                            <div className="terminal-shell" style={{ background: '#000', borderRadius: '12px', padding: '16px 20px', marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div className="terminal-prompt" style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ wordBreak: 'break-all' }}>{TERMINAL_CONTEXT}</span>
                                        </div>
                                        <span style={{ opacity: 0.7, marginLeft: 'auto' }}>{currentTime.toLocaleTimeString()}</span>
                                    </div>

                                    <p className="terminal-line" style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', marginTop: '0', width: 'auto', animation: 'none' }}>
                                        {typedCommand}
                                        {typingPhase === 'command' && <span className="terminal-caret">|</span>}
                                    </p>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <button
                                        onClick={() => setShowMascotModal(true)}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <IjamBotMascot size={28} mousePos={mousePos} />
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '2px' }}>
                                            <span className="terminal-bot-label" style={{ color: 'var(--selangor-red)', fontSize: '10px', fontWeight: '950', fontFamily: 'monospace', letterSpacing: '1px' }}>IJAM_BOT</span>
                                            <span style={{ color: '#666', fontSize: '9px', fontFamily: 'monospace' }}>{typedTimestamp}</span>
                                        </div>
                                        <p className="terminal-greeting" style={{ color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.4, minHeight: '1.2em' }}>
                                            {typedGreeting}
                                            {typingPhase === 'greeting' && <span className="terminal-caret" style={{ background: '#22c55e' }}>|</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mascot Modal */}
                            {showMascotModal && (
                                <div
                                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                                    onClick={() => setShowMascotModal(false)}
                                >
                                    <div
                                        style={{ background: 'white', border: '4px solid black', boxShadow: '12px 12px 0px black', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div style={{ background: 'var(--selangor-red)', width: '80px', height: '80px', margin: '0 auto 24px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <IjamBotMascot size={64} mousePos={mousePos} />
                                        </div>
                                        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Hello! I'm IJAM_BOT</h2>
                                        <p style={{ marginBottom: '24px', fontSize: '16px', lineHeight: 1.6 }}>"I'm your site navigation helper. Whether you're looking for the community map, tracking the leaderboard, or ready to join the cohort, I'm here to guide your way!"</p>
                                        <button className="btn btn-red w-full" onClick={() => setShowMascotModal(false)}>Back to Portal</button>
                                    </div>
                                </div>
                            )}

                            {/* Enlarged Terminal View with Chat */}
                            {isTerminalEnlarged && (
                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Bot size={24} color="var(--selangor-red)" />
                                            <h2 style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>IJAM_BOT_CONSOLE v1.0</h2>

                                            {/* Mode Toggle */}
                                            <div style={{ display: 'flex', background: '#222', padding: '2px', borderRadius: '6px', marginLeft: '20px', border: '1px solid #444' }}>
                                                <button
                                                    onClick={() => setChatMode('local')}
                                                    style={{
                                                        background: chatMode === 'local' ? 'var(--selangor-red)' : 'transparent',
                                                        color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace'
                                                    }}
                                                >
                                                    LOCAL_INTEL
                                                </button>
                                                <button
                                                    onClick={() => setChatMode('ai')}
                                                    style={{
                                                        background: chatMode === 'ai' ? '#3b82f6' : 'transparent',
                                                        color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace'
                                                    }}
                                                >
                                                    HYPER_AI
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsTerminalEnlarged(false)}
                                            style={{ background: 'var(--selangor-red)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                                        >
                                            <Minimize2 size={18} /> CLOSE_TERMINAL
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, background: '#0a0a0a', border: '2px solid #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        {/* Boot Logs */}
                                        <div style={{ padding: '24px 40px', background: '#000', borderBottom: '1px solid #222' }}>
                                            <div style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '14px', marginBottom: '8px' }}>{TERMINAL_CONTEXT} {currentTime.toLocaleTimeString()}</div>
                                            <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{typedCommand}</p>
                                        </div>

                                        {/* Chat Area */}
                                        <div style={{ flex: 1, padding: '20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {/* IJAM_BOT Initial Greeting */}
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                                <IjamBotMascot size={48} mousePos={mousePos} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: 'var(--selangor-red)', fontSize: '12px', fontWeight: '950', marginBottom: '4px' }}>IJAM_BOT @ {staticGreeting.timestamp}</div>
                                                    <p style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{staticGreeting.text}</p>
                                                </div>
                                            </div>

                                            {/* Chat History */}
                                            {chatMessages.map((msg, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                                    {msg.role === 'bot' && <IjamBotMascot size={48} mousePos={mousePos} />}
                                                    <div style={{ flex: 1, background: msg.role === 'user' ? 'var(--selangor-red)' : '#111', padding: '16px 20px', borderRadius: '12px', border: msg.role === 'bot' ? '1px solid #333' : 'none', maxWidth: '600px' }}>
                                                        <div style={{ color: msg.role === 'user' ? 'white' : 'var(--selangor-red)', fontSize: '11px', fontWeight: '950', marginBottom: '8px' }}>
                                                            {msg.role === 'user' ? 'YOU' : 'IJAM_BOT'}
                                                        </div>
                                                        <p style={{ color: 'white', margin: 0, fontSize: '18px', fontFamily: 'monospace' }}>{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Suggested Questions */}
                                        <div style={{ padding: '10px 40px', background: '#050505', display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #222' }}>
                                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(null, q)}
                                                    style={{ background: '#111', border: '1px solid #333', color: '#999', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--selangor-red)'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#999'; }}
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Input Area */}
                                        <form onSubmit={handleSendMessage} style={{ padding: '20px 40px', background: '#000', borderTop: '2px solid #222', display: 'flex', gap: '20px' }}>
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder={isAiLoading ? "Thinking..." : "Type a message to IJAM_BOT..."}
                                                disabled={isAiLoading}
                                                style={{ flex: 1, background: '#0a0a0a', border: '1px solid #333', color: 'white', padding: '16px 24px', borderRadius: '8px', outline: 'none', fontFamily: 'monospace', fontSize: '16px', opacity: isAiLoading ? 0.5 : 1 }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAiLoading}
                                                style={{ background: 'var(--selangor-red)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: isAiLoading ? 0.5 : 1 }}
                                            >
                                                {isAiLoading ? 'THINKING...' : 'SEND_VIBE'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section id="map" style={{ borderTop: '3px solid black', padding: '40px 0' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 5' }}>
                        <h2 style={{ fontSize: 'clamp(32px, 7vw, 48px)' }}>Community Map</h2>
                        <p>
                            {selectedDistrictKey
                                ? `Selected district: ${DISTRICT_INFO[selectedDistrictKey]?.name || selectedDistrictKey}`
                                : hoveredRegionData?.districtKey
                                    ? `Hover district: ${DISTRICT_INFO[hoveredRegionData.districtKey]?.name || hoveredRegionData.districtKey}`
                                    : 'Hover over regions to inspect the map.'}
                            {(selectedDistrictKey || hoveredRegionData?.districtKey) && (
                                <span style={{ fontWeight: '900', color: 'var(--selangor-red)', marginLeft: '12px' }}>
                                    | {(() => {
                                        const districtName = DISTRICT_INFO[selectedDistrictKey || hoveredRegionData.districtKey]?.name;
                                        const norm = districtName ? normalizeDistrict(districtName) : null;
                                        if (mapViewMode === 'builders') {
                                            const count = norm ? (builderCountsByDistrict[norm] || 0) : 0;
                                            return `${count} Builder${count === 1 ? '' : 's'}`;
                                        } else {
                                            const count = norm ? (submissionCountsByDistrict[norm] || 0) : 0;
                                            return `${count} Project${count === 1 ? '' : 's'}`;
                                        }
                                    })()}
                                </span>
                            )}
                        </p>
                        <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.72 }}>
                            Discover what Selangor builders are shipping this week and get inspired to launch your own project.
                        </p>
                        <div className={`neo-card no-jitter showcase-card${selectedDistrictName ? ' is-open' : ''}`} style={{ marginTop: '20px', border: '2px solid black', boxShadow: '6px 6px 0px black', padding: '20px' }}>
                            <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>
                                {mapViewMode === 'builders'
                                    ? (selectedDistrictName ? `${selectedDistrictName}${selectedDistrictKey === 'kuala_lumpur' ? ' [HQ]' : ''} Builders` : 'District Builders')
                                    : (selectedDistrictName ? `${selectedDistrictName}${selectedDistrictKey === 'kuala_lumpur' ? ' [HQ]' : ''} Showcase` : 'District Showcase')}
                            </h3>
                            {!selectedDistrictName && (
                                <p style={{ fontSize: '13px' }}>
                                    {mapViewMode === 'builders'
                                        ? "Click a region to view that district's builders."
                                        : "Click a region to view project submissions."}
                                </p>
                            )}
                            {selectedDistrictKey === 'kuala_lumpur' && isKualaLumpurLoading && kualaLumpurShowcase.length === 0 && (
                                <div className="showcase-loading">
                                    <div className="showcase-spinner" />
                                    <div style={{ fontSize: '13px', fontWeight: 700 }}>Loading Kuala Lumpur showcase...</div>
                                </div>
                            )}
                            {selectedDistrictName && districtShowcase.length === 0 && (
                                <p style={{ fontSize: '13px' }}>
                                    {mapViewMode === 'builders'
                                        ? 'No builders found for this district yet.'
                                        : 'No submissions yet for this district.'}
                                </p>
                            )}
                            {selectedDistrictName && districtShowcase.length > 0 && (
                                <div
                                    className="showcase-list"
                                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}
                                >
                                    {districtShowcase.map((item) => (
                                        mapViewMode === 'builders' ? (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    const detailProfile = item.builder_profile || profiles.find((p) => p.id === item.id?.replace('builder-', ''));
                                                    if (detailProfile) setSelectedDetailProfile(detailProfile);
                                                }}
                                                style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px dashed #999', paddingBottom: '6px', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.78, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {item.handle && (
                                                        <span style={{ textDecoration: 'none', color: 'var(--selangor-red)', fontWeight: 600 }}>
                                                            {item.handle.startsWith('@') ? item.handle : `@${item.handle}`}
                                                        </span>
                                                    )}
                                                    {!item.handle && <span style={{ fontStyle: 'italic' }}>No Threads handle</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.isKD && item.submission_url) {
                                                        window.open(item.submission_url, '_blank');
                                                    } else if (item.builder_profile) {
                                                        setSelectedDetailProfile(item.builder_profile);
                                                    }
                                                }}
                                                style={{ textDecoration: 'none', color: 'black', borderBottom: '1px dashed #999', paddingBottom: '6px', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {item.isKD && <img src={item.favicon} alt="" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />}
                                                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.project_name || 'Untitled Project'}</div>
                                                </div>
                                                <div style={{ fontSize: '12px', opacity: 0.78 }}>{item.one_liner || 'No transmission log.'}</div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="neo-card no-jitter map-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <a
                                href="https://www.selangor.gov.my/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                onClick={() => setSelectedDistrictKey(null)}
                            >
                                <div className="selangor-title" style={{ fontSize: '14px', fontWeight: '950', letterSpacing: '2px', opacity: 0.6 }}>SELANGOR DARUL EHSAN</div>
                            </a>
                            <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', gap: '10px', zIndex: 10 }}>
                                <button
                                    className={`btn ${mapViewMode === 'builders' ? 'btn-red' : 'btn-outline'}`}
                                    onClick={() => setMapViewMode('builders')}
                                    title="Show Builders"
                                    style={{ padding: '10px', border: '2px solid black', borderRadius: '10px', boxShadow: mapViewMode === 'builders' ? '3px 3px 0px black' : 'none' }}
                                >
                                    <Users size={20} />
                                </button>
                                <button
                                    className={`btn ${mapViewMode === 'projects' ? 'btn-red' : 'btn-outline'}`}
                                    onClick={() => setMapViewMode('projects')}
                                    title="Project Heatmap"
                                    style={{ padding: '10px', border: '2px solid black', borderRadius: '10px', boxShadow: mapViewMode === 'projects' ? '3px 3px 0px black' : 'none' }}
                                >
                                    <Folder size={20} />
                                </button>
                            </div>
                            <svg
                                viewBox="0 0 660.01999 724.20393"
                                className="map-svg"
                                style={{ width: '100%', maxWidth: '500px' }}
                                onMouseLeave={() => {
                                    setActiveRegion(null);
                                    setActiveDistrictHoverKey(null);
                                }}
                            >
                                <g transform="translate(0,-328.15821)">
                                    {mapRegions.map((region) => (
                                        <path
                                            key={region.id}
                                            d={region.d}
                                            fill={(() => {
                                                const isHighlighted =
                                                    selectedDistrictKey === region.districtKey
                                                    || activeRegion === region.id
                                                    || (activeDistrictHoverKey && region.districtKey === activeDistrictHoverKey);

                                                if (region.districtKey === 'putrajaya' && mapViewMode !== 'projects') return '#3b82f6';
                                                if (region.districtKey === 'kuala_lumpur' && mapViewMode !== 'projects') return '#22c55e';

                                                if (mapViewMode === 'projects') {
                                                    const normName = DISTRICT_INFO[region.districtKey]?.name ? normalizeDistrict(DISTRICT_INFO[region.districtKey].name) : null;
                                                    const subCount = normName ? (submissionCountsByDistrict[normName] || 0) : 0;
                                                    return getHeatmapColor(subCount);
                                                }

                                                if (!isHighlighted) return DEFAULT_MAP_FILL;
                                                return 'var(--selangor-red)';
                                            })()}
                                            stroke="black"
                                            strokeWidth="2"
                                            className={(() => {
                                                const isHighlighted =
                                                    selectedDistrictKey === region.districtKey
                                                    || activeRegion === region.id
                                                    || (activeDistrictHoverKey && region.districtKey === activeDistrictHoverKey);
                                                if (!isHighlighted) return '';
                                                if (mapViewMode === 'projects') {
                                                    const normName = DISTRICT_INFO[region.districtKey]?.name ? normalizeDistrict(DISTRICT_INFO[region.districtKey].name) : null;
                                                    const subCount = normName ? (submissionCountsByDistrict[normName] || 0) : 0;
                                                    if (subCount >= 5) return 'map-region-pulse-fast';
                                                    if (subCount >= 2) return 'map-region-pulse-med';
                                                    return 'map-region-pulse';
                                                }
                                                return 'map-region-pulse';
                                            })()}
                                            style={{ cursor: 'pointer', transition: 'fill 90ms linear' }}
                                            onMouseEnter={() => {
                                                setActiveRegion(region.id);
                                                setActiveDistrictHoverKey(BUNDLED_HOVER_DISTRICTS.has(region.districtKey) ? region.districtKey : null);
                                            }}
                                            onClick={() => {
                                                if (region.districtKey === 'kuala_lumpur' && isKualaLumpurLoading && kualaLumpurShowcase.length === 0) {
                                                    setPendingKualaLumpurOpen(true);
                                                }
                                                setSelectedDistrictKey(region.districtKey);
                                            }}
                                        />
                                    ))}
                                    {districtLabelNodes.map((node) => {
                                        const isHovered = activeRegion && mapRegions.find(r => r.id === activeRegion)?.districtKey === node.districtKey;
                                        const isSelected = selectedDistrictKey === node.districtKey;
                                        const pop = isHovered || isSelected;
                                        const activeVal = mapViewMode === 'builders' ? node.builderCount : node.submissionCount;

                                        if (activeVal === 0 || node.districtKey === 'putrajaya') return null;

                                        return (
                                            <text
                                                key={node.districtKey}
                                                x={node.x}
                                                y={node.y}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                style={{
                                                    fill: 'black',
                                                    fontSize: pop ? '50px' : '22px',
                                                    fontWeight: '950',
                                                    pointerEvents: 'none',
                                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.45)',
                                                    filter: pop
                                                        ? 'drop-shadow(0px 0px 6px white) drop-shadow(0px 0px 12px rgba(0,0,0,0.4))'
                                                        : 'drop-shadow(0px 0px 4px white)',
                                                }}
                                            >
                                                {activeVal}
                                            </text>
                                        );
                                    })}
                                </g>
                            </svg>
                            <div className="map-insight">
                                <div className="map-insight-subtitle">
                                    Top 3 Areas by {mapViewMode === 'builders' ? 'Builder Count' : 'Projects Submitted'}
                                </div>
                                {topDistricts.length === 0 && <div className="map-insight-empty">No data yet</div>}
                                {topDistricts.map(([name, count], index) => (
                                    <div key={name} className="map-insight-row">
                                        {index + 1}. {name} ({count} {mapViewMode === 'builders' ? `Builder${count === 1 ? '' : 's'}` : `Project${count === 1 ? '' : 's'}`})
                                    </div>
                                ))}
                                <div className="map-legend">
                                    <div className="map-legend-title">Legend</div>
                                    <div className="map-legend-row"><span className="legend-dot legend-default" />Selangor district</div>
                                    <div className="map-legend-row"><span className="legend-dot legend-hover" />Selected/Hovered district</div>
                                    <div className="map-legend-row"><span className="legend-dot legend-kl" />Kuala Lumpur</div>
                                    <div className="map-legend-row"><span className="legend-dot legend-putrajaya" />Putrajaya</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <GalleryShowcase
                profiles={profiles}
                session={session}
                submissions={submissions}
                isMobileView={isMobileView}
                limit={null}
                setPublicPage={setPublicPage}
                setSelectedDetailProfile={setSelectedDetailProfile}
            />
        </>
    );
};

export default LandingPage;
