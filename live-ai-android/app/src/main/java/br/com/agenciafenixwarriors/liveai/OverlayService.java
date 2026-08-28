package br.com.agenciafenixwarriors.liveai;

import android.app.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.os.*;
import android.text.InputType;
import android.view.*;
import android.widget.*;
import java.util.concurrent.Executors;

public class OverlayService extends Service {
    private WindowManager wm;
    private View bubble;
    private View teleprompterView;
    private TextView advice, metrics;
    private LinearLayout controls;
    private int viewers=0,comments=0,followers=0,gifts=0,stars=0,pk=0;
    private long beans=0,goalBeans=0,startMs;
    private String script="",token="",userId="",bigoId="",sessionId=null;
    private final java.util.concurrent.ExecutorService io=Executors.newSingleThreadExecutor();
    private final SupabaseApi api=new SupabaseApi();
    private boolean compact=false;

    @Override public void onCreate(){
        super.onCreate(); createChannel(); startMs=SystemClock.elapsedRealtime();
        startForeground(4242,new Notification.Builder(this,"fenix_live_ai").setContentTitle("FÊNIX LIVE AI ativo").setContentText("Coach disponível sobre a BIGO").setSmallIcon(android.R.drawable.star_big_on).build());
    }

    @Override public int onStartCommand(Intent i,int flags,int startId){
        if(i!=null){
            goalBeans=i.getLongExtra("goalBeans",0); script=i.getStringExtra("script"); if(script==null)script="";
            token=nvl(i.getStringExtra("token")); userId=nvl(i.getStringExtra("userId")); bigoId=nvl(i.getStringExtra("bigoId")); api.setAccessToken(token);
        }
        if(bubble==null) showBubble();
        if(sessionId==null && !token.isEmpty() && !userId.isEmpty() && !bigoId.isEmpty()) io.execute(()->{ try{ sessionId=api.startSession(userId,bigoId,goalBeans); }catch(Exception ignored){} });
        return START_NOT_STICKY;
    }

    private String nvl(String s){ return s==null?"":s; }
    private int minutes(){ return (int)Math.max(0,(SystemClock.elapsedRealtime()-startMs)/60000L); }

    private void createChannel(){ if(Build.VERSION.SDK_INT>=26){ NotificationChannel c=new NotificationChannel("fenix_live_ai","FÊNIX LIVE AI",NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager.class).createNotificationChannel(c); } }
    private TextView t(String s,int sp){ TextView v=new TextView(this); v.setText(s); v.setTextColor(Color.WHITE); v.setTextSize(sp); v.setPadding(16,10,16,10); return v; }
    private Button b(String s){ Button v=new Button(this); v.setText(s); v.setAllCaps(false); return v; }

