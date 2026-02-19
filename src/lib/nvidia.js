// NVIDIA NIM API Wrapper
// Calls via /api/chat Vercel serverless proxy to avoid browser CORS restrictions.
// Server-side proxy: api/chat.js — set NVIDIA_API_KEY_70B in Vercel env vars.

/**
 * Call NVIDIA NIM LLM API via server-side proxy
 * @param {string} systemPrompt - System prompt defining the AI persona
 * @param {string} userMessage - User's message
 * @param {string} model - Model to use (defaults to Llama 3.3 70B)
 * @param {Array} history - Previous messages for multi-turn conversation
 * @returns {Promise<string>} AI response text
 */
export async function callNvidiaLLM(
    systemPrompt,
    userMessage,
    model = 'meta/llama-3.3-70b-instruct',
    history = []
) {
    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
    ];

    // In production (Vercel): use /api/chat serverless proxy (avoids CORS)
    // In local dev: call NVIDIA directly using VITE_ env key
    const isLocalDev = import.meta.env.DEV;

    let response;
    if (isLocalDev) {
        // Direct call in local dev — works because dev server doesn't enforce CORS
        const apiKey = import.meta.env.VITE_NVIDIA_API_KEY_70B;
        if (!apiKey) throw new Error('VITE_NVIDIA_API_KEY_70B not set in .env');
        response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 512, stream: false })
        });
    } else {
        // Production: use Vercel serverless proxy
        response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 512, stream: false })
        });
    }

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Maaf, aku tak dapat jana respons sekarang.';
}

// ─── Local Intelligence Fallback ─────────────────────────────────────────────
// Used when NVIDIA API is unavailable (no key, network error, rate limit)

