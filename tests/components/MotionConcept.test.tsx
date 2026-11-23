import {act,fireEvent,screen,waitFor} from '@testing-library/react';
import {beforeEach,afterEach,describe,it,vi,expect} from 'vitest';
import MotionConcept from '@/components/MotionConcept';
import {NextIntlClientProvider} from 'next-intl';
import EngineFeedback from '@/components/EngineFeedback';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({path:'/',reduce:false,allowed:false,players:[] as {play:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>;volume:number;currentTime:number;onended:unknown}[]}));
vi.mock('@/i18n/navigation',()=>({usePathname:()=>h.path}));
beforeEach(()=>{
 h.path='/';h.reduce=false;h.allowed=false;h.players=[];sessionStorage.clear();
 vi.stubGlobal('matchMedia',()=>({matches:h.reduce,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
 vi.stubGlobal('Audio',class{play=vi.fn(()=>h.allowed?Promise.resolve():Promise.reject(new Error('blocked')));pause=vi.fn();volume=1;currentTime=0;onended=null;constructor(){h.players.push(this)}});
});
afterEach(()=>{vi.unstubAllGlobals();});
describe('Intro reliability',()=>{
 it('holds one tied rig when autoplay is blocked and starts after explicit tap',async()=>{
  renderWithIntl(<MotionConcept/>);await waitFor(()=>expect(h.players[0].play).toHaveBeenCalled());
  expect(document.querySelector('.mcc-waiting')).not.toBeNull();
  expect(document.querySelector('[data-tied-rig] .mcc-drive')).not.toBeNull();
  expect(document.querySelector('[data-tied-rig] .mcc-fabric-panel')).not.toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Tap to start with engine sound'}));
  expect(document.querySelector('.mcc-started')).not.toBeNull();
 });
 it('starts together when browser permits audio',async()=>{
  h.allowed=true;renderWithIntl(<MotionConcept/>);await waitFor(()=>expect(document.querySelector('.mcc-started')).not.toBeNull());
  expect(h.players[0].volume).toBe(.8);
 });
 it('respects remembered mute without an autoplay attempt',()=>{
  sessionStorage.setItem('mcc-engine-muted','1');renderWithIntl(<MotionConcept/>);
  expect(h.players).toHaveLength(0);expect(document.querySelector('.mcc-started')).not.toBeNull();
 });
 it('bypasses intro and audio for reduced motion',()=>{
  h.reduce=true;renderWithIntl(<MotionConcept/>);expect(screen.queryByRole('dialog')).toBeNull();expect(h.players).toHaveLength(0);
 });
 it('does not replay for a session that already saw it',()=>{
  sessionStorage.setItem('mcc-motion-concept-seen','1');renderWithIntl(<MotionConcept/>);expect(screen.queryByRole('dialog')).toBeNull();expect(h.players).toHaveLength(0);
 });
 it('Escape stops audio and records the same skip choice as the button',()=>{
  renderWithIntl(<MotionConcept/>);fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog')).toBeNull();expect(sessionStorage.getItem('mcc-motion-concept-seen')).toBe('1');expect(h.players[0].pause).toHaveBeenCalled();
 });
 it('removes listeners and stops audio when unmounted',()=>{
  const r=renderWithIntl(<MotionConcept/>);r.unmount();expect(h.players[0].pause).toHaveBeenCalled();
 });
 it('silent start synchronizes the global mute control',()=>{
  renderWithIntl(<><MotionConcept/><EngineFeedback/></>);
  fireEvent.click(screen.getByRole('button',{name:'Start silently'}));
  expect(screen.getByRole('button',{name:'Sound off'})).toHaveAttribute('aria-pressed','true');
  expect(sessionStorage.getItem('mcc-engine-muted')).toBe('1');
 });
 it('stops audio when navigation leaves Home',async()=>{
  h.allowed=true;const r=renderWithIntl(<MotionConcept/>);await waitFor(()=>expect(document.querySelector('.mcc-started')).not.toBeNull());
  h.path='/services';r.rerender(<NextIntlClientProvider locale="en" messages={{}}><MotionConcept/></NextIntlClientProvider>);expect(h.players[0].pause).toHaveBeenCalled();expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('removes first-gesture start listeners when skipped',()=>{
  const spy=vi.spyOn(window,'removeEventListener');renderWithIntl(<MotionConcept/>);fireEvent.keyDown(document,{key:'Escape'});
  expect(spy).toHaveBeenCalledWith('pointerdown',expect.any(Function));spy.mockRestore();
 });
 it('responds to a shared mute event and stops current intro audio',async()=>{
  h.allowed=true;renderWithIntl(<MotionConcept/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Mute'})).toBeInTheDocument());
  act(()=>window.dispatchEvent(new CustomEvent('mcc-engine-mute',{detail:true})));
  expect(h.players[0].pause).toHaveBeenCalled();expect(screen.getByRole('button',{name:'Engine sound'})).toHaveAttribute('aria-pressed','false');
 });
});
