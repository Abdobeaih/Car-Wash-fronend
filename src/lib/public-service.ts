import {API_URL} from './api';
import type {CarService} from './types';

export type PublicServiceResult={state:'ready';service:CarService}|{state:'missing'}|{state:'unavailable'};

/** A network outage is not a missing catalogue item. Never turn a 5xx into 404. */
export async function getPublicService(slug:string):Promise<PublicServiceResult> {
 try {
  const response=await fetch(`${API_URL}/services/${encodeURIComponent(slug)}`,{next:{revalidate:60},signal:AbortSignal.timeout(8000)});
  if(response.status===404)return {state:'missing'};
  if(!response.ok)return {state:'unavailable'};
  return {state:'ready',service:await response.json() as CarService};
 }catch{return {state:'unavailable'};}
}
