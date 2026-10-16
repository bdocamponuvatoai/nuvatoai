'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUpRight, Check, FileText, Layers3, LockKeyhole, Mail, ShieldCheck, Workflow} from 'lucide-react';
import {agentSummary, agentStory} from '../lib/content';
import AgentDirectory from './AgentDirectory';


function AgentWorkspace({phase, onPhase}:{phase:number; onPhase:(phase:number)=>void}) {
  return <div className="agent-workspace" aria-label="Illustrative Lead Qualifier workflow">
    <div className="aw-toolbar"><span><img src="/brand/nuvato-integration-mark.webp" width="25" height="25" alt=""/>Nuvato workspace</span><span className="mono">ILLUSTRATIVE</span></div>
    <div className="aw-inner">
      <div className="aw-title"><div className="aw-agent-symbol"><ArrowUpRight size={23}/></div><div><span className="mono">SALES AGENT</span><h3>Lead Qualifier</h3></div><span className="aw-version mono">01</span></div>
      <div className="aw-tabs" role="tablist" aria-label="Explore the example workflow">
        {['Scope','Approve','Run'].map((name,i)=><button key={name} type="button" role="tab" id={`workflow-tab-${i}`} aria-selected={phase===i} aria-controls={`workflow-scene-${i}`} tabIndex={phase===i?0:-1} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%3;else if(e.key==='ArrowLeft')next=(i+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();onPhase(next);document.getElementById(`workflow-tab-${next}`)?.focus();}} onClick={()=>onPhase(i)}><span className="mono">0{i+1}</span>{name}</button>)}
      </div>
      <div className="aw-scenes">
        <div id="workflow-scene-0" role="tabpanel" aria-labelledby="workflow-tab-0" hidden={phase!==0} tabIndex={0} className="aw-scene">
          <div className="aw-scene-label"><span className="mono">A CLEAR STARTING POINT</span><Layers3 size={16}/></div>
          <div className="aw-event"><span className="aw-event-icon"><Mail size={20}/></span><div><b>New inbound lead</b><p>Website inquiry received</p></div><span className="aw-tag">Input</span></div>
          <div className="aw-connector" aria-hidden="true"><ArrowDown size={16}/></div>
          <div className="aw-event aw-event-blue"><span className="aw-event-icon"><Workflow size={20}/></span><div><b>Qualify & route</b><p>A defined workflow, inside your CRM</p></div></div>
          <div className="aw-permission"><LockKeyhole size={14}/><span>Access scoped to the task</span><Check size={14}/></div>
        </div>
        <div id="workflow-scene-1" role="tabpanel" aria-labelledby="workflow-tab-1" hidden={phase!==1} tabIndex={0} className="aw-scene">
          <div className="aw-scene-label"><span className="mono">HUMAN REVIEW</span><ShieldCheck size={16}/></div>
          <div className="aw-approval"><span className="aw-approval-icon"><ShieldCheck size={26}/></span><b>An action needs your review.</b><p>Review the proposed action before it runs.</p></div>
          <dl className="aw-review-details"><div><dt>Proposed action</dt><dd>Route lead to sales</dd></div><div><dt>Permission</dt><dd>Scoped CRM access</dd></div></dl>
          <div className="aw-waiting"><span/>Waiting for approval<LockKeyhole size={14}/></div>
        </div>
        <div id="workflow-scene-2" role="tabpanel" aria-labelledby="workflow-tab-2" hidden={phase!==2} tabIndex={0} className="aw-scene">
          <div className="aw-scene-label"><span className="mono">A RECORD OF THE RUN</span><FileText size={16}/></div>
          <div className="aw-complete"><span><Check size={19}/></span><div><b>Lead routed to sales</b><p>Approved action completed</p></div></div>
          <div className="aw-run-log">{['Lead received','Record enriched','Approval recorded','Lead routed'].map((text,i)=><div key={text}><span className="mono">0{i+1}</span><span>{text}</span><Check size={14}/></div>)}</div>
          <p className="aw-run-note"><FileText size={14}/>A readable trail from trigger to action.</p>
        </div>
      </div>
      <div className="aw-footer"><LockKeyhole size={13}/><span>Illustrative workflow · No connected accounts</span></div>
    </div>
    <div className="aw-bottom"><span className="mono">PERMISSIONS → APPROVAL → ACTION</span><span className="aw-bottom-dot"/></div>
  </div>;
}

