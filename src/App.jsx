import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowRight, Check, Zap, Globe, Sparkles,
    Shield, Users, Layout, Smartphone,
    Search, Play, Plus, ChevronRight, MessageSquare,
    Lock, Lightbulb, Grid, Share2, Rocket,
    Send, User, Clock, MessageCircle, MoreVertical,
    LogOut, Calendar, Upload, ExternalLink, Filter,
    Eye, EyeOff,
    Settings, Award, Folder, Camera, Image
} from 'lucide-react';
import { supabase } from './lib/supabase';

const WhatsAppIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill={color === 'currentColor' ? '#25D366' : color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill={color === 'currentColor' ? '#25D366' : color} />
    </svg>
);

const ThreadsIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" fill="currentColor" />
        <path d="M98.44 129.507c-10.436.572-21.256-4.095-21.82-14.15-.4-7.484 5.322-15.835 22.63-16.838 1.983-.114 3.93-.17 5.843-.17 6.058 0 11.73.59 16.92 1.717-1.928 24.083-12.437 28.793-23.573 29.441Z" fill="currentColor" />
    </svg>
);

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
const TERMINAL_CONTEXT = 'malaysia:~/Selangor';
const DEPLOY_COMMAND = '$ vibe deploy --target live';
const HEADER_LINKS = [
    { label: 'Coming Soon', page: 'coming-soon' },
    { label: 'How it works', page: 'how-it-works' },
    { label: 'Map', sectionId: 'map' }
];
const DISTRICT_OPTIONS = Array.from(new Set(Object.values(DISTRICT_INFO).map((entry) => entry.name))).sort();
const SPRINT_MODULE_STEPS = [
    'Day 1: Concept & Problem Identification',
    'Day 2: Target User Profile',
    'Day 3: One-Liner Value Proposition',
    'Day 4: Core Feature Blueprint',
    'Day 5: Visual Interface & Vibe',
    'Day 6: Final Description & Polish',
    'Day 7: [Live] Show & Final Review'
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

/**
 * Normalizes phone numbers for WhatsApp links.
 * Ensures Malaysian numbers starting with 0 or 1 are prefixed with 60.
 */
function formatWhatsAppLink(phone) {
    if (!phone) return '#';
    const cleaned = phone.toString().replace(/\D/g, '');
    if (!cleaned) return '#';

    let formatted = cleaned;
    if (cleaned.startsWith('0')) {
        formatted = '60' + cleaned.substring(1);
    } else if (cleaned.startsWith('1')) {
        formatted = '60' + cleaned;
    }

    return `https://api.whatsapp.com/send?phone=${formatted}`;
}

function parseKrackedProjectDetail(htmlText, projectPath, index) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const getText = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const isBroken = (text) => /requestAnimationFrame|\{\$RT=|function\(|<\/script>|<script|@media|\$RC\(/i.test(text || '');

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
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({
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
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [publicPage, setPublicPage] = useState('home');
    const [scrolled, setScrolled] = useState(false);
    const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const [mapRegions, setMapRegions] = useState([]);
    const [mapViewMode, setMapViewMode] = useState('builders'); // 'builders' or 'projects'

    // Real-time Data State
    const [classes, setClasses] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [kualaLumpurShowcase, setKualaLumpurShowcase] = useState([]);
    const [krackedDescription, setKrackedDescription] = useState('KrackedDevs');
    const [isKualaLumpurLoading, setIsKualaLumpurLoading] = useState(false);
    const [pendingKualaLumpurOpen, setPendingKualaLumpurOpen] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [profilesError, setProfilesError] = useState(null);
    const [isProfilesLoading, setIsProfilesLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);

    const checkedInToday = useMemo(() => {
        if (!session?.user || !submissions) return false;
        const today = new Date().toLocaleDateString();
        return submissions.some(s =>
            s.user_id === session.user.id &&
            new Date(s.created_at).toLocaleDateString() === today
        );
    }, [submissions, session]);

    // Form States
    const [newClass, setNewClass] = useState({ title: '', date: '', time: '', startTime: '20:00', endTime: '22:00' });
    const [newUpload, setNewUpload] = useState({ project: '', link: '', details: '', type: 'log' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [adminSearch, setAdminSearch] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); // all, with_idea, no_idea
    const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
    const [selectedDetailProfile, setSelectedDetailProfile] = useState(null);

    const hoveredRegionData = mapRegions.find((region) => region.id === activeRegion) || null;
    const selectedDistrictName = selectedDistrictKey ? DISTRICT_INFO[selectedDistrictKey]?.name : null;
    const districtShowcase = useMemo(() => {
        if (!selectedDistrictName) return [];

        const normalizedSelected = normalizeDistrict(selectedDistrictName);

        if (mapViewMode === 'builders') {
            const districtBuilders = profiles
                .filter(p => !['owner', 'admin'].includes(p.role))
                .filter(p => {
                    if (!p.district) return false;
                    const itemDistrict = normalizeDistrict(p.district);
                    return itemDistrict === normalizedSelected ||
                        itemDistrict.includes(normalizedSelected) ||
                        normalizedSelected.includes(itemDistrict);
                })
                .map(p => ({
                    id: `builder-${p.id}`,
                    name: p.full_name || 'Anonymous Builder',
                    handle: p.threads_handle || '',
                    role: p.role,
                    district: p.district
                }));
            return districtBuilders;
        }

        const districtSubmissions = submissions
            .filter((item) => {
                const profile = profiles.find(p => p.id === item.user_id);
                if (profile && ['owner', 'admin'].includes(profile.role)) return false;

                const itemDistrict = normalizeDistrict(item.district);
                return itemDistrict === normalizedSelected ||
                    itemDistrict.includes(normalizedSelected) ||
                    normalizedSelected.includes(itemDistrict);
            })
            .map((item) => ({
                id: `project-${item.id}`,
                submission_url: item.submission_url,
                project_name: item.project_name,
                one_liner: item.one_liner || 'Builder submission from VibeSelangor community.'
            }));

        if (selectedDistrictKey === 'kuala_lumpur') {
            return [...kualaLumpurShowcase, ...districtSubmissions];
        }

        return districtSubmissions;
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
        submissions.forEach(s => {
            const profile = profiles.find(p => p.id === s.user_id);
            if (profile && ['owner', 'admin'].includes(profile.role)) return;

            const districtText = (s.district || profile?.district || '').trim();
            if (!districtText) return;
            const norm = normalizeDistrict(districtText);
            counts[norm] = (counts[norm] || 0) + 1;
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
                const displayLabel = matchedInfo ? matchedInfo.name : (norm === 'kuala_lumpur' ? 'Kuala Lumpur' : norm);
                return [displayLabel, count];
            })
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [builderCountsByDistrict, submissionCountsByDistrict, mapViewMode]);
    const currentUserProjectCount = useMemo(() => {
        if (!currentUser?.id) return 0;
        return submissions.filter((item) => item?.user_id === currentUser.id).length;
    }, [submissions, currentUser?.id]);

    const filteredProfiles = useMemo(() => {
        let list = profiles.filter(p => !session?.user || p.id !== session.user.id);
        if (adminSearch) {
            const s = adminSearch.toLowerCase();
            list = list.filter(p =>
                p.full_name?.toLowerCase().includes(s) ||
                p.idea_title?.toLowerCase().includes(s) ||
                p.district?.toLowerCase().includes(s)
            );
        }
        if (adminFilter === 'with_idea') list = list.filter(p => p.idea_title);
        if (adminFilter === 'no_idea') list = list.filter(p => !p.idea_title);
        return list;
    }, [profiles, adminSearch, adminFilter, session]);

    const profilesByIdea = useMemo(() => {
        const groups = {};
        filteredProfiles.forEach(p => {
            const idea = p.idea_title || 'No Idea Yet';
            if (!groups[idea]) groups[idea] = [];
            groups[idea].push(p);
        });
        return groups;
    }, [filteredProfiles]);

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
        if (!pendingKualaLumpurOpen) return;
        if (isKualaLumpurLoading) return;
        setSelectedDistrictKey('kuala_lumpur');
        setPendingKualaLumpurOpen(false);
    }, [pendingKualaLumpurOpen, isKualaLumpurLoading]);

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
        const attendanceSub = supabase.channel('attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_attendance' }, fetchData).subscribe();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(classSub);
            supabase.removeChannel(submissionSub);
            supabase.removeChannel(attendanceSub);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchData = async () => {
        const { data: classData } = await supabase.from('cohort_classes').select('*').order('date', { ascending: true });
        const { data: submissionData } = await supabase.from('builder_progress').select('*').order('created_at', { ascending: false });

        if (classData) setClasses(classData);
        if (submissionData) setSubmissions(submissionData);

        // Fetch all profiles for Admin
        setIsProfilesLoading(true);
        setProfilesError(null);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (profileError) {
                console.error("Supabase Profile Fetch Error:", profileError);
                setProfilesError(profileError.message);
            }
            if (profileData) setProfiles(profileData);

            // Fetch attendance
            const { data: attendanceData } = await supabase
                .from('cohort_attendance')
                .select('*');
            if (attendanceData) setAttendance(attendanceData);

        } catch (err) {
            console.error("Unexpected error fetching profiles/attendance:", err);
            if (err.message === 'Failed to fetch') {
                setProfilesError("Could not connect to Supabase. Please check if your VITE_SUPABASE_URL is correct and that you have a .env file.");
            } else {
                setProfilesError(err.message);
            }
        } finally {
            setIsProfilesLoading(false);
        }
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
            // Secure Demo Login Bypass
            if (authEmail === 'builder@demo.vibeselangor.com' && authPassword === 'VibeSelangor2026!Demo') {
                const demoUser = {
                    id: 'demo-builder-id',
                    name: 'Demo Builder',
                    full_name: 'Demo Builder',
                    type: 'builder',
                    role: 'builder',
                    district: 'Petaling',
                    idea_title: 'Eco-Smart Selangor',
                    problem_statement: 'Reducing carbon footprint melalui intelligent traffic management systems in urban areas.'
                };
                setCurrentUser(demoUser);
                setSession({ user: { id: 'demo-builder-id', email: authEmail } });
                setPublicPage('dashboard');
                setIsAuthModalOpen(false);
                return;
            }

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
                    setPublicPage('dashboard');
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
            setPublicPage('dashboard');
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

        const formatTime = (t) => {
            if (!t) return 'TBA';
            const [h, m] = t.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12}:${m} ${ampm}`;
        };
        const timeString = `${formatTime(newClass.startTime)} - ${formatTime(newClass.endTime)}`;

        try {
            const { startTime, endTime, ...classPayload } = newClass;
            const { error } = await supabase.from('cohort_classes').insert([{
                ...classPayload,
                time: timeString,
                status: 'Upcoming',
                type: 'Standard'
            }]);

            if (error) {
                console.error("Supabase insert error:", error);
                alert(`Failed to create class: ${error.message}\n\nTroubleshooting Tip:\nPlease check your Supabase Dashboard. Ensure the table 'cohort_classes' exists and has these columns:\n- id (uuid or int8, primary key, auto-generated)\n- title (text)\n- date (date)\n- time (text)\n- status (text)\n- type (text)`);
            } else {
                setNewClass({ title: '', date: '', time: '', startTime: '20:00', endTime: '22:00' });
                setIsAddClassModalOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert(`An unexpected error occurred: ${err.message}`);
        }
    };

    const handleBuilderUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        let finalUrl = newUpload.link;

        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            const { data, error: uploadError } = await supabase.storage
                .from('submissions')
                .upload(fileName, selectedFile);

            if (uploadError) {
                alert('Error uploading file: ' + uploadError.message);
                setIsUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('submissions')
                .getPublicUrl(fileName);

            finalUrl = publicUrl;
        }

        const { error } = await supabase.from('builder_progress').insert([{
            user_id: session.user.id,
            builder_name: currentUser.name,
            district: currentUser?.district || 'Unknown',
            project_name: newUpload.project,
            submission_url: finalUrl,
            one_liner: newUpload.details || 'Progress Log Entry',
            status: 'Pending Review'
        }]);

        if (!error) {
            setNewUpload({ ...newUpload, link: '', details: '', type: 'log' });
            setSelectedFile(null);
            fetchData();
        }
        setIsUploading(false);
    };

    const openEditProfileModal = async () => {
        if (!session?.user?.id) return;

        setIsUpdatingProfile(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (data && !error) {
            setEditProfileForm({
                username: data.full_name || '',
                district: data.district || '',
                problemStatement: data.problem_statement || '',
                ideaTitle: data.idea_title || '',
                threadsHandle: data.threads_handle || '',
                whatsappContact: data.whatsapp_contact || '',
                discordTag: data.discord_tag || '',
                aboutYourself: data.about_yourself || '',
                programGoal: data.program_goal || ''
            });
            setIsEditProfileModalOpen(true);
        }
        setIsUpdatingProfile(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);

        try {
            await upsertProfile(session.user.id, editProfileForm, currentUser?.type);
            await fetchUserProfile(session.user.id);
            fetchData();
            setIsEditProfileModalOpen(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update profile error:', error);
            alert('Failed to update profile: ' + error.message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleToggleClassStatus = async (classId, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Scheduled' : 'Active';
        const { error } = await supabase
            .from('cohort_classes')
            .update({ status: nextStatus })
            .eq('id', classId);

        if (error) console.error("Toggle class status error:", error);
        fetchData();
    };

    const handleToggleAttendance = async (profileId, classId) => {
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass || targetClass.status !== 'Active') {
            alert('Attendance can only be marked while the class is LIVE!');
            return;
        }

        const existing = attendance.find(a => a.profile_id === profileId && a.class_id === classId);

        if (existing) {
            const nextStatus = existing.status === 'Present' ? 'Absent' : 'Present';
            const { error } = await supabase
                .from('cohort_attendance')
                .update({ status: nextStatus })
                .eq('id', existing.id);
            if (error) console.error("Update attendance error:", error);
        } else {
            const { error } = await supabase
                .from('cohort_attendance')
                .insert([{ profile_id: profileId, class_id: classId, status: 'Present' }]);
            if (error) console.error("Insert attendance error:", error);
        }
        fetchData();
    };

    // --- UI Components ---

    const renderEditProfileModal = () => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="neo-card no-jitter" style={{ maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', width: '100%', background: 'white', border: '3px solid black' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Edit Your Profile</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>FULL NAME</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={editProfileForm.username}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>DISTRICT</label>
                        <select
                            value={editProfileForm.district}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, district: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        >
                            <option value="">Select district</option>
                            {DISTRICT_OPTIONS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>IDEA TITLE</label>
                        <input
                            type="text"
                            placeholder="App idea title"
                            value={editProfileForm.ideaTitle}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, ideaTitle: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>PROBLEM STATEMENT</label>
                        <textarea
                            placeholder="What problem are you solving? (Project Description)"
                            value={editProfileForm.problemStatement}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
                            rows={3}
                            required
                            maxLength={150}
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>ABOUT YOURSELF</label>
                        <textarea
                            placeholder="Tell us about yourself"
                            value={editProfileForm.aboutYourself}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, aboutYourself: e.target.value }))}
                            rows={2}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>PROGRAM GOAL</label>
                        <textarea
                            placeholder="What is your goal in joining this program?"
                            value={editProfileForm.programGoal}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, programGoal: e.target.value }))}
                            rows={2}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>WHATSAPP CONTACT</label>
                        <input
                            type="text"
                            placeholder="WhatsApp contact"
                            value={editProfileForm.whatsappContact}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, whatsappContact: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '900' }}>THREADS</label>
                            <input
                                type="text"
                                placeholder="Threads handle"
                                value={editProfileForm.threadsHandle}
                                onChange={(e) => setEditProfileForm((prev) => ({ ...prev, threadsHandle: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '900' }}>DISCORD</label>
                            <input
                                type="text"
                                placeholder="Discord tag"
                                value={editProfileForm.discordTag}
                                onChange={(e) => setEditProfileForm((prev) => ({ ...prev, discordTag: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                    <button className="btn btn-red" type="submit" disabled={isUpdatingProfile} style={{ marginTop: '8px' }}>
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => setIsEditProfileModalOpen(false)}
                        style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '800' }}
                    >
                        CANCEL
                    </button>
                </form>
            </div>
        </div>
    );

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
                                placeholder="What problem are you solving? (Project Description)"
                                value={onboardingForm.problemStatement}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
                                rows={3}
                                required
                                maxLength={150}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <p style={{ fontSize: '10px', marginTop: '-10px', marginBottom: '4px', opacity: 0.7, fontWeight: '700', lineHeight: '1.4' }}>
                                💡 Note: Project description should be your quick pitch like you want to sell this app (max 150 characters).
                            </p>
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
                            <p style={{ fontSize: '11px', marginTop: '-8px', opacity: 0.7, paddingLeft: '4px' }}>
                                💡 <strong>Recommended:</strong> include your handle to connect with potential business & collaboration opportunities.
                            </p>
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

    const renderAddClassModal = () => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="neo-card" style={{ width: '100%', maxWidth: '450px', border: '3px solid black', boxShadow: '12px 12px 0px black', background: 'white', position: 'relative' }}>
                <button onClick={() => setIsAddClassModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '24px', fontWeight: '900' }}>×</button>
                <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Schedule 2-Hour Class</h3>
                <form onSubmit={handleAdminAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '900' }}>CLASS TITLE</label>
                        <input
                            className="builder-upload-input" placeholder="e.g., Module 3: Prototyping" required value={newClass.title}
                            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '900' }}>DATE</label>
                        <input type="date" required value={newClass.date} onChange={(e) => setNewClass({ ...newClass, date: e.target.value })} style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '900' }}>START TIME</label>
                            <input
                                type="time" required value={newClass.startTime}
                                onChange={(e) => {
                                    const start = e.target.value;
                                    const [hours, mins] = start.split(':').map(Number);
                                    let endHours = (hours + 2) % 24;
                                    const end = `${String(endHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                                    setNewClass({ ...newClass, startTime: start, endTime: end });
                                }}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '900' }}>END TIME</label>
                            <input
                                type="time" required value={newClass.endTime}
                                onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                            />
                        </div>
                    </div>

                    <button className="btn btn-red" type="submit" style={{ marginTop: '10px' }}>PUBLISH SCHEDULE</button>
                </form>
            </div>
        </div>
    );

    const renderBuilderDetailModal = () => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
            <div className="neo-card" style={{ width: '100%', maxWidth: '720px', border: '3px solid black', boxShadow: '16px 16px 0px black', background: 'white', position: 'relative', padding: '24px 28px' }}>
                <button
                    onClick={() => setSelectedDetailProfile(null)}
                    style={{ position: 'absolute', top: '16px', right: '16px', border: '2px solid black', background: 'white', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '900', fontSize: '20px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    ×
                </button>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', border: '3px solid black', background: 'var(--selangor-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', boxShadow: '4px 4px 0px black' }}>
                        {selectedDetailProfile.full_name[0]}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '36px', letterSpacing: '-1.5px', marginBottom: '8px' }}>{selectedDetailProfile.full_name}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="pill pill-teal" style={{ padding: '4px 12px', fontSize: '10px' }}>{selectedDetailProfile.role.toUpperCase()}</span>
                            <span className="pill" style={{ border: '2px solid black', padding: '4px 12px', fontSize: '10px' }}>{selectedDetailProfile.district.toUpperCase()}</span>
                            {selectedDetailProfile.threads_handle && (
                                <a
                                    href={`https://threads.net/@${selectedDetailProfile.threads_handle.replace(/^@/, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'black', fontSize: '13px', fontWeight: '900', marginLeft: '4px', borderBottom: '2px solid var(--selangor-red)' }}
                                >
                                    <ThreadsIcon size={16} /> @{selectedDetailProfile.threads_handle.replace(/^@/, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="scroll-box" style={{ maxHeight: '68vh', paddingRight: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.5fr 1fr', gap: '32px' }}>
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Idea & Vision</h4>
                                <div style={{ fontWeight: '900', fontSize: '24px', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{selectedDetailProfile.idea_title || 'Untitled Innovation'}</div>
                                <div style={{ background: '#fcfcfc', borderLeft: '4px solid var(--selangor-red)', padding: '16px 20px', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333', fontWeight: '500' }}>
                                        {selectedDetailProfile.problem_statement || 'No problem statement defined yet.'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>About the Builder</h4>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
                                    {selectedDetailProfile.about_yourself || 'No background info provided.'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Connect</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedDetailProfile.threads_handle && (
                                        <a href={`https://threads.net/@${selectedDetailProfile.threads_handle.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '14px', fontSize: '13px', textTransform: 'none', justifyContent: 'flex-start', gap: '12px', width: '100%', borderRadius: '12px' }}>
                                            <ThreadsIcon size={22} /> Threads Profile
                                        </a>
                                    )}
                                    {(currentUser?.type === 'admin' || currentUser?.type === 'owner') && selectedDetailProfile.whatsapp_contact && (
                                        <a href={formatWhatsAppLink(selectedDetailProfile.whatsapp_contact)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '14px', fontSize: '13px', textTransform: 'none', justifyContent: 'flex-start', gap: '12px', width: '100%', borderRadius: '12px', borderColor: '#25D366' }}>
                                            <WhatsAppIcon size={22} /> WhatsApp (Admin)
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '6px', marginBottom: '16px' }}>Project Evolution</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative' }}>
                                    {/* Vertical Journey Line */}
                                    {submissions.filter(s => s.user_id === selectedDetailProfile.id).length > 0 && (
                                        <div style={{ position: 'absolute', left: '21px', top: '24px', bottom: '24px', width: '2px', background: 'black', zIndex: 0 }}></div>
                                    )}
                                    {/* Day 0 Marker */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
                                        <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center' }}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '800' }}>Day 0: Registration Completed</div>
                                    </div>

                                    {submissions.filter(s => s.user_id === selectedDetailProfile.id).length === 0 ? (
                                        <div style={{ border: '2px dashed #eee', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                                            Waiting for first conceptual milestone...
                                        </div>
                                    ) : (
                                        submissions.filter(s => s.user_id === selectedDetailProfile.id).map((s, i) => (
                                            <div key={i} style={{ padding: '12px', border: '2px solid black', borderRadius: '10px', background: '#fff', boxShadow: '4px 4px 0px black', marginBottom: '16px', marginLeft: '32px', position: 'relative', zIndex: 1 }}>
                                                {/* Milestone Dot */}
                                                <div style={{ position: 'absolute', left: '-11px', top: '16px', width: '10px', height: '10px', background: 'white', border: '2px solid black', borderRadius: '50%', transform: 'translateX(-50%)' }}></div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: '900', fontSize: '10px', color: 'var(--selangor-red)', textTransform: 'uppercase' }}>
                                                        {SPRINT_MODULE_STEPS[submissions.filter(x => x.user_id === selectedDetailProfile.id).length - 1 - i]?.split(':')[1]?.trim() || 'Ship Log'}
                                                    </span>
                                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(s.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', lineHeight: '1.4', marginBottom: '6px' }}>{s.one_liner}</div>
                                                {s.submission_url && (
                                                    <a href={s.submission_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}>
                                                        <ExternalLink size={12} /> PROOF OF SHIP
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGalleryShowcase = (limit = null) => {
        let buildersToShow = profiles
            .filter(p => (!session?.user || p.id !== session.user.id) && p.role !== 'owner' && p.role !== 'admin')
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        if (limit) buildersToShow = buildersToShow.slice(0, limit);

        return (
            <section id="gallery" style={{ borderTop: '3px solid black', padding: '24px 0 12px', background: '#fff' }}>
                <div className="container">
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <div className="pill pill-red" style={{ marginBottom: '10px' }}>THE SHOWCASE</div>
                        <h2 style={{ fontSize: 'clamp(32px, 7vw, 52px)', letterSpacing: '-2px' }}>Meet the Builders</h2>
                        <p className="text-sub" style={{ maxWidth: '600px', margin: '4px auto 0' }}>Discover the innovative apps and startups being built right here in Selangor.</p>
                    </div>

                    <div className="grid-12">
                        {buildersToShow.length === 0 ? (
                            <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '60px', border: '3px dashed #ccc', borderRadius: '20px' }}>
                                <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                <h3 style={{ opacity: 0.5 }}>The gallery is preparing for takeoff...</h3>
                            </div>
                        ) : (
                            buildersToShow.map(p => {
                                const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                const latest = builderSubmissions[0];
                                const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                return (
                                    <div
                                        key={p.id}
                                        className="neo-card"
                                        onClick={() => setSelectedDetailProfile(p)}
                                        style={{
                                            gridColumn: isMobileView ? 'span 12' : 'span 3',
                                            border: '3px solid black',
                                            boxShadow: '8px 8px 0px black',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: '24px',
                                            background: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                            e.currentTarget.style.boxShadow = '10px 10px 0px black';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '8px 8px 0px black';
                                        }}
                                    >
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', background: 'var(--selangor-red)', color: 'white', borderRadius: '8px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px' }}>
                                                    {p.full_name?.[0]}
                                                </div>
                                                <div className="pill pill-red" style={{ fontSize: '9px', padding: '2px 8px' }}>
                                                    {stepIndex === 0 ? 'KICKOFF' : SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim()?.toUpperCase()}
                                                </div>
                                            </div>
                                            <h4 style={{ fontSize: '20px', marginBottom: '12px', lineHeight: 1.1 }}>{latest?.project_name || p.idea_title || 'Untitled Project'}</h4>
                                            <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#444' }}>
                                                <div style={{ fontWeight: '900', fontSize: '10px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vision & Mission</div>
                                                {truncateText(latest?.one_liner || p.problem_statement, 120)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '2px solid #eee', paddingTop: '12px', marginTop: '4px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: '900' }}>{p.full_name}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.5 }}>{p.district || 'Selangor'}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {limit && profiles.filter(p => !session?.user || p.id !== session.user.id).length > limit && (
                        <div style={{ marginTop: '28px', textAlign: 'center' }}>
                            <button
                                className="btn btn-red"
                                style={{ padding: '16px 40px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                                onClick={() => {
                                    setPublicPage('showcase');
                                    window.scrollTo({ top: 0, behavior: 'auto' });
                                }}
                            >
                                VIEW ALL BUILDERS <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        );
    };

    const renderFullShowcasePage = () => (
        <div style={{ paddingTop: '80px', background: '#fff' }}>
            <div className="container" style={{ marginBottom: '24px' }}>
                <button
                    className="btn btn-outline"
                    onClick={() => {
                        setPublicPage('home');
                        window.scrollTo({ top: 0, behavior: 'auto' });
                    }}
                    style={{ marginBottom: '32px' }}
                >
                    ← BACK TO HOME
                </button>
            </div>
            {renderGalleryShowcase()}
            <div style={{ background: 'black', color: 'white', padding: '100px 0', borderTop: '3px solid black' }}>
                <div className="container text-center" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '48px', marginBottom: '24px' }}>Ready to join them?</h2>
                    <button className="btn btn-red" onClick={() => setIsAuthModalOpen(true)}>START YOUR SPRINT</button>
                </div>
            </div>
        </div>
    );

    const AdminDashboard = () => (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>Admin Portal</h2>
                    <p className="text-sub" style={{ fontSize: '13px' }}>Manage cohorts, set class schedules, and review builder progress.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-red" style={{ padding: '8px', borderRadius: '10px', width: '36px', height: '36px' }} onClick={() => setIsAddClassModalOpen(true)} title="Schedule Class">
                        <Calendar size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={fetchData}>Refresh</button>
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleSignOut}><LogOut size={14} /> Logout</button>
                </div>
            </div>

            <div className="grid-12">
                <div style={{ gridColumn: 'span 12', marginBottom: '16px' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '4px 4px 0px black', padding: '12px 16px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Active Schedule</h3>
                        <div className="scroll-box" style={{ maxHeight: '160px' }}>
                            {classes.length === 0 ? (
                                <p style={{ opacity: 0.5, fontSize: '13px' }}>No classes scheduled yet.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                    {classes.map(c => (
                                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', border: '2px solid black', borderRadius: '8px', background: c.status === 'Active' ? '#fff5f5' : '#f9f9f9', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '900' }}>{c.title}</div>
                                                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{new Date(c.date).toLocaleDateString()} • {c.time}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleClassStatus(c.id, c.status)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '9px',
                                                        borderRadius: '6px',
                                                        border: '1.5px solid black',
                                                        background: c.status === 'Active' ? '#CE1126' : '#fff',
                                                        color: c.status === 'Active' ? 'white' : 'black',
                                                        fontWeight: '900',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {c.status === 'Active' ? 'END SESSION' : 'START CLASS'}
                                                </button>
                                            </div>
                                            {c.status === 'Active' && (
                                                <div className="pill pill-red" style={{ fontSize: '8px', padding: '2px 6px', width: 'fit-content' }}>LIVE NOW</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ gridColumn: 'span 7' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '16px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Builder Progress ({filteredProfiles.length})</h3>
                        <div className="scroll-box" style={{ maxHeight: '550px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid black', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                        <th style={{ padding: '12px', fontSize: '12px' }}>BUILDER</th>
                                        <th style={{ padding: '12px', fontSize: '12px' }}>LATEST PROJECT / IDEA</th>
                                        <th style={{ padding: '12px', fontSize: '12px' }}>SPRINT STEP</th>
                                        <th style={{ padding: '12px', fontSize: '12px' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProfiles.map(p => {
                                        const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                        const latest = builderSubmissions[0];
                                        const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                        const today = new Date().toLocaleDateString();
                                        const isCheckedIn = builderSubmissions.some(s => new Date(s.created_at).toLocaleDateString() === today);

                                        return (
                                            <tr
                                                key={p.id}
                                                onClick={() => setSelectedDetailProfile(p)}
                                                style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: '800' }}>{p.full_name}</div>
                                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{p.district || '-'}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{latest?.project_name || p.idea_title || '-'}</div>
                                                    <div style={{ fontSize: '11px', fontStyle: 'normal', maxWidth: '280px', opacity: 0.8, color: '#444' }}>
                                                        {truncateText(latest?.one_liner || p.problem_statement, 80)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '950', color: 'var(--selangor-red)', textTransform: 'uppercase' }}>
                                                        {stepIndex === 0 ? 'Waitlist' : SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim() || 'Pending'}
                                                    </div>
                                                    <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: '700' }}>DAY {stepIndex} / 7</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {isCheckedIn ?
                                                        <span className="pill pill-teal" style={{ fontSize: '9px', fontWeight: '950' }}>✓ CHECKED IN</span> :
                                                        <span className="pill" style={{ opacity: 0.4, fontSize: '9px' }}>PENDING</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div style={{ gridColumn: 'span 5' }}>
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '16px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px' }}>Builders ({profiles.length})</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="builder-upload-input"
                                    placeholder="Search..."
                                    value={adminSearch}
                                    onChange={(e) => setAdminSearch(e.target.value)}
                                    style={{ padding: '6px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', width: '100px' }}
                                />
                                <select
                                    value={adminFilter}
                                    onChange={(e) => setAdminFilter(e.target.value)}
                                    style={{ padding: '6px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px' }}
                                >
                                    <option value="all">All</option>
                                    <option value="with_idea">With Idea</option>
                                    <option value="no_idea">No Idea</option>
                                </select>
                            </div>
                        </div>

                        <div className="scroll-box" style={{ maxHeight: '550px' }}>
                            {isProfilesLoading ? (
                                <p>Loading profiles...</p>
                            ) : profilesError ? (
                                <div style={{ padding: '16px', border: '3px solid var(--selangor-red)', borderRadius: '12px', background: '#fff5f5' }}>
                                    <h4 style={{ color: 'var(--selangor-red)', marginBottom: '8px' }}>Debug: Fetch Error</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700 }}>{profilesError}</p>
                                </div>
                            ) : Object.keys(profilesByIdea).length === 0 ? (
                                <div style={{ padding: '16px', border: '2px dashed #ccc', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontWeight: 700 }}>No builders found.</p>
                                </div>
                            ) : Object.entries(profilesByIdea).map(([idea, groupBuilders]) => (
                                <div key={idea} style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '4px', borderBottom: '2px solid #eee' }}>
                                        <div style={{ padding: '2px 8px', background: 'black', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>IDEA</div>
                                        <h4 style={{ fontSize: '15px' }}>{idea}</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {groupBuilders.map(p => {
                                            const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                            const latestStatus = builderSubmissions[0]?.status || 'No Submission';
                                            const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                            return (
                                                <div key={p.id} style={{ border: '2px solid black', padding: '12px', borderRadius: '10px', background: 'white' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <h5 style={{ fontSize: '16px', margin: 0 }}>{p.full_name}</h5>
                                                                {p.created_at && (
                                                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>
                                                                        Joined: {new Date(p.created_at).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p style={{ fontSize: '12px', opacity: 0.6 }}>{p.district || 'No District'}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <span className="pill" style={{ background: latestStatus === 'No Submission' ? '#eee' : 'var(--selangor-red)', color: latestStatus === 'No Submission' ? 'black' : 'white', border: 'none' }}>
                                                                {stepIndex > 0 ? (SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim() || 'Ready to Start') : 'Ready to Start'}
                                                            </span>
                                                            <span className="pill pill-teal">{p.role}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '800', marginBottom: '2px' }}>Contact:</div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                {p.whatsapp_contact && (
                                                                    <a href={formatWhatsAppLink(p.whatsapp_contact)} target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <WhatsAppIcon size={16} /> {p.whatsapp_contact}
                                                                    </a>
                                                                )}
                                                                {p.threads_handle && <div style={{ opacity: 0.7 }}>Threads: @{p.threads_handle.replace('@', '')}</div>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '800', marginBottom: '2px' }}>About Builder:</div>
                                                            <div style={{ fontSize: '12px', fontStyle: 'italic' }}>{truncateText(p.about_yourself, 80) || '-'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Attendance Toggles for Classes */}
                                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '8px', opacity: 0.5 }}>MARK ATTENDANCE:</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                            {classes.slice(0, 3).map(c => {
                                                                const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                                                                return (
                                                                    <button
                                                                        key={c.id}
                                                                        onClick={() => handleToggleAttendance(p.id, c.id)}
                                                                        style={{
                                                                            padding: '4px 8px',
                                                                            fontSize: '10px',
                                                                            borderRadius: '4px',
                                                                            border: '1.5px solid black',
                                                                            background: isPresent ? 'var(--selangor-red)' : 'white',
                                                                            color: isPresent ? 'white' : 'black',
                                                                            cursor: 'pointer',
                                                                            fontWeight: '800'
                                                                        }}
                                                                    >
                                                                        {c.title.split(' ')[0]} {isPresent ? '✓' : ''}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const BuilderDashboard = () => {
        const builderSubs = submissions.filter(s => s.user_id === selectedDetailProfile?.id || s.user_id === session?.user?.id);
        const totalSubs = builderSubs.length;
        const nextStepIdx = totalSubs < SPRINT_MODULE_STEPS.length ? totalSubs : SPRINT_MODULE_STEPS.length - 1;

        const activeClass = classes.find(c => c.status === 'Active');
        const isPresentAtActive = activeClass ? attendance.some(a => a.profile_id === currentUser?.id && a.class_id === activeClass.id && a.status === 'Present') : false;

        return (
            <div className="container" style={{ padding: '24px 20px' }}>
                {/* Profile Header - Tightened */}
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', padding: '20px 24px', background: 'white', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: isMobileView ? 'wrap' : 'nowrap' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '18px', border: '3px solid black', background: 'var(--selangor-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '950', boxShadow: '4px 4px 0px black', flexShrink: 0 }}>
                            {currentUser?.name?.[0] || 'B'}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div className="pill pill-red" style={{ marginBottom: '8px', fontSize: '9px', padding: '2px 10px' }}>FEBRUARY_COHORT_2026</div>
                                    <h2 style={{ fontSize: '36px', letterSpacing: '-1.5px', marginBottom: '4px', lineHeight: 1 }}>{currentUser?.name}</h2>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className="pill" style={{ border: '2px solid black', fontWeight: '900', fontSize: '11px', padding: '2px 8px' }}>{currentUser?.district}</span>
                                        <div style={{ fontWeight: '800', fontSize: '12px', opacity: 0.6 }}>LOGS SUBMITTED: {totalSubs}</div>
                                        {checkedInToday && <div className="pill pill-teal" style={{ fontSize: '10px', fontWeight: '900' }}>✓ CHECKED IN TODAY</div>}
                                    </div>
                                </div>
                                <button className="btn btn-outline" onClick={openEditProfileModal} style={{ borderRadius: '8px', padding: '6px 12px', fontSize: '11px', height: 'fit-content', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isUpdatingProfile}>
                                    {isUpdatingProfile ? '...' : <Settings size={12} />} Edit Profile
                                </button>
                                <button className="btn btn-outline" onClick={handleSignOut} style={{ borderRadius: '8px', padding: '6px 12px', fontSize: '11px', height: 'fit-content', textTransform: 'uppercase' }}>
                                    <LogOut size={12} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {activeClass && (
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', padding: '20px 24px', background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                            <div className="pill pill-red" style={{ fontSize: '10px', fontWeight: '900', animation: 'pulse 2s infinite' }}>LIVE SESSION</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{activeClass.title}</h3>
                                <p style={{ fontSize: '13px', opacity: 0.7 }}>Join the live session now! Don't forget to mark your attendance.</p>
                            </div>
                            <button
                                onClick={() => handleToggleAttendance(currentUser.id, activeClass.id)}
                                className={`btn ${isPresentAtActive ? 'btn-outline' : 'btn-red'}`}
                                style={{ padding: '12px 24px', borderRadius: '12px' }}
                            >
                                {isPresentAtActive ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> I'M HERE</span>
                                ) : (
                                    "I'M HERE"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid-12" style={{ gap: '20px' }}>
                    {/* Sprint Track - Tightened */}
                    <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 4' }}>
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', height: '100%', padding: '20px' }}>
                            <div style={{ marginBottom: '16px', borderBottom: '2px solid black', paddingBottom: '12px', margin: '0 -10px 16px', paddingLeft: '10px', paddingRight: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '950' }}>SPRINT TRACK</h3>
                                        <p style={{ fontSize: '10px', fontWeight: '700', opacity: 0.5 }}>Daily build & check-in flow.</p>
                                    </div>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white', fontSize: '12px', fontWeight: '950' }}>{Math.round((totalSubs / SPRINT_MODULE_STEPS.length) * 100)}%</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Day 0 Marker */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', background: '#f0fff4', borderRadius: '10px', border: '1px solid #c6f6d5', opacity: 0.8 }}>
                                    <div style={{ width: '24px', height: '24px', background: '#22c55e', borderRadius: '6px', border: '2px solid black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: '900' }}>Day 0: Registration</div>
                                </div>

                                {SPRINT_MODULE_STEPS.map((step, i) => {
                                    const isDone = i < totalSubs;
                                    const isCurrent = i === totalSubs;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: isCurrent ? '2px solid black' : '1px solid transparent',
                                            background: isCurrent ? '#fff8f0' : (isDone ? '#f0fff4' : 'transparent'),
                                            opacity: isDone || isCurrent ? 1 : 0.4,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                background: isDone ? '#22c55e' : (isCurrent ? 'black' : '#eee'),
                                                borderRadius: '6px',
                                                border: '2px solid black',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '950',
                                                fontSize: '12px'
                                            }}>
                                                {isDone ? <Check size={16} strokeWidth={4} /> : i + 1}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '800' }}>{step}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Ship Station - Expansion */}
                    <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 8' }}>
                        <div className="neo-card" style={{ border: '3px solid black', background: 'black', color: 'white', marginBottom: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '2px' }}>Next: {classes[0]?.title || 'TBD'}</h3>
                                <p style={{ opacity: 0.6, fontSize: '12px', fontWeight: '700' }}>{classes[0]?.date ? new Date(classes[0].date).toLocaleDateString() : 'TBD'} • {classes[0]?.time || 'TBD'}</p>
                            </div>
                            <Calendar size={24} style={{ opacity: 0.5 }} />
                        </div>

                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', background: '#fdfdfd', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--selangor-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Rocket size={20} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '950' }}>SHIP LOG STATION</h3>
                                    <p style={{ fontSize: '11px', opacity: 0.6, fontWeight: '800' }}>STEP: {SPRINT_MODULE_STEPS[nextStepIdx]}</p>
                                </div>
                            </div>

                            <form className="builder-upload-form" onSubmit={handleBuilderUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>PROJECT/BUILD NAME</label>
                                    <input placeholder="e.g. Selangor Vibe App" required value={newUpload.project} onChange={(e) => setNewUpload({ ...newUpload, project: e.target.value })} style={{ padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>
                                        {nextStepIdx === 0 ? 'WHAT IS THE CORE PROBLEM YOU ARE SOLVING?' :
                                            nextStepIdx === 1 ? 'WHO IS YOUR TARGET USER?' :
                                                nextStepIdx === 2 ? 'REFINED ONE-LINER VALUE PROP' :
                                                    nextStepIdx === 3 ? 'LIST CORE FEATURES (BLUEPRINT)' :
                                                        nextStepIdx === 4 ? 'DESCRIBE THE VISUAL INTERFACE & VIBE' :
                                                            nextStepIdx === 5 ? 'FINAL POLISHED DESCRIPTION' :
                                                                'FINAL SHOWCASE LINK / DEMO URL'}
                                    </label>
                                    <textarea
                                        placeholder={
                                            nextStepIdx === 0 ? "Describe the specific pain point your project addresses..." :
                                                nextStepIdx === 1 ? "Age, location, occupation, and why they need this..." :
                                                    nextStepIdx === 2 ? "How does it solve the problem in one powerful sentence?" :
                                                        nextStepIdx === 3 ? "What are the 3-5 main things your app does?" :
                                                            nextStepIdx === 4 ? "Explain the colors, fonts, and the overall 'vibe'..." :
                                                                nextStepIdx === 5 ? "Write a short, compelling summary for the public showcase..." :
                                                                    "Paste your final Threads/GitHub link or demo URL here..."
                                        }
                                        required
                                        rows={3}
                                        value={newUpload.details}
                                        onChange={(e) => setNewUpload({ ...newUpload, details: e.target.value })}
                                        style={{ padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>VISUAL PROOF / FINAL LINK (OPTIONAL)</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ flexGrow: 1, position: 'relative' }}>
                                            <input
                                                placeholder="Threads URL, GitHub, or Website"
                                                value={newUpload.link}
                                                onChange={(e) => setNewUpload({ ...newUpload, link: e.target.value })}
                                                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}
                                            />
                                        </div>
                                        <div
                                            onClick={() => document.getElementById('image-upload').click()}
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                border: '2px solid black',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                background: selectedFile ? '#f0fff4' : 'white',
                                                boxShadow: '2px 2px 0px black'
                                            }}
                                            title="Upload Image"
                                        >
                                            <Camera size={20} color={selectedFile ? '#22c55e' : 'black'} />
                                        </div>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                        />
                                    </div>
                                    {selectedFile && (
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={10} /> {selectedFile.name} SELECTED
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-red"
                                    type="submit"
                                    disabled={isUploading}
                                    style={{ padding: '16px', fontSize: '15px', fontWeight: '950', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '4px 4px 0px black', opacity: isUploading ? 0.7 : 1 }}
                                >
                                    {isUploading ? 'SHIPPING...' : (checkedInToday ? 'SHIP ANOTHER LOG' : 'CHECK-IN & SHIP LOG')} <ChevronRight size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    const LandingPage = () => (
        <>
            <section id="how-it-works" className="hero" style={{ paddingTop: '8px', paddingBottom: '40px' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="pill pill-red" style={{ marginBottom: '12px' }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h1 className="text-huge">Built for <span style={{ color: 'var(--selangor-red)' }}>Selangor</span>. Connecting and growing the builder community.</h1>
                        <button className="btn btn-red" style={{ marginTop: '12px' }} onClick={() => setIsAuthModalOpen(true)}>Join the Cohort</button>
                    </div>
                    <div style={{ gridColumn: 'span 5' }}>
                        <div className="neo-card no-jitter" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black' }}>
                            <span className="pill" style={{ background: 'black', color: 'white', cursor: 'pointer' }} onClick={() => setIsAuthModalOpen(true)}>PORTAL_ACCESS</span>
                            <div className="terminal-shell" style={{ background: '#000', borderRadius: '12px', padding: '32px', marginTop: '24px' }}>
                                <div className="terminal-prompt" style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '24px', lineHeight: 1 }}>{TERMINAL_CONTEXT}</div>
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
                                    ? (selectedDistrictName ? `${selectedDistrictName} Builders` : 'District Builders')
                                    : (selectedDistrictName ? `${selectedDistrictName} Showcase` : 'District Showcase')}
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
                                <p style={{ fontSize: '13px' }}>No submissions yet for this district.</p>
                            )}
                            {selectedDistrictName && districtShowcase.length > 0 && (
                                <div
                                    className="showcase-list"
                                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}
                                >
                                    {districtShowcase.map((item) => (
                                        mapViewMode === 'builders' ? (
                                            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px dashed #999', paddingBottom: '6px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.78, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {item.handle && (
                                                        <a href={`https://threads.net/@${item.handle.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--selangor-red)', fontWeight: 600 }}>
                                                            {item.handle.startsWith('@') ? item.handle : `@${item.handle}`}
                                                        </a>
                                                    )}
                                                    {!item.handle && <span style={{ fontStyle: 'italic' }}>No Threads handle</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <a key={item.id} href={item.submission_url || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'black', borderBottom: '1px dashed #999', paddingBottom: '6px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.project_name || 'Untitled Project'}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.78 }}>{item.one_liner || 'No transmission log.'}</div>
                                            </a>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="neo-card no-jitter map-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', display: 'flex', justifyContent: 'center' }}>
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

            {renderGalleryShowcase(isMobileView ? 4 : 8)}
        </>
    );

    const ProgramDetailsPage = () => (
        <section id="how-it-works-page" style={{ borderTop: '3px solid black', paddingTop: '40px', paddingBottom: '40px' }}>
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
                        href="https://threads.net/@_zarulijam"
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}
                    >
                        <div className="program-sticker-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ThreadsIcon size={24} /> SESSION #1 DATE: {classes[0]?.date ? new Date(classes[0].date).toLocaleDateString() : 'TBA'}
                        </div>
                        <div className="program-sticker-sub">{classes[0]?.time ? `@ ${classes[0].time}` : 'Follow me on Threads for the latest update.'}</div>
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
        <section id="coming-soon-page" style={{ borderTop: '3px solid black', paddingTop: '40px', paddingBottom: '40px' }}>
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
                        <a className="btn btn-outline" href="https://threads.net/@_zarulijam" target="_blank" rel="noreferrer" style={{ gap: '8px' }}>
                            <ThreadsIcon size={18} /> Give Feedback
                        </a>
                        <button className="btn btn-red" onClick={() => setPublicPage('home')}>Back to Home</button>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div className="vibe-selangor">
            {isAuthModalOpen && renderAuthModal()}
            {isEditProfileModalOpen && renderEditProfileModal()}
            {isAddClassModalOpen && renderAddClassModal()}
            {selectedDetailProfile && renderBuilderDetailModal()}
            <header className="glass-header">
                <div className="container header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '60px', height: 'auto', gap: '10px' }}>
                    <div className="header-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleHeaderBrandClick}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--selangor-red)', borderRadius: '8px', border: '2px solid black' }}><Zap size={18} fill="yellow" style={{ margin: '5px' }} /></div>
                        <span className="header-brand-text" style={{ fontWeight: '900', fontSize: '30px', lineHeight: 1 }}>VibeSelangor</span>
                    </div>
                    <div className="header-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                        <nav className="header-nav" style={{ display: 'flex', gap: '24px' }}>
                            {HEADER_LINKS.map((item) => (
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
                            {/* Dev-only Admin/Builder Bypass */}
                            {import.meta.env.DEV && !currentUser && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => {
                                            const mockUser = { id: 'dev-admin', name: 'Dev Admin', type: 'admin', district: 'Shah Alam' };
                                            setCurrentUser(mockUser);
                                            setSession({ user: { email: 'dev@admin.com', id: 'dev-user-id' } });
                                            fetchData();
                                        }}
                                        style={{ border: '1px dashed red', background: 'transparent', fontSize: '10px', color: 'red', cursor: 'pointer' }}
                                    >
                                        DEV: ADMIN
                                    </button>
                                    <button
                                        onClick={() => {
                                            const mockUser = { id: 'dev-builder', name: 'Dev Builder', type: 'builder', district: 'Petaling' };
                                            setCurrentUser(mockUser);
                                            setSession({ user: { email: 'dev@builder.com', id: 'dev-builder-id' } });
                                            fetchData();
                                        }}
                                        style={{ border: '1px dashed blue', background: 'transparent', fontSize: '10px', color: 'blue', cursor: 'pointer' }}
                                    >
                                        DEV: BUILDER
                                    </button>
                                </div>
                            )}
                        </nav>
                        {session ? (
                            <div className="header-auth-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px', marginRight: '4px' }}>{currentUser?.name}</span>
                                {publicPage !== 'dashboard' && (
                                    <button className="btn btn-red" style={{ padding: '8px 16px', fontSize: '11px' }} onClick={() => setPublicPage('dashboard')}>DASHBOARD</button>
                                )}
                                <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '11px' }} onClick={handleSignOut}>Logout</button>
                            </div>
                        ) : (
                            <>
                                <div className="mobile-quick-actions">
                                    <a
                                        className="mobile-icon-btn"
                                        href="https://www.threads.com/@_zarulijam"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Contact on Threads"
                                        aria-label="Contact on Threads"
                                    >
                                        <MessageCircle size={18} />
                                    </a>
                                    <button
                                        type="button"
                                        className="mobile-icon-btn mobile-icon-btn-red"
                                        onClick={() => setIsAuthModalOpen(true)}
                                        title="Become a builder now"
                                        aria-label="Become a builder now"
                                    >
                                        <User size={18} />
                                    </button>
                                </div>
                                <div className="header-auth-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                                    <a
                                        className="btn btn-outline"
                                        style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '12px' }}
                                        href="https://www.threads.com/@_zarulijam"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Contact
                                    </a>
                                    <button className="btn btn-red" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setIsAuthModalOpen(true)}>Become a builder now!</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>



            {publicPage === 'home' && LandingPage()}
            {!currentUser && !['home', 'how-it-works', 'coming-soon', 'showcase'].includes(publicPage) && LandingPage()}
            {publicPage === 'how-it-works' && ProgramDetailsPage()}
            {publicPage === 'coming-soon' && ComingSoonPage()}
            {publicPage === 'showcase' && renderFullShowcasePage()}
            {currentUser && (publicPage === 'dashboard' || !['home', 'how-it-works', 'coming-soon', 'showcase'].includes(publicPage)) && (
                <>
                    {(currentUser?.type === 'admin' || currentUser?.type === 'owner') && AdminDashboard()}
                    {currentUser?.type === 'builder' && BuilderDashboard()}
                </>
            )}

            <footer style={{ padding: '16px 0', borderTop: '3px solid black', background: 'linear-gradient(180deg, #fff 0%, #fff8dc 100%)' }}>
                <div className="container">
                    <div className="neo-card no-jitter" style={{ border: '2px solid black', boxShadow: '6px 6px 0px black', textAlign: 'center', padding: '16px 16px' }}>
                        <p style={{ fontWeight: '900', marginBottom: '2px', fontSize: '14px' }}>
                            Built by <span style={{ color: 'var(--selangor-red)' }}>_zarulijam</span>
                        </p>
                        <a
                            href="https://threads.net/@_zarulijam"
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'black', textDecoration: 'none', fontWeight: '800', fontSize: '13px', marginBottom: '2px' }}
                        >
                            <ThreadsIcon size={16} /> DM me on Threads to connect
                        </a>
                        <p style={{ fontWeight: '800', fontSize: '12px', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                            Support me in becoming the KrackedDevs Selangor Ambassador
                        </p>
                        <p style={{ fontWeight: '700', fontSize: '11px', opacity: 0.78, marginBottom: '4px' }}>
                            If you are outside Selangor, join the KrackedDevs Discord server to connect with your state ambassador.
                        </p>
                        <p style={{ fontWeight: '800', opacity: 0.45, fontSize: '10px' }}>(c) 2026 VIBESELANGOR. NO CODE. JUST VIBES.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
