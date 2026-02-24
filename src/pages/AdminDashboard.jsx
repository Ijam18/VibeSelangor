import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, LogOut, Check, ExternalLink, Sparkles, FileText, X, Award, Eye } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import ThreadsIcon from '../components/ThreadsIcon';
import { DISTRICT_OPTIONS, SPRINT_MODULE_STEPS } from '../constants';
import { truncateText, downloadCSV, formatWhatsAppLink } from '../utils';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { supabase } from '../lib/supabase';
import { issueProgramCertificates as svcIssueProgramCertificates, getEligibleProgramBuilders as svcGetEligibleProgramBuilders, deriveCertificateAssetUrl } from '../lib/certificateService';

export default function AdminDashboard({
    profiles,
    classes,
    attendance,
    submissions,
    handleToggleClassStatus,
    handleToggleAttendance,
    setIsAddClassModalOpen,
    fetchData,
    handleSignOut,
    setSelectedDetailProfile,
    isProfilesLoading,
    profilesError,
    isMobileView,
    setPublicPage
}) {
    const [adminTab, setAdminTab] = useState('overview');
    const [adminSearch, setAdminSearch] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); // all, with_idea, no_idea
    const [islandIndex, setIslandIndex] = useState(0);
    const [reportPeriod, setReportPeriod] = useState('weekly'); // daily, weekly, monthly, yearly, range
    const [reportRangeStart, setReportRangeStart] = useState('');
    const [reportRangeEnd, setReportRangeEnd] = useState('');
    const [reportType, setReportType] = useState('cohort'); // cohort | builder
    const [reportBuilderId, setReportBuilderId] = useState('');
    const [selectedTopBuilderId, setSelectedTopBuilderId] = useState(null);
    const [classMobileFilter, setClassMobileFilter] = useState('all'); // all | active | ended
    const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
    const [attendanceClassId, setAttendanceClassId] = useState(null);
    const [isTipsOpen, setIsTipsOpen] = useState(false);
    const [tipsIndex, setTipsIndex] = useState(0);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [desktopBuilderVisibleCount, setDesktopBuilderVisibleCount] = useState(24);
    const [issuingCertClassId, setIssuingCertClassId] = useState(null);
    const [certificateProgramId, setCertificateProgramId] = useState(null);
    const [programCertificates, setProgramCertificates] = useState([]);
    const [isProgramCertificatesLoading, setIsProgramCertificatesLoading] = useState(false);
    const [certificatePreview, setCertificatePreview] = useState(null);
    const [certificateAssetFormat, setCertificateAssetFormat] = useState('both');
    const [allCertificates, setAllCertificates] = useState([]);

    // Filter Logic moved here
    const filteredProfiles = useMemo(() => {
        let list = profiles;
        if (adminSearch) {
            const s = adminSearch.toLowerCase();
            list = list.filter(p =>
                p.full_name?.toLowerCase().includes(s) ||
                p.district?.toLowerCase().includes(s) ||
                p.idea_title?.toLowerCase().includes(s)
            );
        }
        if (adminFilter === 'with_idea') list = list.filter(p => p.idea_title);
        if (adminFilter === 'no_idea') list = list.filter(p => !p.idea_title);

        return list;
    }, [profiles, adminSearch, adminFilter]);

    const profilesByIdea = useMemo(() => {
        const groups = {};
        filteredProfiles.forEach(p => {
            if (p.idea_title) {
                if (!groups[p.idea_title]) groups[p.idea_title] = [];
                groups[p.idea_title].push(p);
            }
        });
        return groups;
    }, [filteredProfiles]);

    useEffect(() => {
        if (!isMobileView) return undefined;
        const timer = setInterval(() => setIslandIndex((prev) => (prev + 1) % 3), 3400);
        return () => clearInterval(timer);
    }, [isMobileView]);

    const adminAnalytics = useMemo(() => {
        const builderProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
        const ideasSubmitted = builderProfiles.filter((p) => Boolean((p?.idea_title || '').trim())).length;
        const projectsSubmitted = (submissions || []).filter((s) => {
            const link = s?.submission_url || s?.project_url || s?.demo_url || s?.github_url;
            return Boolean((link || '').trim());
        }).length;
        const districtCounts = builderProfiles.reduce((acc, p) => {
            const key = p?.district || 'Unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const topDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const today = new Date().toLocaleDateString();
        const todaysSubmissions = (submissions || []).filter((s) => new Date(s.created_at).toLocaleDateString() === today).length;
        return {
            builders: builderProfiles.length,
            ideasSubmitted,
            projectsSubmitted,
            topDistricts,
            todaysSubmissions
        };
    }, [profiles, submissions]);

    const reportBounds = useMemo(() => {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        if (reportPeriod === 'daily') return { start, end, label: 'Daily' };
        if (reportPeriod === 'weekly') {
            const weeklyStart = new Date(start);
            weeklyStart.setDate(weeklyStart.getDate() - 6);
            return { start: weeklyStart, end, label: 'Weekly (last 7 days)' };
        }
        if (reportPeriod === 'monthly') {
            const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
            monthlyStart.setHours(0, 0, 0, 0);
            return { start: monthlyStart, end, label: 'Monthly' };
        }
        if (reportPeriod === 'yearly') {
            const yearlyStart = new Date(now.getFullYear(), 0, 1);
            yearlyStart.setHours(0, 0, 0, 0);
            return { start: yearlyStart, end, label: 'Yearly' };
        }
        if (reportPeriod === 'range') {
            if (!reportRangeStart || !reportRangeEnd) return { start: null, end: null, label: 'Custom Range (not set)' };
            const customStart = new Date(reportRangeStart);
            customStart.setHours(0, 0, 0, 0);
            const customEnd = new Date(reportRangeEnd);
            customEnd.setHours(23, 59, 59, 999);
            return { start: customStart, end: customEnd, label: `Range: ${reportRangeStart} to ${reportRangeEnd}` };
        }
        return { start, end, label: 'Weekly (last 7 days)' };
    }, [reportPeriod, reportRangeStart, reportRangeEnd]);

    const submissionsInPeriod = useMemo(() => {
        if (!reportBounds.start || !reportBounds.end) return submissions || [];
        return (submissions || []).filter((s) => {
            const created = new Date(s.created_at);
            return created >= reportBounds.start && created <= reportBounds.end;
        });
    }, [submissions, reportBounds]);

    const reportProfilesSorted = useMemo(() => {
        const latestByUser = new Map();
        (submissionsInPeriod || []).forEach((s) => {
            const prev = latestByUser.get(s.user_id);
            if (!prev || new Date(s.created_at) > new Date(prev.created_at)) latestByUser.set(s.user_id, s);
        });
        return [...(filteredProfiles || [])].sort((a, b) => {
            const aDate = latestByUser.get(a.id)?.created_at || a?.updated_at || a?.created_at || 0;
            const bDate = latestByUser.get(b.id)?.created_at || b?.updated_at || b?.created_at || 0;
            return new Date(bDate) - new Date(aDate);
        });
    }, [filteredProfiles, submissionsInPeriod]);

    const adminTips = useMemo(() => {
        return [
            'Keep the builders unblocked. Fast feedback keeps momentum high.',
            'Today focus: remove one friction point from submission flow.',
            'Prioritize clarity in updates. Clear signals help every builder ship faster.',
            'Small operational wins compound. One process fix can save many hours.',
            'Track quality and speed together: both matter for a healthy cohort.',
            'Celebrate one shipped project today to boost cohort energy.',
            'Short check-ins beat long meetings when builders are in sprint mode.'
        ];
    }, []);

    useEffect(() => {
        if (!isMobileView || !isTipsOpen) return undefined;
        const timer = setInterval(() => {
            setTipsIndex((prev) => (prev + 1) % adminTips.length);
        }, 5200);
        return () => clearInterval(timer);
    }, [isMobileView, isTipsOpen, adminTips.length]);

    useEffect(() => {
        if (!isTipsOpen) setTipsIndex(0);
    }, [isTipsOpen]);

    const rankedBuilders = useMemo(() => {
        const builderProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
        const allSubmissionsSorted = [...(submissions || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return builderProfiles
            .map((p) => {
                const logs = allSubmissionsSorted.filter((s) => s.user_id === p.id);
                const projects = logs.filter((s) => Boolean((s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '').trim())).length;
                const latest = logs[0] || null;
                const score = (projects * 100) + logs.length;
                return {
                    id: p.id,
                    name: p.full_name || 'Builder',
                    district: p.district || 'Unknown',
                    projects,
                    logs: logs.length,
                    latestProject: latest?.project_name || p.idea_title || '-',
                    latestAt: latest?.created_at || p?.updated_at || p?.created_at || null,
                    score
                };
            })
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.latestAt || 0) - new Date(a.latestAt || 0);
            });
    }, [profiles, submissions]);

    const topBuilders = useMemo(() => rankedBuilders.slice(0, 3), [rankedBuilders]);

    const selectedTopBuilder = useMemo(
        () => rankedBuilders.find((b) => b.id === selectedTopBuilderId) || null,
        [rankedBuilders, selectedTopBuilderId]
    );

    useEffect(() => {
        setDesktopBuilderVisibleCount(24);
    }, [rankedBuilders.length, adminSearch, adminFilter]);

    const mobileClassList = useMemo(() => {
        const sorted = [...(classes || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        return sorted
            .filter((c) => {
                if (classMobileFilter === 'active') return c.status === 'Active';
                if (classMobileFilter === 'ended') return c.status !== 'Active';
                return true;
            })
            .map((c) => {
                const presentCount = (attendance || []).filter((a) => a.class_id === c.id && a.status === 'Present').length;
                return { ...c, presentCount };
            });
    }, [classes, attendance, classMobileFilter]);

    const builderProfiles = useMemo(
        () => (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase())),
        [profiles]
    );

    const attendanceClass = useMemo(
        () => (classes || []).find((c) => c.id === attendanceClassId) || null,
        [classes, attendanceClassId]
    );

    const getProgramWindow = (item) => {
        const start = new Date(item?.date || Date.now());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    const endedPrograms = useMemo(() => {
        const now = new Date();
        return (classes || [])
            .filter((c) => String(c?.type || '').toLowerCase() === 'program')
            .filter((c) => getProgramWindow(c).end < now || String(c?.status || '').toLowerCase() === 'ended')
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [classes]);

    const getProjectUrl = (submission) =>
        submission?.submission_url || submission?.project_url || submission?.demo_url || submission?.github_url || '';

    const getEligibleBuildersForProgram = (programClass) => {
        if (!programClass?.id) return [];
        const { start, end } = getProgramWindow(programClass);
        const builderOnlyProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
        const projectSubs = (submissions || []).filter((s) => {
            if (!s?.user_id) return false;
            const created = new Date(s.created_at);
            return created >= start && created <= end && Boolean(getProjectUrl(s).trim());
        });
        const latestByBuilder = new Map();
        projectSubs.forEach((s) => {
            const prev = latestByBuilder.get(s.user_id);
            if (!prev || new Date(s.created_at) > new Date(prev.created_at)) latestByBuilder.set(s.user_id, s);
        });
        return builderOnlyProfiles
            .filter((p) => latestByBuilder.has(p.id))
            .map((p) => ({ profile: p, latestSubmission: latestByBuilder.get(p.id) }));
    };

    useEffect(() => {
        let ignore = false;
        const loadProgramCertificates = async () => {
            if (!certificateProgramId) {
                setProgramCertificates([]);
                return;
            }
            setIsProgramCertificatesLoading(true);
            const { data, error } = await supabase
                .from('builder_certificates')
                .select('*')
                .eq('program_class_id', certificateProgramId);
            if (ignore) return;
            if (error) {
                setProgramCertificates([]);
            } else {
                setProgramCertificates(data || []);
            }
            setIsProgramCertificatesLoading(false);
        };
        loadProgramCertificates();
        return () => {
            ignore = true;
        };
    }, [certificateProgramId]);

    useEffect(() => {
        let ignore = false;
        const loadAllCertificates = async () => {
            const { data, error } = await supabase
                .from('builder_certificates')
                .select('*')
                .order('issued_at', { ascending: false });
            if (ignore) return;
            if (error) {
                setAllCertificates([]);
                return;
            }
            setAllCertificates(data || []);
        };
        loadAllCertificates();
        return () => {
            ignore = true;
        };
    }, [profiles.length, submissions.length]);

    const generateCertificateSvg = ({ builderName, district, programTitle, appName, issuedAt }) => {
        const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const issued = new Date(issuedAt || Date.now()).toLocaleDateString();
        return `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed" />
      <stop offset="100%" stop-color="#fee2e2" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1400" height="990" fill="url(#bg)" />
  <rect x="40" y="40" width="1320" height="910" rx="24" fill="#ffffff" stroke="#111827" stroke-width="8" />
  <rect x="40" y="40" width="1320" height="32" fill="#CE1126" />
  <rect x="460" y="40" width="220" height="32" fill="#F7C948" />
  <text x="90" y="160" fill="#0f172a" font-size="58" font-weight="800" font-family="Arial, sans-serif">VIBESELANGOR CERTIFICATE</text>
  <text x="90" y="220" fill="#475569" font-size="28" font-family="Arial, sans-serif">This certifies that</text>
  <text x="90" y="300" fill="#111827" font-size="64" font-weight="700" font-family="Arial, sans-serif">${esc(builderName)}</text>
  <text x="90" y="360" fill="#334155" font-size="30" font-family="Arial, sans-serif">District: ${esc(district)} | App: ${esc(appName)}</text>
  <text x="90" y="420" fill="#334155" font-size="30" font-family="Arial, sans-serif">Completed: ${esc(programTitle)}</text>
  <text x="90" y="480" fill="#64748b" font-size="24" font-family="Arial, sans-serif">Issued on ${esc(issued)}</text>
  <line x1="90" y1="620" x2="520" y2="620" stroke="#111827" stroke-width="3"/>
  <text x="90" y="650" fill="#64748b" font-size="20" font-family="Arial, sans-serif">Program Lead</text>
  <line x1="820" y1="620" x2="1240" y2="620" stroke="#111827" stroke-width="3"/>
  <text x="820" y="650" fill="#64748b" font-size="20" font-family="Arial, sans-serif">KrackedDevs Selangor</text>
</svg>`.trim();
    };

    const uploadCertificateAsset = async ({ programClass, profile, latestSubmission, issuedAt }) => {
        const appName = latestSubmission?.project_name || profile?.idea_title || 'Builder Project';
        const svg = generateCertificateSvg({
            builderName: profile?.full_name || 'Builder',
            district: profile?.district || 'Selangor',
            programTitle: programClass?.title || 'Program',
            appName,
            issuedAt
        });
        const fileName = `${programClass.id}/${profile.id}-${Date.now()}.svg`;
        const bucket = 'builder_certificates';
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, new Blob([svg], { type: 'image/svg+xml' }), {
                cacheControl: '3600',
                upsert: true,
                contentType: 'image/svg+xml'
            });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data?.publicUrl || '';
    };

    const issueSingleCertificate = async ({ programClass, profile, latestSubmission, existingCertificate = null }) => {
        const issuedAt = new Date().toISOString();
        const certificateUrl = await uploadCertificateAsset({ programClass, profile, latestSubmission, issuedAt });
        const payload = {
            builder_id: profile.id,
            builder_name: profile.full_name || 'Builder',
            district: profile.district || 'Unknown',
            program_class_id: programClass.id,
            program_title: programClass.title || 'Program',
            app_name: latestSubmission?.project_name || profile?.idea_title || 'Builder Project',
            project_url: getProjectUrl(latestSubmission),
            certificate_url: certificateUrl,
            issued_at: issuedAt
        };
        if (existingCertificate?.id) {
            const { error } = await supabase.from('builder_certificates').update(payload).eq('id', existingCertificate.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('builder_certificates').insert([payload]);
            if (error) throw error;
        }
    };

    const handleIssueProgramCertificates = async (programClass) => {
        if (!programClass?.id) return;
        const eligibleRows = svcGetEligibleProgramBuilders({ programClass, profiles, submissions });
        if (!eligibleRows.length) {
            alert('No eligible builders found for this program window.');
            return;
        }
        setIssuingCertClassId(programClass.id);
        try {
            const { issuedCount, updatedCount, errors } = await svcIssueProgramCertificates({
                supabase,
                programClass,
                profiles,
                submissions,
                assetFormat: certificateAssetFormat
            });
            const failed = errors?.length || 0;
            alert(`Issued ${issuedCount}, updated ${updatedCount}, failed ${failed} certificate(s) for ${programClass.title}.`);
            if (certificateProgramId === programClass.id) {
                const { data: refreshed } = await supabase
                    .from('builder_certificates')
                    .select('*')
                    .eq('program_class_id', programClass.id);
                setProgramCertificates(refreshed || []);
            }
            const { data: certRows } = await supabase.from('builder_certificates').select('*').order('issued_at', { ascending: false });
            setAllCertificates(certRows || []);
        } catch (error) {
            const msg = String(error?.message || error || 'Unknown error');
            if (msg.toLowerCase().includes('bucket')) {
                alert("Certificate storage bucket missing. Create Supabase Storage bucket 'builder_certificates' (public) then retry.");
            } else if (msg.toLowerCase().includes('builder_certificates')) {
                alert("Certificates table missing. Run the SQL to create 'builder_certificates' first.");
            } else {
                alert(`Failed to issue certificates: ${msg}`);
            }
        } finally {
            setIssuingCertClassId(null);
        }
    };

    const certificateProgram = useMemo(
        () => (classes || []).find((c) => c.id === certificateProgramId) || null,
        [classes, certificateProgramId]
    );

    const certificateBuilderRows = useMemo(() => {
        if (!certificateProgram) return [];
        const eligible = svcGetEligibleProgramBuilders({ programClass: certificateProgram, profiles, submissions });
        const existingMap = new Map((programCertificates || []).map((row) => [row.builder_id, row]));
        return eligible.map((row) => ({
            ...row,
            certificate: existingMap.get(row.profile.id) || null
        }));
    }, [certificateProgram, programCertificates, profiles, submissions]);

    const latestEndedProgram = useMemo(() => endedPrograms[0] || null, [endedPrograms]);
    const eligibleUncertifiedRows = useMemo(() => {
        if (!latestEndedProgram) return [];
        const eligible = svcGetEligibleProgramBuilders({ programClass: latestEndedProgram, profiles, submissions });
        const issuedIds = new Set(
            (allCertificates || [])
                .filter((c) => c.program_class_id === latestEndedProgram.id)
                .map((c) => c.builder_id)
        );
        return eligible.filter((row) => !issuedIds.has(row.profile.id));
    }, [latestEndedProgram, profiles, submissions, allCertificates]);

    const sanitizeFileToken = (value, fallback = 'Unknown') => {
        const clean = String(value || fallback)
            .trim()
            .replace(/[/\\?%*:|"<>]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[.]+/g, '_');
        return clean || fallback;
    };

    const buildExportBaseName = (district, builderName, appName) => {
        const safeDistrict = sanitizeFileToken(district, 'Selangor');
        const safeBuilder = sanitizeFileToken(builderName, 'Builder');
        const safeApp = sanitizeFileToken(appName, 'App');
        return `${safeDistrict}.${safeBuilder}.${safeApp}`;
    };


    const handleExportCSV = () => {
        const builderOnlyProfiles = (filteredProfiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
        if (reportType === 'builder' && !reportBuilderId) {
            alert('Please select a builder for Builder report.');
            return;
        }
        const targetProfiles = reportType === 'builder'
            ? builderOnlyProfiles.filter((p) => p.id === reportBuilderId)
            : builderOnlyProfiles;
        if (!targetProfiles.length) {
            alert('No builder rows to export.');
            return;
        }
        const certMap = new Map((allCertificates || []).map((c) => [c.builder_id, c]));
        const classHeaders = (classes || []).map((c) => c.title);
        const headers = ['Builder Name', 'District', 'Role', 'Idea Title', 'Latest Project URL', 'Certificate Status', 'Certificate URL', ...classHeaders];
        const rows = targetProfiles.map(p => {
            const latest = [...(submissions || [])]
                .filter((s) => s.user_id === p.id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            const latestUrl = latest?.submission_url || latest?.project_url || latest?.demo_url || latest?.github_url || '';
            const cert = certMap.get(p.id);
            const row = [
                p.full_name,
                p.district,
                p.role || 'builder',
                p.idea_title || '',
                latestUrl,
                cert ? 'Issued' : 'Pending',
                cert?.certificate_url || ''
            ];
            (classes || []).forEach(c => {
                const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                row.push(isPresent ? 'Present' : 'Absent');
            });
            return row;
        });
        const exportBase = reportType === 'builder'
            ? (() => {
                const p = targetProfiles[0];
                const latest = [...(submissions || [])]
                    .filter((s) => s.user_id === p.id)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                return buildExportBaseName(
                    p?.district || 'Selangor',
                    p?.full_name || 'Builder',
                    latest?.project_name || p?.idea_title || 'App'
                );
            })()
            : buildExportBaseName('Selangor', 'Cohort', 'Builder_Report');
        downloadCSV([headers, ...rows], `${exportBase}.csv`);
    };

    const handleExportPDF = () => {
        if (reportType === 'builder' && !reportBuilderId) {
            alert('Please select a builder for Builder report.');
            return;
        }
        const now = new Date();
        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const getSubmissionUrl = (s) => s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '';
        const hasProjectUrl = (s) => Boolean(getSubmissionUrl(s).trim());
        const getImageUrl = (s) => {
            const url = getSubmissionUrl(s);
            const media = s?.screenshot_url || s?.image_url || '';
            if (media) return media;
            return /\.(png|jpe?g|gif|webp|svg)$/i.test(url) ? url : '';
        };

        if (reportType === 'builder') {
            const allBuilderProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
            const allSubmissionsSorted = [...(submissions || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const selectedBuilder = allBuilderProfiles.find((p) => p.id === reportBuilderId);
            if (!selectedBuilder) {
                alert('Selected builder not found.');
                return;
            }

            const ranking = allBuilderProfiles.map((p) => {
                const logs = allSubmissionsSorted.filter((s) => s.user_id === p.id);
                const projects = logs.filter((s) => hasProjectUrl(s)).length;
                const score = (projects * 100) + logs.length;
                const lastUpdate = logs[0]?.created_at || p?.updated_at || p?.created_at || null;
                return { id: p.id, score, lastUpdate };
            }).sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0);
            });

            const certMap = new Map((allCertificates || []).map((c) => [c.builder_id, c]));
            const selectedBuilderCertificate = certMap.get(selectedBuilder.id) || null;
            const selectedRank = ranking.findIndex((x) => x.id === selectedBuilder.id) + 1;
            const logs = allSubmissionsSorted.filter((s) => s.user_id === selectedBuilder.id);
            const latest = logs[0] || null;
            const latestUrl = getSubmissionUrl(latest);
            const imageFromSubmission = getImageUrl(latest);
            const profileImage = selectedBuilder?.profile_image_url || selectedBuilder?.avatar_url || selectedBuilder?.photo_url || selectedBuilder?.image_url || '';
            const visual = imageFromSubmission || profileImage;
            const stageIndex = logs.length > 0 ? Math.min(logs.length, SPRINT_MODULE_STEPS.length) : 0;
            const stageLabel = stageIndex === 0 ? 'Kickoff' : `Day ${stageIndex}`;
            const builderExportName = buildExportBaseName(
                selectedBuilder?.district || 'Selangor',
                selectedBuilder?.full_name || 'Builder',
                latest?.project_name || selectedBuilder?.idea_title || 'App'
            );

            const builderHtml = `
                <html>
                <head>
                    <title>${escapeHtml(builderExportName)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 18px; color: #0f172a; background: #ffffff; }
                        @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .preview-controls { display: none !important; } }
                        .preview-controls { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; gap: 8px; background: rgba(15,23,42,0.92); color: #fff; border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; }
                        .preview-btn { border: 1px solid rgba(255,255,255,0.32); background: #ef4444; color: #fff; border-radius: 8px; padding: 5px 9px; font-size: 10px; font-weight: 700; cursor: pointer; }
                        .hero { border: 3px solid #000; border-radius: 18px; box-shadow: 8px 8px 0 #000; background: linear-gradient(145deg, #CE1126 0%, #E11D48 50%, #F7C948 100%); color: #fff; padding: 16px; }
                        .hero-brand { display: flex; align-items: center; gap: 10px; }
                        .brand-logo { width: 34px; height: 34px; border-radius: 8px; border: 2px solid #000; background: #fff; object-fit: cover; }
                        .hero-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
                        .hero-title { margin: 0; font-size: 26px; line-height: 1.05; letter-spacing: 0.3px; }
                        .hero-sub { margin-top: 6px; font-size: 12px; opacity: 0.95; }
                        .rank-pill { border: 2px solid #000; background: #fff; color: #0f172a; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 800; white-space: nowrap; }
                        .meta-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
                        .meta-card { border: 2px solid #000; border-radius: 12px; box-shadow: 3px 3px 0 #000; background: rgba(255,255,255,0.92); color: #0f172a; padding: 8px; }
                        .meta-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.3px; }
                        .meta-value { margin-top: 3px; font-size: 15px; font-weight: 800; }
                        .section { margin-top: 14px; border: 2px solid #000; border-radius: 14px; box-shadow: 5px 5px 0 #000; background: rgba(255,255,255,0.95); padding: 12px; }
                        .section-title { margin: 0 0 8px; font-size: 14px; font-weight: 800; text-transform: uppercase; }
                        .details-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 12px; }
                        .value-row { margin: 6px 0; font-size: 12px; }
                        .value-row b { font-size: 11px; color: #64748b; text-transform: uppercase; }
                        .visual-box { border: 2px solid #000; border-radius: 10px; background: #fff; min-height: 170px; display: grid; place-items: center; overflow: hidden; }
                        .visual-box img { width: 100%; height: 100%; object-fit: cover; }
                        .project-card { border: 2px solid #000; border-radius: 12px; background: #fff8ef; padding: 10px; }
                        .project-name { margin: 0 0 6px; font-size: 17px; font-weight: 800; }
                        .project-copy { margin: 0; font-size: 12px; line-height: 1.5; color: #334155; }
                        .project-link { margin-top: 8px; font-size: 12px; word-break: break-all; }
                        .project-link a { color: #be123c; text-decoration: none; font-weight: 700; }
                        .builder-footer { margin-top: 14px; border: 2px solid #000; border-radius: 12px; background: rgba(255,255,255,0.92); box-shadow: 4px 4px 0 #000; padding: 9px 10px; font-size: 10px; display: flex; justify-content: space-between; gap: 10px; }
                    </style>
                </head>
                <body>
                    <div class="preview-controls">
                        <div style="font-size:11px;font-weight:700;">PDF Preview</div>
                        <div style="display:flex;gap:6px;">
                            <button class="preview-btn" onclick="window.print()">Export PDF</button>
                            <button class="preview-btn" style="background:#334155;" onclick="window.close()">Close</button>
                        </div>
                    </div>
                    <section class="hero">
                        <div class="hero-top">
                            <div class="hero-brand">
                                <div>
                                <h1 class="hero-title">VIBESELANGOR AMBASSADOR REPORT</h1>
                                <div class="hero-sub">${escapeHtml(selectedBuilder.full_name || 'Builder')} - Builder Spotlight</div>
                                </div>
                            </div>
                            <div class="rank-pill">Selangor Rank #${selectedRank || '-'}</div>
                        </div>
                        <div class="meta-grid">
                            <div class="meta-card"><div class="meta-label">District</div><div class="meta-value">${escapeHtml(selectedBuilder.district || '-')}</div></div>
                            <div class="meta-card"><div class="meta-label">Stage</div><div class="meta-value">${escapeHtml(stageLabel)}</div></div>
                            <div class="meta-card"><div class="meta-label">Project Logs</div><div class="meta-value">${logs.length}</div></div>
                            <div class="meta-card"><div class="meta-label">Certificate</div><div class="meta-value">${selectedBuilderCertificate ? 'Issued' : 'Pending'}</div></div>
                        </div>
                    </section>
                    <section class="section">
                        <h2 class="section-title">Builder Details</h2>
                        <div class="details-grid">
                            <div>
                                <div class="value-row"><b>Name</b><br/>${escapeHtml(selectedBuilder.full_name || '-')}</div>
                                <div class="value-row"><b>Idea</b><br/>${escapeHtml(selectedBuilder.idea_title || '-')}</div>
                                <div class="value-row"><b>Problem Statement</b><br/>${escapeHtml(selectedBuilder.problem_statement || '-')}</div>
                                <div class="value-row"><b>Latest Update</b><br/>${latest?.created_at ? escapeHtml(new Date(latest.created_at).toLocaleString()) : '-'}</div>
                            </div>
                            <div class="visual-box">
                                ${visual ? `<img src="${escapeHtml(visual)}" alt="Builder Visual" />` : '<div style="font-size:12px;color:#64748b;">No uploaded visual</div>'}
                            </div>
                        </div>
                    </section>
                    <section class="section">
                        <h2 class="section-title">Latest Project Summary</h2>
                        <div class="project-card">
                            <h3 class="project-name">${escapeHtml(latest?.project_name || 'No project submitted yet')}</h3>
                            <p class="project-copy">${escapeHtml(latest?.one_liner || latest?.progress_update || 'Latest project summary not available yet.')}</p>
                            <div class="project-link"><b>Project URL:</b> ${latestUrl ? `<a href="${escapeHtml(latestUrl)}" target="_blank" rel="noreferrer">${escapeHtml(latestUrl)}</a>` : '-'}</div>
                            <div class="project-link"><b>Certificate URL:</b> ${selectedBuilderCertificate?.certificate_url ? `<a href="${escapeHtml(selectedBuilderCertificate.certificate_url)}" target="_blank" rel="noreferrer">${escapeHtml(selectedBuilderCertificate.certificate_url)}</a>` : '-'}</div>
                        </div>
                    </section>
                    <div class="builder-footer">
                        <div>Contact: +60183104961</div>
                        <div>VIBESELANGOR AMBASSADOR REPORT</div>
                    </div>
                </body>
                </html>
            `;
            const builderWindow = window.open('', '_blank', 'width=1000,height=820');
            if (!builderWindow) return;
            builderWindow.document.write(builderHtml);
            builderWindow.document.close();
            builderWindow.focus();
            return;
        }

        const builderProfiles = (filteredProfiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
        const certMap = new Map((allCertificates || []).map((c) => [c.builder_id, c]));
        const normalizeDistrict = (value) => String(value || '').trim().toLowerCase();
        const seededDistricts = Array.from(
            new Set([
                ...(DISTRICT_OPTIONS || []),
                ...builderProfiles.map((p) => p?.district).filter(Boolean)
            ])
        );
        const districtStats = seededDistricts.map((district) => ({ district, builders: 0, ideas: 0, projects: 0 }));

        (submissionsInPeriod || []).forEach((s) => {
            const p = profiles.find((item) => item.id === s.user_id);
            const district = p?.district || s?.district || '';
            const hasProjectUrl = Boolean((s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '').trim());
            if (!hasProjectUrl) return;
            const row = districtStats.find((d) => normalizeDistrict(d.district) === normalizeDistrict(district));
            if (row) row.projects += 1;
        });

        builderProfiles.forEach((p) => {
            const district = p?.district || '';
            const row = districtStats.find((d) => normalizeDistrict(d.district) === normalizeDistrict(district));
            if (!row) return;
            row.builders += 1;
            if ((p?.idea_title || '').trim()) row.ideas += 1;
        });

        districtStats.sort((a, b) => b.builders - a.builders);

        const reportProfileRows = reportType === 'builder'
            ? reportProfilesSorted.filter((p) => p.id === reportBuilderId).slice(0, 1)
            : reportProfilesSorted.slice(0, 80);

        const rows = reportProfileRows.map((p, idx) => {
            const logs = submissionsInPeriod.filter((s) => s.user_id === p.id);
            const latest = logs[0];
            const hasProjectUrl = Boolean((latest?.submission_url || latest?.project_url || latest?.demo_url || latest?.github_url || '').trim());
            const finalUrl = latest?.submission_url || latest?.project_url || latest?.demo_url || latest?.github_url || '';
            const mediaUrl = latest?.screenshot_url || '';
            const imageUrl = mediaUrl || (/\.(png|jpe?g|gif|webp|svg)$/i.test(finalUrl) ? finalUrl : '');
            const stepIndex = logs.length > 0 ? Math.min(logs.length, SPRINT_MODULE_STEPS.length) : 0;
            const cert = certMap.get(p.id);
            return `
                <tr>
                    <td style="text-align:center;">${idx + 1}</td>
                    <td>${p.full_name || '-'}</td>
                    <td>${p.district || '-'}</td>
                    <td>${p.idea_title || '-'}</td>
                    <td style="text-align:center;">${stepIndex === 0 ? 'Kickoff' : `Day ${stepIndex}`}</td>
                    <td style="text-align:center;">${logs.length}</td>
                    <td style="text-align:center;">${hasProjectUrl ? 'Submitted' : 'Idea only'}</td>
                    <td>${hasProjectUrl ? `<a href="${finalUrl}" target="_blank" rel="noreferrer">${finalUrl}</a>` : '-'}</td>
                    <td>${imageUrl ? `<img src="${imageUrl}" alt="upload" style="width:64px;height:44px;object-fit:cover;border:1px solid #cbd5e1;border-radius:6px;" />` : '-'}</td>
                    <td>${latest ? new Date(latest.created_at).toLocaleString() : '-'}</td>
                    <td>${cert ? 'Issued' : 'Pending'}</td>
                </tr>
            `;
        }).join('');

        const projectsSubmittedInPeriod = submissionsInPeriod.filter((s) => Boolean((s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '').trim())).length;
        const completionRate = builderProfiles.length > 0
            ? Math.round((projectsSubmittedInPeriod / builderProfiles.length) * 100)
            : 0;
        const activeClassCount = (classes || []).filter((c) => c.status === 'Active').length;

        const selectedBuilder = profiles.find((p) => p.id === reportBuilderId) || null;
        const selectedBuilderLatestProject = selectedBuilder
            ? (submissionsInPeriod || []).filter((s) => s.user_id === selectedBuilder.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
            : null;
        const selectedBuilderRows = selectedBuilderLatestProject ? [selectedBuilderLatestProject].map((s, i) => {
            const finalUrl = s?.submission_url || s?.project_url || s?.demo_url || s?.github_url || '';
            const mediaUrl = s?.screenshot_url || '';
            const imageUrl = mediaUrl || (/\.(png|jpe?g|gif|webp|svg)$/i.test(finalUrl) ? finalUrl : '');
            return `
                <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td>${s?.project_name || 'Untitled Project'}</td>
                    <td>${s?.one_liner || '-'}</td>
                    <td>${finalUrl ? `<a href="${finalUrl}" target="_blank" rel="noreferrer">${finalUrl}</a>` : '-'}</td>
                    <td>${imageUrl ? `<img src="${imageUrl}" alt="upload" style="width:84px;height:56px;object-fit:cover;border:1px solid #cbd5e1;border-radius:6px;" />` : '-'}</td>
                    <td>${s?.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                </tr>
            `;
        }).join('') : '';

        const cohortExportName = buildExportBaseName('Selangor', 'Cohort', 'Builder_Report');
        const html = `
            <html>
            <head>
                <title>${escapeHtml(cohortExportName)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px 20px 84px; color: #111827; background: #ffffff; }
                    @media print {
                      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                      body { margin: 0; }
                      .preview-controls { display: none !important; }
                    }
                    .preview-controls { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; gap: 8px; background: rgba(15,23,42,0.92); color: #fff; border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; }
                    .preview-btn { border: 1px solid rgba(255,255,255,0.32); background: #ef4444; color: #fff; border-radius: 8px; padding: 5px 9px; font-size: 10px; font-weight: 700; cursor: pointer; }
                    .header-wrap { border: 4px solid #000; border-radius: 14px; box-shadow: 8px 8px 0 #000; background: #fff; margin-bottom: 16px; overflow: hidden; }
                    .header-main { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 14px; padding: 12px 14px 10px; align-items: start; }
                    .brand-row { display: flex; align-items: center; gap: 10px; }
                    .brand-logo { width: 34px; height: 34px; border-radius: 8px; border: 2px solid #000; background: #fff; object-fit: cover; }
                    .brand-title { margin: 0; font-size: 24px; line-height: 1.05; letter-spacing: 0.35px; text-transform: uppercase; font-weight: 900; }
                    .brand-sub { margin-top: 6px; font-size: 11px; color: #334155; font-weight: 700; }
                    .meta-chip-wrap { width: 236px; justify-self: end; }
                    .meta-chip-layout { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
                    .chip { border: 2px solid #000; background: #fff; padding: 4px 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: center; width: 100%; box-sizing: border-box; line-height: 1.15; }
                    .chip-span-6 { grid-column: span 6; }
                    .chip-span-3 { grid-column: span 3; }
                    .chip-span-2 { grid-column: span 2; }
                    .color-strip { height: 10px; display: grid; grid-template-columns: 5fr 2fr 1fr 2fr; border-top: 3px solid #000; }
                    .strip-red { background: #CE1126; }
                    .strip-yellow { background: #F7C948; }
                    .strip-white { background: #fff; }
                    .strip-red-dark { background: #991b1b; }
                    .sub { margin: 0 0 14px; color: #475569; font-size: 12px; }
                    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
                    .card { border: 2px solid #000; border-radius: 12px; padding: 9px; background: #f8fafc; box-shadow: 4px 4px 0 #000; }
                    .label { font-size: 11px; color: #64748b; }
                    .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
                    h3 { margin: 10px 0 6px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.2px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #cbd5e1; padding: 7px; font-size: 11px; text-align: left; vertical-align: top; }
                    th { background: #f1f5f9; font-weight: 700; }
                    .table-neo { border: 3px solid #000; box-shadow: 5px 5px 0 #000; background: #fff; }
                    .footer-wrap { margin-top: 16px; border: 3px solid #000; box-shadow: 6px 6px 0 #000; background: #fff; padding: 8px 10px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
                    .footer-center { font-weight: 900; text-transform: uppercase; }
                    .page-break { page-break-before: always; break-before: page; }
                    .footer-last { margin-top: 16px; border: 3px solid #000; box-shadow: 4px 4px 0 #000; background: #fff; padding: 8px 10px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
                </style>
            </head>
            <body>
                <div class="preview-controls">
                    <div style="font-size:11px;font-weight:700;">PDF Preview</div>
                    <div style="display:flex;gap:6px;">
                        <button class="preview-btn" onclick="window.print()">Export PDF</button>
                        <button class="preview-btn" style="background:#334155;" onclick="window.close()">Close</button>
                    </div>
                </div>
                <div class="header-wrap">
                    <div class="header-main">
                        <div class="brand-row">
                            <div>
                                <h1 class="brand-title">VIBESELANGOR AMBASSADOR REPORT</h1>
                                <div class="brand-sub">Built by _zarulijam • Support KrackedDevs Selangor Ambassador • Contact: +60183104961</div>
                            </div>
                        </div>
                        <div class="meta-chip-wrap">
                            <div class="meta-chip-layout">
                                <div class="chip chip-span-6">Date: ${now.toLocaleDateString()}</div>
                                <div class="chip chip-span-3">Cohort: Feb Sprint 2026</div>
                                <div class="chip chip-span-3">Period: ${reportBounds.label}</div>
                            </div>
                        </div>
                    </div>
                    <div class="color-strip">
                        <div class="strip-red"></div>
                        <div class="strip-yellow"></div>
                        <div class="strip-white"></div>
                        <div class="strip-red-dark"></div>
                    </div>
                </div>

                <div class="grid">
                    <div class="card"><div class="label">Builders</div><div class="value">${adminAnalytics.builders}</div></div>
                    <div class="card"><div class="label">Ideas Submitted</div><div class="value">${adminAnalytics.ideasSubmitted}</div></div>
                    <div class="card"><div class="label">Projects (${reportBounds.label})</div><div class="value">${projectsSubmittedInPeriod}</div></div>
                    <div class="card"><div class="label">Submissions (${reportBounds.label})</div><div class="value">${submissionsInPeriod.length}</div></div>
                </div>
                <div class="grid">
                    <div class="card"><div class="label">Completion Rate (${reportBounds.label})</div><div class="value">${completionRate}%</div></div>
                    <div class="card"><div class="label">Active Classes</div><div class="value">${activeClassCount}</div></div>
                    <div class="card"><div class="label">Districts Covered</div><div class="value">${adminAnalytics.topDistricts.length}</div></div>
                    <div class="card"><div class="label">Report Scope</div><div class="value">${filteredProfiles.length}</div></div>
                </div>
                <h3 style="margin: 8px 0;">Top Districts</h3>
                <p class="sub">${adminAnalytics.topDistricts.map(([d, c], i) => `${i + 1}. ${d} (${c})`).join(' | ') || 'N/A'}</p>
                ${reportType === 'builder' && selectedBuilder ? `
                <h3>Builder Details</h3>
                <table class="table-neo">
                    <thead><tr><th>Name</th><th>District</th><th>Idea</th><th>Problem Statement</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>${selectedBuilder.full_name || '-'}</td>
                            <td>${selectedBuilder.district || '-'}</td>
                            <td>${selectedBuilder.idea_title || '-'}</td>
                            <td>${selectedBuilder.problem_statement || '-'}</td>
                        </tr>
                    </tbody>
                </table>
                <h3>Latest Project Summary</h3>
                <table class="table-neo">
                    <thead><tr><th>#</th><th>Project</th><th>Summary</th><th>URL</th><th>Image</th><th>Updated</th></tr></thead>
                    <tbody>${selectedBuilderRows || '<tr><td colspan="6">No project rows in selected period.</td></tr>'}</tbody>
                </table>
                ` : ''}
                <h3>${reportType === 'builder' ? 'Builder Activity Snapshot' : 'Builder Snapshot'}</h3>
                <table class="table-neo">
                    <thead><tr><th>#</th><th>Builder</th><th>District</th><th>Idea</th><th>Stage</th><th>Logs</th><th>Project Status</th><th>Project URL</th><th>Image</th><th>Last Update</th><th>Certificate</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="11">No data</td></tr>'}</tbody>
                </table>

                <div class="page-break"></div>
                <h3>District Statistics</h3>
                <table class="table-neo">
                    <thead><tr><th>District</th><th>Builders</th><th>Ideas Submitted</th><th>Projects Submitted</th><th>Conversion</th></tr></thead>
                    <tbody>
                      ${districtStats.length === 0
                ? '<tr><td colspan="5">No district data</td></tr>'
                : districtStats.map((d) => `
                          <tr>
                            <td>${d.district}</td>
                            <td style="text-align:center;">${d.builders}</td>
                            <td style="text-align:center;">${d.ideas}</td>
                            <td style="text-align:center;">${d.projects}</td>
                            <td style="text-align:center;">${d.builders > 0 ? Math.round((d.projects / d.builders) * 100) : 0}%</td>
                          </tr>
                        `).join('')}
                    </tbody>
                </table>
                <h3 style="margin-top:14px;">Eligible But Not Certified</h3>
                <table class="table-neo">
                    <thead><tr><th>#</th><th>Builder</th><th>District</th><th>App</th><th>Program</th></tr></thead>
                    <tbody>
                      ${eligibleUncertifiedRows.length === 0
                ? '<tr><td colspan="5">None. All eligible builders are certified.</td></tr>'
                : eligibleUncertifiedRows.map((row, idx) => `
                          <tr>
                            <td style="text-align:center;">${idx + 1}</td>
                            <td>${row.profile?.full_name || '-'}</td>
                            <td>${row.profile?.district || '-'}</td>
                            <td>${row.latestSubmission?.project_name || row.profile?.idea_title || '-'}</td>
                            <td>${latestEndedProgram?.title || '-'}</td>
                          </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer-last">
                    <div>© 2026 VIBESELANGOR • Ambassador Ops Report</div>
                    <div class="footer-center">NO CODE. JUST VIBES.</div>
                    <div>Contact: +60183104961</div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };

    if (isMobileView) {
        const iosPrimaryBtn = {
            borderRadius: 14,
            border: '1px solid rgba(239,68,68,0.55)',
            background: 'rgba(239,68,68,0.92)',
            color: '#fff',
            boxShadow: '0 6px 14px rgba(239,68,68,0.25)',
            fontSize: 11,
            fontWeight: 600,
            padding: '9px 10px'
        };
        const iosSecondaryBtn = {
            borderRadius: 14,
            border: '1px solid rgba(15,23,42,0.24)',
            background: 'rgba(255,255,255,0.82)',
            color: '#0f172a',
            boxShadow: '0 5px 12px rgba(15,23,42,0.12)',
            fontSize: 11,
            fontWeight: 600,
            padding: '9px 10px'
        };
        const islandMessages = [
            `${adminAnalytics.builders} Builders • ${adminAnalytics.projectsSubmitted} Projects`,
            `Ideas: ${adminAnalytics.ideasSubmitted} • Today: ${adminAnalytics.todaysSubmissions}`,
            adminAnalytics.topDistricts[0] ? `Top: ${adminAnalytics.topDistricts[0][0]}` : 'Top district pending'
        ];

        return (
            <>
                <MobileFeatureShell title="Admin Dashboard" subtitle="Ops cockpit" islandContent={<span style={{ fontSize: 10, fontWeight: 600 }}>{islandMessages[islandIndex]}</span>} onNavigate={setPublicPage}>
                    <div style={{ display: 'grid', gap: 10 }}>
                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7 }}>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Builders</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{adminAnalytics.builders}</div></div>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Ideas</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{adminAnalytics.ideasSubmitted}</div></div>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Projects</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{adminAnalytics.projectsSubmitted}</div></div>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Today</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{adminAnalytics.todaysSubmissions}</div></div>
                        </div>
                    </section>

                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px', overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Top 3 Districts</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'hidden', paddingBottom: 2, minWidth: 0 }}>
                            {adminAnalytics.topDistricts.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No district data</div>}
                            {adminAnalytics.topDistricts.map(([district, count], idx) => (
                                <div
                                    key={`${district}-${idx}`}
                                    style={{
                                        fontSize: 11,
                                        color: '#334155',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        borderRadius: 999,
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {idx + 1}. {district} ({count})
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px', overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Top 3 Builders</div>
                        <div style={{ display: 'grid', gap: 6 }}>
                            {topBuilders.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No builder activity yet</div>}
                            <div style={{ display: 'flex', gap: 6, overflowX: 'hidden', flexWrap: 'wrap', paddingBottom: 2, minWidth: 0 }}>
                                {topBuilders.map((b, idx) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setSelectedTopBuilderId((prev) => (prev === b.id ? null : b.id))}
                                        style={{
                                            border: selectedTopBuilderId === b.id ? '1px solid rgba(239,68,68,0.5)' : '1px solid #e2e8f0',
                                            borderRadius: 10,
                                            background: selectedTopBuilderId === b.id ? 'rgba(254,242,242,0.95)' : '#f8fafc',
                                            padding: '7px 8px',
                                            textAlign: 'left',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: '#0f172a',
                                            whiteSpace: 'nowrap',
                                            minWidth: 0,
                                            flex: '1 1 30%',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {idx + 1}. {b.name}
                                    </button>
                                ))}
                            </div>
                            {selectedTopBuilder && (
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', padding: '7px 8px' }}>
                                    <div style={{ fontSize: 10, color: '#64748b' }}>{selectedTopBuilder.district} • {selectedTopBuilder.projects} projects • {selectedTopBuilder.logs} logs</div>
                                    <div style={{ marginTop: 2, fontSize: 10, color: '#475569' }}>{selectedTopBuilder.latestProject}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 7, marginBottom: 8, minWidth: 0 }}>
                            <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', padding: '8px 10px', fontSize: 11, minWidth: 0, boxSizing: 'border-box' }}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="range">Range</option>
                            </select>
                            {reportPeriod === 'range' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7, minWidth: 0 }}>
                                    <input type="date" value={reportRangeStart} onChange={(e) => setReportRangeStart(e.target.value)} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', padding: '8px 10px', fontSize: 11, minWidth: 0, boxSizing: 'border-box' }} />
                                    <input type="date" value={reportRangeEnd} onChange={(e) => setReportRangeEnd(e.target.value)} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', padding: '8px 10px', fontSize: 11, minWidth: 0, boxSizing: 'border-box' }} />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: reportType === 'builder' ? '1fr 1fr' : '1fr', gap: 7, marginBottom: 8, minWidth: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', minWidth: 0 }}>
                                <button
                                    type="button"
                                    onClick={() => setReportType('cohort')}
                                    style={{
                                        borderRadius: 12,
                                        border: reportType === 'cohort' ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(148,163,184,0.45)',
                                        background: reportType === 'cohort' ? 'rgba(239,68,68,0.92)' : '#fff',
                                        color: reportType === 'cohort' ? '#fff' : '#0f172a',
                                        padding: '8px 8px',
                                        fontSize: 11,
                                        fontWeight: 600
                                    }}
                                >
                                    Cohort
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportType('builder')}
                                    style={{
                                        borderRadius: 12,
                                        border: reportType === 'builder' ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(148,163,184,0.45)',
                                        background: reportType === 'builder' ? 'rgba(239,68,68,0.92)' : '#fff',
                                        color: reportType === 'builder' ? '#fff' : '#0f172a',
                                        padding: '8px 8px',
                                        fontSize: 11,
                                        fontWeight: 600
                                    }}
                                >
                                    Builder
                                </button>
                            </div>
                            {reportType === 'builder' && (
                                <select value={reportBuilderId} onChange={(e) => setReportBuilderId(e.target.value)} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', padding: '8px 10px', fontSize: 11, minWidth: 0, boxSizing: 'border-box' }}>
                                    <option value="">Select builder</option>
                                    {reportProfilesSorted.map((p) => (
                                        <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }} />
                    </section><section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Latest Builder Updates</div>
                        <div style={{ display: 'grid', gap: 7, maxHeight: 'calc(var(--app-vh, 100vh) - 560px)', overflowY: 'auto' }}>
                            {(submissions || []).slice(0, 8).map((item) => (
                                <button key={item.id} onClick={() => setSelectedDetailProfile(profiles.find((p) => p.id === item.user_id) || null)} style={{ textAlign: 'left', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.project_name || 'Untitled Project'}</div>
                                    <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>{item.builder_name || 'Builder'} • {new Date(item.created_at).toLocaleString()}</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <button className="btn btn-outline" onClick={handleSignOut} style={iosSecondaryBtn}>Logout</button>
                    </div>
                </MobileFeatureShell>
                <button
                    type="button"
                    aria-label={isTipsOpen ? 'Close tips' : 'Open tips'}
                    title={isTipsOpen ? 'Close tips' : 'Show tips'}
                    onClick={() => setIsTipsOpen((prev) => !prev)}
                    style={{
                        position: 'fixed',
                        right: 14,
                        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
                        width: isTipsOpen ? 250 : 38,
                        height: 38,
                        borderRadius: 999,
                        border: '1px solid rgba(239,68,68,0.5)',
                        background: 'rgba(239,68,68,0.92)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isTipsOpen ? 'space-between' : 'center',
                        padding: isTipsOpen ? '0 10px 0 11px' : 0,
                        boxShadow: '0 8px 20px rgba(239,68,68,0.32)',
                        zIndex: 50,
                        overflow: 'hidden',
                        transition: 'width 280ms cubic-bezier(.22,.61,.36,1), padding 220ms ease, background-color 180ms ease'
                    }}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <Sparkles size={16} />
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 600,
                                lineHeight: 1.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: isTipsOpen ? 188 : 0,
                                opacity: isTipsOpen ? 1 : 0,
                                transform: isTipsOpen ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'opacity 200ms ease 70ms, transform 240ms ease, max-width 260ms ease'
                            }}
                        >
                            {adminTips[tipsIndex]}
                        </span>
                    </span>
                    <span
                        aria-hidden="true"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: isTipsOpen ? 16 : 0,
                            opacity: isTipsOpen ? 0.9 : 0,
                            transform: isTipsOpen ? 'scale(1)' : 'scale(0.75)',
                            transition: 'opacity 170ms ease 100ms, transform 240ms ease, width 240ms ease'
                        }}
                    >
                        <X size={13} />
                    </span>
                </button>
                <button
                    type="button"
                    aria-label="Manage Class"
                    title="Manage Class"
                    onClick={() => setIsClassManagerOpen(true)}
                    style={{
                        position: 'fixed',
                        right: 14,
                        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 182px)',
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        border: '1px solid rgba(15,23,42,0.28)',
                        background: 'rgba(255,255,255,0.9)',
                        color: '#0f172a',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 8px 20px rgba(15,23,42,0.18)',
                        zIndex: 50
                    }}
                >
                    <Calendar size={16} />
                </button>
                <div
                    style={{
                        position: 'fixed',
                        right: 14,
                        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 136px)',
                        width: isExportOpen ? 170 : 38,
                        height: 38,
                        borderRadius: 999,
                        border: '1px solid rgba(15,23,42,0.28)',
                        background: 'rgba(255,255,255,0.9)',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isExportOpen ? 'space-between' : 'center',
                        padding: isExportOpen ? '0 8px' : 0,
                        boxShadow: '0 8px 20px rgba(15,23,42,0.18)',
                        zIndex: 50,
                        overflow: 'hidden',
                        transition: 'width 260ms cubic-bezier(.22,.61,.36,1), padding 200ms ease'
                    }}
                >
                    <button
                        type="button"
                        aria-label={isExportOpen ? 'Close export options' : 'Open export options'}
                        title={isExportOpen ? 'Close export menu' : 'Open export menu'}
                        onClick={() => setIsExportOpen((prev) => !prev)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#0f172a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isExportOpen ? 7 : 0,
                            width: isExportOpen ? 70 : 38,
                            height: 38,
                            padding: 0,
                            margin: 0,
                            lineHeight: 1,
                            cursor: 'pointer'
                        }}
                    >
                        <FileText size={16} />
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: isExportOpen ? 46 : 0,
                                opacity: isExportOpen ? 1 : 0,
                                transform: isExportOpen ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'opacity 180ms ease 70ms, transform 220ms ease, max-width 240ms ease'
                            }}
                        >
                            Export
                        </span>
                    </button>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            maxWidth: isExportOpen ? 92 : 0,
                            opacity: isExportOpen ? 1 : 0,
                            transform: isExportOpen ? 'translateX(0)' : 'translateX(10px)',
                            transition: 'opacity 180ms ease 90ms, transform 240ms ease, max-width 240ms ease',
                            overflow: 'hidden',
                            pointerEvents: isExportOpen ? 'auto' : 'none'
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            style={{
                                borderRadius: 999,
                                border: '1px solid rgba(148,163,184,0.6)',
                                background: '#fff',
                                color: '#0f172a',
                                fontSize: 9,
                                fontWeight: 600,
                                padding: '3px 8px',
                                lineHeight: 1.2
                            }}
                        >
                            CSV
                        </button>
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            style={{
                                borderRadius: 999,
                                border: '1px solid rgba(239,68,68,0.5)',
                                background: 'rgba(239,68,68,0.92)',
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 600,
                                padding: '3px 8px',
                                lineHeight: 1.2
                            }}
                        >
                            PDF
                        </button>
                    </span>
                </div>
                {isClassManagerOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15,23,42,0.48)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 70,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 14
                        }}
                        onClick={() => setIsClassManagerOpen(false)}
                    >
                        <div
                            style={{
                                width: '100%',
                                maxWidth: 420,
                                maxHeight: '78vh',
                                overflow: 'auto',
                                borderRadius: 18,
                                border: '1px solid rgba(148,163,184,0.42)',
                                background: 'rgba(255,255,255,0.94)',
                                boxShadow: '0 22px 48px rgba(15,23,42,0.3)',
                                padding: '12px 12px 10px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Class Management</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddClassModalOpen(true)}
                                        style={{ ...iosSecondaryBtn, padding: '6px 9px', fontSize: 10 }}
                                    >
                                        + Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsClassManagerOpen(false)}
                                        style={{ ...iosSecondaryBtn, padding: '6px 9px', fontSize: 10 }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                {[
                                    { id: 'all', label: `All (${(classes || []).length})` },
                                    { id: 'active', label: `Active (${(classes || []).filter((c) => c.status === 'Active').length})` },
                                    { id: 'ended', label: `Ended (${(classes || []).filter((c) => c.status !== 'Active').length})` }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setClassMobileFilter(option.id)}
                                        style={{
                                            borderRadius: 999,
                                            border: classMobileFilter === option.id ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(148,163,184,0.45)',
                                            background: classMobileFilter === option.id ? 'rgba(239,68,68,0.92)' : '#fff',
                                            color: classMobileFilter === option.id ? '#fff' : '#0f172a',
                                            padding: '5px 8px',
                                            fontSize: 10,
                                            fontWeight: 600
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gap: 7 }}>
                                {mobileClassList.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No classes in this filter.</div>}
                                {mobileClassList.map((c) => (
                                    <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: '7px 8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{c.title}</div>
                                                <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>
                                                    {new Date(c.date).toLocaleDateString()} • {c.time} • {c.presentCount} present
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: 9,
                                                fontWeight: 700,
                                                borderRadius: 999,
                                                padding: '3px 7px',
                                                border: '1px solid rgba(15,23,42,0.2)',
                                                background: c.status === 'Active' ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.14)',
                                                color: c.status === 'Active' ? '#be123c' : '#475569'
                                            }}>
                                                {c.status === 'Active' ? 'Active' : 'Ended'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleClassStatus(c.id, c.status)}
                                                style={{ ...iosPrimaryBtn, padding: '6px 9px', fontSize: 10 }}
                                            >
                                                {c.status === 'Active' ? 'End' : 'Start'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAttendanceClassId(c.id)}
                                                style={{ ...iosSecondaryBtn, padding: '6px 9px', fontSize: 10 }}
                                            >
                                                Attendance
                                            </button>
                                            {String(c?.type || '').toLowerCase() === 'program' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleIssueProgramCertificates(c)}
                                                    disabled={issuingCertClassId === c.id}
                                                    style={{ ...iosSecondaryBtn, padding: '6px 9px', fontSize: 10 }}
                                                >
                                                    {issuingCertClassId === c.id ? 'Issuing...' : 'Issue Cert'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {attendanceClass && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15,23,42,0.52)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 75,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 14
                        }}
                        onClick={() => setAttendanceClassId(null)}
                    >
                        <div
                            style={{
                                width: '100%',
                                maxWidth: 420,
                                maxHeight: '78vh',
                                overflow: 'auto',
                                borderRadius: 18,
                                border: '1px solid rgba(148,163,184,0.42)',
                                background: 'rgba(255,255,255,0.95)',
                                boxShadow: '0 22px 48px rgba(15,23,42,0.3)',
                                padding: '12px 12px 10px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Take Attendance</div>
                                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{attendanceClass.title}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAttendanceClassId(null)}
                                    style={{ ...iosSecondaryBtn, padding: '6px 9px', fontSize: 10 }}
                                >
                                    Close
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: 7 }}>
                                {builderProfiles.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No builders found.</div>}
                                {builderProfiles.map((p) => {
                                    const isPresent = attendance.some((a) => a.profile_id === p.id && a.class_id === attendanceClass.id && a.status === 'Present');
                                    return (
                                        <div key={`${attendanceClass.id}-${p.id}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: '7px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || 'Builder'}</div>
                                                <div style={{ fontSize: 10, color: '#64748b' }}>{p.district || 'Unknown'}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAttendance(p.id, attendanceClass.id)}
                                                style={{
                                                    borderRadius: 999,
                                                    border: isPresent ? '1px solid rgba(34,197,94,0.6)' : '1px solid rgba(148,163,184,0.5)',
                                                    background: isPresent ? 'rgba(34,197,94,0.14)' : '#fff',
                                                    color: isPresent ? '#15803d' : '#334155',
                                                    padding: '5px 10px',
                                                    fontSize: 10,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {isPresent ? 'Present' : 'Mark Present'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}            </>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>Admin Portal</h2>
                    <p className="text-sub" style={{ fontSize: '13px' }}>Manage cohorts, set class schedules, and review builder progress.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-red" style={{ padding: '8px', borderRadius: '10px', width: '36px', height: '36px' }} onClick={() => setIsAddClassModalOpen(true)} title="Manage Class">
                        <Calendar size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleSignOut}><LogOut size={14} /> Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '2px solid #eee' }}>
                <button onClick={() => setAdminTab('overview')} style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: adminTab === 'overview' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: adminTab === 'overview' ? 'black' : '#888', transition: 'all 0.2s' }}>OVERVIEW</button>
                <button onClick={() => setAdminTab('attendance')} style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: adminTab === 'attendance' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: adminTab === 'attendance' ? 'black' : '#888', transition: 'all 0.2s' }}>ATTENDANCE</button>
                <button onClick={() => setAdminTab('reports')} style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: adminTab === 'reports' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: adminTab === 'reports' ? 'black' : '#888', transition: 'all 0.2s' }}>REPORTS</button>
            </div>

            {adminTab === 'reports' && <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.66, textTransform: 'uppercase' }}>Report Period</div>
                <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} style={{ padding: '7px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', background: 'white' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="range">Range</option>
                </select>
                {reportPeriod === 'range' && (
                    <>
                        <input type="date" value={reportRangeStart} onChange={(e) => setReportRangeStart(e.target.value)} style={{ padding: '7px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', background: 'white' }} />
                        <input type="date" value={reportRangeEnd} onChange={(e) => setReportRangeEnd(e.target.value)} style={{ padding: '7px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', background: 'white' }} />
                    </>
                )}
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.66, textTransform: 'uppercase', marginLeft: 8 }}>Report Type</div>
                <div style={{ display: 'inline-flex', gap: 6, border: '2px solid black', borderRadius: 10, padding: 4, background: '#fff' }}>
                    <button
                        type="button"
                        onClick={() => setReportType('cohort')}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 7,
                            border: '1px solid black',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: reportType === 'cohort' ? '#CE1126' : '#fff',
                            color: reportType === 'cohort' ? '#fff' : '#111'
                        }}
                    >
                        Cohort
                    </button>
                    <button
                        type="button"
                        onClick={() => setReportType('builder')}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 7,
                            border: '1px solid black',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: reportType === 'builder' ? '#CE1126' : '#fff',
                            color: reportType === 'builder' ? '#fff' : '#111'
                        }}
                    >
                        Builder
                    </button>
                </div>
                {reportType === 'builder' && (
                    <select value={reportBuilderId} onChange={(e) => setReportBuilderId(e.target.value)} style={{ padding: '7px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', background: 'white', minWidth: 220 }}>
                        <option value="">Select Builder</option>
                        {reportProfilesSorted.map((p) => (
                            <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
                        ))}
                    </select>
                )}
                <div style={{ fontSize: 11, opacity: 0.62 }}>Current: {reportBounds.label}</div>
            </div>}

            {adminTab === 'overview' ? (
                <div className="grid-12">
                    <div style={{ gridColumn: 'span 12', marginBottom: '16px' }}>
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '4px 4px 0px black', padding: '12px 16px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Selangor Builders Nama</h3>
                            {rankedBuilders.length === 0 ? (
                                <p style={{ opacity: 0.6, fontSize: '13px' }}>No builder activity yet.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: 10 }}>
                                    <div
                                        className="scroll-box"
                                        style={{ maxHeight: '220px', border: '2px solid black', borderRadius: 10, padding: 8, background: '#fff' }}
                                        onScroll={(event) => {
                                            const el = event.currentTarget;
                                            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                                                setDesktopBuilderVisibleCount((prev) => Math.min(prev + 24, rankedBuilders.length));
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'grid', gap: 8 }}>
                                            {rankedBuilders.slice(0, desktopBuilderVisibleCount).map((b, idx) => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => setSelectedTopBuilderId((prev) => (prev === b.id ? null : b.id))}
                                                    style={{
                                                        border: '2px solid black',
                                                        borderRadius: 10,
                                                        padding: '10px',
                                                        background: selectedTopBuilderId === b.id ? '#fff1f2' : '#fff',
                                                        textAlign: 'left',
                                                        fontSize: '13px',
                                                        fontWeight: 800,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: 10
                                                    }}
                                                >
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idx + 1}. {b.name}</span>
                                                    <span style={{ fontSize: 11, opacity: 0.72, whiteSpace: 'nowrap' }}>{b.district}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedTopBuilder && (
                                        <div style={{ border: '2px solid black', borderRadius: 10, padding: '10px', background: '#fff' }}>
                                            <div style={{ marginTop: 2, fontSize: '12px', opacity: 0.82 }}>{selectedTopBuilder.district}</div>
                                            <div style={{ marginTop: 4, fontSize: '12px' }}>Projects: <b>{selectedTopBuilder.projects}</b> • Logs: <b>{selectedTopBuilder.logs}</b></div>
                                            <div style={{ marginTop: 6, fontSize: '12px', opacity: 0.86 }}>{truncateText(selectedTopBuilder.latestProject, 84)}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
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

            ) : adminTab === 'attendance' ? (
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '24px' }}>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '20px', margin: 0 }}>Attendance Matrix</h3>
                        </div>
                        <div style={{ border: '2px solid black', borderRadius: 12, background: '#fff', padding: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10 }}>Program Certificates</div>
                            {endedPrograms.length === 0 ? (
                                <div style={{ fontSize: 12, opacity: 0.7 }}>No completed program found yet.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {endedPrograms.map((program) => (
                                        <div key={program.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 800 }}>{program.title}</div>
                                                <div style={{ fontSize: 10, opacity: 0.6 }}>{new Date(program.date).toLocaleDateString()} to {new Date(getProgramWindow(program).end).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 10px', fontSize: 11 }}
                                                    onClick={() => setCertificateProgramId(program.id)}
                                                >
                                                    <Eye size={12} /> Manage
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 10px', fontSize: 11 }}
                                                    onClick={() => handleIssueProgramCertificates(program)}
                                                    disabled={issuingCertClassId === program.id}
                                                >
                                                    {issuingCertClassId === program.id ? 'Issuing...' : 'Issue All'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="scroll-box" style={{ maxHeight: '600px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                                    <th style={{ padding: '12px', fontSize: '12px', position: 'sticky', left: 0, background: 'white', zIndex: 2 }}>BUILDER</th>
                                    {classes.map(c => (
                                        <th key={c.id} style={{ padding: '12px', fontSize: '11px', whiteSpace: 'nowrap', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '120px' }}>
                                            {c.title} <br /> <span style={{ opacity: 0.5, fontSize: '9px' }}>{new Date(c.date).toLocaleDateString()}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProfiles.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: '800', fontSize: '13px', position: 'sticky', left: 0, background: 'white', borderRight: '1px solid #eee' }}>
                                            {p.full_name}
                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>{p.district}</div>
                                        </td>
                                        {classes.map(c => {
                                            const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                                            return (
                                                <td key={c.id} style={{ textAlign: 'center', padding: '8px', background: isPresent ? '#f0fff4' : 'transparent' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAttendance(p.id, c.id)}
                                                        style={{
                                                            border: '1.5px solid black',
                                                            borderRadius: 6,
                                                            width: 28,
                                                            height: 24,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: isPresent ? '#22c55e' : '#fff',
                                                            color: isPresent ? '#fff' : '#334155',
                                                            fontWeight: 900,
                                                            cursor: 'pointer'
                                                        }}
                                                        title={isPresent ? 'Mark Absent' : 'Mark Present'}
                                                    >
                                                        {isPresent ? 'P' : 'A'}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: '16px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '20px', margin: 0 }}>Generate Reports</h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12 }} onClick={handleExportCSV}>
                                EXPORT CSV
                            </button>
                            <button className="btn btn-red" style={{ padding: '8px 14px', fontSize: 12 }} onClick={handleExportPDF}>
                                PREVIEW PDF
                            </button>
                        </div>
                    </div>
                    <div className="scroll-box" style={{ maxHeight: '560px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                                    <th style={{ padding: 12, fontSize: 12 }}>Builder</th>
                                    <th style={{ padding: 12, fontSize: 12 }}>District</th>
                                    <th style={{ padding: 12, fontSize: 12 }}>Idea</th>
                                    <th style={{ padding: 12, fontSize: 12 }}>Latest Project URL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportProfilesSorted.map((p) => {
                                    const latest = [...(submissionsInPeriod || [])]
                                        .filter((s) => s.user_id === p.id)
                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                                    const latestUrl = latest?.submission_url || latest?.project_url || latest?.demo_url || latest?.github_url || '-';
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 12, fontWeight: 800 }}>{p.full_name || 'Builder'}</td>
                                            <td style={{ padding: 12 }}>{p.district || '-'}</td>
                                            <td style={{ padding: 12 }}>{truncateText(p.idea_title || '-', 44)}</td>
                                            <td style={{ padding: 12 }}>
                                                {latestUrl === '-' ? (
                                                    <span style={{ opacity: 0.6 }}>-</span>
                                                ) : (
                                                    <a href={latestUrl} target="_blank" rel="noreferrer" style={{ color: '#CE1126', textDecoration: 'none', fontWeight: 700 }}>
                                                        {truncateText(latestUrl, 68)}
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {certificateProgram && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.56)', zIndex: 1800, display: 'grid', placeItems: 'center', padding: 18 }}
                    onClick={() => setCertificateProgramId(null)}
                >
                    <div
                        className="neo-card"
                        style={{ width: 'min(980px, 96vw)', maxHeight: '84vh', overflow: 'auto', border: '3px solid black', boxShadow: '10px 10px 0 black', background: '#fff', padding: 14 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 900 }}>Certificate Manager</div>
                                <div style={{ fontSize: 11, opacity: 0.7 }}>{certificateProgram.title}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                    value={certificateAssetFormat}
                                    onChange={(e) => setCertificateAssetFormat(e.target.value)}
                                    style={{ border: '2px solid black', borderRadius: 8, padding: '6px 8px', fontSize: 11, background: '#fff' }}
                                >
                                    <option value="both">Issue: PDF + PNG</option>
                                    <option value="pdf">Issue: PDF only</option>
                                    <option value="png">Issue: PNG only</option>
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '6px 10px', fontSize: 11 }}
                                    onClick={() => handleIssueProgramCertificates(certificateProgram)}
                                    disabled={issuingCertClassId === certificateProgram.id}
                                >
                                    {issuingCertClassId === certificateProgram.id ? 'Issuing...' : 'Issue/Update All'}
                                </button>
                                <button type="button" className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => setCertificateProgramId(null)}>Close</button>
                            </div>
                        </div>
                        <div style={{ border: '2px solid black', borderRadius: 10, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid black', background: '#f8fafc', textAlign: 'left' }}>
                                        <th style={{ padding: 10, fontSize: 11 }}>Builder</th>
                                        <th style={{ padding: 10, fontSize: 11 }}>App</th>
                                        <th style={{ padding: 10, fontSize: 11 }}>Status</th>
                                        <th style={{ padding: 10, fontSize: 11 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isProgramCertificatesLoading && (
                                        <tr><td colSpan={4} style={{ padding: 12, fontSize: 12 }}>Loading certificate rows...</td></tr>
                                    )}
                                    {!isProgramCertificatesLoading && certificateBuilderRows.length === 0 && (
                                        <tr><td colSpan={4} style={{ padding: 12, fontSize: 12 }}>No eligible builders for this program window.</td></tr>
                                    )}
                                    {!isProgramCertificatesLoading && certificateBuilderRows.map((row) => (
                                        <tr key={row.profile.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: 10 }}>
                                                <div style={{ fontSize: 12, fontWeight: 800 }}>{row.profile.full_name || 'Builder'}</div>
                                                <div style={{ fontSize: 10, opacity: 0.66 }}>{row.profile.district || '-'}</div>
                                            </td>
                                            <td style={{ padding: 10, fontSize: 12 }}>{row.latestSubmission?.project_name || row.profile.idea_title || '-'}</td>
                                            <td style={{ padding: 10, fontSize: 11 }}>
                                                {row.certificate ? (
                                                    <span className="pill pill-teal" style={{ fontSize: 9 }}>Issued</span>
                                                ) : (
                                                    <span className="pill" style={{ fontSize: 9 }}>Pending</span>
                                                )}
                                            </td>
                                            <td style={{ padding: 10 }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        style={{ padding: '5px 8px', fontSize: 10 }}
                                                        onClick={() => setCertificatePreview({
                                                            programClass: certificateProgram,
                                                            profile: row.profile,
                                                            latestSubmission: row.latestSubmission,
                                                            certificate: row.certificate || null
                                                        })}
                                                    >
                                                        <Eye size={11} /> Preview
                                                    </button>
                                                    {row.certificate?.certificate_url && (
                                                        <>
                                                            <a
                                                                href={deriveCertificateAssetUrl(row.certificate.certificate_url, 'pdf') || row.certificate.certificate_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn btn-outline"
                                                                style={{ padding: '5px 8px', fontSize: 10, textDecoration: 'none' }}
                                                            >
                                                                <ExternalLink size={11} /> PDF
                                                            </a>
                                                            <a
                                                                href={deriveCertificateAssetUrl(row.certificate.certificate_url, 'png') || row.certificate.certificate_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn btn-outline"
                                                                style={{ padding: '5px 8px', fontSize: 10, textDecoration: 'none' }}
                                                            >
                                                                <ExternalLink size={11} /> PNG
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {certificatePreview && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.66)', zIndex: 1900, display: 'grid', placeItems: 'center', padding: 18 }}
                    onClick={() => setCertificatePreview(null)}
                >
                    <div
                        className="neo-card"
                        style={{ width: 'min(900px, 96vw)', border: '3px solid black', boxShadow: '10px 10px 0 black', background: '#fff', padding: 14 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>Certificate Preview</div>
                            <button type="button" className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => setCertificatePreview(null)}>Close</button>
                        </div>
                        <div style={{ border: '2px solid black', borderRadius: 12, padding: 14, background: 'linear-gradient(135deg, #fff7ed, #fee2e2)' }}>
                            <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.05 }}>VIBESELANGOR CERTIFICATE</div>
                            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.72 }}>This certifies that</div>
                            <div style={{ marginTop: 6, fontSize: 30, fontWeight: 900 }}>{certificatePreview.profile.full_name || 'Builder'}</div>
                            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.86 }}>
                                District: {certificatePreview.profile.district || '-'} | App: {certificatePreview.latestSubmission?.project_name || certificatePreview.profile.idea_title || '-'}
                            </div>
                            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.86 }}>
                                Completed: {certificatePreview.programClass.title}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                            <button
                                type="button"
                                className="btn btn-red"
                                style={{ padding: '7px 11px', fontSize: 11 }}
                                onClick={async () => {
                                    try {
                                        const exists = Boolean(certificatePreview.certificate);
                                        const { issuedCount, updatedCount, errors } = await svcIssueProgramCertificates({
                                            supabase,
                                            programClass: certificatePreview.programClass,
                                            profiles,
                                            submissions,
                                            targetBuilderId: certificatePreview.profile.id,
                                            assetFormat: certificateAssetFormat
                                        });
                                        const { data: refreshed } = await supabase
                                            .from('builder_certificates')
                                            .select('*')
                                            .eq('program_class_id', certificatePreview.programClass.id);
                                        setProgramCertificates(refreshed || []);
                                        const { data: allRefreshed } = await supabase
                                            .from('builder_certificates')
                                            .select('*')
                                            .order('issued_at', { ascending: false });
                                        setAllCertificates(allRefreshed || []);
                                        setCertificatePreview(null);
                                        alert(exists
                                            ? `Certificate regenerated (${updatedCount || issuedCount}), failed ${errors?.length || 0}.`
                                            : `Certificate issued (${issuedCount || updatedCount}), failed ${errors?.length || 0}.`);
                                    } catch (error) {
                                        alert(`Failed to issue certificate: ${String(error?.message || error)}`);
                                    }
                                }}
                            >
                                <Award size={12} /> {certificatePreview.certificate ? 'Regenerate Certificate' : 'Issue Certificate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};






