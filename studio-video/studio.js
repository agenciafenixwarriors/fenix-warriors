"use strict";
const $=(id)=>document.getElementById(id);
const defaults={
 recruitment:{headline:"Sua história pode brilhar.",subtitle:"Transforme talento em oportunidades com a Agência Fênix Warriors.",host:"AGÊNCIA FÊNIX WARRIORS",cta:"ENTRE PARA NOSSO TIME",kicker:"SEU PRÓXIMO CAPÍTULO"},
 event:{headline:"É hora do nosso grande desafio!",subtitle:"Acompanhe, participe e fortaleça a Família Fênix Warriors.",host:"FAMÍLIA FÊNIX WARRIORS",cta:"VENHA PARA A LIVE",kicker:"EVENTO ESPECIAL"},
 goals:{headline:"Cada conquista merece destaque.",subtitle:"Disciplina, horas e metas: juntos conquistamos novos resultados.",host:"AGÊNCIA FÊNIX WARRIORS",cta:"VAMOS MAIS LONGE",kicker:"RESULTADOS DO MÊS"},
 offer:{headline:"Sua marca merece voar mais alto.",subtitle:"Criatividade, atendimento e soluções para o seu negócio.",host:"FÊNIX VIDEO STUDIO",cta:"FALE COM A NOSSA EQUIPE",kicker:"APRESENTAÇÃO ESPECIAL"}
};
const fields=["template","format","headline","subtitle","host","cta","duration","theme"];
const imageState={background:"",logo:""};
window.fenixImages=imageState;
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const d=()=>Object.fromEntries(fields.map(k=>[k,$(k).value]));
const sizes={portrait:[1080,1920],square:[1080,1080],landscape:[1920,1080]};
function show(){
 const x=d(), canvas=$("canvas");
 canvas.className="canvas "+x.theme+" "+x.format;
 $("pHeadline").textContent=x.headline;
 $("pSubtitle").textContent=x.subtitle;
 $("pHost").textContent=x.host;
 $("pCta").textContent=x.cta;
 document.querySelector(".kicker").textContent=defaults[x.template].kicker;
 $("imageLayer").style.backgroundImage=imageState.background?'url("'+imageState.background+'")':"none";
 $("logoBadge").replaceChildren();
 if(imageState.logo){const i=document.createElement("img");i.src=imageState.logo;i.alt="Logomarca enviada";$("logoBadge").append(i);}
 else $("logoBadge").textContent="🐦‍🔥";
 $("dimensions").textContent=sizes[x.format].join(" × ");
 $("timing").textContent=x.duration+" segundos · 30 FPS";
}
function replay(){const c=$("canvas");c.classList.remove("playing");void c.offsetWidth;c.classList.add("playing");}
function triggerFile(name,content,type){const blob=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);}
function composition(){
 const x=d(),[width,height]=sizes[x.format],dur=+x.duration;
 const dark=x.theme==="dark",ink=dark?"#fff1e5":"#291a18",bg=dark?"linear-gradient(140deg,#181419,#471416 68%,#150e10)":"linear-gradient(150deg,#fff9e8,#e8d1ac 66%,#d2ab7b)";
 const accent=dark?"#e7b463":"#912124";
 const image=imageState.background?'<div class="clip" data-start="0" data-duration="'+dur+'" data-track-index="0" style="position:absolute;inset:0;background-image:url('+imageState.background+');background-size:cover;background-position:center;opacity:.28;"></div>':"";
 const logo=imageState.logo?'<img src="'+imageState.logo+'" alt="" style="height:90px;max-width:140px;object-fit:contain;vertical-align:middle">':'🐦‍🔥';
 const gap=Math.round(width*.07), titleSize=Math.round(width*(x.format==="landscape"?.056:.073));
 const h1=safe(x.headline),s1=safe(x.subtitle),h2=safe(x.host),cta=safe(x.cta);
 return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif}#root{position:relative;width:${width}px;height:${height}px;background:${bg};color:${ink};overflow:hidden} .clip{position:absolute}.footer{letter-spacing:3px;font-weight:800} .action{background:#8f1b22;color:white;border-radius:18px;text-align:center;padding:24px 32px;font-weight:900;letter-spacing:2px} .title{font-family:Georgia,serif;font-weight:900;line-height:1.12;overflow-wrap:anywhere} .sub{line-height:1.4} .bar{width:160px;height:9px;border-radius:10px;background:${accent};margin-top:36px;margin-bottom:36px}
