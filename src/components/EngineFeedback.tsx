'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

/** Quiet, gesture-started button feedback. No playback on page load. */
export default function EngineFeedback() {
 const ar = useLocale() === 'ar';
 const audio = useRef<HTMLAudioElement | null>(null);
 const muted = useRef(false);
 const reduced = useRef(false);
 const [enabled, setEnabled] = useState(false);
 const [isMuted, setMuted] = useState(false);
 useEffect(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preference = () => { reduced.current = media.matches; if(media.matches) audio.current?.pause(); };
  preference(); media.addEventListener('change',preference);
  try { muted.current=sessionStorage.getItem('mcc-engine-muted')==='1'; setMuted(muted.current); } catch {}
  const click = (event: MouseEvent) => {
   if(!event.isTrusted || muted.current || reduced.current) return;
   const target=event.target;
   if(!(target instanceof Element)) return;
   const button=target.closest('button,a');
   if(!button || button.hasAttribute('disabled') || button.getAttribute('aria-disabled')==='true' || button.closest('[data-engine-ignore],.mcc-intro')) return;
   // Navigation controls and native action buttons only, never typing or form edits.
   if(button.tagName==='A' && !button.hasAttribute('href')) return;
   const player=audio.current ?? new Audio('/audio/mcc-button-ignition.mp3');
   audio.current=player; player.volume=.40; player.currentTime=0;
   void player.play().then(()=>setEnabled(true)).catch(()=>{});
  };
  const sync=(event:Event)=>{const value=Boolean((event as CustomEvent<boolean>).detail);muted.current=value;setMuted(value);if(value)audio.current?.pause();};
  window.addEventListener('mcc-engine-mute',sync);
  document.addEventListener('click',click,true);
  return()=>{window.removeEventListener('mcc-engine-mute',sync);document.removeEventListener('click',click,true);media.removeEventListener('change',preference);audio.current?.pause();};
 },[]);
 function toggle() {
  const next=!isMuted; muted.current=next; setMuted(next);
  try {sessionStorage.setItem('mcc-engine-muted',next?'1':'0');} catch {}
  window.dispatchEvent(new CustomEvent('mcc-engine-mute',{detail:next}));
  if(next) audio.current?.pause();
 }
 return <button type="button" data-engine-ignore className="mcc-engine-toggle" onClick={toggle} aria-pressed={isMuted} title={ar?'صوت الأزرار يبدأ مع أول ضغطة، ويمكن كتمه هنا':'Button sound starts on your first tap. Mute it here.'}>
  <span aria-hidden="true">{isMuted?'○':'◉'}</span> {ar?(isMuted?'الصوت مكتوم':enabled?'صوت المحرك':'صوت الأزرار'):(isMuted?'Sound off':enabled?'Engine sound':'Button sound')}
 </button>;
}
