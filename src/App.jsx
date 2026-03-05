import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import {
    Zap, MessageSquare,
    User, MessageCircle, Menu, ShieldCheck
} from 'lucide-react';
import { supabase } from './shared/lib/supabase';
import { ToastProvider, useToast } from './components/ToastNotification';
import MobileNavSidebar from './features/mobile/components/MobileNavSidebar';
import MobileBottomNav from './features/mobile/components/MobileBottomNav';
import ThreadsIcon from './components/ThreadsIcon';
import { awardGameRewards } from './shared/lib/gameService';
import MobileAssistiveTouch from './features/mobile/components/MobileAssistiveTouch';
import { HEADER_LINKS, OWNER_EMAIL, ADMIN_EMAILS } from './shared/constants';
import { resolveRoleByEmail } from './shared/utils';
import { getCurrentHolidayTheme, getHolidayThemeConfig } from './shared/utils/holidayUtils';
import { getDeviceMode, getIjamOsMode } from './shared/utils/deviceMode';
import { issueProgramCertificates as svcIssueProgramCertificates } from './shared/lib/certificateService';

const BuilderStudioPage = lazy(() => import('./pages/BuilderStudioPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const ProgramDetailsPage = lazy(() => import('./pages/ProgramDetailsPage'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const EditProfileModal = lazy(() => import('./components/modals/EditProfileModal'));
const AddClassModal = lazy(() => import('./components/modals/AddClassModal'));
const BuilderDetailModal = lazy(() => import('./components/modals/BuilderDetailModal'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BuilderDashboard = lazy(() => import('./pages/BuilderDashboard'));
const BuilderLeaderboard = lazy(() => import('./pages/BuilderLeaderboard'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const PublicStudioPage = lazy(() => import('./pages/PublicStudioPage'));
const BuilderVaultPage = lazy(() => import('./pages/BuilderVaultPage'));
const StartProjectPage = lazy(() => import('./pages/StartProjectPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const ResourcePage = lazy(() => import('./pages/ResourcePage'));
const HallOfFamePage = lazy(() => import('./pages/HallOfFamePage'));

const getCurrentMonthISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const computeProgramWindow = (monthValue, weekValue, startDay = 'sunday') => {
    if (!monthValue) return null;
    const [yearRaw, monthRaw] = monthValue.split('-');
    const year = Number(yearRaw);
    const monthIndex = Number(monthRaw) - 1;
    const week = Math.min(5, Math.max(1, Number(weekValue) || 1));
    if (!year || monthIndex < 0 || monthIndex > 11) return null;

    const firstDay = new Date(year, monthIndex, 1);
    const dayOfWeek = startDay === 'saturday' ? 6 : 0;
    const dayOffset = (dayOfWeek - firstDay.getDay() + 7) % 7;
    let startDate = new Date(year, monthIndex, 1 + dayOffset + (week - 1) * 7);

    if (startDate.getMonth() !== monthIndex) {
        const lastDay = new Date(year, monthIndex + 1, 0);
        const lastDiff = (lastDay.getDay() - dayOfWeek + 7) % 7;
        startDate = new Date(year, monthIndex, lastDay.getDate() - lastDiff);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        startDate,
        endDate,
        startISO: toISO(startDate),
        endISO: toISO(endDate)
    };
};

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
    const [activeOnboardingStep, setActiveOnboardingStep] = useState(0);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [newProjectTrigger, setNewProjectTrigger] = useState(false);
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
    // Holiday Theming
    const holidayTheme = useMemo(() => getCurrentHolidayTheme(), []);
    const holidayConfig = useMemo(() => getHolidayThemeConfig(holidayTheme), [holidayTheme]);
    const [deviceMode, setDeviceMode] = useState(typeof window !== 'undefined' ? getDeviceMode(window.innerWidth, navigator) : 'desktop');
    const isMobileView = deviceMode !== 'desktop';
    const isPhoneView = deviceMode === 'phone';
    const isTabletView = deviceMode === 'tablet';
    const themeFamily = deviceMode === 'desktop' ? 'neo' : 'ios';
    const ijamOsMode = getIjamOsMode(deviceMode);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileAuthDockOpen, setIsMobileAuthDockOpen] = useState(false);
    const [isTerminalEnlarged, setIsTerminalEnlarged] = useState(false);
    const [terminalMode, setTerminalMode] = useState('ijam');
    const hasUserInteractedRef = useRef(false);

    // Real-time Data State
    const [classes, setClasses] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [profilesError, setProfilesError] = useState(null);
    const [isProfilesLoading, setIsProfilesLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [certificates, setCertificates] = useState([]);


    // Form States
    const [newClass, setNewClass] = useState({ title: '', month: getCurrentMonthISO(), weekOfMonth: '1', startDay: 'sunday' });

    const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
    const [selectedDetailProfile, setSelectedDetailProfile] = useState(null);
    const [builderActionLoading, setBuilderActionLoading] = useState(false);
    const [builderActionNotice, setBuilderActionNotice] = useState('');
    const [visitingStudio, setVisitingStudio] = useState(null); // { id, name } of builder whose studio to visit

    const currentUserProjectCount = useMemo(() => {
        if (!currentUser?.id) return 0;
        return submissions.filter((item) => item?.user_id === currentUser.id).length;
    }, [submissions, currentUser?.id]);

    // PWA Install Prompt State
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };


    const handleHeaderBrandClick = () => {
        setPublicPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHeaderNavClick = (e, item) => {
        if (e) e.preventDefault();
        if (item.page) {
            setPublicPage(item.page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (item.sectionId) {
            if (publicPage !== 'home') {
                setPublicPage('home');
                // Wait for LandingPage to mount before scrolling
                setTimeout(() => {
                    document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };


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

        // 3. Real-time Subscriptions
        const classSub = supabase.channel('classes').on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_classes' }, fetchData).subscribe();
        const submissionSub = supabase.channel('submissions').on('postgres_changes', { event: '*', schema: 'public', table: 'builder_progress' }, fetchData).subscribe();
        const attendanceSub = supabase.channel('attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_attendance' }, fetchData).subscribe();
        const certificateSub = supabase.channel('certificates').on('postgres_changes', { event: '*', schema: 'public', table: 'builder_certificates' }, fetchData).subscribe();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleResize = () => setDeviceMode(getDeviceMode(window.innerWidth, navigator));
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(classSub);
            supabase.removeChannel(submissionSub);
            supabase.removeChannel(attendanceSub);
            supabase.removeChannel(certificateSub);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-device-mode', deviceMode);
        document.documentElement.setAttribute('data-theme-family', themeFamily);
        document.body.setAttribute('data-device-mode', deviceMode);
        document.body.setAttribute('data-theme-family', themeFamily);
    }, [deviceMode, themeFamily]);

    useEffect(() => {
        if (session) setIsMobileAuthDockOpen(false);
    }, [session]);

    useEffect(() => {
        const markInteraction = () => {
            hasUserInteractedRef.current = true;
        };
        window.addEventListener('pointerdown', markInteraction, { passive: true });
        window.addEventListener('keydown', markInteraction, { passive: true });
        return () => {
            window.removeEventListener('pointerdown', markInteraction);
            window.removeEventListener('keydown', markInteraction);
        };
    }, []);

    useEffect(() => {
        if (publicPage === 'ijamos' && !hasUserInteractedRef.current) {
            setPublicPage('home');
        }
    }, [publicPage]);

    const fetchData = async () => {
        setIsProfilesLoading(true);
        setProfilesError(null);
        const settled = await Promise.allSettled([
            supabase.from('cohort_classes').select('*').order('date', { ascending: true }),
            supabase.from('builder_progress').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('*').order('full_name', { ascending: true }),
            supabase.from('cohort_attendance').select('*'),
            supabase.from('builder_certificates').select('*').order('issued_at', { ascending: false })
        ]);

        const [classResult, submissionResult, profileResult, attendanceResult, certificateResult] = settled;

        const resolveData = (result, label) => {
            if (result.status === 'rejected') {
                console.error(`[Supabase] ${label} request failed:`, result.reason);
                return { data: null, error: result.reason };
            }
            const val = result.value || { data: null, error: null };
            // Supabase returns { data, error } — check for relation/table errors
            if (val.error) {
                const msg = String(val.error?.message || val.error || '');
                if (msg.includes('does not exist') || msg.includes('relation')) {
                    console.warn(`[Supabase] Table ${label} may not exist yet:`, msg);
                    return { data: [], error: null }; // Treat missing table as empty, not error
                }
            }
            return val;
        };

        const classPayload = resolveData(classResult, 'cohort_classes');
        const submissionPayload = resolveData(submissionResult, 'builder_progress');
        const profilePayload = resolveData(profileResult, 'profiles');
        const attendancePayload = resolveData(attendanceResult, 'cohort_attendance');
        const certificatePayload = resolveData(certificateResult, 'builder_certificates');

        if (classPayload.error) console.error("Supabase Classes Fetch Error:", classPayload.error);
        if (submissionPayload.error) console.error("Supabase Submissions Fetch Error:", submissionPayload.error);
        if (profilePayload.error) console.error("Supabase Profile Fetch Error:", profilePayload.error);
        if (attendancePayload.error) console.error("Supabase Attendance Fetch Error:", attendancePayload.error);
        if (certificatePayload.error) console.warn("Supabase Certificate Fetch Error (non-blocking):", certificatePayload.error);

        if (classPayload.data) setClasses(classPayload.data);
        if (submissionPayload.data) setSubmissions(submissionPayload.data);
        if (profilePayload.data) setProfiles(profilePayload.data);
        if (attendancePayload.data) setAttendance(attendancePayload.data);
        if (certificatePayload.data) setCertificates(certificatePayload.data);

        // Only consider core tables (profiles, classes, submissions) for error display
        const coreError =
            profilePayload.error ||
            submissionPayload.error ||
            classPayload.error;
        if (coreError) {
            const message = String(coreError?.message || coreError || '');
            if (message.includes('Failed to fetch') || message.includes('not configured') || message.includes('CORS') || message.includes('NetworkError')) {
                setProfilesError("Could not connect to Supabase. Please check your internet connection and verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.");
            } else {
                setProfilesError(message);
            }
        }

        setIsProfilesLoading(false);
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
            .select('full_name, district, role, idea_title, problem_statement')
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
                    await upsertProfile(userId, fallbackPayload, resolveRoleByEmail(user.email, OWNER_EMAIL, ADMIN_EMAILS));
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
        const roleByEmail = resolveRoleByEmail(email, OWNER_EMAIL, ADMIN_EMAILS);
        const roleFromProfile = profile?.role;
        const resolvedRole = roleByEmail !== 'builder' ? roleByEmail : (roleFromProfile || 'builder');

        const finalRole = resolvedRole;
        console.log('Setting user role:', { resolvedRole, finalRole });

        setCurrentUser({
            id: user.id,
            email: user.email,
            type: finalRole,
            name: profile?.full_name || metadataName,
            district: profile?.district || user.user_metadata?.district || '',
            idea_title: profile?.idea_title || user.user_metadata?.idea_title || '',
            problem_statement: profile?.problem_statement || user.user_metadata?.problem_statement || ''
        });
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
                    type: (window.location.hostname === 'localhost' && devRoleOverride) ? devRoleOverride : 'builder',
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
                        await upsertProfile(data.user.id, onboardingForm, resolveRoleByEmail(data.user?.email, OWNER_EMAIL, ADMIN_EMAILS));
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
        const programWindow = computeProgramWindow(newClass.month, newClass.weekOfMonth, newClass.startDay);
        if (!programWindow) {
            alert('Please choose a valid month and week to start the program.');
            return;
        }
        const week = Number(newClass.weekOfMonth) || 1;
        const title = (newClass.title || '').trim() || `VibeSelangor Program (Week ${week})`;
        const dayLabel = newClass.startDay === 'saturday' ? 'Saturday' : 'Sunday';
        const timeString = `${programWindow.startDate.toLocaleDateString()} to ${programWindow.endDate.toLocaleDateString()} (${dayLabel}-${dayLabel})`;

        try {
            const { error } = await supabase.from('cohort_classes').insert([{
                title,
                date: programWindow.startISO,
                time: timeString,
                status: 'Scheduled',
                type: 'Program'
            }]);

            if (error) {
                console.error("Supabase insert error:", error);
                alert(`Failed to create class: ${error.message}\n\nTroubleshooting Tip:\nPlease check your Supabase Dashboard. Ensure the table 'cohort_classes' exists and has these columns:\n- id (uuid or int8, primary key, auto-generated)\n- title (text)\n- date (date)\n- time (text)\n- status (text)\n- type (text)`);
            } else {
                setNewClass({ title: '', month: getCurrentMonthISO(), weekOfMonth: '1', startDay: 'sunday' });
                setIsAddClassModalOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert(`An unexpected error occurred: ${err.message}`);
        }
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
        } else if (session.user.id === 'demo-builder-id') {
            // Demo account fallback
            setEditProfileForm({
                username: currentUser?.name || 'Demo Builder',
                district: currentUser?.district || 'Petaling',
                problemStatement: currentUser?.problem_statement || '',
                ideaTitle: currentUser?.idea_title || '',
                threadsHandle: '',
                whatsappContact: '',
                discordTag: '',
                aboutYourself: '',
                programGoal: ''
            });
            setIsEditProfileModalOpen(true);
        }
        setIsUpdatingProfile(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);

        try {
            if (session.user.id === 'demo-builder-id') {
                // Simulate update for demo account
                setCurrentUser({
                    ...currentUser,
                    name: editProfileForm.username,
                    district: editProfileForm.district,
                    idea_title: editProfileForm.ideaTitle,
                    problem_statement: editProfileForm.problemStatement
                });
                setIsEditProfileModalOpen(false);
                alert('Demo Profile updated successfully! (Note: Changes are simulated and not saved to DB)');
            } else {
                await upsertProfile(session.user.id, editProfileForm, currentUser?.type);
                await fetchUserProfile(session.user.id);
                fetchData();
                setIsEditProfileModalOpen(false);
                alert('Profile updated successfully!');
            }
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
        if (!error) {
            const targetClass = classes.find((c) => c.id === classId);
            const endingProgram = currentStatus === 'Active' && nextStatus === 'Scheduled';
            const isProgram = String(targetClass?.type || '').toLowerCase() === 'program';
            if (endingProgram && isProgram) {
                try {
                    await svcIssueProgramCertificates({
                        supabase,
                        programClass: targetClass,
                        profiles,
                        submissions
                    });
                } catch (certificateError) {
                    console.error('Auto certificate issue failed:', certificateError);
                }
            }
        }
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

            if (!error && nextStatus === 'Present') {
                await awardGameRewards(supabase, profileId, 50, 25);
            }
        } else {
            const { error } = await supabase
                .from('cohort_attendance')
                .insert([{ profile_id: profileId, class_id: classId, status: 'Present' }]);
            if (error) console.error("Insert attendance error:", error);

            if (!error) {
                await awardGameRewards(supabase, profileId, 50, 25);
            }
        }
        fetchData();
    };

    const activeClass = useMemo(() => classes.find(c => c.status === 'Active'), [classes]);

    const activeClassAttendanceChecked = useMemo(() => {
        if (!currentUser?.id || !activeClass?.id) return false;
        return attendance.some((a) => a.profile_id === currentUser.id && a.class_id === activeClass.id && a.status === 'Present');
    }, [attendance, currentUser?.id, activeClass?.id]);

    const handleSettingsCheckIn = async () => {
        if (!currentUser?.id || !activeClass?.id) return;
        const existing = attendance.find((a) => a.profile_id === currentUser.id && a.class_id === activeClass.id);
        if (existing?.status === 'Present') return;
        if (existing) {
            const { error } = await supabase
                .from('cohort_attendance')
                .update({ status: 'Present' })
                .eq('id', existing.id);
            if (error) {
                console.error('Check-in update error:', error);
                return;
            }
            await awardGameRewards(supabase, currentUser.id, 50, 25);
            fetchData();
            return;
        }
        const { error } = await supabase
            .from('cohort_attendance')
            .insert([{ profile_id: currentUser.id, class_id: activeClass.id, status: 'Present' }]);
        if (error) {
            console.error('Check-in insert error:', error);
            return;
        }
        await awardGameRewards(supabase, currentUser.id, 50, 25);
        fetchData();
    };

    const handleJoinClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Check both session and currentUser to ensure profile is loaded
        if (session && currentUser) {
            setPublicPage('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const isMissingTableError = (error) => {
        const message = String(error?.message || '').toLowerCase();
        return message.includes('does not exist') || message.includes('relation') && message.includes('does not');
    };

    const handleAssignBuilderCertificate = async ({ builder, programClassId }) => {
        if (!builder?.id || !programClassId) {
            setBuilderActionNotice('Select a program before issuing certificate.');
            return;
        }
        try {
            setBuilderActionLoading(true);
            setBuilderActionNotice('');
            let programClass = (classes || []).find((item) => String(item.id) === String(programClassId));
            if (!programClass) {
                const { data, error } = await supabase
                    .from('cohort_classes')
                    .select('*')
                    .eq('id', programClassId)
                    .maybeSingle();
                if (error) throw error;
                programClass = data || null;
            }
            if (!programClass) {
                setBuilderActionNotice('Program class not found.');
                return;
            }
            const result = await svcIssueProgramCertificates({
                supabase,
                programClass,
                profiles,
                submissions,
                targetBuilderId: builder.id,
                assetFormat: 'both'
            });
            if ((result.errors || []).length === 0) {
                const { data: latestCert, error: latestCertError } = await supabase
                    .from('builder_certificates')
                    .select('*')
                    .eq('builder_id', builder.id)
                    .eq('program_class_id', programClass.id)
                    .order('issued_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (latestCertError) throw latestCertError;

                if (latestCert?.id) {
                    const { data: existingHall, error: existingHallError } = await supabase
                        .from('hall_of_fame_entries')
                        .select('*')
                        .eq('builder_id', builder.id)
                        .maybeSingle();
                    if (existingHallError && !isMissingTableError(existingHallError)) throw existingHallError;

                    if (!existingHall) {
                        const { error: insertHallError } = await supabase
                            .from('hall_of_fame_entries')
                            .insert([{
                                builder_id: builder.id,
                                certificate_id: latestCert.id,
                                featured_project_url: latestCert.project_url || null,
                                featured_quote: null,
                                featured_order: 1000,
                                is_active: true,
                                featured_at: new Date().toISOString()
                            }]);
                        if (insertHallError && !isMissingTableError(insertHallError)) throw insertHallError;
                    } else {
                        const { error: updateHallError } = await supabase
                            .from('hall_of_fame_entries')
                            .update({
                                certificate_id: latestCert.id,
                                featured_project_url: existingHall.featured_project_url || latestCert.project_url || null,
                                is_active: true,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existingHall.id);
                        if (updateHallError && !isMissingTableError(updateHallError)) throw updateHallError;
                    }
                }
            }
            await fetchData();
            const failed = (result.errors || []).length;
            if (failed > 0) {
                const firstError = result.errors?.[0]?.message || 'Unknown error';
                setBuilderActionNotice(`Certificate failed (${failed}). ${firstError}`);
                return;
            }
            setBuilderActionNotice(`Certificate updated. Issued ${result.issuedCount || 0}, updated ${result.updatedCount || 0}, failed 0. Added to Hall of Fame.`);
        } catch (error) {
            setBuilderActionNotice(String(error?.message || error || 'Failed to assign certificate.'));
        } finally {
            setBuilderActionLoading(false);
        }
    };

    const handleRevokeBuilderCertificate = async ({ builder, certificateId }) => {
        const targetId = certificateId || (certificates || []).find((item) => item.builder_id === builder?.id)?.id;
        if (!targetId) {
            setBuilderActionNotice('No certificate found for this builder.');
            return;
        }
        const ok = window.confirm(`Revoke certificate for ${builder?.full_name || 'this builder'}?`);
        if (!ok) return;
        try {
            setBuilderActionLoading(true);
            setBuilderActionNotice('');
            const { error } = await supabase.from('builder_certificates').delete().eq('id', targetId);
            if (error) throw error;
            await fetchData();
            setBuilderActionNotice('Certificate revoked.');
        } catch (error) {
            setBuilderActionNotice(String(error?.message || error || 'Failed to revoke certificate.'));
        } finally {
            setBuilderActionLoading(false);
        }
    };

    const handleDeleteBuilderProjects = async (builder) => {
        if (!builder?.id) return;
        const ok = window.confirm(`Delete all projects for ${builder.full_name || 'this builder'}?`);
        if (!ok) return;
        try {
            setBuilderActionLoading(true);
            setBuilderActionNotice('');
            const { error } = await supabase.from('builder_progress').delete().eq('user_id', builder.id);
            if (error) throw error;
            await fetchData();
            setBuilderActionNotice(`Deleted all projects for ${builder.full_name || 'builder'}.`);
        } catch (error) {
            setBuilderActionNotice(String(error?.message || error || 'Failed to delete projects.'));
        } finally {
            setBuilderActionLoading(false);
        }
    };

    const handleDeleteBuilder = async (builder) => {
        if (!builder?.id) return;
        const role = String(builder?.role || '').toLowerCase();
        if (role === 'owner' || role === 'admin') {
            setBuilderActionNotice('Owner/admin cannot be deleted here.');
            return;
        }
        const ok = window.confirm(`Delete builder "${builder.full_name || 'builder'}" and related records?`);
        if (!ok) return;
        try {
            setBuilderActionLoading(true);
            setBuilderActionNotice('');
            const { error: hofError } = await supabase.from('hall_of_fame_entries').delete().eq('builder_id', builder.id);
            if (hofError && !isMissingTableError(hofError)) throw hofError;
            const { error: certError } = await supabase.from('builder_certificates').delete().eq('builder_id', builder.id);
            if (certError) throw certError;
            const { error: attendanceError } = await supabase.from('cohort_attendance').delete().eq('profile_id', builder.id);
            if (attendanceError) throw attendanceError;
            const { error: progressError } = await supabase.from('builder_progress').delete().eq('user_id', builder.id);
            if (progressError) throw progressError;
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', builder.id);
            if (profileError) throw profileError;
            setSelectedDetailProfile(null);
            await fetchData();
            setBuilderActionNotice(`Deleted builder ${builder.full_name || 'builder'}.`);
        } catch (error) {
            setBuilderActionNotice(String(error?.message || error || 'Failed to delete builder.'));
        } finally {
            setBuilderActionLoading(false);
        }
    };

    // --- UI Components ---


    // Modals and Icons have been extracted.




    // ProgramDetailsPage and ComingSoonPage have been extracted to src/pages/

    const lazyFallback = (
        <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: '#475569', fontWeight: 700 }}>
            Loading...
        </div>
    );

    return (
        <ToastProvider>
            <div className={`vibe-selangor mode-${deviceMode} theme-${themeFamily}`} data-device-mode={deviceMode} data-theme-family={themeFamily}>
                {isMobileView && <div className="app-wallpaper" />}
                <MobileNavSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    session={session}
                    currentUser={currentUser}
                    publicPage={publicPage}
                    handleHeaderNavClick={handleHeaderNavClick}
                    handleJoinClick={handleJoinClick}
                    handleSignOut={handleSignOut}
                    setPublicPage={setPublicPage}
                    showChatbot={isTerminalEnlarged}
                    onOpenChatbot={() => {
                        if (publicPage !== 'home') setPublicPage('home');
                        setIsTerminalEnlarged(true);
                    }}
                    isMobileView={isMobileView}
                    isPhoneView={isPhoneView}
                    isTabletView={isTabletView}
                    installPrompt={deferredPrompt}
                    onInstallClick={handleInstallClick}
                />
                <Suspense fallback={lazyFallback}>
                    <AuthModal
                        isOpen={isAuthModalOpen}
                        onClose={() => setIsAuthModalOpen(false)}
                        authMode={authMode}
                        setAuthMode={setAuthMode}
                        handleAuth={handleAuth}
                        authEmail={authEmail}
                        setAuthEmail={setAuthEmail}
                        authPassword={authPassword}
                        setAuthPassword={setAuthPassword}
                        showAuthPassword={showAuthPassword}
                        setShowAuthPassword={setShowAuthPassword}
                        onboardingForm={onboardingForm}
                        setOnboardingForm={setOnboardingForm}
                        authError={authError}
                        isAuthLoading={isAuthLoading}
                    />
                    <EditProfileModal
                        isOpen={isEditProfileModalOpen}
                        onClose={() => setIsEditProfileModalOpen(false)}
                        editProfileForm={editProfileForm}
                        setEditProfileForm={setEditProfileForm}
                        handleUpdateProfile={handleUpdateProfile}
                        isUpdatingProfile={isUpdatingProfile}
                        activeClass={currentUser?.type === 'builder' ? activeClass : null}
                        isPresentAtActive={activeClassAttendanceChecked}
                        onCheckIn={currentUser?.type === 'builder' ? handleSettingsCheckIn : null}
                    />
                    <AddClassModal
                        isOpen={isAddClassModalOpen}
                        onClose={() => setIsAddClassModalOpen(false)}
                        newClass={newClass}
                        setNewClass={setNewClass}
                        handleAdminAddClass={handleAdminAddClass}
                        isMobileView={isMobileView}
                    />
                    <BuilderDetailModal
                        isOpen={!!selectedDetailProfile}
                        onClose={() => setSelectedDetailProfile(null)}
                        builder={selectedDetailProfile}
                        submissions={submissions}
                        currentUser={currentUser}
                        isMobileView={isMobileView}
                        certificates={certificates}
                        classes={classes}
                        adminActionLoading={builderActionLoading}
                        adminActionNotice={builderActionNotice}
                        onAssignCertificate={handleAssignBuilderCertificate}
                        onRevokeCertificate={handleRevokeBuilderCertificate}
                        onDeleteProjects={handleDeleteBuilderProjects}
                        onDeleteBuilder={handleDeleteBuilder}
                        onVisitStudio={(builder) => {
                            setVisitingStudio({ id: builder.id, name: builder.full_name });
                            setPublicPage('public-studio');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                    {/* Header: Hidden on mobile for all feature pages */}
                    {!isMobileView && publicPage !== 'ijamos' && (
                        <header className="glass-header">
                            <div className="header-container" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative',
                                paddingTop: isMobileView ? '16px' : '0',
                                paddingBottom: isMobileView ? '16px' : '0',
                                maxWidth: '100%',
                                paddingLeft: isMobileView ? '16px' : '24px',
                                paddingRight: isMobileView ? '16px' : '24px'
                            }}>
                                {/* Left portion: Menu button (desktop) and Logo */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '5px'
                                        }}
                                        title="Open Menu"
                                    >
                                        <Menu size={24} />
                                    </button>

                                    {/* Logo */}
                                    <div className="header-brand-wrap" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }} onClick={handleHeaderBrandClick}>
                                        <div style={{
                                            width: isMobileView ? '32px' : '36px',
                                            height: isMobileView ? '32px' : '36px',
                                            background: holidayConfig?.color || 'var(--selangor-red)',
                                            borderRadius: '8px',
                                            border: '2px solid black',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '2.5px 2.5px 0 black',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0
                                        }}>
                                            <Zap size={isMobileView ? 20 : 24} fill="yellow" color="black" strokeWidth={2.5} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <span className="header-brand-text" style={{
                                                fontWeight: '950',
                                                fontSize: isMobileView ? '20px' : '26px',
                                                lineHeight: 1,
                                                letterSpacing: '-0.03em',
                                                marginTop: '2px'
                                            }}>
                                                VibeSelangor
                                            </span>
                                            {holidayConfig && (
                                                <div style={{
                                                    fontSize: '9px',
                                                    color: holidayConfig.color || 'var(--selangor-red)',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginTop: '1px',
                                                    opacity: 0.9,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {holidayConfig.headerLabel}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                {/* Right side: Auth actions for mobile, full nav for desktop */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                }}>
                                    {!isMobileView ? (
                                        <div className="header-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                                            <nav className="header-nav" style={{ display: 'flex', gap: '20px' }}>
                                                {HEADER_LINKS.map(link => (
                                                    <a
                                                        key={link.label}
                                                        href={link.page ? `#${link.page}-page` : `#${link.sectionId}`}
                                                        className="header-link"
                                                        onClick={(e) => handleHeaderNavClick(e, link)}
                                                        style={{
                                                            color: (publicPage === link.page) ? 'var(--selangor-red)' : 'black',
                                                            textDecoration: 'none',
                                                            fontWeight: '800',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {link.label}
                                                    </a>
                                                ))}
                                            </nav>
                                            <div className="header-auth-actions" style={{ display: 'flex', gap: '10px' }}>
                                                {!session ? (
                                                    <button className="btn btn-red" onClick={handleJoinClick} style={{ padding: '8px 20px', fontSize: '12px' }}>
                                                        JOIN COHORT
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-outline" onClick={() => setPublicPage('dashboard')} style={{ padding: '8px 20px', fontSize: '12px' }}>
                                                        DASHBOARD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // Mobile auth actions
                                        <div className="header-auth-actions" style={{ display: 'flex', gap: '10px' }}>
                                            {!session ? (
                                                <button className="btn btn-red" onClick={handleJoinClick} style={{ padding: '6px 12px', fontSize: '11px' }}>
                                                    JOIN
                                                </button>
                                            ) : (
                                                <button className="btn btn-outline" onClick={() => setPublicPage('dashboard')} style={{ padding: '6px 12px', fontSize: '11px' }}>
                                                    DASH
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                    )}



                    {
                        publicPage === 'home' && (
                            <LandingPage
                                profiles={profiles}
                                submissions={submissions}
                                classes={classes}
                                session={session}
                                handleJoinClick={handleJoinClick}
                                isMobileView={isMobileView}
                                isPhoneView={isPhoneView}
                                isTabletView={isTabletView}
                                setPublicPage={setPublicPage}
                                setSelectedDetailProfile={setSelectedDetailProfile}
                                isTerminalEnlarged={isTerminalEnlarged}
                                setIsTerminalEnlarged={setIsTerminalEnlarged}
                                terminalMode={terminalMode}
                                setTerminalMode={setTerminalMode}
                                holidayConfig={holidayConfig}
                                setNewProjectTrigger={setNewProjectTrigger}
                            />
                        )
                    }
                    {
                        publicPage === 'map' && (
                            <LandingPage
                                profiles={profiles}
                                submissions={submissions}
                                classes={classes}
                                session={session}
                                handleJoinClick={handleJoinClick}
                                isMobileView={isMobileView}
                                isPhoneView={isPhoneView}
                                isTabletView={isTabletView}
                                setPublicPage={setPublicPage}
                                setSelectedDetailProfile={setSelectedDetailProfile}
                                isTerminalEnlarged={isTerminalEnlarged}
                                setIsTerminalEnlarged={setIsTerminalEnlarged}
                                terminalMode={terminalMode}
                                setTerminalMode={setTerminalMode}
                                holidayConfig={holidayConfig}
                                viewMode="map"
                                setNewProjectTrigger={setNewProjectTrigger}
                            />
                        )
                    }
                    {
                        !currentUser && !['home', 'map', 'how-it-works', 'coming-soon', 'showcase', 'hall-of-fame', 'leaderboard', 'forum', 'studio', 'public-studio', 'ijamos'].includes(publicPage) && (
                            <LandingPage
                                profiles={profiles}
                                submissions={submissions}
                                classes={classes}
                                session={session}
                                handleJoinClick={handleJoinClick}
                                isMobileView={isMobileView}
                                isPhoneView={isPhoneView}
                                isTabletView={isTabletView}
                                setPublicPage={setPublicPage}
                                setSelectedDetailProfile={setSelectedDetailProfile}
                                isTerminalEnlarged={isTerminalEnlarged}
                                setIsTerminalEnlarged={setIsTerminalEnlarged}
                                terminalMode={terminalMode}
                                setTerminalMode={setTerminalMode}
                                holidayConfig={holidayConfig}
                            />
                        )
                    }
                    {publicPage === 'how-it-works' && <ProgramDetailsPage classes={classes} handleJoinClick={handleJoinClick} setPublicPage={setPublicPage} isMobileView={isMobileView} />}
                    {publicPage === 'coming-soon' && <ComingSoonPage setPublicPage={setPublicPage} />}
                    {publicPage === 'leaderboard' && <BuilderLeaderboard isMobileView={isMobileView} />}
                    {publicPage === 'forum' && <ForumPage session={session} currentUser={currentUser} isMobileView={isMobileView} setPublicPage={setPublicPage} classes={classes} />}
                    {publicPage === 'studio' && session && <BuilderStudioPage session={session} />}
                    {
                        publicPage === 'studio' && !session && (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
                                <h2 style={{ marginBottom: '8px' }}>Builder Arcade</h2>
                                <p style={{ color: '#666', marginBottom: '24px' }}>Log in to access the arcade and squash some bugs!</p>
                                <button className="btn btn-red" onClick={() => setIsAuthModalOpen(true)}>Login to Access Arcade</button>
                            </div>
                        )
                    }
                    {
                        publicPage === 'public-studio' && visitingStudio && (
                            <div style={{ paddingTop: '80px', background: '#fff', minHeight: '100vh' }}>
                                <PublicStudioPage
                                    targetUserId={visitingStudio.id}
                                    targetUserName={visitingStudio.name}
                                    session={session}
                                    onBack={() => {
                                        setVisitingStudio(null);
                                        setPublicPage('showcase');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )
                    }
                    {
                        publicPage === 'showcase' && (
                            <ShowcasePage
                                setPublicPage={setPublicPage}
                                submissions={submissions}
                                profiles={profiles}
                                session={session}
                                setSelectedDetailProfile={setSelectedDetailProfile}
                                isMobileView={isMobileView}
                                handleJoinClick={handleJoinClick}
                                classes={classes}
                                certificates={certificates}
                            />
                        )
                    }
                    {
                        publicPage === 'hall-of-fame' && (
                            <HallOfFamePage
                                isMobileView={isMobileView}
                                setPublicPage={setPublicPage}
                            />
                        )
                    }
                    {
                        publicPage === 'builder-vault' && (
                            <BuilderVaultPage
                                session={session}
                                currentUser={currentUser}
                                submissions={submissions}
                                fetchData={fetchData}
                                isMobileView={isMobileView}
                                setPublicPage={setPublicPage}
                            />
                        )
                    }
                    {
                        publicPage === 'ijamos' && (
                            <ResourcePage
                                session={session}
                                currentUser={currentUser}
                                isMobileView={isMobileView}
                                deviceMode={deviceMode}
                                ijamOsMode={ijamOsMode}
                                setPublicPage={setPublicPage}
                            />
                        )
                    }
                    {
                        publicPage === 'start-project' && (
                            <StartProjectPage
                                session={session}
                                currentUser={currentUser}
                                setPublicPage={setPublicPage}
                                fetchData={fetchData}
                                isMobileView={isMobileView}
                            />
                        )
                    }
                    {
                        currentUser && (publicPage === 'dashboard' || !['home', 'map', 'how-it-works', 'coming-soon', 'showcase', 'hall-of-fame', 'forum', 'studio', 'leaderboard', 'ijamos', 'builder-vault', ...(isMobileView ? ['start-project'] : [])].includes(publicPage)) && (
                            <>
                                {(currentUser?.type === 'admin' || currentUser?.type === 'owner') && (
                                    <AdminDashboard
                                        profiles={profiles}
                                        classes={classes}
                                        attendance={attendance}
                                        submissions={submissions}
                                        handleToggleClassStatus={handleToggleClassStatus}
                                        handleToggleAttendance={handleToggleAttendance}
                                        setIsAddClassModalOpen={setIsAddClassModalOpen}
                                        fetchData={fetchData}
                                        handleSignOut={handleSignOut}
                                        setSelectedDetailProfile={setSelectedDetailProfile}
                                        isProfilesLoading={isProfilesLoading}
                                        profilesError={profilesError}
                                        isMobileView={isMobileView}
                                        setPublicPage={setPublicPage}
                                    />
                                )}
                                {currentUser?.type === 'builder' && (
                                    <BuilderDashboard
                                        currentUser={currentUser}
                                        classes={classes}
                                        attendance={attendance}
                                        submissions={submissions}
                                        handleToggleAttendance={handleToggleAttendance}
                                        handleSignOut={handleSignOut}
                                        openEditProfileModal={openEditProfileModal}
                                        isUpdatingProfile={isUpdatingProfile}
                                        session={session}
                                        fetchData={fetchData}
                                        isMobileView={isMobileView}
                                        setPublicPage={setPublicPage}
                                    />
                                )}
                            </>
                        )
                    }

                    {/* Zarulijam AI Chatbot removed in favor of IJAM_BOT terminal console */}

                    {/* Mobile Navigation Sidebar */}
                    <MobileNavSidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        session={session}
                        currentUser={currentUser}
                        publicPage={publicPage}
                        handleHeaderNavClick={handleHeaderNavClick}
                        handleJoinClick={handleJoinClick}
                        handleSignOut={handleSignOut}
                        setPublicPage={setPublicPage}
                        showChatbot={isTerminalEnlarged}
                        onOpenChatbot={() => {
                            if (publicPage !== 'home') setPublicPage('home');
                            setIsTerminalEnlarged(true);
                        }}
                        isMobileView={isMobileView}
                    />

                    {/* Mobile Bottom Navigation */}
                    {
                        isMobileView && publicPage !== 'ijamos' && (
                            <MobileBottomNav
                                currentPage={publicPage}
                                isLoggedIn={!!session}
                                onNavigate={(id) => {
                                    const authPages = ['dashboard', 'studio'];
                                    if (id === 'map') {
                                        setPublicPage('map');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        return;
                                    }
                                    if (id === 'how-it-works') {
                                        setPublicPage('how-it-works');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        return;
                                    }
                                    if (id === 'chat') {
                                        setPublicPage('home');
                                        setTerminalMode('live');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        return;
                                    }
                                    if (id === 'login') {
                                        setIsMobileAuthDockOpen((prev) => !prev);
                                        return;
                                    }
                                    if (authPages.includes(id)) {
                                        if (session) { setPublicPage(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                                        else setIsAuthModalOpen(true);
                                    } else if (['leaderboard', 'forum', 'showcase', 'hall-of-fame', 'ijamos', 'promptforge', 'coming-soon'].includes(id)) {
                                        setPublicPage(id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                        setPublicPage('home');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                            />
                        )
                    }
                    {!session && isMobileView && isMobileAuthDockOpen && (
                        <div
                            style={{
                                position: 'fixed',
                                left: 0,
                                right: 0,
                                bottom: 86,
                                zIndex: 10030,
                                display: 'flex',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}
                        >
                            <div
                                style={{
                                    pointerEvents: 'auto',
                                    display: 'flex',
                                    gap: 8,
                                    padding: 8,
                                    borderRadius: 999,
                                    border: '1px solid rgba(148,163,184,0.35)',
                                    background: 'rgba(255,255,255,0.86)',
                                    backdropFilter: 'blur(14px) saturate(1.08)',
                                    boxShadow: '0 8px 22px rgba(15,23,42,0.18)'
                                }}
                            >
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '8px 14px', fontSize: 11, borderRadius: 999 }}
                                    onClick={() => {
                                        setAuthMode('signin');
                                        setIsAuthModalOpen(true);
                                        setIsMobileAuthDockOpen(false);
                                    }}
                                >
                                    Sign In
                                </button>
                                <button
                                    className="btn btn-red"
                                    style={{ padding: '8px 14px', fontSize: 11, borderRadius: 999 }}
                                    onClick={() => {
                                        setAuthMode('signup');
                                        setIsAuthModalOpen(true);
                                        setIsMobileAuthDockOpen(false);
                                    }}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Global Mobile Assistive Touch */}
                    {isMobileView && publicPage !== 'ijamos' && (
                        <MobileAssistiveTouch
                            onNavigate={(id) => {
                                const authPages = ['dashboard', 'studio'];
                                if (id === 'map') {
                                    setPublicPage('map');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    return;
                                }
                                if (id === 'how-it-works') {
                                    setPublicPage('how-it-works');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    return;
                                }
                                if (id === 'chat') {
                                    setPublicPage('home');
                                    setTerminalMode('live');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    return;
                                }
                                if (id === 'login') {
                                    setIsMobileAuthDockOpen((prev) => !prev);
                                    return;
                                }
                                if (authPages.includes(id)) {
                                    if (session) { setPublicPage(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                                    else setIsAuthModalOpen(true);
                                } else if (['leaderboard', 'forum', 'showcase', 'hall-of-fame', 'ijamos', 'promptforge', 'coming-soon'].includes(id)) {
                                    setPublicPage(id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    setPublicPage('home');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        />
                    )}
                </Suspense>
            </div >
        </ToastProvider >
    );
};

export default App;




