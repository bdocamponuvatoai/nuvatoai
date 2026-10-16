import {z} from 'zod';
import {bookingRateLimit} from '../../lib/rate-limit';
import {siteConfig} from '../../lib/site-config';
const bookingSchema=z.object({
 type:z.enum(['MT-1','MT-2']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
 name:z.string().trim().min(1).max(120),email:z.string().trim().email().max(254),company:z.string().trim().min(1).max(200),phone:z.literal('').optional().default(''),notes:z.string().max(4000).optional().default(''),website:z.string().max(200).optional().default(''),
});
const reply=(body:unknown,status=200,extra:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...extra}});
async function boundedBody(request:Request){const reader=request.body?.getReader();if(!reader)return '';let size=0;const parts:Uint8Array[]=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();throw new RangeError('Body too large');}parts.push(value);}const out=new Uint8Array(size);let pos=0;for(const p of parts){out.set(p,pos);pos+=p.byteLength;}return new TextDecoder().decode(out);}
/**
 * Same-origin check. Accepts the request URL's origin and the host the browser actually
 * addressed (Host / X-Forwarded-Host): behind Vercel or another proxy, request.url can carry
 * an internal host. Cross-site pages can't set these headers without a CORS preflight, which
 * this route never approves, and every request must also be JSON.
 */
function isSameOrigin(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||request.headers.get('sec-fetch-site')==='cross-site')return false;
 const url=new URL(request.url);
 const host=request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()||request.headers.get('host');
 const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()||url.protocol.replace(':','');
 return origin===url.origin||(!!host&&origin===`${protocol}://${host}`);
}
export function createBookingHandler(limit:typeof bookingRateLimit){return async function POST(request:Request){
 if(!isSameOrigin(request))return reply({ok:false,error:'Please book from this website.'},403);
 if(!request.headers.get('content-type')?.split(';')[0].trim().match(/^application\/json$/i))return reply({ok:false,error:'Invalid request format.'},415);
 let payload;try{payload=bookingSchema.parse(JSON.parse(await boundedBody(request)));}catch(e){return reply({ok:false,error:e instanceof RangeError?'Request is too large.':'Please check your name, email, company, and appointment details.'},e instanceof RangeError?413:400);}
 if(payload.website)return reply({ok:false,error:'Unable to process this request.'},400);
 try{const result=await limit(request,payload.email);if(!result.allowed)return reply({ok:false,error:'Too many booking attempts. Please wait and try again.'},429,{'Retry-After':String(result.retryAfter)});}catch{return reply({ok:false,error:'Booking is temporarily unavailable. Please try again later.'},503);}
 try{
  // Never automatically retry a write: a timed-out request may have created an appointment.
  // Forward an explicit allowlist of fields; the honeypot never leaves this Worker.
  const {type,date,time,name,email,company,phone,notes}=payload;
  const upstream=await fetch(`${siteConfig.bookingServiceOrigin}/api/bookings`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({type,date,time,name,email,company,phone,notes,host:'',hostEmail:''}),signal:AbortSignal.timeout(30000)});
  let data:{ok?:boolean;error?:string;meetLink?:string;eventId?:string};try{data=await upstream.json();}catch{return uncertain();}
  if(upstream.ok&&data.ok===true)return reply({ok:true,meetLink:data.meetLink||null,eventId:data.eventId||null});
  if(upstream.status>=500)return uncertain();
  if(upstream.status===429)return reply({ok:false,error:'The booking service is busy. Please wait a moment and try again.'},429);
  // Any other rejection is surfaced as a slot conflict so the visitor can pick a new time.
  return reply({ok:false,error:'This appointment could not be confirmed. Please choose another time.'},409);
 }catch{return uncertain();}
};}
function uncertain(){return reply({ok:false,uncertain:true,error:'We couldn’t verify your booking confirmation. Check your email before trying again to avoid booking twice.'},502);}
export const POST=createBookingHandler(bookingRateLimit);
