import {siteConfig} from '../../lib/site-config';
// Read-only bridge to the public booking service already used by nuvato.ai.
export async function GET(request: Request) {
  const type=new URL(request.url).searchParams.get('type') || 'MT-1';
  if(!['MT-1','MT-2'].includes(type)) return Response.json({ok:false,error:'Invalid meeting type.'},{status:400});
  try {
    const upstream=await fetch(`${siteConfig.bookingServiceOrigin}/api/availability?days=14&type=${type}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000),cache:'no-store'});
    const data=await upstream.json() as {ok?:boolean;days?:unknown[];timezone?:string};
    if(!upstream.ok||!data.ok||!Array.isArray(data.days)) return Response.json({ok:false,error:'The calendar is temporarily unavailable.'},{status:503});
    return Response.json({ok:true,days:data.days,timezone:data.timezone||'America/Chicago'},{headers:{'Cache-Control':'no-store'}});
  } catch {return Response.json({ok:false,error:'The calendar is temporarily unavailable.'},{status:503});}
}
