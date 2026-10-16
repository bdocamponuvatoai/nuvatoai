"""Generate deterministic social art and favicon sizes using the original mark."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
import math
root=Path(__file__).resolve().parents[1]
brand=root/'public/brand'; tmp=root/'.sites-runtime/brand';tmp.mkdir(parents=True,exist_ok=True)
for name in ['sora','inter','ibm-plex-mono']:
 f=TTFont(root/f'public/fonts/{name}.woff2');f.flavor=None;f.save(tmp/f'{name}.ttf')
def font(size,name='inter'):return ImageFont.truetype(str(tmp/f'{name}.ttf'),size)
# Keep the original artwork intact; only crop its existing symbol and resize.
logo=Image.open(brand/'nuvato-logo.png').convert('RGBA')
# Icons use the transparent N mark with no background fill. The Apple touch icon is
# the exception: iOS paints transparent pixels black, so it sits on plain white.
mark_art=Image.open(brand/'nuvato-integration-mark.png').convert('RGBA')
mark_art=mark_art.crop(mark_art.getbbox())
def icon(size,background=None,fill=.92):
 canvas=Image.new('RGBA',(size,size),background or (0,0,0,0)); m=mark_art.copy()
 m.thumbnail((round(size*fill),round(size*fill)),Image.Resampling.LANCZOS)
 canvas.alpha_composite(m,((size-m.width)//2,(size-m.height)//2)); return canvas
for size in [16,32,192,512]:
 icon(size,fill=.94 if size<=32 else .86).save(brand/(f'favicon-{size}.png' if size<100 else f'icon-{size}.png'),optimize=True)
icon(180,'#FFFFFF',.72).convert('RGB').save(brand/'icon-180.png',optimize=True)
icon(48,fill=.94).save(root/'public/favicon.ico',sizes=[(16,16),(32,32),(48,48)])
w,h=1200,630
im=Image.new('RGB',(w,h));pix=im.load()
for y in range(h):
 for x in range(w):
  t=max(0,1-math.sqrt(((x-1180)/1250)**2+((y-630)/730)**2))**1.7
  pix[x,y]=tuple(round(a+(b-a)*t) for a,b in zip((10,18,48),(26,86,240)))
d=ImageDraw.Draw(im)
for n in range(3):d.ellipse((450-n*130,350-n*40,1500+n*130,980+n*40),outline=(57,89,162),width=1)
d.rounded_rectangle((45,38,245,111),12,fill='white')
thumb=logo.copy();thumb.thumbnail((174,56),Image.Resampling.LANCZOS);im.paste(thumb,(58,46),thumb)
d.text((48,150),'WEBSITES · AI · AUTOMATION · DOCUMENTATION · PLATFORMS',font=font(13,'ibm-plex-mono'),fill='#ADBFDF')
d.text((43,189),'We build the systems',font=font(53,'sora'),fill='white')
d.text((43,255),'your business',font=font(53,'sora'),fill='white')
d.text((439,255),'runs',font=font(53,'sora'),fill='#4D8BFF')
d.text((575,255),'on.',font=font(53,'sora'),fill='white')
d.text((48,344),'Five services. One accountable partner.',font=font(22),fill='#B9C9E7')
d.rounded_rectangle((48,402,281,456),12,fill='white');d.text((69,418),'Book a consultation',font=font(15),fill='#0A1230')
d.line((246,437,257,426),fill='#0A1230',width=2);d.line((248,426,257,426),fill='#0A1230',width=2);d.line((257,426,257,435),fill='#0A1230',width=2)
# Code-drawn Command Center crop; never presented as real operating metrics.
d.rounded_rectangle((710,182,1180,700),18,fill='#FFFFFF',outline='#D3DDEF',width=1)
d.line((710,238,1180,238),fill='#E2E9F5',width=1)
d.text((735,201),'Command Center',font=font(16),fill='#0A1230');d.text((1028,204),'ILLUSTRATIVE',font=font(11,'ibm-plex-mono'),fill='#56648A')
d.text((738,265),'Good systems.',font=font(23,'sora'),fill='#0A1230');d.text((738,298),'Quietly working.',font=font(23,'sora'),fill='#0A1230')
for i,(label,status) in enumerate([('Map process','Done'),('Build system','Running'),('Measure','Queued')]):
 x=736+i*142;d.rounded_rectangle((x,352,x+130,422),9,fill='#EEF3FB',outline='#D3DDEF');d.text((x+10,367),label,font=font(12),fill='#0A1230');d.text((x+10,393),status,font=font(10,'ibm-plex-mono'),fill='#1A56F0' if i==1 else '#56648A')
d.text((738,454),'ACTIVITY FEED',font=font(11,'ibm-plex-mono'),fill='#56648A')
for i,(time,label) in enumerate([('09:41:02','Synced 14 leads to CRM'),('09:41:05','Routed onboarding task'),('09:41:07','Sent 3 invoice reminders')]):
 y=484+i*52;d.text((738,y),time,font=font(11,'ibm-plex-mono'),fill='#7A87A6');d.text((822,y),label,font=font(12),fill='#0A1230');d.line((738,y+32,1154,y+32),fill='#E2E9F5')
d.text((48,570),'SCOPED FIRST · FIXED PRICE BEFORE WORK STARTS',font=font(12,'ibm-plex-mono'),fill='#9EB3DD')
im.save(brand/'nuvato-social.png',optimize=True)
print('Generated 1200×630 social image and 5 app icon sizes.')
