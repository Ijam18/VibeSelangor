import React from 'react';
import { DISTRICT_OPTIONS } from '../../constants';

export default function EditProfileModal({
    isOpen,
    onClose,
    editProfileForm,
    setEditProfileForm,
    handleUpdateProfile,
    isUpdatingProfile,
    activeClass,
    isPresentAtActive,
    onCheckIn
}) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="neo-card no-jitter" style={{ maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', width: '100%', background: 'white', border: '3px solid black' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Edit Your Profile</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleUpdateProfile}>
                    {typeof onCheckIn === 'function' && (
                        <div style={{ border: '2px solid black', borderRadius: '10px', padding: '10px 12px', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '900' }}>CLASS CHECK-IN</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: 3 }}>
                                        {activeClass ? `Live now: ${activeClass.title}` : 'No live class right now. Check-in opens when admin starts class.'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onCheckIn}
                                    disabled={!activeClass}
                                    className={`btn ${activeClass ? (isPresentAtActive ? 'btn-outline' : 'btn-red') : 'btn-outline'}`}
                                    style={{ padding: '8px 12px', fontSize: '11px', opacity: activeClass ? 1 : 0.55 }}
                                >
                                    {activeClass ? (isPresentAtActive ? 'Checked In' : 'Check In') : 'Class Not Live'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>FULL NAME</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={editProfileForm.username}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>DISTRICT</label>
                        <select
                            value={editProfileForm.district}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, district: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        >
                            <option value="">Select district</option>
                            {DISTRICT_OPTIONS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>IDEA TITLE</label>
                        <input
                            type="text"
                            placeholder="App idea title"
                            value={editProfileForm.ideaTitle}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, ideaTitle: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>PROBLEM STATEMENT</label>
                        <textarea
                            placeholder="What problem are you solving? (Project Description)"
                            value={editProfileForm.problemStatement}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
                            rows={3}
                            required
                            maxLength={150}
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>ABOUT YOURSELF</label>
                        <textarea
                            placeholder="Tell us about yourself"
                            value={editProfileForm.aboutYourself}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, aboutYourself: e.target.value }))}
                            rows={2}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>PROGRAM GOAL</label>
                        <textarea
                            placeholder="What is your goal in joining this program?"
                            value={editProfileForm.programGoal}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, programGoal: e.target.value }))}
                            rows={2}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900' }}>WHATSAPP CONTACT</label>
                        <input
                            type="text"
                            placeholder="WhatsApp contact"
                            value={editProfileForm.whatsappContact}
                            onChange={(e) => setEditProfileForm((prev) => ({ ...prev, whatsappContact: e.target.value }))}
                            required
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                        />
                    </div>
                    <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '900' }}>THREADS</label>
                            <input
                                type="text"
                                placeholder="Threads handle"
                                value={editProfileForm.threadsHandle}
                                onChange={(e) => setEditProfileForm((prev) => ({ ...prev, threadsHandle: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '900' }}>DISCORD</label>
                            <input
                                type="text"
                                placeholder="Discord tag"
                                value={editProfileForm.discordTag}
                                onChange={(e) => setEditProfileForm((prev) => ({ ...prev, discordTag: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                    <button className="btn btn-red" type="submit" disabled={isUpdatingProfile} style={{ marginTop: '8px' }}>
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '800' }}
                    >
                        CANCEL
                    </button>
                </form>
            </div>
        </div>
    );
}
