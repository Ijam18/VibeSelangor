import React, { useState, useEffect, useMemo } from 'react';
import {
    Zap, MessageSquare,
    User, MessageCircle, Menu,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { ToastProvider, useToast } from './components/ToastNotification';
import { LiveBanner, LiveHeaderBadge } from './components/LiveBanner';
import ZarulijamChatbot from './components/ZarulijamChatbot';
import MobileNavSidebar from './components/MobileNavSidebar';
import SprintAssistant from './components/SprintAssistant';
import MobileBottomNav from './components/MobileBottomNav';
import BuilderStudioPage from './pages/BuilderStudioPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ProgramDetailsPage from './pages/ProgramDetailsPage';
import AuthModal from './components/modals/AuthModal';
import EditProfileModal from './components/modals/EditProfileModal';
import AddClassModal from './components/modals/AddClassModal';
import BuilderDetailModal from './components/modals/BuilderDetailModal';
import AdminDashboard from './pages/AdminDashboard';
import BuilderDashboard from './pages/BuilderDashboard';
import ThreadsIcon from './components/ThreadsIcon';
import BuilderLeaderboard from './pages/BuilderLeaderboard';
import ForumPage from './pages/ForumPage';
import PublicStudioPage from './pages/PublicStudioPage';
import { awardGameRewards } from './lib/gameService';
import LiveChat from './components/LiveChat';




import LandingPage from './pages/LandingPage';
import ShowcasePage from './pages/ShowcasePage';
import { HEADER_LINKS, OWNER_EMAIL, ADMIN_EMAILS } from './constants';
import { resolveRoleByEmail } from './utils';
import { getCurrentHolidayTheme, getHolidayThemeConfig } from './utils/holidayUtils';

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
    const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const chatbotRef = React.useRef(null);

    // Real-time Data State
    const [classes, setClasses] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [profilesError, setProfilesError] = useState(null);
    const [isProfilesLoading, setIsProfilesLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);


    // Form States
    const [newClass, setNewClass] = useState({ title: '', date: '', time: '', startTime: '20:00', endTime: '22:00' });

    const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
    const [selectedDetailProfile, setSelectedDetailProfile] = useState(null);
    const [visitingStudio, setVisitingStudio] = useState(null); // { id, name } of builder whose studio to visit

    const currentUserProjectCount = useMemo(() => {
        if (!currentUser?.id) return 0;
        return submissions.filter((item) => item?.user_id === currentUser.id).length;
    }, [submissions, currentUser?.id]);


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

        setCurrentUser({
            id: user.id,
            email: user.email,
            type: resolvedRole,
            name: profile?.full_name || metadataName,
            district: profile?.district || user.user_metadata?.district || ''
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

    // --- UI Components ---


    // Modals and Icons have been extracted.




    // ProgramDetailsPage and ComingSoonPage have been extracted to src/pages/

    // Derived: active class for LIVE banner
    const activeClass = useMemo(() => classes.find(c => c.status === 'Active'), [classes]);

    return (
        <ToastProvider>
            <div className="vibe-selangor">
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
                />
                <AddClassModal
                    isOpen={isAddClassModalOpen}
                    onClose={() => setIsAddClassModalOpen(false)}
                    newClass={newClass}
                    setNewClass={setNewClass}
                    handleAdminAddClass={handleAdminAddClass}
                />
                <BuilderDetailModal
                    isOpen={!!selectedDetailProfile}
                    onClose={() => setSelectedDetailProfile(null)}
                    builder={selectedDetailProfile}
                    submissions={submissions}
                    currentUser={currentUser}
                    isMobileView={isMobileView}
                    onVisitStudio={(builder) => {
                        setVisitingStudio({ id: builder.id, name: builder.full_name });
                        setPublicPage('public-studio');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
                {/* Site-wide LIVE banner */}
                {activeClass && publicPage !== 'dashboard' && (
                    <LiveBanner
                        activeClass={activeClass}
                        onJoinClick={handleJoinClick}
                    />
                )}
                <header className="glass-header">
                    <div className="container header-container" style={{
                        display: 'flex',
                        justifyContent: isMobileView ? 'center' : 'space-between',
                        alignItems: 'center',
                        minHeight: '60px',
                        height: 'auto',
                        gap: '10px',
                        position: 'relative'
                    }}>
                        <div className="header-brand-wrap" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            paddingTop: isMobileView ? '8px' : '0',
                            transform: isMobileView ? 'translateX(-45px)' : 'none'
                        }} onClick={handleHeaderBrandClick}>
                            <div style={{
                                width: isMobileView ? '38px' : '42px',
                                height: isMobileView ? '38px' : '42px',
                                background: holidayConfig?.color || 'var(--selangor-red)',
                                borderRadius: '10px',
                                border: '2.5px solid black',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '3px 3px 0 black',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }}>
                                <Zap size={isMobileView ? 24 : 28} fill="yellow" color="black" strokeWidth={2.5} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span className="header-brand-text" style={{
                                    fontWeight: '900',
                                    fontSize: isMobileView ? '24px' : '30px',
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em'
                                }}>
                                    VibeSelangor
                                </span>
                                {holidayConfig && (
                                    <div style={{
                                        fontSize: '10px',
                                        color: holidayConfig.color || 'var(--selangor-red)',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginTop: '2px'
                                    }}>
                                        {holidayConfig.label}
                                    </div>
                                )}
                            </div>

                            {/* LIVE badge in header */}
                            {activeClass && (
                                <LiveHeaderBadge onClick={handleJoinClick} />
                            )}
                        </div>

                        {!isMobileView && (
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
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}
                                        title="Open Menu"
                                    >
                                        <Menu size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>



                {publicPage === 'home' && (
                    <LandingPage
                        profiles={profiles}
                        submissions={submissions}
                        session={session}
                        handleJoinClick={handleJoinClick}
                        isMobileView={isMobileView}
                        setPublicPage={setPublicPage}
                        setSelectedDetailProfile={setSelectedDetailProfile}
                    />
                )}
                {!currentUser && !['home', 'how-it-works', 'coming-soon', 'showcase', 'leaderboard', 'forum', 'studio', 'public-studio'].includes(publicPage) && (
                    <LandingPage
                        profiles={profiles}
                        submissions={submissions}
                        session={session}
                        handleJoinClick={handleJoinClick}
                        isMobileView={isMobileView}
                        setPublicPage={setPublicPage}
                        setSelectedDetailProfile={setSelectedDetailProfile}
                    />
                )}
                {publicPage === 'how-it-works' && <ProgramDetailsPage classes={classes} handleJoinClick={handleJoinClick} setPublicPage={setPublicPage} isMobileView={isMobileView} />}
                {publicPage === 'coming-soon' && <ComingSoonPage setPublicPage={setPublicPage} />}
                {publicPage === 'leaderboard' && <BuilderLeaderboard isMobileView={isMobileView} />}
                {publicPage === 'forum' && <ForumPage session={session} currentUser={currentUser} />}
                {publicPage === 'studio' && session && <BuilderStudioPage session={session} />}
                {publicPage === 'studio' && !session && (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
                        <h2 style={{ marginBottom: '8px' }}>Builder Arcade</h2>
                        <p style={{ color: '#666', marginBottom: '24px' }}>Log in to access the arcade and squash some bugs!</p>
                        <button className="btn btn-red" onClick={() => setIsAuthModalOpen(true)}>Login to Access Arcade</button>
                    </div>
                )}
                {publicPage === 'public-studio' && visitingStudio && (
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
                )}
                {publicPage === 'showcase' && (
                    <ShowcasePage
                        setPublicPage={setPublicPage}
                        submissions={submissions}
                        profiles={profiles}
                        session={session}
                        setSelectedDetailProfile={setSelectedDetailProfile}
                        isMobileView={isMobileView}
                        handleJoinClick={handleJoinClick}
                    />
                )}
                {currentUser && (publicPage === 'dashboard' || !['home', 'how-it-works', 'coming-soon', 'showcase', 'forum', 'studio', 'leaderboard'].includes(publicPage)) && (
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
                            />
                        )}
                    </>
                )}

                <footer style={{ padding: '16px 0', borderTop: '3px solid black', background: 'linear-gradient(180deg, #fff 0%, #fff8dc 100%)' }}>
                    <div className="container">
                        <div className="neo-card no-jitter" style={{ border: '2px solid black', boxShadow: '6px 6px 0px black', textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontWeight: '900', marginBottom: '8px', fontSize: '14px', width: '100%' }}>
                                Built by <span style={{ color: 'var(--selangor-red)' }}>_zarulijam</span>
                            </p>
                            <a
                                href="https://threads.net/@_zarulijam"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'black', textDecoration: 'none', fontWeight: '800', fontSize: '13px', marginBottom: '8px', width: '100%', flexWrap: 'wrap' }}
                            >
                                <ThreadsIcon size={16} /> DM me on Threads to connect
                            </a>
                            <p style={{ fontWeight: '800', fontSize: '12px', marginBottom: '8px', lineHeight: '1.4', width: '100%' }}>
                                Support me in becoming the KrackedDevs Selangor Ambassador
                            </p>
                            <p style={{ fontWeight: '700', fontSize: '11px', opacity: 0.78, marginBottom: '6px', lineHeight: '1.4', maxWidth: '400px' }}>
                                If you are outside Selangor, join the KrackedDevs Discord server to connect with your state ambassador.
                            </p>
                            <p style={{ fontWeight: '800', opacity: 0.45, fontSize: '10px', marginTop: '4px' }}>(c) 2026 VIBESELANGOR. NO CODE. JUST VIBES.</p>
                        </div>
                    </div>
                </footer>
                {/* Zarulijam AI Chatbot — visible on all pages, manages its own hidden state */}
                <ZarulijamChatbot ref={chatbotRef} />

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
                    onOpenChatbot={() => chatbotRef.current?.openChat()}
                    isMobileView={isMobileView}
                />

                {/* Live Class Chat */}
                <LiveChat session={session} activeClass={activeClass} />

                {/* Floating Menu Button (Global) */}
                {!isSidebarOpen && isMobileView && (
                    <button
                        className="mobile-floating-menu"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Toggle Menu"
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Mobile Bottom Navigation */}
                {isMobileView && (
                    <MobileBottomNav
                        currentPage={publicPage}
                        isLoggedIn={!!session}
                        onNavigate={(id) => {
                            const authPages = ['dashboard', 'studio'];
                            if (authPages.includes(id)) {
                                if (session) { setPublicPage(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                                else setIsAuthModalOpen(true);
                            } else if (['leaderboard', 'forum', 'showcase'].includes(id)) {
                                setPublicPage(id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                setPublicPage('home');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    />
                )}
            </div>
        </ToastProvider>
    );
};

export default App;
