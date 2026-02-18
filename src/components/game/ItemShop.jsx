import React from 'react';
import { GAME_ITEMS } from '../../constants';
import { Lock, Zap, Check, Star } from 'lucide-react';

export default function ItemShop({ currentLevel, currentVibes, inventory = [], onPurchase }) {
    return (
        <div className="shop-grid">
            {GAME_ITEMS.map((item) => {
                const isOwned = inventory.includes(item.id);
                const isLocked = item.level > currentLevel;
                const canAfford = currentVibes >= item.cost;

                return (
                    <div
                        key={item.id}
                        className={`neo-card shop-item ${isLocked ? 'locked' : ''} ${isOwned ? 'owned' : ''}`}
                        style={{
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            border: '2px solid black',
                            opacity: isLocked ? 0.6 : 1,
                            backgroundColor: isOwned ? '#f0fff4' : '#fff'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '24px' }}>{item.emoji}</div>
                            {isLocked && <Lock size={14} color="#666" />}
                            {isOwned && <Check size={16} color="green" strokeWidth={3} />}
                        </div>

                        <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', lineHeight: 1.2 }}>{item.name}</div>
                            <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', color: '#666', marginTop: '2px' }}>
                                <Zap size={10} fill="currentColor" /> +{item.buildRate}/hr
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            {isOwned ? (
                                <div style={{ fontSize: '12px', fontWeight: '900', color: 'green', textAlign: 'center', padding: '6px' }}>OWNED</div>
                            ) : isLocked ? (
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#666', textAlign: 'center', padding: '6px', background: '#e5e7eb', borderRadius: '4px' }}>
                                    LVL {item.level}
                                </div>
                            ) : (
                                <button
                                    onClick={() => onPurchase(item)}
                                    disabled={!canAfford}
                                    style={{
                                        width: '100%',
                                        padding: '6px',
                                        background: canAfford ? 'var(--selangor-red)' : '#ccc',
                                        color: 'white',
                                        border: '2px solid black',
                                        borderRadius: '4px',
                                        fontWeight: '800',
                                        fontSize: '12px',
                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                        boxShadow: canAfford ? '2px 2px 0px black' : 'none',
                                        transform: canAfford ? 'none' : 'translate(1px, 1px)'
                                    }}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={11} fill="white" color="white" /> {item.cost}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
