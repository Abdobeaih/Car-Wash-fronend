'use client';

import {useEffect,useState} from 'react';
import {apiRequest} from './api';
import type {TimeSlot} from './types';

/** Availability is advisory. Recheck on entry and ignore obsolete date responses. */
export function useAvailability(enabled:boolean,date:string,serviceIds:string) {
 const [slots,setSlots]=useState<TimeSlot[]|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(!enabled || !date || !serviceIds) return;
  let current=true;
  setSlots(null);setLoading(true);setError(null);
  void apiRequest<TimeSlot[]>(`/availability?date=${encodeURIComponent(date)}&serviceIds=${encodeURIComponent(serviceIds)}`)
   .then(data=>{if(current)setSlots(data);})
   .catch(reason=>{if(current)setError(reason instanceof Error?reason.message:'Availability unavailable.');})
   .finally(()=>{if(current)setLoading(false);});
  return()=>{current=false;};
 },[enabled,date,serviceIds,attempt]);
 return {slots,loading,error,retry:()=>setAttempt(value=>value+1)};
}
