import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowRight, Check, Zap, Globe, Sparkles,
    Shield, Users, Layout, Smartphone,
    Search, Play, Plus, ChevronRight, MessageSquare,
    Lock, Lightbulb, Grid, Share2, Rocket,
    Send, User, Clock, MessageCircle, MoreVertical,
    LogOut, Calendar, Upload, ExternalLink, Filter,
    Eye, EyeOff,
    Settings, Award
} from 'lucide-react';
import { supabase } from './lib/supabase';

const DISTRICT_INFO = {
    sungai_besar: { name: 'Sungai Besar' },
    tanjong_karang: { name: 'Tanjong Karang' },
    selayang: { name: 'Selayang' },
    kuala_lumpur: { name: 'Kuala Lumpur' },
    sabak_bernam: { name: 'Sabak Bernam' },
    kuala_selangor: { name: 'Kuala Selangor' },
    kapar: { name: 'Kapar' },
    shah_alam: { name: 'Shah Alam' },
    damansara_utama: { name: 'Damansara Utama' },
    petaling_jaya: { name: 'Petaling Jaya' },
    kota_raya: { name: 'Kota Raya' },
    subang_jaya: { name: 'Subang Jaya' },
    puchong: { name: 'Puchong' },
    pandan_indah: { name: 'Pandan Indah' },
    ampang: { name: 'Ampang' },
    serdang: { name: 'Serdang' },
    putrajaya: { name: 'Putrajaya' },
    hulu_selangor: { name: 'Hulu Selangor' },
    klang: { name: 'Klang' },
    gombak: { name: 'Gombak' },
    petaling: { name: 'Petaling' },
    hulu_langat: { name: 'Hulu Langat' },
    kuala_langat: { name: 'Kuala Langat' },
    sepang: { name: 'Sepang' }
};

const ANCHOR_PATH_TO_DISTRICT = {
    'path3353-2': 'sabak_bernam',
    'path3353-0': 'kuala_selangor',
    'path3353-2-6': 'hulu_selangor',
    'path3351-1-1': 'klang',
    'path3353-2-5': 'gombak',
    'path3351-1-1-3': 'petaling',
    'path3353-2-6-7-0': 'hulu_langat',
    'path3351-1-6': 'kuala_langat',
    'path3351-1-6-1': 'sepang'
};

// Manual corrections provided by user, applied before auto nearest-anchor fallback.
const MANUAL_REGION_DISTRICT = {
    'path3353-2': 'sungai_besar',
    'path3353-0': 'sabak_bernam',
    'path3353-2-5': 'tanjong_karang',
    'path3353-2-6': 'hulu_selangor',
    'path3351-1-1': 'kuala_selangor',
    // Kuala Lumpur: user-confirmed central red polygon
    'path3353-2-6-7-0-4': 'ampang',
    // Preserve neighboring districts to avoid cross-label bleed
    'path3353-2-6-7-0': 'gombak',
    'path3353-2-6-7': 'selayang',
    'path3353-2-6-7-7': 'damansara_utama',
    'path3351-1-1-3': 'kapar',
    'path3353-2-6-7-0-4-2': 'pandan_indah',
    'path3351-1-1-3-5': 'shah_alam',
    'path3351-1-6-1': 'kota_raya',
    'path3351-1-8': 'kuala_langat',
    'path3351-1-6': 'klang',
    'path7691': 'kapar',
    'path7689': 'kapar',
    'path7760': 'kapar',
    'path7687': 'klang',
    'path3387-0': 'serdang',
    'path3387-7': 'sepang',
    'path5680': 'putrajaya',
    'path3351-1-6-1-0': 'puchong',
    'path3351-1-6-1-0-6': 'kuala_lumpur',
    'path3351-1-1-3-5-4': 'subang_jaya',
    'path3351-1-1-3-5-4-0': 'petaling_jaya',
    'path3351-1-1-3-5-4-0-7': 'petaling_jaya',
};

const BUNDLED_HOVER_DISTRICTS = new Set(['klang', 'kapar', 'petaling_jaya']);
const DEFAULT_MAP_FILL = '#f5d000';
const DEPLOY_COMMAND = '$ vibe deploy --target live';
const HEADER_LINKS = [
    { label: 'Coming Soon', page: 'coming-soon' },
    { label: 'How it works', page: 'how-it-works' },
    { label: 'Map', sectionId: 'map' }
];
const DISTRICT_OPTIONS = Array.from(new Set(Object.values(DISTRICT_INFO).map((entry) => entry.name))).sort();
const SPRINT_MODULE_STEPS = [
    'Threads Kickoff',
    'Day 1 Live Build (2h)',
    'Build & Improve (Day 2-6)',
    'Day 7 Review + Troubleshoot',
    'Showcase Submission'
];
const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || 'zarulijam@gmail.com').trim().toLowerCase();
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'zarulijam@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

function resolveRoleByEmail(emailValue) {
    const email = (emailValue || '').toLowerCase().trim();
    if (!email) return 'builder';
    if (email === OWNER_EMAIL) return 'owner';
    if (ADMIN_EMAILS.includes(email)) return 'admin';
    return 'builder';
}

