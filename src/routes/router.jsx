import { createBrowserRouter } from "react-router-dom";
import { useMemo, useState } from "react";
import { BarChart3, Bot, CalendarDays, CheckCircle2, ChevronRight, Flame, GraduationCap, LayoutDashboard, Megaphone, MessageSquare, Search, Settings, ShieldCheck, Sparkles, Target, Trophy, UserPlus, Users } from "lucide-react";

const stages=["Descoberto","Qualificado","Contatado","Respondeu","Interessado","Candidatura","Entrevista","Family","Desafio Fênix","Agency","Ativação","Performance"];
const leads=[
 {name:"Ana Creator",network:"TikTok",city:"São Paulo",score:94,stage:"Entrevista",niche:"Lifestyle",active:"Hoje"},
 {name:"Bia Music",network:"Instagram",city:"Vitória",score:89,stage:"Interessado",niche:"Música",active:"Hoje"},
 {name:"Carol Live",network:"Facebook",city:"Rio de Janeiro",score:82,stage:"Family",niche:"Entretenimento",active:"Ontem"},
 {name:"Dani Talks",network:"TikTok",city:"Belo Horizonte",score:78,stage:"Qualificado",niche:"Talk",active:"2 dias"},
];
const modules=[
 ["FÊNIX TALENT","Descoberta, seleção e contratação de novos talentos",UserPlus,"Talent Hunter ativo"],
 ["FÊNIX FAMILY","Comunidade, integração e descoberta de potencial",Users,"Porta de entrada"],
 ["FÊNIX ACADEMY","Formação, trilhas, cursos e certificações",GraduationCap,"Desenvolvimento"],
 ["FÊNIX AGENCY","Gestão profissional, metas e evolução de streamers",ShieldCheck,"Performance"],
 ["FÊNIX LIVE","Eventos internos, oficiais, desafios e competições",CalendarDays,"Engajamento"],
 ["FÊNIX AI","Copiloto de recrutamento e estratégias de crescimento",Bot,"Inteligência"],
];
const nav=[["Central",LayoutDashboard],["Talent Hunter",Search],["CRM",Users],["Campanhas",Megaphone],["Mensagens",MessageSquare],["Academy",GraduationCap],["Eventos",CalendarDays],["Performance",BarChart3],["Configurações",Settings]];

