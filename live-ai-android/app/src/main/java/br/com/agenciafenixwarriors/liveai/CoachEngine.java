package br.com.agenciafenixwarriors.liveai;

public final class CoachEngine {
    private CoachEngine() {}
    public static String advise(int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk){
        if(minutes<8)return "ABERTURA: apresente a proposta da live, cumprimente quem chegar e faça uma pergunta simples. Evite começar pedindo presentes.";
        if(viewers<=3&&minutes>=12)return "RECUPERAÇÃO: a sala está fria. Troque o assunto, faça uma dinâmica curta e chame participantes pelo nome antes de falar em meta.";
        if(comments<Math.max(3,viewers))return "ENGAJAMENTO: faça uma pergunta aberta e responda nominalmente aos comentários.";
        if(gifts==0&&minutes>=15)return "PRESENTES: crie uma meta curta com motivo claro e prazo de 5–10 minutos. Agradeça cada apoio sem interromper o conteúdo.";
        if(gifts>=3&&beans>0)return "MOMENTO POSITIVO: os presentes começaram. Mantenha o ritmo, agradeça individualmente e só depois proponha a próxima meta.";
        if(followers==0&&minutes>=20)return "CONVERSÃO: explique em 15 segundos quem você é e por que vale a pena seguir. Depois volte ao conteúdo.";
        if(pk==0&&minutes>=30&&viewers>=5)return "PK: há público suficiente para testar uma PK estratégica. Defina objetivo e duração antes de iniciar.";
        if(stars==0&&minutes>=35&&beans>0)return "STARS: trabalhe retenção e sequência de presentes. Evite mudar de dinâmica enquanto a sala estiver respondendo bem.";
        return "RITMO BOM: preserve o assunto atual, faça chamadas curtas de interação e evite repetir pedidos. Revise a meta em 10 minutos.";
    }
    public static int score(int minutes,int viewers,long beans,int comments,int followers,int gifts){int s=35;s+=Math.min(20,viewers*2);s+=Math.min(15,comments);s+=Math.min(10,followers*2);s+=Math.min(10,gifts*2);if(beans>0)s+=10;if(minutes<5)s=Math.min(s,65);return Math.max(0,Math.min(100,s));}
}