function normalizeDistrict(value) {
    return (value || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractShowcaseProjectUrls(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const urls = new Set();
    Array.from(doc.querySelectorAll('a[href]')).forEach((anchor) => {
        const href = anchor.getAttribute('href') || '';
        const match = href.match(/(\/showcase\/project\/[a-z0-9-]+)/i);
        if (match?.[1]) urls.add(match[1]);
    });
    const regex = /href=['"](\/showcase\/project\/[a-z0-9-]+)['"]/gi;
    let match = regex.exec(htmlText);
    while (match) {
        urls.add(match[1]);
        match = regex.exec(htmlText);
    }
    return Array.from(urls);
}

function truncateText(value, max = 180) {
    const text = (value || '')
        .replace(/requestAnimationFrame\([\s\S]*?\);\s*/gi, ' ')
        .replace(/\{\$RT=[^}]*\}\);?/gi, ' ')
        .replace(/@media[^\n\r]*/gi, ' ')
        .replace(/@media[\s\S]*$/gi, ' ')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return '';
    if (text.length <= max) return text;
    return `${text.slice(0, max)}...`;
}

function sanitizeAuthorText(value) {
    const text = (value || '')
        .replace(/@media\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return '';
    if (/^@?media$/i.test(text)) return '';
    return text;
}

function parseKrackedProjectDetail(htmlText, projectPath, index) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const getText = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const isBroken = (text) => /requestAnimationFrame|\{\$RT=|function\(|<\/script>|<script|@media/i.test(text || '');

    const title = getText(doc.querySelector('h1'))
        || doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
        || `Project ${index + 1}`;

    const allNodes = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, div, span'));
    const transmissionLabel = allNodes.find((el) => /TRANSMISSION[_\s-]*LOG/i.test(getText(el)));
    const transmissionRaw = transmissionLabel ? getText(transmissionLabel.nextElementSibling) : '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const safeOneLinerSource = !isBroken(transmissionRaw) && transmissionRaw.length > 8 ? transmissionRaw : metaDescription;

    const operatorLabel = allNodes.find((el) => /PROJECT[_\s-]*OPERATOR/i.test(getText(el)));
    const operatorRaw = operatorLabel ? getText(operatorLabel.nextElementSibling) : '';
    const handleCandidates = (doc.body?.textContent || '').match(/@[a-z0-9_.-]{2,}/gi) || [];
    const validHandle = handleCandidates.find((handle) => !/^@?media$/i.test(handle));
    const author = sanitizeAuthorText(operatorRaw || validHandle || 'Unknown builder') || 'Unknown builder';

    return {
        id: `kl-${index}`,
        submission_url: `https://krackeddevs.com${projectPath}`,
        project_name: title,
        one_liner: truncateText(safeOneLinerSource || ''),
        builder_name: author,
    };
}

function extractKrackedDescription(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    return truncateText(metaDescription || ogDescription, 160) || 'KrackedDevs Showcase';
}

const KL_SHOWCASE_CACHE_KEY = 'kl_showcase_cache_v1';

function readKualaLumpurShowcaseCache() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(KL_SHOWCASE_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.projectUrls) || !Array.isArray(parsed?.records)) return null;
        return parsed;
    } catch (error) {
        return null;
    }
}

function writeKualaLumpurShowcaseCache(payload) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(KL_SHOWCASE_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
        // Ignore cache write failures.
    }
}

