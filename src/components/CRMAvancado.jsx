import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./CRMAvancado.css";

const TABS = ["Painel", "Hosts", "Recrutamento", "Agenda & PK", "Alertas", "Fechamento", "Importar"];
const STAGES = [
  {name:"Novos", keys:["descoberto","qualificado","candidatura"], write:"Qualificado"},
  {name:"Em contato", keys:["contatado","respondeu","interessado"], write:"Contatado"},
  {name:"Seleção", keys:["entrevista"], write:"Entrevista"},
  {name:"Treinamento", keys:["family","familia","desafio","challenge"], write:"Desafio Fênix"},
  {name:"Ativação", keys:["agency","agencia","ativacao","performance"], write:"Ativação"}
];
const DEFAULTS = {goal_reached:true,goal_risk:true,no_live_days:4,last_days:7,beans_milestone:10000,birthday:true};
const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"});
const formatNum=n=>Number(n||0).toLocaleString("pt-BR");
const fmtHours=n=>Number(n||0).toLocaleString("pt-BR",{maximumFractionDigits:1});
const asDay=d=>d?new Date(String(d).slice(0,10)+"T12:00:00").toLocaleDateString("pt-BR"):"—";
const val=n=>Number.isFinite(Number(n))?Number(n):0;
const dateIso=()=>new Date().toLocaleDateString("sv-SE",{timeZone:"America/Sao_Paulo"});
const month0=()=>dateIso().slice(0,7);
const monthPlus=m=>{const d=new Date(m+"-01T12:00:00");d.setMonth(d.getMonth()+1);return d.toISOString().slice(0,7);};
const dateFormat=s=>s?new Date(s).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo",dateStyle:"short",timeStyle:"short"}):"—";
function csvDownload(rows,name){
  const s=rows.map(r=>r.map(c=>'"'+String(c??"").replaceAll('"','""')+'"').join(";")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\ufeff"+s],{type:"text/csv;charset=utf-8;"}));
  const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function CRMAvancado({ sb, token, leads=[], events=[], onMoveStage, onNewLead, userId }){
  const [tab,setTab]=useState("Painel");
  const [month,setMonth]=useState(month0());
  const [daily,setDaily]=useState([]);
  const [meta,setMeta]=useState([]);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [q,setQ]=useState("");
  const [sort,setSort]=useState("beans");
  const [selected,setSelected]=useState(null);
  const [settings,setSettings]=useState(DEFAULTS);
  const [tasks,setTasks]=useState([]);
  const [draft,setDraft]=useState({title:"",category:"tarefa",due_at:"",bigo_id:"",detail:""});
  const [busy,setBusy]=useState(false);
  const [preview,setPreview]=useState(null);
  const [dragging,setDragging]=useState(null);
  const [currentDay,setCurrentDay]=useState(dateIso());
  const start=month+"-01";
  const next=monthPlus(month)+"-01";
  const today=dateIso();
  const target=44;

  useEffect(()=>{
    let alive=true;setLoading(true);setMsg("");
    Promise.allSettled([
      sb("/rest/v1/fw_crm_host_monthly?select=*&month_start=eq."+start+"&order=beans.desc&limit=1000",{token}),
      sb("/rest/v1/fenix_metas_metrics?select=bigo_id,host_name,beans,report_start,report_end&report_start=gte."+start+"&report_start=lt."+next+"&order=report_end.desc&limit=1000",{token})
    ]).then(results=>{
      if(!alive)return;
      const a=results[0],b=results[1];
      setDaily(a.status==="fulfilled"?(a.value||[]):[]);
      setMeta(b.status==="fulfilled"?(b.value||[]):[]);
      if(a.status==="rejected"&&b.status==="rejected")setMsg("Sem acesso às fontes de produção. Confirme seu perfil administrativo e as permissões da conta.");
      else if(a.status==="rejected"||b.status==="rejected")setMsg("Uma das fontes não está acessível. Os resultados mostram somente os registros autorizados disponíveis.");
      setLoading(false);
    });
    return()=>{alive=false};
  },[month,token,sb,start,next]);

  useEffect(()=>{
    if(!userId)return;
    Promise.allSettled([
      sb("/rest/v1/fw_crm_tasks?select=*&order=due_at.asc&limit=200",{token}),
      sb("/rest/v1/fw_crm_alert_settings?select=settings&user_id=eq."+encodeURIComponent(userId),{token})
    ]).then(res=>{
      if(res[0].status==="fulfilled")setTasks(res[0].value||[]);
      if(res[1].status==="fulfilled"&&res[1].value?.[0]?.settings)setSettings({...DEFAULTS,...res[1].value[0].settings});
    });
  },[sb,token,userId]);

  const hosts=useMemo(()=>{
    const map=new Map();
    daily.forEach(d=>{
      const id=String(d.bigo_id||"").toLowerCase();
      if(!id)return;
      map.set(id,{id,name:d.host_name||d.bigo_id,beans:val(d.beans),hours:val(d.live_hours),hasHours:true,last:d.data_atualizacao,lastLive:d.ultima_live,liveDays:val(d.dias_ativos),source:"Diário BIGO"});
    });
    meta.forEach(m=>{
      const id=String(m.bigo_id||"").toLowerCase();if(!id)return;
      const old=map.get(id);
      const isNewer=!old?.last||String(m.report_end||"")>String(old.last||"");
      if(!old)map.set(id,{id,name:m.host_name||m.bigo_id,beans:val(m.beans),hours:null,hasHours:false,last:m.report_end,lastLive:null,liveDays:null,source:"Metas BIGO"});
      else if(isNewer)map.set(id,{...old,name:m.host_name||old.name,beans:val(m.beans),last:m.report_end,source:"Metas BIGO"});
    });
    return [...map.values()];
  },[daily,meta]);
  const latest=hosts.reduce((d,h)=>String(h.last||"")>d?String(h.last):d,"");
  const hasHours=hosts.some(h=>h.hasHours);
  const daysInMonth=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();
  const elapsed=month===today.slice(0,7)?Number(today.slice(8)):month<today.slice(0,7)?daysInMonth:0;
  const remaining=Math.max(0,daysInMonth-elapsed);
  const actual=hosts.filter(h=>h.hasHours);
  const completed=actual.filter(h=>h.hours>=target);
  const alerts=useMemo(()=>{
    const list=[];
    hosts.forEach(h=>{
      if(!h.hasHours)return;
      const left=Math.max(0,target-h.hours);
      if(settings.goal_reached&&h.hours>=target)list.push({kind:"ok",host:h,text:"Meta de 44h concluída"});
      else if(settings.goal_risk&&month===today.slice(0,7)&&left>remaining*2)list.push({kind:"risk",host:h,text:"Ritmo de 2h/dia insuficiente; faltam "+fmtHours(left)+"h"});
      else if(Number(settings.last_days)>0&&remaining<=Number(settings.last_days)&&left>0)list.push({kind:"warn",host:h,text:"Faltam "+fmtHours(left)+"h; "+remaining+" dias no mês"});
      if(Number(settings.no_live_days)>0&&month===today.slice(0,7)&&h.lastLive){
        const diff=Math.floor((new Date(today+"T12:00:00")-new Date(h.lastLive+"T12:00:00"))/86400000);
        if(diff>=Number(settings.no_live_days))list.push({kind:"warn",host:h,text:"Sem live registrada há "+diff+" dias"});
      }
    });
    return list.filter(a=>a.kind!=="ok").slice(0,250);
  },[hosts,settings,month,today,remaining]);
  const filtered=useMemo(()=>hosts.filter(h=>(h.name+" "+h.id).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==="hours"?(val(b.hours)-val(a.hours)):val(b.beans)-val(a.beans)),[hosts,q,sort]);
  const totalBeans=hosts.reduce((s,h)=>s+h.beans,0);
  const totalHours=actual.reduce((s,h)=>s+h.hours,0);
  const pct=h=>h.hasHours?Math.min(100,Math.round(h.hours/target*100)):0;
  const stageFor=s=>STAGES.find(t=>t.keys.includes(String(s||"").toLowerCase()))?.name||"Novos";
  const nextTasks=tasks.filter(t=>!t.done_at);
  const actionsNeeded=alerts.length+nextTasks.filter(t=>t.due_at?.slice(0,10)<=today).length;

  async function updateSettings(key,value){
    const nextSettings={...settings,[key]:value};setSettings(nextSettings);
    if(!userId)return;
    try{await sb("/rest/v1/fw_crm_alert_settings?on_conflict=user_id",{method:"POST",token,prefer:"resolution=merge-duplicates,return=representation",body:{user_id:userId,settings:nextSettings,updated_at:new Date().toISOString()}})}
    catch(e){setMsg("Não foi possível salvar as preferências: "+e.message)}
  }
  async function addTask(e){
    e.preventDefault();if(!userId||!draft.title.trim()||!draft.due_at)return;
    setBusy(true);
    try{
      const rows=await sb("/rest/v1/fw_crm_tasks",{method:"POST",token,prefer:"return=representation",body:{...draft,user_id:userId,due_at:new Date(draft.due_at).toISOString(),bigo_id:draft.bigo_id||null,detail:draft.detail||null}});
      setTasks(t=>[...(rows||[]),...t].sort((a,b)=>a.due_at.localeCompare(b.due_at)));
      setDraft({title:"",category:"tarefa",due_at:"",bigo_id:"",detail:""});
    }catch(e){setMsg("Não foi possível salvar o agendamento: "+e.message)}finally{setBusy(false)}
  }
  async function finishTask(id){
    try{const rows=await sb("/rest/v1/fw_crm_tasks?id=eq."+encodeURIComponent(id),{method:"PATCH",token,prefer:"return=representation",body:{done_at:new Date().toISOString()}});
      setTasks(ts=>ts.map(t=>t.id===id?(rows?.[0]||{...t,done_at:new Date().toISOString()}):t));
    }catch(e){setMsg("Erro ao concluir tarefa: "+e.message)}
  }
  async function readExcel(e){
    const f=e.target.files?.[0];if(!f)return;
    try{
      const workbook=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true});
      const first=workbook.Sheets[workbook.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(first,{defval:"",raw:false});
      setPreview({name:f.name,headers:rows.length?Object.keys(rows[0]):[],rows:rows.slice(0,25),count:rows.length,sheets:workbook.SheetNames});
    }catch(err){setMsg("Arquivo não reconhecido: "+err.message)}
  }
  function exportMonth(){
    csvDownload([["BIGO ID","Nome","Mês","Beans","Horas","Meta 44h","Bonificação das horas","Fonte","Até"],
      ...filtered.map(h=>[h.id,h.name,month,h.beans,h.hasHours?fmtHours(h.hours):"Sem dado",h.hasHours?(h.hours>=44?"Batida":"Não concluída"):"Não verificável",h.hasHours?(h.hours>=44?"100%":h.hours>=20?"50%":"Não elegível por horas"):"Verificar",h.source,h.last])],"fenix-fechamento-"+month+".csv");
  }

  return <div className="fwcrm">
    <div className="fwcrm-top">
      <div><span className="fwcrm-eyebrow">FÊNIX WARRIORS • GESTÃO INTEGRADA</span><h2>CRM <em>Inteligente</em></h2><p>Recrutamento, produção, agenda, risco operacional e fechamento em um só painel.</p></div>
      <div className="fwcrm-month"><label>Competência</label><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/><small>Meta Fênix: 44h mensais</small></div>
    </div>
    <div className="fwcrm-tabs">{TABS.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {msg&&<div className="fwcrm-warning" role="status">{msg}</div>}
    <div className="fwcrm-fresh">Origem: {daily.length?"BIGO diário":""}{daily.length&&meta.length?" + ":""}{meta.length?"BIGO metas":""}{!daily.length&&!meta.length?"Nenhuma fonte disponível":""} · Última referência: <strong>{asDay(latest)}</strong>{latest&&latest<today&&<span className="fwcrm-stale">Dados históricos, não são métricas de hoje</span>}</div>
    {loading&&<p>Carregando registros autorizados…</p>}
    {tab==="Painel"&&<><div className="fwcrm-cards">
      {[["Hosts na base",formatNum(hosts.length),"Registros de "+month],["Beans acumulados",formatNum(totalBeans),"Fonte mais recente por host"],["Horas registradas",hasHours?fmtHours(totalHours)+" h":"Sem dados",hasHours?actual.length+" hosts com horas":"A fonte mais recente só informa Beans"],["Alertas e tarefas",formatNum(actionsNeeded),"Ações pendentes"]].map(x=><article key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong><span>{x[2]}</span></article>)}
    </div><div className="fwcrm-layout">
      <section className="fwcrm-panel"><div className="fwcrm-paneltitle"><h3>Ranking de produção</h3><button onClick={()=>setTab("Hosts")}>Ver todos</button></div>{filtered.slice(0,8).map((h,i)=><div className="fwcrm-hostline" key={h.id}><span className="fwcrm-rank">{i+1}</span><button className="fwcrm-name" onClick={()=>setSelected(h)}>{h.name}<small>{h.id}</small></button><b>{formatNum(h.beans)} Beans</b></div>)}{!hosts.length&&<p>Sem dados acessíveis para este mês.</p>}</section>
      <section className="fwcrm-panel"><div className="fwcrm-paneltitle"><h3>Prioridades</h3><button onClick={()=>setTab("Alertas")}>Configurar</button></div>{alerts.slice(0,8).map((a,i)=><div className="fwcrm-alert" key={i}><span className="fwcrm-dot"/><div><b>{a.host.name}</b><small>{a.text}</small></div></div>)}{!hasHours&&<p>Não há horas verificadas para calcular risco de 44h neste mês.</p>}{hasHours&&!alerts.length&&<p>Nenhum alerta calculado com as regras selecionadas.</p>}</section>
    </div></>}
    {tab==="Hosts"&&<section className="fwcrm-panel"><div className="fwcrm-paneltitle"><h3>Fichas dos hosts</h3><div className="fwcrm-actions"><input placeholder="Nome ou BIGO ID" value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="beans">Ordenar por Beans</option><option value="hours">Ordenar por horas</option></select></div></div>
      <div className="fwcrm-tablewrap"><table><thead><tr><th>Host</th><th>Beans</th><th>Horas</th><th>Meta</th><th>Referência</th></tr></thead><tbody>{filtered.map(h=><tr key={h.id} onClick={()=>setSelected(h)}><td><b>{h.name}</b><small>{h.id}</small></td><td>{formatNum(h.beans)}</td><td>{h.hasHours?fmtHours(h.hours)+"h":"Não informado"}</td><td><div className="fwcrm-bar"><span style={{width:pct(h)+"%"}}/></div><small>{h.hasHours?pct(h)+"%":"Sem medição"}</small></td><td>{asDay(h.last)}</td></tr>)}</tbody></table></div>
    </section>}
    {tab==="Recrutamento"&&<section className="fwcrm-panel"><div className="fwcrm-paneltitle"><div><h3>Funil visual de recrutamento</h3><p>Arraste uma candidata entre as colunas para atualizar o CRM já existente.</p></div><button onClick={onNewLead}>+ Nova candidata</button></div><div className="fwcrm-kanban">{STAGES.map(s=><div className="fwcrm-column" key={s.name} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const l=leads.find(x=>String(x.id)===dragging);if(l&&stageFor(l.estagio)!==s.name)onMoveStage(l,s.write);setDragging(null);}}><h4>{s.name} <small>{leads.filter(l=>stageFor(l.estagio)===s.name).length}</small></h4>{leads.filter(l=>stageFor(l.estagio)===s.name).map(l=><div className="fwcrm-lead" key={l.id} draggable onDragStart={()=>setDragging(String(l.id))} onDragEnd={()=>setDragging(null)}><b>{l.nome}</b><small>{l.origem||"Origem não informada"}</small>{l.proximo_followup_at&&<small>Retornar: {asDay(l.proximo_followup_at)}</small>}<select aria-label={"Etapa de "+l.nome} value={stageFor(l.estagio)} onChange={e=>onMoveStage(l,STAGES.find(s=>s.name===e.target.value).write)}>{STAGES.map(st=><option key={st.name}>{st.name}</option>)}</select></div>)}</div>)}</div><small>As etapas avançadas do funil Fênix (Família, Desafio e Agência) continuam preservadas no CRM original.</small></section>}
    {tab==="Agenda & PK"&&<div className="fwcrm-layout"><section className="fwcrm-panel"><h3>Agendar tarefa, PK ou treinamento</h3><form className="fwcrm-form" onSubmit={addTask}><label>Título<input required minLength={3} maxLength={200} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Ex.: confirmar PK com host"/></label><div className="fwcrm-pair"><label>Tipo<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option value="tarefa">Tarefa</option><option value="pk">PK</option><option value="followup">Contato</option><option value="treinamento">Treinamento</option><option value="evento">Evento</option></select></label><label>Data e horário<input type="datetime-local" required value={draft.due_at} onChange={e=>setDraft({...draft,due_at:e.target.value})}/></label></div><label>BIGO ID (opcional)<input value={draft.bigo_id} onChange={e=>setDraft({...draft,bigo_id:e.target.value})}/></label><label>Observações<textarea value={draft.detail} onChange={e=>setDraft({...draft,detail:e.target.value})}/></label><button className="fwcrm-primary" type="submit" disabled={busy||!userId}>{busy?"Salvando…":"Salvar no CRM"}</button>{!userId&&<small>Entre novamente com uma conta autenticada para criar tarefas.</small>}</form></section>
      <section className="fwcrm-panel"><h3>Próximos compromissos</h3><input type="date" value={currentDay} onChange={e=>setCurrentDay(e.target.value)}/>{nextTasks.filter(t=>t.due_at?.slice(0,10)>=currentDay).slice(0,30).map(t=><div className="fwcrm-appointment" key={t.id}><div><b>{t.title}</b><small>{dateFormat(t.due_at)} · {t.category}{t.bigo_id?" · "+t.bigo_id:""}</small></div><button onClick={()=>finishTask(t.id)}>Concluir</button></div>)}{events.filter(e=>e.starts_at?.slice(0,10)>=currentDay).slice(0,15).map(e=><div className="fwcrm-appointment" key={e.id}><div><b>{e.name}</b><small>{dateFormat(e.starts_at)} · Oficial: {e.official?"Sim":"Não"}</small></div></div>)}{!nextTasks.length&&!events.length&&<p>Não há compromissos registrados.</p>}<small>Eventos oficiais vêm do Fênix OS; tarefas pessoais ficam vinculadas à sua conta. Envios pelo WhatsApp ainda dependem da API oficial.</small></section></div>}
    {tab==="Alertas"&&<div className="fwcrm-layout"><section className="fwcrm-panel"><h3>Preferências de alertas</h3><div className="fwcrm-settings"><label><span>Meta de horas atingida</span><input type="checkbox" checked={!!settings.goal_reached} onChange={e=>updateSettings("goal_reached",e.target.checked)}/></label><label><span>Risco no ritmo de 2h/dia</span><input type="checkbox" checked={!!settings.goal_risk} onChange={e=>updateSettings("goal_risk",e.target.checked)}/></label><label><span>Sem live por quantos dias?</span><input type="number" min="0" max="30" value={settings.no_live_days} onChange={e=>updateSettings("no_live_days",Number(e.target.value))}/></label><label><span>Alertar a quantos dias do fim do mês?</span><input type="number" min="0" max="31" value={settings.last_days} onChange={e=>updateSettings("last_days",Number(e.target.value))}/></label><label><span>Marco de Beans</span><select value={settings.beans_milestone} onChange={e=>updateSettings("beans_milestone",Number(e.target.value))}>{[2000,5000,10000,20000,30000,60000,100000].map(n=><option key={n} value={n}>{formatNum(n)}</option>)}</select></label><label><span>Lembrar aniversários (quando cadastrados)</span><input type="checkbox" checked={!!settings.birthday} onChange={e=>updateSettings("birthday",e.target.checked)}/></label></div><small>Preferências salvas por usuário. Notificações push e mensagens automáticas só após ativação dos respectivos canais.</small></section><section className="fwcrm-panel"><h3>Alertas calculados ({alerts.length})</h3><div className="fwcrm-scroll">{alerts.slice(0,80).map((a,i)=><div className="fwcrm-alert" key={i}><span className="fwcrm-dot"/><div><b>{a.host.name}</b><small>{a.text}</small></div></div>)}{!alerts.length&&<p>Sem alertas calculáveis nesta competência.</p>}</div></section></div>}
    {tab==="Fechamento"&&<section className="fwcrm-panel"><div className="fwcrm-paneltitle"><div><h3>Fechamento mensal auditável</h3><p>Critério: 20h a menos de 44h = faixa de 50%; a partir de 44h = 100% da bonificação de horas, conforme política Fênix. Não calcula pagamento final.</p></div><button onClick={exportMonth}>Exportar CSV</button></div><div className="fwcrm-cards"><article><small>Hosts com horas verificadas</small><strong>{actual.length}</strong></article><article><small>44 horas concluídas</small><strong>{completed.length}</strong></article><article><small>Em faixa 20–43,99h</small><strong>{actual.filter(h=>h.hours>=20&&h.hours<44).length}</strong></article><article><small>Sem horas disponíveis</small><strong>{hosts.length-actual.length}</strong></article></div><div className="fwcrm-tablewrap"><table><thead><tr><th>Streamer</th><th>Beans</th><th>Horas</th><th>Situação de horas</th><th>Fonte</th></tr></thead><tbody>{filtered.map(h=><tr key={h.id}><td>{h.name}<small>{h.id}</small></td><td>{formatNum(h.beans)}</td><td>{h.hasHours?fmtHours(h.hours)+"h":"—"}</td><td>{!h.hasHours?"Sem registro de horas":h.hours>=44?"44h — 100%":h.hours>=20?"20h+ — faixa 50%":"Abaixo de 20h"}</td><td>{h.source} · {asDay(h.last)}</td></tr>)}</tbody></table></div><p className="fwcrm-note">Relatório gerencial. Pagamentos dependem de política contratual, metas de Beans, taxas de troca e validação financeira; não são aprovados automaticamente.</p></section>}
    {tab==="Importar"&&<section className="fwcrm-panel"><h3>Leitura inteligente de planilhas BIGO</h3><p>Abra um arquivo XLSX/XLS para conferir a estrutura antes da importação oficial. Os arquivos ficam no navegador e não são enviados automaticamente ao banco.</p><div className="fwcrm-upload"><input type="file" accept=".xlsx,.xls" onChange={readExcel}/></div>{preview&&<><div className="fwcrm-cards"><article><small>Arquivo</small><strong style={{fontSize:16}}>{preview.name}</strong></article><article><small>Linhas identificadas</small><strong>{preview.count}</strong></article><article><small>Abas</small><strong>{preview.sheets.length}</strong></article><article><small>Colunas</small><strong>{preview.headers.length}</strong></article></div><p><b>Colunas:</b> {preview.headers.join(" · ")}</p><div className="fwcrm-tablewrap"><table><thead><tr>{preview.headers.slice(0,8).map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{preview.rows.map((r,i)=><tr key={i}>{preview.headers.slice(0,8).map(x=><td key={x}>{String(r[x]??"")}</td>)}</tr>)}</tbody></table></div><p className="fwcrm-note">Prévia apenas. Para atualizar o painel oficial, utilize o processo autorizado de sincronização/importação BIGO e confirme a competência para evitar duplicações.</p></>}</section>}
    {selected&&<div className="fwcrm-overlay" role="presentation" onClick={()=>setSelected(null)}><div role="dialog" aria-modal="true" className="fwcrm-modal" onClick={e=>e.stopPropagation()}><button className="fwcrm-close" onClick={()=>setSelected(null)} aria-label="Fechar">×</button><small>FICHA OPERACIONAL</small><h2>{selected.name}</h2><p>{selected.id}</p><div className="fwcrm-cards"><article><small>Beans</small><strong>{formatNum(selected.beans)}</strong></article><article><small>Horas</small><strong>{selected.hasHours?fmtHours(selected.hours)+"h":"—"}</strong></article><article><small>Dias com live</small><strong>{selected.liveDays??"—"}</strong></article><article><small>Última live</small><strong style={{fontSize:18}}>{asDay(selected.lastLive)}</strong></article></div><p>Fonte: {selected.source}. Dados até {asDay(selected.last)}. Perfil baseado apenas em dados autorizados, sem estimativa financeira.</p><div className="fwcrm-bar"><span style={{width:pct(selected)+"%"}}/></div></div></div>}
  </div>;
}
