package br.com.agenciafenixwarriors.liveai;

import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class SupabaseApi {
    private String accessToken;
    private static final String RECOVERY_REDIRECT = "fenixliveai://reset-password";

    public void setAccessToken(String token){ accessToken = token; }
    public String getAccessToken(){ return accessToken; }

    public JSONObject signIn(String email,String password) throws Exception {
        JSONObject body=new JSONObject().put("email",email).put("password",password);
        JSONObject out=new JSONObject(raw("POST","/auth/v1/token?grant_type=password",body.toString(),false,false));
        accessToken=out.getString("access_token");
        return out;
    }

    public void resetPassword(String email) throws Exception {
        String path="/auth/v1/recover?redirect_to="+URLEncoder.encode(RECOVERY_REDIRECT,"UTF-8");
        raw("POST",path,new JSONObject().put("email",email).toString(),false,false);
    }

    public void updatePassword(String newPassword) throws Exception {
        if(accessToken==null||accessToken.isEmpty()) throw new SecurityException("Sessão de recuperação inválida ou expirada.");
        raw("PUT","/auth/v1/user",new JSONObject().put("password",newPassword).toString(),true,false);
    }

    public JSONObject getMyProfile() throws Exception {
        JSONArray a=new JSONArray(raw("GET","/rest/v1/fp_profiles?select=user_id,full_name,bigo_id,member_type,status&limit=1",null,true,false));
        if(a.length()==0) throw new SecurityException("Usuário sem perfil Fênix autorizado.");
        JSONObject p=a.getJSONObject(0);
        if(!"ativo".equalsIgnoreCase(p.optString("status"))) throw new SecurityException("Acesso Fênix inativo.");
        return p;
    }

    public JSONArray getFeatureFlags() throws Exception {
        return new JSONArray(raw("GET","/rest/v1/flai_feature_flags?select=key,label,enabled,min_member_type&enabled=eq.true",null,true,false));
    }

    public String startSession(String userId,String bigoId,long goalBeans) throws Exception {
        JSONObject body=new JSONObject().put("user_id",userId).put("bigo_id",bigoId).put("goal_beans",goalBeans);
        JSONArray out=new JSONArray(raw("POST","/rest/v1/flai_live_sessions",body.toString(),true,true));
        return out.getJSONObject(0).getString("id");
    }

    public void snapshot(String sessionId,String userId,int minutes,int viewers,long beans,int comments,int followers,int gifts,int stars,int pk) throws Exception {
        JSONObject body=new JSONObject().put("session_id",sessionId).put("user_id",userId)
                .put("elapsed_minutes",minutes).put("viewers",viewers).put("beans_received",beans)
                .put("comments_count",comments).put("followers_gained",followers).put("gifts_count",gifts)
                .put("stars_opened",stars).put("pk_count",pk);
        raw("POST","/rest/v1/flai_live_snapshots",body.toString(),true,false);
    }

    public void finishSession(String sessionId,long beans,int viewers,int followers,int gifts,int stars,int pk,int score) throws Exception {
        JSONObject body=new JSONObject().put("status","ended").put("beans_received",beans).put("viewers",viewers)
                .put("followers_gained",followers).put("gifts_count",gifts).put("stars_opened",stars)
                .put("pk_count",pk).put("fenix_score",score).put("ended_at",new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX",java.util.Locale.US).format(new java.util.Date()));
        raw("PATCH","/rest/v1/flai_live_sessions?id=eq."+URLEncoder.encode(sessionId,"UTF-8"),body.toString(),true,false);
    }

    private String raw(String method,String path,String body,boolean auth,boolean representation) throws Exception {
        if(BuildConfig.SUPABASE_URL.length()==0 || BuildConfig.SUPABASE_KEY.length()==0) throw new IOException("Backend não configurado.");
        HttpURLConnection c=(HttpURLConnection)new URL(BuildConfig.SUPABASE_URL+path).openConnection();
        c.setRequestMethod(method); c.setConnectTimeout(12000); c.setReadTimeout(12000);
        c.setRequestProperty("apikey",BuildConfig.SUPABASE_KEY); c.setRequestProperty("Content-Type","application/json");
        if(representation) c.setRequestProperty("Prefer","return=representation");
        if(auth && accessToken!=null) c.setRequestProperty("Authorization","Bearer "+accessToken);
        if(body!=null){ c.setDoOutput(true); try(OutputStream os=c.getOutputStream()){ os.write(body.getBytes(StandardCharsets.UTF_8)); } }
        int code=c.getResponseCode(); InputStream in=code>=200&&code<300?c.getInputStream():c.getErrorStream();
        StringBuilder sb=new StringBuilder(); if(in!=null){ try(BufferedReader br=new BufferedReader(new InputStreamReader(in,StandardCharsets.UTF_8))){ String line; while((line=br.readLine())!=null) sb.append(line); } }
        if(code<200||code>=300) throw new IOException("HTTP "+code+": "+sb);
        return sb.toString();
    }
}
