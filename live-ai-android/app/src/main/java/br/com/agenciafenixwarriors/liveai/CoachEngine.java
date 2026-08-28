package br.com.agenciafenixwarriors.liveai;

public final class CoachEngine {
    private CoachEngine() {}

    public static String advise(int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk){
        return advise(minutes,viewers,beans,comments,followers,gifts,stars,pk,0);
    }

    public static String advise(int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk,long goalBeans){
        double progress = goalBeans > 0 ? (beans * 100.0 / goalBeans) : 0;
        if(minutes < 8) return "ABERTURA: apresente a proposta da live, cumprimente quem entrar e faça uma pergunta simples. Primeiro retenção; presentes vêm depois.";
        if(viewers <= 3 && minutes >= 12) return "RECUPERAÇÃO: sala fria. Troque o assunto, chame pessoas pelo nome e faça uma dinâmica curta antes de falar de meta.";
        if(comments < Math.max(4, viewers)) return "ENGAJAMENTO: faça uma pergunta aberta, responda nominalmente e crie uma escolha A/B para estimular comentários.";
        if(followers == 0 && minutes >= 18) return "CONVERSÃO: explique em 15 segundos quem você é e dê um motivo concreto para seguir a conta. Depois volte ao conteúdo.";
        if(gifts == 0 && minutes >= 15) return "PRESENTES: lance uma meta curta, com motivo claro e prazo de 5–10 minutos. Evite repetir pedidos a cada minuto.";
        if(goalBeans > 0 && progress >= 80 && progress < 100) return "RETA FINAL: você passou de 80% da meta. Mostre o progresso, agradeça quem já participou e faça uma chamada única para concluir.";
        if(goalBeans > 0 && progress >= 100) return "META BATIDA: comemore, agradeça individualmente e mantenha o conteúdo. Não transforme a comemoração em novo pedido imediato.";
        if(gifts >= 3 && beans > 0) return "MOMENTO POSITIVO: presentes em sequência. Mantenha o ritmo, agradeça individualmente e espere antes de propor a próxima meta.";
        if(pk == 0 && minutes >= 30 && viewers >= 5) return "PK: há público para testar uma PK estratégica. Defina objetivo, duração e uma chamada simples antes de começar.";
        if(stars == 0 && minutes >= 35 && beans > 0) return "STARS: preserve retenção e sequência de interação. Evite trocar de dinâmica enquanto a sala estiver respondendo bem.";
        return "RITMO BOM: mantenha o assunto, alterne conversa e chamadas curtas de interação e revise a meta em alguns minutos.";
    }

    public static int score(int minutes,int viewers,long beans,int comments,int followers,int gifts){
        int s=25;
        s += Math.min(20, viewers*2);
        s += Math.min(20, comments);
        s += Math.min(12, followers*3);
        s += Math.min(13, gifts*2);
        if(beans>0) s+=10;
        if(minutes<5) s=Math.min(s,60);
        if(minutes>=20 && comments==0) s-=12;
        if(minutes>=20 && followers==0) s-=5;
        return Math.max(0,Math.min(100,s));
    }

    public static String scoreLabel(int score){
        if(score>=80) return "EM ALTA";
        if(score>=60) return "ESTÁVEL";
        if(score>=40) return "ATENÇÃO";
        return "RECUPERAÇÃO";
    }
}
