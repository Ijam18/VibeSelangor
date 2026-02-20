import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Globe, Server,
    Sparkles,
    Brain,
    Database,
    Github,
    Rocket,
    ArrowRight,
    ArrowLeft,
    ExternalLink,
    BookOpen,
    Users,
    Bot,
    Terminal,
    SendHorizontal,
    CheckCircle2,
    Lightbulb,
    Folder,
    User,
    Settings,
    Power,
    Trash2,
    Gamepad2,
    Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callNvidiaLLM, localIntelligence, ZARULIJAM_SYSTEM_PROMPT } from '../lib/nvidia';
import BuilderStudioPage from './BuilderStudioPage';
import { useWeather } from '../utils/useWeather';

const LESSONS_IJAM = [
    {
        id: "setup-environment",
        icon: Sparkles,
        title: "Install Node.js + Antigravity (First Setup)",
        stage: "Foundation",
        summary: "Ni setup paling basic sebelum mula vibe coding dengan lancar.",
        eli5: "Node.js ni macam enjin kereta. Antigravity pula co-pilot AI kau. Kalau enjin takde, kereta tak jalan.",
        steps: [
            "Install Node.js LTS dari website rasmi.",
            "Buka terminal, check `node -v` dan `npm -v`.",
            "Install/open Antigravity ikut panduan platform kau.",
            "Dalam project folder, run `npm install`.",
            "Run `npm run dev` dan pastikan website boleh hidup."
        ],
        linkLabel: "Buka Node.js Download",
        linkUrl: "https://nodejs.org/en/download"
    },
    {
        id: "setup-ai-api-key",
        icon: Brain,
        title: "Dapatkan API Key AI & Pasang di Antigravity",
        stage: "Foundation",
        summary: "Penting: Manage token API korang supaya tak mahal. OpenRouter paling jimat untuk guna semua model.",
        eli5: "API Key ni macam kad pengenalan. Korang boleh guna Groq (laju & murah) atau NVIDIA LLM. OpenRouter pula act macam wallet prepaid untuk bayar semua model.",
        steps: [
            "Buka platform pilihan: Groq (Percuma/Murah), NVIDIA LLM, atau OpenRouter (Jimat).",
            "Register akaun dan ambil 'API Keys'.",
            "Buka VSCode/Cursor, pergi bahagian settings Antigravity.",
            "Paste API key dan pilih model.",
            "Elakkan guna Opus/Sonnet untuk benda simple sebab mahal token."
        ],
        linkLabel: "Dapatkan Groq API Key",
        linkUrl: "https://console.groq.com/keys"
    },
    {
        id: "chatgpt-personality",
        icon: Users,
        title: "Set Up Personality ChatGPT",
        stage: "Ideation",
        summary: "Ajar ChatGPT jadi pakar sebelum kau tanya teknikal.",
        eli5: "Macam kau lantik Manager. Mula-mula bagi dia title 'Senior UI Engineer & PM', baru instruction dia mantap.",
        steps: [
            "Buka ChatGPT.",
            "Tulis prompt: 'You are an expert React UI Engineer and Product Manager...'",
            "Ceritakan idea app kau secara ringkas.",
            "Minta dia suggest features dan UX flow sebelum buat apa-apa.",
            "Bincang sampai idea tu solid."
        ],
        linkLabel: "Buka ChatGPT",
        linkUrl: "https://chat.openai.com"
    },
    {
        id: "chatgpt-master-prompt",
        icon: BookOpen,
        title: "Generate The Master Prompt",
        stage: "Ideation",
        summary: "Tukar idea jadi satu arahan lengkap untuk Antigravity.",
        eli5: "Bila idea dah confirm, kau suruh ChatGPT rumuskan jadi satu pelan tindakan (blueprint) yang lengkap untuk AI lain baca.",
        steps: [
            "Bila brainstorm dah siap di ChatGPT.",
            "Minta ChatGPT: 'Summarize everything we discussed into ONE single master prompt for an AI coding assistant (like Claude 3) to build this app.'",
            "Pastikan prompt tu ada details UI, warna, layout, dan data structure.",
            "Copy Master Prompt tu."
        ],
        linkLabel: "Buka ChatGPT",
        linkUrl: "https://chat.openai.com"
    },
    {
        id: "antigravity-sonnet",
        icon: Rocket,
        title: "Paste Master Prompt ke Antigravity",
        stage: "Vibe Coding",
        summary: "Pilih model yang tepat dan mula bina aplikasi. Sonnet untuk architect, Gemini untuk visual.",
        eli5: "Antigravity ada banyak AI. Claude 3.5 Sonnet = Senior Engineer (steady). Opus = KrackedDev (power gila). Gemini Pro = Junior (cepat). Gemini Flash = UI Designer. Gemini 3.1 = High-Performance All Rounder.",
        steps: [
            "Buka Antigravity dalam project folder.",
            "Pilih AI model yang sesuai: Claude 3.5 Sonnet atau Gemini 3.1 (all-rounder).",
            "Paste Master Prompt dari ChatGPT tadi.",
            "Tekan Enter dan tunggu AI siapkan struktur website dan component.",
            "Kalau nak tukar warna/padding UI, switch ke Gemini Flash (Designer)."
        ],
        linkLabel: "Buka Antigravity Docs",
        linkUrl: "https://antigravity.id"
    },
    {
        id: "github-repo-setup",
        icon: Github,
        title: "Push Code ke GitHub",
        stage: "Versioning",
        summary: "Save code secara cloud supaya tak hilang dan boleh deploy.",
        eli5: "GitHub ni macam Google Drive tapi khas untuk code. Kau 'push' code ke sana untuk simpan secara kekal.",
        steps: [
            "Buka browser dan create GitHub repo baru.",
            "Dalam terminal VSCode, run: `git init`.",
            "Run: `git add .` lepas tu `git commit -m 'initial commit'`.",
            "Penting: Belajar beza `git pull` (tarik code turun) dan `git fetch`.",
            "Run command `git push -u origin main` untuk upload semua code asal ke branch utama (main)."
        ],
        linkLabel: "Buka GitHub",
        linkUrl: "https://github.com"
    },
    {
        id: "vercel-deploy",
        icon: Rocket,
        title: "Deploy ke Vercel",
        stage: "Launch",
        summary: "Pancarkan website kau ke internet. Paste Vercel URL dalam terminal ni untuk dapat Trophy!",
        eli5: "Dalam local, kau je nampak website tu. Vercel akan ambil code dari GitHub dan letak kat server awam.",
        steps: [
            "Create akaun Vercel guna GitHub.",
            "Import repo yang kau baru push tadi.",
            "Biarkan settings default dan tekan Deploy.",
            "Bila dah siap, copy URL `.vercel.app` tu.",
            "PASTE URL TU DALAM TERMINAL INI tekan ENTER untuk complete task!"
        ],
        linkLabel: "Buka Vercel",
        linkUrl: "https://vercel.com"
    },
    {
        id: "vercel-analytics",
        icon: Users,
        title: "Pasang Vercel Analytics",
        stage: "Launch",
        summary: "Track visitor website secara percuma dan mudah.",
        eli5: "Macam pasang CCTV kat kedai, kau boleh nampak berapa orang masuk dan dari mana diorang datang.",
        steps: [
            "Dalam Vercel dashboard, pergi tab Analytics dan klik Enable.",
            "Dalam terminal VSCode, run: `npm i @vercel/analytics`.",
            "Import dan letak component `<Analytics />` dalam fail utama app (contoh: `App.jsx` atau `main.jsx`).",
            "Commit dan push ke GitHub (Vercel akan auto-deploy).",
            "Sekarang kau boleh tengok graf traffic kat Vercel dashboard."
        ],
        linkLabel: "Vercel Analytics Guide",
        linkUrl: "https://vercel.com/docs/analytics/quickstart"
    },
    {
        id: "supabase-setup",
        icon: Database,
        title: "Cipta Database Supabase",
        stage: "Database",
        summary: "Bina database cloud. PENTING: Faham beza Anon Key dan Service Role Key.",
        eli5: "Bila buat akaun login atau simpan data form, kau perlukan backend database. Supabase paling senang untuk mula.",
        steps: [
            "Buat project kat Supabase, tunggu 2-3 minit server setup.",
            "Pergi ke Project Settings > API.",
            "Copy `Project URL` dan `anon - public` key.",
            "AMARAN: Jangan sekali-kali expose `service_role` key! Berbahaya!",
            "Buat file `.env.local` dan masukkan keys tersebut."
        ],
        linkLabel: "Buka Supabase",
        linkUrl: "https://supabase.com"
    },
    {
        id: "supabase-sql",
        icon: Database,
        title: "Run SQL Query & Bina Table",
        stage: "Database",
        summary: "Cara paling cepat cipta struktur kotak data guna AI dan SQL.",
        eli5: "Dari buat table satu per satu pakai mouse, suruh AI generate script SQL, paste dalam Supabase, dan siap sepenip mata.",
        steps: [
            "Minta Antigravity: 'Generate a Supabase SQL query to create a users table with name and email'.",
            "Dalam Supabase dashboard, pergi ke SQL Editor (icon terminal kilat).",
            "Klik New Query, paste code tadi dan tekan RUN.",
            "Pergi ke Table Editor untuk confirm table tu dah wujud.",
            "Disable RLS buat masa ni kalau kau sekadar prototype."
        ],
        linkLabel: "Buka Supabase SQL Editor Guide",
        linkUrl: "https://supabase.com/docs/guides/database/sql-editor"
    },
    {
        id: "supabase-connect",
        icon: Database,
        title: "Sambung Database ke Vercel & UI",
        stage: "Database",
        summary: "Panggil data dari cloud masuk ke UI website korang.",
        eli5: "Wayar dah sambung kat local, tapi Vercel tak tau password Supabase. Kena setting environment variable.",
        steps: [
            "Masukkan credentials Supabase dalam `.env` ke dalam Vercel Dashboard > Settings > Environment Variables.",
            "Suruh Antigravity tulis logic fetchData untuk panggil data dari table.",
            "Minta Antigravity map data tu kat atas UI table atau cards.",
            "Push code ke GitHub, tunggu Vercel deploy.",
            "Boom! Website dah bersambung dengan database live."
        ],
        linkLabel: "Environment Variables Supabase",
        linkUrl: "https://vercel.com/docs/environment-variables"
    },
    {
        id: "custom-domain",
        icon: Rocket,
        title: "Bonus: Beli & Pasang Custom Domain",
        stage: "Bonus",
        summary: "Buang hujung .vercel.app dan nampak professional dengan domain .com.",
        eli5: "Beli nama rumah unik, lepastu sambung letrik ke Vercel.",
        steps: [
            "Beli domain (contoh dari Namecheap atau Porkbun).",
            "Dalam Vercel dashboard > Settings > Domains, add domain yang baru dibeli.",
            "Vercel akan bagi setting A Record dan CNAME.",
            "Copy settings tu dan paste dekat DNS settings di tempat beli domain tu.",
            "Tunggu propagate (kadang cepat, kadang beberapa jam)."
        ],
        linkLabel: "Vercel Domains Guide",
        linkUrl: "https://vercel.com/docs/custom-domains"
    }
    ,

    {
        id: 'install-node-antigravity',
        icon: Sparkles,
        title: 'Install Node.js + Antigravity (First Setup)',
        stage: 'Extended Toolkit',
        summary: 'Ni setup paling basic sebelum mula vibe coding dengan lancar.',
        eli5: 'Node.js ni macam enjin kereta. Antigravity pula co-pilot AI kau. Kalau enjin takde, kereta tak jalan.',
        steps: [
            'Install Node.js LTS dari website rasmi.',
            'Buka terminal, check `node -v` dan `npm -v`.',
            'Install/open Antigravity ikut panduan platform kau.',
            'Dalam project folder, run `npm install`.',
            'Run `npm run dev` dan pastikan website boleh hidup.'
        ],
        linkLabel: 'Buka Node.js Download',
        linkUrl: 'https://nodejs.org/en/download'
    },
    {
        id: 'setup-ai-api-key',
        icon: Brain,
        title: 'Dapatkan API Key AI & Pasang di Antigravity',
        stage: 'Extended Toolkit',
        summary: 'Tanpa API key, AI tak boleh berfikir. Ini cara dapatkan otak untuk Antigravity kau.',
        eli5: 'API Key ni macam kad pengenalan untuk AI. Kau tunjuk kad ni kat server, baru dorang bagi AI tolong kau.',
        steps: [
            'Buka platform AI pilihan (contoh: Groq, Gemini, OpenAI).',
            'Register akaun dan cari bahagian "API Keys".',
            'Generate key baru dan copy.',
            'Buka VSCode (atau Cursor), pergi bahagian settings Antigravity.',
            'Paste API key dan pilih model AI yang kau nak guna.'
        ],
        linkLabel: 'Dapatkan Groq API Key (Laju & Free)',
        linkUrl: 'https://console.groq.com/keys'
    },
    {
        id: 'the-4-step-flow',
        icon: Rocket,
        title: 'Benda First: The 4-Step App Flow',
        stage: 'Extended Toolkit',
        summary: 'Membina app tak susah. Ini adalah 4 langkah utama yang kita akan sentiasa ulang.',
        eli5: 'Kalau masak, kita (1) cari resepi idea, (2) masak kat dapur Antigravity, (3) hidang kat meja Vercel, pastu (4) letak buku log Supabase.',
        steps: [
            'Idea & Brainstorming.',
            'Vibe Coding pada Antigravity.',
            'Publish secara live pada Vercel.',
            'Sambung Database Supabase untuk simpan memori.'
        ],
        linkLabel: 'Baca Proses Vibe Coding',
        linkUrl: '#'
    },
    {
        id: 'ai-tech-stack',
        icon: Brain,
        title: 'AI Tech Stack: Guna Tool Yang Betul',
        stage: 'Extended Toolkit',
        summary: 'Banyak AI tools dekat luar sana. Ini cara kita gabungkannya untuk hasilkan app terbaik.',
        eli5: 'ChatGPT tu manager bincang idea. Gemini pelukis yang hasilkan aset. Antigravity pula arkitek yang bantu kita ikat bata satu per satu.',
        steps: [
            'Gunakan ChatGPT untuk bincang idea dan brainstorm.',
            'Gunakan Gemini AI untuk janaan gambar dan aset design.',
            'Gunakan Antigravity (VSCode/Cursor) untuk coding.',
            'Jangan suruh satu AI buat semua benda.'
        ],
        linkLabel: 'Teroka ChatGPT untuk Idea',
        linkUrl: 'https://chat.openai.com'
    },
    {
        id: 'skill-md-basics',
        icon: BookOpen,
        title: 'Step 1: Faham `.md` & Skill Creator Dulu',
        stage: 'Extended Toolkit',
        summary: 'Sebelum start vibe coding, kena faham file instruction (`SKILL.md`) supaya AI ikut arahan kau betul-betul.',
        eli5: '`.md` tu macam buku manual. Kalau manual jelas, robot tak sesat. Skill Creator pula macam mesin yang bantu kau buat manual special ikut task kau.',
        steps: [
            'Buka `SKILL.md` dan tengok struktur dia.',
            'Faham frontmatter penting: `name` + `description`.',
            'Tulis instruction ringkas dan jelas (jangan panjang berjela).',
            'Asingkan bahan ikut folder: `scripts/`, `references/`, `assets/`.',
            'Uji skill guna task kecil dulu sebelum guna untuk task besar.'
        ],
        linkLabel: 'Rujuk Skill Creator Guide',
        linkUrl: 'https://platform.openai.com/docs'
    },
    {
        id: 'style-direction',
        icon: BookOpen,
        title: 'Pilih Design Direction Sendiri',
        stage: 'Extended Toolkit',
        summary: 'Supaya website kau tak nampak generic AI template.',
        eli5: 'Website macam baju. Kalau semua pakai uniform sama, takde identiti. Kau pilih gaya dulu baru AI ikut gaya kau.',
        steps: [
            'Pilih 3 keyword mood (contoh: bold, warm, playful).',
            'Pilih 2 website reference yang kau suka.',
            'Ambil elemen, jangan copy bulat-bulat.',
            'Set 1 font heading + 1 font body.',
            'Set 1 warna utama + 1 accent.'
        ],
        linkLabel: 'Buka Design Inspiration',
        linkUrl: 'https://www.behance.net/',
        designExamples: [
            { label: 'Glassmorphism', url: 'https://dribbble.com/tags/glassmorphism' },
            { label: 'Neo-Brutalist', url: 'https://dribbble.com/tags/neo-brutalism' },
            { label: 'Minimal Clean', url: 'https://dribbble.com/tags/minimal_web_design' },
            { label: 'Bento Grid', url: 'https://dribbble.com/tags/bento_ui' },
            { label: 'Dark Editorial', url: 'https://dribbble.com/tags/editorial_web_design' }
        ]
    },
    {
        id: 'ai-refer-design',
        icon: Brain,
        title: 'Lepas Pilih Design, Suruh AI Refer Style Tu',
        stage: 'Extended Toolkit',
        summary: 'Jangan minta AI random design. Bagi AI reference website supaya output lebih kena dengan taste kau.',
        eli5: 'Macam bagi contoh baju kat tailor. Tailor tak agak-agak, dia ikut rujukan yang kau suka.',
        steps: [
            'Pilih 1-2 website reference yang paling ngam.',
            'Bagi AI link/reference + terangkan apa yang kau suka.',
            'Minta AI replicate style principle, bukan copy exact design.',
            'Minta output ikut section (hero, cards, footer) satu-satu.',
            'Semak consistency font, spacing, dan warna.'
        ],
        linkLabel: 'Buka AI Design Referencing',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+use+ai+with+design+references'
    },
    {
        id: 'container-frame-element',
        icon: BookOpen,
        title: 'Container, Frame, Element (Visual Basics)',
        stage: 'Extended Toolkit',
        summary: 'Belajar struktur visual paling penting supaya layout tak bersepah.',
        eli5: 'Container macam kotak besar, frame macam rak dalam kotak, element pula barang atas rak.',
        steps: [
            'Kenal pasti container utama untuk setiap section.',
            'Pecahkan setiap container kepada frame kecil (header, content, footer).',
            'Letak element ikut hierarchy: title > isi > action.',
            'Pastikan spacing konsisten antara frame dan element.',
            'Semak balik: senang scan atau nampak serabut?'
        ],
        linkLabel: 'Buka Layout Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=ui+layout+container+frame+element+basics'
    },
    {
        id: 'move-elements',
        icon: Rocket,
        title: 'Cara Move Element Dengan Betul',
        stage: 'Extended Toolkit',
        summary: 'Bukan sekadar drag. Kena tahu alignment, spacing, dan visual balance.',
        eli5: 'Alih kerusi dalam rumah kena tengok laluan orang jalan. Website pun sama, elemen kena ada flow.',
        steps: [
            'Gerakkan element ikut grid (jangan random).',
            'Gunakan align left/center/right ikut konteks section.',
            'Check jarak atas-bawah kiri-kanan supaya seimbang.',
            'Test desktop dulu, lepas tu mobile.',
            'Ambil screenshot before/after untuk compare.'
        ],
        linkLabel: 'Buka Visual Alignment Guide',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+align+ui+elements+properly'
    },
    {
        id: 'asset-format-basics',
        icon: BookOpen,
        title: 'JPG, PNG, SVG: Bila Nak Guna Apa',
        stage: 'Extended Toolkit',
        summary: 'Faham format assets supaya website laju dan visual kekal sharp.',
        eli5: 'JPG untuk gambar biasa, PNG untuk gambar ada transparent, SVG untuk icon/shape yang sentiasa tajam.',
        steps: [
            'Guna JPG untuk photo/background image.',
            'Guna PNG untuk asset perlukan transparency.',
            'Guna SVG untuk logo, icon, illustration line-art.',
            'Semak saiz fail sebelum upload.',
            'Test visual quality di mobile dan desktop.'
        ],
        linkLabel: 'Buka Image Format Lesson',
        linkUrl: 'https://www.youtube.com/results?search_query=jpg+png+svg+explained+for+web+design'
    },
    {
        id: 'generate-assets-ai',
        icon: Sparkles,
        title: 'Generate Asset Dengan AI (Image, Icon, Mockup)',
        stage: 'Extended Toolkit',
        summary: 'Belajar hasilkan asset cepat guna AI tanpa nampak generic.',
        eli5: 'AI macam designer assistant. Kau bagi direction jelas, dia hasilkan draft laju untuk kau polish.',
        steps: [
            'Tulis prompt ikut style brand (warna, mood, penggunaan).',
            'Generate beberapa variation (jangan ambil first result terus).',
            'Pilih yang paling sesuai dengan layout website.',
            'Refine prompt untuk fix details kecil.',
            'Export format yang sesuai: PNG/SVG/JPG.'
        ],
        linkLabel: 'Buka AI Asset Generation',
        linkUrl: 'https://www.youtube.com/results?search_query=ai+image+generation+for+website+assets'
    },
    {
        id: 'generate-3d-assets',
        icon: Sparkles,
        title: 'Generate 3D Assets Untuk Website',
        stage: 'Extended Toolkit',
        summary: 'Tambah depth dan wow factor guna 3D asset secara ringan.',
        eli5: '3D assets macam prop pentas. Kalau guna betul, website nampak hidup. Kalau over, jadi berat.',
        steps: [
            'Pilih 1-2 3D asset hero sahaja (jangan penuh satu page).',
            'Gunakan format glTF/GLB untuk web bila sesuai.',
            'Compress asset supaya loading tak berat.',
            'Test performance sebelum publish.',
            'Sediakan fallback image untuk device lemah.'
        ],
        linkLabel: 'Buka 3D for Web Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=3d+assets+for+web+beginners+gltf+glb'
    },
    {
        id: 'ai-build-website',
        icon: Brain,
        title: 'Guna AI Buat Website dengan Betul',
        stage: 'Extended Toolkit',
        summary: 'Prompt clear = output cun. Prompt kabur = output random.',
        eli5: 'AI ni macam runner. Kalau kau bagi alamat clear, dia sampai. Kalau alamat vague, dia pusing-pusing.',
        steps: [
            'Bagi AI context: audience + objective + vibe.',
            'Minta structure page dulu (baru visual).',
            'Minta one section at a time.',
            'Review dengan checklist (clear CTA? readable?)',
            'Iterate 2-3 round je, jangan endless tweak.'
        ],
        linkLabel: 'Buka AI Builder',
        linkUrl: 'https://v0.dev/'
    },
    {
        id: 'basic-prompting',
        icon: Brain,
        title: 'Basic Prompting: Cara Bagi Arahan Yang Menjadi',
        stage: 'Extended Toolkit',
        summary: 'Belajar format prompt basic supaya AI bagi output yang tepat dan boleh pakai terus.',
        eli5: 'Prompt tu macam bagi alamat rumah. Lagi jelas alamat, lagi senang orang sampai betul-betul depan pintu.',
        steps: [
            'Guna format ringkas: Goal + Context + Format.',
            'Nyatakan gaya output yang kau nak.',
            'Letak contoh ringkas kalau perlu.',
            'Minta AI tanya balik kalau info tak cukup.',
            'Iterate cepat guna prompt v2, v3.'
        ],
        linkLabel: 'Buka Prompting Basics',
        linkUrl: 'https://platform.openai.com/docs/guides/prompt-engineering'
    },
    {
        id: 'ai-implementation-planning',
        icon: Brain,
        title: 'Discuss dengan AI untuk Buat Implementation Plan',
        stage: 'Extended Toolkit',
        summary: 'Sebelum terus build, bincang dengan AI untuk pecah kerja kepada task kecil yang clear.',
        eli5: 'Macam nak travel: rancang route dulu, baru jalan. Kalau tak, buang masa pusing-pusing.',
        steps: [
            'Terangkan objective feature secara jelas.',
            'Minta AI pecahkan task ikut fasa: UI, data, test, deploy.',
            'Minta AI highlight risk dan fallback plan.',
            'Minta priority order (must-have vs nice-to-have).',
            'Gunakan plan tu sebagai checklist execution.'
        ],
        linkLabel: 'Buka AI Planning Workflow',
        linkUrl: 'https://www.youtube.com/results?search_query=ai+implementation+planning+for+developers'
    },
    {
        id: 'ux-flow',
        icon: Users,
        title: 'Bina Website yang Senang Guna',
        stage: 'Extended Toolkit',
        summary: 'Cantik je tak cukup. User mesti senang faham dan klik.',
        eli5: 'Rumah cantik tapi pintu susah cari memang stress. Website pun sama.',
        steps: [
            'Hero mesti jawab: apa ini + untuk siapa + apa next.',
            'Navbar maksimum 5 item utama.',
            'CTA guna ayat action (contoh: Start Free Audit).',
            'Setiap section ada satu tujuan jelas.',
            'Buang benda yang tak bantu user decision.'
        ],
        linkLabel: 'Buka UX Basics',
        linkUrl: 'https://www.nngroup.com/articles/'
    },
    {
        id: 'content-copy',
        icon: BookOpen,
        title: 'Copywriting yang Bantu Convert',
        stage: 'Extended Toolkit',
        summary: 'Ayat website kena jelas, bukan sekadar fancy.',
        eli5: 'Kalau kedai tak letak signboard jelas, orang tak tahu kedai jual apa.',
        steps: [
            'Headline: problem + promise.',
            'Subheadline: explain result in plain language.',
            'Tambah 1-2 bukti (testimonial / outcome).',
            'Gunakan bahasa user, bukan jargon tech.',
            'Setiap page ada CTA tunggal yang kuat.'
        ],
        linkLabel: 'Buka Landing Copy Tips',
        linkUrl: 'https://www.copyhackers.com/blog/'
    },
    {
        id: 'inspect-mobile-view',
        icon: Rocket,
        title: 'Inspect Element: Test Mobile View Macam Pro',
        stage: 'Extended Toolkit',
        summary: 'Lepas design siap, kena check versi phone guna browser inspect supaya layout tak pecah.',
        eli5: 'Inspect element tu macam cermin ajaib. Kau boleh tukar skrin jadi phone mode dan tengok website kau kemas ke tak.',
        steps: [
            'Mulakan design dalam phone width dulu (mobile-first).',
            'Buka website dalam Chrome.',
            'Tekan `F12` untuk buka DevTools.',
            'Klik icon phone/tablet (Toggle Device Toolbar).',
            'Pilih device (iPhone/Pixel/iPad) dan test setiap section.',
            'Fix text, spacing, button size sampai mobile view smooth.'
        ],
        linkLabel: 'Buka Guide Chrome DevTools',
        linkUrl: 'https://developer.chrome.com/docs/devtools/device-mode'
    },
    {
        id: 'file-structure-basics',
        icon: BookOpen,
        title: 'File Structure Basics (Supaya Tak Serabut)',
        stage: 'Extended Toolkit',
        summary: 'Susun folder dari awal supaya senang maintain bila project makin besar.',
        eli5: 'Macam susun almari. Kalau baju campur kasut campur dokumen, nanti semua jadi lambat nak cari.',
        steps: [
            'Asingkan folder ikut fungsi: pages, components, styles, lib, assets.',
            'Guna nama fail jelas dan konsisten.',
            'Simpan reusable UI dalam components.',
            'Simpan logic helper/API dalam lib atau utils.',
            'Review structure setiap minggu dan kemas semula bila perlu.'
        ],
        linkLabel: 'Buka Project Structure Guide',
        linkUrl: 'https://www.youtube.com/results?search_query=react+project+folder+structure+for+beginners'
    },
    {
        id: 'ask-ai-code-comments',
        icon: Brain,
        title: 'Nak Faham Code? Suruh AI Tulis Comment',
        stage: 'Extended Toolkit',
        summary: 'Kalau blur dengan code, gunakan AI untuk annotate code langkah demi langkah.',
        eli5: 'Comment tu macam subtitle dalam movie. Kau terus faham scene tu pasal apa.',
        steps: [
            'Copy function atau component yang kau tak faham.',
            'Minta AI explain line-by-line dalam bahasa mudah.',
            'Minta AI tambah komen pada code tanpa ubah behavior.',
            'Baca semula code yang dah ada komen.',
            'Buang komen berlebihan bila dah faham.'
        ],
        linkLabel: 'Buka Code Explanation Workflow',
        linkUrl: 'https://www.youtube.com/results?search_query=understand+code+with+ai+comments'
    },
    {
        id: 'user-retention',
        icon: Users,
        title: 'User Retention: Buat User Datang Balik',
        stage: 'Extended Toolkit',
        summary: 'Retention penting supaya app kau bukan sekadar viral sehari dua, tapi terus digunakan.',
        eli5: 'User retention macam orang datang balik ke kedai sebab servis sedap dan barang berguna.',
        steps: [
            'Kenal pasti “aha moment” user seawal mungkin.',
            'Permudahkan onboarding supaya user cepat faham value.',
            'Tambah habit trigger (email reminder, progress tracker).',
            'Pantau drop-off point dan baiki friction.',
            'Kumpul feedback user aktif dan iterasi cepat.'
        ],
        linkLabel: 'Buka User Retention Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=user+retention+for+web+apps+beginners'
    },
    {
        id: 'scale-your-app',
        icon: Rocket,
        title: 'Scale Your App (Bila User Makin Ramai)',
        stage: 'Extended Toolkit',
        summary: 'Bila traction naik, app kena tahan load, maintain laju, dan senang diurus.',
        eli5: 'Macam kedai makin ramai customer, kena tambah staff dan sistem supaya tak kelam-kabut.',
        steps: [
            'Pantau metrik performance (load time, error rate).',
            'Optimize image, query, dan frontend bundle.',
            'Guna caching untuk data yang kerap dibaca.',
            'Asingkan service bila logic makin kompleks.',
            'Set monitoring + alert untuk issue production.'
        ],
        linkLabel: 'Buka App Scaling Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+scale+web+application+beginners'
    },
    {
        id: 'monetize-app',
        icon: Sparkles,
        title: 'Monetize Your App (Jana Income)',
        stage: 'Extended Toolkit',
        summary: 'Lepas produk stabil, pilih model monetization yang sesuai dengan value app kau.',
        eli5: 'Kalau app kau bantu orang, monetization ialah cara dapat hasil sambil terus improve servis.',
        steps: [
            'Pilih model awal: subscription, one-time, atau freemium.',
            'Pastikan free tier masih bagi value.',
            'Tetapkan pricing berdasarkan outcome, bukan tekaan.',
            'Test pricing dengan user kecil dulu.',
            'Track conversion dari free ke paid.'
        ],
        linkLabel: 'Buka App Monetization Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=app+monetization+for+beginners+saas'
    },
    {
        id: 'visual-troubleshooting',
        icon: Sparkles,
        title: 'Troubleshoot Visual Issue (Copy Paste Workflow)',
        stage: 'Extended Toolkit',
        summary: 'Kalau layout rosak, ikut SOP troubleshooting yang cepat dan clear.',
        eli5: 'Macam baiki basikal: test satu benda dulu, jangan tukar semua serentak.',
        steps: [
            'Copy error/issue description dan screenshot masalah.',
            'Copy section code yang terlibat sahaja (jangan satu file penuh).',
            'Paste kepada AI dengan format: masalah + expected result + code snippet.',
            'Apply fix kecil dulu, test sekali lagi.',
            'Kalau okay baru simpan; kalau tak okay, revert dan cuba versi lain.'
        ],
        linkLabel: 'Buka Frontend Debugging Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=frontend+debugging+workflow+for+beginners'
    },
    {
        id: 'connect-database',
        icon: Database,
        title: 'Sambung Website ke Database',
        stage: 'Extended Toolkit',
        summary: 'Bagi website memory: simpan data user, submission, feedback.',
        eli5: 'Database ni kotak simpan barang berlabel. Website boleh letak dan cari semula bila perlu.',
        steps: [
            'Create project dekat Supabase.',
            'Bina table penting dulu (users/submissions).',
            'Copy URL + anon key ke `.env`.',
            'Test tambah satu data contoh.',
            'Test baca balik data tu.'
        ],
        linkLabel: 'Buka Supabase Guide',
        linkUrl: 'https://supabase.com/docs/guides/getting-started'
    },
    {
        id: 'api-basics',
        icon: Brain,
        title: 'API Tu Apa (Versi Beginner)',
        stage: 'Extended Toolkit',
        summary: 'API ialah cara app kau minta data dari service lain.',
        eli5: 'API macam waiter restoran. Kau bagi order, waiter pergi dapur, lepas tu waiter bawa balik makanan (data).',
        steps: [
            'Kenal pasti data apa kau nak ambil/hantar.',
            'Tengok endpoint API (contoh: `/users`, `/products`).',
            'Faham request masuk, response keluar.',
            'Test API guna sample data dulu.',
            'Tunjuk error message yang clear kalau API gagal.'
        ],
        linkLabel: 'Buka API Intro',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction'
    },
    {
        id: 'fetching-basics',
        icon: Brain,
        title: 'Fetching Data (Cara Ambil Data Dalam App)',
        stage: 'Extended Toolkit',
        summary: 'Fetching = app kau ambil data dari API/database dan paparkan dekat UI.',
        eli5: 'Macam kau ambil air guna paip. Kau buka paip (request), air keluar (response), lepas tu guna air tu dalam rumah (UI).',
        steps: [
            'Kenal pasti data mana nak ambil dulu.',
            'Call API endpoint dengan format betul.',
            'Tunjuk loading state sementara tunggu data.',
            'Handle error kalau fetch gagal.',
            'Render data dalam UI dengan kemas.'
        ],
        linkLabel: 'Buka Fetch API Guide',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'
    },
    {
        id: 'web-scraping-basics',
        icon: BookOpen,
        title: 'Web Scraping (Ambil Data Website Secara Beretika)',
        stage: 'Extended Toolkit',
        summary: 'Scraping sesuai untuk research/content sourcing, tapi kena ikut rules laman web.',
        eli5: 'Scraping macam salin nota dari papan putih. Boleh salin, tapi kena ikut peraturan kelas dan jangan rosakkan papan.',
        steps: [
            'Semak Terms of Service website dulu.',
            'Ambil data yang public sahaja.',
            'Jangan spam request terlalu laju.',
            'Simpan source URL untuk rujukan/credit.',
            'Gunakan data untuk insight, bukan copy bulat-bulat.'
        ],
        linkLabel: 'Buka Web Scraping Intro',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/Web_scraping'
    },
    {
        id: 'supabase-keys',
        icon: Database,
        title: 'Supabase Keys: Mana Boleh Share, Mana Tak Boleh',
        stage: 'Extended Toolkit',
        summary: 'Kena faham beza anon key dan service role key supaya project selamat.',
        eli5: 'Kunci rumah ada dua: kunci tetamu dan kunci master. Tetamu boleh guna ruang biasa, kunci master jangan bagi orang.',
        steps: [
            'Guna `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` untuk frontend.',
            'Jangan letak `service_role` key dalam frontend.',
            'Simpan keys dalam `.env`, bukan hardcode.',
            'Semak `.gitignore` supaya `.env` tak ter-push ke GitHub.',
            'Set RLS policy supaya data access ikut role.'
        ],
        linkLabel: 'Buka Supabase API Keys Docs',
        linkUrl: 'https://supabase.com/docs/guides/api/api-keys'
    },
    {
        id: 'github-flow',
        icon: Github,
        title: 'Upload Project ke GitHub',
        stage: 'Extended Toolkit',
        summary: 'Backup kerja + senang kolaborasi + senang deploy.',
        eli5: 'GitHub macam cloud folder versioned. Setiap kemas kini ada rekod.',
        steps: [
            'Create repo baru.',
            'git init -> git add . -> git commit.',
            'Connect repo URL.',
            'git push untuk upload.',
            'Set habit: commit kecil tapi konsisten.'
        ],
        linkLabel: 'Buka GitHub Quickstart',
        linkUrl: 'https://docs.github.com/en/get-started/start-your-journey/hello-world'
    },
    {
        id: 'github-antigravity',
        icon: Github,
        title: 'Connection GitHub <-> Antigravity',
        stage: 'Extended Toolkit',
        summary: 'Antigravity bantu generate/edit, GitHub simpan version rasmi project kau.',
        eli5: 'Antigravity macam co-pilot kereta, GitHub macam dashcam. Co-pilot bantu drive, dashcam simpan semua perjalanan.',
        steps: [
            'Pastikan project local dah connect ke GitHub repo.',
            'Guna Antigravity untuk generate/refactor feature kecil.',
            'Review hasil dulu, jangan push terus tanpa check.',
            'Commit ikut task (satu task, satu commit).',
            'Push ke GitHub supaya version kau sentiasa selamat.'
        ],
        linkLabel: 'Buka GitHub Flow Guide',
        linkUrl: 'https://docs.github.com/en/get-started/using-github/github-flow'
    },
    {
        id: 'deploy-live',
        icon: Rocket,
        title: 'Deploy Website Sampai Live',
        stage: 'Extended Toolkit',
        summary: 'Lepas deploy, semua orang boleh buka link website kau.',
        eli5: 'Sebelum deploy, website duduk dalam bilik kau. Lepas deploy, dia duduk kat jalan besar.',
        steps: [
            'Create akaun Vercel.',
            'Import GitHub repo.',
            'Masukkan environment variables.',
            'Klik Deploy.',
            'Test live link macam user baru.'
        ],
        linkLabel: 'Buka Vercel Guide',
        linkUrl: 'https://vercel.com/docs/getting-started-with-vercel'
    },
    {
        id: 'vercel-production',
        icon: Rocket,
        title: 'Vercel: Dari Preview ke Production',
        stage: 'Extended Toolkit',
        summary: 'Belajar beza preview deployment dan production deployment.',
        eli5: 'Preview macam rehearsal atas stage kosong. Production macam show sebenar depan audience.',
        steps: [
            'Import repo ke Vercel.',
            'Set environment variables ikut environment yang betul.',
            'Guna preview URL untuk test sebelum publish.',
            'Semak form, API, dan mobile view dekat preview.',
            'Baru promote/deploy ke production.'
        ],
        linkLabel: 'Buka Vercel Deployment Docs',
        linkUrl: 'https://vercel.com/docs/deployments/overview'
    },
    {
        id: 'install-skills',
        icon: Sparkles,
        title: 'Install Skills untuk Start Vibe Coding',
        stage: 'Extended Toolkit',
        summary: 'Skills bagi kau shortcut workflow supaya tak blank bila start.',
        eli5: 'Skills macam preset gear dalam game. Bila equip, kerja jadi lagi cepat dan terarah.',
        steps: [
            'Pilih 1 skill ikut goal (UI, backend, deployment).',
            'Install ikut guide tool kau.',
            'Test skill dengan task kecil.',
            'Simpan template prompt untuk repeat use.',
            'Tambah skill baru bila workflow dah stabil.'
        ],
        linkLabel: 'Buka Skill Guide',
        linkUrl: 'https://platform.openai.com/docs'
    },
    {
        id: 'creative-motion',
        icon: Sparkles,
        title: 'Creative Mode: Animation yang Sedap Tengok',
        stage: 'Extended Toolkit',
        summary: 'Bila website dah launch, baru tambah wow factor secara berhemah.',
        eli5: 'Animation macam seasoning. Sikit jadi sedap, terlalu banyak jadi pening.',
        steps: [
            'Pilih 2-3 animation pattern je.',
            'Utamakan reveal + hover + feedback state.',
            'Pastikan animation bantu fokus user.',
            'Semak performance (tak laggy).',
            'Sediakan reduced-motion option.'
        ],
        linkLabel: 'Buka Motion Inspiration',
        linkUrl: 'https://www.awwwards.com/websites/animations/'
    },
    {
        id: 'ai-imagination',
        icon: Brain,
        title: 'Imagination with AI: Idea Jadi Reality',
        stage: 'Extended Toolkit',
        summary: 'Lepas basic settle, imagination kau jadi engine utama.',
        eli5: 'AI ibarat tukang bina laju, tapi architect tetap kau. Kalau imaginasi jelas, hasil unik.',
        steps: [
            'Mulakan dengan satu crazy-but-useful idea.',
            'Pecah idea jadi micro features.',
            'Prototype cepat dengan AI.',
            'Uji dengan 3 orang user sebenar.',
            'Iterate based on feedback, bukan ego.'
        ],
        linkLabel: 'Buka AI Product Inspiration',
        linkUrl: 'https://www.producthunt.com/'
    }
];

