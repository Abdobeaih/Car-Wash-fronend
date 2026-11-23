'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

function Car({ className = '' }: { className?: string }) {
 // Generated photorealistic asset, not a stock photograph or brand endorsement.
 // eslint-disable-next-line @next/next/no-img-element
 return <img className={className} src="/images/realistic-car-cutout.webp" width="800" height="235" loading="eager" decoding="async" fetchPriority="high" alt="" aria-hidden="true" />;
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
 const [intro, setIntro] = useState(isHome);
 const [started,setStarted]=useState(false);
 useEffect(()=>{
  if(!isHome || !intro || started || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {if(sessionStorage.getItem('mcc-motion-concept-seen')) return;}catch{}
  let active=true;
  let isMuted=false;try{isMuted=sessionStorage.getItem('mcc-engine-muted')==='1';}catch{}
  if(isMuted){setStarted(true);return;}
  const audio=new Audio('/audio/mcc-engine-rev.mp3');audio.volume=.8;audioRef.current=audio;
  const gesture=(event:Event)=>{
   if(!event.isTrusted || (event.target instanceof Element && event.target.closest('button'))) return;
   if(!active) return;
   try{if(sessionStorage.getItem('mcc-engine-muted')==='1'){setStarted(true);return;}}catch{}
   active=false;audio.currentTime=0;void audio.play().then(()=>setSoundOn(true)).catch(()=>{});setStarted(true);
  };
  void audio.play().then(()=>{if(active){setSoundOn(true);setStarted(true);}}).catch(()=>{});
  audio.onended=()=>setSoundOn(false);
  for(const event of ['pointerdown','touchstart','wheel','keydown'])window.addEventListener(event,gesture,{passive:true});
  return()=>{active=false;for(const event of ['pointerdown','touchstart','wheel','keydown'])window.removeEventListener(event,gesture);};
 },[isHome,intro,started]);
 useEffect(()=>{
  if(!isHome){audioRef.current?.pause();setSoundOn(false);}
 },[isHome]);
 function start(withSound=true) {
  setStarted(true);
  if(!withSound){audioRef.current?.pause();try{sessionStorage.setItem('mcc-engine-muted','1');}catch{}window.dispatchEvent(new CustomEvent('mcc-engine-mute',{detail:true}));}
  if(!withSound || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {if(sessionStorage.getItem('mcc-engine-muted')==='1') return;} catch {}
  audioRef.current?.pause();
  const audio=new Audio('/audio/mcc-engine-rev.mp3');audio.volume=.8;audioRef.current=audio;
  void audio.play().then(()=>setSoundOn(true)).catch(()=>setSoundOn(false));
  audio.onended=()=>setSoundOn(false);
 }
 function toggleSound() {
  const mute=soundOn;
  try {sessionStorage.setItem('mcc-engine-muted',mute?'1':'0');} catch {}
  window.dispatchEvent(new CustomEvent('mcc-engine-mute',{detail:mute}));
  if(mute){audioRef.current?.pause();setSoundOn(false);}else start(true);
 }
 const [paused, setPaused] = useState(false);
 useEffect(() => {
  if (!isHome || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {setIntro(false);return;}
  try { if (sessionStorage.getItem('mcc-motion-concept-seen')) {setIntro(false);return;} } catch {}
  setIntro(true);
 }, [isHome]);
 useEffect(()=>{
  if(!intro || !started) return;
  const timer=window.setTimeout(()=>{audioRef.current?.pause();setSoundOn(false);setIntro(false);try{sessionStorage.setItem('mcc-motion-concept-seen','1');}catch{}},6500);
  return()=>window.clearTimeout(timer);
 },[intro,started]);
 useEffect(() => {
  if (!intro) return;
  const previous = document.activeElement as HTMLElement | null;
  document.querySelector<HTMLButtonElement>('.mcc-start-controls button,.mcc-skip')?.focus();
  const trap = (event: KeyboardEvent) => {
   if (event.key === 'Escape') {skip();return;}
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
  {intro && <div className={`mcc-intro mcc-tied-intro ${started?'mcc-started':'mcc-waiting'}`} role="dialog" aria-modal="true" aria-label={ar ? 'مقدمة موبايل كار كير' : 'Mobile Car Care introduction'}>
   <div className="mcc-tied-rig" data-tied-rig><div className="mcc-fabric-panel"><div className="mcc-fabric" aria-hidden="true">{Array.from({length:12}, (_,i)=><div key={i} className="mcc-fold" style={{left:`${i*100/12}%`}}/>)}</div><div className="mcc-curtain"><div className="mcc-intro-brand"><span>MOBILE</span><strong>CAR CARE<span className="mcc-brand-dot">.</span></strong><p>{ar ? 'عناية تستحقها عربيتك' : 'CARE THAT MOVES WITH YOU'}</p></div><div className="mcc-intro-line"/><div className="mcc-grain"/></div></div>
   <div className="mcc-drive"><div className="mcc-car-rig"><span className="mcc-tailpipe"/><span className="mcc-exhaust" aria-hidden="true"><i/><i/><i/></span><Car className="mcc-intro-car"/><svg className="mcc-driver" viewBox="0 0 100 70" aria-hidden="true"><g className="mcc-driver-head"><circle cx="56" cy="21" r="11" fill="#E6EAD3"/><path d="M62 18L70 22L63 25" fill="#E6EAD3"/><path d="M49 14Q56 6 63 15" stroke="#29352A" strokeWidth="6" fill="none"/></g><path d="M52 33L40 61L74 61L65 36Z" fill="#21342B"/><path className="mcc-driver-arm" d="M55 39L36 37L12 26" fill="none" stroke="#DBE2C7" strokeWidth="7" strokeLinecap="round"/><path className="mcc-driver-steer" d="M57 39L77 43L84 36" fill="none" stroke="#DBE2C7" strokeWidth="6" strokeLinecap="round"/></svg><span className="mcc-tied-rope"/></div></div></div>{!started && <div className="mcc-start-controls"><button className="btn-primary" onClick={()=>start(true)} autoFocus>{ar?'اضغط للانطلاق بصوت المحرك':'Tap to start with engine sound'}</button><button className="btn-secondary" onClick={()=>start(false)}>{ar?'ابدأ بدون صوت':'Start silently'}</button><p>{ar?'صوت محرك مرتفع. اختيارات الكتم محفوظة.':'Loud engine effect. Your mute choice is remembered.'}</p></div>}<button className="mcc-sound" onClick={toggleSound} aria-pressed={soundOn}>{ar ? (soundOn?"كتم الصوت":"تشغيل صوت المحرك") : (soundOn?"Mute":"Engine sound")}</button>
   <button className="mcc-skip" onClick={skip}>{ar ? 'تخطي المقدمة' : 'Skip intro'} <span aria-hidden="true">↗</span></button>
  </div>}

 </>;
}
