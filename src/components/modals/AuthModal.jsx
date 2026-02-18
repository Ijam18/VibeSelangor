import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DISTRICT_OPTIONS } from '../../constants';

export default function AuthModal({
    isOpen,
    onClose,
    authMode,
    setAuthMode,
    handleAuth,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    showAuthPassword,
    setShowAuthPassword,
    onboardingForm,
    setOnboardingForm,
    authError,
    isAuthLoading
}) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="neo-card no-jitter" style={{ maxWidth: '500px', maxHeight: '74vh', overflowY: 'auto', width: '100%', background: 'white', border: '3px solid black' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Welcome builders</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <button type="button" className="btn btn-outline" style={{ padding: '10px 12px', fontSize: '12px', background: authMode === 'signin' ? '#fff3f3' : 'white' }} onClick={() => setAuthMode('signin')}>Sign In</button>
                    <button type="button" className="btn btn-outline" style={{ padding: '10px 12px', fontSize: '12px', background: authMode === 'signup' ? '#fff3f3' : 'white' }} onClick={() => setAuthMode('signup')}>Sign Up</button>
                </div>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleAuth}>
                    <input
                        type="email" placeholder="Email" value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showAuthPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            style={{ padding: '14px 44px 14px 14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                        />
                        <button
                            type="button"
                            aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowAuthPassword((prev) => !prev)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                            {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {authMode === 'signup' && (
                        <>
                            <input
                                type="text"
                                placeholder="Username"
                                value={onboardingForm.username}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, username: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <select
                                value={onboardingForm.district}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, district: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            >
                                <option value="">Select district</option>
                                {DISTRICT_OPTIONS.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="App idea title"
                                value={onboardingForm.ideaTitle}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, ideaTitle: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <textarea
                                placeholder="What problem are you solving? (Project Description)"
                                value={onboardingForm.problemStatement}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, problemStatement: e.target.value }))}
                                rows={3}
                                required
                                maxLength={150}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <p style={{ fontSize: '10px', marginTop: '-10px', marginBottom: '4px', opacity: 0.7, fontWeight: '700', lineHeight: '1.4' }}>
                                💡 Note: Project description should be your quick pitch like you want to sell this app (max 150 characters).
                            </p>
                            <textarea
                                placeholder="Tell us about yourself"
                                value={onboardingForm.aboutYourself}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, aboutYourself: e.target.value }))}
                                rows={2}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <textarea
                                placeholder="What is your goal in joining this program?"
                                value={onboardingForm.programGoal}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, programGoal: e.target.value }))}
                                rows={2}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', resize: 'vertical' }}
                            />
                            <input
                                type="text"
                                placeholder="WhatsApp contact"
                                value={onboardingForm.whatsappContact}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, whatsappContact: e.target.value }))}
                                required
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Threads handle (optional)"
                                value={onboardingForm.threadsHandle}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, threadsHandle: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                            <p style={{ fontSize: '11px', marginTop: '-8px', opacity: 0.7, paddingLeft: '4px' }}>
                                💡 <strong>Recommended:</strong> include your handle to connect with potential business & collaboration opportunities.
                            </p>
                            <input
                                type="text"
                                placeholder="Discord tag (optional)"
                                value={onboardingForm.discordTag}
                                onChange={(e) => setOnboardingForm((prev) => ({ ...prev, discordTag: e.target.value }))}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px' }}
                            />
                        </>
                    )}
                    {authError && <p style={{ color: 'var(--selangor-red)', fontSize: '12px', fontWeight: 700 }}>{authError}</p>}
                    <button className="btn btn-red" type="submit" disabled={isAuthLoading}>
                        {isAuthLoading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '800' }}
                    >
                        CLOSE
                    </button>
                </form>
            </div>
        </div>
    );
}
