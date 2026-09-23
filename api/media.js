import sharp from "sharp";

const concepts = {
  "1": {kicker:"RECRUTAMENTO ABERTO",title:"SEU TALENTO\nMERECE PALCO",subtitle:"Faça lives com estrutura, orientação e comunidade.",cta:"CANDIDATE-SE À AGÊNCIA FÊNIX",variant:1},
  "2": {kicker:"JÁ FAZ LIVE?",title:"EVOLUA SUA\nPRESENÇA AO VIVO",subtitle:"Treinamento, apoio e estratégia para streamers brasileiros.",cta:"VENHA PARA A FÊNIX WARRIORS",variant:2},
  "3": {kicker:"COMEÇANDO AGORA?",title:"SUA PRIMEIRA LIVE\nPODE SER MAIS SEGURA",subtitle:"Aprenda funções, interação, PKs, Live House e boas práticas.",cta:"ENTRE PARA O TIME",variant:3},
  "4": {kicker:"FÊNIX EM AÇÃO",title:"LIVE É\nCOMUNIDADE",subtitle:"Eventos, apoio entre streamers e evolução live após live.",cta:"CONHEÇA A AGÊNCIA",variant:4},
  "5": {kicker:"STREAMER BRASIL",title:"TRANSFORME\nCONSISTÊNCIA EM EVOLUÇÃO",subtitle:"Planejamento, presença e acompanhamento fazem diferença.",cta:"FAÇA SUA CANDIDATURA",variant:5},
  "6": {kicker:"BIGO LIVE + FÊNIX",title:"ABRA A LIVE.\nMOSTRE QUEM VOCÊ É.",subtitle:"Conteúdo autêntico, interação e suporte para crescer como streamer.",cta:"QUERO SER HOST",variant:6},
  "7": {kicker:"HISTÓRIA FÊNIX",title:"DA PRIMEIRA LIVE\nÀ CONFIANÇA",subtitle:"Você não precisa começar sabendo tudo. Precisa começar e evoluir.",cta:"COMECE COM A FÊNIX",variant:7}
};

