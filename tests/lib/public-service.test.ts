import {beforeEach,describe,it,expect,vi} from 'vitest';
import {getPublicService} from '@/lib/public-service';
const fetchMock=vi.fn();
beforeEach(()=>{vi.stubGlobal('fetch',fetchMock);fetchMock.mockReset();});
describe('public service lookup',()=>{
 it('marks only a confirmed404 as missing',async()=>{fetchMock.mockResolvedValue(new Response('{}',{status:404}));expect(await getPublicService('wash')).toEqual({state:'missing'});});
 it.each([429,500,502,503])('does not convert HTTP%s into a missing service',async(status)=>{fetchMock.mockResolvedValue(new Response('{}',{status}));expect(await getPublicService('wash')).toEqual({state:'unavailable'});});
 it('treats network errors as temporary unavailability',async()=>{fetchMock.mockRejectedValue(new Error('offline'));expect(await getPublicService('wash')).toEqual({state:'unavailable'});});
 it('returns a successful service',async()=>{const service={slug:'wash',name:'Wash'};fetchMock.mockResolvedValue(new Response(JSON.stringify(service)));expect(await getPublicService('wash')).toEqual({state:'ready',service});expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/services/wash'),expect.objectContaining({signal:expect.any(AbortSignal)}));});
});
