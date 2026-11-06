import json,re,sys,os
from pptx import Presentation
from pptx.util import Emu,Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from lxml import etree
PX=9525
OUT='out'
DECK=sys.argv[1]; DEST=sys.argv[2]
NS='xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
layout=json.load(open(OUT+'/layout.json'))
html=open('/root/2zer011-slide/decks/%s.html'%DECK,encoding='utf-8').read()
trans=re.findall(r'<section class="slide [^"]*" data-title="[^"]*" data-t="(\w+)"',html)
TR={'iris':'<p:circle/>','curtain':'<p:split orient="vert" dir="out"/>','drift':'<p:fade/>','diag':'<p:strips dir="rd"/>','warp':'<p:zoom dir="in"/>','blinds':'<p:blinds dir="horz"/>','book':'<p:cover dir="l"/>','slide':'<p:push dir="l"/>','fade':'<p:fade/>','zoom':'<p:zoom dir="in"/>','flip':'<p:split orient="vert" dir="out"/>','rise':'<p:push dir="u"/>','spin':'<p:wheel spokes="4"/>','blur':'<p:fade/>'}
# notes
notes={}
if len(sys.argv)>3 and os.path.exists(sys.argv[3]):
    t=open(sys.argv[3],encoding='utf-8').read()
    for m in re.finditer(r'\[SLIDE (\d+):[^\]]*\]([^\n]*)\n(.*?)(?=\n\[SLIDE |\n-{5,}|\n={5,}|\Z)',t,re.S):
        notes[int(m.group(1))]=(m.group(2)+' '+m.group(3)).strip()
class T:
    def __init__(s): s.i=2
    def n(s): s.i+=1; return s.i
def vis(t,sp,v='visible',delay=0):
    return '<p:set><p:cBhvr><p:cTn id="%d" dur="1" fill="hold"><p:stCondLst><p:cond delay="%d"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="%s"/></p:to></p:set>'%(t.n(),delay,sp,v)
def anim(t,sp,attr,v0,v1,dur):
    def val(v): return '<p:val><p:fltVal val="0"/></p:val>' if v=='0f' else '<p:val><p:strVal val="%s"/></p:val>'%v
    return '<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="%d" dur="%d" fill="hold"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl><p:attrNameLst><p:attrName>%s</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0">%s</p:tav><p:tav tm="100000">%s</p:tav></p:tavLst></p:anim>'%(t.n(),dur,sp,attr,val(v0),val(v1))
def aeff(t,sp,filt,dur,trans='in'):
    return '<p:animEffect transition="%s" filter="%s"><p:cBhvr><p:cTn id="%d" dur="%d"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr></p:animEffect>'%(trans,filt,t.n(),dur,sp)
def node(t,pid,cls,st,nt,delay,inner_fn,extra=''):
    i=t.n(); inner=inner_fn()
    return '<p:par><p:cTn id="%d" presetID="%d" presetClass="%s" presetSubtype="%d" fill="hold"%s nodeType="%s"><p:stCondLst><p:cond delay="%d"/></p:stCondLst><p:childTnLst>%s</p:childTnLst></p:cTn></p:par>'%(i,pid,cls,st,extra,nt,int(delay),inner)
def entr(t,sp,fx,nt,delay):
    if fx=='none': return ''
    if fx in('fade','float'): return node(t,10,'entr',0,nt,delay,lambda:vis(t,sp)+aeff(t,sp,'fade',700))
    if fx in('reveal','wipe','draw'):
        d={'reveal':900,'wipe':900,'draw':1800}[fx]
        return node(t,22,'entr',8,nt,delay,lambda:vis(t,sp)+aeff(t,sp,'wipe(left)',d))
    if fx in('zoom','swing','slam'):
        return node(t,53,'entr',16,nt,delay,lambda:vis(t,sp)+anim(t,sp,'ppt_w','0f','#ppt_w',600)+anim(t,sp,'ppt_h','0f','#ppt_h',600)+aeff(t,sp,'fade',600))
    return node(t,10,'entr',0,nt,delay,lambda:vis(t,sp)+aeff(t,sp,'fade',600))
def exit_(t,sp,delay):
    return node(t,10,'exit',0,'withEffect',delay,lambda:aeff(t,sp,'fade',300,'out')+vis(t,sp,'hidden',299))
def spin(t,sp,delay,rev,dur=60000):
    by=-21600000 if rev else 21600000
    return node(t,8,'emph',0,'withEffect',delay,lambda:'<p:animRot by="%d"><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl><p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>'%(by,t.n(),dur,sp),' repeatCount="indefinite"')
def motion(t,sp,delay,path,dur,cx,cy):
    return node(t,0,'path',0,'withEffect',delay,lambda:'<p:animMotion origin="layout" path="%s" pathEditMode="relative" rAng="0" ptsTypes="AA"><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr><p:rCtr x="%s" y="%s"/></p:animMotion>'%(path,t.n(),dur,sp,cx,cy),' repeatCount="indefinite"')
def group(t,effects,auto):
    o=t.n(); m=t.n()
    conds='<p:cond delay="indefinite"/>'+('<p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>' if auto else '')
    return '<p:par><p:cTn id="%d" fill="hold"><p:stCondLst>%s</p:stCondLst><p:childTnLst><p:par><p:cTn id="%d" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>%s</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'%(o,conds,m,effects)
def rgb(css):
    m=re.findall(r'[\d.]+',css); return RGBColor(int(float(m[0])),int(float(m[1])),int(float(m[2]))) if len(m)>=3 else RGBColor(120,120,120)
