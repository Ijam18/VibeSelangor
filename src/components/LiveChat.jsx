import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastNotification';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { sanitizeAuthorText } from '../utils';

export default function LiveChat({ session, activeClass }) {
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-open if class is active and not manually closed
    useEffect(() => {
        if (activeClass && !localStorage.getItem('live_chat_closed')) {
            setIsOpen(true);
        }
    }, [activeClass]);

    useEffect(() => {
        if (!activeClass || !isOpen) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('class_chat')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50); // Get last 50 messages

            if (!error) {
                setMessages(data || []);
            }
            setLoading(false);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:class_chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'class_chat' }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeClass, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, isMinimized]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !session?.user) return;

        const msg = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        // Optimistic update
        const tempId = Date.now();
        const optimisticMsg = {
            id: tempId,
            user_id: session.user.id,
            builder_name: session.user.user_metadata?.full_name || 'Builder',
            message: msg,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        const { error } = await supabase
            .from('class_chat')
            .insert([{
                class_id: activeClass.id,
                user_id: session.user.id,
                builder_name: session.user.user_metadata?.full_name || 'Builder',
                message: msg
            }]);

        if (error) {
            addToast('Failed to send message', 'error');
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Revert
        }
    };

    if (!activeClass) return null; // Don't render if no class is active

    if (!isOpen) return null;

    return (
        <div className="neo-card" style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px', // Align with chatbot area
            width: isMinimized ? '300px' : '350px',
            height: isMinimized ? '60px' : '500px',
            zIndex: 999,
            padding: 0,
            border: '3px solid black',
            boxShadow: '8px 8px 0px black',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                background: 'var(--selangor-red)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '3px solid black'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#00ff00', borderRadius: '50%' }}></div>
                    <div style={{ fontWeight: '900', fontSize: '14px' }}>LIVE CLASS CHAT</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
                <>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: '#f8f9fa'
                    }}>
                        {loading && messages.length === 0 ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '12px', marginTop: '20px' }}>Connecting to live chat...</div>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '12px', marginTop: '20px' }}>Chat is quiet. Say hello! 👋</div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.user_id === session?.user?.id;
                                return (
                                    <div key={msg.id || i} style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%'
                                    }}>
                                        {!isMe && (
                                            <div style={{ fontSize: '10px', fontWeight: '800', marginBottom: '2px', marginLeft: '4px', opacity: 0.7 }}>
                                                {sanitizeAuthorText(msg.builder_name || 'Builder')}
                                            </div>
                                        )}
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            background: isMe ? 'black' : 'white',
                                            color: isMe ? 'white' : 'black',
                                            border: '2px solid black',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderBottomRightRadius: isMe ? '2px' : '12px',
                                            borderBottomLeftRadius: isMe ? '12px' : '2px',
                                            boxShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} style={{
                        padding: '12px',
                        background: 'white',
                        borderTop: '2px solid black',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={session?.user ? "Type a message..." : "Login to chat"}
                            disabled={!session?.user}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '2px solid black',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !session?.user}
                            className="btn btn-red"
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: (!newMessage.trim() || !session?.user) ? 0.5 : 1
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
