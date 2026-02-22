/**
 * ketamBoardService.js — Data access + client-side AI orchestration for Ketam Board
 * Schema: forum_rooms (bigserial id, slug), forum_threads (bigserial), forum_messages, ai_forum_agents, ai_forum_runs
 */
import { callNvidiaLLM } from './nvidia';

// ─── Agent visual config (matches DB seed agent_id values) ───────────────────
export const AGENT_META = {
    agent_researcher: { color: '#60a5fa', label: 'RESEARCHER', icon: 'microscope' },
    agent_builder:    { color: '#4ade80', label: 'BUILDER',    icon: 'wrench'     },
    agent_critic:     { color: '#f87171', label: 'CRITIC',     icon: 'shield'     },
    agent_pm:         { color: '#fb923c', label: 'PM',         icon: 'clipboard'  },
};

export const SPECTATOR_SIGNALS = [
    { id: 'go_deeper',     label: 'Go Deeper', icon: 'target' },
    { id: 'challenge',     label: 'Challenge', icon: 'shield' },
    { id: 'summarize_now', label: 'Summarize', icon: 'file' },
    { id: 'switch_topic',  label: 'New Angle', icon: 'compass' },
];

// ─── Room helpers ─────────────────────────────────────────────────────────────
export async function fetchRoomBySlug(supabase, slug) {
    const { data } = await supabase.from('forum_rooms').select('*').eq('slug', slug).single();
    return data;
}

export async function fetchAgents(supabase, roomId) {
    const { data } = await supabase
        .from('ai_forum_agents')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_enabled', true)
        .order('id');
    return data || [];
}

// ─── Run helpers ──────────────────────────────────────────────────────────────
export async function fetchActiveRun(supabase, roomId) {
    const { data } = await supabase
        .from('ai_forum_runs')
        .select('*')
        .eq('room_id', roomId)
        .in('state', ['running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
}

export async function fetchReplays(supabase, roomId) {
    const { data } = await supabase
        .from('ai_forum_runs')
        .select('*')
        .eq('room_id', roomId)
        .eq('state', 'ended')
        .order('ended_at', { ascending: false })
        .limit(20);
    return data || [];
}

// ─── Thread + message helpers ─────────────────────────────────────────────────
export async function fetchThreadMessages(supabase, threadId) {
    const { data } = await supabase
        .from('forum_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .limit(200);
    return data || [];
}

export async function fetchBuilderThreads(supabase, roomId) {
    const { data } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('room_id', roomId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
    return data || [];
}

export async function createBuilderThread(supabase, roomId, userId, authorLabel, title, body) {
    const { data, error } = await supabase.from('forum_threads').insert({
        room_id: roomId,
        created_by: userId,
        title,
    }).select().single();
    if (error || !data) throw error || new Error('Thread creation failed');

    if (body?.trim()) {
        await supabase.from('forum_messages').insert({
            thread_id: data.id,
            author_type: 'human',
            author_user_id: userId,
            author_label: authorLabel,
            content: body.trim(),
            metadata: {},
        });
    }
    return data;
}

export async function addHumanReply(supabase, threadId, userId, authorLabel, body) {
    const { data, error } = await supabase.from('forum_messages').insert({
        thread_id: threadId,
        author_type: 'human',
        author_user_id: userId,
        author_label: authorLabel,
        content: body.trim(),
        metadata: {},
    }).select().single();
    if (error) throw error;
    return data;
}

export async function addReaction(supabase, messageId, userId, reaction) {
    await supabase.from('forum_reactions').insert({ message_id: messageId, user_id: userId, reaction });
}

// ─── AI Run orchestration ─────────────────────────────────────────────────────
export async function startKetamRun(supabase, roomId, topic, userId) {
    const { data: thread, error: tErr } = await supabase.from('forum_threads').insert({
        room_id: roomId,
        created_by: userId || null,
        title: '[Ketam] ' + topic.slice(0, 80),
        status: 'open',
    }).select().single();
    if (tErr) throw tErr;

    await supabase.from('forum_messages').insert({
        thread_id: thread.id,
        author_type: 'system',
        author_label: 'KETAM_SYSTEM',
        content: 'Ketam Board session started. Topic: "' + topic + '"',
        metadata: {},
    });

    const { data: run, error: rErr } = await supabase.from('ai_forum_runs').insert({
        room_id: roomId,
        thread_id: thread.id,
        state: 'running',
        topic_seed: topic,
        started_at: new Date().toISOString(),
        turn_index: 0,
        max_turns: 40,
    }).select().single();
    if (rErr) throw rErr;

    return { run, thread };
}

export async function runNextTurn(supabase, run, agents, recentMessages, signal) {
    if (!agents.length) throw new Error('No agents available');
    const agent = agents[run.turn_index % agents.length];

    const ctx = recentMessages.slice(-6).map(m => m.author_label + ': ' + m.content).join('\n');

    let sys = agent.system_prompt;
    if (signal === 'go_deeper')     sys += '\n\nGo much deeper on the last point. Elaborate with specifics.';
    if (signal === 'challenge')     sys += '\n\nChallenge the last statement. Find its weakest assumption and push back.';
    if (signal === 'summarize_now') sys += '\n\nSummarize the entire discussion in 3 concise key points.';
    if (signal === 'switch_topic')  sys += '\n\nPivot to a fresh related angle of this topic.';

    const userMsg = ctx
        ? 'Continue the discussion.\n\nContext:\n' + ctx
        : 'Start the debate on this topic: "' + run.topic_seed + '"';

    const reply = await callNvidiaLLM(sys, userMsg, agent.nvidia_model);

    const { data: msg, error } = await supabase.from('forum_messages').insert({
        thread_id: run.thread_id,
        author_type: 'ai',
        author_ai_id: agent.agent_id,
        agent_role: agent.role,
        author_label: agent.agent_name,
        content: reply,
        metadata: { run_id: run.id, turn: run.turn_index },
    }).select().single();
    if (error) throw error;

    await supabase.from('ai_forum_runs').update({ turn_index: run.turn_index + 1 }).eq('id', run.id);
    return { msg, agent };
}

export async function endKetamRun(supabase, runId) {
    await supabase.from('ai_forum_runs').update({
        state: 'ended',
        ended_at: new Date().toISOString(),
    }).eq('id', runId);
}

export async function setRunState(supabase, runId, state) {
    await supabase.from('ai_forum_runs').update({ state }).eq('id', runId);
}