    private void showBubble(){
        wm=(WindowManager)getSystemService(WINDOW_SERVICE);
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setPadding(8,8,8,8);
        GradientDrawable bg=new GradientDrawable(); bg.setColor(0xF0111114); bg.setCornerRadius(30); bg.setStroke(2,0xFFE24A2A); box.setBackground(bg);
        TextView head=t("🐦‍🔥 FÊNIX LIVE AI",18); box.addView(head);
        metrics=t("Sessão iniciada",13); box.addView(metrics);
        advice=t("Toque em COACH. Atualize os dados quando houver mudança importante.",14); box.addView(advice);
        controls=new LinearLayout(this); controls.setOrientation(LinearLayout.VERTICAL); box.addView(controls);

        Button coach=b("🧠 COACH AGORA"), data=b("📊 Atualizar dados"), gift=b("🎁 + Presente"), star=b("⭐ + Star"), pkb=b("⚔️ + PK"), tele=b("📝 Teleprompter"), mini=b("— Minimizar"), close=b("Encerrar Coach");
        controls.addView(coach); controls.addView(data); controls.addView(gift); controls.addView(star); controls.addView(pkb); controls.addView(tele); controls.addView(mini); controls.addView(close);

        coach.setOnClickListener(v->{ refreshCoach(); saveSnapshot(); });
        data.setOnClickListener(v->showDataDialog());
        gift.setOnClickListener(v->{ gifts++; showNumberDialog("Beans deste presente",value->{ beans+=value; refreshCoach(); saveSnapshot(); }); });
        star.setOnClickListener(v->{ stars++; refreshCoach(); saveSnapshot(); });
        pkb.setOnClickListener(v->{ pk++; refreshCoach(); saveSnapshot(); });
        tele.setOnClickListener(v->toggleTeleprompter());
        mini.setOnClickListener(v->{ compact=!compact; controls.setVisibility(compact?View.GONE:View.VISIBLE); advice.setVisibility(compact?View.GONE:View.VISIBLE); metrics.setVisibility(compact?View.GONE:View.VISIBLE); head.setText(compact?"🐦‍🔥 FÊNIX":"🐦‍🔥 FÊNIX LIVE AI"); });
        close.setOnClickListener(v->stopSelf());

        int type=Build.VERSION.SDK_INT>=26?WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY:WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams lp=new WindowManager.LayoutParams(460,-2,type,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,PixelFormat.TRANSLUCENT);
        lp.gravity=Gravity.TOP|Gravity.END; lp.x=12; lp.y=180;
        head.setOnTouchListener(new View.OnTouchListener(){ float x,y; int ox,oy; public boolean onTouch(View v,MotionEvent e){ if(e.getAction()==MotionEvent.ACTION_DOWN){x=e.getRawX();y=e.getRawY();ox=lp.x;oy=lp.y;return true;} if(e.getAction()==MotionEvent.ACTION_MOVE){lp.x=ox-(int)(e.getRawX()-x);lp.y=oy+(int)(e.getRawY()-y);wm.updateViewLayout(box,lp);return true;} if(e.getAction()==MotionEvent.ACTION_UP){ if(Math.abs(e.getRawX()-x)<12&&Math.abs(e.getRawY()-y)<12){ compact=!compact; controls.setVisibility(compact?View.GONE:View.VISIBLE); advice.setVisibility(compact?View.GONE:View.VISIBLE); metrics.setVisibility(compact?View.GONE:View.VISIBLE); head.setText(compact?"🐦‍🔥 FÊNIX":"🐦‍🔥 FÊNIX LIVE AI"); } return true;} return false; }});
        bubble=box; wm.addView(bubble,lp); refreshCoach();
    }

    private void refreshCoach(){
        int m=minutes(); int sc=CoachEngine.score(m,viewers,beans,comments,followers,gifts);
        String goal=goalBeans>0?" • Meta "+beans+"/"+goalBeans+" Beans":" • "+beans+" Beans";
        metrics.setText("⏱ "+m+" min • 👥 "+viewers+" • 💬 "+comments+" • +"+followers+" seguidores"+goal+" • ⭐ "+stars+" • ⚔️ "+pk);
        advice.setText("FÊNIX SCORE "+sc+"/100 • "+CoachEngine.scoreLabel(sc)+"\n"+CoachEngine.advise(m,viewers,beans,comments,followers,gifts,stars,pk,goalBeans));
    }

