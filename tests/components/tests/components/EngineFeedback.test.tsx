import {act,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import EngineFeedback from '@/components/EngineFeedback';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({players:[] as {volume:number;currentTime:number;play:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>}[],reduce:false}));
beforeEach(()=>{sessionStorage.clear();h.players=[];h.reduce=false;vi.stubGlobal('matchMedia',()=>({matches:h.reduce,addEventListener:vi.fn(),removeEventListener:vi.fn()}));vi.stubGlobal('Audio',class{volume=1;currentTime=0;play=vi.fn(()=>Promise.resolve());pause=vi.fn();constructor(){h.players.push(this);}});});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
function setup(){const listener=vi.spyOn(document,'addEventListener');renderWithIntl(<><EngineFeedback/><button>Action</button></>);const click=listener.mock.calls.find(([type,,capture])=>type==='click'&&capture===true)?.[1] as EventListener;const tap=()=>act(()=>click({isTrusted:true,target:screen.getByRole('button',{name:'Action'})} as unknown as Event));return {click,tap};}
describe('Button sound volume and existing safeguards',()=>{
 it('starts only on a real gesture, at moderate volume0.20',async()=>{const {click,tap}=setup();expect(h.players).toHaveLength(0);act(()=>click({isTrusted:false,target:screen.getByRole('button',{name:'Action'})} as unknown as Event));expect(h.players).toHaveLength(0);await tap();expect(h.players).toHaveLength(1);expect(h.players[0].volume).toBe(.20);expect(h.players[0].play).toHaveBeenCalledTimes(1);await tap();expect(h.players).toHaveLength(1);expect(h.players[0].currentTime).toBe(0);});
 it('keeps saved mute silent',()=>{sessionStorage.setItem('mcc-engine-muted','1');const {tap}=setup();tap();expect(h.players).toHaveLength(0);});
 it('keeps reduced-motion silent',()=>{h.reduce=true;const {tap}=setup();tap();expect(h.players).toHaveLength(0);});
 it('pauses when the shared mute setting changes',async()=>{const {tap}=setup();await tap();act(()=>window.dispatchEvent(new CustomEvent('mcc-engine-mute',{detail:true})));expect(h.players[0].pause).toHaveBeenCalled();tap();expect(h.players[0].play).toHaveBeenCalledTimes(1);});
});
