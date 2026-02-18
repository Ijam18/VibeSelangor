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
        answer: `Okay bro, senang je nak join VibeSelangor! 🚀\n\n1. Klik butang **"Become a builder now!"** kat header\n2. Isi details — nama, daerah, idea projek, dan WhatsApp\n3. Verify email kau\n4. Log in dan mula 7-Day Sprint!\n\nPercuma sepenuhnya, terbuka untuk semua orang. NECB — Now Everyone Can Build! 💪`,
        followUp: `Lepas join, kau dapat akses ke Builder Dashboard untuk:\n- Track progress sprint harian\n- Submit log projek\n- Join sesi live di Discord KrackedDevs\n- Earn Vibes dalam Builder Studio game\n\nSesi live pertama adalah Day 1 — situ kau bina prototype pertama! Steady brother. 🔥`,
        relatedTopics: ['Apa itu 7-Day Sprint?', 'Tools apa yang perlu?', 'Betul ke percuma?']
    },
    {
        keywords: ['necb', 'now everyone can build', 'philosophy', 'vision', 'mission', 'falsafah', 'visi'],
        answer: `NECB = **Now Everyone Can Build** 🏗️\n\nDulu ada NECC (Now Everyone Can Code), tapi dah evolve. Sekarang dengan AI tools macam Antigravity, kau tak perlu tahu coding pun boleh bina app. Steady kan?\n\nKau bawa idea dan semangat. Tools yang handle code. Itu philosophy VibeSelangor. 🔥`,
        followUp: `Maksud NECB dalam praktik:\n- Tak perlu tahu code dari scratch\n- Kena ada masalah sebenar yang nak selesaikan\n- Kena konsisten dan show up setiap hari\n- AI tools buat kerja berat\n\nVisi Ijam: setiap daerah Selangor ada builder yang selesaikan masalah tempatan dengan teknologi. Boleh buat punya! 🌟`,
        relatedTopics: ['Macam mana nak join?', 'Tools apa yang perlu?', 'Cerita pasal sprint']
    },
    {
        keywords: ['sprint', 'day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7', '7 day', 'seven day', 'program', 'schedule', '7 hari', 'jadual'],
        answer: `7-Day Sprint VibeSelangor 📅\n\n**Day 1** — Concept & Kenal pasti masalah\n**Day 2** — Profil pengguna sasaran\n**Day 3** — Value proposition dalam satu ayat\n**Day 4** — Blueprint ciri-ciri utama\n**Day 5** — Visual interface & vibe\n**Day 6** — Final polish & description\n**Day 7 (LIVE)** — Show & Final Review\n\nSetiap hari build on the last. By Day 7, kau ada projek real untuk showcase. Steady! 🎯`,
        followUp: `Details lanjut pasal sprint:\n\n- **Day 1 & 7** adalah sesi LIVE di Discord (2 jam each)\n- **Day 2-6** self-paced dengan async check-ins\n- Guna Antigravity + ChatGPT untuk bina app\n- By Day 7, deploy ke Vercel dan submit ke Showcase\n\nSprint Assistant dalam dashboard kau bagi daily prompts untuk keep on track. No worries, ada guide! 🚀`,
        relatedTopics: ['Tools apa yang perlu?', 'Macam mana nak join Discord?', 'Apa itu Showcase?']
    },
    {
        keywords: ['onboarding', 'skill', 'skills', 'learn', 'belajar', 'library', 'vibe coding', 'builder guide', 'skill creator', 'pustaka'],
        answer: `Skills Library VibeSelangor 📚 — 4 Core Skills:\n\n1. **Onboarding** — Misi kami (Community First, Vibe High, Ship Fast), setup tools (Cursor, Supabase, Node.js)\n2. **Vibe Coding** — Dari manual coder ke "Vibe Architect". Guna bahasa natural untuk guide AI. Ikut 2-3 Tries Rule.\n3. **Builder Guide** — Mindset bina "digital building". Master the Master Prompt Template.\n4. **Skill Creator** — Extend kemampuan Ijam Bot dengan buat modular .md skill files.\n\nSemua skills ada dalam folder VS_Skills. Steady! 🚀`,
        followUp: `Deep dive pasal Vibe Coding 🎯:\n\n**2-3 Tries Rule**: Kalau AI tak boleh selesaikan dalam 3 percubaan, stop dan rethink approach. Jangan keep prompting arah yang sama.\n\n**Master Prompt Template**:\n"Aku bina [nama app]. Ia selesaikan [masalah] untuk [pengguna]. Core feature adalah [feature]. Guna [tech stack]. Mula dengan [komponen pertama]."\n\nSatu prompt ni boleh generate seluruh project scaffold. Boleh buat punya! 💪`,
        relatedTopics: ['Apa itu Vibe Coding?', 'Macam mana guna Antigravity?', 'Apa itu Builder Guide?']
    },
    {
        keywords: ['krackeddevs', 'kracked', 'community', 'discord', 'ambassador', 'komuniti'],
        answer: `KrackedDevs adalah komuniti builder Malaysia yang guna AI tools untuk ship apps laju! 🔥\n\nWebsite: **krackeddevs.com**\n\nIjam adalah **KrackedDevs Selangor Ambassador** — wakil builder Selangor dalam komuniti nasional ni. Setiap negeri ada ambassador sendiri!\n\nKalau kau dari luar Selangor, pergi ke krackeddevs.com untuk connect dengan ambassador negeri kau. 🇲🇾`,
        followUp: `Lebih pasal KrackedDevs:\n\n- Komuniti builder Malaysia yang fokus guna AI tools\n- Ada ambassador untuk setiap negeri\n- Discord server untuk sesi live, bantuan, dan networking\n- Boleh tengok semua info kat **krackeddevs.com**\n\nJoin Discord KrackedDevs dan cakap "Applying for Selangor Vibe Builder" dalam chat. Steady brother! 💬`,
        relatedTopics: ['Macam mana nak join Discord?', 'Siapa Ijam?', 'Apa itu sprint?']
    },
    {
        keywords: ['antigravity', 'ai tool', 'cursor', 'tool', 'tools', 'supabase', 'vercel'],
        answer: `Tools yang kita guna kat VibeSelangor — semua free! 🤖\n\n- **Antigravity** — AI coding tool utama. Describe apa kau nak, dia tulis code.\n- **Supabase** — Database & auth. Free tier sangat generous.\n- **Cursor** — AI-powered code editor.\n- **Vercel** — Free hosting untuk deploy app kau.\n\nSemua boleh start free. NECB! 💪`,
        followUp: `Nak mula dengan Antigravity:\n1. Download dari antigravity.dev\n2. Buka folder projek kau\n3. Guna chat panel untuk describe apa nak bina\n4. Dia generate code — kau review dan approve\n\nPro tip: Spesifik dalam prompt. "Tambah butang merah yang cakap Submit dan panggil fungsi handleSubmit" lagi bagus dari "tambah butang". Senang je! 🎯`,
        relatedTopics: ['Apa itu Vibe Coding?', 'Macam mana nak deploy ke Vercel?', 'Apa itu Supabase?']
    },
    {
        keywords: ['studio', 'game', 'vibe', 'vibes', 'bug squash', 'room', 'shop', 'item', 'level', 'xp', 'bilik', 'kedai'],
        answer: `Builder Studio 🎮 adalah ruang game personal kau!\n\nEarn **Vibes** (mata wang in-game) dengan:\n- Attend live class (+50 Vibes)\n- Submit sprint log (+100 Vibes)\n- Post dalam forum (+20 Vibes)\n- Main Bug Squash mini-game\n- Collect idle Vibes masa kau away!\n\nSpend Vibes untuk upgrade virtual room — dari meja basic sampai server rack. Level up dari Newbie Builder ke Legendary Builder! 🏆`,
        followUp: `Level Studio dan apa yang unlock:\n\n- **Lv 1** Newbie Builder — Basic Desk, Laptop, Coffee\n- **Lv 2** Junior Builder — Plant, Bookshelf, Bendera Selangor\n- **Lv 3** Builder — Whiteboard, Dual Monitors\n- **Lv 4** Senior Builder — Standing Desk\n- **Lv 5** Expert Builder — Trophy, Rocket Model\n- **Lv 7** Legendary Builder — Server Rack\n\nEarn XP dengan beli items, attend class, dan post forum. Boleh buat punya! 🚀`,
        relatedTopics: ['Macam mana nak earn lebih Vibes?', 'Apa itu Leaderboard?', 'Macam mana nak level up?']
    },
    {
        keywords: ['selangor', 'district', 'daerah', 'kawasan', 'map', 'peta', 'shah alam', 'klang', 'petaling'],
        answer: `VibeSelangor cover semua daerah Selangor! 🗺️\n\nAda builder dari Shah Alam, Petaling Jaya, Subang Jaya, Klang, Gombak, Hulu Selangor, Sepang, dan banyak lagi.\n\nCheck peta interaktif kat homepage — klik mana-mana daerah untuk tengok builder dan projek dari kawasan tu. KL dan Putrajaya pun ada! 📍`,
        followUp: `Peta Selangor tu interaktif bro! 🗺️\n\nKlik mana-mana daerah untuk:\n- Tengok berapa ramai builder dari kawasan tu\n- View submission projek diorang\n- Discover masalah tempatan yang diorang selesaikan\n\nMatlamat: setiap daerah Selangor ada sekurang-kurangnya satu builder aktif. Kau wakil daerah mana? 💪`,
        relatedTopics: ['Macam mana nak join?', 'Apa itu Showcase?', 'Macam mana nak submit projek?']
    },
    {
        keywords: ['pwa', 'install', 'app', 'download', 'pasang', 'phone', 'mobile', 'homescreen', 'home screen', 'telefon'],
        answer: `Boleh install VibeSelangor sebagai PWA (Progressive Web App) kat phone kau! 📱\n\n**Android (Chrome):**\n1. Buka vibeselangor.com dalam Chrome\n2. Tap menu 3 titik (⋮)\n3. Tap "Add to Home screen"\n4. Tap "Install"\n\n**iPhone (Safari):**\n1. Buka vibeselangor.com dalam Safari\n2. Tap butang Share (□↑)\n3. Scroll bawah, tap "Add to Home Screen"\n4. Tap "Add"\n\nWorks offline jugak! Steady. 🚀`,
        followUp: `Kelebihan PWA VibeSelangor:\n- Load lagi laju (cached assets)\n- Works offline untuk dashboard & sprint progress\n- Push notifications (coming soon!)\n- Tak perlu App Store — guna browser je\n\nIcon app akan appear kat home screen macam native app. Tap dan terus masuk! 📱`,
        relatedTopics: ['Boleh guna offline?', 'Features mana yang perlu internet?', 'Macam mana nak update app?']
    },
    {
        keywords: ['showcase', 'project', 'projek', 'portfolio', 'demo', 'submit', 'hantar', 'ship log'],
        answer: `Showcase adalah tempat semua projek builder duduk! 🌟\n\nNak submit projek:\n1. Log in ke Dashboard\n2. Pergi ke "Ship Log Station"\n3. Isi nama projek + details\n4. Tambah link (Threads, GitHub, atau website)\n5. Klik "CHECK-IN & SHIP LOG"\n\nProjek kau akan appear kat Showcase public dan peta daerah. Semua orang boleh tengok! 👀`,
        followUp: `Tips untuk submission Showcase yang power:\n- Guna tajuk projek yang clear dan descriptive\n- Explain masalah yang kau selesaikan dalam 1-2 ayat\n- Tambah URL yang working (Vercel deployment lagi bagus)\n- Include daerah kau supaya appear kat peta\n\nShowcase tu public — potential users, employers, dan collaborators boleh jumpa kau kat sana! 🌟`,
        relatedTopics: ['Macam mana nak deploy ke Vercel?', 'Apa itu Leaderboard?', 'Macam mana nak join sprint?']
    },
    {
        keywords: ['leaderboard', 'ranking', 'top', 'best', 'winner', 'champion', 'kedudukan', 'tangga'],
        answer: `Builder Leaderboard rank semua builder VibeSelangor! 🏆\n\nRanking based on:\n- Sprint log submissions\n- Class attendance\n- Forum activity\n- Game Vibes earned\n\nCheck tab Leaderboard untuk tengok kedudukan kau. Boleh ke top 3? 💪`,
        followUp: `Cara naik Leaderboard laju:\n1. Submit sprint logs setiap hari (+100 Vibes each)\n2. Attend setiap live class (+50 Vibes)\n3. Post dalam forum kerap (+20 Vibes per post)\n4. Main Bug Squash untuk extra Vibes\n5. Beli Studio items untuk earn XP\n\nConsistency beats intensity — show up setiap hari! 🔥`,
        relatedTopics: ['Macam mana nak earn Vibes?', 'Apa itu Studio?', 'Macam mana nak submit sprint log?']
    },
    {
        keywords: ['forum', 'post', 'discuss', 'question', 'soalan', 'help', 'tolong', 'tanya', 'bantuan'],
        answer: `Builders Forum adalah ruang komuniti kau! 💬\n\nKau boleh:\n- Tanya soalan pasal projek\n- Share wins dan progress\n- Dapat feedback dari builder lain\n- Connect dengan builder dari daerah lain\n\nLog in untuk post dan reply. Setiap post earn kau Vibes! 🎯`,
        followUp: `Tips untuk dapat bantuan yang bagus dalam forum:\n- Spesifik pasal masalah kau (include error messages)\n- Share apa yang dah kau cuba\n- Tambah URL projek kalau berkaitan\n- Tag post dengan hari yang berkaitan (contoh: "Day 3 help")\n\nKomuniti ni friendly — jangan segan nak tanya. Semua orang start dari zero. 🤝`,
        relatedTopics: ['Macam mana nak earn Vibes dari forum?', 'Discord untuk apa?', 'Macam mana nak join?']
    },
    {
        keywords: ['free', 'cost', 'bayar', 'harga', 'price', 'paid', 'percuma', 'kos'],
        answer: `VibeSelangor 100% PERCUMA! 🎉\n\nTak ada hidden costs, tak ada premium tiers. Seluruh program — classes, dashboard, forum, game studio — semua free.\n\nTools yang kita guna (Supabase, Vercel) pun ada free tier yang generous. Kau boleh bina dan deploy app real tanpa spend satu sen pun! 💰`,
        followUp: `Had free tier yang perlu tahu:\n- **Supabase Free**: 500MB database, 50MB file storage, 50,000 monthly active users\n- **Vercel Free**: Unlimited deployments, 100GB bandwidth/bulan\n- **Antigravity**: Check antigravity.dev untuk free tier semasa\n\nUntuk projek sprint, kau takkan hit had ni. Build freely! 🚀`,
        relatedTopics: ['Tools apa yang perlu?', 'Macam mana nak deploy?', 'Macam mana nak join?']
    },
    {
        keywords: ['ijam', 'zarulijam', 'founder', 'who', 'siapa', 'creator', 'pengasas'],
        answer: `Aku Ijam (Zarulijam)! 👋\n\nAku start VibeSelangor untuk bina komuniti builder yang fokus di Selangor. Falsafah aku: "Bagi orang ikan, dia makan sehari. Ajar dia memancing, dia makan selamanya."\n\nAku juga KrackedDevs Selangor Ambassador. Boleh jumpa aku kat Threads @_zarulijam — DM bila-bila masa! 🧵`,
        followUp: `Lebih pasal visi Ijam:\n\nAku percaya setiap orang Selangor yang ada idea dan semangat layak dapat tools untuk bina app — tak kira background teknikal.\n\nVibeSelangor adalah cara aku buktikan NECB (Now Everyone Can Build) tu real. Bukan sekadar slogan.\n\nKalau ada feedback, kritikan, atau sekadar nak borak — DM aku kat Threads. Aku baca setiap mesej! 🙏`,
        relatedTopics: ['Apa itu NECB?', 'Apa itu KrackedDevs?', 'Macam mana nak contact Ijam?']
    },
    {
        keywords: ['offline', 'no internet', 'connection', 'network', 'slow', 'internet', 'sambungan'],
        answer: `VibeSelangor works offline sebagai PWA! 📱\n\nInstall kat phone kau (tengok "cara install" untuk steps) dan kau boleh:\n- View cached pages\n- Baca sprint progress kau\n- Access skills library\n\nBeberapa features macam live chat dan forum perlu internet. Tapi core dashboard works offline! 💪`,
        followUp: `Features yang works offline:\n✅ Dashboard (cached)\n✅ Sprint progress view\n✅ Skills library\n✅ Leaderboard (versi cached terakhir)\n\nFeatures yang perlu internet:\n❌ Live class chat\n❌ Forum posts/replies\n❌ Submit sprint logs\n❌ Game Studio sync\n\nInstall sebagai PWA untuk pengalaman offline terbaik! 📱`,
        relatedTopics: ['Macam mana nak install sebagai PWA?', 'Apa itu Skills Library?', 'Macam mana dashboard berfungsi?']
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
                    return `${entry.followUp || entry.answer}\n\n💡 Nak tahu lebih? Tanya aku pasal:\n• "${entry.relatedTopics?.[0] || 'Macam mana nak join'}"\n• "${entry.relatedTopics?.[1] || 'Apa itu NECB?'}"`;
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
            return `${response}\n\n💬 Boleh tanya aku jugak pasal: ${bestMatch.relatedTopics.map(t => `"${t}"`).join(', ')}`;
        }
        return response;
    }

    // Generic fallback with context hint
    const lastTopic = recentHistory.filter(m => m.role === 'user').pop()?.content;
    if (lastTopic) {
        return `Hmm, aku tak pasti pasal tu dalam mod offline 😅\n\nTadi kita cakap pasal "${lastTopic.slice(0, 40)}..." — nak aku elaborate lagi?\n\nAtau cuba tanya:\n• "Macam mana nak join VibeSelangor"\n• "Apa itu NECB?"\n• "7-Day Sprint"\n• "Apa itu Studio game?"\n\nDM Ijam kat Threads @_zarulijam untuk soalan lain! 🧵`;
    }

    return `Eh, AI connection tak available sekarang 😅\n\nTapi aku still boleh tolong! Cuba tanya aku pasal:\n• "Macam mana nak join VibeSelangor"\n• "Apa itu NECB?"\n• "7-Day Sprint tu macam mana"\n• "Cara install sebagai PWA"\n• "Apa itu Studio game?"\n• "Komuniti KrackedDevs"\n\nOr DM Ijam terus kat Threads @_zarulijam! 🧵`;
}

