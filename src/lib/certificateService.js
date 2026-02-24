export const sanitizeFileToken = (value, fallback = 'Unknown') => {
    const clean = String(value || fallback)
        .trim()
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[.]+/g, '_');
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

export const generateCertificateSvg = ({ builderName, district, programTitle, appName, issuedAt }) => {
    const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const issued = new Date(issuedAt || Date.now()).toLocaleDateString();
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed" />
      <stop offset="100%" stop-color="#fee2e2" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1600" height="1131" fill="url(#bg)" />
  <rect x="48" y="48" width="1504" height="1035" rx="26" fill="#ffffff" stroke="#111827" stroke-width="8" />
  <rect x="48" y="48" width="1504" height="34" fill="#CE1126" />
  <rect x="544" y="48" width="250" height="34" fill="#F7C948" />
  <text x="110" y="182" fill="#0f172a" font-size="64" font-weight="800" font-family="Arial, sans-serif">VIBESELANGOR CERTIFICATE</text>
  <text x="110" y="252" fill="#475569" font-size="30" font-family="Arial, sans-serif">This certifies that</text>
  <text x="110" y="344" fill="#111827" font-size="72" font-weight="700" font-family="Arial, sans-serif">${esc(builderName)}</text>
  <text x="110" y="414" fill="#334155" font-size="33" font-family="Arial, sans-serif">District: ${esc(district)} | App: ${esc(appName)}</text>
  <text x="110" y="480" fill="#334155" font-size="33" font-family="Arial, sans-serif">Completed: ${esc(programTitle)}</text>
  <text x="110" y="550" fill="#64748b" font-size="26" font-family="Arial, sans-serif">Issued on ${esc(issued)}</text>
  <line x1="110" y1="740" x2="600" y2="740" stroke="#111827" stroke-width="3"/>
  <text x="110" y="778" fill="#64748b" font-size="22" font-family="Arial, sans-serif">Program Lead</text>
  <line x1="930" y1="740" x2="1420" y2="740" stroke="#111827" stroke-width="3"/>
  <text x="930" y="778" fill="#64748b" font-size="22" font-family="Arial, sans-serif">KrackedDevs Selangor</text>
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
            cacheControl: '3600'
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
    assetFormat = 'both'
}) => {
    const cohort = programClass?.title || 'Cohort';
    const builderName = profile?.full_name || 'Builder';
    const appName = latestSubmission?.project_name || profile?.idea_title || 'App';
    const baseName = buildCertificateBaseName(cohort, builderName, appName);
    const folder = `${programClass.id}/${profile.id}`;

    const svgMarkup = generateCertificateSvg({
        builderName,
        district: profile?.district || 'Selangor',
        programTitle: cohort,
        appName,
        issuedAt
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
    assetFormat = 'both'
}) => {
    const eligibleRows = getEligibleProgramBuilders({ programClass, profiles, submissions });
    const scopeRows = targetBuilderId
        ? eligibleRows.filter((row) => row.profile.id === targetBuilderId)
        : eligibleRows;
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
                assetFormat
            });
            const payload = {
                builder_id: row.profile.id,
                builder_name: row.profile.full_name || 'Builder',
                district: row.profile.district || 'Unknown',
                program_class_id: programClass.id,
                program_title: programClass.title || 'Program',
                app_name: row.latestSubmission?.project_name || row.profile?.idea_title || 'Builder Project',
                project_url: getProjectUrlFromSubmission(row.latestSubmission),
                certificate_url: assets.pdfUrl || assets.pngUrl || assets.svgUrl,
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
