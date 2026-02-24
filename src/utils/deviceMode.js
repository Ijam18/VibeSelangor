export const getDeviceMode = (width, nav = (typeof navigator !== 'undefined' ? navigator : null)) => {
    const w = Number(width) || 0;
    const ua = (nav?.userAgent || '').toLowerCase();
    const maxTouchPoints = Number(nav?.maxTouchPoints || 0);
    const platform = String(nav?.platform || '');

    const isIPadLike = ua.includes('ipad') || (platform === 'MacIntel' && maxTouchPoints > 1);
    const isPhoneUA =
        ua.includes('iphone') ||
        ua.includes('windows phone') ||
        (ua.includes('android') && ua.includes('mobile'));
    const isTabletUA =
        isIPadLike ||
        (ua.includes('android') && !ua.includes('mobile')) ||
        ua.includes('tablet') ||
        ua.includes('silk') ||
        ua.includes('kindle') ||
        ua.includes('playbook');

    // Hard lock: non-phone/tablet user agents remain desktop even on narrow windows.
    if (!isPhoneUA && !isTabletUA) return 'desktop';
    if (isPhoneUA) return 'phone';
    return w <= 767 ? 'phone' : 'tablet';
};

export const getIjamOsMode = (deviceMode) => {
    if (deviceMode === 'phone') return 'ios_phone';
    if (deviceMode === 'tablet') return 'ios_tablet';
    return 'mac_desktop';
};