// ─── System Prompts ───────────────────────────────────────────────────────────

export const ZARULIJAM_SYSTEM_PROMPT = `Kau adalah Ijam Bot — AI persona untuk Ijam (Zarulijam), pengasas VibeSelangor dan KrackedDevs Selangor Ambassador.

PERATURAN UTAMA:
1. SENTIASA balas dalam Bahasa Melayu. Boleh mix sikit English untuk terms teknikal tapi ayat mesti Melayu.
2. Gaya cakap: chill, laid-back Malaysian bro. Guna "okay bro", "steady brother", "no worries", "relax", "senang je", "boleh buat punya". JANGAN guna "weh" atau "lah" terlalu banyak — lebih kepada cool, calm, confident.
3. Balas ringkas dan padat — 3-5 ayat je kecuali soalan perlukan detail.
4. Kalau tak tahu, cakap terus terang. Jangan reka-reka.

Latar belakang Ijam:
- Pengasas VibeSelangor — komuniti builder fokus di Selangor, Malaysia
- KrackedDevs Selangor Ambassador
- Falsafah: "Bagi orang ikan, dia makan sehari. Ajar dia memancing, dia makan selamanya."
- Percaya dalam NECB: Now Everyone Can Build — AI tools dah buat coding accessible untuk semua orang
- Visi: setiap daerah Selangor ada builder yang selesaikan masalah tempatan dengan teknologi

Tentang VibeSelangor (jawab soalan berdasarkan info ni):
- Platform percuma untuk builder Selangor bina apps dalam 7 hari
- Ada 7-Day Sprint: Day 1 (Concept), Day 2 (User Profile), Day 3 (Value Prop), Day 4 (Features), Day 5 (UI/Vibe), Day 6 (Polish), Day 7 LIVE (Showcase)
- Day 1 dan Day 7 adalah sesi LIVE di Discord KrackedDevs (discord.gg/3TZeZUjc)
- Tools yang digunakan: Antigravity (AI coding), Supabase (database), Vercel (hosting), Cursor (editor) — semua free
- Ada Builder Dashboard, Forum, Showcase, Leaderboard, dan Builder Studio (game)
- Builder Studio: earn Vibes (currency) dengan attend class (+50), submit log (+100), post forum (+20), main Bug Squash
- Spend Vibes untuk upgrade virtual room — dari Newbie Builder sampai Legendary Builder (Level 7)
- Showcase: submit projek lepas sprint, nampak kat public dan peta Selangor
- Leaderboard: ranking based on Vibes, sprint logs, class attendance
- Forum: tanya soalan, share progress, dapat feedback dari builder lain
- PWA: boleh install kat phone — works offline untuk dashboard dan sprint progress
- Skills Library: 4 skills — Onboarding, Vibe Coding (2-3 Tries Rule), Builder Guide (Master Prompt Template), Skill Creator
- Contact Ijam: Threads @_zarulijam

Guna emoji sekali-sekala untuk buat suasana fun. Encourage builder, bagi confidence.`;

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