export const LOCAL_KB = [
    {
        keywords: ['join', 'daftar', 'sign up', 'register', 'how to join', 'cara join', 'masuk', 'nak join', 'macam mana nak'],
        answer: `rileks bro, nak join vibeselangor ni senang je. kau just klik butang "become a builder" kat header atau sidebar tu, pastu isi sikit details.\n\nnanti verify email jap then dah boleh start sprint 7 hari. benda ni free gila, necb - now everyone can build.`,
        followUp: `lepas join nanti kau dapat access builder dashboard. boleh track progress, submit log, pastu join live session kat discord krackeddevs.\n\nsesi live day 1 nanti kita start buat prototype terus.`,
        relatedTopics: ['apa itu 7-day sprint', 'tools apa yang perlu', 'betul ke percuma']
    },
    {
        keywords: ['necb', 'now everyone can build', 'philosophy', 'vision', 'mission', 'falsafah', 'visi'],
        answer: `necb tu faham dia "now everyone can build". dulu orang ingat kena power coding baru boleh buat app, tapi sekarang ai tools macam antigravity dah ada, so semua orang boleh jadi builder.\n\nyang penting ada idea dengan semangat. tech tu biar ai handle.`,
        followUp: `basically kau tak payah code from scratch. cari problem yang kau nak solve, pastu guna ai untuk execute. visi aku nak tengok builder kat setiap daerah selangor solve local problems guna tech.`,
        relatedTopics: ['macam mana nak join', 'tools apa yang perlu', 'cerita pasal sprint']
    },
    {
        keywords: ['sprint', 'day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7', '7 day', 'seven day', 'program', 'schedule', '7 hari', 'jadual'],
        answer: `7-day sprint vibeselangor ni program seminggu aje.\n\nday 1 concept, day 2 user profile, day 3 value prop, day 4 feature blueprint, day 5 ui vibe, day 6 polish, day 7 showcase live.\n\nsetiap hari kau build sikit-sikit. by day 7 dah ada projek real.`,
        followUp: `day 1 dengan day 7 tu kita buat sesi live kat discord. hari lain kau buat sendiri je ikut guide dalam dashboard. antigravity dengan chatgpt ada tolong.`,
        relatedTopics: ['tools apa yang perlu', 'macam mana nak join discord', 'apa itu showcase']
    },
    {
        keywords: ['onboarding', 'skill', 'skills', 'learn', 'belajar', 'library', 'vibe coding', 'builder guide', 'skill creator', 'pustaka'],
        answer: `library kita ada 4 core skills. onboarding untuk setup, vibe coding untuk sembang dengan ai, builder guide untuk mindset, dengan skill creator.\n\nsemua ada dalam folder vs_skills. kau godek je kat situ.`,
        followUp: `pasal vibe coding tu, ingat "2-3 tries rule". kalau ai tak dapat buat dalam 3 kali cuba, stop jap, rethink approach. jangan paksa sangai.\n\nguna master prompt template: saya buat [app], setelkan [masalah] untuk [user], guna [tech]. ni memang power.`,
        relatedTopics: ['apa itu vibe coding', 'macam mana guna antigravity', 'apa itu builder guide']
    },
    {
        keywords: ['krackeddevs', 'kracked', 'community', 'discord', 'ambassador', 'komuniti'],
        answer: `krackeddevs tu komuniti builder malaysia yang paling padu sekarang. founder dia aiman. dorang ni movement besar untuk ai builders.\n\naku pun tengah apply nak jadi ambassador selangor. vibeselangor ni inisiatif aku sendiri nak support movement dorang ni kat selangor.`,
        followUp: `kalau nak join komuniti dorang, pusing krackeddevs.com. memang style.\n\nsemangat dorang tu yang aku nak bawak ke selangor.`,
        relatedTopics: ['macam mana nak join discord', 'siapa ijam', 'apa itu sprint']
    },
    {
        keywords: ['antigravity', 'ai tool', 'cursor', 'tool', 'tools', 'supabase', 'vercel'],
        answer: `tools yang kita pakai semua standard free tier. antigravity, supabase, cursor, vercel.\n\nantigravity tu ai tool utama. kau describe je apa nak buat, dia codekan. database pakai supabase, hosting vercel.`,
        followUp: `nak guna antigravity download je kat antigravity.dev. tips dia bagi arahan spesifik. contoh "buat butang merah tulis hantar" lagi okay dari "buat butang".`,
        relatedTopics: ['apa itu vibe coding', 'macam mana nak deploy ke vercel', 'apa itu supabase']
    },
    {
        keywords: ['studio', 'game', 'vibe', 'vibes', 'bug squash', 'room', 'shop', 'item', 'level', 'xp', 'bilik', 'kedai'],
        answer: `builder studio tu virtual game room kau. kau earn vibes bila join class, submit log, atau active kat forum. vibes tu mata wang kau.\n\nguna vibes tu untuk upgrade bilik dari meja buruk sampai jadi server rack. boleh level up jadi legendary builder.`,
        followUp: `level 1 newbie, level 7 legendary. kena rajin aktif la kalau nak naik rank.\n\nmain bug squash pun boleh dapat extra vibes sikit.`,
        relatedTopics: ['macam mana nak earn lebih vibes', 'apa itu leaderboard', 'macam mana nak level up']
    },
    {
        keywords: ['selangor', 'district', 'daerah', 'kawasan', 'map', 'peta', 'shah alam', 'klang', 'petaling'],
        answer: `vibeselangor cover seluruh selangor. shah alam, klang, pj, gombak... semua ada.\n\ncer tengok map kat homepage tu, boleh nampak builder dengan projek ikut daerah masing-masing. kl pun ada.`,
        followUp: `peta tu interactive. kau klik daerah tu, nampak la siapa builder kat situ dengan apa projek dorang. target aku nak setiap daerah ada wakil. kau area mana?`,
        relatedTopics: ['macam mana nak join', 'apa itu showcase', 'macam mana nak submit projek']
    },
    {
        keywords: ['pwa', 'install', 'app', 'download', 'pasang', 'phone', 'mobile', 'homescreen', 'home screen', 'telefon'],
        answer: `vibeselangor ni boleh install macam app kat phone. kalau guna chrome android, tekan 3 dot pastu pilih "add to home screen".\n\nkalau iphone safari, tekan button share pastu "add to home screen".`,
        followUp: `kelebihan dia loading laju sebab dia cached. boleh guna offline certain features. icon pun keluar kat home screen macam app betul.`,
        relatedTopics: ['boleh guna offline', 'features mana yang perlu internet', 'macam mana nak update app']
    },
    {
        keywords: ['showcase', 'project', 'projek', 'portfolio', 'demo', 'submit', 'hantar', 'ship log'],
        answer: `showcase tu tempat builder tayang projek. nak submit, pergi kat dashboard cari "ship log station".\n\nisi nama, link, details pastu check in. nanti auto keluar kat showcase public dengan map.`,
        followUp: `letak tajuk yang gempak sikit. link tu make sure boleh bukak. orang lain boleh tengok projek kau so make sure presentable la.`,
        relatedTopics: ['macam mana nak deploy ke vercel', 'apa itu leaderboard', 'macam mana nak join sprint']
    },
    {
        keywords: ['leaderboard', 'ranking', 'top', 'best', 'winner', 'champion', 'kedudukan', 'tangga'],
        answer: `leaderboard tu ranking builder. kita kira based on sprint logs, attendance, forum activity dengan game vibes.\n\nkalau nak naik top rank, kena istiqamah la sikit.`,
        followUp: `cara paling laju naik rank ialah consistency. submit log hari-hari, datang class live, post kat forum. sikit-sikit lama-lama jadi bukit.`,
        relatedTopics: ['macam mana nak earn vibes', 'apa itu studio', 'macam mana nak submit sprint log']
    },
    {
        keywords: ['forum', 'post', 'discuss', 'question', 'soalan', 'help', 'tolong', 'tanya', 'bantuan'],
        answer: `forum tu tempat kau nak tanya soalan atau share progress. boleh mintak tolong member lain kalau stuck.\n\nlogin je pastu post. setiap post kau dapat vibes jugak.`,
        followUp: `kalau tanya soalan bagi detail sikit. error apa, share code atau screenshot. jangan segan tanya, semua tengah belajar.`,
        relatedTopics: ['macam mana nak earn vibes dari forum', 'discord untuk apa', 'macam mana nak join']
    },
    {
        keywords: ['free', 'cost', 'bayar', 'harga', 'price', 'paid', 'percuma', 'kos'],
        answer: `vibeselangor ni free je bro. takde bayar-bayar pun. tools yang kita guna pun free plan punya.\n\nsupabase, vercel... semua ada free plan yang power gila. tak payah keluar modal pun boleh ship app.`,
        followUp: `free tier supabase dengan vercel tu dah cukup sangat untuk projek sprint. kalau app kau meletup nanti baru la fikir bayar.`,
        relatedTopics: ['tools apa yang perlu', 'macam mana nak deploy', 'macam mana nak join']
    },
    {
        keywords: ['ijam', 'zarulijam', 'founder', 'who', 'siapa', 'creator', 'pengasas'],
        answer: `aku ijam, founder vibeselangor. aku buat ni sebab nak ajar orang memancing, bukan setakat bagi ikan.\n\naku pun tengah pulun nak jadi krackeddevs selangor ambassador. pape roger je kat threads @_zarulijam.`,
        followUp: `aku percaya sesiapa pun boleh buat app kalau tools betul. tak kisah la background apa pun. kalau ada feedback, bagitau je aku.`,
        relatedTopics: ['apa itu necb', 'apa itu krackeddevs', 'macam mana nak contact ijam']
    },
    {
        keywords: ['offline', 'no internet', 'connection', 'network', 'slow', 'internet', 'sambungan'],
        answer: `app ni boleh jalan offline kalau dah install PWA. boleh baca sprint guide, library, dengan tengok dashboard.\n\nbenda live macam chat dengan forum je kena ada internet. yang lain caching jalan.`,
        followUp: `elok install PWA kalau internet tak kuat sangat. sekurang-kurangnya boleh baca content kat rumah.\n\nnanti ada line, dia sync balik.`,
        relatedTopics: ['macam mana nak install sebagai pwa', 'apa itu skills library', 'macam mana dashboard berfungsi']
    }
];