const LESSONS_FORMAL = [
    {
        id: "setup-environment",
        icon: Sparkles,
        title: "Install Node.js + Antigravity (First Setup)",
        stage: "Foundation",
        summary: "This is the initial setup sebelum mula vibe coding dengan lancar.",
        eli5: "Node.js ni macam enjin kereta. Antigravity pula co-pilot AI kau. Kalau enjin takde, kereta tak jalan.",
        steps: [
            "Install Node.js LTS dari website rasmi.",
            "Buka terminal, check `node -v` dan `npm -v`.",
            "Install/open Antigravity ikut panduan platform kau.",
            "Dalam project folder, run `npm install`.",
            "Run `npm run dev` dan pastikan website boleh hidup."
        ],
        linkLabel: "Buka Node.js Download",
        linkUrl: "https://nodejs.org/en/download"
    },
    {
        id: "setup-ai-api-key",
        icon: Brain,
        title: "Dapatkan API Key AI & Pasang di Antigravity",
        stage: "Foundation",
        summary: "Penting: Manage token API korang supaya tak mahal. OpenRouter paling jimat untuk guna semua model.",
        eli5: "API Key ni macam kad pengenalan. Korang boleh guna Groq (laju & murah) atau NVIDIA LLM. OpenRouter pula act macam wallet prepaid untuk bayar semua model.",
        steps: [
            "Open your chosen platform: Groq (Percuma/Murah), NVIDIA LLM, atau OpenRouter (Jimat).",
            "Register akaun dan ambil 'API Keys'.",
            "Buka VSCode/Cursor, pergi bahagian settings Antigravity.",
            "Paste API key dan pilih model.",
            "Elakkan guna Opus/Sonnet untuk benda simple sebab mahal token."
        ],
        linkLabel: "Dapatkan Groq API Key",
        linkUrl: "https://console.groq.com/keys"
    },
    {
        id: "chatgpt-personality",
        icon: Users,
        title: "Set Up Personality ChatGPT",
        stage: "Ideation",
        summary: "Train ChatGPT to act as an expert sebelum kau tanya teknikal.",
        eli5: "Macam kau lantik Manager. Mula-mula bagi dia title 'Senior UI Engineer & PM', baru instruction dia mantap.",
        steps: [
            "Buka ChatGPT.",
            "Tulis prompt: 'You are an expert React UI Engineer and Product Manager...'",
            "Ceritakan idea app kau secara ringkas.",
            "Minta dia suggest features dan UX flow sebelum buat apa-apa.",
            "Bincang sampai idea tu solid."
        ],
        linkLabel: "Buka ChatGPT",
        linkUrl: "https://chat.openai.com"
    },
    {
        id: "chatgpt-master-prompt",
        icon: BookOpen,
        title: "Generate The Master Prompt",
        stage: "Ideation",
        summary: "Translate ideas into a single comprehensive arahan lengkap untuk Antigravity.",
        eli5: "Bila idea dah confirm, kau suruh ChatGPT rumuskan jadi satu pelan tindakan (blueprint) yang lengkap untuk AI lain baca.",
        steps: [
            "Bila brainstorm dah siap di ChatGPT.",
            "Minta ChatGPT: 'Summarize everything we discussed into ONE single master prompt for an AI coding assistant (like Claude 3) to build this app.'",
            "Pastikan prompt tu ada details UI, warna, layout, dan data structure.",
            "Copy Master Prompt tu."
        ],
        linkLabel: "Buka ChatGPT",
        linkUrl: "https://chat.openai.com"
    },
    {
        id: "antigravity-sonnet",
        icon: Rocket,
        title: "Paste Master Prompt ke Antigravity",
        stage: "Vibe Coding",
        summary: "Select the appropriate model dan mula bina aplikasi. Sonnet untuk architect, Gemini untuk visual.",
        eli5: "Antigravity ada banyak AI. Claude 3.5 Sonnet = Senior Engineer (steady). Opus = KrackedDev (power gila). Gemini Pro = Junior (cepat). Gemini Flash = UI Designer. Gemini 3.1 = High-Performance All Rounder.",
        steps: [
            "Buka Antigravity dalam project folder.",
            "Pilih AI model yang sesuai: Claude 3.5 Sonnet atau Gemini 3.1 (all-rounder).",
            "Paste Master Prompt dari ChatGPT tadi.",
            "Tekan Enter dan tunggu AI siapkan struktur website dan component.",
            "Kalau nak tukar warna/padding UI, switch ke Gemini Flash (Designer)."
        ],
        linkLabel: "Buka Antigravity Docs",
        linkUrl: "https://antigravity.id"
    },
    {
        id: "github-repo-setup",
        icon: Github,
        title: "Push Code ke GitHub",
        stage: "Versioning",
        summary: "Save code to the cloud supaya tak hilang dan boleh deploy.",
        eli5: "GitHub ni macam Google Drive tapi khas untuk code. Kau 'push' code ke sana untuk simpan secara kekal.",
        steps: [
            "Buka browser dan create GitHub repo baru.",
            "Dalam terminal VSCode, run: `git init`.",
            "Run: `git add .` lepas tu `git commit -m 'initial commit'`.",
            "Penting: Belajar beza `git pull` (tarik code turun) dan `git fetch`.",
            "Run command `git push -u origin main` untuk upload semua code asal ke branch utama (main)."
        ],
        linkLabel: "Buka GitHub",
        linkUrl: "https://github.com"
    },
    {
        id: "vercel-deploy",
        icon: Rocket,
        title: "Deploy ke Vercel",
        stage: "Launch",
        summary: "Publish your website to the internet. Paste Vercel URL dalam terminal ni untuk dapat Trophy!",
        eli5: "Dalam local, kau je nampak website tu. Vercel akan ambil code dari GitHub dan letak kat server awam.",
        steps: [
            "Create akaun Vercel guna GitHub.",
            "Import repo yang kau baru push tadi.",
            "Biarkan settings default dan tekan Deploy.",
            "Bila dah siap, copy URL `.vercel.app` tu.",
            "PASTE URL TU DALAM TERMINAL INI tekan ENTER untuk complete task!"
        ],
        linkLabel: "Buka Vercel",
        linkUrl: "https://vercel.com"
    },
    {
        id: "vercel-analytics",
        icon: Users,
        title: "Pasang Vercel Analytics",
        stage: "Launch",
        summary: "Track website visitors secara percuma dan mudah.",
        eli5: "Macam pasang CCTV kat kedai, kau boleh nampak berapa orang masuk dan dari mana diorang datang.",
        steps: [
            "Dalam Vercel dashboard, pergi tab Analytics dan klik Enable.",
            "Dalam terminal VSCode, run: `npm i @vercel/analytics`.",
            "Import dan letak component `<Analytics />` dalam fail utama app (contoh: `App.jsx` atau `main.jsx`).",
            "Commit dan push ke GitHub (Vercel akan auto-deploy).",
            "Sekarang kau boleh tengok graf traffic kat Vercel dashboard."
        ],
        linkLabel: "Vercel Analytics Guide",
        linkUrl: "https://vercel.com/docs/analytics/quickstart"
    },
    {
        id: "supabase-setup",
        icon: Database,
        title: "Cipta Database Supabase",
        stage: "Database",
        summary: "Build a cloud database. PENTING: Faham beza Anon Key dan Service Role Key.",
        eli5: "Bila buat akaun login atau simpan data form, kau perlukan backend database. Supabase paling senang untuk mula.",
        steps: [
            "Create a project on Supabase and wait 2-3 minit server setup.",
            "Pergi ke Project Settings > API.",
            "Copy `Project URL` dan `anon - public` key.",
            "AMARAN: Jangan sekali-kali expose `service_role` key! Berbahaya!",
            "Buat file `.env.local` dan masukkan keys tersebut."
        ],
        linkLabel: "Buka Supabase",
        linkUrl: "https://supabase.com"
    },
    {
        id: "supabase-sql",
        icon: Database,
        title: "Run SQL Query & Bina Table",
        stage: "Database",
        summary: "The fastest way to create struktur kotak data guna AI dan SQL.",
        eli5: "Dari buat table satu per satu pakai mouse, suruh AI generate script SQL, paste dalam Supabase, dan siap sepenip mata.",
        steps: [
            "Minta Antigravity: 'Generate a Supabase SQL query to create a users table with name and email'.",
            "Dalam Supabase dashboard, pergi ke SQL Editor (icon terminal kilat).",
            "Klik New Query, paste code tadi dan tekan RUN.",
            "Pergi ke Table Editor untuk confirm table tu dah wujud.",
            "Disable RLS buat masa ni kalau kau sekadar prototype."
        ],
        linkLabel: "Buka Supabase SQL Editor Guide",
        linkUrl: "https://supabase.com/docs/guides/database/sql-editor"
    },
    {
        id: "supabase-connect",
        icon: Database,
        title: "Sambung Database ke Vercel & UI",
        stage: "Database",
        summary: "Fetch data from the cloud masuk ke UI website korang.",
        eli5: "Wayar dah sambung kat local, tapi Vercel tak tau password Supabase. Kena setting environment variable.",
        steps: [
            "Masukkan credentials Supabase dalam `.env` ke dalam Vercel Dashboard > Settings > Environment Variables.",
            "Suruh Antigravity tulis logic fetchData untuk panggil data dari table.",
            "Minta Antigravity map data tu kat atas UI table atau cards.",
            "Push code ke GitHub, tunggu Vercel deploy.",
            "Boom! Website dah bersambung dengan database live."
        ],
        linkLabel: "Environment Variables Supabase",
        linkUrl: "https://vercel.com/docs/environment-variables"
    },
    {
        id: "custom-domain",
        icon: Rocket,
        title: "Bonus: Beli & Pasang Custom Domain",
        stage: "Bonus",
        summary: "Buang hujung .vercel.app dan nampak professional dengan domain .com.",
        eli5: "Beli nama rumah unik, lepastu sambung letrik ke Vercel.",
        steps: [
            "Beli domain (contoh dari Namecheap atau Porkbun).",
            "Dalam Vercel dashboard > Settings > Domains, add domain yang baru dibeli.",
            "Vercel akan bagi setting A Record dan CNAME.",
            "Copy settings tu dan paste dekat DNS settings di tempat beli domain tu.",
            "Tunggu propagate (kadang cepat, kadang beberapa jam)."
        ],
        linkLabel: "Vercel Domains Guide",
        linkUrl: "https://vercel.com/docs/custom-domains"
    }
    ,

    {
        id: 'install-node-antigravity',
        icon: Sparkles,
        title: 'Install Node.js and Antigravity (Initial Setup)',
        stage: 'Extended Toolkit',
        summary: 'Complete this setup first to ensure your vibe-coding workflow runs smoothly.',
        eli5: 'Node.js is the engine. Antigravity is your AI co-pilot. You need both before driving.',
        steps: [
            'Install Node.js LTS from the official site.',
            'Verify with `node -v` and `npm -v` in terminal.',
            'Install/open Antigravity for your environment.',
            'Run `npm install` in the project folder.',
            'Run `npm run dev` and confirm the app starts.'
        ],
        linkLabel: 'Open Node.js Download',
        linkUrl: 'https://nodejs.org/en/download'
    },
    {
        id: 'setup-ai-api-key',
        icon: Brain,
        title: 'Obtain an AI API Key & Configure Antigravity',
        stage: 'Extended Toolkit',
        summary: 'Without an API key, the AI cannot process requests. This connects Antigravity to its intelligence.',
        eli5: 'An API Key is like a VIP pass. You show it to the AI server so they know you are authorized to use their brain.',
        steps: [
            'Navigate to your preferred AI platform (e.g., Groq, Gemini, OpenAI).',
            'Create an account and locate the "API Keys" dashboard.',
            'Generate a new API key and copy the sequence.',
            'Open your editor\'s Antigravity settings/extension page.',
            'Paste the API key and select your preferred model.'
        ],
        linkLabel: 'Get Groq API Key (Fast & Free)',
        linkUrl: 'https://console.groq.com/keys'
    },
    {
        id: 'the-4-step-flow',
        icon: Rocket,
        title: 'The Blueprint: 4-Step App Workflow',
        stage: 'Extended Toolkit',
        summary: 'Building an app is repeatable. Master these 4 fundamental steps first.',
        eli5: 'You brainstorm the map, you build the house in Antigravity, you open it to the public via Vercel, and you track the visitors with Supabase.',
        steps: [
            'Idea Generation & Brainstorming.',
            'Vibe Coding within Antigravity.',
            'Publishing live to the web via Vercel.',
            'Connecting a Database (Supabase) for persistent memory.'
        ],
        linkLabel: 'Read the Builder Guide',
        linkUrl: '#'
    },
    {
        id: 'ai-tech-stack',
        icon: Brain,
        title: 'AI Tech Stack: Choose the Right Tools',
        stage: 'Extended Toolkit',
        summary: 'Understand the specific specialties of different AI tools in your workflow.',
        eli5: 'ChatGPT is your conversational whiteboard. Gemini is your artistic illustrator. Antigravity is your construction crew.',
        steps: [
            'Use ChatGPT for high-level technical discussions and brainstorming.',
            'Use Gemini to generate images, assets, and creative references.',
            'Use Antigravity as your primary IDE coding co-pilot.',
            'Avoid relying on a single AI model for everything.'
        ],
        linkLabel: 'Open ChatGPT for Brainstorming',
        linkUrl: 'https://chat.openai.com'
    },
    {
        id: 'skill-md-basics',
        icon: BookOpen,
        title: 'Step 1: Understand `.md` Files and Skill Creator',
        stage: 'Extended Toolkit',
        summary: 'Before building, learn how `SKILL.md` guides AI behavior and workflow.',
        eli5: 'A markdown file is an instruction booklet. If the booklet is clear, the assistant follows correctly.',
        steps: [
            'Open and review a `SKILL.md` file.',
            'Understand required frontmatter: `name` and `description`.',
            'Write concise, explicit instructions.',
            'Organize reusable files into `scripts/`, `references/`, and `assets/`.',
            'Validate with a small test task first.'
        ],
        linkLabel: 'Review Skill Creator Docs',
        linkUrl: 'https://platform.openai.com/docs'
    },
    {
        id: 'style-direction',
        icon: BookOpen,
        title: 'Choose a Distinct Design Direction',
        stage: 'Extended Toolkit',
        summary: 'A clear visual direction prevents your website from looking generic.',
        eli5: 'If everyone wears the same uniform, nobody stands out. Your design direction is your identity.',
        steps: [
            'Select 3 mood keywords (e.g. bold, warm, playful).',
            'Collect 2 reference websites.',
            'Borrow principles, not exact layouts.',
            'Choose one heading font and one body font.',
            'Set one primary color and one accent color.'
        ],
        linkLabel: 'Open Design Inspiration',
        linkUrl: 'https://www.behance.net/',
        designExamples: [
            { label: 'Glassmorphism', url: 'https://dribbble.com/tags/glassmorphism' },
            { label: 'Neo-Brutalism', url: 'https://dribbble.com/tags/neo-brutalism' },
            { label: 'Minimal', url: 'https://dribbble.com/tags/minimal_web_design' },
            { label: 'Bento UI', url: 'https://dribbble.com/tags/bento_ui' },
            { label: 'Editorial Style', url: 'https://dribbble.com/tags/editorial_web_design' }
        ]
    },
    {
        id: 'ai-refer-design',
        icon: Brain,
        title: 'After Choosing a Design, Ask AI to Reference It',
        stage: 'Extended Toolkit',
        summary: 'Use concrete references so AI output matches your style direction.',
        eli5: 'If you show a clear example, the assistant can follow your taste more accurately.',
        steps: [
            'Select 1-2 strong reference websites.',
            'Tell AI exactly which design traits you want to keep.',
            'Ask for style principles, not exact copies.',
            'Generate one section at a time.',
            'Check typography, spacing, and color consistency.'
        ],
        linkLabel: 'Open AI Design Referencing',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+use+ai+with+design+references'
    },
    {
        id: 'container-frame-element',
        icon: BookOpen,
        title: 'Container, Frame, and Element (Visual Fundamentals)',
        stage: 'Extended Toolkit',
        summary: 'Learn core visual structure so your layout stays clean and intentional.',
        eli5: 'A container is a big box, frames are shelves, and elements are items on those shelves.',
        steps: [
            'Define one primary container for each section.',
            'Break each container into frames (header, body, footer).',
            'Place elements by hierarchy: title, content, action.',
            'Keep spacing consistent between frames and elements.',
            'Review scanability: clear or cluttered?'
        ],
        linkLabel: 'Open Layout Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=ui+layout+container+frame+element+basics'
    },
    {
        id: 'move-elements',
        icon: Rocket,
        title: 'How to Move Elements with Proper Visual Balance',
        stage: 'Extended Toolkit',
        summary: 'Element movement should follow grid, alignment, and spacing logic.',
        eli5: 'Moving furniture works best when pathways stay clear. UI placement works the same way.',
        steps: [
            'Move elements according to a layout grid.',
            'Use intentional alignment (left, center, right).',
            'Check horizontal and vertical spacing consistency.',
            'Validate on desktop and mobile.',
            'Compare before/after screenshots.'
        ],
        linkLabel: 'Open Visual Alignment Guide',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+align+ui+elements+properly'
    },
    {
        id: 'asset-format-basics',
        icon: BookOpen,
        title: 'JPG, PNG, SVG: When to Use Each',
        stage: 'Extended Toolkit',
        summary: 'Choose the correct format so visuals stay sharp and pages remain fast.',
        eli5: 'Use JPG for photos, PNG for transparency, and SVG for crisp icons and logos.',
        steps: [
            'Use JPG for photographic images and large backgrounds.',
            'Use PNG when transparency is required.',
            'Use SVG for logos, icons, and vector illustrations.',
            'Check file size before upload.',
            'Validate quality on both desktop and mobile.'
        ],
        linkLabel: 'Open Image Format Lesson',
        linkUrl: 'https://www.youtube.com/results?search_query=jpg+png+svg+explained+for+web+design'
    },
    {
        id: 'generate-assets-ai',
        icon: Sparkles,
        title: 'Generate Assets with AI (Images, Icons, Mockups)',
        stage: 'Extended Toolkit',
        summary: 'Create useful visual assets quickly without generic-looking output.',
        eli5: 'AI is your design assistant: clear direction in, faster useful drafts out.',
        steps: [
            'Prompt with brand style, color, and usage context.',
            'Generate multiple variations.',
            'Pick assets that match your layout and hierarchy.',
            'Refine prompts to fix details.',
            'Export in the right format: PNG, SVG, or JPG.'
        ],
        linkLabel: 'Open AI Asset Generation',
        linkUrl: 'https://www.youtube.com/results?search_query=ai+image+generation+for+website+assets'
    },
    {
        id: 'generate-3d-assets',
        icon: Sparkles,
        title: 'Generate 3D Assets for Web Experiences',
        stage: 'Extended Toolkit',
        summary: 'Use 3D assets to add depth while keeping performance healthy.',
        eli5: '3D should support the story, not slow down the page.',
        steps: [
            'Limit 3D to 1-2 key sections.',
            'Use glTF/GLB where possible for web delivery.',
            'Compress 3D assets before shipping.',
            'Test performance and responsiveness.',
            'Provide a static fallback for low-end devices.'
        ],
        linkLabel: 'Open 3D for Web Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=3d+assets+for+web+beginners+gltf+glb'
    },
    {
        id: 'ai-build-website',
        icon: Brain,
        title: 'Use AI to Build Websites Effectively',
        stage: 'Extended Toolkit',
        summary: 'Good prompts produce usable first drafts faster.',
        eli5: 'AI is like a delivery rider: with a precise address, it reaches the right place quickly.',
        steps: [
            'Provide audience, objective, and style context.',
            'Generate page structure before visual styling.',
            'Build one section at a time.',
            'Review output against a checklist.',
            'Run short iteration cycles.'
        ],
        linkLabel: 'Open AI Builder',
        linkUrl: 'https://v0.dev/'
    },
    {
        id: 'basic-prompting',
        icon: Brain,
        title: 'Basic Prompting: Give Better AI Instructions',
        stage: 'Extended Toolkit',
        summary: 'Learn a simple prompt format so AI outputs are accurate and usable.',
        eli5: 'A prompt is an address. The clearer the address, the faster AI reaches the right result.',
        steps: [
            'Use a simple format: Goal + Context + Output format.',
            'Specify the style and constraints.',
            'Add a short example when needed.',
            'Ask AI to clarify missing inputs.',
            'Iterate quickly with v2 and v3 prompts.'
        ],
        linkLabel: 'Open Prompting Basics',
        linkUrl: 'https://platform.openai.com/docs/guides/prompt-engineering'
    },
    {
        id: 'ai-implementation-planning',
        icon: Brain,
        title: 'Discuss with AI to Create an Implementation Plan',
        stage: 'Extended Toolkit',
        summary: 'Before coding, use AI to break features into clear, executable phases.',
        eli5: 'Planning first saves time and prevents rework.',
        steps: [
            'Describe the feature objective clearly.',
            'Ask AI to split work into phases: UI, data, testing, deployment.',
            'Request risks and fallback options.',
            'Ask for prioritization: must-have vs nice-to-have.',
            'Use the output as your execution checklist.'
        ],
        linkLabel: 'Open AI Planning Workflow',
        linkUrl: 'https://www.youtube.com/results?search_query=ai+implementation+planning+for+developers'
    },
    {
        id: 'ux-flow',
        icon: Users,
        title: 'Design for Usability and Clarity',
        stage: 'Extended Toolkit',
        summary: 'Beauty alone is not enough; users must understand what to do next.',
        eli5: 'A beautiful house is frustrating if the front door is hard to find.',
        steps: [
            'Ensure hero section answers what, who, and why.',
            'Keep navigation concise.',
            'Use clear action-oriented CTA labels.',
            'Give each section one purpose.',
            'Remove elements that do not support decisions.'
        ],
        linkLabel: 'Open UX Basics',
        linkUrl: 'https://www.nngroup.com/articles/'
    },
    {
        id: 'content-copy',
        icon: BookOpen,
        title: 'Write Conversion-Focused Website Copy',
        stage: 'Extended Toolkit',
        summary: 'Clear copy increases trust and action.',
        eli5: 'If a shop sign is confusing, people walk away.',
        steps: [
            'Use a problem + promise headline.',
            'Use a plain-language subheadline.',
            'Add social proof or outcomes.',
            'Avoid technical jargon for general users.',
            'Use one primary CTA per page.'
        ],
        linkLabel: 'Open Landing Copy Tips',
        linkUrl: 'https://www.copyhackers.com/blog/'
    },
    {
        id: 'inspect-mobile-view',
        icon: Rocket,
        title: 'Inspect Element for Mobile View Validation',
        stage: 'Extended Toolkit',
        summary: 'Use browser DevTools to validate mobile layout before release.',
        eli5: 'Inspect mode lets you preview your website like different phones.',
        steps: [
            'Start from mobile-first width before desktop refinements.',
            'Open the website in Chrome.',
            'Press `F12` to open DevTools.',
            'Enable Device Toolbar (phone/tablet icon).',
            'Test multiple device presets and orientations.',
            'Adjust spacing, typography, and tap targets based on findings.'
        ],
        linkLabel: 'Open Chrome Device Mode Guide',
        linkUrl: 'https://developer.chrome.com/docs/devtools/device-mode'
    },
    {
        id: 'file-structure-basics',
        icon: BookOpen,
        title: 'File Structure Basics (Keep Projects Maintainable)',
        stage: 'Extended Toolkit',
        summary: 'Good folder structure reduces confusion as your project grows.',
        eli5: 'Organized folders are like labeled drawers: you find things faster.',
        steps: [
            'Split by purpose: pages, components, styles, lib, assets.',
            'Use clear and consistent file naming.',
            'Keep reusable UI in components.',
            'Keep helpers and API logic in lib/utils.',
            'Refactor structure regularly as the project scales.'
        ],
        linkLabel: 'Open Project Structure Guide',
        linkUrl: 'https://www.youtube.com/results?search_query=react+project+folder+structure+for+beginners'
    },
    {
        id: 'ask-ai-code-comments',
        icon: Brain,
        title: 'Want to Understand Code? Ask AI to Add Comments',
        stage: 'Extended Toolkit',
        summary: 'Use AI to annotate code so beginners can read it with confidence.',
        eli5: 'Comments are subtitles for code behavior.',
        steps: [
            'Copy the function/component you do not understand.',
            'Ask AI for a line-by-line explanation in plain language.',
            'Ask AI to insert comments without changing behavior.',
            'Re-read the commented version and compare.',
            'Remove extra comments after you understand the logic.'
        ],
        linkLabel: 'Open Code Explanation Workflow',
        linkUrl: 'https://www.youtube.com/results?search_query=understand+code+with+ai+comments'
    },
    {
        id: 'user-retention',
        icon: Users,
        title: 'User Retention: Bring Users Back Consistently',
        stage: 'Extended Toolkit',
        summary: 'Retention keeps your app useful over time, not just during launch hype.',
        eli5: 'Retention means people return because your app keeps helping them.',
        steps: [
            'Identify the user “aha moment” early.',
            'Reduce onboarding friction.',
            'Add habit loops (reminders, progress cues).',
            'Measure and fix drop-off points.',
            'Iterate quickly from active-user feedback.'
        ],
        linkLabel: 'Open User Retention Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=user+retention+for+web+apps+beginners'
    },
    {
        id: 'scale-your-app',
        icon: Rocket,
        title: 'Scale Your App for Growth',
        stage: 'Extended Toolkit',
        summary: 'As usage increases, your app must stay fast, reliable, and maintainable.',
        eli5: 'Scaling is upgrading systems before traffic overloads your app.',
        steps: [
            'Track core performance and error metrics.',
            'Optimize assets, queries, and frontend bundle size.',
            'Cache frequently accessed data.',
            'Split services when complexity increases.',
            'Set monitoring and incident alerts.'
        ],
        linkLabel: 'Open App Scaling Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=how+to+scale+web+application+beginners'
    },
    {
        id: 'monetize-app',
        icon: Sparkles,
        title: 'Monetize Your App Sustainably',
        stage: 'Extended Toolkit',
        summary: 'Choose a monetization model that matches product value and user maturity.',
        eli5: 'Monetization is how your app earns while continuing to deliver value.',
        steps: [
            'Pick an initial model: subscription, one-time, or freemium.',
            'Ensure free tier still delivers clear value.',
            'Price based on outcomes, not guesswork.',
            'Test pricing with a small segment first.',
            'Track free-to-paid conversion metrics.'
        ],
        linkLabel: 'Open App Monetization Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=app+monetization+for+beginners+saas'
    },
    {
        id: 'visual-troubleshooting',
        icon: Sparkles,
        title: 'Visual Troubleshooting (Copy-Paste Debug Workflow)',
        stage: 'Extended Toolkit',
        summary: 'Fix layout issues faster using a focused, repeatable troubleshooting loop.',
        eli5: 'Repair one part at a time, test it, then move to the next part.',
        steps: [
            'Capture the issue with screenshot and short problem statement.',
            'Copy only the relevant code block.',
            'Paste into AI with: problem, expected result, and snippet.',
            'Apply one small fix and re-test.',
            'Keep good changes, revert bad ones, and iterate.'
        ],
        linkLabel: 'Open Frontend Debugging Basics',
        linkUrl: 'https://www.youtube.com/results?search_query=frontend+debugging+workflow+for+beginners'
    },
    {
        id: 'connect-database',
        icon: Database,
        title: 'Connect Your Website to a Database',
        stage: 'Extended Toolkit',
        summary: 'Data storage enables personalized and persistent experiences.',
        eli5: 'A database is a labeled storage box for information.',
        steps: [
            'Create a Supabase project.',
            'Create essential tables first.',
            'Set URL + anon key in `.env`.',
            'Test one insert action.',
            'Test one read action.'
        ],
        linkLabel: 'Open Supabase Guide',
        linkUrl: 'https://supabase.com/docs/guides/getting-started'
    },
    {
        id: 'api-basics',
        icon: Brain,
        title: 'API Fundamentals for Beginners',
        stage: 'Extended Toolkit',
        summary: 'APIs allow your app to exchange data with external services.',
        eli5: 'An API is like a waiter: you place an order, the waiter brings your response back.',
        steps: [
            'Identify the data you need to send or receive.',
            'Review API endpoints and expected inputs.',
            'Understand request and response format.',
            'Test with sample data first.',
            'Handle API failure states clearly.'
        ],
        linkLabel: 'Open API Introduction',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction'
    },
    {
        id: 'fetching-basics',
        icon: Brain,
        title: 'Fetching Data in Practice',
        stage: 'Extended Toolkit',
        summary: 'Fetching is how your UI retrieves live data from APIs or databases.',
        eli5: 'You open a tap (request), water comes out (response), then you use it (render in UI).',
        steps: [
            'Define the data you need.',
            'Request data from the correct endpoint.',
            'Show loading state while waiting.',
            'Handle failed requests clearly.',
            'Render results in clean UI blocks.'
        ],
        linkLabel: 'Open Fetch API Guide',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'
    },
    {
        id: 'web-scraping-basics',
        icon: BookOpen,
        title: 'Web Scraping (Ethical Beginner Intro)',
        stage: 'Extended Toolkit',
        summary: 'Use scraping for research and references while respecting platform rules.',
        eli5: 'Scraping is like copying notes from a board, but you still must follow classroom rules.',
        steps: [
            'Check the site terms before scraping.',
            'Collect only publicly available information.',
            'Avoid aggressive request frequency.',
            'Store source URLs for attribution.',
            'Use output for insights, not blind duplication.'
        ],
        linkLabel: 'Open Web Scraping Intro',
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/Web_scraping'
    },
    {
        id: 'supabase-keys',
        icon: Database,
        title: 'Supabase Keys and Security Basics',
        stage: 'Extended Toolkit',
        summary: 'Know which keys are safe for frontend and which must remain private.',
        eli5: 'You have a guest key and a master key. Never hand out the master key publicly.',
        steps: [
            'Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend.',
            'Never expose `service_role` key in client code.',
            'Store credentials in `.env` files only.',
            'Ensure `.env` is excluded from Git commits.',
            'Apply RLS policies for safe data access.'
        ],
        linkLabel: 'Open Supabase API Keys Docs',
        linkUrl: 'https://supabase.com/docs/guides/api/api-keys'
    },
    {
        id: 'github-flow',
        icon: Github,
        title: 'Publish and Manage Project on GitHub',
        stage: 'Extended Toolkit',
        summary: 'Version control protects your work and supports collaboration.',
        eli5: 'Think of GitHub as a cloud folder with time machine history.',
        steps: [
            'Create a repository.',
            'Initialize git and make first commit.',
            'Connect remote URL.',
            'Push to GitHub.',
            'Commit frequently in small units.'
        ],
        linkLabel: 'Open GitHub Quickstart',
        linkUrl: 'https://docs.github.com/en/get-started/start-your-journey/hello-world'
    },
    {
        id: 'github-antigravity',
        icon: Github,
        title: 'GitHub and Antigravity Workflow',
        stage: 'Extended Toolkit',
        summary: 'Use Antigravity for acceleration and GitHub for controlled version history.',
        eli5: 'Antigravity helps you build faster; GitHub keeps a reliable history of each step.',
        steps: [
            'Connect local project to a GitHub repository.',
            'Use Antigravity for scoped feature generation.',
            'Review outputs before committing.',
            'Commit in small task-focused chunks.',
            'Push frequently to keep remote backup current.'
        ],
        linkLabel: 'Open GitHub Flow Guide',
        linkUrl: 'https://docs.github.com/en/get-started/using-github/github-flow'
    },
    {
        id: 'deploy-live',
        icon: Rocket,
        title: 'Deploy Your Website to Production',
        stage: 'Extended Toolkit',
        summary: 'Deployment makes your product accessible to real users.',
        eli5: 'Before deployment, your website lives in your room. After deployment, it lives on a public street.',
        steps: [
            'Create a Vercel account.',
            'Import your GitHub repository.',
            'Configure environment variables.',
            'Run deployment.',
            'Validate live user flows.'
        ],
        linkLabel: 'Open Vercel Guide',
        linkUrl: 'https://vercel.com/docs/getting-started-with-vercel'
    },
    {
        id: 'vercel-production',
        icon: Rocket,
        title: 'Vercel Preview vs Production',
        stage: 'Extended Toolkit',
        summary: 'Test in preview first, then release safely to production.',
        eli5: 'Preview is rehearsal; production is the real public show.',
        steps: [
            'Import GitHub repository into Vercel.',
            'Configure environment variables by environment.',
            'Validate core flows in preview URL.',
            'Check API, forms, and mobile behavior.',
            'Promote/deploy to production only after checks pass.'
        ],
        linkLabel: 'Open Vercel Deployment Docs',
        linkUrl: 'https://vercel.com/docs/deployments/overview'
    },
    {
        id: 'install-skills',
        icon: Sparkles,
        title: 'Install Skills and Starter Resources',
        stage: 'Extended Toolkit',
        summary: 'Skills and templates accelerate beginner workflows.',
        eli5: 'Skills are like equipment presets that make each mission easier.',
        steps: [
            'Pick one skill based on current goal.',
            'Install via your chosen assistant/tool.',
            'Run a tiny test task.',
            'Save reusable prompt templates.',
            'Add new skills gradually.'
        ],
        linkLabel: 'Open Skill Guide',
        linkUrl: 'https://platform.openai.com/docs'
    },
    {
        id: 'creative-motion',
        icon: Sparkles,
        title: 'Creative Mode: Motion and Interaction',
        stage: 'Extended Toolkit',
        summary: 'After launch, use motion to improve delight and guidance.',
        eli5: 'Animation is seasoning: a small amount improves everything.',
        steps: [
            'Choose 2-3 motion patterns only.',
            'Prioritize reveal, hover, and feedback states.',
            'Use motion to guide attention.',
            'Check performance impact.',
            'Support reduced-motion settings.'
        ],
        linkLabel: 'Open Motion Inspiration',
        linkUrl: 'https://www.awwwards.com/websites/animations/'
    },
    {
        id: 'ai-imagination',
        icon: Brain,
        title: 'Creative Imagination with AI',
        stage: 'Extended Toolkit',
        summary: 'Use AI to explore original ideas while keeping human direction.',
        eli5: 'AI can build quickly, but you still decide the destination.',
        steps: [
            'Start with one ambitious but useful idea.',
            'Break it into small features.',
            'Prototype quickly with AI.',
            'Test with real users.',
            'Improve based on feedback.'
        ],
        linkLabel: 'Open AI Product Inspiration',
        linkUrl: 'https://www.producthunt.com/'
    }
];

