'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ArrowRight, ArrowUpRight, CalendarDays, Clock3, Check, LoaderCircle, ChevronLeft, ShieldCheck } from 'lucide-react';
export type ContactDetails = { name: string; email: string; company: string; service: string; message: string; website?:string };
type Day = {date:string;slots:{time:string}[]};
type Availability = {ok:boolean;timezone?:string;days?:Day[];error?:string};
function zonedDate(date:string, time:string, zone:string) {
  const [y,m,d]=date.split('-').map(Number),[h,min]=time.split(':').map(Number);
  const target=Date.UTC(y,m-1,d,h,min); let ts=target;
  for(let i=0;i<3;i++) {
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    ts+=target-Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),Number(p.second));
  }
  return new Date(ts);
}
export default function Booking({details,onClose}:{details:ContactDetails;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [type,setType]=useState('MT-1');
  const [days,setDays]=useState<Day[]>([]);
  const [zone,setZone]=useState('America/Chicago');
  // Booking only renders client-side after the visitor opens it, so the browser zone is safe here.
  const [localZone,setLocalZone]=useState(()=>Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [date,setDate]=useState('');
  const [time,setTime]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [phase,setPhase]=useState<'choose'|'review'|'done'>('choose');
  const [busy,setBusy]=useState(false);
  const [uncertain,setUncertain]=useState(false);
  const [meetLink,setMeetLink]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    const el=dialog.current;const prev=document.activeElement as HTMLElement|null;
    const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    el?.showModal();
    return()=>{el?.close();document.body.style.overflow=oldOverflow;prev?.focus();};
  },[]);
  useEffect(()=>{
    const abort=new AbortController();
    fetch(`/api/availability?type=${type}`,{signal:abort.signal}).then(async r=>{
      const data:Availability=await r.json();
      if(!r.ok||!data.ok||!Array.isArray(data.days)) throw new Error(data.error||'Availability is temporarily unavailable.');
      const open=data.days.filter(d=>Array.isArray(d.slots)&&d.slots.length);
      setDays(open);setZone(data.timezone||'America/Chicago');setDate(open[0]?.date||'');
    }).catch(e=>{if(e.name!=='AbortError'){setDays([]);setError('We couldn’t load the calendar. Please try again, or book on the original Nuvato AI site.');}}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    return()=>abort.abort();
  },[type,reload]);
  // Changing the meeting type or retrying resets the calendar before the effect refetches.
  function reloadCalendar(next:()=>void){setLoading(true);setError('');setDate('');setTime('');next();}
  const formatTime=useCallback((t:string)=>date?new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:localZone}).format(zonedDate(date,t,zone)):t,[date,zone,localZone]);
  const dateLabel=date?new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:localZone}).format(zonedDate(date,time||'12:00',zone)):'';
  async function confirm(){
    if(busy||!date||!time)return;
    setBusy(true);setError('');setUncertain(false);
    try {
      const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,date,time,name:details.name,email:details.email,company:details.company,phone:'',website:details.website||'',notes:`${details.service}. ${details.message}`})});
      const data=await r.json() as {ok?:boolean;meetLink?:string;error?:string;uncertain?:boolean};
      if(data.ok===true) {
        try {const url=new URL(data.meetLink || "");if(url.protocol==='https:')setMeetLink(url.href);}catch{}
        setPhase('done');
      } else {
        setError(data.error||'The booking service could not confirm your appointment. Please check your email before trying again.');
        setUncertain(!!data.uncertain);
        if(r.status===409) {setPhase('choose');setTime('');}
      }
    } catch {setUncertain(true);setError('We couldn’t verify the booking confirmation. Please check your email before trying again to avoid booking twice.');}
    finally {setBusy(false);}
  }
  return <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}} onClick={e=>{if(e.target===dialog.current&&!busy)onClose();}}><div className="booking-shell"><div className="booking-header"><span className="booking-symbol"><CalendarDays size={23}/></span><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close booking"><X size={21}/></button></div><h2 id="booking-title">{phase==='done'?'You’re booked.':phase==='review'?'Make it official.':'Let’s find a time.'}</h2><p className="booking-subtitle">{phase==='done'?`A confirmation is on its way to ${details.email}.`:phase==='review'?'Review your details before confirming.':'A real conversation about what could work better.'}</p>
    {phase==='choose'&&<><div className="meeting-types" aria-label="Meeting type">{[{id:'MT-1',name:'Discovery call',duration:'30 minutes'},{id:'MT-2',name:'Scoping workshop',duration:'60 minutes'}].map(t=><button key={t.id} aria-pressed={type===t.id} className={type===t.id?'selected':''} onClick={()=>{if(t.id!==type)reloadCalendar(()=>setType(t.id));}}><b>{t.name}</b><span><Clock3 size={12}/>{t.duration}</span></button>)}</div><div className="timezone-row"><label>Display times in<select value={localZone} onChange={e=>setLocalZone(e.target.value)}>{Array.from(new Set([localZone,zone,Intl.DateTimeFormat().resolvedOptions().timeZone,'America/New_York','America/Los_Angeles','Asia/Manila','Europe/London','UTC'])).map(z=><option key={z} value={z}>{z.replaceAll('_',' ')}</option>)}</select></label></div>{loading?<div className="booking-loading" role="status"><LoaderCircle className="spin" size={24}/>Checking live availability…</div>:error?<div className="booking-error" role="alert"><p>{error}</p><button className="text-button blue-text" onClick={()=>reloadCalendar(()=>setReload(reload+1))}>Try again<ArrowRight size={15}/></button><a href="https://nuvato.ai/#contact" target="_blank" rel="noopener noreferrer">Open Nuvato AI booking<ArrowUpRight size={14}/></a></div>:!days.length?<div className="booking-error"><p>No open appointments are available in the next 14 days.</p><a href="https://nuvato.ai/#contact" target="_blank" rel="noopener noreferrer">Contact Nuvato AI<ArrowUpRight size={14}/></a></div>:<><p className="booking-label">1. CHOOSE A DATE <span>Dates below are in {zone.replaceAll('_',' ')}</span></p><div className="booking-days">{days.map(d=>{const dt=new Date(`${d.date}T12:00:00Z`);return <button key={d.date} className={date===d.date?'selected':''} aria-pressed={date===d.date} onClick={()=>{setDate(d.date);setTime('');}}><small>{dt.toLocaleDateString('en-US',{weekday:'short',timeZone:'UTC'})}</small><b>{dt.getUTCDate()}</b><span>{dt.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})}</span></button>;})}</div><p className="booking-label">2. CHOOSE A TIME <span>{localZone.replaceAll('_',' ')}</span></p><div className="booking-times">{days.find(d=>d.date===date)?.slots.map(s=><button key={s.time} className={time===s.time?'selected':''} aria-pressed={time===s.time} onClick={()=>setTime(s.time)}>{formatTime(s.time)}</button>)}</div>{time&&<p className="selected-time" aria-live="polite"><Check size={14}/>{dateLabel} at {formatTime(time)}</p>}<button className="button button-primary booking-next" disabled={!date||!time} onClick={()=>{setPhase('review');setError('');}}>Review booking<ArrowRight size={16}/></button></>}</>}
    {(phase==='review'||phase==='done')&&<><div className="booking-summary">{phase==='done'&&<div className="booking-success"><Check size={26}/></div>}<h3>{type==='MT-1'?'Discovery call':'Scoping workshop'}</h3><p><CalendarDays size={16}/>{dateLabel}</p><p><Clock3 size={16}/>{formatTime(time)} · {type==='MT-1'?'30':'60'} minutes</p><small>{localZone.replaceAll('_',' ')}</small><hr/><dl><div><dt>Name</dt><dd>{details.name}</dd></div><div><dt>Email</dt><dd>{details.email}</dd></div><div><dt>Company</dt><dd>{details.company}</dd></div><div><dt>Service</dt><dd>{details.service}</dd></div></dl></div>{error&&<p className="booking-error" role="alert">{error}</p>}{phase==='review'?<><div className="booking-review-actions"><button className="text-button" disabled={busy} onClick={()=>{setPhase('choose');setError('');}}><ChevronLeft size={16}/>Back</button><button className="button button-primary" disabled={busy||uncertain} onClick={confirm}>{busy?<><LoaderCircle size={17} className="spin"/>Confirming…</>:<>Confirm booking<Check size={16}/></>}</button></div><div className="booking-privacy"><p>By confirming, you agree to the <a href="/terms/" target="_blank" rel="noopener noreferrer">Terms</a> and send these details to Nuvato AI’s booking service to request your appointment and calendar invitation, as described in the <a href="/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. This does not enroll you in SMS.</p></div></>:<>{meetLink&&<a className="button button-primary booking-next" href={meetLink} target="_blank" rel="noopener noreferrer">Open meeting link<ArrowUpRight size={16}/></a>}<button className="button button-secondary booking-next" onClick={onClose}>Done<Check size={16}/></button></>}</>}
    <div className="booking-footer"><ShieldCheck size={13}/>Your details go directly to Nuvato AI.</div></div></dialog>;
}
