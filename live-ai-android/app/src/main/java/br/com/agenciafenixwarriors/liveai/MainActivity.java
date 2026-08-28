package br.com.agenciafenixwarriors.liveai;

import android.app.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.text.InputType;
import android.widget.*;
import org.json.*;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private final SupabaseApi api=new SupabaseApi();
    private final java.util.concurrent.ExecutorService io=Executors.newSingleThreadExecutor();
    private LinearLayout root;
    private JSONObject profile;
    private JSONArray featureFlags=new JSONArray();
    private EditText goalInput, scriptInput;

    @Override public void onCreate(Bundle b){ super.onCreate(b); if(!handleRecoveryIntent(getIntent())) showLogin(); }
    @Override protected void onNewIntent(Intent intent){ super.onNewIntent(intent); setIntent(intent); if(!handleRecoveryIntent(intent)) showLogin(); }

    private TextView text(String s,int sp){ TextView v=new TextView(this); v.setText(s); v.setTextColor(Color.WHITE); v.setTextSize(sp); v.setPadding(0,12,0,12); return v; }
    private EditText input(String hint,boolean pass){ EditText e=new EditText(this); e.setHint(hint); e.setTextColor(Color.WHITE); e.setHintTextColor(0xFF888888); e.setBackgroundColor(0xFF1A1A1E); e.setPadding(20,18,20,18); if(pass)e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,8,0,8); e.setLayoutParams(p); return e; }
    private Button button(String text){ Button b=new Button(this); b.setText(text); b.setAllCaps(false); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,7,0,7); b.setLayoutParams(p); return b; }
    private void base(){ root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setPadding(28,36,28,28); root.setBackgroundColor(0xFF0B0B0D); ScrollView s=new ScrollView(this); s.addView(root); setContentView(s); }

    private boolean handleRecoveryIntent(Intent intent){
        Uri data=intent==null?null:intent.getData();
        if(data==null || !"fenixliveai".equalsIgnoreCase(data.getScheme()) || !"reset-password".equalsIgnoreCase(data.getHost())) return false;
        String fragment=data.getFragment(); String token=null;
        if(fragment!=null){ for(String part:fragment.split("&")){ String[] kv=part.split("=",2); if(kv.length==2 && "access_token".equals(kv[0])){ try{ token=Uri.decode(kv[1]); }catch(Exception ignored){} } } }
        if(token==null||token.isEmpty()){ showRecoveryError("Link de recuperação inválido ou expirado."); return true; }
        api.setAccessToken(token); showSetPassword(); return true;
    }

    private void showRecoveryError(String message){ base(); root.addView(text("🐦‍🔥 FÊNIX LIVE AI",28)); root.addView(text(message,16)); Button back=button("Voltar ao login"); root.addView(back); back.setOnClickListener(v->showLogin()); }

    private void showSetPassword(){
        base(); root.addView(text("🐦‍🔥 Criar nova senha",28)); root.addView(text("Defina sua senha de acesso ao FÊNIX LIVE AI.",16));
        EditText p1=input("Nova senha",true),p2=input("Confirmar nova senha",true); root.addView(p1);root.addView(p2);
        Button save=button("Salvar nova senha"); root.addView(save); TextView status=text("",14); root.addView(status);
        save.setOnClickListener(v->{ String a=p1.getText().toString(),b=p2.getText().toString(); if(a.length()<8){status.setText("Use pelo menos 8 caracteres.");return;} if(!a.equals(b)){status.setText("As senhas não conferem.");return;} save.setEnabled(false);status.setText("Atualizando senha..."); io.execute(()->{ try{ api.updatePassword(a); runOnUiThread(()->{status.setText("Senha alterada com sucesso. Agora faça login."); Button go=button("Ir para o login");root.addView(go);go.setOnClickListener(x->{api.setAccessToken(null);showLogin();});}); }catch(Exception e){ runOnUiThread(()->{status.setText("Não foi possível alterar a senha. Solicite um novo link.");save.setEnabled(true);}); } }); });
    }

    private void showLogin(){
        base(); root.addView(text("🐦‍🔥 FÊNIX LIVE AI",30)); root.addView(text("Coach de performance exclusivo para usuários autorizados da Fênix.",15));
        EditText email=input("E-mail",false), pass=input("Senha",true); root.addView(email); root.addView(pass);
        Button login=button("Entrar"), recover=button("Esqueci minha senha"); root.addView(login); root.addView(recover); TextView status=text("",14); root.addView(status);
        login.setOnClickListener(v->{ String em=email.getText().toString().trim(),pw=pass.getText().toString(); if(em.isEmpty()||pw.isEmpty()){status.setText("Informe e-mail e senha.");return;} login.setEnabled(false);status.setText("Validando acesso e BIGO ID..."); io.execute(()->{ try{api.signIn(em,pw);profile=api.getMyProfile();featureFlags=api.getFeatureFlags();runOnUiThread(this::showDashboard);}catch(Exception e){runOnUiThread(()->{status.setText("Acesso negado. Verifique seus dados ou autorização da agência.\n"+friendly(e));login.setEnabled(true);});} }); });
        recover.setOnClickListener(v->{ String em=email.getText().toString().trim(); if(em.isEmpty()){status.setText("Digite seu e-mail acima para recuperar a senha.");return;} status.setText("Solicitando recuperação..."); io.execute(()->{ try{api.resetPassword(em);runOnUiThread(()->status.setText("Se o e-mail estiver cadastrado, as instruções foram enviadas."));}catch(Exception e){runOnUiThread(()->status.setText("Não foi possível solicitar agora. Tente novamente."));} }); });
    }

    private boolean enabled(String key){ for(int i=0;i<featureFlags.length();i++){ JSONObject o=featureFlags.optJSONObject(i); if(o!=null&&key.equals(o.optString("key"))) return o.optBoolean("enabled",false);} return false; }

    private void showDashboard(){
        base(); String name=profile.optString("full_name","Streamer"),bigo=profile.optString("bigo_id","-"); root.addView(text("FÊNIX LIVE AI",29)); root.addView(text("Olá, "+name+"  •  BIGO ID: "+bigo,15)); root.addView(text("Configure a sessão antes de abrir a BIGO.",16));
        goalInput=input("Meta desta live em Beans (ex.: 20000)",false); goalInput.setInputType(InputType.TYPE_CLASS_NUMBER); goalInput.setEnabled(enabled("goals"));
        scriptInput=input("Roteiro / teleprompter",false); scriptInput.setMinLines(5); scriptInput.setGravity(android.view.Gravity.TOP); scriptInput.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES); scriptInput.setEnabled(enabled("teleprompter"));
        android.content.SharedPreferences prefs=getSharedPreferences("fenix_live_ai",MODE_PRIVATE); goalInput.setText(prefs.getString("goal","")); scriptInput.setText(prefs.getString("script","")); root.addView(goalInput); root.addView(scriptInput);
        Button start=button("▶ INICIAR BIGO + FÊNIX COACH"),strategy=button("🧠 Simular estratégia"),overlay=button("⚙️ Autorizar botão flutuante"),logout=button("Sair"); start.setEnabled(enabled("overlay")&&enabled("live_coach"));strategy.setEnabled(enabled("live_coach"));overlay.setEnabled(enabled("overlay"));root.addView(start);root.addView(strategy);root.addView(overlay);root.addView(logout); TextView preview=text("O FÊNIX SCORE aparecerá durante a transmissão.",16); root.addView(preview);
        strategy.setOnClickListener(v->{int sc=CoachEngine.score(15,4,0,2,0,0);preview.setText("FÊNIX SCORE: "+sc+"/100 • "+CoachEngine.scoreLabel(sc)+"\n"+CoachEngine.advise(15,4,0,2,0,0,0,0,parseLong(goalInput.getText().toString())));}); overlay.setOnClickListener(v->requestOverlay()); start.setOnClickListener(v->startOverlayAndBigo()); logout.setOnClickListener(v->{api.setAccessToken(null);profile=null;featureFlags=new JSONArray();showLogin();});
    }

    private void requestOverlay(){ if(Settings.canDrawOverlays(this)){toast("Permissão de sobreposição já está ativa.");return;} startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,Uri.parse("package:"+getPackageName()))); }
    private void startOverlayAndBigo(){ if(!enabled("overlay")||!enabled("live_coach")){toast("Este recurso foi desativado pela administração.");return;} if(!Settings.canDrawOverlays(this)){requestOverlay();toast("Autorize 'Exibir sobre outros apps' e depois toque novamente em INICIAR.");return;} long goal=parseLong(goalInput.getText().toString());String script=scriptInput.getText().toString().trim();getSharedPreferences("fenix_live_ai",MODE_PRIVATE).edit().putString("goal",goalInput.getText().toString()).putString("script",script).apply(); Intent s=new Intent(this,OverlayService.class);s.putExtra("goalBeans",goal);s.putExtra("script",script);s.putExtra("token",api.getAccessToken());s.putExtra("userId",profile.optString("user_id"));s.putExtra("bigoId",profile.optString("bigo_id"));s.putExtra("feature_goals",enabled("goals"));s.putExtra("feature_teleprompter",enabled("teleprompter"));s.putExtra("feature_stars",enabled("stars"));s.putExtra("feature_pk",enabled("pk"));if(Build.VERSION.SDK_INT>=26)startForegroundService(s);else startService(s); Intent bigo=getPackageManager().getLaunchIntentForPackage("sg.bigo.live");if(bigo!=null){bigo.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);startActivity(bigo);}else toast("BIGO LIVE não encontrado neste aparelho."); }

    private long parseLong(String s){try{return Long.parseLong(s.trim());}catch(Exception e){return 0;}} private String friendly(Exception e){String m=e.getMessage();if(m==null)return "Erro de conexão.";if(m.length()>160)m=m.substring(0,160);return m;} private void toast(String s){Toast.makeText(this,s,Toast.LENGTH_LONG).show();}
}
