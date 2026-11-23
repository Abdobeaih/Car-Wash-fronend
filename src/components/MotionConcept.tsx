'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

function Car({ className = '' }: { className?: string }) {
 // Generated photorealistic asset, not a stock photograph or brand endorsement.
 // eslint-disable-next-line @next/next/no-img-element
 return <img className={className} src="/images/realistic-car-cutout.webp" width="800" height="235" alt="" aria-hidden="true" />;
}

export default function MotionConcept() {
 const ar = useLocale() === 'ar';
 const pathname = usePathname();
 const isHome = pathname === '/';
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const [soundOn, setSoundOn] = useState(false);
 useEffect(()=>{
  const sync=(event:Event)=>{if((event as CustomEvent<boolean>).detail){audioRef.current?.pause();setSoundOn(false);}};
  window.addEventListener('mcc-engine-mute',sync);
  return()=>window.removeEventListener('mcc-engine-mute',sync);
 },[]);
 function toggleSound() {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {if(sessionStorage.getItem('mcc-engine-muted')==='1') return;} catch {}

  if (soundOn) {audioRef.current?.pause(); setSoundOn(false); return;}
  const audio = new Audio('/audio/mcc-engine-rev.mp3'); audio.volume=.35; audioRef.current=audio;
  void audio.play().then(()=>setSoundOn(true)).catch(()=>setSoundOn(false));
  audio.onended=()=>setSoundOn(false);
 }
 const [intro, setIntro] = useState(isHome);
 const [paused, setPaused] = useState(false);
 useEffect(() => {
  if (!isHome || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {setIntro(false);return;}
  try { if (sessionStorage.getItem('mcc-motion-concept-seen')) {setIntro(false);return;} } catch {}
  setIntro(true);
  const timer = window.setTimeout(() => { setIntro(false); try { sessionStorage.setItem('mcc-motion-concept-seen', '1'); } catch {} }, 4900);
  return () => window.clearTimeout(timer);
 }, [isHome]);
 useEffect(() => {
  if (!intro) return;
  const previous = document.activeElement as HTMLElement | null;
  const trap = (event: KeyboardEvent) => {
   if (event.key === 'Escape') {setIntro(false);audioRef.current?.pause();return;}
   if (event.key !== 'Tab') return;
   const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.mcc-intro button'));
   const first=buttons[0], last=buttons[buttons.length-1];
   if (event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
   else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
  };
  document.addEventListener('keydown',trap);
  return ()=>{document.removeEventListener('keydown',trap);previous?.focus();};
 }, [intro]);
 useEffect(()=>()=>{audioRef.current?.pause();},[]);
 function skip() {audioRef.current?.pause();setSoundOn(false); setIntro(false); try { sessionStorage.setItem('mcc-motion-concept-seen', '1'); } catch {} }
 if (!isHome) return null;
 return <>
  <button className="mcc-pause" onClick={() => setPaused(!paused)} aria-pressed={paused}>{ar ? (paused ? 'تشغيل الحركة' : 'إيقاف الحركة') : (paused ? 'Play motion' : 'Pause motion')}</button>
  <div className={`mcc-motion-scene ${paused ? 'mcc-paused' : ''}`} aria-hidden="true"><div className="mcc-orbit mcc-orbit-one"/><div className="mcc-orbit mcc-orbit-two"/><div className="mcc-track"/><Car className="mcc-cruiser"/><span className="mcc-spark mcc-spark-one"/><span className="mcc-spark mcc-spark-two"/></div>
  {intro && <div className="mcc-intro" role="dialog" aria-modal="true" aria-label={ar ? 'مقدمة موبايل كار كير' : 'Mobile Car Care introduction'}>
   <div className="mcc-fabric-panel"><div className="mcc-fabric" aria-hidden="true">{Array.from({length:12}, (_,i)=><div key={i} className="mcc-fold" style={{left:`${i*100/12}%`}}/>)}</div><div className="mcc-curtain"><div className="mcc-intro-brand"><span>MOBILE</span><strong>CAR CARE<span className="mcc-brand-dot">.</span></strong><p>{ar ? 'عناية تستحقها عربيتك' : 'CARE THAT MOVES WITH YOU'}</p></div><div className="mcc-intro-line"/><div className="mcc-grain"/></div></div>
   <div className="mcc-drive"><span className="mcc-tow"/><div className="mcc-car-rig"><span className="mcc-tailpipe"/><span className="mcc-exhaust" aria-hidden="true"><i/><i/><i/></span><Car className="mcc-intro-car"/></div></div><button className="mcc-sound" onClick={toggleSound} aria-pressed={soundOn}>{ar ? (soundOn?"كتم الصوت":"تشغيل صوت المحرك") : (soundOn?"Mute":"Engine sound")}</button>
   <button className="mcc-skip" onClick={skip} autoFocus>{ar ? 'تخطي المقدمة' : 'Skip intro'} <span aria-hidden="true">↗</span></button>
  </div>}

 </>;
}
