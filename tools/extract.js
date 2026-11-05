const {chromium}=require('playwright');const fs=require('fs');
const OUT=__dirname+'/out';fs.mkdirSync(OUT,{recursive:true});
const DECK=process.argv[2]||'lich-su-a1';
const FREEZE=`*,*:before,*:after{animation:none!important;transition:none!important}
#ui,#start,#hud{display:none!important}
[data-step]{visibility:visible!important;opacity:1!important}
.draw{stroke-dashoffset:0!important}.fill{fill-opacity:1!important}
body.iso *{visibility:hidden!important}
body.iso .u-on,body.iso .u-on *{visibility:visible!important}
body.iso .slide:before,body.iso .slide:after{display:none!important}
body.iso .slide,body.iso #stage,body.iso,html.iso{background:transparent!important}
body.bg .slide>*:not(.bgart):not(.glow){visibility:hidden!important}
body.bg .bgart .spin,body.bg .bgart .spinr,body.bg .bgart .rise,body.bg .bgart .fall,body.bg .bgart .float,body.bg .bgart .tw{visibility:hidden!important}`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const N=+process.argv[3]||18;const all=[];
for(let n=1;n<=N;n++){
 await p.goto('file:///root/2zer011-slide/decks/'+DECK+'.html#'+n);await p.reload();await p.click('#start');await p.waitForTimeout(3200);
 await p.addStyleTag({content:FREEZE});
 const info=await p.evaluate(()=>{
  var s=document.querySelector('.slide.cur');
  [].forEach.call(s.querySelectorAll('.count'),function(e){var to=parseFloat(e.getAttribute('data-to')),d=+e.getAttribute('data-dec')||0,t=to.toFixed(d).replace('.',',');t=t.replace(/\B(?=(\d{3})+(?!\d))/g,' ');e.innerHTML=t});
  var steps=[].slice.call(s.querySelectorAll('[data-step]')),units=[],uid=0;
  function cls(e){return e.getAttribute('class')||''}
  function fxOf(e,stp){
    var k=cls(e),m=k.match(/fx-(up|down|left|right|zoom|reveal|fade|swing|wipe|float)/),d=k.match(/(^|\s)d(\d)(\s|$)/);
    var D=[0,.2,.5,.8,1.1,1.5,2,2.6,3.3];var dl=d?D[+d[2]]:0;
    var hasDraw=e.querySelector&&e.querySelector('.draw'),hasFx=e.querySelector&&e.querySelector('[class*="fx-"]');
    if(m)return{fx:m[1],delay:stp?0:dl};
    if(hasDraw)return{fx:'draw',delay:stp?0:.3};
    if(hasFx)return{fx:'fade',delay:stp?0:.5};
    if(stp)return{fx:'pop',delay:0};
    if(e.tagName==='H2'||e.tagName==='H1')return{fx:'reveal',delay:.2};
    return{fx:'none',delay:0};
  }
  function add(e,stp,off){var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;e.setAttribute('data-uid',++uid);var f=fxOf(e,stp);units.push({uid:uid,step:stp,off:off||0,fx:f.fx,delay:f.delay,rect:[r.left,r.top,r.width,r.height],morph:!!(e.querySelector&&(e.querySelector('.morph')||e.querySelector('#nside')))||e.id==='nside'})}
  function walk(e,stp){[].forEach.call(e.children,function(c){
    var k=cls(c);if(/(^|\s)(bgart|glow)(\s|$)/.test(k))return;
    var st=c.hasAttribute('data-step')?steps.indexOf(c)+1:stp;
    if(/(^|\s)(pop)(\s|$)/.test(k)){var cs=[].slice.call(c.children),gap=cs.length>5?300:450;cs.forEach(function(x,i){add(x,st,i*gap)})}
    else if(/(^|\s)qgroup(\s|$)/.test(k)){[].forEach.call(c.children,function(x,i){add(x,st,i?350:0)})}
    else if(c.tagName==='DIV'&&/(^|\s)pad(\s|$)/.test(k))walk(c,st);
    else add(c,st,0)})}
  walk(s,0);
  // loops
  var loops=[];
  [].forEach.call(s.querySelectorAll('.bgart .spin,.bgart .spinr'),function(g){var r=g.getBoundingClientRect();g.setAttribute('data-uid','L'+(++uid));loops.push({t:'spin',uid:'L'+uid,rect:[r.left,r.top,r.width,r.height],rev:/spinr/.test(cls(g))})});
  [].forEach.call(s.querySelectorAll('.bgart .fall'),function(g,i){if(i>=7)return;var r=g.getBoundingClientRect(),cs=getComputedStyle(g);loops.push({t:'fall',rect:[r.left,r.top,r.width,r.height],fill:cs.fill,op:parseFloat(cs.fillOpacity)||.5,i:i})});
  [].forEach.call(s.querySelectorAll('.bgart .rise'),function(g,i){if(i>=6)return;var r=g.getBoundingClientRect(),cs=getComputedStyle(g);loops.push({t:'rise',rect:[r.left,r.top,r.width,r.height],txt:g.textContent,fill:cs.fill,op:parseFloat(cs.fillOpacity)||.25,size:parseFloat(cs.fontSize),i:i})});
  return{units:units,loops:loops,hasMorph:!!s.querySelector('.morph')};
 });
 const dir=OUT+'/s'+n;fs.mkdirSync(dir,{recursive:true});
 // background
 await p.evaluate(()=>document.body.classList.add('bg'));
 await p.screenshot({path:dir+'/bg.jpg',type:'jpeg',quality:88,clip:{x:0,y:0,width:1280,height:720}});
 await p.evaluate(()=>{document.body.classList.remove('bg');document.body.classList.add('iso');document.documentElement.classList.add('iso')});
 async function snap(uid,rect,file,pad){
  await p.evaluate(u=>{var e=document.querySelector('[data-uid="'+u+'"]');e.classList.add('u-on')},uid);
  let x=Math.max(0,rect[0]-pad),y=Math.max(0,rect[1]-pad),r=Math.min(1280,rect[0]+rect[2]+pad),bt=Math.min(720,rect[1]+rect[3]+pad);
  await p.screenshot({path:file,omitBackground:true,clip:{x:x,y:y,width:r-x,height:bt-y}});
  await p.evaluate(u=>{document.querySelector('[data-uid="'+u+'"]').classList.remove('u-on')},uid);
  return [x,y,r-x,bt-y];
 }
 for(const u of info.units){
  if(u.morph)continue;
  u.file='u'+u.uid+'.png';u.clip=await snap(u.uid,u.rect,dir+'/'+u.file,14);
 }
 for(const l of info.loops){ if(l.t==='spin'){l.file='l'+l.uid+'.png';l.clip=await snap(l.uid,l.rect,dir+'/'+l.file,2);} }
 // morph frames
 if(info.hasMorph){
  const ks=[6,12,24,48,96],vals=['3','3,1058','3,1326','3,1394','3,1410'];
  for(const u of info.units){ if(!u.morph)continue; u.frames=[];
   for(let fi=0;fi<ks.length;fi++){
    await p.evaluate(([k,v])=>{var m=document.querySelector('.morph'),pts=[];for(var i=0;i<k;i++){var a=2*Math.PI*i/k-Math.PI/2;pts.push((150*Math.cos(a)).toFixed(1)+','+(150*Math.sin(a)).toFixed(1))}m.setAttribute('points',pts.join(' '));document.getElementById('nside').innerHTML=k;document.getElementById('pival').innerHTML=v},[ks[fi],vals[fi]]);
    const f='m'+u.uid+'_'+fi+'.png';const c=await snap(u.uid,u.rect,dir+'/'+f,14);u.frames.push({file:f,clip:c});
   }}
 }
 await p.evaluate(()=>{document.body.classList.remove('iso');document.documentElement.classList.remove('iso')});
 all.push({n:n,units:info.units,loops:info.loops});
 console.log('slide',n,info.units.length,'units',info.loops.length,'loops');
}
fs.writeFileSync(OUT+'/layout.json',JSON.stringify(all));
console.log('errors',errs);await b.close();})();
