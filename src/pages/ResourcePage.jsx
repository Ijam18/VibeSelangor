import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
    CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callNvidiaLLM, localIntelligence, ZARULIJAM_SYSTEM_PROMPT } from '../lib/nvidia';

const LESSONS_IJAM = [
    {
        id: 'install-node-antigravity',
        icon: Sparkles,
        title: 'Install Node.js + Antigravity (First Setup)',
        stage: 'Foundation',
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
        id: 'skill-md-basics',
        icon: BookOpen,
        title: 'Step 1: Faham `.md` & Skill Creator Dulu',
        stage: 'Foundation',
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
        stage: 'Design',
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
        stage: 'Build',
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
        stage: 'Design',
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
        stage: 'Design',
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
        stage: 'Design',
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
        stage: 'Build',
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
        stage: 'Creative',
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
        stage: 'Build',
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
        stage: 'Build',
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
        stage: 'Build',
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
        stage: 'UX',
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
        stage: 'Content',
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
        stage: 'Polish',
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
        stage: 'Foundation',
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
        stage: 'Toolkit',
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
        stage: 'Growth',
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
        stage: 'Growth',
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
        stage: 'Growth',
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
        stage: 'Polish',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Security',
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
        stage: 'Versioning',
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
        stage: 'Workflow',
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
        stage: 'Launch',
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
        stage: 'Launch',
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
        stage: 'Toolkit',
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
        stage: 'Creative',
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
        stage: 'Creative',
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
        id: 'install-node-antigravity',
        icon: Sparkles,
        title: 'Install Node.js and Antigravity (Initial Setup)',
        stage: 'Foundation',
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
        id: 'skill-md-basics',
        icon: BookOpen,
        title: 'Step 1: Understand `.md` Files and Skill Creator',
        stage: 'Foundation',
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
        stage: 'Design',
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
        stage: 'Build',
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
        stage: 'Design',
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
        stage: 'Design',
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
        stage: 'Design',
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
        stage: 'Build',
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
        stage: 'Creative',
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
        stage: 'Build',
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
        stage: 'Build',
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
        stage: 'Build',
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
        stage: 'UX',
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
        stage: 'Content',
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
        stage: 'Polish',
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
        stage: 'Foundation',
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
        stage: 'Toolkit',
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
        stage: 'Growth',
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
        stage: 'Growth',
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
        stage: 'Growth',
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
        stage: 'Polish',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Data',
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
        stage: 'Security',
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
        stage: 'Versioning',
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
        stage: 'Workflow',
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
        stage: 'Launch',
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
        stage: 'Launch',
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
        stage: 'Toolkit',
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
        stage: 'Creative',
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
        stage: 'Creative',
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
        'install-node-antigravity': ['Guna Node LTS, elak version experimental.', 'Lepas install, restart terminal sebelum check `node -v`.', 'Kalau ada error, screenshot terus untuk debug cepat.'],
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
        'install-node-antigravity': ['Use Node.js LTS for stability.', 'Restart terminal after installation.', 'Capture exact error logs for faster debugging.'],
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

const buildIjamBotLessonBrief = ({ lesson, tips, tone }) => {
    const intro = tone === 'ijam'
        ? `yo builder (b ᵔ▽ᵔ)b jom focus lesson ni: ${lesson.title}`
        : `Lesson focus: ${lesson.title}`;
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
        tone === 'ijam' ? 'tiny steps:' : 'Next steps:',
        steps,
        '',
        tone === 'ijam' ? 'tips execute cepat:' : 'Execution tips:',
        tipsBlock || '- Keep one focused step at a time.',
        tone === 'ijam' ? '\nkalau stuck, terus type: debug <isu kau> (¬‿¬)' : ''
    ].join('\n');
};

const ResourcePage = () => {
    const PLAN_START_COMMAND = 'ijam --start-plan';
    const [activeIndex, setActiveIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [communityResources, setCommunityResources] = useState([]);
    const [libraryIndex, setLibraryIndex] = useState(0);
    const [teachingTone, setTeachingTone] = useState('ijam');
    const [assistantMode, setAssistantMode] = useState('explain');
    const [assistantInput, setAssistantInput] = useState('');
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(true);
    const [planStarted, setPlanStarted] = useState(false);
    const [planCommandInput, setPlanCommandInput] = useState('');
    const [planCommandError, setPlanCommandError] = useState('');
    const [assistantMessages, setAssistantMessages] = useState([
        { role: 'assistant', content: 'IJAM_BOT ready. Pick a mode and ask about this lesson.' }
    ]);

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

    const handleStartPlan = () => {
        if (planCommandInput.trim().toLowerCase() === PLAN_START_COMMAND) {
            setPlanStarted(true);
            setPlanCommandError('');
            trackResourceEvent('plan_started', { lessonId: activeLesson.id });
            return;
        }
        setPlanCommandError(`Invalid command. Use: ${PLAN_START_COMMAND}`);
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
        { role: 'assistant', text: 'yo aku IJAM_BOT. kita buat step by step je, chill.' },
        { role: 'system', text: `Run "${PLAN_START_COMMAND}" to unlock lesson plan.` }
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

    const getHelpText = () => [
        'commands:',
        'help',
        'ijam --start-plan',
        'ls lessons',
        'open <lesson-id | number>',
        'teach',
        'tips',
        'links',
        'next',
        'complete',
        'progress',
        'debug <issue>',
        'plan <goal>',
        'clear'
    ].join('\n');

    const runTerminalAi = async (mode, userInput) => {
        setTerminalBusy(true);
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

    const executeTerminalCommand = async (rawCommand) => {
        const raw = rawCommand.trim();
        if (!raw) return;

        appendTerminal('user', raw);
        const lower = raw.toLowerCase();
        const [cmd, ...args] = lower.split(' ');

        if (lower === 'clear') {
            setTerminalLog([{ role: 'system', text: 'Terminal cleared.' }]);
            return;
        }

        if (!planStarted && lower !== PLAN_START_COMMAND && lower !== 'help') {
            appendTerminal('system', `Locked. Run "${PLAN_START_COMMAND}" first.`);
            return;
        }

        if (lower === 'help') {
            appendTerminal('system', getHelpText());
            return;
        }

        if (lower === PLAN_START_COMMAND) {
            setPlanStarted(true);
            setPlanCommandError('');
            appendTerminal('system', 'Plan unlocked. Use "ls lessons" to begin.');
            return;
        }

        if (lower === 'ls lessons') {
            appendTerminal(
                'system',
                lessons.map((lesson, idx) => `${idx + 1}. ${lesson.id} | ${lesson.stage} | ${lesson.title}`).join('\n')
            );
            return;
        }

        if (cmd === 'open') {
            const target = args.join(' ').trim();
            let targetIndex = -1;
            const asNumber = Number(target);
            if (!Number.isNaN(asNumber) && asNumber > 0 && asNumber <= lessons.length) {
                targetIndex = asNumber - 1;
            } else {
                targetIndex = lessons.findIndex((lesson) => lesson.id.toLowerCase() === target);
            }
            if (targetIndex < 0) {
                appendTerminal('system', `Lesson not found: ${target || '(empty)'}`);
                return;
            }
            setActiveIndex(targetIndex);
            appendTerminal('assistant', buildIjamBotLessonBrief({
                lesson: lessons[targetIndex],
                tips: LESSON_TIPS_BY_TONE[teachingTone]?.[lessons[targetIndex].id] || [],
                tone: teachingTone
            }));
            return;
        }

        if (lower === 'teach') {
            appendTerminal('assistant', buildIjamBotLessonBrief({
                lesson: activeLesson,
                tips: activeLessonTips,
                tone: teachingTone
            }));
            return;
        }

        if (lower === 'tips') {
            appendTerminal('assistant', (activeLessonTips || []).map((tip) => `- ${tip}`).join('\n') || 'No tips mapped.');
            return;
        }

        if (lower === 'links') {
            appendTerminal('system', [
                `Lesson: ${activeLesson.linkUrl}`,
                `YouTube: ${activeMedia?.youtubeUrl || 'N/A'}`,
                `Community: ${currentCommunity?.url || 'N/A'}`
            ].join('\n'));
            return;
        }

        if (lower === 'next') {
            setActiveIndex((prev) => (prev + 1) % navigableLessons.length);
            appendTerminal('system', 'Moved to next lesson.');
            const nextLesson = navigableLessons[(activeIndex + 1) % navigableLessons.length];
            appendTerminal('assistant', buildIjamBotLessonBrief({
                lesson: nextLesson,
                tips: LESSON_TIPS_BY_TONE[teachingTone]?.[nextLesson.id] || [],
                tone: teachingTone
            }));
            return;
        }

        if (lower === 'complete') {
            setCompletedLessons((prev) => (prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id]));
            appendTerminal('system', `Marked complete: ${activeLesson.id}`);
            return;
        }

        if (lower === 'progress') {
            appendTerminal('system', `Progress: ${completedLessons.length}/${lessons.length} completed.`);
            return;
        }

        if (cmd === 'debug') {
            const issue = raw.slice(raw.indexOf(' ') + 1).trim() || `Need debug help for ${activeLesson.title}`;
            await runTerminalAi('troubleshoot', issue);
            return;
        }

        if (cmd === 'plan') {
            const goal = raw.slice(raw.indexOf(' ') + 1).trim() || `Implementation plan for ${activeLesson.title}`;
            await runTerminalAi('plan', goal);
            return;
        }

        appendTerminal('system', `Unknown command: ${raw}. Run "help".`);
    };

    return (
        <section id="resources-page" style={{ ...sectionStyle, background: '#090c13', height: '100vh', overflow: 'hidden', paddingTop: '12px', paddingBottom: '12px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 10px', height: '100%' }}>
                <div style={{ border: '3px solid #0b1220', borderRadius: '12px', boxShadow: '8px 8px 0 #0b1220', background: '#111827', color: '#e5e7eb', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '3px solid #0b1220', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#f5d000', color: '#0b1220' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900 }}>IJAM_TERMINAL // Resource OS</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 800 }}>
                            {planStarted ? 'STATUS: UNLOCKED' : 'STATUS: LOCKED'}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isNarrowScreen ? '1fr' : 'minmax(220px, 320px) 1fr', flex: 1, minHeight: 0 }}>
                        <aside style={{ borderRight: isNarrowScreen ? 'none' : '3px solid #0b1220', borderBottom: isNarrowScreen ? '3px solid #0b1220' : 'none', padding: '10px', background: '#0b1220', minHeight: 0 }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '11px', marginBottom: '8px', color: '#93c5fd' }}>LESSON TREE</div>
                            <div style={{ display: 'grid', gap: '6px', maxHeight: isNarrowScreen ? '24vh' : '56vh', overflowY: 'auto' }}>
                                {lessons.map((lesson, idx) => (
                                    <button
                                        key={lesson.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveIndex(idx);
                                            appendTerminal('system', `Opened lesson: ${lesson.id}`);
                                            appendTerminal('assistant', buildIjamBotLessonBrief({
                                                lesson,
                                                tips: LESSON_TIPS_BY_TONE[teachingTone]?.[lesson.id] || [],
                                                tone: teachingTone
                                            }));
                                        }}
                                        style={{
                                            textAlign: 'left',
                                            border: '2px solid #334155',
                                            background: lesson.id === activeLesson.id ? '#c8102e' : '#111827',
                                            color: '#f8fafc',
                                            borderRadius: '8px',
                                            padding: '6px 8px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {idx + 1}. {lesson.id}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '11px', color: '#fcd34d' }}>
                                completed: {completedLessons.length}/{lessons.length}
                            </div>
                            <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af' }}>
                                disclaimer: lessons are co-written with AI
                            </div>
                        </aside>
                        <main style={{ padding: '10px', display: 'grid', gridTemplateRows: 'auto auto minmax(0,1fr) auto', gap: '8px', minHeight: 0 }}>
                            <div style={{ border: '2px solid #334155', borderRadius: '8px', padding: '8px', fontFamily: 'monospace', background: '#0b1220', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5d000', fontWeight: 900 }}>
                                    <Bot size={14} /> IJAM_BOT online for this lesson
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {['teach', 'tips', `plan ${activeLesson.id}`].map((quick) => (
                                        <button
                                            key={quick}
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={async () => {
                                                if (terminalBusy) return;
                                                await executeTerminalCommand(quick);
                                            }}
                                            style={{ fontSize: '10px', fontFamily: 'monospace' }}
                                        >
                                            {quick}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ border: '2px solid #334155', borderRadius: '8px', padding: '8px', fontFamily: 'monospace', fontSize: '12px', background: '#0b1220' }}>
                                <div style={{ color: '#f5d000', fontWeight: 900 }}>ACTIVE LESSON: {activeLesson.id}</div>
                                <div style={{ color: '#bfdbfe' }}>{activeLesson.title}</div>
                                <div style={{ color: '#9ca3af', fontSize: '11px' }}>Run: help | ls lessons | open lesson-id | teach | next | debug issue | plan goal</div>
                            </div>
                            <div ref={terminalOutputRef} style={{ border: '2px solid #334155', borderRadius: '8px', background: '#0b1220', padding: '8px', overflowY: 'auto', minHeight: 0, maxHeight: isNarrowScreen ? '40vh' : 'none', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }}>
                                {terminalLog.map((entry, idx) => (
                                    <div key={`${entry.role}-${idx}`} style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                                        <span style={{ color: entry.role === 'assistant' ? '#f5d000' : entry.role === 'user' ? '#86efac' : '#93c5fd', fontWeight: 900 }}>
                                            {entry.role === 'assistant' ? 'IJAM_BOT>' : entry.role === 'user' ? 'YOU>' : 'SYS>'}
                                        </span>{' '}
                                        <span style={{ color: '#e5e7eb' }}>{entry.text}</span>
                                    </div>
                                ))}
                                {terminalBusy && (
                                    <div><span style={{ color: '#f5d000', fontWeight: 900 }}>IJAM_BOT&gt;</span> processing...</div>
                                )}
                            </div>
                            <div style={{ border: '2px solid #334155', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
                                {!planStarted && (
                                    <div style={{ marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px' }}>
                                        <input
                                            value={planCommandInput}
                                            onChange={(e) => setPlanCommandInput(e.target.value)}
                                            placeholder={`type: ${PLAN_START_COMMAND}`}
                                            style={{ border: '2px solid #f5d000', borderRadius: '8px', background: '#111827', color: '#f8fafc', padding: '10px', fontFamily: 'monospace', fontWeight: 800 }}
                                        />
                                        <button type="button" className="btn btn-red" onClick={handleStartPlan} style={{ fontFamily: 'monospace' }}>
                                            START
                                        </button>
                                    </div>
                                )}
                                {planCommandError && (
                                    <div style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '11px', marginBottom: '6px' }}>{planCommandError}</div>
                                )}
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
                                        placeholder='type command (try: help)'
                                        style={{ border: '2px solid #f5d000', borderRadius: '8px', background: '#111827', color: '#f8fafc', padding: '10px', fontFamily: 'monospace', fontWeight: 800 }}
                                    />
                                    <button type="submit" className="btn btn-red" disabled={terminalBusy} style={{ fontFamily: 'monospace' }}>
                                        RUN
                                    </button>
                                </form>
                                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {['help', PLAN_START_COMMAND, 'ls lessons', `open ${activeLesson.id}`, 'teach', 'next', 'progress'].map((cmd) => (
                                        <button
                                            key={cmd}
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={async () => {
                                                if (terminalBusy) return;
                                                await executeTerminalCommand(cmd);
                                            }}
                                            style={{ fontSize: '10px', fontFamily: 'monospace' }}
                                        >
                                            {cmd}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default ResourcePage;
