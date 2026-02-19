import React, { useState, useEffect, useMemo } from 'react';
import { Users, Folder } from 'lucide-react';
import GalleryShowcase from '../components/GalleryShowcase';
import {
    DISTRICT_INFO,
    ANCHOR_PATH_TO_DISTRICT,
    MANUAL_REGION_DISTRICT,
    BUNDLED_HOVER_DISTRICTS,
    DEFAULT_MAP_FILL,
    TERMINAL_CONTEXT,
    DEPLOY_COMMAND
} from '../constants';
import {
    normalizeDistrict,
    extractFillFromStyle,
    readKualaLumpurShowcaseCache,
    writeKualaLumpurShowcaseCache,
    extractShowcaseProjectUrls,
    parseKrackedProjectDetail,
    extractKrackedDescription,
    downloadCSV
} from '../utils';

const LandingPage = ({
    profiles,
    submissions,
    session,
    handleJoinClick,
    isMobileView,
    setPublicPage,
    setSelectedDetailProfile
}) => {
    // Map State
    const [activeRegion, setActiveRegion] = useState(null);
    const [activeDistrictHoverKey, setActiveDistrictHoverKey] = useState(null);
    const [selectedDistrictKey, setSelectedDistrictKey] = useState(null);
    const [mapRegions, setMapRegions] = useState([]);
    const [mapViewMode, setMapViewMode] = useState('builders'); // 'builders' or 'projects'

    // KL Showcase State
    const [kualaLumpurShowcase, setKualaLumpurShowcase] = useState([]);
    const [krackedDescription, setKrackedDescription] = useState('KrackedDevs');
    const [isKualaLumpurLoading, setIsKualaLumpurLoading] = useState(false);
    const [pendingKualaLumpurOpen, setPendingKualaLumpurOpen] = useState(false);

    // Derived Map Data
    const hoveredRegionData = mapRegions.find((region) => region.id === activeRegion) || null;
    const selectedDistrictName = selectedDistrictKey ? DISTRICT_INFO[selectedDistrictKey]?.name : null;

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

    useEffect(() => {
        let isCancelled = false;
        const loadKualaLumpurShowcase = async () => {
            const cached = readKualaLumpurShowcaseCache('kl_showcase_cache_v1');

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
                writeKualaLumpurShowcaseCache('kl_showcase_cache_v1', {
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
        loadMapGeometry();

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

    return (
        <>
            <section id="how-it-works" className="hero" style={{ paddingTop: '8px', paddingBottom: '40px' }}>
                <div className="container grid-12">
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="pill pill-red" style={{ marginBottom: '12px' }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h1 className="text-huge">Built for <span style={{ color: 'var(--selangor-red)' }}>Selangor</span>. Connecting and growing the builder community.</h1>
                        <button className="btn btn-red" style={{ marginTop: '12px' }} onClick={handleJoinClick}>Join the Cohort</button>
                    </div>
                    <div style={{ gridColumn: 'span 5' }}>
                        <div className="neo-card no-jitter" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto' }}>
                                <span className="pill" style={{ background: 'black', color: 'white', cursor: 'pointer', fontSize: '12px' }} onClick={handleJoinClick}>PORTAL_ACCESS</span>
                                <span className="greeting-anim" style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', textAlign: 'right' }}>
                                    {(() => {
                                        const now = new Date();
                                        const hour = now.getHours();
                                        const date = now.getDate();
                                        const month = now.getMonth() + 1; // 0-indexed

                                        // Malaysia Public Holidays (Simples)
                                        if (month === 8 && date === 31) return "SELAMAT HARI MERDEKA! 🇲🇾";
                                        if (month === 9 && date === 16) return "SELAMAT HARI MALAYSIA! 🇲🇾";
                                        if (month === 5 && date === 1) return "SELAMAT HARI PEKERJA! 🛠️";
                                        if (month === 12 && date === 25) return "MERRY CHRISTMAS! 🎄";
                                        if (month === 1 && date === 1) return "HAPPY NEW YEAR! 🎉";

                                        // Time of Day
                                        if (hour >= 5 && hour < 12) return "SELAMAT PAGI! ☀️";
                                        if (hour >= 12 && hour < 15) return "SELAMAT TENGAHARI! 🌤️";
                                        if (hour >= 15 && hour < 19) return "SELAMAT PETANG! ☕";
                                        return "SELAMAT MALAM! 🌙";
                                    })()}
                                </span>
                            </div>
                            <div className="terminal-shell" style={{ background: '#000', borderRadius: '12px', padding: '24px', marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                <div className="terminal-prompt" style={{ color: 'var(--selangor-red)', fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.4, marginBottom: '8px' }}>{TERMINAL_CONTEXT}</div>
                                <p className="terminal-line" style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', marginTop: '0' }}>
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
                        <div className="neo-card no-jitter map-card" style={{ border: '3px solid black', boxShadow: '12px 12px 0px black', display: 'flex', justifyContent: 'center', position: 'relative' }}>
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

            <GalleryShowcase
                profiles={profiles}
                session={session}
                submissions={submissions}
                isMobileView={isMobileView}
                limit={isMobileView ? 4 : 8}
                setPublicPage={setPublicPage}
                setSelectedDetailProfile={setSelectedDetailProfile}
            />
        </>
    );
};

export default LandingPage;