const App = () => {
    // Navigation & User State
    const [session, setSession] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Metadata from profile
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMode, setAuthMode] = useState('signin');
    const [authError, setAuthError] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [showAuthPassword, setShowAuthPassword] = useState(false);
    const [onboardingForm, setOnboardingForm] = useState({
        username: '',
        district: '',
        problemStatement: '',
        ideaTitle: '',
        threadsHandle: '',
        whatsappContact: '',
        discordTag: '',
        aboutYourself: '',
        programGoal: ''
    });

    // App UI State
    const [activeRegion, setActiveRegion] = useState(null);
    const [activeDistrictHoverKey, setActiveDistrictHoverKey] = useState(null);
    const [selectedDistrictKey, setSelectedDistrictKey] = useState(null);
    const [activeOnboardingStep, setActiveOnboardingStep] = useState(0);
    const [publicPage, setPublicPage] = useState('home');
    const [scrolled, setScrolled] = useState(false);
    const [mapRegions, setMapRegions] = useState([]);

    // Real-time Data State
    const [classes, setClasses] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [kualaLumpurShowcase, setKualaLumpurShowcase] = useState([]);
    const [krackedDescription, setKrackedDescription] = useState('KrackedDevs');
    const [isKualaLumpurLoading, setIsKualaLumpurLoading] = useState(false);

    // Form States
    const [newClass, setNewClass] = useState({ title: '', date: '', time: '' });
    const [newUpload, setNewUpload] = useState({ project: '', link: '' });
    const hoveredRegionData = mapRegions.find((region) => region.id === activeRegion) || null;
    const selectedDistrictName = selectedDistrictKey ? DISTRICT_INFO[selectedDistrictKey]?.name : null;
    const districtShowcase = useMemo(() => {
        if (!selectedDistrictName) return [];

        const districtSubmissions = submissions
            .filter((item) => normalizeDistrict(item.district) === normalizeDistrict(selectedDistrictName))
            .map((item) => ({
                id: `user-${item.id}`,
                submission_url: item.submission_url,
                project_name: item.project_name,
                one_liner: item.one_liner || 'Builder submission from VibeSelangor community.'
            }));

        if (selectedDistrictKey === 'kuala_lumpur') {
            return [...kualaLumpurShowcase, ...districtSubmissions];
        }

        return districtSubmissions;
    }, [selectedDistrictKey, selectedDistrictName, submissions, kualaLumpurShowcase]);
    const topDistricts = useMemo(() => {
        const districtProjects = new Map();
        submissions.forEach((item) => {
            const districtText = (item?.district || '').trim();
            if (!districtText) return;
            const normalized = normalizeDistrict(districtText);
            const matchedName = Object.values(DISTRICT_INFO)
                .map((entry) => entry.name)
                .find((name) => normalizeDistrict(name) === normalized);
            const label = matchedName || districtText;
            districtProjects.set(label, (districtProjects.get(label) || 0) + 1);
        });
        return Array.from(districtProjects.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [submissions]);
    const currentUserProjectCount = useMemo(() => {
        if (!currentUser?.id) return 0;
        return submissions.filter((item) => item?.user_id === currentUser.id).length;
    }, [submissions, currentUser?.id]);

    const handleHeaderNavClick = (event, item) => {
        event.preventDefault();
        if (item.page) {
            setPublicPage(item.page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setPublicPage('home');
        setTimeout(() => {
            const section = document.getElementById(item.sectionId);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const handleHeaderBrandClick = () => {
        setCurrentUser(null);
        setPublicPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        let isCancelled = false;
        const loadKualaLumpurShowcase = async () => {
            const cached = readKualaLumpurShowcaseCache();

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
                writeKualaLumpurShowcaseCache({
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
        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        // 1. Auth Listener
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchUserProfile(session.user.id);
            } else {
                setCurrentUser(null);
            }
        });

        // 2. Initial Data Fetch
        fetchData();
        loadMapGeometry();

        // 3. Real-time Subscriptions
        const classSub = supabase.channel('classes').on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_classes' }, fetchData).subscribe();
        const submissionSub = supabase.channel('submissions').on('postgres_changes', { event: '*', schema: 'public', table: 'builder_progress' }, fetchData).subscribe();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(classSub);
            supabase.removeChannel(submissionSub);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchData = async () => {
        const { data: classData } = await supabase.from('cohort_classes').select('*').order('date', { ascending: true });
        const { data: submissionData } = await supabase.from('builder_progress').select('*').order('created_at', { ascending: false });

        if (classData) setClasses(classData);
        if (submissionData) setSubmissions(submissionData);
    };

    const upsertProfile = async (userId, payload, forcedRole = null) => {
        const profilePayload = {
            id: userId,
            full_name: payload.username,
            district: payload.district,
            role: forcedRole || 'builder',
            idea_title: payload.ideaTitle,
            problem_statement: payload.problemStatement,
            threads_handle: payload.threadsHandle,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
        };

        // Try saving extended contacts if columns exist; fallback safely if they don't.
        let { error } = await supabase.from('profiles').upsert({
            ...profilePayload,
            whatsapp_contact: payload.whatsappContact,
            discord_tag: payload.discordTag,
            about_yourself: payload.aboutYourself,
            program_goal: payload.programGoal
        }, { onConflict: 'id' });

        if (error) {
            ({ error } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' }));
        }
        if (error) throw error;
    };

    const fetchUserProfile = async (userId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let profile = null;
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, district, role')
            .eq('id', userId)
            .maybeSingle();

        if (!error && data) profile = data;
        if (error && error.code !== 'PGRST116') {
            console.warn('Profile lookup failed. Falling back to auth metadata.', error.message);
        }

        // If profile row does not exist yet (e.g., email confirmed before first full session),
        // backfill from auth metadata so user data is visible in public.profiles.
        if (!profile) {
            const meta = user.user_metadata || {};
            const fallbackPayload = {
                username: meta.full_name || user.email.split('@')[0],
                district: meta.district || '',
                ideaTitle: meta.idea_title || '',
                problemStatement: meta.problem_statement || '',
                threadsHandle: meta.threads_handle || '',
                whatsappContact: meta.whatsapp_contact || '',
                discordTag: meta.discord_tag || '',
                aboutYourself: meta.about_yourself || '',
                programGoal: meta.program_goal || ''
            };

            try {
                if (fallbackPayload.username) {
                    await upsertProfile(userId, fallbackPayload, resolveRoleByEmail(user.email));
                    profile = {
                        full_name: fallbackPayload.username,
                        district: fallbackPayload.district,
                        role: resolveRoleByEmail(user.email)
                    };
                }
            } catch (profileError) {
                console.warn('Profile backfill skipped:', profileError.message);
            }
        }

        const metadataName = user.user_metadata?.full_name || user.email.split('@')[0];
        const email = (user.email || '').toLowerCase();
        const roleByEmail = resolveRoleByEmail(email);
        const roleFromProfile = profile?.role;
        const resolvedRole = roleByEmail !== 'builder' ? roleByEmail : (roleFromProfile || 'builder');

        setCurrentUser({
            id: user.id,
            email: user.email,
            type: resolvedRole,
            name: profile?.full_name || metadataName,
            district: profile?.district || user.user_metadata?.district || ''
        });
    };

    const extractFillFromStyle = (style) => {
        const match = style.match(/fill:([^;]+)/i);
        return match ? match[1] : '#e5e7eb';
    };

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

    // --- Handlers ---

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsAuthLoading(true);

        try {
            if (authMode === 'signup') {
                if (!onboardingForm.username || !onboardingForm.district || !onboardingForm.problemStatement || !onboardingForm.ideaTitle || !onboardingForm.whatsappContact || !onboardingForm.aboutYourself || !onboardingForm.programGoal) {
                    throw new Error('Please complete all onboarding fields.');
                }

                const { data, error } = await supabase.auth.signUp({
                    email: authEmail,
                    password: authPassword,
                    options: {
                        data: {
                            full_name: onboardingForm.username,
                            username: onboardingForm.username,
                            district: onboardingForm.district,
                            idea_title: onboardingForm.ideaTitle,
                            problem_statement: onboardingForm.problemStatement,
                            threads_handle: onboardingForm.threadsHandle,
                            whatsapp_contact: onboardingForm.whatsappContact,
                            discord_tag: onboardingForm.discordTag,
                            about_yourself: onboardingForm.aboutYourself,
                            program_goal: onboardingForm.programGoal
                        }
                    }
                });
                if (error) throw error;

                // If email confirmation is disabled, a session can be created immediately.
                if (data?.user && data?.session) {
                    try {
                        await upsertProfile(data.user.id, onboardingForm, resolveRoleByEmail(data.user?.email));
                    } catch (profileError) {
                        console.warn('Profile save skipped:', profileError.message);
                    }
                    await fetchUserProfile(data.user.id);
                    setIsAuthModalOpen(false);
                    return;
                }

                setIsAuthModalOpen(false);
                alert('Account created. Please verify your email, then sign in.');
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: authEmail,
                password: authPassword
            });
            if (error) throw error;

            if (data?.user) await fetchUserProfile(data.user.id);
            setIsAuthModalOpen(false);
        } catch (error) {
            setAuthError(error.message || 'Authentication failed.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleSignOut = () => supabase.auth.signOut();

    const handleAdminAddClass = async (e) => {
        e.preventDefault();
        if (currentUser?.type !== 'admin' && currentUser?.type !== 'owner') {
            alert('Only owner/admin can create classes.');
            return;
        }
        const { error } = await supabase.from('cohort_classes').insert([{ ...newClass, status: 'Upcoming', type: 'Standard' }]);
        if (!error) setNewClass({ title: '', date: '', time: '' });
    };

    const handleBuilderUpload = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('builder_progress').insert([{
            user_id: session.user.id,
            builder_name: currentUser.name,
            district: currentUser?.district || 'Unknown',
            project_name: newUpload.project,
            submission_url: newUpload.link,
            status: 'Pending Review'
        }]);
        if (!error) setNewUpload({ project: '', link: '' });
    };

    // --- UI Components ---

    const renderAuthModal = () => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="neo-card no-jitter" style={{ maxWidth: '500px', maxHeight: '74vh', overflowY: 'auto', width: '100%', background: 'white', border: '3px solid black' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Welcome builders</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <button type="button" className="btn btn-outline" style={{ padding: '10px 12px', fontSize: '12px', background: authMode === 'signin' ? '#fff3f3' : 'white' }} onClick={() => setAuthMode('signin')}>Sign In</button>
                    <button type="button" className="btn btn-outline" style={{ padding: '10px 12px', fontSize: '12px', background: authMode === 'signup' ? '#fff3f3' : 'white' }} onClick={() => setAuthMode('signup')}>Sign Up</button>
                </div>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleAuth}>
                    <input
                        type="email" placeholder="Email" value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showAuthPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            style={{ padding: '14px 44px 14px 14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                        />
                        <button
                            type="button"
                            aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowAuthPassword((prev) => !prev)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                            {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {authMode === 'signup' && (
                        <>
                            <input
                                type="text"
                                placeholder="Username"
                                value={onboardingForm.username}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, username: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <select
                                value={onboardingForm.district}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, district: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            >
                                <option value="">Select district</option>
                                {DISTRICT_OPTIONS.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="App idea title"
                                value={onboardingForm.ideaTitle}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, ideaTitle: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <textarea
                                placeholder="What problem are you solving?"
                                value={onboardingForm.problemStatement}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
                                rows={3}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <textarea
                                placeholder="Tell us about yourself"
                                value={onboardingForm.aboutYourself}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, aboutYourself: e.target.value }))}
                                rows={2}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <textarea
                                placeholder="What is your goal in joining this program?"
                                value={onboardingForm.programGoal}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, programGoal: e.target.value }))}
                                rows={2}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <input
                                type="text"
                                placeholder="WhatsApp contact"
                                value={onboardingForm.whatsappContact}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, whatsappContact: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Threads handle (optional)"
                                value={onboardingForm.threadsHandle}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, threadsHandle: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Discord tag (optional)"
                                value={onboardingForm.discordTag}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, discordTag: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </>
                    )}
                    {authError && <p style={{ color: 'var(--selangor-red)', fontSize: '12px', fontWeight: 700 }}>{authError}</p>}
                    <button className="btn btn-red" type="submit" disabled={isAuthLoading}>
                        {isAuthLoading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => setIsAuthModalOpen(false)}
                        style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '800' }}
                    >
                        CLOSE
                    </button>
                </form>
            </div>
        </div>
    );

    const AdminDashboard = () => (
        <div className="container" style={{ padding: '120px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '64px' }}>
                <div>
                    <h2 style={{ fontSize: '48px', marginBottom: '16px' }}>Admin Portal</h2>
                    <p className="text-sub">Manage cohorts, set class schedules, and review builder progress.</p>
                </div>
                <button className="btn btn-outline" onClick={handleSignOut}><LogOut size={18} style={{ marginRight: '8px' }} /> Logout</button>
            </div>

            <div className="grid-12">
                <div style={{ gridColumn: 'span 5' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '32px', borderBottom: '2px solid black', paddingBottom: '16px' }}>Set 2-Hour Class</h3>
                        <form onSubmit={handleAdminAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input
                                placeholder="Class Title" required value={newClass.title}
                                onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                                style={{ padding: '16px', border: '2px solid black', borderRadius: '12px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <input type="date" required value={newClass.date} onChange={(e) => setNewClass({ ...newClass, date: e.target.value })} style={{ padding: '16px', border: '2px solid black', borderRadius: '12px' }} />
                                <input placeholder="TimeSlot" required value={newClass.time} onChange={(e) => setNewClass({ ...newClass, time: e.target.value })} style={{ padding: '16px', border: '2px solid black', borderRadius: '12px' }} />
                            </div>
                            <button className="btn btn-red" type="submit">Publish Class</button>
                        </form>
                        <div style={{ marginTop: '40px' }}>
                            <h4 style={{ fontSize: '18px', marginBottom: '16px' }}>Active Schedule</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {classes.map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid black', borderRadius: '8px', background: '#fcfcfc' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '800' }}>{c.title}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.5 }}>{c.date} • {c.time}</div>
                                        </div>
                                        <span className="pill" style={{ background: 'black', color: 'white', border: 'none' }}>{c.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ gridColumn: 'span 7' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '32px' }}>Builder Progress</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                                    <th style={{ padding: '16px', fontSize: '13px' }}>BUILDER</th>
                                    <th style={{ padding: '16px', fontSize: '13px' }}>PROJECT</th>
                                    <th style={{ padding: '16px', fontSize: '13px' }}>STATUS</th>
                                    <th style={{ padding: '16px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px', fontWeight: '800' }}>{s.builder_name}</td>
                                        <td style={{ padding: '16px' }}>{s.project_name}</td>
                                        <td style={{ padding: '16px' }}><span className="pill">{s.status}</span></td>
                                        <td style={{ padding: '16px' }}><button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px', boxShadow: 'none' }}>Review</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const BuilderDashboard = () => (
        <div className="container" style={{ padding: '120px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '64px' }}>
                <div>
                    <div className="pill pill-red" style={{ marginBottom: '16px' }}>MARCH_COHORT_2026</div>
                    <h2 style={{ fontSize: '48px' }}>Welcome, {currentUser?.name}</h2>
                </div>
                <button className="btn btn-outline" onClick={handleSignOut}><LogOut size={18} /> Logout</button>
            </div>
            <div className="grid-12">
                <div style={{ gridColumn: 'span 4' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black' }}>
                        <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>7-Day Sprint</h3>
                        {SPRINT_MODULE_STEPS.map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', opacity: activeOnboardingStep >= i ? 1 : 0.4 }}>
                                <div style={{ width: '28px', height: '28px', background: activeOnboardingStep >= i ? 'var(--selangor-red)' : '#eee', borderRadius: '4px', border: '1.5px solid black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                                <div style={{ fontWeight: '800' }}>{step}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ gridColumn: 'span 8' }}>
                    <div className="neo-card" style={{ border: '3px solid black', background: 'black', color: 'white', marginBottom: '32px' }}>
                        <h3 style={{ color: 'white', fontSize: '32px' }}>Next Session: {classes[0]?.title || 'Awaiting Schedule'}</h3>
                        <p style={{ opacity: 0.6 }}>{classes[0]?.date} • {classes[0]?.time}</p>
                    </div>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Submit Progress</h3>
                        <form className="builder-upload-form" onSubmit={handleBuilderUpload} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto', gap: '16px' }}>
                            <input className="builder-upload-input" placeholder="Project Name" required value={newUpload.project} onChange={(e) => setNewUpload({ ...newUpload, project: e.target.value })} style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }} />
                            <input className="builder-upload-input" placeholder="URL / Link" required value={newUpload.link} onChange={(e) => setNewUpload({ ...newUpload, link: e.target.value })} style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }} />
                            <button className="btn btn-red builder-upload-submit" type="submit" style={{ boxShadow: 'none', minWidth: '120px' }}><Upload size={20} /></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    const LandingPage = () => (
        <>
            <section id="how-it-works" className="hero" style={{ paddingTop: '120px', paddingBottom: '140px' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="pill pill-red" style={{ marginBottom: '32px' }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h1 className="text-huge">Built for <span style={{ color: 'var(--selangor-red)' }}>Selangor</span>. Connecting and growing the builder community.</h1>
                        <button className="btn btn-red" style={{ marginTop: '18px' }} onClick={() => setIsAuthModalOpen(true)}>Join the Cohort</button>
                    </div>
                    <div style={{ gridColumn: 'span 5' }}>
                        <div className="neo-card no-jitter" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black' }}>
                            <span className="pill" style={{ background: 'black', color: 'white', cursor: 'pointer' }} onClick={() => setIsAuthModalOpen(true)}>PORTAL_ACCESS</span>
                            <div className="terminal-shell" style={{ background: '#000', borderRadius: '12px', padding: '32px', marginTop: '24px' }}>
                                <div className="terminal-prompt" style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '32px', lineHeight: 1 }}>&gt;_</div>
                                <p className="terminal-line" style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', marginTop: '10px' }}>
                                    {DEPLOY_COMMAND}
                                    <span className="terminal-caret">|</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section id="map" style={{ borderTop: '3px solid black' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 5' }}>
                        <h2 style={{ fontSize: 'clamp(32px, 7vw, 48px)' }}>Community Map</h2>
                        <p>
                            {selectedDistrictKey
                                ? `Selected district: ${DISTRICT_INFO[selectedDistrictKey]?.name || selectedDistrictKey}`
                                : hoveredRegionData?.districtKey
                                    ? `Hover district: ${DISTRICT_INFO[hoveredRegionData.districtKey]?.name || hoveredRegionData.districtKey}`
                                    : 'Hover over regions to inspect the map.'}
                        </p>
                        <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.72 }}>
                            Discover what Selangor builders are shipping this week and get inspired to launch your own project.
                        </p>
                        <div className={`neo-card no-jitter showcase-card${selectedDistrictName ? ' is-open' : ''}`} style={{ marginTop: '20px', border: '2px solid black', boxShadow: '6px 6px 0px black', padding: '20px' }}>
                            <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>
                                {selectedDistrictName ? `${selectedDistrictName} Showcase` : 'District Showcase'}
                            </h3>
                            <p style={{ fontSize: '13px', marginBottom: '12px' }}>
                                HQ: <a href="https://krackeddevs.com/" target="_blank" rel="noreferrer">krackeddevs.com</a>
                            </p>
                            <p style={{ fontSize: '12px', marginBottom: '10px', opacity: 0.75 }}>
                                {krackedDescription}
                            </p>
                            {!selectedDistrictName && (
                                <p style={{ fontSize: '13px' }}>Click a region to view that district's submitted apps.</p>
                            )}
                            {selectedDistrictKey === 'kuala_lumpur' && isKualaLumpurLoading && kualaLumpurShowcase.length === 0 && (
                                <div className="showcase-loading">
                                    <div className="showcase-spinner" />
                                    <div style={{ fontSize: '13px', fontWeight: 700 }}>Loading Kuala Lumpur showcase...</div>
                                </div>
                            )}
                            {selectedDistrictName && districtShowcase.length === 0 && (
                                <p style={{ fontSize: '13px' }}>No submissions yet for this district.</p>
                            )}
                            {selectedDistrictName && districtShowcase.length > 0 && (
                                <div
                                    className="showcase-list"
                                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}
                                >
                                    {districtShowcase.map((item) => (
                                        <a key={item.id} href={item.submission_url || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'black', borderBottom: '1px dashed #999', paddingBottom: '6px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.project_name || 'Untitled Project'}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.78 }}>{item.one_liner || 'No transmission log.'}</div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="neo-card no-jitter map-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', display: 'flex', justifyContent: 'center' }}>
                            <a
                                className="map-label-top"
                                href="https://www.selangor.gov.my/"
                                target="_blank"
                                rel="noreferrer"
                                title="Open Selangor Government website"
                            >
                                SELANGOR DARUL EHSAN
                            </a>
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
                                                if (region.districtKey === 'putrajaya') return '#3b82f6';
                                                if (region.districtKey === 'kuala_lumpur') return '#22c55e';
                                                if (!isHighlighted) return DEFAULT_MAP_FILL;
                                                return 'var(--selangor-red)';
                                            })()}
                                            stroke="black"
                                            strokeWidth="2"
                                            style={{ cursor: 'pointer', transition: 'fill 90ms linear' }}
                                            onMouseEnter={() => {
                                                setActiveRegion(region.id);
                                                setActiveDistrictHoverKey(BUNDLED_HOVER_DISTRICTS.has(region.districtKey) ? region.districtKey : null);
                                            }}
                                            onClick={() => setSelectedDistrictKey((prev) => (prev === region.districtKey ? null : region.districtKey))}
                                        />
                                    ))}
                                </g>
                            </svg>
                            <div className="map-insight">
                                <div className="map-insight-subtitle">Top 3 Districts by Project Submitted</div>
                                {topDistricts.length === 0 && <div className="map-insight-empty">No submissions yet</div>}
                                {topDistricts.map(([name, count], index) => (
                                    <div key={name} className="map-insight-row">
                                        {index + 1}. {name} ({count} {count === 1 ? 'project' : 'projects'} submitted)
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

        </>
    );

    const ProgramDetailsPage = () => (
        <section id="how-it-works-page" style={{ borderTop: '3px solid black', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container">
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', position: 'relative', overflow: 'visible' }}>
                    <div className="pill pill-red" style={{ marginBottom: '20px' }}>PROGRAM DETAILS</div>
                    <h2 style={{ fontSize: 'clamp(30px, 6vw, 46px)', marginBottom: '12px' }}>Selangor Builder Sprint 2026</h2>
                    <p style={{ maxWidth: '760px', opacity: 0.8, marginBottom: '18px' }}>
                        Beginner-friendly builder sprint: start fast, ship fast, and get guided support from kickoff to final review.
                    </p>
                    <div className="program-sticker">
                        <div className="program-sticker-title">NO CODES. JUST VIBES.</div>
                        <div className="program-sticker-sub">Open to all, no code required.</div>
                    </div>
                    <a
                        className="program-sticker program-sticker-alt"
                        href="https://www.threads.com/@_zarulijam"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <div className="program-sticker-title">SESSION #1 DATE: TBA</div>
                        <div className="program-sticker-sub">Follow me on Threads for the latest update.</div>
                    </a>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                        <div style={{ border: '2px solid black', borderRadius: '10px', padding: '12px' }}><strong>Duration</strong><div>7-day sprint</div></div>
                        <div style={{ border: '2px solid black', borderRadius: '10px', padding: '12px' }}><strong>Live Sessions</strong><div>Day 1 + Day 7 (2 hours, Discord)</div></div>
                        <div style={{ border: '2px solid black', borderRadius: '10px', padding: '12px' }}><strong>Tools</strong><div>Antigravity, Codex, Stitch, Gemini, ChatGPT, Supabase, Vercel</div></div>
                    </div>
                    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Requirements</h3>
                    <ul style={{ margin: '0 0 18px 18px', padding: 0, lineHeight: 1.6 }}>
                        <li>Start with a real problem: your app idea must solve a clear, tangible user problem.</li>
                        <li>Prepare one app idea before Day 1 (problem, user, and simple feature list).</li>
                        <li>Have a laptop or computer with stable internet.</li>
                        <li>Join KrackedDevs Discord (<a href="https://discord.gg/3TZeZUjc" target="_blank" rel="noreferrer">join server</a>) and state in chat that you are applying for Selangor Vibe Builder.</li>
                        <li>Must have GitHub account (<a href="https://github.com/signup" target="_blank" rel="noreferrer">sign up</a>).</li>
                        <li>Must have Vercel account (<a href="https://vercel.com/signup" target="_blank" rel="noreferrer">sign up</a>).</li>
                        <li>Must have Antigravity installed (<a href="https://antigravity.dev/" target="_blank" rel="noreferrer">get started</a>).</li>
                        <li>Must currently live in Selangor (future sessions may include physical meetups).</li>
                    </ul>
                    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Week Module</h3>
                    <div className="program-timeline">
                        <div className="program-step">
                            <div className="program-step-head"><Users size={14} /> Before Day 1</div>
                            <p>Kickoff instructions shared on Threads. All builders are welcome to join.</p>
                        </div>
                        <div className="program-step">
                            <div className="program-step-head"><Calendar size={14} /> Day 1 (Live, 2h)</div>
                            <p>Build together on Discord and deploy a working prototype.</p>
                        </div>
                        <div className="program-step">
                            <div className="program-step-head"><Rocket size={14} /> Day 2-6</div>
                            <p>Self-paced improvements with async check-ins.</p>
                        </div>
                        <div className="program-step">
                            <div className="program-step-head"><Award size={14} /> Day 7 (Live, 2h)</div>
                            <p>Review, troubleshoot, and finalize project for showcase.</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '14px' }}>
                        Disclaimer: This sprint does not teach programming in depth. It teaches you how to build and launch a web/app using modern AI tools.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-red" onClick={() => setIsAuthModalOpen(true)}>Join the Cohort</button>
                        <button className="btn btn-outline" onClick={() => setPublicPage('home')}>Back to Home</button>
                    </div>
                </div>
            </div>
        </section>
    );

    const roadmapItems = [
        { id: 'forum', title: 'Builder Forum', detail: 'A focused community forum for builders to ask questions, share progress, and get peer feedback.' },
        { id: 'pwa', title: 'PWA Implementation', detail: 'Installable app experience, faster load, and mobile-friendly offline access.' },
        { id: 'idea', title: 'AI / Local Intelligence Idea Generator', detail: 'Generate grounded product ideas based on local problems, district context, and real builder needs.' },
        { id: 'more', title: 'More Features', detail: 'Additional tools for collaboration, submission review, and stronger builder discovery.' }
    ];

    const ComingSoonPage = () => (
        <section id="coming-soon-page" style={{ borderTop: '3px solid black', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container">
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black' }}>
                    <div className="pill pill-red" style={{ marginBottom: '20px' }}>ROADMAP</div>
                    <h2 style={{ fontSize: 'clamp(30px, 6vw, 46px)', marginBottom: '10px' }}>Coming Soon</h2>
                    <p style={{ maxWidth: '760px', opacity: 0.8, marginBottom: '16px' }}>
                        Next updates for VibeSelangor are listed below. Click each item to view details.
                    </p>
                    <p style={{ maxWidth: '760px', opacity: 0.8, marginBottom: '18px' }}>
                        Have feedback or criticism? Share it on my Threads so we can improve this platform together.
                    </p>
                    <div className="program-timeline">
                        {roadmapItems.map((item) => (
                            <div key={item.id} className="program-step roadmap-item" style={{ textAlign: 'left', background: '#fff' }}>
                                <div className="program-step-head">{item.title}</div>
                                <p>{item.detail}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <a className="btn btn-outline" href="https://www.threads.com/@_zarulijam" target="_blank" rel="noreferrer">Give Feedback</a>
                        <button className="btn btn-red" onClick={() => setPublicPage('home')}>Back to Home</button>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div className="vibe-selangor">
            {isAuthModalOpen && renderAuthModal()}
            <header className="glass-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '84px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleHeaderBrandClick}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--selangor-red)', borderRadius: '8px', border: '2px solid black' }}><Zap size={18} fill="yellow" style={{ margin: '5px' }} /></div>
                        <span className="header-brand-text" style={{ fontWeight: '900', fontSize: '30px', lineHeight: 1 }}>VibeSelangor</span>
                    </div>
                    <div className="header-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                        <nav className="header-nav" style={{ display: 'flex', gap: '24px' }}>
                            {!currentUser && HEADER_LINKS.map((item) => (
                                <a
                                    className="header-link"
                                    key={item.page || item.sectionId}
                                    href={item.page ? `#${item.page}-page` : `#${item.sectionId}`}
                                    style={{ color: 'black' }}
                                    onClick={(event) => handleHeaderNavClick(event, item)}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        {session ? (
                            <div className="header-auth-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px' }}>{currentUser?.name}</span>
                                <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '11px' }} onClick={handleSignOut}>Logout</button>
                            </div>
                        ) : (
                            <div className="header-auth-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <a
                                    className="btn btn-outline"
                                    style={{ padding: '10px 20px', textDecoration: 'none' }}
                                    href="https://www.threads.com/@_zarulijam"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Contact
                                </a>
                                <button className="btn btn-red" style={{ padding: '10px 24px' }} onClick={() => setIsAuthModalOpen(true)}>Become a builder now!</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {currentUser && (
                <section style={{ padding: '24px 0', borderBottom: '2px solid black' }}>
                    <div className="container">
                        <div className="neo-card" style={{ border: '2px solid black', boxShadow: '6px 6px 0px black', padding: '18px 20px' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Builder Profile</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontWeight: 700 }}>
                                <span>Name: {currentUser?.name || '-'}</span>
                                <span>District: {currentUser?.district || '-'}</span>
                                <span>Projects Submitted: {currentUserProjectCount}</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {!currentUser && publicPage === 'home' && <LandingPage />}
            {!currentUser && publicPage === 'how-it-works' && <ProgramDetailsPage />}
            {!currentUser && publicPage === 'coming-soon' && <ComingSoonPage />}
            {(currentUser?.type === 'admin' || currentUser?.type === 'owner') && <AdminDashboard />}
            {currentUser?.type === 'builder' && <BuilderDashboard />}

            <footer style={{ padding: '34px 0', borderTop: '3px solid black', background: 'linear-gradient(180deg, #fff 0%, #fff8dc 100%)' }}>
                <div className="container">
                    <div className="neo-card no-jitter" style={{ border: '2px solid black', boxShadow: '6px 6px 0px black', textAlign: 'center', padding: '18px 20px' }}>
                        <p style={{ fontWeight: '900', marginBottom: '8px' }}>
                            Built by _zarulijam | DM me on Threads to connect | Support me in becoming the KrackedDevs Selangor Ambassador
                        </p>
                        <p style={{ fontWeight: '700', fontSize: '13px', opacity: 0.78, marginBottom: '8px' }}>
                            If you are outside Selangor, join the KrackedDevs Discord server to connect with your state ambassador.
                        </p>
                        <p style={{ fontWeight: '800', opacity: 0.45, fontSize: '12px' }}>(c) 2026 VIBESELANGOR. NO CODE. JUST VIBES.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
