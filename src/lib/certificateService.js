export const sanitizeFileToken = (value, fallback = 'Unknown') => {
    const ascii = String(value || fallback)
        .normalize('NFKD')
        .replace(/[^\x00-\x7F]/g, '');
    const clean = ascii
        .trim()
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/[\s.]+/g, '_')
        .replace(/[^A-Za-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    return clean || fallback;
};

export const buildCertificateBaseName = (cohort, builderName, appName) => {
    const safeCohort = sanitizeFileToken(cohort, 'Cohort');
    const safeBuilder = sanitizeFileToken(builderName, 'Builder');
    const safeApp = sanitizeFileToken(appName, 'App');
    return `${safeCohort}.${safeBuilder}.${safeApp}`;
};

export const getProjectUrlFromSubmission = (submission) =>
    submission?.submission_url || submission?.project_url || submission?.demo_url || submission?.github_url || '';

const resolveAssetFormat = (assetFormat) => {
    if (assetFormat === 'pdf') return { pdf: true, png: false, svg: false };
    if (assetFormat === 'png') return { pdf: false, png: true, svg: false };
    return { pdf: true, png: true, svg: true };
};

export const deriveCertificateAssetUrl = (certificateUrl, ext = 'pdf') => {
    const url = String(certificateUrl || '').trim();
    if (!url) return '';
    if (/\.(pdf|png|svg)(\?|#|$)/i.test(url)) {
        return url.replace(/\.(pdf|png|svg)(?=($|\?|#))/i, `.${ext}`);
    }
    return '';
};

const getProgramWindow = (programClass) => {
    const start = new Date(programClass?.date || Date.now());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

export const isValidProjectUrl = (value) => {
    const url = String(value || '').trim();
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

export const getEligibleProgramBuilders = ({ programClass, profiles = [], submissions = [] }) => {
    if (!programClass?.id) return [];
    const { start, end } = getProgramWindow(programClass);
    const builderOnlyProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
    const projectSubs = (submissions || []).filter((s) => {
        if (!s?.user_id) return false;
        const created = new Date(s.created_at);
        return created >= start && created <= end && Boolean(getProjectUrlFromSubmission(s).trim());
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

export const getProgramCertificateCandidates = ({
    programClass,
    profiles = [],
    submissions = [],
    existingCertificates = []
}) => {
    if (!programClass?.id) return [];
    const { start, end } = getProgramWindow(programClass);
    const builderOnlyProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
    const subsByBuilder = new Map();
    (submissions || []).forEach((submission) => {
        if (!submission?.user_id) return;
        const list = subsByBuilder.get(submission.user_id) || [];
        list.push(submission);
        subsByBuilder.set(submission.user_id, list);
    });
    const existingByBuilder = new Map(
        (existingCertificates || [])
            .filter((cert) => cert?.program_class_id === programClass.id && cert?.builder_id)
            .map((cert) => [cert.builder_id, cert])
    );

    return builderOnlyProfiles.map((profile) => {
        const userSubs = (subsByBuilder.get(profile.id) || []).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const inWindowSubs = userSubs.filter((submission) => {
            const createdAt = new Date(submission.created_at || 0);
            return createdAt >= start && createdAt <= end;
        });
        const latestInWindow = inWindowSubs[0] || null;
        const projectUrl = getProjectUrlFromSubmission(latestInWindow);
        let eligibility_status = 'eligible';
        let ineligibility_reason = null;

        if (!latestInWindow && userSubs.length > 0) {
            eligibility_status = 'ineligible';
            ineligibility_reason = 'outside_window';
        } else if (!latestInWindow) {
            eligibility_status = 'ineligible';
            ineligibility_reason = 'no_submission';
        } else if (!isValidProjectUrl(projectUrl)) {
            eligibility_status = 'ineligible';
            ineligibility_reason = 'missing_url';
        }

        const existingCertificate = existingByBuilder.get(profile.id) || null;
        return {
            builder_id: profile.id,
            full_name: profile.full_name || 'Builder',
            district: profile.district || 'Unknown',
            program_class_id: programClass.id,
            program_title: programClass.title || 'Program',
            latest_submission_at: latestInWindow?.created_at || null,
            project_url: projectUrl || '',
            app_name: latestInWindow?.project_name || profile.idea_title || 'Builder Project',
            has_certificate: Boolean(existingCertificate),
            eligibility_status,
            ineligibility_reason,
            profile,
            latestSubmission: latestInWindow,
            certificate: existingCertificate
        };
    });
};

export const generateCertificateSvg = ({
    builderName,
    district,
    programTitle,
    appName,
    issuedAt,
    websiteImageHref = '',
    themeVariant = 'selangor-neo-classic'
}) => {
    const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escAttr = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const issued = new Date(issuedAt || Date.now()).toLocaleDateString();
    const imageBlock = websiteImageHref
        ? `
  <rect x="400" y="700" width="800" height="240" rx="14" fill="#fff7ed" stroke="#111827" stroke-width="2" />
  <image x="416" y="716" width="768" height="208" preserveAspectRatio="xMidYMid slice" href="${escAttr(websiteImageHref)}" />
  <text x="800" y="694" text-anchor="middle" fill="#475569" font-size="18" font-family="Arial, sans-serif">Submitted Website Preview</text>`
        : '';
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fff9ef" />
      <stop offset="100%" stop-color="#fff1dc" />
    </linearGradient>
    <pattern id="grain" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="4" r="0.5" fill="#f59e0b" opacity="0.11" />
      <circle cx="18" cy="20" r="0.45" fill="#dc2626" opacity="0.08" />
      <circle cx="31" cy="10" r="0.4" fill="#111827" opacity="0.07" />
    </pattern>
    <clipPath id="frameClip">
      <rect x="48" y="48" width="1504" height="1035" rx="26" />
    </clipPath>
  </defs>
  <rect x="0" y="0" width="1600" height="1131" fill="url(#bg)" />
  <rect x="0" y="0" width="1600" height="1131" fill="url(#grain)" />
  <rect x="48" y="48" width="1504" height="1035" rx="26" fill="#ffffff" stroke="#111827" stroke-width="8" />
  <g clip-path="url(#frameClip)">
    <rect x="48" y="48" width="1504" height="46" fill="#CE1126" />
    <rect x="540" y="48" width="270" height="46" fill="#F7C948" />
  </g>
  <rect x="88" y="132" width="1424" height="2" fill="#111827" opacity="0.2" />
  <text x="800" y="300" text-anchor="middle" fill="#0f172a" font-size="66" font-weight="900" letter-spacing="2" font-family="Arial, sans-serif">VIBESELANGOR CERTIFICATE</text>
  <text x="800" y="362" text-anchor="middle" fill="#334155" font-size="28" font-weight="700" font-family="Arial, sans-serif">This certifies that</text>
  <text x="800" y="456" text-anchor="middle" fill="#111827" font-size="74" font-weight="800" font-family="Arial, sans-serif">${esc(builderName)}</text>
  <text x="800" y="526" text-anchor="middle" fill="#334155" font-size="32" font-family="Arial, sans-serif">District: ${esc(district)} | App: ${esc(appName)}</text>
  <text x="800" y="590" text-anchor="middle" fill="#334155" font-size="32" font-family="Arial, sans-serif">Completed: ${esc(programTitle)}</text>
  <text x="800" y="652" text-anchor="middle" fill="#64748b" font-size="25" font-family="Arial, sans-serif">Issued on ${esc(issued)}</text>
  ${imageBlock}
  <text x="800" y="1018" text-anchor="middle" fill="#7c2d12" font-size="24" font-weight="700" font-family="Arial, sans-serif">Issued by KrackedDevs Selangor Ambassador, Zarul Izham</text>
</svg>`.trim();
};

const svgToPngBlob = async (svgMarkup) => {
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
        if (!blob) throw new Error('Failed to generate PNG blob.');
        return blob;
    } finally {
        URL.revokeObjectURL(url);
    }
};

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const pngBlobToPdfBlob = async (pngBlob) => {
    const { jsPDF } = await import('jspdf');
    const dataUrl = await blobToDataUrl(pngBlob);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 20;
    pdf.addImage(dataUrl, 'PNG', margin, margin, pageW - margin * 2, pageH - margin * 2, undefined, 'FAST');
    const arr = pdf.output('arraybuffer');
    return new Blob([arr], { type: 'application/pdf' });
};

const CERT_RETRY_ATTEMPTS = 3;
const CERT_QUEUE_KEY = 'vibeselangor_certificate_failed_queue';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pushFailedQueue = (payload) => {
    try {
        const raw = localStorage.getItem(CERT_QUEUE_KEY);
        const queue = raw ? JSON.parse(raw) : [];
        const next = [{ ...payload, at: new Date().toISOString() }, ...(Array.isArray(queue) ? queue : [])].slice(0, 120);
        localStorage.setItem(CERT_QUEUE_KEY, JSON.stringify(next));
    } catch {
        // Ignore client storage failure.
    }
};

const uploadBlob = async ({ supabase, bucket, path, blob, contentType, retries = CERT_RETRY_ATTEMPTS }) => {
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        const { error } = await supabase.storage.from(bucket).upload(path, blob, {
            upsert: true,
            contentType,
            cacheControl: '60'
        });
        if (!error) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data?.publicUrl || '';
        }
        lastError = error;
        if (attempt < retries) {
            await sleep(220 * attempt);
        }
    }
    throw lastError || new Error(`Upload failed for ${path}`);
};

const uploadCertificateAssets = async ({
    supabase,
    bucket,
    programClass,
    profile,
    latestSubmission,
    issuedAt,
    assetFormat = 'both',
    themeVariant = 'selangor-neo-classic'
}) => {
    const cohort = programClass?.title || 'Cohort';
    const builderName = profile?.full_name || 'Builder';
    const appName = latestSubmission?.project_name || profile?.idea_title || 'App';
    const baseName = buildCertificateBaseName(cohort, builderName, appName);
    const folder = `${programClass.id}/${profile.id}`;

    const getSubmissionVisualUrl = (submission) => {
        const media = submission?.screenshot_url || submission?.image_url || '';
        if (media) return media;
        const project = getProjectUrlFromSubmission(submission);
        if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(project)) return project;
        return '';
    };
    const toDataUrl = async (url) => {
        if (!url) return '';
        try {
            const response = await fetch(url);
            if (!response.ok) return '';
            const blob = await response.blob();
            return await blobToDataUrl(blob);
        } catch {
            return '';
        }
    };
    const websiteImageDataUrl = await toDataUrl(getSubmissionVisualUrl(latestSubmission));

    const svgMarkup = generateCertificateSvg({
        builderName,
        district: profile?.district || 'Selangor',
        programTitle: cohort,
        appName,
        issuedAt,
        websiteImageHref: websiteImageDataUrl,
        themeVariant
    });
    const want = resolveAssetFormat(assetFormat);
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const pngBlob = want.png || want.pdf ? await svgToPngBlob(svgMarkup) : null;
    const pdfBlob = want.pdf && pngBlob ? await pngBlobToPdfBlob(pngBlob) : null;

    const uploadTasks = [];
    if (want.svg) uploadTasks.push(uploadBlob({ supabase, bucket, path: `${folder}/${baseName}.svg`, blob: svgBlob, contentType: 'image/svg+xml' }));
    if (want.png && pngBlob) uploadTasks.push(uploadBlob({ supabase, bucket, path: `${folder}/${baseName}.png`, blob: pngBlob, contentType: 'image/png' }));
    if (want.pdf && pdfBlob) uploadTasks.push(uploadBlob({ supabase, bucket, path: `${folder}/${baseName}.pdf`, blob: pdfBlob, contentType: 'application/pdf' }));

    const results = await Promise.all(uploadTasks);
    const svgUrl = want.svg ? results.shift() : '';
    const pngUrl = want.png ? results.shift() : '';
    const pdfUrl = want.pdf ? results.shift() : '';

    return { svgUrl, pngUrl, pdfUrl, baseName };
};

export const issueProgramCertificates = async ({
    supabase,
    programClass,
    profiles = [],
    submissions = [],
    targetBuilderId = null,
    assetFormat = 'both',
    selectedBuilderIds = null,
    themeVariant = 'selangor-neo-classic'
}) => {
    const builderOnlyProfiles = (profiles || []).filter((p) => !['owner', 'admin'].includes((p?.role || '').toLowerCase()));
    const latestSubmissionByBuilder = new Map();
    (submissions || []).forEach((submission) => {
        if (!submission?.user_id) return;
        const prev = latestSubmissionByBuilder.get(submission.user_id);
        if (!prev || new Date(submission.created_at || 0) > new Date(prev.created_at || 0)) {
            latestSubmissionByBuilder.set(submission.user_id, submission);
        }
    });

    const hasExplicitAdminTargets = Boolean(targetBuilderId) || (Array.isArray(selectedBuilderIds) && selectedBuilderIds.length > 0);
    let scopeRows = [];

    if (hasExplicitAdminTargets) {
        const targetIds = new Set([
            ...(targetBuilderId ? [targetBuilderId] : []),
            ...(Array.isArray(selectedBuilderIds) ? selectedBuilderIds : [])
        ]);
        scopeRows = builderOnlyProfiles
            .filter((profile) => targetIds.has(profile.id))
            .map((profile) => ({
                profile,
                latestSubmission: latestSubmissionByBuilder.get(profile.id) || null
            }));
    } else {
        // Keep automatic/bulk non-targeted runs strict.
        scopeRows = getEligibleProgramBuilders({ programClass, profiles, submissions });
    }

    if (!scopeRows.length) {
        return { issuedCount: 0, updatedCount: 0, skippedCount: 0 };
    }

    const builderIds = scopeRows.map((row) => row.profile.id);
    const { data: existingRows, error: existingError } = await supabase
        .from('builder_certificates')
        .select('*')
        .eq('program_class_id', programClass.id)
        .in('builder_id', builderIds);
    if (existingError) throw existingError;
    const existingMap = new Map((existingRows || []).map((r) => [r.builder_id, r]));

    const bucket = 'builder_certificates';
    let issuedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const row of scopeRows) {
        try {
            const existing = existingMap.get(row.profile.id) || null;
            const issuedAt = new Date().toISOString();
            const assets = await uploadCertificateAssets({
                supabase,
                bucket,
                programClass,
                profile: row.profile,
                latestSubmission: row.latestSubmission,
                issuedAt,
                assetFormat,
                themeVariant
            });
            const payload = {
                builder_id: row.profile.id,
                builder_name: row.profile.full_name || 'Builder',
                district: row.profile.district || 'Unknown',
                program_class_id: programClass.id,
                program_title: programClass.title || 'Program',
                app_name: row.latestSubmission?.project_name || row.profile?.idea_title || 'Builder Project',
                project_url: getProjectUrlFromSubmission(row.latestSubmission),
                certificate_url: (() => {
                    const base = assets.pdfUrl || assets.pngUrl || assets.svgUrl || '';
                    if (!base) return '';
                    const separator = base.includes('?') ? '&' : '?';
                    return `${base}${separator}v=${encodeURIComponent(issuedAt)}`;
                })(),
                issued_at: issuedAt
            };

            if (existing?.id) {
                const { error } = await supabase.from('builder_certificates').update(payload).eq('id', existing.id);
                if (error) throw error;
                updatedCount += 1;
            } else {
                const { error } = await supabase.from('builder_certificates').insert([payload]);
                if (error) throw error;
                issuedCount += 1;
            }
            if (!payload.certificate_url) skippedCount += 1;
        } catch (error) {
            const errorMessage = String(error?.message || error || 'Failed to issue certificate');
            errors.push({
                builder_id: row.profile.id,
                builder_name: row.profile.full_name || 'Builder',
                message: errorMessage
            });
            pushFailedQueue({
                builder_id: row.profile.id,
                builder_name: row.profile.full_name || 'Builder',
                program_class_id: programClass.id,
                program_title: programClass.title || 'Program',
                asset_format: assetFormat,
                message: errorMessage
            });
        }
    }

    return { issuedCount, updatedCount, skippedCount, errors };
};