function esc(s=""){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function lines(s){return s.split("\n").map((x,i)=>`<tspan x="0" dy="${i?1.08:0}em">${esc(x)}</tspan>`).join("")}

function phoenix(cx,cy,scale){
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <path d="M0,-92 C22,-68 26,-44 10,-25 C42,-43 69,-42 96,-18 C64,-19 43,-5 28,18 C52,8 75,12 98,34 C64,28 38,39 18,62 C20,82 10,99 0,114 C-10,99 -20,82 -18,62 C-38,39 -64,28 -98,34 C-75,12 -52,8 -28,18 C-43,-5 -64,-19 -96,-18 C-69,-42 -42,-43 -10,-25 C-26,-44 -22,-68 0,-92Z" fill="#d8232a"/>
    <path d="M0,-58 C16,-35 15,-18 0,-2 C-15,-18 -16,-35 0,-58Z" fill="#f1b957"/>
    <path d="M0,-3 C15,18 12,38 0,57 C-12,38 -15,18 0,-3Z" fill="#f1b957"/>
  </g>`;
}

function background(w,h,v){
  const bands = v%2===0
    ? `<path d="M0 ${h*.73} C${w*.25} ${h*.58},${w*.62} ${h*.91},${w} ${h*.66} L${w} ${h} L0 ${h}Z" fill="#190b0d"/>`
    : `<circle cx="${w*.86}" cy="${h*.15}" r="${Math.min(w,h)*.33}" fill="#481216" opacity=".48"/>`;
  return `<rect width="${w}" height="${h}" fill="#09090b"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#280b0d"/><stop offset=".55" stop-color="#0c0c0e"/><stop offset="1" stop-color="#151016"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>${bands}
    <g opacity=".09">${Array.from({length:12},(_,i)=>`<line x1="${i*w/11}" y1="0" x2="${(i+3)*w/11}" y2="${h}" stroke="#fff" stroke-width="1"/>`).join("")}</g>`;
}

function regularSvg(c,w,h){
  const pad=w*.075, titleY=h*.31, fontTitle=Math.round(w*.078), fontBody=Math.round(w*.034);
  const visualX=w*.76, visualY=h*.33, scale=Math.min(w,h)/1080*1.18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(w,h,c.variant)}
  <style>
    .sans{font-family:Arial,Helvetica,sans-serif}.caps{letter-spacing:${Math.max(2,w*.006)}px}
  </style>
  ${phoenix(visualX,visualY,scale)}
  <g transform="translate(${pad} ${h*.105})">
   <rect width="${w*.31}" height="${h*.038}" rx="${h*.019}" fill="#d8232a"/>
   <text x="${w*.155}" y="${h*.027}" fill="white" font-size="${Math.round(w*.022)}" text-anchor="middle" font-weight="700" class="sans caps">${esc(c.kicker)}</text>
  </g>
  <g transform="translate(${pad} ${titleY})">
   <text fill="#fff" font-size="${fontTitle}" font-weight="900" class="sans" dominant-baseline="hanging">${lines(c.title)}</text>
  </g>
  <text x="${pad}" y="${h*.61}" fill="#d6d6d9" font-size="${fontBody}" font-weight="400" class="sans">
   <tspan x="${pad}" dy="0">${esc(c.subtitle.slice(0,44))}</tspan>
   <tspan x="${pad}" dy="1.35em">${esc(c.subtitle.slice(44))}</tspan>
  </text>
  <g transform="translate(${pad} ${h*.74})">
    <rect width="${w*.66}" height="${h*.075}" rx="${h*.018}" fill="#d9ad5b"/>
    <text x="${w*.33}" y="${h*.048}" fill="#09090b" font-size="${Math.round(w*.027)}" text-anchor="middle" font-weight="900" class="sans caps">${esc(c.cta)}</text>
  </g>
  <text x="${pad}" y="${h*.92}" fill="#fff" font-size="${Math.round(w*.027)}" font-weight="900" class="sans">FÊNIX WARRIORS</text>
  <text x="${w-pad}" y="${h*.92}" fill="#d9ad5b" font-size="${Math.round(w*.023)}" text-anchor="end" font-weight="700" class="sans">AGÊNCIA • BIGO LIVE</text>
  </svg>`;
}

function comicSvg(c,w,h){
  const pad=w*.055, gap=w*.025, pw=(w-pad*2-gap)/2, top=h*.12, ph=h*.55;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(w,h,7)}
  <style>.sans{font-family:Arial,Helvetica,sans-serif}</style>
  <text x="${pad}" y="${h*.075}" fill="#d9ad5b" font-size="${w*.035}" font-weight="800" class="sans">HISTÓRIA FÊNIX • RECRUTAMENTO</text>
  <g transform="translate(${pad} ${top})">
    <rect width="${pw}" height="${ph}" rx="24" fill="#15161a" stroke="#3b3d45" stroke-width="3"/>
    ${phoenix(pw*.5,ph*.35,Math.min(w,h)/1080*.75)}
    <rect x="${pw*.08}" y="${ph*.62}" width="${pw*.84}" height="${ph*.2}" rx="24" fill="#fff"/>
    <text x="${pw*.5}" y="${ph*.69}" fill="#111" font-size="${w*.032}" text-anchor="middle" font-weight="700" class="sans">“Será que eu consigo</text>
    <text x="${pw*.5}" y="${ph*.75}" fill="#111" font-size="${w*.032}" text-anchor="middle" font-weight="700" class="sans">fazer uma boa live?”</text>
  </g>
  <g transform="translate(${pad+pw+gap} ${top})">
    <rect width="${pw}" height="${ph}" rx="24" fill="#241014" stroke="#6d262b" stroke-width="3"/>
    <g transform="translate(${pw*.18} ${ph*.18})">
      <circle cx="${pw*.32}" cy="${ph*.22}" r="${pw*.12}" fill="#d9ad5b"/>
      <path d="M${pw*.18} ${ph*.62} Q${pw*.32} ${ph*.38} ${pw*.46} ${ph*.62}Z" fill="#d8232a"/>
    </g>
    <rect x="${pw*.08}" y="${ph*.62}" width="${pw*.84}" height="${ph*.2}" rx="24" fill="#fff"/>
    <text x="${pw*.5}" y="${ph*.69}" fill="#111" font-size="${w*.03}" text-anchor="middle" font-weight="700" class="sans">“Você aprende, pratica</text>
    <text x="${pw*.5}" y="${ph*.75}" fill="#111" font-size="${w*.03}" text-anchor="middle" font-weight="700" class="sans">e evolui live após live.”</text>
  </g>
  <text x="${pad}" y="${h*.75}" fill="#fff" font-size="${w*.058}" font-weight="900" class="sans">DA PRIMEIRA LIVE À CONFIANÇA</text>
  <text x="${pad}" y="${h*.81}" fill="#c9cbd0" font-size="${w*.03}" class="sans">Treinamento, comunidade e acompanhamento para streamers brasileiros.</text>
  <rect x="${pad}" y="${h*.86}" width="${w-pad*2}" height="${h*.075}" rx="22" fill="#d9ad5b"/>
  <text x="${w/2}" y="${h*.91}" fill="#09090b" font-size="${w*.03}" text-anchor="middle" font-weight="900" class="sans">COMECE COM A FÊNIX WARRIORS</text>
  </svg>`;
}

export default async function handler(req,res){
  try{
    const id=String(req.query.id||"1"),format=String(req.query.format||"feed");
    const c=concepts[id]||concepts["1"];
    const dims={square:[1080,1080],feed:[1080,1350],story:[1080,1920]}[format]||[1080,1350];
    const [w,h]=dims;
    const svg=id==="7"?comicSvg(c,w,h):regularSvg(c,w,h);
    const png=await sharp(Buffer.from(svg)).png({quality:92,compressionLevel:8}).toBuffer();
    res.setHeader("Content-Type","image/png");
    res.setHeader("Cache-Control","public, max-age=86400, s-maxage=86400");
    res.status(200).send(png);
  }catch(e){
    res.status(500).json({error:String(e?.message||e)});
  }
}