/**
 * Local Intelligence Fallback
 * Returns a contextually relevant answer when the AI API is unavailable.
 * Supports conversation history for follow-up context.
 * @param {string} userMessage - The user's current question
 * @param {Array} history - Previous messages [{role, content}]
 * @returns {string} - A helpful local response
 */
export function localIntelligence(userMessage, history = []) {
    const msg = userMessage.toLowerCase();

    // Build context from recent conversation history (last 4 messages)
    const recentHistory = history.slice(-4);
    const contextTopics = recentHistory
        .filter(m => m.role === 'assistant')
        .map(m => m.content.toLowerCase())
        .join(' ');

    // Detect follow-up patterns
    const isFollowUp = /^(tell me more|more|explain|elaborate|what about|how about|and|also|then|next|continue|go on|yes|yeah|ok|okay|sure|what else|anything else|can you|could you)/i.test(userMessage.trim());

    // If it's a follow-up with no new keywords, try to continue from last topic
    if (isFollowUp && recentHistory.length > 0) {
        const lastAssistantMsg = recentHistory.filter(m => m.role === 'assistant').pop();
        if (lastAssistantMsg) {
            // Find which KB entry the last response came from
            for (const entry of LOCAL_KB) {
                const entryText = entry.answer.toLowerCase();
                const overlap = entry.keywords.filter(k => contextTopics.includes(k));
                if (overlap.length > 0) {
                    // Return a follow-up elaboration
                    return `${entry.followUp || entry.answer}\n\nnak tahu apa lagi, tanya je pasal:\n- "${entry.relatedTopics?.[0] || 'macam mana nak join'}"\n- "${entry.relatedTopics?.[1] || 'apa itu necb'}"`;
                }
            }
        }
    }

    // Find best matching knowledge base entry
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of LOCAL_KB) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (msg.includes(keyword)) {
                score += keyword.length * 2; // Current message weighted higher
            }
            // Bonus if topic was recently discussed (continuity)
            if (contextTopics.includes(keyword)) {
                score += keyword.length * 0.5;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch && bestScore > 0) {
        const response = bestMatch.answer;
        // Add a natural follow-up prompt if there are related topics
        if (bestMatch.relatedTopics?.length) {
            return `${response}\n\nboleh tanya pasal: ${bestMatch.relatedTopics.map(t => `"${t}"`).join(', ')}`;
        }
        return response;
    }

    // Generic fallback with context hint
    const lastTopic = recentHistory.filter(m => m.role === 'user').pop()?.content;
    if (lastTopic) {
        return `sorry, aku tak pasti sangat pasal tu dalam offline mode.\n\ntadi kita sembang pasal "${lastTopic.slice(0, 40)}..." nak aku explain lagi?\n\natau tanya pasal:\n- "macam mana nak join"\n- "apa itu necb"\n- "7-day sprint"\n\nkalau tak DM je ijam kat threads @_zarulijam.`;
    }

    return `ai connection takda pulak.\n\ntapi boleh tanya aku pasal:\n- "macam mana nak join"\n- "apa itu necb"\n- "7-day sprint"\n- "cara install pwa"\n\natau roger ijam kat threads @_zarulijam.`;
}