</style></head><body>
<div id="root" data-composition-id="fenix-video" data-start="0" data-duration="${dur}" data-width="${width}" data-height="${height}" data-fps="30">
${image}
<div id="brand" class="clip footer" data-start="0" data-duration="${dur}" data-track-index="1" style="top:${gap}px;left:${gap}px;right:${gap}px;font-size:${Math.round(width*.023)}px">${logo} &nbsp; FÊNIX WARRIORS</div>
<div id="kicker" class="clip" data-start="1" data-duration="${dur-1}" data-track-index="2" style="top:${Math.round(height*.31)}px;left:${gap}px;right:${gap}px;color:${accent};letter-spacing:7px;font-size:${Math.round(width*.027)}px;font-weight:900">${safe(defaults[x.template].kicker)}</div>
<div id="headline" class="clip title" data-start="1.3" data-duration="${dur-1.3}" data-track-index="3" style="top:${Math.round(height*.36)}px;left:${gap}px;right:${gap}px;font-size:${titleSize}px">${h1}</div>
<div id="subtitle" class="clip sub" data-start="2.5" data-duration="${dur-2.5}" data-track-index="4" style="top:${Math.round(height*.62)}px;left:${gap}px;right:${gap}px;font-size:${Math.round(width*.034)}px"><div class="bar"></div>${s1}</div>
<div id="host" class="clip footer" data-start="0" data-duration="${dur}" data-track-index="5" style="bottom:${Math.round(height*.12)}px;left:${gap}px;right:${gap}px;font-size:${Math.round(width*.021)}px">${h2}</div>
<div id="cta" class="clip action" data-start="${Math.max(3,dur-4)}" data-duration="${Math.min(4,dur-3)}" data-track-index="6" style="bottom:${gap}px;left:${gap}px;right:${gap}px;font-size:${Math.round(width*.028)}px">${cta}</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"><\/script>
<script>const tl=gsap.timeline({paused:true});tl.from("#brand",{opacity:0,y:-40,duration:.7},0);tl.from("#kicker",{opacity:0,y:30,duration:.6},1);tl.from("#headline",{opacity:0,y:70,duration:.8},1.3);tl.from("#subtitle",{opacity:0,y:30,duration:.7},2.5);tl.from("#cta",{opacity:0,scale:.94,duration:.5},${Math.max(3,dur-4)});window.__timelines=window.__timelines||{};window.__timelines["fenix-video"]=tl;<\/script>
</body></html>`;
}
function save(){triggerFile("fenix-video-hyperframes.html",composition(),"text/html;charset=utf-8");}
function saveData(){triggerFile("fenix-video-dados.json",JSON.stringify({...d(),images:{background:imageState.background,logo:imageState.logo}},null,2),"application/json");}
function loadImage(input,key){const file=input.files?.[0];if(!file)return;const msg=$("uploadMessage");if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){msg.textContent="Use apenas PNG, JPG ou WebP com até 5 MB.";input.value="";return;}
 const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==="string"&&reader.result.startsWith("data:image/")){imageState[key]=reader.result;show();msg.textContent="Imagem carregada localmente.";}};reader.onerror=()=>msg.textContent="Não foi possível carregar a imagem.";reader.readAsDataURL(file);}
$("template").addEventListener("change",()=>{const x=defaults[$("template").value];for(const k of ["headline","subtitle","host","cta"])$(k).value=x[k];show();replay();});
for(const k of fields.filter(x=>x!=="template"))$(k).addEventListener("input",show);
$("background").addEventListener("change",e=>loadImage(e.target,"background"));
$("logo").addEventListener("change",e=>loadImage(e.target,"logo"));
$("downloadHtml").addEventListener("click",save);
$("downloadJson").addEventListener("click",saveData);
$("replay").addEventListener("click",replay);
$("reset").addEventListener("click",()=>{for(const k of fields){if(["template","format","duration","theme"].includes(k))$(k).value={template:"recruitment",format:"portrait",duration:"12",theme:"ivory"}[k];else $(k).value=defaults.recruitment[k];}imageState.background="";imageState.logo="";$("background").value="";$("logo").value="";$("uploadMessage").textContent="";show();replay();});
show();replay();