const COPY_BY_TONE = {
    ijam: {
        title: 'Resource Path Ala Ijam',
        subtitle: 'Santai je. Semua aku explain macam borak dengan beginner total. Kita jalan step by step: guna AI, sambung database, upload GitHub, pastu deploy live.',
        libraryHint: 'Aku tunjuk satu resource sekali je supaya kepala tak serabut.',
        tip: 'Tip Ijam: settle satu lesson dulu, baru pergi next. Slow-slow pun takpe.'
    },
    formal: {
        title: 'Beginner Resource Path',
        subtitle: 'This learning path is designed for complete beginners. Follow each step in order: AI tools, database setup, GitHub workflow, and deployment.',
        libraryHint: 'Only one community resource is shown at a time to keep learning focused.',
        tip: 'Beginner tip: complete one lesson before moving to the next.'
    }
};

const LESSON_TIPS_BY_TONE = {
    ijam: {
        'setup-environment': ['Guna Node LTS, elak version experimental.', 'Lepas install, restart terminal sebelum check `node -v`.', 'Kalau ada error, screenshot terus untuk debug cepat.'],
        'setup-ai-api-key': ['Groq API sangat pantas kalau nak test feature.', 'Simpan key kat tempat selamat, bukan hardcode.', 'OpenRouter paling chill sebab satu wallet cover semua.'],
        'chatgpt-personality': ['Tulis role dia, bagi contoh.', 'Bincang panjang lebar kat ChatGPT dulu, sebelum sentuh code.', 'Bagi dia critique idea kau.'],
        'chatgpt-master-prompt': ['Ini trick rahsia. JANGAN type satu-satu kat Antigravity, bagi MASTER PROMPT terus.', 'Tekankan UI design sistem yang jelas.', 'Pastikan SQL schema ada dalam tu kalau perlukan backend.'],
        'antigravity-sonnet': ['Pilih Claude 3.5 Sonnet untuk kestabilan logic.', 'Guna Gemini Flash kalau design lari.', 'Boleh switch model ikut task.'],
        'github-repo-setup': ['Commit kecil tapi kerap.', 'Penting: Faham beza `git pull` dengan `git fetch`.', 'Push setiap habis satu feature.'],
        'vercel-deploy': ['Check env vars sebelum deploy.', 'Test flow utama selepas live.', 'PASTE URL VERCEL DALAM TERMINAL UNTUK DAPAT TROPHY!', 'Simpan checklist deployment.'],
        'vercel-analytics': ['Letak tag Analytis kat root (App.js).', 'Kalau pakai Next.js, ada Vercel Analytics wrapper.', 'Tengok log live kat dashboard.'],
        'supabase-setup': ['Anon key untuk frontend je.', 'Service role key JANGAN expose dalam code frontend.', 'Letak kat `.env` dan `.gitignore` fail tu.'],
        'supabase-sql': ['Guna AI untuk generate Table creation command.', 'Copy SQL dari ChatGPT, paste kat browser Supabase.', 'Run test data dari editor terus.'],
        'supabase-connect': ['Masukkan environment variables Supabase tu ke Vercel setting.', 'Jangan hard-code URL.', 'Bind variable VITE_SUPABASE_URL.'],
        'custom-domain': ['Domain CNAME setting kat portal domain (CTH: Namecheap).', 'Ping DNS checker untuk tengok dah propagate.', 'Vercel urus SSL automatik.'],
        'install-node-antigravity': ['Guna Node LTS, elak version experimental.', 'Lepas install, restart terminal sebelum check `node -v`.', 'Kalau ada error, screenshot terus untuk debug cepat.'],
        'the-4-step-flow': ['Ingat langkah ni supaya tak sesat di tengah jalan.', 'Jangan lari ke Vercel kalau tahap Vibe Coding lum siap.', 'Idea brainstormed baik menjimatkan masa coding.'],
        'ai-tech-stack': ['Bookmark tool ni siap-siap.', 'Bila buntu idea, campak ke ChatGPT, bukan terus paksa Antigravity buat kod.', 'Gemini 3.1 paling mantap buat overall architecture.'],
        'skill-md-basics': ['Mulakan dengan instruction pendek dan specific.', 'Satu skill fokus satu objective.', 'Test skill guna task kecil dulu.'],
        'style-direction': ['Pilih 1 primary style, bukan campur 5 style.', 'Buat moodboard ringkas sebelum generate UI.', 'Pastikan warna dan font konsisten.'],
        'ai-refer-design': ['Bagi AI 1-2 reference je supaya direction clear.', 'Cakap elemen apa yang kau nak tiru (spacing/typography).', 'Minta AI elak copy 100%.', 'Gaya kau: minta theme match dengan identity site sedia ada.'],
        'container-frame-element': ['Bina container dulu, baru isi content.', 'Jangan letak terlalu banyak element dalam satu frame.', 'Semak hierarchy: apa paling penting user kena nampak dulu.'],
        'move-elements': ['Guna grid untuk align element.', 'Semak jarak minimum antara button.', 'Bandingkan before/after screenshot.'],
        'asset-format-basics': ['SVG untuk icon/logo, paling tajam.', 'Compress JPG/PNG sebelum upload.', 'Elak guna image besar kalau boleh crop dulu.'],
        'generate-assets-ai': ['Prompt jelas: style, warna, usage.', 'Generate banyak option, pilih best.', 'Edit sikit manually bagi nampak original.'],
        'generate-3d-assets': ['Guna 3D pada section penting sahaja.', 'Optimize GLB supaya page tak berat.', 'Sediakan fallback image untuk phone lama.'],
        'ai-build-website': ['Prompt ikut structure page dulu.', 'Minta AI output section by section.', 'Review setiap output sebelum continue.'],
        'basic-prompting': ['Format simple: Goal + Context + Output.', 'Letak contoh output kalau perlu.', 'Iterate prompt v2 cepat.', 'Gaya kau: terus suruh AI proceed selepas plan, jangan terlalu banyak teori.'],
        'ai-implementation-planning': ['Minta AI bagi plan ikut fasa dan priority.', 'Minta AI list blockers dan assumption awal.', 'Gaya kau: plan mesti ada langkah practical dan terus executable.'],
        'ux-flow': ['Setiap section mesti ada tujuan.', 'CTA kena jelas dan action-based.', 'Buang elemen yang tak bantu user.'],
        'content-copy': ['Headline kena terus explain value.', 'Gunakan bahasa user, bukan jargon.', 'Pastikan satu page satu CTA utama.'],
        'inspect-mobile-view': ['Start 375px dulu (mobile-first).', 'Check button size senang tap.', 'Test portrait + landscape.', 'Gaya kau: verify view dulu sebelum polish details desktop.'],
        'file-structure-basics': ['Folder ikut fungsi, bukan ikut suka-suka.', 'Nama fail konsisten dari awal.', 'Refactor structure bila project membesar.'],
        'ask-ai-code-comments': ['Paste code kecil dulu, jangan terlalu panjang.', 'Minta AI explain line-by-line.', 'Delete komen berlebihan bila dah faham.'],
        'visual-troubleshooting': ['Fix satu issue satu masa.', 'Simpan sebelum test fix baru.', 'Revert cepat kalau patch tak jadi.', 'Gaya kau: attach screenshot + snippet masa report issue untuk diagnosis cepat.'],
        'connect-database': ['Bina table minimum viable dulu.', 'Test insert/read awal.', 'Pastikan `.env` betul sebelum blame code.'],
        'api-basics': ['Semak endpoint dan method betul.', 'Validate response shape.', 'Handle error message untuk user.'],
        'fetching-basics': ['Wajib ada loading state.', 'Wajib ada error state.', 'Jangan fetch data tak perlu.'],
        'web-scraping-basics': ['Semak terms website dulu.', 'Jangan scrape terlalu laju.', 'Simpan source untuk rujukan.'],
        'supabase-keys': ['Anon key untuk frontend je.', 'Service role key jangan expose.', 'Semak RLS sebelum production.'],
        'github-flow': ['Commit kecil tapi kerap.', 'Nama commit mesti jelas.', 'Push selepas milestone kecil.'],
        'github-antigravity': ['Review AI output sebelum commit.', 'Satu feature satu commit.', 'Elak auto-merge tanpa test.'],
        'deploy-live': ['Check env vars sebelum deploy.', 'Test flow utama selepas live.', 'Simpan checklist deployment.'],
        'vercel-production': ['Guna preview URL untuk QA dulu.', 'Semak API + form di preview.', 'Baru promote ke production.'],
        'install-skills': ['Install skill ikut keperluan semasa.', 'Jangan pasang terlalu banyak sekaligus.', 'Simpan prompt template untuk repeat task.'],
        'creative-motion': ['Animation mesti bantu fokus, bukan ganggu.', 'Gunakan duration ringkas 150-300ms.', 'Support reduced motion.'],
        'ai-imagination': ['Mulakan idea kecil tapi unik.', 'Uji dengan user sebenar.', 'Iterate ikut feedback, bukan ego.']
    },
    formal: {
        'setup-environment': ['Use Node LTS.', 'Restart your terminal.'],
        'setup-ai-api-key': ['Groq API is fast.', 'Keep keys secure.'],
        'chatgpt-personality': ['Set explicit persona context first.'],
        'chatgpt-master-prompt': ['Summarize context into ONE strong prompt.'],
        'antigravity-sonnet': ['Select Claude 3.5 Sonnet for logic stability.', 'Use Gemini Flash for aesthetic adjustments.'],
        'github-repo-setup': ['Commit in small blocks.', 'Understand pull vs fetch.'],
        'vercel-deploy': ['Check env vars before deploy.', 'Verify functionality after pushing live.'],
        'vercel-analytics': ['Place analytics component in the app root.'],
        'supabase-setup': ['Protect your service role key always.'],
        'supabase-sql': ['Validate AI generated SQL before execution in the editor.'],
        'supabase-connect': ['Configure environment variables carefully within Vercel pipeline.'],
        'custom-domain': ['Link CNAME and A records.', 'SSL is automatically provisioned.'],
        'install-node-antigravity': ['Use Node.js LTS for stability.', 'Restart terminal after installation.', 'Capture exact error logs for faster debugging.'],
        'the-4-step-flow': ['Memorizing this flow prevents getting overwhelmed later.', 'Complete Vibe Coding locally before worrying about Vercel deployments.', 'A strong ChatGPT brainstorm session limits Antigravity context switch.'],
        'ai-tech-stack': ['Bookmark your tools so they are easily accessible.', 'Delegate complex ideation strictly to ChatGPT before throwing code at Antigravity.', 'Use Gemini 3.1 for high-performance references and prompt engineering.'],
        'skill-md-basics': ['Keep instructions concise and explicit.', 'One skill should target one clear objective.', 'Validate with a small test task first.'],
        'style-direction': ['Choose one primary style direction.', 'Create a lightweight moodboard first.', 'Keep typography and color tokens consistent.'],
        'ai-refer-design': ['Provide 1-2 reference links only.', 'Specify which traits to emulate.', 'Avoid direct copying of full layouts.', 'Your workflow favors theme alignment with the existing site identity.'],
        'container-frame-element': ['Define containers before details.', 'Avoid overcrowding one frame.', 'Prioritize visual hierarchy.'],
        'move-elements': ['Align elements on a grid.', 'Maintain consistent spacing.', 'Compare before/after snapshots.'],
        'asset-format-basics': ['Use SVG for icons and logos.', 'Compress JPG/PNG before upload.', 'Resize assets to actual render dimensions.'],
        'generate-assets-ai': ['Prompt with style and usage context.', 'Generate multiple variants.', 'Refine manually for originality.'],
        'generate-3d-assets': ['Limit 3D to key moments.', 'Optimize GLB/glTF payload size.', 'Provide fallback assets for low-end devices.'],
        'ai-build-website': ['Generate structure before polish.', 'Work section-by-section.', 'Review each iteration with a checklist.'],
        'basic-prompting': ['Use Goal + Context + Output format.', 'Include constraints explicitly.', 'Iterate quickly with prompt versions.', 'Your workflow prefers fast execution after planning, not long theory loops.'],
        'ai-implementation-planning': ['Ask AI for phase-based priorities.', 'Request risks, assumptions, and fallback paths.', 'Keep outputs directly actionable for immediate implementation.'],
        'ux-flow': ['Ensure each section has one purpose.', 'Use clear action labels for CTAs.', 'Remove non-essential UI noise.'],
        'content-copy': ['Lead with value in the headline.', 'Use plain user language.', 'Keep one primary CTA per page.'],
        'inspect-mobile-view': ['Start with mobile-first width (375px).', 'Verify tap targets and legibility.', 'Test multiple device presets.', 'Validate phone experience before desktop polish.'],
        'file-structure-basics': ['Organize by responsibility.', 'Use consistent naming conventions.', 'Refactor structure as complexity grows.'],
        'ask-ai-code-comments': ['Share focused code snippets.', 'Request line-by-line plain explanations.', 'Remove redundant comments after learning.'],
        'visual-troubleshooting': ['Change one variable at a time.', 'Capture baseline before patching.', 'Revert quickly when a fix fails.', 'Provide screenshot + code snippet for faster diagnosis.'],
        'connect-database': ['Start with minimal schema.', 'Test insert/read immediately.', 'Verify environment configuration first.'],
        'api-basics': ['Confirm method and endpoint.', 'Validate response contracts.', 'Implement user-friendly error handling.'],
        'fetching-basics': ['Implement loading and error states.', 'Avoid unnecessary requests.', 'Cache where appropriate.'],
        'web-scraping-basics': ['Respect terms and robots guidance.', 'Throttle requests responsibly.', 'Keep source attribution.'],
        'supabase-keys': ['Expose only anon key in frontend.', 'Never ship service role key.', 'Enforce RLS before launch.'],
        'github-flow': ['Commit in small logical units.', 'Write clear commit messages.', 'Push frequently after stable checkpoints.'],
        'github-antigravity': ['Review AI-generated changes before commit.', 'Keep changes scoped per feature.', 'Do not merge without verification.'],
        'deploy-live': ['Validate env vars before deployment.', 'Test critical user flows after launch.', 'Use a repeatable release checklist.'],
        'vercel-production': ['QA thoroughly on preview URLs.', 'Validate APIs and forms in preview.', 'Promote only after checks pass.'],
        'install-skills': ['Install skills based on current needs.', 'Avoid tool overload early.', 'Keep reusable prompt templates.'],
        'creative-motion': ['Use motion to guide attention.', 'Keep transitions short and intentional.', 'Respect reduced-motion preferences.'],
        'ai-imagination': ['Start with focused creative hypotheses.', 'Test with real users early.', 'Iterate based on evidence.']
    }
};