function App(){
 const [tab,setTab]=useState("Central"); const [query,setQuery]=useState(""); const [campaign,setCampaign]=useState(false);
 const filtered=useMemo(()=>leads.filter(x=>`${x.name} ${x.network} ${x.city} ${x.niche}`.toLowerCase().includes(query.toLowerCase())),[query]);
 return <div className="shell">
  <aside><div className="brand"><div className="crest">🔥</div><div><b>FÊNIX WARRIORS</b><span>NOVA ERA • OS 2.0</span></div></div>
   <nav>{nav.map(([n,I])=><button key={n} className={tab===n?"active":""} onClick={()=>setTab(n)}><I size={18}/>{n}</button>)}</nav>
   <div className="aside-foot"><Sparkles size={17}/><div><b>Fênix AI</b><small>Copiloto operacional online</small></div></div>
  </aside>
  <main><header><div><p>ECOSSISTEMA DE DESENVOLVIMENTO DE STREAMERS</p><h1>{tab}</h1></div><button className="primary" onClick={()=>setCampaign(true)}><Target size={18}/> Nova campanha</button></header>
   {tab==="Central"&&<>
    <section className="hero"><div><span className="eyebrow"><Flame size={14}/> A NOVA ERA COMEÇOU</span><h2>Não buscamos quantidade.<br/><em>Desenvolvemos performance.</em></h2><p>Descubra talentos, forme streamers, ative comunidades e transforme dados em crescimento sustentável.</p><div className="hero-actions"><button className="primary" onClick={()=>setTab("Talent Hunter")}>Buscar talentos <ChevronRight size={17}/></button><button className="ghost" onClick={()=>setTab("CRM")}>Abrir funil</button></div></div><div className="score"><span>FÊNIX SCORE</span><strong>87</strong><small>Média dos talentos prioritários</small></div></section>
    <section className="kpis">{[["Talentos encontrados","1.248","+18%"],["Qualificados","312","25%"],["Em processo","86","+14"],["Novos streamers","28","este mês"],["Ativos 30 dias","82%","retenção"]].map(x=><article key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></article>)}</section>
    <div className="section-title"><div><p>UM ECOSSISTEMA, UMA JORNADA</p><h3>Estrutura Fênix Warriors</h3></div></div><section className="modules">{modules.map(([n,d,I,s])=><article key={n}><div className="module-icon"><I/></div><small>{s}</small><h4>{n}</h4><p>{d}</p><button onClick={()=>setTab(n.includes("TALENT")?"Talent Hunter":n.includes("LIVE")?"Eventos":n.includes("AGENCY")?"Performance":n.includes("ACADEMY")?"Academy":"CRM")}>Acessar <ChevronRight size={15}/></button></article>)}</section>
   </>}
   {tab==="Talent Hunter"&&<><section className="page-intro"><div><p>PROSPECÇÃO INTELIGENTE</p><h2>Talent Hunter</h2><span>Defina o perfil profissional desejado e organize talentos descobertos por canais autorizados.</span></div><button className="primary" onClick={()=>setCampaign(true)}><UserPlus size={18}/> Criar busca</button></section><section className="filters"><input placeholder="Buscar nome, rede, cidade ou nicho..." value={query} onChange={e=>setQuery(e.target.value)}/><select><option>18+ • todas as faixas</option><option>18–24</option><option>25–34</option><option>35+</option></select><select><option>Brasil • todas regiões</option><option>Sudeste</option><option>Sul</option><option>Nordeste</option></select><select><option>Todos os nichos</option><option>Entretenimento</option><option>Música</option><option>Lifestyle</option></select></section><LeadTable data={filtered}/></>}
   {tab==="CRM"&&<><section className="page-intro"><div><p>PIPELINE COMPLETO</p><h2>Funil de talentos</h2><span>Da descoberta à performance: acompanhe cada avanço sem perder candidatos.</span></div></section><section className="pipeline">{stages.map((s,i)=><article key={s}><small>{String(i+1).padStart(2,"0")}</small><b>{s}</b><strong>{Math.max(2,42-i*3)}</strong></article>)}</section><LeadTable data={leads}/></>}
   {!['Central','Talent Hunter','CRM'].includes(tab)&&<Generic tab={tab}/>} 
  </main>
  {campaign&&<div className="modal-bg" onClick={()=>setCampaign(false)}><div className="modal" onClick={e=>e.stopPropagation()}><span className="eyebrow">NOVA CAMPANHA</span><h2>Expansão Fênix</h2><p>Crie uma busca de talentos 18+ baseada em critérios profissionais e canais autorizados.</p><label>Nome da campanha<input defaultValue="Expansão Fênix — Setembro"/></label><div className="grid2"><label>Região<select><option>Brasil</option><option>Sudeste</option><option>Sul</option><option>Nordeste</option></select></label><label>Faixa etária<select><option>18+</option><option>18–24</option><option>25–34</option><option>35+</option></select></label></div><label>Nichos<input defaultValue="Entretenimento, Música, Lifestyle"/></label><label>Objetivo<input defaultValue="Monetização e profissionalização em lives"/></label><div className="modal-actions"><button className="ghost" onClick={()=>setCampaign(false)}>Cancelar</button><button className="primary" onClick={()=>{setCampaign(false);setTab('Talent Hunter')}}>Criar campanha</button></div></div></div>}
 </div>
}
function LeadTable({data}){return <section className="table"><div className="tr head"><span>Talento</span><span>Origem</span><span>Local</span><span>Nicho</span><span>Score</span><span>Etapa</span></div>{data.map(x=><div className="tr" key={x.name}><span><b>{x.name}</b><small>Ativo: {x.active}</small></span><span>{x.network}</span><span>{x.city}</span><span>{x.niche}</span><span><i className="score-pill">{x.score}</i></span><span><i className="stage">{x.stage}</i></span></div>)}</section>}
function Generic({tab}){const map={Campanhas:[Megaphone,"Campanhas multicanal","Planeje aquisição, conteúdo, indicação e abordagens autorizadas em um só lugar."],Mensagens:[MessageSquare,"Central de comunicação","Templates, follow-ups, histórico e aprovações humanas por canal."],Academy:[GraduationCap,"Fênix Academy","Trilhas de formação, Desafio Fênix de 7 dias, avaliações e certificações."],Eventos:[Trophy,"Fênix Live","Agenda de eventos oficiais e internos, presença, desafios e ranking."],Performance:[BarChart3,"Performance","Atividade, metas, retenção, evolução e indicadores dos streamers."],Configurações:[Settings,"Administração","Usuários, recrutadores, permissões, integrações, Social Hub e regras do ecossistema."]};const [I,title,desc]=map[tab];return <section className="generic"><I size={46}/><p>MÓDULO FÊNIX OS</p><h2>{title}</h2><span>{desc}</span><div className="feature-grid">{["Visão executiva","Fluxos e automações","Permissões por função","Histórico e auditoria","Indicadores","Exportação de dados"].map(x=><div key={x}><CheckCircle2 size={18}/>{x}</div>)}</div></section>}
export default createBrowserRouter([{path:"*",element:<App/>}]);