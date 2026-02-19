/**
 * Utility for detecting Malaysian Public Holidays and seasonal themes.
 */

// Basic static list of fixed-date holidays
const FIXED_HOLIDAYS = {
    '01-01': 'new_year',
    '05-01': 'labour_day',
    '08-31': 'merdeka',
    '09-16': 'malaysia_day',
    '12-11': 'selangor_sultan_birthday',
    '12-25': 'christmas',
};

// Placeholder for lunar-based holidays (calculated or updated yearly)
// In a real app, this might fetch from an API or use a library like 'date-fns-tz'
const LUNAR_HOLIDAYS = {
    // 2025
    '2025-01-29': 'cny',
    '2025-01-30': 'cny',
    '2025-03-31': 'raya',
    '2025-04-01': 'raya',
    '2025-10-20': 'deepavali',
    // 2026
    '2026-02-17': 'cny',
    '2026-02-18': 'cny',
    '2026-02-19': 'cny', // Adding Day 3 as well
    '2026-03-20': 'raya',
    '2026-03-21': 'raya',
    '2026-11-08': 'deepavali',
};

/**
 * Returns the current holiday theme key if today is a holiday.
 * @returns {string|null}
 */
export function getCurrentHolidayTheme() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${month}-${day}`;
    const fullDateStr = `${year}-${month}-${day}`;

    // Check fixed holidays
    if (FIXED_HOLIDAYS[dateStr]) {
        return FIXED_HOLIDAYS[dateStr];
    }

    // Check lunar holidays
    if (LUNAR_HOLIDAYS[fullDateStr]) {
        return LUNAR_HOLIDAYS[fullDateStr];
    }

    return null;
}

/**
 * Returns theme-specific styling or icon overrides.
 */
export function getHolidayThemeConfig(theme) {
    switch (theme) {
        case 'raya':
            return {
                headerLabel: 'Selamat Hari Raya Aidilfitri',
                botLabel: 'Selamat Hari Raya',
                color: '#16a34a', // Green
                overlayIcon: 'ketupat',
            };
        case 'cny':
            return {
                headerLabel: 'Selamat Tahun Baru Cina',
                botLabel: 'Gong Xi Fa Cai',
                color: '#dc2626', // Red
                overlayIcon: 'lantern',
            };
        case 'merdeka':
        case 'malaysia_day':
            return {
                headerLabel: 'Selamat Hari Kebangsaan',
                botLabel: 'Selamat Hari Kebangsaan',
                color: '#1d4ed8', // Blue
                overlayIcon: 'flag',
            };
        case 'deepavali':
            return {
                headerLabel: 'Selamat Hari Deepavali',
                botLabel: 'Happy Deepavali',
                color: '#f59e0b', // Orange/Amber
                overlayIcon: 'lamp',
            };
        case 'christmas':
            return {
                headerLabel: 'Selamat Hari Krismas',
                botLabel: 'Merry Christmas',
                color: '#b91c1c', // Deep Red
                overlayIcon: 'tree',
            };
        case 'new_year':
            return {
                headerLabel: 'Selamat Tahun Baru',
                botLabel: 'Happy New Year',
                color: '#4338ca', // Indigo
                overlayIcon: 'sparkles',
            };
        case 'labour_day':
            return {
                headerLabel: 'Selamat Hari Pekerja',
                botLabel: 'Happy Labour Day',
                color: '#374151', // Gray
            };
        case 'selangor_sultan_birthday':
            return {
                headerLabel: 'Daulat Tuanku',
                botLabel: 'Daulat Tuanku',
                color: '#CE1126', // Selangor Red
            };
        default:
            return null;
    }
}
