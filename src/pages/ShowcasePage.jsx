import React, { useEffect } from 'react';
import ProgressWall from '../components/ProgressWall';
import GalleryShowcase from '../components/GalleryShowcase';

const ShowcasePage = ({
    setPublicPage,
    submissions,
    profiles,
    session,
    setSelectedDetailProfile,
    isMobileView,
    handleJoinClick
}) => {

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    return (
        <div style={{ paddingTop: '40px', background: '#fff' }}>


            <ProgressWall submissions={submissions} profiles={profiles} />

            <GalleryShowcase
                profiles={profiles}
                session={session}
                submissions={submissions}
                setSelectedDetailProfile={setSelectedDetailProfile}
                isMobileView={isMobileView}
                limit={null}
                setPublicPage={setPublicPage}
            />

            <div style={{ background: 'white', color: 'black', padding: '100px 0', borderTop: '3px solid #f0f0f0' }}>
                <div className="container text-center" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px' }}>Ready to join them?</h2>
                    <button className="btn btn-red" onClick={handleJoinClick}>START YOUR SPRINT</button>
                </div>
            </div>
        </div>
    );
};

export default ShowcasePage;