def alpha(shape_or_run_el,op):
    for c in shape_or_run_el.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr'):
        a=etree.SubElement(c,'{http://schemas.openxmlformats.org/drawingml/2006/main}alpha'); a.set('val',str(int(op*100000))); break
prs=Presentation(); prs.slide_width=Emu(1280*PX); prs.slide_height=Emu(720*PX)
blank=prs.slide_layouts[6]
for sl in layout:
    n=sl['n']; s=prs.slides.add_slide(blank); d=OUT+'/s%d/'%n
    def pic(f,x,y,w,h,name):
        p=s.shapes.add_picture(d+f,Emu(int(x*PX)),Emu(int(y*PX)),Emu(int(w*PX)),Emu(int(h*PX))); p.name=name; return p
    pic('bg.jpg',0,0,1280,720,'Nen')
    auto=[];clicks={};T_=T()
    # loops
    li=0
    for l in sl['loops']:
        li+=1
        if l['t']=='spin':
            c=l['clip']; f=l['file']
            if l.get('sq'):  # pad ảnh thành hình vuông quanh tâm quay
                from PIL import Image
                im=Image.open(d+f); k=im.width/c[2]; q=l['sq']
                cv=Image.new('RGBA',(max(1,round(q[2]*k)),max(1,round(q[3]*k))),(0,0,0,0)); cv.paste(im,(round((c[0]-q[0])*k),round((c[1]-q[1])*k)))
                f='sq_'+f; cv.save(d+f); c=q
            p=pic(f,*c,'Quay %d'%li); auto.append(('spin',p.shape_id,0,l['rev'],int(l.get('dur',60000))))
        elif l['t'] in('fall','rise'): continue  # shortcut: đốm rơi/chữ bay gây nhiễu + nặng, bỏ
        elif l['t']=='fall':
            x,y,w,h=l['rect']; w=max(w,6);h=max(h,4)
            sh=s.shapes.add_shape(MSO_SHAPE.OVAL,Emu(int(x*PX)),Emu(int(-30*PX)),Emu(int(w*PX)),Emu(int(h*PX)))
            sh.fill.solid();sh.fill.fore_color.rgb=rgb(l['fill']);sh.line.fill.background();sh.name='Roi %d'%li
            alpha(sh._element.spPr,min(.8,l['op']+.15)); auto.append(('fall',sh.shape_id,(l['i']*1500)%9000,l['i']))
        elif l['t']=='rise':
            x,y,w,h=l['rect']
            tb=s.shapes.add_textbox(Emu(int(x*PX)),Emu(int(690*PX)),Emu(int((w+20)*PX)),Emu(int((h+10)*PX)))
            tf=tb.text_frame; tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0; tf.word_wrap=False
            r=tf.paragraphs[0].add_run(); r.text=l['txt']; r.font.size=Pt(max(10,l['size']*.75)); r.font.name='Georgia'; r.font.color.rgb=rgb(l['fill'])
            alpha(tb._element,min(.6,l['op']+.2)); tb.name='Bay %d'%li; auto.append(('rise',tb.shape_id,(l['i']*2300)%12000,l['i']))
    # units
    for u in sl['units']:
        if u.get('frames'):
            ids=[]
            for k,fr in enumerate(u['frames']):
                c=fr['clip']; p=pic(fr['file'],*c,'Khung %d'%k); ids.append(p.shape_id)
            t0=900
            for k,i in enumerate(ids):
                auto.append(('entr',i,t0+k*1100,'fade'))
                if k: auto.append(('exit',ids[k-1],t0+k*1100,None))
            continue
        c=u['clip']; p=pic(u['file'],*c,'Muc %d'%u['uid'])
        if u['step']==0: auto.append(('entr',p.shape_id,int(u['delay']*1000),u['fx']))
        else: clicks.setdefault(u['step'],[]).append((p.shape_id,u['off'],u['fx']))
    # timing
    groups=''
    t=T_
    if auto:
        eff=''
        for a in auto:
            if a[0]=='entr': eff+=entr(t,a[1],a[3],'withEffect',a[2])
            elif a[0]=='exit': eff+=exit_(t,a[1],a[2])
            elif a[0]=='spin': eff+=spin(t,a[1],a[2],a[3],a[4])
            elif a[0]=='fall': eff+=motion(t,a[1],a[2],'M 0 0 L %.3f 1.15 E'%(0.04+0.01*(a[3]%3)),9000+700*a[3],'0.02','0.575')
            elif a[0]=='rise': eff+=motion(t,a[1],a[2],'M 0 0 L 0 -0.85 E',12000+900*a[3],'0','-0.425')
        groups+=group(t,eff,True)
    for k in sorted(clicks):
        eff=''
        for j,(sp,off,fx) in enumerate(clicks[k]):
            nt='clickEffect' if j==0 else 'withEffect'
            eff+=entr(t,sp,fx if fx!='none' else 'fade',nt,off)
        groups+=group(t,eff,False)
    tr='<p:transition %s spd="slow">%s</p:transition>'%(NS,TR.get(trans[n-1],'<p:fade/>')) if n<=len(trans) else ''
    root=s._element
    if tr: root.append(etree.fromstring(tr))
    if groups:
        tm=('<p:timing %s><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>%s</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')%(NS,groups)
        root.append(etree.fromstring(tm))
    if n in notes: s.notes_slide.notes_text_frame.text=notes[n]
prs.save(DEST); print('saved',DEST,os.path.getsize(DEST)//1024,'KB')