    private void showDataDialog(){
        final EditText v=new EditText(this),c=new EditText(this),f=new EditText(this),be=new EditText(this);
        v.setHint("Pessoas na sala"); c.setHint("Comentários acumulados"); f.setHint("Seguidores ganhos"); be.setHint("Beans acumulados");
        v.setInputType(InputType.TYPE_CLASS_NUMBER); c.setInputType(InputType.TYPE_CLASS_NUMBER); f.setInputType(InputType.TYPE_CLASS_NUMBER); be.setInputType(InputType.TYPE_CLASS_NUMBER);
        v.setText(String.valueOf(viewers)); c.setText(String.valueOf(comments)); f.setText(String.valueOf(followers)); be.setText(String.valueOf(beans));
        LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.VERTICAL); l.setPadding(30,10,30,0); l.addView(v);l.addView(c);l.addView(f);l.addView(be);
        AlertDialog d=new AlertDialog.Builder(this).setTitle("Atualizar desempenho").setView(l).setPositiveButton("Salvar",(x,w)->{ viewers=parseInt(v.getText().toString()); comments=parseInt(c.getText().toString()); followers=parseInt(f.getText().toString()); beans=parseLong(be.getText().toString()); refreshCoach(); saveSnapshot(); }).setNegativeButton("Cancelar",null).create();
        if(Build.VERSION.SDK_INT>=26)d.getWindow(); d.getWindow();
        d.getWindow();
        d.setOnShowListener(x->{}); d.getWindow();
        d.getWindow();
        d.show();
        if(Build.VERSION.SDK_INT>=26) d.getWindow().setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY); else d.getWindow().setType(WindowManager.LayoutParams.TYPE_PHONE);
    }

    private interface LongCallback{ void run(long value); }
    private void showNumberDialog(String title,LongCallback cb){
        EditText e=new EditText(this); e.setInputType(InputType.TYPE_CLASS_NUMBER); e.setHint("0");
        AlertDialog d=new AlertDialog.Builder(this).setTitle(title).setView(e).setPositiveButton("Adicionar",(x,w)->cb.run(parseLong(e.getText().toString()))).setNegativeButton("Cancelar",null).create();
        d.show(); if(Build.VERSION.SDK_INT>=26)d.getWindow().setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY); else d.getWindow().setType(WindowManager.LayoutParams.TYPE_PHONE);
    }

    private int parseInt(String s){ try{return Integer.parseInt(s.trim());}catch(Exception e){return 0;} }
    private long parseLong(String s){ try{return Long.parseLong(s.trim());}catch(Exception e){return 0;} }

    private void toggleTeleprompter(){
        if(teleprompterView!=null){ wm.removeView(teleprompterView); teleprompterView=null; return; }
        if(script.trim().isEmpty()){ Toast.makeText(this,"Defina o roteiro no app antes de iniciar a live.",Toast.LENGTH_LONG).show(); return; }
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setPadding(10,8,10,8);
        GradientDrawable bg=new GradientDrawable(); bg.setColor(0xDD000000); bg.setCornerRadius(24); bg.setStroke(2,0xFFFFB300); box.setBackground(bg);
        TextView h=t("📝 TELEPROMPTER • arraste para mover",14), body=t(script,20); box.addView(h); ScrollView sv=new ScrollView(this); sv.addView(body); box.addView(sv,new LinearLayout.LayoutParams(-1,280));
        Button close=b("Fechar teleprompter"); box.addView(close); close.setOnClickListener(v->toggleTeleprompter());
        int type=Build.VERSION.SDK_INT>=26?WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY:WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams lp=new WindowManager.LayoutParams(650,-2,type,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,PixelFormat.TRANSLUCENT); lp.gravity=Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL; lp.y=120;
        h.setOnTouchListener(new View.OnTouchListener(){float x,y;int ox,oy;public boolean onTouch(View v,MotionEvent e){if(e.getAction()==0){x=e.getRawX();y=e.getRawY();ox=lp.x;oy=lp.y;return true;}if(e.getAction()==2){lp.x=ox+(int)(e.getRawX()-x);lp.y=oy-(int)(e.getRawY()-y);wm.updateViewLayout(box,lp);return true;}return false;}});
        teleprompterView=box; wm.addView(box,lp);
    }

    private void saveSnapshot(){
        if(sessionId==null||userId.isEmpty()||token.isEmpty()) return;
        final int m=minutes(),v=viewers,c=comments,f=followers,g=gifts,s=stars,p=pk; final long be=beans; final String sid=sessionId;
        io.execute(()->{ try{ api.snapshot(sid,userId,m,v,be,c,f,g,s,p); }catch(Exception ignored){} });
    }

    @Override public void onDestroy(){
        if(bubble!=null&&wm!=null) try{wm.removeView(bubble);}catch(Exception ignored){}
        if(teleprompterView!=null&&wm!=null) try{wm.removeView(teleprompterView);}catch(Exception ignored){}
        if(sessionId!=null&&!token.isEmpty()){ final int sc=CoachEngine.score(minutes(),viewers,beans,comments,followers,gifts); final String sid=sessionId; io.execute(()->{try{api.finishSession(sid,beans,viewers,followers,gifts,stars,pk,sc);}catch(Exception ignored){}}); }
        super.onDestroy();
    }
    @Override public android.os.IBinder onBind(Intent i){ return null; }
}
