import {
  Bot,
  Folder,
  User,
  Settings,
  Sparkles,
  Globe,
  Gamepad2,
  Waypoints,
  Wand2,
  Activity,
  Trash2
} from 'lucide-react';

export const APP_REGISTRY = [
  { type: 'terminal', label: 'TERMINAL', icon: Bot, color: '#bfdbfe', defaultW: 860, defaultH: 560, title: 'IJAM_TERMINAL // IjamOS v3' },
  { type: 'files', label: 'FILES', icon: Folder, color: '#f5d000', defaultW: 820, defaultH: 540, title: 'FILE_EXPLORER // IjamOS v3' },
  { type: 'progress', label: 'STATS', icon: User, color: '#86efac', defaultW: 700, defaultH: 580, title: 'BUILDER_STATS // PROGRESS' },
  { type: 'settings', label: 'SETTINGS', icon: Settings, color: '#94a3b8', defaultW: 660, defaultH: 520, title: 'SYSTEM_SETTINGS // CONFIG' },
  { type: 'wallpaper', label: 'WALLPAPER', icon: Sparkles, color: '#fbbf24', defaultW: 600, defaultH: 480, title: 'WALLPAPER_GALLERY // PERSONALIZE' },
  { type: 'kdacademy', label: 'KDACADEMY', icon: Globe, color: '#22c55e', defaultW: 900, defaultH: 650, title: 'KDAcademy // LEARNING' },
  { type: 'arcade', label: 'ARCADE', icon: Gamepad2, color: '#f5d000', defaultW: 600, defaultH: 460, title: 'BUILDER_ARCADE // STUDIO' },
  { type: 'mind_mapper', label: 'MIND_MAP', icon: Waypoints, color: '#fef08a', defaultW: 920, defaultH: 620, title: 'MIND_MAPPER // IDEATION' },
  { type: 'prompt_forge', label: 'PROMPT_FORGE', icon: Wand2, color: '#fb923c', defaultW: 860, defaultH: 580, title: 'PROMPT_FORGE // MASTER PROMPT' },
  { type: 'simulator', label: 'SIMULATOR', icon: Activity, color: '#86efac', defaultW: 820, defaultH: 580, title: 'VIBE_SIMULATOR // ARCHITECTURE' },
  { type: 'trash', label: 'RECYCLE', icon: Trash2, color: '#ef4444', defaultW: 500, defaultH: 320, title: 'RECYCLE_BIN // DELETED CONTENT' }
];
