'use client';

import {useState} from 'react';
import {ArrowRight, ArrowUpRight, ChevronDown, Search, X} from 'lucide-react';
import {agents, agentFragment, toolNames} from '../lib/content';
import {ToolBadge} from './ToolConnections';

const teams=[
  {name:'Sales',number:'01',description:'Qualify leads. Keep deals moving.'},
  {name:'Operations',number:'02',description:'Coordinate tasks, people, and handoffs.'},
  {name:'Finance',number:'03',description:'Follow up on invoices and expenses.'},
  {name:'Support',number:'04',description:'Route tickets and follow up with customers.'},
] as const;
const filters=['All',...teams.map(team=>team.name)];

export default function AgentDirectory({onChoose}: {onChoose: (service:string, agent?:string)=>void}) {
  const [filter,setFilter]=useState('All');
  const [query,setQuery]=useState('');
  const term=query.trim().toLowerCase();
  const matchesQuery=(agent:typeof agents[number])=>`${agent.name} ${agent.category} ${agent.description} ${agent.tools.join(' ')}`.toLowerCase().includes(term);
  const matches=(agent:typeof agents[number])=>(filter==='All'||agent.category===filter)&&matchesQuery(agent);
  const count=agents.filter(matches).length;
  const countFor=(team:string)=>agents.filter(agent=>(team==='All'||agent.category===team)&&matchesQuery(agent)).length;
  const hasFilters=filter!=='All'||term.length>0;
  const reset=()=>{setFilter('All');setQuery('');};

  return <section id="agent-catalog" className="agent-directory" aria-labelledby="catalog-title">
    <div className="directory-heading">
      <div><p className="directory-eyebrow mono">THE AGENT DIRECTORY</p><h3 id="catalog-title">Find your<br/><em>starting point.</em></h3></div>
      <div className="directory-intro"><span className="directory-intro-line" aria-hidden="true"/><p>Start with the task taking up your team’s time. Find an agent, then scope it around the way you work.</p><span className="mono">12 AGENTS &nbsp; / &nbsp; 4 TEAMS</span></div>
    </div>

    <div className="directory-layout">
      <aside className="directory-index" aria-label="Filter agents by team">
        <span className="directory-index-label mono">BROWSE BY TEAM</span>
        <div className="directory-team-filters">{filters.map(team=><button key={team} type="button" aria-pressed={filter===team} aria-controls="agent-results" onClick={()=>setFilter(team)}><span>{team==='All'?'All teams':team}</span><span className="directory-filter-count mono">{String(countFor(team)).padStart(2,'0')}</span></button>)}</div>
        <div className="directory-index-note"><p>Have a different<br/>workflow in mind?</p><a href="#custom-agent-brief">Build your own<ArrowRight size={15} aria-hidden="true"/></a></div>
      </aside>

      <div className="directory-content">
        <div className="directory-toolbar">
          <div className="directory-result-status"><span role="status" aria-live="polite" aria-atomic="true">{count} {count===1?'agent':'agents'}{filter!=='All'?` in ${filter}`:' across your business'}</span>{hasFilters&&<button type="button" onClick={reset}>Reset<X size={12} aria-hidden="true"/></button>}</div>
          <div className="directory-search"><Search size={17} strokeWidth={1.6} aria-hidden="true"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} aria-label="Search agents by name, task, or tool" aria-controls="agent-results" placeholder="Search a task or tool" maxLength={100}/>{query&&<button type="button" aria-label="Clear agent search" onClick={()=>setQuery('')}><X size={16} aria-hidden="true"/></button>}</div>
        </div>

        <div id="agent-results" className="directory-results">
          {teams.map(team=>{
            const teamAgents=agents.filter(agent=>agent.category===team.name);
            const visible=teamAgents.some(matches);
            const key=team.name.toLowerCase();
            return <section key={team.name} className={`directory-team directory-team-${key}`} hidden={!visible} aria-labelledby={`directory-team-${key}`}>
              <div className="directory-team-heading"><div><span className="directory-team-number mono">{team.number}</span><h4 id={`directory-team-${key}`}>{team.name}</h4></div><p>{team.description}</p></div>
              <div className="directory-agent-list">{teamAgents.map(agent=>{
                const index=agents.indexOf(agent);
                return <article id={agentFragment(agent.name)} key={agent.name} className={`directory-agent ${agent.featured?'directory-agent-featured':''}`} hidden={!matches(agent)} data-agent-name={agent.name}>
                  <span className="directory-agent-number mono" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
                  <div className="directory-agent-identity"><h5>{agent.name}</h5>{agent.featured&&<span className="directory-featured-label">Featured agent</span>}{agent.tools.length>0&&<div className="directory-agent-tools" aria-label="Example tools">{agent.tools.map(tool=><ToolBadge key={tool} name={tool}/>)}</div>}</div>
                  <div className="directory-agent-description"><p>{agent.description}</p>{agent.review&&<span className="directory-review-note" data-nosnippet="">Description for client review</span>}</div>
                  <a className="directory-deploy" href="#contact" onClick={()=>onChoose('AI agents',agent.name)} aria-label={`Deploy ${agent.name} — book a consultation`}><span>Deploy</span><ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true"/></a>
                </article>;
              })}</div>
            </section>;
          })}
          {count===0&&<div className="directory-empty"><span className="mono">NO MATCHES</span><h4>Try a different starting point.</h4><p>Search by task, agent name, or tool — or browse all twelve.</p><button type="button" onClick={reset}>Show all agents<ArrowRight size={17} aria-hidden="true"/></button></div>}
        </div>
      </div>
    </div>

    <div id="custom-agent-brief" className="directory-custom"><div><span className="directory-eyebrow mono">BUILT AROUND YOUR BUSINESS</span><h4>Different workflow?<br/><em>Make it yours.</em></h4></div><div><p>Custom agents built around your process, usually in two to four weeks.</p><a href="#contact" onClick={()=>onChoose('AI agents')}>Describe your workflow<span><ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true"/></span></a></div></div>

    <details className="directory-integrations"><summary><span>Works with the tools you already run</span><ChevronDown size={18} aria-hidden="true"/></summary><div>{toolNames.map(tool=><ToolBadge key={tool} name={tool}/>)}</div><p>Integration examples. Availability and access are confirmed during scoping. Tool names do not imply a partnership.</p></details>
  </section>;
}
