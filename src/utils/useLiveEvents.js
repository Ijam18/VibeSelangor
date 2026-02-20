import { useState, useEffect } from 'react';

export function useLiveEvents() {
    const [liveEventMessage, setLiveEventMessage] = useState('');
    const [eventGreeting, setEventGreeting] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchEvents() {
            try {
                // 1. Fetch next Malaysian Public Holiday
                const currentYear = new Date().getFullYear();
                const holidayRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/MY`);
                let holidayText = '';
                let nextHolidayName = '';

                if (holidayRes.ok) {
                    const text = await holidayRes.text();
                    if (text) {
                        try {
                            const holidays = JSON.parse(text);
                            if (holidays && Array.isArray(holidays)) {
                                const today = new Date();
                                // Set time to 00:00:00 to compare dates properly
                                today.setHours(0, 0, 0, 0);

                                const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today);
                                if (upcomingHolidays.length > 0) {
                                    const nextHoliday = upcomingHolidays[0];
                                    const dateObj = new Date(nextHoliday.date);
                                    const formattedDate = dateObj.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
                                    holidayText = `Cuti: ${nextHoliday.localName} (${formattedDate})`;
                                    nextHolidayName = nextHoliday.localName;
                                }
                            }
                        } catch (e) {
                            console.error("Error parsing holiday JSON:", e);
                        }
                    }
                }

                // 2. Fetch Islamic Hijri Date for Today
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yyyy = today.getFullYear();

                const hijriRes = await fetch(`https://api.aladhan.com/v1/gToH?date=${dd}-${mm}-${yyyy}`);
                let hijriText = '';

                if (hijriRes.ok) {
                    const hijriData = await hijriRes.json();
                    if (hijriData.code === 200 && hijriData.data && hijriData.data.hijri) {
                        const h = hijriData.data.hijri;
                        hijriText = `Hijrah: ${h.day} ${h.month.en} ${h.year}`;

                        // Check for specific events/holidays in the array
                        if (h.holidays && h.holidays.length > 0) {
                            hijriText += ` [${h.holidays.join(', ')}]`;
                            setEventGreeting(`Selamat menyambut ${h.holidays[0]}!`);
                        } else if (h.month.number === 9) {
                            hijriText += ` [Ramadan Al-Mubarak]`;
                            setEventGreeting(`Selamat berpuasa di bulan Ramadan!`);
                        } else if (nextHolidayName) {
                            setEventGreeting(`Selamat bercuti sempena ${nextHolidayName}!`);
                        }
                    } else if (nextHolidayName) {
                        setEventGreeting(`Selamat bercuti sempena ${nextHolidayName}!`);
                    }
                } else if (nextHolidayName) {
                    setEventGreeting(`Selamat bercuti sempena ${nextHolidayName}!`);
                }

                if (isMounted) {
                    // Combine texts thoughtfully
                    const parts = [];
                    if (hijriText) parts.push(hijriText);
                    if (holidayText) parts.push(holidayText);

                    if (parts.length > 0) {
                        setLiveEventMessage(parts.join(' | '));
                    }
                }

            } catch (error) {
                console.error("Failed to fetch live events:", error);
                // Fail silently, we'll just not show the live event string
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchEvents();

        return () => {
            isMounted = false;
        };
    }, []);

    return { liveEventMessage, eventGreeting, isLoading };
}