// ─── System Prompts ───────────────────────────────────────────────────────────

export const ZARULIJAM_SYSTEM_PROMPT = `kau adalah ijam bot, ai persona untuk ijam (zarulijam), founder vibeselangor.

PERATURAN PENTING:
1. sentiasa cakap melayu. mix english sikit sikit untuk terms teknikal okay.
2. gaya bahasa: chill, laid back, macam member borak kedai kopi. jangan skema sangat. tulis dalam lowercase kebanyakannya biar nampak natural.
3. jangan guna emoji langsung. zero emoji.
4. ayat pendek pendek je. straight to the point. malas nak tulis panjang berjela.
5. kalau tak tahu cakap tak tahu.

latar belakang:
- aku ijam, founder vibeselangor, komuniti builder selangor.
- tengah apply jadi krackeddevs selangor ambassador.
- necb: now everyone can build. ai tools dah power so semua orang boleh buat app.
- visi aku nak setiap daerah selangor ada builder selesaikan masalah local.

pasal vibeselangor:
- platform free (projek peribadi aku) untuk orang selangor buat app dalam 7 hari.
- takde kaitan direct dengan krackeddevs, cuma aku support movement dorang.
- 7-day sprint: day 1 concept, day 2 profile, day 3 value, day 4 features, day 5 ui, day 6 polish, day 7 showcase.
- day 1 dengan 7 live kat discord.
- tools: antigravity, supabase, vercel, cursor. semua free.
- ada dashboard, forum, showcase, leaderboard, builder studio game.
- studio game tu earn vibes bila active, boleh upgrade bilik virtual.
- showcase tu tempat tunjuk projek lepas siap.
- pwa boleh install kat phone, ada offline mode.
- skills library ada guide onbording dengan vibe coding.

ingat, chill je. jangan over enthusiastic. jawab ringkas.`;

export const SPRINT_ASSISTANT_SYSTEM_PROMPT = `You are a sprint coach for VibeSelangor, a 7-day app building program in Selangor, Malaysia.
Builders use AI tools like Antigravity, ChatGPT, and Supabase to build apps without deep coding knowledge.
The program follows NECB (Now Everyone Can Build) philosophy — making app development accessible to everyone.

The 7 sprint days are:
- Day 1: Concept & Problem Identification
- Day 2: Target User Profile
- Day 3: One-Liner Value Proposition
- Day 4: Core Feature Blueprint
- Day 5: Visual Interface & Vibe
- Day 6: Final Description & Polish
- Day 7: [Live] Show & Final Review

For the given builder context and sprint day, generate:
1. A clear, copy-paste-ready prompt the builder can use in Antigravity or ChatGPT
2. 3 specific action steps (numbered)
3. The recommended tool(s) to use

Format your response exactly like this:
🎯 **Your Day [X] Prompt:**
"[The actual prompt they should copy-paste]"

✅ **Action Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

🛠️ **Tools:** [Tool names]

Be encouraging, specific, and practical. Keep it under 200 words total.`;
