package br.com.agenciafenixwarriors.liveai;

public final class CoachEngine {
    private CoachEngine() {}

    public static String advise(int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk){ return advise(minutes,viewers,beans,comments,followers,gifts,stars,pk,0); }

    public static String advise(int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk,long goalBeans){
        double progress=goalBeans>0?(beans*100.0/goalBeans):0;
        if(minutes<8) return "ABERTURA • 3 passos agora:\n1) Cumprimente quem entrar pelo nome.\n2) Diga em 1 frase o que vai acontecer na live.\n3) Faça uma pergunta fácil que todos consigam responder.";
        if(viewers<=3&&minutes>=12) return "RECUPERAÇÃO • próximos 5 min:\n1) Pare de falar de meta.\n2) Troque para um assunto leve.\n3) Faça uma dinâmica A/B.\n4) Chame cada nova entrada pelo nome.";
        if(comments<Math.max(4,viewers)) return "ENGAJAMENTO • ação imediata:\nPergunte: 'Vocês preferem A ou B?' Leia as respostas pelo nome e faça uma segunda pergunta baseada nelas.";
        if(followers==0&&minutes>=18) return "SEGUIDORES • roteiro de 15 s:\n'Pra quem chegou agora: eu sou [nome], aqui tem [conteúdo]. Se curtir esse tipo de live, já me segue porque faço isso sempre.' Depois volte ao assunto.";
        if(gifts==0&&minutes>=15) return "PRESENTES • meta expressa:\nCrie uma meta de 5–10 min com objetivo claro. Ex.: 'Se fecharmos X Beans até o cronômetro zerar, eu faço [dinâmica].' Faça uma única chamada e continue entretendo.";
        if(goalBeans>0&&progress>=80&&progress<100) return "RETA FINAL • faltam "+Math.max(0,goalBeans-beans)+" Beans. Mostre o progresso, agradeça nominalmente e faça uma chamada única para concluir a meta.";
        if(goalBeans>0&&progress>=100) return "META BATIDA • comemore por 30–60 s, agradeça quem ajudou e volte ao conteúdo. Evite emendar imediatamente outra cobrança.";
        if(gifts>=3&&beans>0) return "MOMENTO FORTE • presentes em sequência. Não interrompa o clima. Agradeça individualmente, mantenha a conversa e só depois apresente nova meta.";
        if(pk==0&&minutes>=30&&viewers>=5) return "PK • bom momento para testar. Entre com objetivo definido, uma frase de mobilização e duração curta. Depois da PK, agradeça e recupere a conversa antes da próxima.";
        if(stars==0&&minutes>=35&&beans>0) return "STARS • mantenha retenção e consistência. Evite trocar de assunto quando comentários e presentes estiverem acontecendo. Trabalhe ciclos curtos de interação + agradecimento + conteúdo.";
        return "RITMO BOM • mantenha o tema por mais alguns minutos. Faça uma chamada curta de interação, responda pelo nome e só revise a meta depois.";
    }

    public static String tenMinutePlan(int minutes,int viewers,long beans,int comments,int followers,int gifts,long goal){
        String focus=score(minutes,viewers,beans,comments,followers,gifts)<50?"RECUPERAR A SALA":"CONVERTER O BOM MOMENTO";
        return "PLANO FÊNIX • 10 MIN • "+focus+"\n0–2 min: conversa + nomes.\n2–4 min: pergunta A/B.\n4–6 min: conte uma história curta ou faça uma dinâmica.\n6–8 min: chamada para seguir/compartilhar.\n8–10 min: se a sala respondeu bem, apresente uma meta curta de presentes.";
    }

    public static String dynamicIdea(int seed){
        String[] ideas={
            "DINÂMICA: escolha impossível. Dê duas opções engraçadas e peça que todos respondam A ou B no chat.",
            "DINÂMICA: verdade rápida. Cada pessoa comenta um tema e você conta uma história curta relacionada.",
            "DINÂMICA: desafio dos nomes. Cumprimente 5 pessoas pelo nome e faça uma pergunta diferente para cada uma.",
            "DINÂMICA: meta coletiva. Defina um objetivo de interação: 20 comentários em 2 minutos antes de qualquer pedido de presente.",
            "DINÂMICA: ranking da sala. Peça sugestões e monte um top 3 ao vivo com votação nos comentários."
        };
        return ideas[Math.abs(seed)%ideas.length];
    }

    public static String giftStrategy(long current,long goal){
        if(goal<=0) return "META EXPRESSA: escolha um valor pequeno e alcançável para 5–10 minutos. Explique o motivo, ofereça uma dinâmica quando concluir e não repita o pedido continuamente.";
        long remain=Math.max(0,goal-current); double p=current*100.0/goal;
        if(p>=100) return "Meta concluída. Comemore e preserve o momento antes de criar outra meta.";
        if(p>=70) return "Faltam "+remain+" Beans. Faça uma chamada única de reta final e mantenha o entretenimento.";
        return "Faltam "+remain+" Beans. Quebre em etapas menores. Trabalhe uma mini-meta de aproximadamente "+Math.max(100,remain/3)+" Beans e associe a uma dinâmica curta.";
    }

    public static String pkStrategy(int viewers,int pkCount){
        if(viewers<4) return "PK: adie por enquanto. Primeiro aumente interação na sala para não dispersar o pouco público atual.";
        return "PK #"+(pkCount+1)+": defina objetivo antes de entrar, avise a sala em 20 s, use chamadas curtas durante a disputa e reserve 2–3 min após a PK para agradecer e recuperar conversa.";
    }

    public static String starStrategy(int stars,int viewers,long beans){
        if(viewers<4) return "STARS: priorize retenção. Trabalhe conversa e comentários antes de mudar o foco da live.";
        if(beans==0) return "STARS: ainda sem sequência de presentes. Crie interação primeiro e depois uma meta curta; não force o pedido.";
        return "STARS: mantenha o padrão que está funcionando: conteúdo → interação → agradecimento → chamada curta. Evite mudanças bruscas enquanto a sala estiver respondendo.";
    }

    public static int score(int minutes,int viewers,long beans,int comments,int followers,int gifts){ int s=25; s+=Math.min(20,viewers*2); s+=Math.min(20,comments); s+=Math.min(12,followers*3); s+=Math.min(13,gifts*2); if(beans>0)s+=10; if(minutes<5)s=Math.min(s,60); if(minutes>=20&&comments==0)s-=12; if(minutes>=20&&followers==0)s-=5; return Math.max(0,Math.min(100,s)); }
    public static String scoreLabel(int score){ if(score>=80)return "EM ALTA"; if(score>=60)return "ESTÁVEL"; if(score>=40)return "ATENÇÃO"; return "RECUPERAÇÃO"; }
}
