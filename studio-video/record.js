/* Fênix Video Studio: gravação direta no navegador e voz em áudio real.
   Não grava a tela/aba do usuário; renderiza somente o cartão da campanha. */
(()=>{
"use strict";
const el=id=>document.getElementById(id);
const chooseMime=(types)=>types.find(type=>MediaRecorder.isTypeSupported(type))||"";
const voiceModes=new Set(["none","mic","ai","file"]);
const state={audioBlob:null,audioObjectUrl:null,videoObjectUrl:null,mic:null,micChunks:[],audioRecorder:null,working:false,ttsCache:null};
const setStatus=(s,kind="")=>{const x=el("recordStatus");x.textContent=s;x.dataset.state=kind;x.setAttribute("role","status");};
const setBusy=(busy)=>{state.working=busy;["recordVideo","generateVoice","startMic","stopMic","audioFile","voiceMode","voiceSelect"].forEach(id=>{const x=el(id); if(x)x.disabled=busy;});el("recordVideo").textContent=busy?"Preparando vídeo...":"🎬 Gravar vídeo pronto";};
const download=(blob,name)=>{const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);};
function clearVoice(){state.audioBlob=null;if(state.audioObjectUrl)URL.revokeObjectURL(state.audioObjectUrl);state.audioObjectUrl=null;el("voicePreview").removeAttribute("src");el("voicePreview").load();el("voicePreview").hidden=true;}
function putVoice(blob,reason){clearVoice();state.audioBlob=blob;state.audioObjectUrl=URL.createObjectURL(blob);el("voicePreview").src=state.audioObjectUrl;el("voicePreview").hidden=false;setStatus(reason,"success");}
function currentMode(){let m=el("voiceMode").value;return voiceModes.has(m)?m:"none";}
function toggleControls(){const m=currentMode();el("aiControls").hidden=m!=="ai";el("micControls").hidden=m!=="mic";el("fileControls").hidden=m!=="file";el("voicePreview").hidden=!state.audioBlob;clearVoice();setStatus(m==="none"?"O vídeo será gravado sem narração.":m==="mic"?"Toque em Gravar minha voz e depois em Parar.":m==="file"?"Selecione um áudio do aparelho.":"A voz em português será gerada no aparelho. Na primeira vez, é necessário baixar o modelo (~65 MB).");}
const noHtml=(str)=>String(str||"").trim();
async function generateVoice(){
 const txt=noHtml(el("narrationText").value);
 if(!txt){setStatus("Escreva primeiro o texto da narração.","error");return false;}
 if(txt.length>550){setStatus("Para esta versão, use até 550 caracteres na narração.","error");return false;}
 setStatus("Carregando voz brasileira. A primeira utilização pode levar um pouco mais de tempo...","loading");
 try{
   // Modelo Piper roda no navegador; produz Blob WAV, que também entra na gravação.
   if(!state.ttsCache){state.ttsCache=import("https://esm.sh/@diffusionstudio/vits-web@1.0.3?bundle").catch(e=>{state.ttsCache=null;throw e;});}
   const tts=await state.ttsCache;
   const voiceId=el("voiceSelect").value;
   const wav=await tts.predict({text:txt,voiceId},p=>{
      if(p&&p.total&&p.loaded){const percent=Math.min(100,Math.round(p.loaded*100/p.total));setStatus("Baixando modelo de voz: "+percent+"%","loading");}
   });
   if(!(wav instanceof Blob)||wav.size<100){throw Error("Arquivo de voz inválido");}
   putVoice(wav,"Narração gerada! Ouça abaixo ou grave o vídeo.");
   return true;
 }catch(err){console.error("TTS",err);setStatus("Não foi possível gerar a voz neste aparelho. Experimente gravar a voz pelo microfone ou enviar um áudio pronto.","error");return false;}
}
async function startMic(){
 if(!navigator.mediaDevices?.getUserMedia){setStatus("Seu navegador não permite o uso do microfone neste contexto.","error");return;}
 try{
   clearVoice();
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}});
   const mime=chooseMime(["audio/webm;codecs=opus","audio/mp4","audio/webm"]);
   const options=mime?{mimeType:mime}:undefined;
   const chunks=[];
   const rec=new MediaRecorder(stream,options);
   state.mic=stream;state.audioRecorder=rec;state.micChunks=chunks;
   rec.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data);};
   rec.onerror=()=>setStatus("Falha ao gravar o microfone.","error");
   rec.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      state.mic=null;state.audioRecorder=null;
      const blob=new Blob(chunks,{type:rec.mimeType||mime||"audio/webm"});
      if(blob.size>100)putVoice(blob,"Sua narração está gravada e será colocada no vídeo.");
      else setStatus("Não foi possível gravar o áudio. Tente novamente.","error");
      el("startMic").hidden=false;el("stopMic").hidden=true;
   };
   rec.start();
   el("startMic").hidden=true;el("stopMic").hidden=false;
   setStatus("🔴 Gravando sua voz. Fale normalmente e toque em Parar.","recording");
 }catch(err){setStatus(err.name==="NotAllowedError"?"É necessário permitir o uso do microfone.":"Não foi possível acessar o microfone.","error");}
}
function stopMic(){if(state.audioRecorder&&state.audioRecorder.state!=="inactive")state.audioRecorder.stop();}
async function getAudioBuffer(audioCtx){
 if(!state.audioBlob)return null;
 const bytes=await state.audioBlob.arrayBuffer();
 try{return await audioCtx.decodeAudioData(bytes.slice(0));}
 catch(err){setStatus("Áudio incompatível com este navegador. Tente gravar novamente ou enviar WAV/MP3.","error");throw err;}
}
const loadImage=(data)=>new Promise(resolve=>{if(!data)return resolve(null);const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=data;});
const wrap=(ctx,text,maxW,maxLines=6)=>{
 const list=[], paragraphs=String(text||"").split(/\n/);
 for(const p of paragraphs){let line="";for(const w of p.split(/\s+/).filter(Boolean)){let probe=line?line+" "+w:w;if(ctx.measureText(probe).width>maxW&&line){list.push(line);line=w;}else line=probe;}if(line)list.push(line);}
 if(list.length>maxLines){let a=list.slice(0,maxLines);const end=a.length-1;while(a[end].length&&ctx.measureText(a[end]+"…").width>maxW)a[end]=a[end].slice(0,-1);a[end]+="…";return a;}
 return list;
};
function renderFactory(cfg,width,height,photo,logo,seconds){
 const c=document.createElement("canvas");c.width=width;c.height=height;
 const ctx=c.getContext("2d",{alpha:false});
 const border=Math.round(width*.08);
 const dark=cfg.theme==="dark",portrait=height>width,square=height===width;
 const light=dark?"#fff1e5":"#241915",accent=dark?"#e1b46e":"#8f1d20";
 const gradient=ctx.createLinearGradient(0,0,width,height);
 if(dark){gradient.addColorStop(0,"#130f12");gradient.addColorStop(.67,"#41141c");gradient.addColorStop(1,"#1b0f12");}
 else{gradient.addColorStop(0,"#fff9e9");gradient.addColorStop(.6,"#edd8b5");gradient.addColorStop(1,"#c99b65");}
 const paint=(time)=>{
 ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
 if(photo){const ratio=Math.max(width/photo.width,height/photo.height);const iw=photo.width*ratio,ih=photo.height*ratio;ctx.globalAlpha=dark?.33:.23;ctx.drawImage(photo,(width-iw)/2,(height-ih)/2,iw,ih);ctx.globalAlpha=1;}
 const glow=ctx.createRadialGradient(width*.6,height*.4,0,width*.6,height*.4,width*.95);glow.addColorStop(0,dark?"#6a2d2644":"#ffffff99");glow.addColorStop(1,"#ffffff00");ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 ctx.strokeStyle=accent;ctx.globalAlpha=.7;ctx.lineWidth=Math.max(3,width*.003);ctx.strokeRect(border*.4,border*.4,width-border*.8,height-border*.8);ctx.globalAlpha=1;
 const font=(size,weight="700",family="Arial")=>weight+" "+Math.round(size)+"px "+family;
 const ease=(delay,duration=.7)=>Math.max(0,Math.min(1,(time-delay)/duration));
 // Topo
 ctx.globalAlpha=ease(.1);
 if(logo){const lh=Math.round(width*.085);ctx.drawImage(logo,border,border,lh,lh);}
 else{ctx.font=font(width*.07);ctx.fillStyle=accent;ctx.fillText("✦",border,border+width*.075);}
 ctx.fillStyle=light;ctx.font=font(width*.032,"900");ctx.fillText("FÊNIX WARRIORS",border+width*.11,border+width*.067);
 // Conteúdo
 const baseY=portrait?height*.34:square?height*.31:height*.3;
 const maxW=width-border*2;
 ctx.globalAlpha=ease(.5);
 ctx.fillStyle=accent;ctx.font=font(width*.021,"900");ctx.fillText("AGÊNCIA • CRIATIVIDADE • CONQUISTAS",border,baseY-55*(width/720));
 let headSize=portrait?width*.074:(square?width*.067:width*.063);
 ctx.font=font(headSize,"900","Georgia");let heads=wrap(ctx,cfg.headline,maxW,4);
 while(heads.length>3 && headSize>width*.048){headSize*=.91;ctx.font=font(headSize,"900","Georgia");heads=wrap(ctx,cfg.headline,maxW,4);}
 ctx.fillStyle=light;const rowH=headSize*1.21;heads.forEach((line,i)=>ctx.fillText(line,border,baseY+rowH*i));
 let after=baseY+rowH*heads.length+width*.04;
 ctx.fillStyle=accent;ctx.fillRect(border,after,width*.21,Math.max(4,width*.006));after+=width*.077;
 ctx.globalAlpha=ease(1.3);
 const subSize=width*(portrait?.031:.028);
 ctx.fillStyle=light;ctx.font=font(subSize,"400");
 wrap(ctx,cfg.subtitle,maxW,portrait?5:3).forEach((line,i)=>ctx.fillText(line,border,after+subSize*1.35*i));
 // Rodapé
 ctx.globalAlpha=ease(2);
 ctx.fillStyle=light;ctx.font=font(width*.022,"800");
 ctx.fillText(String(cfg.host||"FÊNIX VIDEO STUDIO").slice(0,54),border,height-border-width*.11);
 ctx.fillStyle="#8f1d20";ctx.fillRect(border,height-border-width*.083,maxW,width*.07);
 ctx.fillStyle="#fff";ctx.font=font(width*.028,"900");
 const call=String(cfg.cta||"PARTICIPE").slice(0,65),textW=ctx.measureText(call).width;
 ctx.fillText(call,Math.max(border+9,(width-textW)/2),height-border-width*.034);
 ctx.globalAlpha=1;
 };
 return {canvas:c,paint};
}
function pickVideoType(audio){
 if(!window.MediaRecorder)return"";
 const types=audio?["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4","video/webm;codecs=vp8,opus","video/webm;codecs=vp9,opus","video/webm"]:["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp8","video/webm;codecs=vp9","video/webm"];
 return chooseMime(types);
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function recordVideo(){
 if(state.working)return;
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){setStatus("Este navegador não oferece gravação de vídeo. Abra no Chrome ou Safari atualizado.","error");return;}
 if(state.audioRecorder?.state==="recording"){setStatus("Primeiro toque em Parar para concluir sua gravação de voz.","error");return;}
 const mode=currentMode();
 setBusy(true);
 let audioCtx,source,canvasStream,recorder;
 try{
   if(mode==="ai"&&!state.audioBlob){const ok=await generateVoice();if(!ok)return;}
   if(mode!=="none"&&!state.audioBlob){setStatus("Primeiro grave, gere ou envie sua narração para incluí-la no vídeo.","error");return;}
   const cfg=Object.fromEntries(["format","theme","headline","subtitle","host","cta","duration"].map(id=>[id,el(id).value]));
   const dims={portrait:[720,1280],square:[720,720],landscape:[1280,720]};
   const [w,h]=dims[cfg.format]||dims.portrait;
   const photo=await loadImage(window.fenixImages?.background||"");
   const logo=await loadImage(window.fenixImages?.logo||"");
   audioCtx=new (window.AudioContext||window.webkitAudioContext)();
   await audioCtx.resume();
   const audio=mode!=="none"?await getAudioBuffer(audioCtx):null;
   const duration=Math.min(75,Math.max(Number(cfg.duration)||12,audio?Math.ceil(audio.duration+1):0));
   if(audio?.duration>73){setStatus("Narração muito longa para este modelo (máximo aproximado: 73 segundos).","error");return;}
   const {canvas,paint}=renderFactory(cfg,w,h,photo,logo,duration);
   const stream=canvas.captureStream(24);
   canvasStream=stream;
   const mix=new MediaStream(stream.getVideoTracks());
   let dst;
   if(audio){dst=audioCtx.createMediaStreamDestination();source=audioCtx.createBufferSource();source.buffer=audio;source.connect(dst);mix.addTrack(dst.stream.getAudioTracks()[0]);}
   const mime=pickVideoType(Boolean(audio)); if(!mime){setStatus("Este navegador não consegue salvar vídeos. Experimente o Chrome atualizado.","error");return;}
   const options={mimeType:mime,videoBitsPerSecond:2_000_000,audioBitsPerSecond:128_000};
   recorder=new MediaRecorder(mix,options);
   const blobs=[];
   let stopped;
   const done=new Promise((resolve,reject)=>{
     recorder.ondataavailable=e=>{if(e.data?.size)blobs.push(e.data);};
     recorder.onerror=()=>reject(new Error("O navegador interrompeu a gravação."));
     recorder.onstop=resolve;
   });
   el("downloadVideo").hidden=true;
   el("videoResult").hidden=true;
   setStatus("Gravando seu vídeo. Mantenha esta tela aberta.","recording");
   let started=performance.now(),frame=0;
   paint(0);recorder.start(1000);if(source)source.start();
   const tick=()=>{const t=Math.min(duration,(performance.now()-started)/1000);paint(t);frame++;};
   // Frame loop separado de requestAnimationFrame: não bloqueia renderização e progride com o tempo.
   const timer=setInterval(tick,1000/24);
   const countdown=setInterval(()=>setStatus("Gravando vídeo... "+Math.max(0,Math.ceil(duration-(performance.now()-started)/1000))+" segundos restantes","recording"),1000);
   const sleep=duration*1000;
   const startMark=Date.now();
   await delay(sleep);
   clearInterval(timer);
   clearInterval(countdown);
   paint(duration);
   if(recorder.state==="recording")recorder.stop();
   await done;
   const blob=new Blob(blobs,{type:recorder.mimeType||mime});
   if(blob.size<4000)throw Error("Arquivo de vídeo inválido.");
   if(state.videoObjectUrl)URL.revokeObjectURL(state.videoObjectUrl);
   state.videoObjectUrl=URL.createObjectURL(blob);
   const ext=blob.type.includes("mp4")?"mp4":"webm";
   const name="fenix-video-"+Date.now()+"."+ext;
   const player=el("videoResult");player.src=state.videoObjectUrl;player.hidden=false;player.load();
   const btn=el("downloadVideo");btn.hidden=false;btn.textContent="⬇ Salvar vídeo "+ext.toUpperCase();btn.onclick=()=>download(blob,name);
   setStatus(ext==="mp4"?"Vídeo MP4 pronto, com narração incluída. Toque em Salvar vídeo.":"Vídeo pronto, com narração incluída. Este navegador oferece WEBM; toque em Salvar vídeo.", "success");
 }catch(err){console.error("Record video",err);setStatus("Não foi possível gravar o vídeo: "+String(err?.message||"erro de compatibilidade")+". Tente Chrome atualizado.","error");}
 finally{
    if(recorder?.state==="recording"){try{recorder.stop();}catch(e){}}
    if(source){try{source.stop();}catch(e){}}
    canvasStream?.getTracks().forEach(t=>t.stop());
    if(audioCtx){try{await audioCtx.close();}catch(e){}}
    setBusy(false);
 }
}
el("voiceMode").addEventListener("change",toggleControls);
el("generateVoice").addEventListener("click",()=>{if(!state.working)generateVoice();});
el("startMic").addEventListener("click",startMic);
el("stopMic").addEventListener("click",stopMic);
el("recordVideo").addEventListener("click",recordVideo);
el("audioFile").addEventListener("change",ev=>{const file=ev.target.files?.[0];if(!file)return;if(file.size>15*1024*1024){setStatus("Áudio grande demais. Selecione até 15 MB.","error");return;}if(!file.type.startsWith("audio/")){setStatus("Selecione um arquivo de áudio (MP3, WAV, M4A ou WebM).","error");return;}putVoice(file,"Áudio carregado e pronto para o vídeo.");});
el("narrationText").addEventListener("input",()=>{if(currentMode()==="ai"&&state.audioBlob){clearVoice();setStatus("Texto alterado. Gere novamente a narração antes de gravar o vídeo.");}});
el("voiceSelect").addEventListener("change",()=>{if(currentMode()==="ai")clearVoice();});
const originalTemplate=el("template");originalTemplate.addEventListener("change",()=>{el("narrationText").value=[el("headline").value,el("subtitle").value,el("cta").value].join(". ");if(currentMode()==="ai")clearVoice();});
window.fenixRecorder={get mode(){return currentMode()},get hasVoice(){return!!state.audioBlob}};
toggleControls();
})();