const TOOL_REFERENCES = [
    {
        name: 'Vercel',
        purpose: 'Deploy and host your website',
        links: [
            { label: 'Getting Started', url: 'https://vercel.com/docs/getting-started-with-vercel' },
            { label: 'Environments (Local / Preview / Production)', url: 'https://vercel.com/docs/deployments/environments' },
            { label: 'Environment Variables', url: 'https://vercel.com/docs/environment-variables' }
        ]
    },
    {
        name: 'Supabase',
        purpose: 'Database, auth, and backend services',
        links: [
            { label: 'Get Started', url: 'https://supabase.com/docs/guides/getting-started' },
            { label: 'JavaScript Client Init', url: 'https://supabase.com/docs/reference/javascript/v1/initializing' },
            { label: 'API Keys (anon vs service role)', url: 'https://supabase.com/docs/guides/api/api-keys' },
            { label: 'Row Level Security (RLS)', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security' }
        ]
    },
    {
        name: 'GitHub',
        purpose: 'Version control and collaboration',
        links: [
            { label: 'Hello World (Repo -> Branch -> PR)', url: 'https://docs.github.com/get-started/start-your-journey/hello-world' },
            { label: 'GitHub Flow', url: 'https://docs.github.com/en/get-started/using-github/github-flow' }
        ]
    },
    {
        name: 'Node.js',
        purpose: 'Runtime needed to run modern JavaScript projects',
        links: [
            { label: 'Download Node.js LTS', url: 'https://nodejs.org/en/download/' }
        ]
    },
    {
        name: 'Antigravity',
        purpose: 'AI-assisted building workflow',
        links: [
            { label: 'Antigravity Website', url: 'https://antigravity.id' }
        ]
    }
];

const TECH_TERMS = [
    {
        term: 'AI Agent',
        explain: 'AI yang boleh ambil task dan buat langkah-langkah untuk capai goal, bukan sekadar jawab soalan.'
    },
    {
        term: 'Agentic AI',
        explain: 'Style AI yang lebih autonomous: boleh plan, decide next step, guna tools, dan loop sampai task siap.'
    },
    {
        term: 'LLM',
        explain: 'Large Language Model. Otak bahasa yang faham prompt dan generate jawapan/code/content.'
    },
    {
        term: 'API',
        explain: 'Jalan komunikasi antara app dan service lain. App request data, API bagi response.'
    },
    {
        term: 'Frontend',
        explain: 'Bahagian yang user nampak dan klik (UI website).'
    },
    {
        term: 'Backend',
        explain: 'Bahagian belakang tabir yang urus data, auth, logic, dan server actions.'
    },
    {
        term: 'Environment Variables',
        explain: 'Setting rahsia/config seperti keys dan URLs yang disimpan luar code, biasanya dalam `.env`.'
    },
    {
        term: 'Supabase Anon Key',
        explain: 'Client key untuk frontend. Boleh expose, tapi access tetap dikawal oleh RLS policy.'
    },
    {
        term: 'Supabase Service Role Key',
        explain: 'Master key untuk server-only. Jangan letak dalam frontend/browser.'
    },
    {
        term: 'RLS (Row Level Security)',
        explain: 'Rules dalam database untuk tentukan siapa boleh baca/tulis row tertentu.'
    },
    {
        term: 'Deployment',
        explain: 'Proses publish app ke internet supaya orang lain boleh guna.'
    },
    {
        term: 'Preview vs Production',
        explain: 'Preview untuk test sebelum live. Production untuk users sebenar.'
    }
];

const LESSON_MEDIA = {
    'install-node-antigravity': {
        visual: '/lesson-visuals/install-node-antigravity.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=install+nodejs+lts+for+beginners+and+setup+dev+environment',
        youtubeLabel: 'Watch Node.js + Setup Tutorial'
    },
    'skill-md-basics': {
        visual: '/lesson-visuals/skill-md-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=markdown+files+for+beginners+skill+documentation',
        youtubeLabel: 'Watch Markdown / SKILL.md Tutorial'
    },
    'style-direction': {
        visual: '/lesson-visuals/style-direction.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=web+design+styles+glassmorphism+neo+brutalism+examples',
        youtubeLabel: 'Watch Web Design Style Tutorial'
    },
    'container-frame-element': {
        visual: '/lesson-visuals/style-direction.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=container+frame+element+ui+design+for+beginners',
        youtubeLabel: 'Watch Container / Frame / Element Tutorial'
    },
    'move-elements': {
        visual: '/lesson-visuals/ux-flow.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=move+elements+in+ui+design+alignment+spacing',
        youtubeLabel: 'Watch Move Elements Tutorial'
    },
    'asset-format-basics': {
        visual: '/lesson-visuals/style-direction.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=jpg+png+svg+for+web+design+beginners',
        youtubeLabel: 'Watch Asset Format Basics'
    },
    'generate-assets-ai': {
        visual: '/lesson-visuals/ai-build-website.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=generate+website+assets+with+ai',
        youtubeLabel: 'Watch AI Asset Generation'
    },
    'generate-3d-assets': {
        visual: '/lesson-visuals/creative-motion.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=3d+assets+for+web+gltf+glb+beginners',
        youtubeLabel: 'Watch 3D Assets for Web'
    },
    'ai-build-website': {
        visual: '/lesson-visuals/ai-build-website.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=build+website+with+ai+for+beginners',
        youtubeLabel: 'Watch AI Website Build Tutorial'
    },
    'ai-refer-design': {
        visual: '/lesson-visuals/style-direction.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=using+ai+with+website+design+references',
        youtubeLabel: 'Watch AI Design Referencing Tutorial'
    },
    'basic-prompting': {
        visual: '/lesson-visuals/ai-build-website.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=prompt+engineering+for+beginners+web+building',
        youtubeLabel: 'Watch Basic Prompting Tutorial'
    },
    'ai-implementation-planning': {
        visual: '/lesson-visuals/ai-build-website.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=ai+implementation+planning+for+developers',
        youtubeLabel: 'Watch AI Implementation Planning'
    },
    'ux-flow': {
        visual: '/lesson-visuals/ux-flow.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=website+ux+flow+for+beginners',
        youtubeLabel: 'Watch UX Flow Tutorial'
    },
    'content-copy': {
        visual: '/lesson-visuals/content-copy.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=website+copywriting+for+beginners+landing+page',
        youtubeLabel: 'Watch Copywriting Tutorial'
    },
    'inspect-mobile-view': {
        visual: '/lesson-visuals/inspect-mobile-view.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=chrome+devtools+device+mode+mobile+testing',
        youtubeLabel: 'Watch Inspect Element Mobile Tutorial'
    },
    'file-structure-basics': {
        visual: '/lesson-visuals/skill-md-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=react+project+folder+structure+for+beginners',
        youtubeLabel: 'Watch File Structure Basics'
    },
    'ask-ai-code-comments': {
        visual: '/lesson-visuals/skill-md-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=ask+ai+to+explain+code+with+comments',
        youtubeLabel: 'Watch AI Code Comment Workflow'
    },
    'user-retention': {
        visual: '/lesson-visuals/ux-flow.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=user+retention+for+web+apps+beginners',
        youtubeLabel: 'Watch User Retention Basics'
    },
    'scale-your-app': {
        visual: '/lesson-visuals/deploy-live.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+scale+web+application+beginners',
        youtubeLabel: 'Watch App Scaling Basics'
    },
    'monetize-app': {
        visual: '/lesson-visuals/content-copy.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=app+monetization+for+beginners+saas',
        youtubeLabel: 'Watch App Monetization Basics'
    },
    'visual-troubleshooting': {
        visual: '/lesson-visuals/inspect-mobile-view.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=frontend+visual+debugging+for+beginners',
        youtubeLabel: 'Watch Visual Troubleshooting Tutorial'
    },
    'connect-database': {
        visual: '/lesson-visuals/connect-database.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=supabase+connect+database+to+frontend+beginner',
        youtubeLabel: 'Watch Database Connection Tutorial'
    },
    'api-basics': {
        visual: '/lesson-visuals/api-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=api+explained+for+beginners+web+development',
        youtubeLabel: 'Watch API Basics Tutorial'
    },
    'fetching-basics': {
        visual: '/lesson-visuals/fetching-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=javascript+fetch+api+for+beginners',
        youtubeLabel: 'Watch Fetching Tutorial'
    },
    'web-scraping-basics': {
        visual: '/lesson-visuals/web-scraping-basics.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=web+scraping+for+beginners+ethical+guide',
        youtubeLabel: 'Watch Web Scraping Tutorial'
    },
    'supabase-keys': {
        visual: '/lesson-visuals/supabase-keys.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=supabase+anon+key+service+role+explained',
        youtubeLabel: 'Watch Supabase Keys Tutorial'
    },
    'github-flow': {
        visual: '/lesson-visuals/github-flow.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=github+flow+for+beginners',
        youtubeLabel: 'Watch GitHub Flow Tutorial'
    },
    'github-antigravity': {
        visual: '/lesson-visuals/github-antigravity.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=ai+coding+workflow+with+github+best+practices',
        youtubeLabel: 'Watch GitHub + AI Workflow Tutorial'
    },
    'deploy-live': {
        visual: '/lesson-visuals/deploy-live.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=deploy+website+to+vercel+for+beginners',
        youtubeLabel: 'Watch Deploy Tutorial'
    },
    'vercel-production': {
        visual: '/lesson-visuals/vercel-production.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=vercel+preview+vs+production+deployment',
        youtubeLabel: 'Watch Vercel Production Tutorial'
    },
    'install-skills': {
        visual: '/lesson-visuals/install-skills.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=ai+skills+workflow+for+beginners',
        youtubeLabel: 'Watch Skills Setup Tutorial'
    },
    'creative-motion': {
        visual: '/lesson-visuals/creative-motion.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=web+animation+for+beginners+ui+motion',
        youtubeLabel: 'Watch Creative Motion Tutorial'
    },
    'ai-imagination': {
        visual: '/lesson-visuals/ai-imagination.svg',
        youtubeUrl: 'https://www.youtube.com/results?search_query=creative+ai+product+design+workflow',
        youtubeLabel: 'Watch AI Creativity Tutorial'
    }
};

const sectionStyle = {
    paddingTop: '36px',
    paddingBottom: '70px',
    minHeight: '80vh',
    background: 'radial-gradient(circle at 10% 10%, #fff8dc 0%, #fff0b3 40%, #ffe6d5 100%)'
};

const panelStyle = {
    border: '3px solid black',
    boxShadow: '8px 8px 0 black',
    borderRadius: '14px',
    background: 'white',
    position: 'relative'
};

const DRIBBBLE_TAGS_BY_STAGE = {
    Design: [
        { label: 'Neo Brutalism', url: 'https://dribbble.com/tags/neo-brutalism' },
        { label: 'Glassmorphism', url: 'https://dribbble.com/tags/glassmorphism' },
        { label: 'Bento UI', url: 'https://dribbble.com/tags/bento_ui' },
        { label: 'Landing Page', url: 'https://dribbble.com/tags/landing_page' }
    ],
    UX: [
        { label: 'Mobile App UX', url: 'https://dribbble.com/tags/mobile_app_design' },
        { label: 'Dashboard UI', url: 'https://dribbble.com/tags/dashboard_ui' },
        { label: 'SaaS UI', url: 'https://dribbble.com/tags/saas' },
        { label: 'User Flow', url: 'https://dribbble.com/tags/user_flow' }
    ],
    Content: [
        { label: 'Hero Section', url: 'https://dribbble.com/tags/hero_section' },
        { label: 'Typography', url: 'https://dribbble.com/tags/typography' },
        { label: 'Brand Identity', url: 'https://dribbble.com/tags/branding' },
        { label: 'Portfolio', url: 'https://dribbble.com/tags/portfolio' }
    ],
    Creative: [
        { label: 'Web Animation', url: 'https://dribbble.com/tags/animation' },
        { label: 'Micro Interaction', url: 'https://dribbble.com/tags/microinteraction' },
        { label: 'Creative Website', url: 'https://dribbble.com/tags/creative_website' },
        { label: 'Experimental UI', url: 'https://dribbble.com/tags/experimental' }
    ]
};

const DRIBBBLE_DEFAULT_TAGS = [
    { label: 'Web Design', url: 'https://dribbble.com/tags/web_design' },
    { label: 'UI Design', url: 'https://dribbble.com/tags/ui_design' },
    { label: 'Responsive Design', url: 'https://dribbble.com/tags/responsive_design' },
    { label: 'Website', url: 'https://dribbble.com/tags/website' }
];

const SoonSticker = () => (
    <svg viewBox="0 0 190 66" aria-hidden="true" style={{ width: '96px', height: '34px' }}>
        <rect x="3" y="3" width="184" height="60" rx="16" fill="#fde047" stroke="#111827" strokeWidth="4" />
        <circle cx="24" cy="33" r="10" fill="#ef4444" stroke="#111827" strokeWidth="3" />
        <polygon points="21,26 31,33 21,40" fill="#fff" />
        <text x="42" y="29" fontSize="13" fontWeight="900" fill="#111827" fontFamily="system-ui, sans-serif">
            IJAM LESSONS
        </text>
        <text x="42" y="46" fontSize="11" fontWeight="900" fill="#111827" fontFamily="system-ui, sans-serif">
            COMING SOON
        </text>
    </svg>
);

const RESOURCE_AI_MODES = [
    { id: 'explain', label: 'Explain' },
    { id: 'next_actions', label: 'Next 3 Actions' },
    { id: 'troubleshoot', label: 'Troubleshoot' },
    { id: 'plan', label: 'Implementation Plan' }
];

const trackResourceEvent = (eventName, meta = {}) => {
    try {
        const key = 'resource_ai_telemetry';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        current.push({ eventName, meta, ts: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(current.slice(-200)));
    } catch (error) {
        console.warn('Resource telemetry failed:', error);
    }
};

const buildResourceAiPrompt = ({ mode, lesson, teachingTone, userInput, tips }) => {
    const modeInstruction = {
        explain: 'Explain this lesson in beginner-friendly steps with practical examples.',
        next_actions: 'Give exactly 3 clear next actions with checkboxes.',
        troubleshoot: 'Diagnose likely causes and provide a minimal step-by-step fix path.',
        plan: 'Create a phased implementation plan: UI, Data, QA, Deploy with priorities.'
    }[mode] || 'Help the user complete this lesson.';

    return [
        `Mode: ${mode}`,
        `Tone: ${teachingTone}`,
        `Lesson: ${lesson.title} (${lesson.stage})`,
        `Summary: ${lesson.summary}`,
        `Core steps: ${lesson.steps.join(' | ')}`,
        `Known tips: ${tips.join(' | ')}`,
        `User input: ${userInput || 'No extra input provided.'}`,
        `Instruction: ${modeInstruction}`,
        'Output format: Short sections with actionable bullets. Keep concise and practical.'
    ].join('\n');
};

const getStageGreeting = (stage, tone) => {
    if (tone === 'formal') {
        switch (stage) {
            case 'Foundation': return 'System Initialization Sequence:';
            case 'Ideation': return 'Strategic Planning Phase:';
            case 'Vibe Coding': return 'Development Environment Active:';
            case 'Versioning': return 'Source Control Management:';
            case 'Launch': return 'Deployment Protocol Initiated:';
            case 'Database': return 'Data Architecture Setup:';
            default: return 'Module Objective:';
        }
    } else {
        switch (stage) {
            case 'Foundation': return 'yo kita setup tapak rumah dulu ni:';
            case 'Ideation': return 'masa untuk perah otak, chief:';
            case 'Vibe Coding': return 'time untuk vibe coding, chill & code:';
            case 'Versioning': return 'save progress kau kat awan:';
            case 'Launch': return 'jom terbang ke bulan (live deployment):';
            case 'Database': return 'bina memori bot otak kau:';
            default: return 'lesson baru unlock:';
        }
    }
};

const buildIjamBotLessonBrief = ({ lesson, tips, tone }) => {
    const stageGreeting = getStageGreeting(lesson.stage, tone);
    const intro = `${stageGreeting} ${lesson.title}`;
    const why = tone === 'ijam'
        ? `kenapa penting: ${lesson.summary}`
        : `Why it matters: ${lesson.summary}`;
    const explain = tone === 'ijam'
        ? `penerangan ijam: ${lesson.eli5}`
        : `Simple explanation: ${lesson.eli5}`;
    const steps = (lesson.steps || []).slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n');
    const tipsBlock = (tips || []).slice(0, 4).map((t) => `- ${t}`).join('\n');

    return [
        intro,
        why,
        explain,
        '',
        tone === 'ijam' ? 'klik "> show next step" untuk mula.' : 'Click "> show next step" to begin.',
        tone === 'ijam' ? '\nkalau stuck, terus type: debug <isu kau> (¬‿¬)' : ''
    ].join('\n');
};

const WindowFrame = ({ title, onClose, children, icon: Icon }) => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '48px', background: '#111827', border: 'none', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>
        <div style={{ background: '#f5d000', padding: '10px 16px', borderBottom: '3px solid #0b1220', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0b1220', fontWeight: 900, fontFamily: 'monospace', fontSize: '14px' }}>
                {Icon && <Icon size={16} />}
                {title}
            </div>
            <button
                onClick={onClose}
                style={{ background: '#c8102e', border: '2px solid #0b1220', color: '#fff', padding: '4px 12px', fontWeight: 900, cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
            >
                CLOSE [X]
            </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
        </div>
    </div>
);

const DesktopIcon = ({ label, icon: Icon, onClick, color = "#f5d000" }) => (
    <button
        onClick={onClick}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'background 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(245, 208, 0, 0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <div style={{ background: '#0b1220', border: '2px solid #f5d000', color: color, padding: '12px', borderRadius: '12px', boxShadow: '4px 4px 0 #0b1220' }}>
            <Icon size={32} />
        </div>
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 900, fontFamily: 'monospace', textShadow: '2px 2px 2px #000' }}>{label}</span>
    </button>
);

const StartMenuApp = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'background 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <Icon size={24} color="#f8fafc" />
        <span style={{ color: '#f8fafc', fontSize: '10px', fontWeight: 600, fontFamily: 'monospace' }}>{label}</span>
    </button>
);

const ResourcePage = ({ session, currentUser }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [communityResources, setCommunityResources] = useState([]);
    const [libraryIndex, setLibraryIndex] = useState(0);
    const [teachingTone, setTeachingTone] = useState('ijam');
    const [assistantMode, setAssistantMode] = useState('explain');
    const [assistantInput, setAssistantInput] = useState('');
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(true);
    const [slideIndex, setSlideIndex] = useState(-1);
    const [showTips, setShowTips] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState([
        { role: 'assistant', content: 'IJAM_BOT ready. Pick a mode and ask about this lesson.' }
    ]);

    const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'ai', 'cloud', 'social'
    const [searchQuery, setSearchQuery] = useState('');
    const [activeWindow, setActiveWindow] = useState(null); // 'terminal', 'files', 'stats', null
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [startMenuSearch, setStartMenuSearch] = useState('');

    const [chatMessages, setChatMessages] = useState([
        { role: 'bot', text: 'IJAM_OS_INITIALIZED: Greetings, Builder. I am Antigravity. Type your command or click on the lessons above to begin.' }
    ]);

    // --- Computer Experience States ---
    const [isBooted, setIsBooted] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [bootText, setBootText] = useState('');
    const [isBooting, setIsBooting] = useState(false);
    const [systemTime, setSystemTime] = useState('');
    const [systemDate, setSystemDate] = useState('');

    // --- Profile/Settings Form States ---
    const [profileForm, setProfileForm] = useState({
        username: '',
        district: '',
        ideaTitle: '',
        problemStatement: ''
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setProfileForm({
                username: currentUser.name || '',
                district: currentUser.district || '',
                ideaTitle: currentUser.idea_title || '',
                problemStatement: currentUser.problem_statement || ''
            });
        }
    }, [currentUser]);

    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        if (!session?.user?.id) return;

        setIsSavingSettings(true);
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: session.user.id,
                full_name: profileForm.username,
                district: profileForm.district,
                idea_title: profileForm.ideaTitle,
                problem_statement: profileForm.problemStatement,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            appendTerminal('system', '[✓] Profile configurations synced to cloud.');
            alert('Settings saved successfully!');
        } catch (err) {
            console.error('Save failed:', err);
            appendTerminal('system', '[!] Failed to sync cloud configs.');
            alert('Save failed: ' + err.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            setSystemTime(`${String(hours).padStart(2, '0')}:${minutes} ${ampm}`);

            const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            setSystemDate(now.toLocaleDateString('en-US', options));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const { weather, isLoading: isWeatherLoading } = useWeather();

    // --- Gamification State ---
    const [userVibes, setUserVibes] = useState(0);

    const userRank = useMemo(() => {
        if (userVibes < 50) return 'L1 NOVICE';
        if (userVibes < 150) return 'L2 PROMPTER';
        return 'L3 VIBE CODER';
    }, [userVibes]);

    const addVibes = (amount, reason) => {
        setUserVibes(prev => prev + amount);
        appendTerminal('system', `[+] Earned ${amount} Vibes: ${reason}`);
    };

    const lessons = teachingTone === 'formal' ? LESSONS_FORMAL : LESSONS_IJAM;

    useEffect(() => {
        const fetchCommunityResources = async () => {
            const { data } = await supabase
                .from('resources')
                .select('*')
                .order('published_at', { ascending: false });
            setCommunityResources(data || []);
        };
        fetchCommunityResources();
    }, []);

    const filteredLessons = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return lessons;
        return lessons.filter((item) =>
            item.title.toLowerCase().includes(query) ||
            item.summary.toLowerCase().includes(query) ||
            item.stage.toLowerCase().includes(query)
        );
    }, [search, lessons]);
    const navigableLessons = filteredLessons.length ? filteredLessons : lessons;

    const groupedLessons = useMemo(() => {
        const groups = {};
        navigableLessons.forEach((lesson, originalIndex) => {
            const stage = lesson.stage || 'Uncategorized';
            if (!groups[stage]) {
                groups[stage] = [];
            }
            groups[stage].push({ ...lesson, originalIndex });
        });
        return groups;
    }, [navigableLessons]);

    useEffect(() => {
        if (activeIndex > navigableLessons.length - 1) {
            setActiveIndex(0);
        }
    }, [navigableLessons, activeIndex]);

    const activeLesson = navigableLessons[activeIndex] || lessons[0];
    const activeMedia = LESSON_MEDIA[activeLesson.id] || null;
    const activeLessonTips = LESSON_TIPS_BY_TONE[teachingTone]?.[activeLesson.id] || [];

    const openExternal = (url) => {
        if (!url) return;
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        window.open(normalized, '_blank', 'noopener,noreferrer');
        addVibes(10, "Resource Studied");
    };

    useEffect(() => {
        setAssistantMessages([
            {
                role: 'assistant',
                content: buildIjamBotLessonBrief({
                    lesson: activeLesson,
                    tips: activeLessonTips,
                    tone: teachingTone
                })
            }
        ]);
        setAssistantInput('');
        setSlideIndex(-1);
        setShowTips(false);
    }, [activeLesson.id, teachingTone, activeLessonTips]);

    const runAssistant = async (seedInput = '') => {
        const userMessage = (seedInput || assistantInput).trim();
        if (!userMessage) return;

        const userTurn = { role: 'user', content: userMessage };
        setAssistantMessages((prev) => [...prev, userTurn]);
        setAssistantLoading(true);
        trackResourceEvent('assistant_mode_used', { mode: assistantMode, lessonId: activeLesson.id });

        const prompt = buildResourceAiPrompt({
            mode: assistantMode,
            lesson: activeLesson,
            teachingTone,
            userInput: userMessage,
            tips: activeLessonTips
        });

        try {
            const history = assistantMessages.map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            }));
            const fullSystemPrompt = `${ZARULIJAM_SYSTEM_PROMPT}\n\nYou are helping inside ResourcePage. Stay grounded to the active lesson and provide practical actions.`;
            const response = await callNvidiaLLM(fullSystemPrompt, prompt, 'meta/llama-3.3-70b-instruct', [...history, userTurn]);
            setAssistantMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            const fallback = localIntelligence(userMessage, assistantMessages.map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            })));
            setAssistantMessages((prev) => [...prev, {
                role: 'assistant',
                content: `(fallback) ${fallback}`
            }]);
        } finally {
            setAssistantLoading(false);
            setAssistantInput('');
        }
    };

    const lessonLibraryItems = useMemo(() => (
        lessons.map((lesson) => ({
            id: `lesson-${lesson.id}`,
            title: lesson.title,
            description: lesson.summary,
            url: lesson.linkUrl,
            source: 'Lesson Plan'
        }))
    ), [lessons]);

    const dbLibraryItems = useMemo(() => (
        (communityResources || []).map((item) => ({
            id: `db-${item.id}`,
            title: item.title || 'Untitled Resource',
            description: item.description || 'No description provided.',
            url: item.url || '',
            source: 'Community'
        }))
    ), [communityResources]);

    const libraryItems = useMemo(() => [...lessonLibraryItems, ...dbLibraryItems], [lessonLibraryItems, dbLibraryItems]);

    useEffect(() => {
        if (!libraryItems.length) {
            setLibraryIndex(0);
            return;
        }
        if (libraryIndex > libraryItems.length - 1) {
            setLibraryIndex(0);
        }
    }, [libraryItems, libraryIndex]);

    const currentCommunity = libraryItems[libraryIndex] || null;
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalBusy, setTerminalBusy] = useState(false);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [isNarrowScreen, setIsNarrowScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < 980 : false);
    const terminalOutputRef = useRef(null);
    const [terminalLog, setTerminalLog] = useState([
        { role: 'system', text: 'IJAM_TERMINAL booted.' },
        { role: 'assistant', text: 'yo aku IJAM_BOT. kita buat step by step je, chill.\ntanya je apa-apa pasal lesson ni.' }
    ]);

    useEffect(() => {
        if (terminalOutputRef.current) {
            terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
        }
    }, [terminalLog, terminalBusy]);

    useEffect(() => {
        const onResize = () => setIsNarrowScreen(window.innerWidth < 980);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const appendTerminal = (role, text) => {
        setTerminalLog((prev) => [...prev, { role, text }]);
    };

    const runTerminalAi = async (mode, userInput) => {
        setTerminalBusy(true);
        if (userInput && userInput.length > 50) {
            addVibes(20, "Complex Prompting");
        }
        try {
            const prompt = buildResourceAiPrompt({
                mode,
                lesson: activeLesson,
                teachingTone,
                userInput,
                tips: activeLessonTips
            });
            const fullSystemPrompt = `${ZARULIJAM_SYSTEM_PROMPT}\n\nYou are running inside IJAM_TERMINAL. Keep output concise and actionable for this active lesson only.`;
            const response = await callNvidiaLLM(fullSystemPrompt, prompt, 'meta/llama-3.3-70b-instruct', []);
            const normalized = String(response || '')
                .slice(0, 2400)
                .split('\n')
                .slice(0, 40)
                .join('\n');
            appendTerminal('assistant', normalized);
        } catch (error) {
            const fallback = localIntelligence(userInput || `help with ${activeLesson.title}`, []);
            const normalizedFallback = String(fallback || '').slice(0, 1200);
            appendTerminal('assistant', `(fallback) ${normalizedFallback}`);
        } finally {
            setTerminalBusy(false);
        }
    };

    const handleBoot = async () => {
        setIsBooting(true);
        setBootText("");
        const seq = [
            "> INITIALIZING VIBE_OS v2.0...",
            "> LOADING CURRICULUM MODULES...",
            "> SYNCING WITH ANTIGRAVITY CO-PILOT...",
            "> CHECKING BUILDER CREDENTIALS...",
            "> WELCOME, BUILDER.",
            "> READY TO START YOUR JOURNEY?"
        ];

        for (const line of seq) {
            setBootText(prev => prev + line + "\n");
            await new Promise(r => setTimeout(r, 600));
        }
        setIsBooting(false);
    };

    const confirmBoot = () => {
        setIsBooted(true);
        setIsOnboarding(true);
        setOnboardingStep(1);
        if (typeof window !== 'undefined') {
            localStorage.setItem('vibe_os_booted', 'true');
        }
        setTerminalLog([
            { role: 'system', text: 'SYSTEM ONLINE. ONBOARDING SEQUENCE INITIATED.' },
            { role: 'assistant', text: 'yo WELCOME BRO! aku IJAM_BOT. sebelum kita start, aku nak check vibe kau sikit.' },
            { role: 'assistant', text: 'QUESTION 1: Kalau nak AI buat UI lawa, kau kena bagi "Master Prompt" yang detail atau suruh dia "buat web lawa" saje?' }
        ]);
    };

    const executeTerminalCommand = async (rawCommand) => {
        const raw = rawCommand.trim();
        if (!raw) return;

        appendTerminal('user', raw);

        if (activeLesson.id === 'vercel-deploy' && raw.includes('vercel.app')) {
            addVibes(100, "Live Deployment Verified - ASCII TROPHY UNLOCKED!");
            appendTerminal('assistant', `
    ___________
   '._==_==_=_.'
   .-\\:      /-.
  | (|:.     |) |
   '-|:.     |-'
     \\::.    /
      '::. .'
        ) (
      _.' '._
     \`"""""""\`
YOU DID IT. APP DEPLOYED!`);
            return;
        }

        if (isOnboarding) {
            handleOnboarding(raw);
            return;
        }

        await runTerminalAi('chat', raw);
    };

    const handleOnboarding = (input) => {
        const text = input.toLowerCase();

        if (onboardingStep === 1) {
            if (text.includes('master') || text.includes('detail')) {
                appendTerminal('assistant', 'Steady! Context is king. Next question...');
                appendTerminal('assistant', 'QUESTION 2: Code kau kat local dah siap. Nak simpan kat GitHub kena guna command "git push" atau "git pull"?');
                setOnboardingStep(2);
                addVibes(20, 'Onboarding Progress ✨');
            } else {
                appendTerminal('assistant', 'Hmm, tak tepat tu. Kena bagi detail (Master Prompt) baru AI faham. Try again?');
            }
        } else if (onboardingStep === 2) {
            if (text.includes('push')) {
                appendTerminal('assistant', 'Betul! Push untuk hantar, Pull untuk ambil. Last one...');
                appendTerminal('assistant', 'QUESTION 3: Lepas push ke GitHub, tool apa kita guna untuk bagi website tu LIVE kat internet?\n(A) Vercel\n(B) Supabase\n(C) Antigravity');
                setOnboardingStep(3);
                addVibes(20, 'Onboarding Progress ✨');
            } else {
                appendTerminal('assistant', 'Eh silap tu. "git pull" tu untuk tarik code orang lain. Kita nak hantar (push) code kita.');
            }
        } else if (onboardingStep === 3) {
            if (text.includes('vercel') || text.includes('a')) {
                appendTerminal('assistant', 'MANTAP! Kau dah ready jadi Vibe Coder.');
                appendTerminal('assistant', 'VIBE_OS UNLOCKED. Semua lesson dah terbuka untuk kau.');
                setIsOnboarding(false);
                setOnboardingStep(0);
                addVibes(50, 'Onboarding Completed 🏆');

                // Show first lesson brief
                const firstLesson = lessons[0];
                appendTerminal('system', `Opened lesson: ${firstLesson.id}`);
                appendTerminal('assistant', buildIjamBotLessonBrief({
                    lesson: firstLesson,
                    tips: LESSON_TIPS_BY_TONE[teachingTone]?.[firstLesson.id] || [],
                    tone: teachingTone
                }));
            } else {
                appendTerminal('assistant', 'Hampir tepat! Supabase tu database. Antigravity tu editor. Kita nak host kat Vercel.');
            }
        }
    };

    if (!isBooted) {
        return (
            <section id="resources-page" style={{ ...sectionStyle, background: '#090c13', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', fontFamily: 'monospace' }}>
                <div style={{ padding: '40px', background: '#0b1220', border: '4px solid #f5d000', boxShadow: '12px 12px 0 #f5d000', maxWidth: '600px', width: '90%', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '20px', background: '#f5d000', color: '#0b1220', padding: '4px 12px', fontWeight: 900, fontSize: '14px' }}>IjamOS v2.0</div>
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '30px', fontSize: '16px', lineHeight: 1.6, minHeight: '240px', color: '#86efac' }}>
                        {bootText || "> SYSTEM STATUS: IDLE\n> AWAITING USER COMMAND..."}
                    </div>
                    {!isBooting && bootText === "" && (
                        <button
                            onClick={handleBoot}
                            style={{ background: '#c8102e', border: '3px solid #000', color: '#fff', padding: '12px 24px', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '4px 4px 0 #000' }}
                        >
                            INITIATE SYSTEM BOOT
                        </button>
                    )}
                    {!isBooting && bootText.includes('READY TO START') && (
                        <button
                            onClick={confirmBoot}
                            style={{ background: '#22c55e', border: '3px solid #000', color: '#000', padding: '12px 24px', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '4px 4px 0 #000' }}
                        >
                            YES, START MY JOURNEY
                        </button>
                    )}
                    {isBooting && (
                        <div style={{ color: '#f5d000', fontWeight: 900, fontSize: '14px' }}>
                            [ LOADING IjamOS... ]
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section id="resources-page" style={{ ...sectionStyle, background: '#0b131e', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Desktop Wallpaper - Grid Pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#f5d000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

            {/* Desktop Icons Container */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', height: '100%', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 100px)', gap: '24px', alignItems: 'start', contentVisibility: 'auto' }}>
                <DesktopIcon label="TERMINAL" icon={Terminal} onClick={() => setActiveWindow('terminal')} />
                <DesktopIcon label="FILES" icon={Folder} onClick={() => setActiveWindow('files')} />
                <DesktopIcon label="STATS" icon={User} onClick={() => setActiveWindow('progress')} color="#86efac" />
                <DesktopIcon label="RECYCLE" icon={Trash2} onClick={() => setActiveWindow('trash')} color="#c8102e" />
                <DesktopIcon label="SETTINGS" icon={Settings} onClick={() => setActiveWindow('settings')} color="#94a3b8" />
                <DesktopIcon label="ARCADE" icon={Gamepad2} onClick={() => setActiveWindow('arcade')} color="#f5d000" />
            </div>

            {/* Application Windows */}

            {/* 1. Terminal Window */}
            {activeWindow === 'terminal' && (
                <WindowFrame title="IJAM_TERMINAL // IjamOS" icon={Bot} onClose={() => setActiveWindow(null)}>
                    <div style={{ display: 'grid', gridTemplateColumns: isNarrowScreen ? '1fr' : (sidebarVisible ? 'minmax(220px, 320px) 1fr' : '0 1fr'), gridTemplateRows: isNarrowScreen ? 'auto minmax(0,1fr)' : 'minmax(0,1fr)', flex: 1, minHeight: 0 }}>
                        <aside style={{ borderRight: (isNarrowScreen || !sidebarVisible) ? 'none' : '3px solid #0b1220', borderBottom: isNarrowScreen ? '3px solid #0b1220' : 'none', padding: sidebarVisible || isNarrowScreen ? '10px' : '0', background: '#0b1220', minHeight: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '11px', color: '#93c5fd' }}>LESSON TREE</div>
                                {!isNarrowScreen && (
                                    <button
                                        onClick={() => setSidebarVisible(false)}
                                        style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}
                                    >
                                        [COLLAPSE]
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: isNarrowScreen ? '24vh' : '56vh', overflowY: 'auto', paddingRight: '4px' }}>
                                {Object.entries(groupedLessons).map(([stageName, stageLessons]) => (
                                    <div key={stageName}>
                                        <div style={{ color: '#f5d000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid #334155', paddingBottom: '2px', letterSpacing: '0.05em' }}>
                                            {stageName}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {stageLessons.map((lesson, localIdx) => {
                                                const isActive = lesson.id === activeLesson.id;
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveIndex(lesson.originalIndex);
                                                            setSlideIndex(-1);
                                                            setTerminalLog([
                                                                { role: 'system', text: 'Terminal cleared for new lesson.' },
                                                                { role: 'system', text: `Opened lesson: ${lesson.id}` },
                                                                {
                                                                    role: 'assistant', text: buildIjamBotLessonBrief({
                                                                        lesson,
                                                                        tips: LESSON_TIPS_BY_TONE[teachingTone]?.[lesson.id] || [],
                                                                        tone: teachingTone
                                                                    })
                                                                }
                                                            ]);
                                                        }}
                                                        style={{
                                                            textAlign: 'left',
                                                            background: isActive ? '#c8102e' : 'transparent',
                                                            border: isActive ? '1px solid #ef4444' : '1px solid transparent',
                                                            color: isActive ? '#f8fafc' : '#94a3b8',
                                                            borderRadius: '6px',
                                                            padding: '4px 6px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '11px',
                                                            fontWeight: isActive ? 800 : 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isActive) {
                                                                e.target.style.background = '#1e293b';
                                                                e.target.style.color = '#e2e8f0';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isActive) {
                                                                e.target.style.background = 'transparent';
                                                                e.target.style.color = '#94a3b8';
                                                            }
                                                        }}
                                                    >
                                                        {lesson.title}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '11px', color: '#fcd34d' }}>
                                completed: {completedLessons.length}/{lessons.length}
                            </div>
                            <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af' }}>
                                disclaimer: lessons are co-written with AI
                            </div>
                        </aside>
                        <main style={{ padding: '10px', display: 'grid', gridTemplateRows: 'auto minmax(0,1fr) auto', gap: '8px', minHeight: 0 }}>

                            <div style={{ position: 'relative', border: '2px solid #334155', borderRadius: '8px', padding: '8px', fontFamily: 'monospace', fontSize: '12px', background: '#0b1220', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                {!sidebarVisible && !isNarrowScreen && (
                                    <button
                                        onClick={() => setSidebarVisible(true)}
                                        style={{ background: '#0b1220', color: '#f5d000', border: '1px solid #f5d000', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        SHOW TREE
                                    </button>
                                )}
                                <div>
                                    <div style={{ color: '#f5d000', fontWeight: 900 }}>ACTIVE LESSON: {activeLesson.id}</div>
                                    <div style={{ color: '#bfdbfe' }}>{activeLesson.title}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowTips(!showTips)}
                                            style={{
                                                background: showTips ? '#f5d000' : '#1e293b',
                                                border: `3px solid #0b1220`,
                                                borderRadius: '8px',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                color: showTips ? '#0b1220' : '#000',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '4px 4px 0 #0b1220'
                                            }}
                                            title="IJAM_BOT Tips"
                                        >
                                            <Bot size={20} strokeWidth={2.5} />
                                        </button>

                                        {showTips && activeLessonTips && activeLessonTips.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '120%',
                                                right: 0,
                                                background: '#f8fafc',
                                                border: '3px solid #0b1220',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                width: '280px',
                                                zIndex: 50,
                                                boxShadow: '8px 8px 0 #0b1220',
                                                color: '#0f172a'
                                            }}>
                                                {/* Speech Bubble Arrow pointing Top-Right towards the Bot */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-12px',
                                                    right: '16px',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '12px solid transparent',
                                                    borderRight: '12px solid transparent',
                                                    borderBottom: '12px solid #0b1220'
                                                }}></div>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '16px',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '12px solid transparent',
                                                    borderRight: '12px solid transparent',
                                                    borderBottom: '12px solid #f8fafc'
                                                }}></div>

                                                <div style={{ color: '#c8102e', fontWeight: 900, fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <Lightbulb size={16} strokeWidth={3} /> {teachingTone === 'ijam' ? 'IJAM CAKAP:' : 'LESSON INSIGHTS:'}
                                                </div>
                                                <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '12px', lineHeight: 1.6, fontWeight: 600 }}>
                                                    {activeLessonTips.map((tip, i) => (
                                                        <li key={i} style={{ marginBottom: i < activeLessonTips.length - 1 ? '10px' : '0' }}>{tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ border: '2px solid #334155', borderRadius: '8px', background: '#0b1220', display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', maxHeight: isNarrowScreen ? '60vh' : 'none', overflow: 'hidden' }}>
                                <div ref={terminalOutputRef} style={{ padding: '8px', overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }}>
                                    {activeMedia?.visual && (
                                        <div style={{ marginBottom: '16px', border: '2px solid #334155', borderRadius: '8px', overflow: 'hidden', background: '#111827' }}>
                                            <img
                                                src={activeMedia.visual}
                                                alt={activeLesson.title}
                                                style={{ width: '100%', height: 'auto', display: 'block' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                    {terminalLog.map((entry, idx) => (
                                        <div key={`${entry.role}-${idx}`} style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                                            {entry.role !== 'system' && (
                                                <span style={{ color: entry.role === 'assistant' ? '#f5d000' : '#86efac', fontWeight: 900 }}>
                                                    {entry.role === 'assistant' ? 'IJAM_BOT>' : `[${userRank} | ${userVibes}] YOU>`}
                                                </span>
                                            )}
                                            {entry.role !== 'system' && ' '}
                                            <span style={{ color: entry.role === 'system' ? '#93c5fd' : '#e5e7eb', fontStyle: entry.role === 'system' ? 'italic' : 'normal' }}>
                                                {entry.text}
                                            </span>
                                        </div>
                                    ))}
                                    {terminalBusy && (
                                        <div><span style={{ color: '#f5d000', fontWeight: 900 }}>IJAM_BOT&gt;</span> processing...</div>
                                    )}
                                    {!terminalBusy && terminalLog.length > 0 && (
                                        <div style={{ marginTop: '12px', cursor: 'pointer', color: '#f5d000', textDecoration: 'underline', fontWeight: 'bold' }}
                                            onClick={() => {
                                                if (slideIndex < activeLesson.steps.length) {
                                                    const next = slideIndex + 1;
                                                    setSlideIndex(next);
                                                    if (next === activeLesson.steps.length) {
                                                        appendTerminal('assistant', teachingTone === 'ijam' ? '[LESSON COMPLETE]\npadu gila! klik "> proceed to next lesson" untuk sambung.' : '[LESSON COMPLETE]\nGreat job! Click "> proceed to next lesson" to continue.');
                                                    } else {
                                                        appendTerminal('assistant', `[STEP ${next + 1} OF ${activeLesson.steps.length}]\n${activeLesson.steps[next]}`);
                                                    }
                                                } else {
                                                    const nextLessonIdx = (activeIndex + 1) % navigableLessons.length;
                                                    const nextLesson = navigableLessons[nextLessonIdx];
                                                    setActiveIndex(nextLessonIdx);
                                                    setSlideIndex(-1);
                                                    setTerminalLog([
                                                        { role: 'system', text: 'Terminal cleared for new lesson.' },
                                                        { role: 'system', text: `Opened lesson: ${nextLesson.id}` },
                                                        {
                                                            role: 'assistant', text: buildIjamBotLessonBrief({
                                                                lesson: nextLesson,
                                                                tips: LESSON_TIPS_BY_TONE[teachingTone]?.[nextLesson.id] || [],
                                                                tone: teachingTone
                                                            })
                                                        }
                                                    ]);
                                                }
                                            }}>
                                            &gt; {slideIndex >= activeLesson.steps.length ? 'proceed to next lesson' : 'show next step'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ border: '2px solid #334155', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const command = terminalInput;
                                        setTerminalInput('');
                                        await executeTerminalCommand(command);
                                    }}
                                    style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px' }}
                                >
                                    <input
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        placeholder='minta tolong sini...'
                                        style={{ border: '2px solid #f5d000', borderRadius: '8px', background: '#111827', color: '#f8fafc', padding: '10px', fontFamily: 'monospace', fontWeight: 800, minWidth: 0, width: '100%' }}
                                    />
                                    <button type="submit" className="btn btn-red" disabled={terminalBusy} style={{ fontFamily: 'monospace' }}>
                                        RUN
                                    </button>
                                </form>
                            </div>
                        </main>
                    </div>
                </WindowFrame>
            )}

            {/* 2. Resource Explorer Window */}
            {activeWindow === 'files' && (
                <WindowFrame title="FILE_EXPLORER // IjamOS" icon={Folder} onClose={() => setActiveWindow(null)}>
                    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {libraryItems.map((item, idx) => (
                                <div key={item.id} style={{ background: '#0b1220', border: '3px solid #f5d000', borderRadius: '12px', padding: '16px', boxShadow: '6px 6px 0 #0b1220', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ color: '#f5d000', fontWeight: 900, fontFamily: 'monospace', fontSize: '14px' }}>{item.title}</div>
                                        <div style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px', color: '#bfdbfe', fontSize: '10px', fontWeight: 800 }}>{item.source}</div>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '12px', flex: 1 }}>{item.description}</div>
                                    <button
                                        onClick={() => openExternal(item.url)}
                                        style={{ background: '#f5d000', border: '2px solid #0b1220', color: '#0b1220', padding: '8px', fontWeight: 900, fontFamily: 'monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        OPEN_EXTERNAL <ExternalLink size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </WindowFrame>
            )}

            {/* 3. Settings/Stats Window */}
            {activeWindow === 'progress' && (
                <WindowFrame title="BUILDER_STATS // PROGRESS" icon={User} onClose={() => setActiveWindow(null)}>
                    <div style={{ padding: '24px', color: '#fff', overflowY: 'auto', height: '100%' }}>
                        {/* Builder Identity Card */}
                        <div style={{ background: 'linear-gradient(45deg, #0b1220 0%, #1e293b 100%)', border: '3px solid #f5d000', borderRadius: '16px', padding: '24px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '8px 8px 0 #0b1220' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#f5d000', border: '4px solid #0b1220', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: '#0b1220', flexShrink: 0 }}>
                                {(currentUser?.name || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#f5d000', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '4px' }}>VERIFIED_BUILDER</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{currentUser?.name || 'Anonymous Builder'}</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 800 }}>DARI {currentUser?.district || 'Selangor'} // {userRank}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isNarrowScreen ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            {/* Rank Card */}
                            <div style={{ background: '#0b1220', padding: '24px', border: '3px solid #f5d000', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.1em' }}>RANK</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#f5d000' }}>{userRank}</div>
                                <div style={{ fontSize: '14px', color: '#86efac', marginTop: '4px', fontWeight: 800 }}>{userVibes} VIBES</div>
                            </div>
                            {/* Completion Card */}
                            <div style={{ background: '#0b1220', padding: '24px', border: '3px solid #334155', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.1em' }}>COMPLETION</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                                    {Math.round((completedLessons.length / lessons.length) * 100)}%
                                </div>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                                    {completedLessons.length} / {lessons.length} Modules
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 900, fontFamily: 'monospace' }}>
                                <span>SYSTEM_READY_INDEX</span>
                                <span>{Math.round((completedLessons.length / lessons.length) * 100)}%</span>
                            </div>
                            <div style={{ height: '12px', background: '#0b1220', border: '2px solid #334155', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(completedLessons.length / lessons.length) * 100}%`,
                                    background: '#f5d000',
                                    boxShadow: '0 0 12px rgba(245, 208, 0, 0.4)',
                                    transition: 'width 1s ease-out'
                                }} />
                            </div>
                        </div>

                        {/* Stage Checklist */}
                        <div style={{ background: '#0b1220', padding: '20px', borderRadius: '12px', border: '2px solid #1e293b' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: '#f5d000', marginBottom: '16px', fontFamily: 'monospace' }}>ROADMAP_CHECKLIST</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.keys(groupedLessons).map(stage => {
                                    const stageLessons = groupedLessons[stage];
                                    const completedInStage = stageLessons.filter(l => completedLessons.includes(l.id)).length;
                                    const isStageDone = completedInStage === stageLessons.length;

                                    return (
                                        <div key={stage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: isStageDone ? 'rgba(134, 239, 172, 0.05)' : 'rgba(255,255,255,0.02)', border: isStageDone ? '1px solid #86efac' : '1px solid #1e293b', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '18px', height: '18px', border: '2px solid', borderColor: isStageDone ? '#86efac' : '#334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac' }}>
                                                    {isStageDone && "✓"}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: isStageDone ? '#86efac' : '#fff' }}>{stage.toUpperCase()}</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 900 }}>{completedInStage}/{stageLessons.length}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </WindowFrame>
            )}

            {activeWindow === 'settings' && (
                <WindowFrame title="SYSTEM_SETTINGS // CONFIG" icon={Settings} onClose={() => setActiveWindow(null)}>
                    <div style={{ padding: '24px', color: '#fff', overflowY: 'auto', height: '100%' }}>
                        <form onSubmit={handleSaveSettings} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Profile Visual Preview */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#334155', border: '2px solid #f5d000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#f5d000' }}>
                                    {(profileForm.username || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14px', color: '#f5d000', margin: 0, fontWeight: 900, fontFamily: 'monospace' }}>[ USER_PROFILE ]</h3>
                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Configure your identity across IjamOS</p>
                                </div>
                            </div>

                            <div>

                                <h3 style={{ fontSize: '14px', color: '#f5d000', marginBottom: '16px', fontWeight: 900, fontFamily: 'monospace' }}>[ USER_PROFILE ]</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 900 }}>FULL_NAME</label>
                                        <input
                                            value={profileForm.username}
                                            onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                                            style={{ width: '100%', background: '#0b1220', border: '2px solid #334155', padding: '12px', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 900 }}>DISTRICT</label>
                                        <input
                                            value={profileForm.district}
                                            onChange={e => setProfileForm(p => ({ ...p, district: e.target.value }))}
                                            style={{ width: '100%', background: '#0b1220', border: '2px solid #334155', padding: '12px', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Project Section */}
                            <div>
                                <h3 style={{ fontSize: '14px', color: '#f5d000', marginBottom: '16px', fontWeight: 900, fontFamily: 'monospace' }}>[ PROJECT_CORE ]</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 900 }}>IDEA_TITLE</label>
                                        <input
                                            value={profileForm.ideaTitle}
                                            onChange={e => setProfileForm(p => ({ ...p, ideaTitle: e.target.value }))}
                                            style={{ width: '100%', background: '#0b1220', border: '2px solid #334155', padding: '12px', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 900 }}>PROBLEM_STATEMENT</label>
                                        <textarea
                                            value={profileForm.problemStatement}
                                            onChange={e => setProfileForm(p => ({ ...p, problemStatement: e.target.value }))}
                                            rows={3}
                                            style={{ width: '100%', background: '#0b1220', border: '2px solid #334155', padding: '12px', color: '#fff', borderRadius: '8px', fontFamily: 'monospace', resize: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingSettings}
                                style={{
                                    background: '#f5d000',
                                    color: '#0b1220',
                                    padding: '16px',
                                    fontWeight: 950,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    marginTop: '10px',
                                    boxShadow: '4px 4px 0 #0b1220',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {isSavingSettings ? 'SYNCING...' : 'SAVE CONFIGURATION'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Clear local OS session?')) {
                                        localStorage.removeItem('vibe_os_booted');
                                        window.location.reload();
                                    }
                                }}
                                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                                [ X ] FACTORY_RESET_OS
                            </button>
                        </form>
                    </div>
                </WindowFrame>
            )}

            {/* 6. Arcade Window */}
            {activeWindow === 'arcade' && (
                <WindowFrame title="BUILDER_ARCADE // STUDIO" icon={Gamepad2} onClose={() => setActiveWindow(null)}>
                    <div style={{ flex: 1, minHeight: 0, background: '#f3f4f6', overflowY: 'auto' }}>
                        <BuilderStudioPage session={session} />
                    </div>
                </WindowFrame>
            )}

            {/* 4. Recycle Bin Window */}
            {activeWindow === 'trash' && (
                <WindowFrame title="RECYCLE_BIN // DELETED CONTENT" icon={Trash2} onClose={() => setActiveWindow(null)}>
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                        <Trash2 size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '14px' }}>BOX IS CURRENTLY EMPTY</div>
                        <div style={{ fontSize: '11px', marginTop: '10px' }}>[ No deleted vibes or failed projects found ]</div>
                    </div>
                </WindowFrame>
            )}

            {/* Start Menu Overlay */}
            {isStartMenuOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '48px',
                        left: '0',
                        width: '380px',
                        maxWidth: '100%',
                        height: '520px',
                        maxHeight: 'calc(100vh - 48px)',
                        background: '#0b1220',
                        border: '3px solid #000',
                        borderBottom: 'none',
                        boxShadow: '6px 6px 0 rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        fontFamily: 'monospace',
                        color: '#fff',
                        borderTopRightRadius: '12px'
                    }}
                >
                    {/* Search Bar */}
                    <div style={{ padding: '20px', borderBottom: '2px solid #1e293b' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search apps, files, or web..."
                                value={startMenuSearch}
                                onChange={(e) => setStartMenuSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#fff',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px'
                                }}
                            />
                            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                        </div>
                    </div>

                    {/* Pinned Apps */}
                    <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', fontWeight: 900 }}>PINNED</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            <StartMenuApp icon={Terminal} label="Terminal" onClick={() => { setActiveWindow('terminal'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={Folder} label="Files" onClick={() => { setActiveWindow('files'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={User} label="Stats" onClick={() => { setActiveWindow('stats'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={Gamepad2} label="Arcade" onClick={() => { setActiveWindow('arcade'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={Settings} label="Config" onClick={() => { setActiveWindow('settings'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={Trash2} label="Recycle" onClick={() => { setActiveWindow('trash'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={BookOpen} label="Docs" onClick={() => { window.open('https://antigravity.id', '_blank'); setIsStartMenuOpen(false); }} />
                            <StartMenuApp icon={Github} label="GitHub" onClick={() => { window.open('https://github.com', '_blank'); setIsStartMenuOpen(false); }} />
                        </div>
                    </div>

                    {/* Bottom Footer (Weather/Date + Power) */}
                    <div style={{ padding: '16px 20px', background: '#080d18', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                aria-label="Power Options"
                                onClick={() => {
                                    if (window.confirm('Power off IjamOS session?')) {
                                        localStorage.removeItem('vibe_os_booted');
                                        window.location.reload();
                                    }
                                }}
                                style={{
                                    background: '#ef4444',
                                    border: 'none',
                                    color: '#fff',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Power size={16} />
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 900, fontSize: '13px' }}>{currentUser?.name || 'Administrator'}</div>
                                <div style={{ color: '#94a3b8', fontSize: '10px' }}>Local Session</div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Taskbar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px', background: '#f5d000', borderTop: '3px solid #0b1220', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
                        style={{
                            background: isStartMenuOpen ? '#1e293b' : '#0b1220',
                            color: isStartMenuOpen ? '#fff' : '#f5d000',
                            border: 'none',
                            padding: '6px 16px',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Power size={14} /> START
                    </button>
                    {activeWindow && (
                        <div style={{ background: '#0b1220', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', fontWeight: 900, border: '1px solid #334155', fontFamily: 'monospace' }}>
                            {activeWindow.toUpperCase()}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0px', marginRight: '4px' }}>
                        <div style={{ fontSize: '10px', color: '#000', fontWeight: 600 }}>{systemDate}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, color: '#c8102e' }}>
                            {isWeatherLoading ? (
                                <span>Syncing...</span>
                            ) : weather ? (
                                <>
                                    <span>{weather.temperature}°C</span>
                                    <span style={{ fontSize: '10px', color: '#0b1220' }}>({weather.description})</span>
                                </>
                            ) : (
                                <span>Selangor</span>
                            )}
                        </div>
                    </div>

                    <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 900, color: '#0b1220' }}>
                        {systemTime}
                    </div>
                </div>
            </div>
        </section>
    );

};

export default ResourcePage;
