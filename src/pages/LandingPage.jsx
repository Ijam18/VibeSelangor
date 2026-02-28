import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Folder, Sunrise, Sun, Moon, Coffee, Flag, PartyPopper, Gift, Hammer, Zap, Cpu, MessageSquare, Bot, Cloud, CloudRain, CloudLightning, Wind, Maximize2, Minimize2, X, Signal, Wifi } from 'lucide-react';
import { localIntelligence, callNvidiaLLM, ZARULIJAM_SYSTEM_PROMPT } from '../lib/nvidia';
import { callAssistantChat } from '../lib/assistantApi';
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
import { useLiveEvents } from '../utils/useLiveEvents';
import MobileHomeScreen from '../components/MobileHomeScreen';
import LiveIslandBlip from '../components/LiveIslandBlip';
import MobileStatusBar from '../components/MobileStatusBar';
import GalleryShowcase from '../components/GalleryShowcase';
import { getLiveProgramMeta } from '../utils/liveProgram';

const LandingPage = ({
    profiles,
    submissions,
    classes = [],
    session,
    currentUser,
    handleJoinClick,
    isMobileView,
    isPhoneView,
    isTabletView,
    setPublicPage,
    setSelectedDetailProfile,
    isTerminalEnlarged,
    setIsTerminalEnlarged,
    terminalMode = 'ijam',
    setTerminalMode = () => { },
    holidayConfig,
    viewMode = 'home',
    setNewProjectTrigger
}) => {
    const isMapOnlyView = viewMode === 'map';
    // Map State
    const [activeRegion, setActiveRegion] = useState(null);
    const [activeDistrictHoverKey, setActiveDistrictHoverKey] = useState(null);
    const [selectedDistrictKey, setSelectedDistrictKey] = useState(null);
    const [mapPopupOpen, setMapPopupOpen] = useState(false);
    const [mapPopupAnchor, setMapPopupAnchor] = useState({ x: 0, y: 0 });
    const [mapRegions, setMapRegions] = useState([]);
    const [mapViewMode, setMapViewMode] = useState('builders'); // 'builders' or 'projects'
    const [isMapInsightCollapsed, setIsMapInsightCollapsed] = useState(false);

    // Live Events (Public Holidays & Hijri Date)
    const { liveEventMessage, eventGreeting } = useLiveEvents();

    const liveStatusText = useMemo(() => {
        const safeProfiles = profiles || [];
        const safeSubmissions = submissions || [];
        const builderCount = safeProfiles.filter(p => !['owner', 'admin'].includes(p.role)).length;
        const projectCount = safeSubmissions.length;
        return `[LIVE STATUS] ${builderCount} Builders / ${projectCount} Projects. Vibe Level: MAXIMUM!`;
    }, [profiles, submissions]);

    const programTerminalLines = useMemo(() => {
        const list = classes || [];
        const programRows = list.filter((c) => String(c?.type || '').toLowerCase() === 'program');
        if (!programRows.length) return ['[PROGRAM] No active program window found.'];

        const now = new Date();
        const withWindow = programRows
            .map((row) => {
                const start = row?.date ? new Date(`${row.date}T00:00:00`) : null;
                if (!start || Number.isNaN(start.getTime())) return null;
                const end = new Date(start);
                end.setDate(end.getDate() + 7);
                return { row, start, end };
            })
            .filter(Boolean);
        if (!withWindow.length) return ['[PROGRAM] Program schedule exists but date is invalid.'];

        const active = withWindow.find((x) => x.row?.status === 'Active') ||
            withWindow.find((x) => now >= x.start && now <= x.end) ||
            withWindow
                .slice()
                .sort((a, b) => Math.abs(a.start - now) - Math.abs(b.start - now))[0];

        const programSubs = (submissions || []).filter((s) => {
            const created = new Date(s?.created_at || 0);
            return created >= active.start && created <= active.end && s?.status !== 'Archived';
        });

        const hasProjectLink = (s) => Boolean((s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '').trim());
        const buildersSet = new Set(programSubs.map((s) => s.user_id).filter(Boolean));
        const ideaCount = programSubs.filter((s) => !hasProjectLink(s)).length;
        const projectCount = programSubs.filter((s) => hasProjectLink(s)).length;

        return [
            `[PROGRAM] ${active.row?.title || 'VibeSelangor Program'} (${active.row?.status || 'Scheduled'})`,
            `[WINDOW] ${active.start.toLocaleDateString()} -> ${active.end.toLocaleDateString()}`,
            `[METRIC] Builders: ${buildersSet.size} | Ideas: ${ideaCount} | Projects: ${projectCount}`
        ];
    }, [classes, submissions]);
    const liveProgram = useMemo(() => getLiveProgramMeta(classes), [classes]);
    const activeClass = useMemo(
        () => (classes || []).find((c) => {
            const status = String(c?.status || '').toLowerCase();
            return status === 'active' || status === 'live';
        }) || null,
        [classes]
    );
    const mobileBuildersCount = useMemo(
        () => (profiles || []).filter((p) => !['owner', 'admin'].includes(p.role)).length,
        [profiles]
    );
    const isWebsiteLiveMode = !isMobileView && terminalMode === 'live';
    const districtNameEntries = useMemo(
        () =>
            Object.entries(DISTRICT_INFO)
                .map(([districtKey, info]) => [districtKey, normalizeDistrict(info?.name || '')])
                .filter(([, normalizedName]) => Boolean(normalizedName))
                .sort((a, b) => b[1].length - a[1].length),
        []
    );
    const districtAliasToKey = useMemo(
        () => ({
            wpputrajaya: 'putrajaya',
            wilayahpersekutuanputrajaya: 'putrajaya',
            federalterritoryputrajaya: 'putrajaya',
            putrajayawp: 'putrajaya',
            wpkualalumpur: 'kuala_lumpur',
            wilayahpersekutuankualalumpur: 'kuala_lumpur',
            federalterritorykualalumpur: 'kuala_lumpur'
        }),
        []
    );
    const resolveDistrictKey = (districtValue) => {
        const normalizedInput = normalizeDistrict(districtValue || '');
        if (!normalizedInput) return null;
        const directMatch = districtNameEntries.find(([, normalizedName]) => normalizedName === normalizedInput);
        if (directMatch) return directMatch[0];
        if (districtAliasToKey[normalizedInput]) return districtAliasToKey[normalizedInput];
        const fuzzyMatch = districtNameEntries.find(([, normalizedName]) => normalizedInput.includes(normalizedName));
        return fuzzyMatch ? fuzzyMatch[0] : null;
    };

    // Mascot & Weather State
    const [showMascotModal, setShowMascotModal] = useState(false);
    const [weatherData, setWeatherData] = useState({ temp: '--', condition: 'Loading...' });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatMode, setChatMode] = useState('local'); // 'ai' or 'local'
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showHeroDetails, setShowHeroDetails] = useState(false);
    const chatEndRef = React.useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    useEffect(() => {
        if (!(isMobileView && isMapOnlyView)) return;
        const targets = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean);
        const previous = targets.map((el) => ({
            el,
            overflowY: el.style.overflowY,
            overscrollBehaviorY: el.style.overscrollBehaviorY
        }));

        targets.forEach((el) => {
            el.style.overflowY = 'hidden';
            el.style.overscrollBehaviorY = 'none';
        });

        return () => {
            previous.forEach(({ el, overflowY, overscrollBehaviorY }) => {
                el.style.overflowY = overflowY;
                el.style.overscrollBehaviorY = overscrollBehaviorY;
            });
        };
    }, [isMobileView, isMapOnlyView]);

    useEffect(() => {
        if (!(isMobileView && isMapOnlyView)) return;
        if (!selectedDistrictKey) {
            setMapPopupOpen(false);
            return;
        }
        const raf = requestAnimationFrame(() => setMapPopupOpen(true));
        return () => cancelAnimationFrame(raf);
    }, [selectedDistrictKey, isMobileView, isMapOnlyView]);

    useEffect(() => {
        if (!(isMobileView && isMapOnlyView)) {
            setIsMapInsightCollapsed(false);
        }
    }, [isMobileView, isMapOnlyView]);

    const closeMapPopup = () => {
        setMapPopupOpen(false);
        setTimeout(() => setSelectedDistrictKey(null), 180);
    };

    // Mascot Responses — Focused on site navigation with chill Malaysian vibe
    const handleSendMessage = async (e, text = null) => {
        if (e) e.preventDefault();
        const input = text || chatInput;
        const lowerInput = input.toLowerCase().trim();
        if (!input.trim() || isAiLoading) return;

        const userMsg = { role: 'user', text: input };
        setChatMessages(prev => [...prev, userMsg]);
        if (!text) setChatInput('');

        // Handle Special Commands
        if (lowerInput === 'boot ijamos' || lowerInput === 'ijamos') {
            setTimeout(() => {
                setChatMessages(prev => [...prev, { role: 'bot', text: "[ SYSTEM ] BOOT_SEQUENCE: INITIALIZING_IJAM_OS... (b ᵔ▽ᵔ)b" }]);
                setTimeout(() => {
                    setPublicPage('ijamos');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 1200);
            }, 600);
            return;
        }

        if (lowerInput === 'stats') {
            const builderCount = profiles.filter(p => !['owner', 'admin'].includes(p.role)).length;
            const projectCount = submissions.length;
            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    role: 'bot',
                    text: `[ VIBE_STATS ]\n⚡ ACTIVE_BUILDERS: ${builderCount}\n🚀 PROJECTS_SHIPPED: ${projectCount}\n🔥 STATUS: MAXIMUM_VIBE\n\nSelangor tengah membara ni bro! (☆▽☆)`
                }]);
            }, 600);
            return;
        }

        if (chatMode === 'ai') {
            setIsAiLoading(true);
            try {
                const history = chatMessages.map(m => ({
                    role: m.role === 'bot' ? 'assistant' : 'user',
                    content: m.text
                }));
                const { answer } = await callAssistantChat({
                    userMessage: input,
                    history,
                    systemPrompt: ZARULIJAM_SYSTEM_PROMPT,
                    model: 'meta/llama-3.3-70b-instruct',
                    userId: session?.user?.id || null,
                    sessionId: session?.user?.id || 'landing-guest',
                    context: { page: 'landing' },
                    options: { use_memory: true, allow_scrape: false }
                });
                setChatMessages(prev => [...prev, { role: 'bot', text: answer }]);
            } catch (error) {
                console.error('AI Error:', error);
                // Fallback to direct NVIDIA call, then local intelligence.
                let fallback = '';
                try {
                    const history = chatMessages.map(m => ({
                        role: m.role === 'bot' ? 'assistant' : 'user',
                        content: m.text
                    }));
                    fallback = await callNvidiaLLM(ZARULIJAM_SYSTEM_PROMPT, input, 'meta/llama-3.3-70b-instruct', history);
                } catch (nvidiaErr) {
                    console.warn('Direct NVIDIA fallback failed:', nvidiaErr);
                    fallback = localIntelligence(input, chatMessages.map(m => ({
                        role: m.role === 'bot' ? 'assistant' : 'user',
                        content: m.text
                    })));
                }
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
        "boot ijamos",
        "stats",
        "macam mana nak join?",
        "apa itu necb?",
        "7-day sprint tu apa?",
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
    const [batteryPct, setBatteryPct] = useState('--%');
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

    const LiveMarquee = ({ profiles, submissions }) => {
        const safeProfiles = profiles || [];
        const safeSubmissions = submissions || [];

        const builderCount = safeProfiles.filter(p => !['owner', 'admin'].includes(p.role)).length;
        const projectCount = safeSubmissions.length;
        const latestProject = safeSubmissions[0];

        const items = [
            { label: "SITE_STATUS", value: "ONLINE", color: "marquee-green" },
            { label: "ACTIVE_BUILDERS", value: builderCount, color: "marquee-red" },
            { label: "PROJECTS_COMMITTED", value: projectCount, color: "marquee-yellow" },
            { label: "LATEST_DROP", value: latestProject ? `${latestProject.project_name}` : "WAITING", color: "marquee-red" },
            { label: "VIBE_LEVEL", value: "MAXIMUM", color: "marquee-green" },
            { label: "LOCATION", value: "SELANGOR, MY", color: "marquee-yellow" },
        ];

        const marqueeRef = useRef(null);

        // Start in the middle
        useEffect(() => {
            if (marqueeRef.current) {
                const container = marqueeRef.current;
                const singleSectionWidth = container.scrollWidth / 3;
                container.scrollLeft = singleSectionWidth;
            }
        }, []);

        const handleScroll = () => {
            if (!marqueeRef.current) return;
            const container = marqueeRef.current;
            const singleSectionWidth = container.scrollWidth / 3;

            // Same precise logic as GalleryShowcase
            if (container.scrollLeft <= 10) {
                container.scrollLeft = singleSectionWidth + container.scrollLeft;
            } else if (container.scrollLeft >= singleSectionWidth * 2 - 10) {
                container.scrollLeft = container.scrollLeft - singleSectionWidth;
            }
        };

        // Auto-scrolling animation removed per user request

        const renderSet = (setIdx) => (
            <div key={setIdx} className="marquee-set" style={{ display: 'flex', gap: '60px', paddingRight: '60px', flexShrink: 0 }}>
                {items.map((item, i) => (
                    <div key={i} className="marquee-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="marquee-status" />
                        <span>{item.label}:</span>
                        <span className={item.color} style={{ whiteSpace: 'nowrap' }}>{item.value}</span>
                    </div>
                ))}
            </div>
        );

        return (
            <div className="live-marquee-section" style={{ overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '3px solid black' }}>
                <div
                    ref={marqueeRef}
                    onScroll={handleScroll}
                    className="marquee-content hidden-scrollbar"
                    style={{
                        display: 'flex',
                        width: '100%',
                        overflowX: 'auto', // Must be scrollable for JS modifying scrollLeft
                        overflowY: 'hidden',
                        animation: 'none', // Override CSS rules
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                    }}
                >
                    {renderSet(1)}
                    {renderSet(2)}
                    {renderSet(3)}
                </div>
            </div>
        );
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

    useEffect(() => {
        let battery = null;
        const handleBatteryUpdate = () => {
            if (!battery) return;
            setBatteryPct(`${Math.round((battery.level || 0) * 100)}%`);
        };

        if (typeof navigator === 'undefined' || !navigator.getBattery) {
            setBatteryPct('--%');
            return undefined;
        }

        navigator.getBattery().then((manager) => {
            battery = manager;
            handleBatteryUpdate();
            battery.addEventListener('levelchange', handleBatteryUpdate);
            battery.addEventListener('chargingchange', handleBatteryUpdate);
        }).catch(() => setBatteryPct('--%'));

        return () => {
            if (!battery) return;
            battery.removeEventListener('levelchange', handleBatteryUpdate);
            battery.removeEventListener('chargingchange', handleBatteryUpdate);
        };
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
            MORNING: ['(o^▽^o)', '(´• ω •`)', '(⌒_⌒;)', '(*/ω＼)', ':)'],
            AFTERNOON: ['(⌐■_■)', '(¯h¯)', '(¬‿¬)', '(^_−)☆', '(˙꒳˙)'],
            EVENING: ['( ☕_☕ )', '(￣▽￣)', '( ´ ▽ ` )', ':)', '(・・ ) ?'],
            NIGHT: ['( ☾ )', '(－_－) zzZ', '(x_x)', ':) 💤', '(⇀‸↼‶)'],
            VIBE: ['(ﾉ^ヮ^)ﾉ*:・ﾟ✧', '(✿◠‿◠)', '(☆▽☆)', '( ˙꒳​˙ )', '(b ᵔ▽ᵔ)b']
        };

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        let timeLabel = "SELAMAT DATANG!";
        let timeIcon = getRandom(KAOMOJI.VIBE);

        if (hour >= 5 && hour < 12) { timeLabel = "SELAMAT PAGI!"; timeIcon = getRandom(KAOMOJI.MORNING); }
        else if (hour >= 12 && hour < 15) { timeLabel = "SELAMAT TENGAHARI!"; timeIcon = getRandom(KAOMOJI.AFTERNOON); }
        else if (hour >= 15 && hour < 19) { timeLabel = "SELAMAT PETANG!"; timeIcon = getRandom(KAOMOJI.EVENING); }
        else if (hour >= 19 || hour < 5) { timeLabel = "SELAMAT MALAM!"; timeIcon = getRandom(KAOMOJI.NIGHT); }

        let finalGreetingLines = [];
        finalGreetingLines.push(`${timeIcon} ${timeLabel}`);
        if (holidayConfig) {
            finalGreetingLines.push(`Selamat menyambut ${holidayConfig.botLabel}!`);
        } else {
            if (eventGreeting) {
                finalGreetingLines.push(eventGreeting);
            }
            finalGreetingLines.push("Semua orang boleh akses IjamOS sekarang!");
        }
        if (isMobileView) {
            finalGreetingLines.push("Use the IjamOS icon on Home to open IjamOS.");
            finalGreetingLines.push("This website is optimized for PWA.");
        } else {
            finalGreetingLines.push("Use OPEN IJAMOS to launch IjamOS.");
            finalGreetingLines.push("Use OPEN CHAT for IJAM_BOT conversation.");
        }

        return {
            timestamp: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
            text: finalGreetingLines.join('\n')
        };
    }, [holidayConfig, eventGreeting, isMobileView]);

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

        const selectedDistrictResolvedKey = resolveDistrictKey(selectedDistrictName);
        const isDistrictMatch = (districtValue) => {
            const itemDistrictKey = resolveDistrictKey(districtValue);
            if (!itemDistrictKey || !selectedDistrictResolvedKey) return false;
            return itemDistrictKey === selectedDistrictResolvedKey;
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

        // Project Showcase Logic: latest submission per builder (no duplicate daily rows)
        const latestSubmissionByUser = new Map();
        submissions.forEach((s) => {
            const profile = profiles.find((p) => p.id === s.user_id);
            if (profile && ['owner', 'admin'].includes(profile.role)) return;
            const existing = latestSubmissionByUser.get(s.user_id);
            if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
                latestSubmissionByUser.set(s.user_id, s);
            }
        });

        const districtSubmissions = Array.from(latestSubmissionByUser.values())
            .filter((s) => {
                const profile = profiles.find((p) => p.id === s.user_id);
                return isDistrictMatch(s.district || profile?.district);
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((item) => ({
                id: `project-${item.id}`,
                submission_url: item.submission_url,
                project_name: item.project_name || 'Untitled Project',
                one_liner: item.one_liner || 'Builder update from VibeSelangor community.',
                builder_profile: profiles.find(p => p.id === item.user_id)
            }));

        if (selectedDistrictKey === 'kuala_lumpur') {
            const enrichedKL = kualaLumpurShowcase.map(record => ({
                ...record,
                isKD: true,
                favicon: 'https://www.google.com/s2/favicons?sz=64&domain=krackeddevs.com'
            }));
            return [...enrichedKL, ...districtSubmissions];
        }

        return districtSubmissions;
    }, [selectedDistrictKey, selectedDistrictName, submissions, kualaLumpurShowcase, mapViewMode, profiles]);

    const builderCountsByDistrict = useMemo(() => {
        const counts = {};
        profiles
            .filter(p => !['owner', 'admin'].includes(p.role))
            .forEach(p => {
                if (!p.district) return;
                const districtKey = resolveDistrictKey(p.district);
                if (!districtKey) return;
                counts[districtKey] = (counts[districtKey] || 0) + 1;
            });

        return counts;
    }, [profiles]);

    const submissionCountsByDistrict = useMemo(() => {
        const counts = {};
        const latestSubmissionByUser = new Map();
        submissions.forEach((s) => {
            const profile = profiles.find((p) => p.id === s.user_id);
            if (profile && ['owner', 'admin'].includes(profile.role)) return;
            const existing = latestSubmissionByUser.get(s.user_id);
            if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
                latestSubmissionByUser.set(s.user_id, s);
            }
        });

        latestSubmissionByUser.forEach((s) => {
            const profile = profiles.find((p) => p.id === s.user_id);
            const districtText = (s.district || profile?.district || '').trim();
            const districtKey = resolveDistrictKey(districtText);
            if (!districtKey) return;
            counts[districtKey] = (counts[districtKey] || 0) + 1;
        });

        // Include KrackedDevs showcase projects for Kuala Lumpur
        counts.kuala_lumpur = (counts.kuala_lumpur || 0) + kualaLumpurShowcase.length;

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
            return {
                districtKey: g.districtKey,
                x: g.sumX / g.count,
                y: g.sumY / g.count,
                builderCount: builderCountsByDistrict[g.districtKey] || 0,
                submissionCount: submissionCountsByDistrict[g.districtKey] || 0
            };
        });
    }, [mapRegions, builderCountsByDistrict, submissionCountsByDistrict]);

    const topDistricts = useMemo(() => {
        const source = mapViewMode === 'builders' ? builderCountsByDistrict : submissionCountsByDistrict;
        return Object.entries(source)
            .map(([districtKey, count]) => {
                const matchedInfo = DISTRICT_INFO[districtKey];
                const isKL = districtKey === 'kuala_lumpur';
                const displayLabel = matchedInfo ? matchedInfo.name : districtKey;
                const finalLabel = isKL ? `${displayLabel} [HQ]` : displayLabel;
                return [finalLabel, count];
            })
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [builderCountsByDistrict, submissionCountsByDistrict, mapViewMode]);

    const shouldLoadMapData = !isMobileView || isMapOnlyView;

    useEffect(() => {
        if (!shouldLoadMapData) return;
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
    }, [shouldLoadMapData]);

    useEffect(() => {
        if (!pendingKualaLumpurOpen) return;
        if (isKualaLumpurLoading) return;
        setSelectedDistrictKey('kuala_lumpur');
        setPendingKualaLumpurOpen(false);
    }, [pendingKualaLumpurOpen, isKualaLumpurLoading]);

    useEffect(() => {
        if (!isMobileView || isMapOnlyView) return;
        const rootEl = document.getElementById('root');
        const htmlEl = document.documentElement;
        const prevBodyTouch = document.body.style.touchAction;
        const prevRootTouch = rootEl?.style.touchAction ?? '';
        const prevBodyOverflow = document.body.style.overflowY;
        const prevRootOverflow = rootEl?.style.overflowY ?? '';
        const prevHtmlTouch = htmlEl.style.touchAction;
        const prevHtmlOverflow = htmlEl.style.overflowY;
        const prevBodyOverscroll = document.body.style.overscrollBehaviorY;
        const prevHtmlOverscroll = htmlEl.style.overscrollBehaviorY;

        document.body.style.touchAction = 'pan-x';
        document.body.style.overflowY = 'hidden';
        document.body.style.overscrollBehaviorY = 'none';
        htmlEl.style.touchAction = 'pan-x';
        htmlEl.style.overflowY = 'hidden';
        htmlEl.style.overscrollBehaviorY = 'none';
        if (rootEl) {
            rootEl.style.touchAction = 'pan-x';
            rootEl.style.overflowY = 'hidden';
        }

        return () => {
            document.body.style.touchAction = prevBodyTouch;
            document.body.style.overflowY = prevBodyOverflow;
            document.body.style.overscrollBehaviorY = prevBodyOverscroll;
            htmlEl.style.touchAction = prevHtmlTouch;
            htmlEl.style.overflowY = prevHtmlOverflow;
            htmlEl.style.overscrollBehaviorY = prevHtmlOverscroll;
            if (rootEl) {
                rootEl.style.touchAction = prevRootTouch;
                rootEl.style.overflowY = prevRootOverflow;
            }
        };
    }, [isMobileView, isMapOnlyView]);

    const mapMobileBackdropStyle = isMobileView && isMapOnlyView
        ? {
            position: 'relative',
            minHeight: 'var(--app-vh, 100vh)',
            background: "linear-gradient(160deg, rgba(120,0,16,0.42), rgba(198,20,42,0.26) 42%, rgba(234,179,8,0.24) 100%), url('/wallpapers/selangor-mobile.jpg') center / cover no-repeat"
        }
        : { position: 'relative' };

    return (
        <div style={mapMobileBackdropStyle}>
            {/* Live marquee removed per mobile/homepage requirements */}
            {!isMapOnlyView && isMobileView && (
                <MobileHomeScreen
                    weatherData={weatherData}
                    onNavigate={(id) => {
                        if (id === 'kd') {
                            window.open('https://krackeddevs.com', '_blank', 'noopener,noreferrer');
                            return;
                        }
                        if (id === 'settings' || id === 'new-project') {
                            if (!session) {
                                handleJoinClick();
                                return;
                            }
                            if (id === 'new-project') {
                                setPublicPage('start-project');
                                return;
                            }
                            setPublicPage('dashboard');
                        } else if (id === 'myapp') {
                            setPublicPage('builder-vault');
                        } else if (id === 'chat' || id === 'promptforge') {
                            setPublicPage('home');
                            setTerminalMode('live');
                        } else {
                            setPublicPage(id);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSendChat={(text) => handleSendMessage(null, text)}
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    onChatInputChange={setChatInput}
                    isAiLoading={isAiLoading}
                    buildersCount={mobileBuildersCount}
                    terminalContext={TERMINAL_CONTEXT}
                    terminalTime={currentTime.toLocaleTimeString()}
                    typedCommand={typedCommand}
                    typingPhase={typingPhase}
                    typedTimestamp={typedTimestamp}
                    typedGreeting={typedGreeting}
                    liveStatusText={liveStatusText}
                    liveEventMessage={liveEventMessage}
                    programTerminalLines={programTerminalLines}
                    isTabletView={isTabletView}
                    session={session}
                    activeClass={activeClass}
                    terminalMode={terminalMode}
                    onTerminalModeChange={setTerminalMode}
                    liveBlip={{
                        isLive: Boolean(liveProgram),
                        title: liveProgram?.title,
                        windowText: liveProgram?.windowText,
                        onJoin: () => setPublicPage('how-it-works')
                    }}
                />
            )}
            {!isMapOnlyView && !isMobileView && <section id="how-it-works" className="hero hero-glow-container" style={{ paddingTop: '8px', paddingBottom: '40px' }}>
                <div className="hero-aura" />
                <div className="container grid-12">
                    {!isMobileView && <div style={{ gridColumn: 'span 5' }}>
                        <div className="pill pill-red" style={{ marginBottom: '12px' }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h1 className="text-huge">Build real apps in 7 days.<br />No code. Just vibes.</h1>
                        <button className="btn btn-outline" style={{ marginTop: '10px', padding: '8px 14px', fontSize: '11px' }} onClick={() => setShowHeroDetails((prev) => !prev)}>
                            {showHeroDetails ? 'Hide details' : 'Show details'}
                        </button>
                        {showHeroDetails && (
                            <p style={{ marginTop: '12px', fontSize: '13px', lineHeight: 1.55, maxWidth: '560px' }}>
                                VibeSelangor helps anyone ship a practical app using AI tools, guided sprint tasks, and community support.
                                Start small, launch fast, and improve with real feedback.
                            </p>
                        )}
                    </div>}
                    <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 7' }}>
                        <div className="neo-card no-jitter" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button className="btn btn-red" style={{ padding: '8px 12px', fontSize: '10px' }} onClick={handleJoinClick}>
                                        Join Cohort
                                    </button>
                                    <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '10px' }} onClick={() => { setPublicPage('ijamos'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                        Open IjamOS
                                    </button>
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
                            <div
                                className="terminal-shell"
                                style={{ background: '#000', borderRadius: '12px', padding: '16px 20px', marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div className="terminal-prompt" style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ wordBreak: 'break-all' }}>{TERMINAL_CONTEXT}</span>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    border: '1px solid #000',
                                                    borderRadius: 999,
                                                    background: activeClass ? '#ef4444' : '#f8fafc',
                                                    color: activeClass ? '#fff' : '#111827',
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    fontFamily: 'monospace',
                                                    padding: '3px 8px',
                                                    boxShadow: '2px 2px 0 #000'
                                                }}
                                            >
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeClass ? '#fef2f2' : '#94a3b8' }} />
                                                {activeClass ? 'CLASS LIVE' : 'CLASS IDLE'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsTerminalEnlarged(true)}
                                                style={{
                                                    border: '1px solid rgba(59,130,246,0.7)',
                                                    borderRadius: 999,
                                                    background: 'rgba(30,58,138,0.5)',
                                                    color: '#fff',
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fontFamily: 'monospace',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                OPEN CHAT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!activeClass && terminalMode !== 'live') return;
                                                    setTerminalMode(terminalMode === 'live' ? 'ijam' : 'live');
                                                }}
                                                disabled={!activeClass && terminalMode !== 'live'}
                                                style={{
                                                    border: '1px solid rgba(239,68,68,0.6)',
                                                    borderRadius: 999,
                                                    background: terminalMode === 'live' ? 'rgba(239,68,68,0.95)' : 'rgba(15,23,42,0.45)',
                                                    color: '#fff',
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fontFamily: 'monospace',
                                                    padding: '4px 8px',
                                                    opacity: (!activeClass && terminalMode !== 'live') ? 0.45 : 1,
                                                    cursor: (!activeClass && terminalMode !== 'live') ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {terminalMode === 'live' ? 'LIVE ON' : 'LIVE CLASS CHAT'}
                                            </button>
                                            <span style={{ opacity: 0.7 }}>{currentTime.toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    <p className="terminal-line" style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', marginTop: '0', width: 'auto', animation: 'none' }}>
                                        {typedCommand}
                                        {typingPhase === 'command' && <span className="terminal-caret">|</span>}
                                    </p>

                                    {typingPhase !== 'command' && !isWebsiteLiveMode && (
                                        <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5, marginTop: '2px', marginBottom: '14px' }}>
                                            <div>{liveStatusText}</div>
                                            {liveEventMessage && <div>[LIVE EVENT] {liveEventMessage}</div>}
                                            {programTerminalLines.map((line) => (
                                                <div key={line}>{line}</div>
                                            ))}
                                        </div>
                                    )}
                                    {isWebsiteLiveMode && (
                                        <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5, marginTop: '2px', marginBottom: '14px' }}>
                                            {activeClass ? (
                                                <>
                                                    <div>[LIVE CLASS] {activeClass.title || 'Class Session'}</div>
                                                    <div>[WINDOW] {activeClass.date ? new Date(activeClass.date).toLocaleDateString() : 'TBD'} | {activeClass.time || 'TBD'}</div>
                                                    <div>[STATUS] Streaming from class chat in terminal.</div>
                                                    {(chatMessages || []).slice(-2).map((msg, idx) => (
                                                        <div key={`website-live-${idx}`}>[{msg.role === 'user' ? 'YOU' : 'IJAM'}] {String(msg.text || '').slice(0, 88)}</div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div>[LIVE CLASS] No active class right now.</div>
                                            )}
                                        </div>
                                    )}
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
                                        <p className="terminal-greeting" style={{ color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.4, minHeight: '1.2em', whiteSpace: 'pre-wrap' }}>
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
                                <div style={{ position: 'fixed', inset: 0, background: '#020202', zIndex: 10000, padding: isMobileView ? '0' : '20px', display: 'flex', flexDirection: 'column' }}>
                                    {isMobileView && (
                                        <div style={{ padding: '10px 16px 6px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '0.03em', borderBottom: '1px solid #1f1f1f' }}>
                                            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', opacity: 0.9 }}>
                                                <Signal size={13} />
                                                <Wifi size={13} />
                                                <span style={{ fontSize: 11, fontWeight: 500 }}>{batteryPct}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobileView ? '8px' : '20px', padding: isMobileView ? '10px 12px' : '0 20px', borderBottom: isMobileView ? '1px solid #1f1f1f' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Bot size={24} color="var(--selangor-red)" />
                                            <h2 style={{ color: 'white', fontFamily: 'monospace', margin: 0, fontSize: isMobileView ? '13px' : '24px' }}>IJAM_BOT_CONSOLE v1.0</h2>

                                            {/* Mode Toggle */}
                                            <div style={{ display: 'flex', background: '#222', padding: '2px', borderRadius: '6px', marginLeft: isMobileView ? '6px' : '20px', border: '1px solid #444' }}>
                                                <button
                                                    onClick={() => setChatMode('local')}
                                                    style={{
                                                        background: chatMode === 'local' ? 'var(--selangor-red)' : 'transparent',
                                                        color: 'white', border: 'none', padding: isMobileView ? '3px 8px' : '4px 12px', borderRadius: '4px', fontSize: isMobileView ? '9px' : '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace'
                                                    }}
                                                >
                                                    LOCAL_INTEL
                                                </button>
                                                <button
                                                    onClick={() => setChatMode('ai')}
                                                    style={{
                                                        background: chatMode === 'ai' ? '#3b82f6' : 'transparent',
                                                        color: 'white', border: 'none', padding: isMobileView ? '3px 8px' : '4px 12px', borderRadius: '4px', fontSize: isMobileView ? '9px' : '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace'
                                                    }}
                                                >
                                                    HYPER_AI
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsTerminalEnlarged(false)}
                                            style={{ background: 'var(--selangor-red)', color: 'white', border: 'none', padding: isMobileView ? '8px 10px' : '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: isMobileView ? '11px' : '14px' }}
                                        >
                                            <Minimize2 size={16} /> {isMobileView ? 'CLOSE' : 'CLOSE_TERMINAL'}
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, background: '#0a0a0a', border: isMobileView ? 'none' : '2px solid #333', borderRadius: isMobileView ? '0' : '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        {/* Boot Logs */}
                                        <div style={{ padding: isMobileView ? '14px 14px' : '24px 40px', background: '#000', borderBottom: '1px solid #222' }}>
                                            <div style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '14px', marginBottom: '8px' }}>{TERMINAL_CONTEXT} {currentTime.toLocaleTimeString()}</div>
                                            <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{typedCommand}</p>
                                        </div>

                                        {/* Chat Area */}
                                        <div style={{ flex: 1, padding: isMobileView ? '14px' : '20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                                        <div style={{ padding: isMobileView ? '8px 12px' : '10px 40px', background: '#050505', display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #222' }}>
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
                                        <form onSubmit={handleSendMessage} style={{ padding: isMobileView ? '10px 12px' : '20px 40px', background: '#000', borderTop: '2px solid #222', display: 'flex', gap: isMobileView ? '8px' : '20px' }}>
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder={isAiLoading ? "Thinking..." : "Type a message to IJAM_BOT..."}
                                                disabled={isAiLoading}
                                                style={{ flex: 1, background: '#0a0a0a', border: '1px solid #333', color: 'white', padding: isMobileView ? '11px 12px' : '16px 24px', borderRadius: '8px', outline: 'none', fontFamily: 'monospace', fontSize: isMobileView ? '14px' : '16px', opacity: isAiLoading ? 0.5 : 1 }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAiLoading}
                                                style={{ background: 'var(--selangor-red)', color: 'white', border: 'none', padding: isMobileView ? '11px 14px' : '16px 32px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobileView ? '12px' : '14px', opacity: isAiLoading ? 0.5 : 1 }}
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
            </section>}

            {/* Map Section */}
            {(!isMobileView || isMapOnlyView) && <section id="map" style={isMobileView ? { borderTop: 'none', padding: '28px 12px 92px', height: 'var(--app-vh, 100vh)', overflow: 'hidden', position: 'relative', background: isMapOnlyView ? 'transparent' : "linear-gradient(160deg, rgba(120,0,16,0.42), rgba(198,20,42,0.26) 42%, rgba(234,179,8,0.24) 100%), url('/wallpapers/selangor-mobile.jpg') center / cover no-repeat" } : { borderTop: '3px solid black', padding: '40px 0' }}>
                {isMobileView && isMapOnlyView && (
                    <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 980, margin: '0 auto' }}>
                        <MobileStatusBar
                            timeLabel={currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            batteryPct={batteryPct}
                            marginBottom={0}
                            centerContent={(
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(10,10,10,0.94)',
                                        color: '#fff',
                                        borderRadius: 12,
                                        padding: '4px 9px',
                                        fontSize: 9,
                                        fontWeight: 600,
                                        lineHeight: 1.1,
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                                        whiteSpace: 'nowrap',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 6,
                                        maxWidth: liveProgram ? '76%' : '60%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        pointerEvents: 'auto'
                                    }}
                                >
                                    <span style={{ pointerEvents: 'none', flex: 1, minWidth: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {mapViewMode === 'builders' ? 'Builder Map' : 'Project Heatmap'}
                                    </span>
                                    {liveProgram && (
                                        <LiveIslandBlip
                                            title={liveProgram.title}
                                            windowText={liveProgram.windowText}
                                            growLeft
                                        />
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}
                {isMobileView && isMapOnlyView && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            backdropFilter: 'blur(8px) saturate(1.08)',
                            background: 'linear-gradient(180deg, rgba(17,24,39,0.24) 0%, rgba(17,24,39,0.08) 40%, rgba(255,255,255,0.05) 100%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                )}
                <div className="container grid-12" style={isMobileView ? { gap: 10, maxWidth: isTabletView ? '980px' : '100%', margin: '22px auto 0', position: 'relative', zIndex: 1, height: 'calc(100% - 56px)', alignContent: 'stretch', justifyItems: 'center' } : undefined}>
                    {!isMobileView && (
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
                                            const districtKey = selectedDistrictKey || hoveredRegionData.districtKey;
                                            if (mapViewMode === 'builders') {
                                                const count = districtKey ? (builderCountsByDistrict[districtKey] || 0) : 0;
                                                return `${count} Builder${count === 1 ? '' : 's'}`;
                                            } else {
                                                const count = districtKey ? (submissionCountsByDistrict[districtKey] || 0) : 0;
                                                return `${count} Project${count === 1 ? '' : 's'}`;
                                            }
                                        })()}
                                    </span>
                                )}
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.72 }}>
                                Discover what Selangor builders are shipping this week and get inspired to launch your own project.
                            </p>
                            <div className={`neo-card no-jitter showcase-card${selectedDistrictName ? ' is-open' : ''}`} style={isMobileView ? { marginTop: 12, border: '1px solid rgba(255,255,255,0.82)', boxShadow: 'none', borderRadius: 18, backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.64)', padding: 14 } : { marginTop: '20px', border: '2px solid black', boxShadow: '6px 6px 0px black', padding: '20px' }}>
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
                    )}
                    <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 7', minHeight: 0, display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <div className="neo-card no-jitter map-card" style={isMobileView ? { border: '1px solid rgba(255,255,255,0.58)', boxShadow: '0 10px 24px rgba(15,23,42,0.14)', borderRadius: 22, backdropFilter: 'blur(18px) saturate(1.08)', background: 'rgba(255,244,244,0.34)', display: 'flex', justifyContent: isMapInsightCollapsed ? 'center' : 'flex-start', alignItems: 'center', position: 'relative', padding: isTabletView ? 18 : 14, width: '100%', maxWidth: isTabletView ? 'min(94vw, 900px)' : 'min(99vw, 620px)', height: '100%', minHeight: isTabletView ? 'calc(var(--app-vh, 100vh) - 200px)' : (isMapInsightCollapsed ? 'calc(var(--app-vh, 100vh) - 176px)' : 'calc(var(--app-vh, 100vh) - 190px)'), margin: '16px auto 0' } : { border: '3px solid black', boxShadow: '12px 12px 0px black', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <a
                                href="https://www.selangor.gov.my/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                onClick={() => setSelectedDistrictKey(null)}
                            >
                                <div className="selangor-title" style={{ fontSize: '14px', fontWeight: '950', letterSpacing: '2px', opacity: 0.6 }}>SELANGOR DARUL EHSAN</div>
                            </a>
                            <div style={{ position: 'absolute', bottom: '24px', right: isMobileView ? '12px' : '24px', display: 'flex', gap: '10px', zIndex: 10 }}>
                                <button
                                    className={`btn ${mapViewMode === 'builders' ? 'btn-red' : 'btn-outline'}`}
                                    onClick={() => setMapViewMode('builders')}
                                    title="Show Builders"
                                    style={isMobileView
                                        ? {
                                            width: 50,
                                            height: 50,
                                            padding: 0,
                                            borderRadius: 14,
                                            border: mapViewMode === 'builders' ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(15,23,42,0.24)',
                                            background: mapViewMode === 'builders' ? 'rgba(239,68,68,0.92)' : 'rgba(255,244,244,0.52)',
                                            color: mapViewMode === 'builders' ? '#fff' : '#0f172a',
                                            boxShadow: mapViewMode === 'builders' ? '0 8px 16px rgba(239,68,68,0.28)' : '0 6px 14px rgba(15,23,42,0.14)',
                                            backdropFilter: 'blur(10px)'
                                        }
                                        : { padding: '10px', border: '2px solid black', borderRadius: '10px', boxShadow: mapViewMode === 'builders' ? '3px 3px 0px black' : 'none' }}
                                >
                                    <Users size={22} />
                                </button>
                                <button
                                    className={`btn ${mapViewMode === 'projects' ? 'btn-red' : 'btn-outline'}`}
                                    onClick={() => setMapViewMode('projects')}
                                    title="Project Heatmap"
                                    style={isMobileView
                                        ? {
                                            width: 50,
                                            height: 50,
                                            padding: 0,
                                            borderRadius: 14,
                                            border: mapViewMode === 'projects' ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(15,23,42,0.24)',
                                            background: mapViewMode === 'projects' ? 'rgba(239,68,68,0.92)' : 'rgba(255,244,244,0.52)',
                                            color: mapViewMode === 'projects' ? '#fff' : '#0f172a',
                                            boxShadow: mapViewMode === 'projects' ? '0 8px 16px rgba(239,68,68,0.28)' : '0 6px 14px rgba(15,23,42,0.14)',
                                            backdropFilter: 'blur(10px)'
                                        }
                                        : { padding: '10px', border: '2px solid black', borderRadius: '10px', boxShadow: mapViewMode === 'projects' ? '3px 3px 0px black' : 'none' }}
                                >
                                    <Folder size={22} />
                                </button>
                            </div>
                            <svg
                                viewBox="0 0 660.01999 724.20393"
                                className="map-svg"
                                style={isMobileView ? { width: '100%', maxWidth: isTabletView ? 'min(90vw, 820px)' : (isMapInsightCollapsed ? 'min(99vw, 640px)' : 'min(96vw, 600px)'), marginTop: isMapInsightCollapsed ? 2 : 12, flex: '1 1 auto', minHeight: 0 } : { width: '100%', maxWidth: '500px' }}
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
                                                    const subCount = submissionCountsByDistrict[region.districtKey] || 0;
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
                                                    const subCount = submissionCountsByDistrict[region.districtKey] || 0;
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
                                            onPointerEnter={() => {
                                                setActiveRegion(region.id);
                                                setActiveDistrictHoverKey(BUNDLED_HOVER_DISTRICTS.has(region.districtKey) ? region.districtKey : null);
                                            }}
                                            onPointerDown={() => {
                                                setActiveRegion(region.id);
                                                setActiveDistrictHoverKey(BUNDLED_HOVER_DISTRICTS.has(region.districtKey) ? region.districtKey : null);
                                            }}
                                            onTouchStart={() => {
                                                setActiveRegion(region.id);
                                                setActiveDistrictHoverKey(BUNDLED_HOVER_DISTRICTS.has(region.districtKey) ? region.districtKey : null);
                                            }}
                                            onClick={(event) => {
                                                if (region.districtKey === 'kuala_lumpur' && isKualaLumpurLoading && kualaLumpurShowcase.length === 0) {
                                                    setPendingKualaLumpurOpen(true);
                                                }
                                                if (isMobileView && isMapOnlyView) {
                                                    setMapPopupAnchor({ x: event.clientX, y: event.clientY });
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
                            {isMobileView && isMapOnlyView && isMapInsightCollapsed ? (
                                <button
                                    type="button"
                                    onClick={() => setIsMapInsightCollapsed(false)}
                                    title="Expand map insight"
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        bottom: 14,
                                        width: 46,
                                        height: 46,
                                        borderRadius: 14,
                                        border: '1px solid rgba(239,68,68,0.55)',
                                        background: 'linear-gradient(160deg, rgba(239,68,68,0.96), rgba(234,179,8,0.94))',
                                        color: '#fff',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 20px rgba(239,68,68,0.24)',
                                        zIndex: 11
                                    }}
                                >
                                    <Maximize2 size={20} />
                                </button>
                            ) : (
                                <div className="map-insight">
                                    {isMobileView && isMapOnlyView && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                            <div className="map-insight-subtitle">
                                                Top 3 Areas by {mapViewMode === 'builders' ? 'Builder Count' : 'Projects Submitted'}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsMapInsightCollapsed(true)}
                                                title="Collapse map insight"
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 8,
                                                    border: '1px solid rgba(15,23,42,0.2)',
                                                    background: 'rgba(255,255,255,0.75)',
                                                    color: '#0f172a',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                            >
                                                <Minimize2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {!(isMobileView && isMapOnlyView) && (
                                        <div className="map-insight-subtitle">
                                            Top 3 Areas by {mapViewMode === 'builders' ? 'Builder Count' : 'Projects Submitted'}
                                        </div>
                                    )}
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
                            )}
                        </div>
                    </div>
                </div>
                {isMobileView && isMapOnlyView && selectedDistrictName && (
                    <div
                        onClick={closeMapPopup}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1200,
                            background: 'rgba(2,6,23,0.5)',
                            opacity: mapPopupOpen ? 1 : 0,
                            transition: 'opacity 180ms ease'
                        }}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: mapPopupOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.35)',
                                transformOrigin: '50% 50%',
                                transition: 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease',
                                opacity: mapPopupOpen ? 1 : 0,
                                width: 'min(92vw, 360px)',
                                maxHeight: '62vh',
                                overflowY: 'auto',
                                borderRadius: 18,
                                border: '1px solid rgba(148,163,184,0.4)',
                                background: 'rgba(255,255,255,0.92)',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 16px 34px rgba(15,23,42,0.22)',
                                padding: 12
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.15 }}>
                                        {selectedDistrictName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#475569' }}>
                                        {mapViewMode === 'builders'
                                            ? `${districtShowcase.length} Builder${districtShowcase.length === 1 ? '' : 's'}`
                                            : `${districtShowcase.length} Project${districtShowcase.length === 1 ? '' : 's'}`}
                                    </div>
                                </div>
                                <button
                                    onClick={closeMapPopup}
                                    style={{
                                        border: '1px solid rgba(148,163,184,0.5)',
                                        background: 'rgba(255,255,255,0.8)',
                                        borderRadius: 10,
                                        width: 30,
                                        height: 30,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {districtShowcase.length === 0 ? (
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                    {mapViewMode === 'builders'
                                        ? 'No builders found for this district yet.'
                                        : 'No submissions yet for this district.'}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {districtShowcase.map((item) => (
                                        <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', padding: '8px 9px' }}>
                                            {mapViewMode === 'builders' ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            if (item.builder_profile) {
                                                                setSelectedDetailProfile(item.builder_profile);
                                                                closeMapPopup();
                                                            }
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'transparent',
                                                            padding: 0,
                                                            margin: 0,
                                                            color: '#0f172a',
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                            textDecorationColor: 'rgba(15,23,42,0.28)',
                                                            textUnderlineOffset: 2
                                                        }}
                                                    >
                                                        {item.name || item.builder_profile?.full_name || 'Builder'}
                                                    </button>
                                                    <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        @{(item.handle || item.builder_profile?.threads_handle || 'builder').toString().replace(/^@+/, '')}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2, lineHeight: 1.35 }}>
                                                        {(item.builder_profile?.about_yourself || item.builder_profile?.problem_statement || 'Builder in progress.').slice(0, 100)}
                                                        {(item.builder_profile?.about_yourself || item.builder_profile?.problem_statement || '').length > 100 ? '...' : ''}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.project_name || 'Untitled Project'}</div>
                                                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{item.one_liner || 'No transmission log.'}</div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>}

            {!isMobileView && !isMapOnlyView && (
                <GalleryShowcase
                    profiles={profiles}
                    session={session}
                    submissions={submissions}
                    isMobileView={isMobileView}
                    limit={null}
                    setPublicPage={setPublicPage}
                    setSelectedDetailProfile={setSelectedDetailProfile}
                />
            )}
        </div>
    );
};

export default LandingPage;



