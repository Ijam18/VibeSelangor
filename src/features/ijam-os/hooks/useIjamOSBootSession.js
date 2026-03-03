import { useCallback, useEffect, useRef, useState } from 'react';

const HOLD_DURATION = 1500;

export const useIjamOSBootSession = ({ playKeystroke, speakText }) => {
  const [isBooted, setIsBooted] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState('');
  const [bootPhase, setBootPhase] = useState('idle');
  const [botEmotion, setBotEmotion] = useState('sleepy');
  const [bootLines, setBootLines] = useState([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [speechBubble, setSpeechBubble] = useState('');
  const [systemTime, setSystemTime] = useState('');
  const [systemDate, setSystemDate] = useState('');
  const holdIntervalRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSystemDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const booted = typeof window !== 'undefined' && localStorage.getItem('vibe_os_booted') === 'true';
    if (booted) setIsBooted(true);
  }, []);

  const confirmBoot = useCallback(() => {
    setIsBooted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_os_booted', 'true');
    }
  }, []);

  const onHoldStart = useCallback(() => {
    setIsHolding(true);
    setHoldProgress(0);
    const start = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / HOLD_DURATION) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        confirmBoot();
      }
    }, 16);
  }, [confirmBoot]);

  const onHoldEnd = useCallback(() => {
    clearInterval(holdIntervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const handleBoot = useCallback(async () => {
    setIsBooting(true);
    setBootText('');
    setBootLines([]);
    setBootProgress(0);

    setBootPhase('waking');
    setBotEmotion('sleepy');
    setSpeechBubble('zzz...');
    if (playKeystroke) playKeystroke();
    if (speakText) speakText('Initializing IJAM OS version 3', { isSystem: true });
    await new Promise((r) => setTimeout(r, 900));

    setBootPhase('ready');
    setBotEmotion('excited');
    setSpeechBubble('Click START MY JOURNEY when ready!');
    setBootText('READY TO START');
    setIsBooting(false);
  }, [playKeystroke, speakText]);

  return {
    isBooted,
    setIsBooted,
    isBooting,
    bootText,
    bootPhase,
    botEmotion,
    bootLines,
    bootProgress,
    isHolding,
    holdProgress,
    speechBubble,
    systemTime,
    systemDate,
    confirmBoot,
    onHoldStart,
    onHoldEnd,
    handleBoot,
    setBootPhase,
    setBotEmotion,
    setSpeechBubble,
    setBootLines,
    setBootProgress,
    setBootText,
    setIsBooting
  };
};