export default function AgentsSection({onChoose}:{onChoose:(service:string,agent?:string)=>void}) {
  const [phase,setPhase]=useState(0);
  const [scrollMode,setScrollMode]=useState(false);
  const stepRefs=useRef<(HTMLElement|null)[]>([]);

  useEffect(()=>{
    if(!('IntersectionObserver' in window))return;
    const desktop=window.matchMedia('(min-width: 1024px) and (min-height: 720px)');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer:IntersectionObserver|undefined;
    const bind=()=>{
      observer?.disconnect();
      const enabled=desktop.matches&&!reduced.matches;
      setScrollMode(enabled);
      if(!enabled)return;
      const visible=new Map<Element,number>();
      observer=new IntersectionObserver(entries=>{
        for(const entry of entries){if(entry.isIntersecting)visible.set(entry.target,entry.intersectionRatio);else visible.delete(entry.target);}
        const first=[...visible.entries()].sort((a,b)=>b[1]-a[1])[0];
        if(first){const index=stepRefs.current.indexOf(first[0] as HTMLElement);if(index>=0)setPhase(index);}
      },{rootMargin:'-22% 0px -42% 0px',threshold:[0,.25,.5,.75,1]});
      stepRefs.current.forEach(el=>{if(el)observer?.observe(el);});
    };
    bind();desktop.addEventListener('change',bind);reduced.addEventListener('change',bind);
    return()=>{observer?.disconnect();desktop.removeEventListener('change',bind);reduced.removeEventListener('change',bind);};
  },[]);

  function choosePhase(next:number){setPhase(next);if(scrollMode)stepRefs.current[next]?.scrollIntoView({behavior:'smooth',block:'center'});}

  return <section id="agents" className="section container agents-v2" aria-labelledby="agents-title">
    <div className="agent-editorial-heading" data-reveal><div><p className="eyebrow">04 / AGENTS</p><h2 id="agents-title">Agents that <em>execute,</em><br/>not just answer.</h2></div><div className="agent-intro"><p>{agentSummary}</p><a className="text-button" href="#agent-catalog">Explore the agent catalog<ArrowDown size={17}/></a></div></div>
    <div className={`agent-story ${scrollMode?'scroll-enabled':''}`}>
      <div className="agent-story-steps">{agentStory.map((step,i)=><article key={step.title} ref={el=>{stepRefs.current[i]=el;}} className={`agent-story-step ${phase===i?'current':''}`} id={`agent-story-${i}`}><div className="agent-step-track"><span className="mono">0{i+1}</span><i/></div><div><p className="agent-step-kicker mono">{step.label}</p><h3>{step.title}</h3><p>{step.description}</p><span className="agent-step-detail"><Check size={14}/>{step.detail}</span></div></article>)}</div>
      <div className="agent-story-stage"><AgentWorkspace phase={phase} onPhase={choosePhase}/><p className="agent-scene-caption"><span className="caption-line"/>One example. Three clear boundaries.</p></div>
    </div>
    <dl className="agent-facts"><div><dt>Choose a starting point</dt><dd>12 ready-made agents</dd></div><div><dt>Build around your work</dt><dd>Custom, usually 2–4 weeks</dd></div><div><dt>Define the boundaries</dt><dd>Permissions & approvals</dd></div><div><dt>Understand the activity</dt><dd>Readable run logs</dd></div></dl>
    <AgentDirectory onChoose={onChoose}/>
  </section>;
}
