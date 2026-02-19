// VibeSelangor Utility Functions
// Extracted from App.jsx for better maintainability

export function resolveRoleByEmail(emailValue, ownerEmail, adminEmails) {
    const email = (emailValue || '').toLowerCase().trim();
    if (!email) return 'builder';
    if (email === ownerEmail) return 'owner';
    if (adminEmails.includes(email)) return 'admin';
    return 'builder';
}

export function normalizeDistrict(value) {
    return (value || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function truncateText(value, max = 180) {
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

export function sanitizeAuthorText(value) {
    const text = (value || '')
        .replace(/@media\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return '';
    if (/^@?media$/i.test(text)) return '';
    return text;
}

export function formatWhatsAppLink(phone) {
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

export function formatThreadsProfileUrl(handle) {
    const normalized = String(handle || '')
        .trim()
        .replace(/^@+/, '');

    if (!normalized) return 'https://www.threads.net/';
    return `https://www.threads.net/@${normalized}`;
}

export function extractShowcaseProjectUrls(htmlText) {
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

export function parseKrackedProjectDetail(htmlText, projectPath, index) {
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

export function extractKrackedDescription(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    return truncateText(metaDescription || ogDescription, 160) || 'KrackedDevs Showcase';
}

export function readKualaLumpurShowcaseCache(cacheKey) {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.projectUrls) || !Array.isArray(parsed?.records)) return null;
        return parsed;
    } catch (error) {
        return null;
    }
}

export function writeKualaLumpurShowcaseCache(cacheKey, payload) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (error) {
        // Ignore cache write failures.
    }
}

/**
 * Calculates idle Vibes earned since last claim.
 * @param {number} buildRate - Vibes per hour
 * @param {string} lastClaimTime - ISO timestamp of last claim
 * @returns {number} Vibes earned
 */
export function calculateIdleVibes(buildRate, lastClaimTime) {
    if (!lastClaimTime) return 0;
    const now = new Date();
    const last = new Date(lastClaimTime);
    const hoursElapsed = (now - last) / (1000 * 60 * 60);
    // Cap at 8 hours of idle earnings
    const cappedHours = Math.min(hoursElapsed, 8);
    return Math.floor(buildRate * cappedHours);
}

/**
 * Gets the current level info based on XP
 */
export function getLevelFromXP(xp, gameLevels) {
    let currentLevel = gameLevels[0];
    for (const lvl of gameLevels) {
        if (xp >= lvl.xpRequired) {
            currentLevel = lvl;
        } else {
            break;
        }
    }
    return currentLevel;
}

/**
 * Gets XP needed for next level
 */
export function getXPForNextLevel(xp, gameLevels) {
    for (let i = 0; i < gameLevels.length - 1; i++) {
        if (xp < gameLevels[i + 1].xpRequired) {
            return {
                current: xp - gameLevels[i].xpRequired,
                needed: gameLevels[i + 1].xpRequired - gameLevels[i].xpRequired,
                nextLevel: gameLevels[i + 1]
            };
        }
    }
    return { current: xp, needed: xp, nextLevel: null }; // Max level
}

export function downloadCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

export function extractFillFromStyle(style) {
    const match = style.match(/fill:([^;]+)/i);
    return match ? match[1] : '#e5e7eb';
}
