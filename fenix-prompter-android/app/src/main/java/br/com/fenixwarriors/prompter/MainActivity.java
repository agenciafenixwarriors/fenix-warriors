package br.com.fenixwarriors.prompter;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends android.app.Activity {
    private static final String APP_URL = "https://knzuhcccujtwzlhbsbss.supabase.co/functions/v1/fenix-prompter";
    private WebView webView;
    private TextView overlayStatus;
    private boolean waitingOverlayPermission = false;
    private String pendingText = "Bem-vindo ao FÊNIX PROMPTER. Escolha ou crie um roteiro para iniciar.";

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        buildUi();
        loadPrompterHtml();
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.BLACK);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(10), dp(8), dp(10), dp(8));
        header.setBackgroundColor(0xFF0C0906);

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.fenix_logo);
        logo.setAdjustViewBounds(true);
        header.addView(logo, new LinearLayout.LayoutParams(dp(48), dp(48)));

        LinearLayout titles = new LinearLayout(this);
        titles.setOrientation(LinearLayout.VERTICAL);
        titles.setPadding(dp(8),0,0,0);
        TextView title = new TextView(this);
        title.setText("FÊNIX PROMPTER"); title.setTextColor(0xFFFFCF69); title.setTextSize(18); title.setTypeface(null,1);
        TextView sub = new TextView(this);
        sub.setText("Agência & Família Fênix Warriors • v1.1.0"); sub.setTextColor(0xFFB9B0A4); sub.setTextSize(11);
        titles.addView(title); titles.addView(sub);
        header.addView(titles, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT,1));
        root.addView(header);

        LinearLayout permission = new LinearLayout(this);
        permission.setOrientation(LinearLayout.VERTICAL);
        permission.setPadding(dp(10), dp(7), dp(10), dp(8));
        permission.setBackgroundColor(0xFF15100B);
        overlayStatus = new TextView(this);
        overlayStatus.setTextSize(13); overlayStatus.setGravity(Gravity.CENTER); overlayStatus.setPadding(0,0,0,dp(5));
        permission.addView(overlayStatus);

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        Button permissionButton = button("1. LIBERAR SOBREPOSIÇÃO", 0xFF3A2A16, Color.WHITE);
        permissionButton.setOnClickListener(v -> requestOverlayPermission());
        Button overlayButton = button("2. ABRIR SOBRE A BIGO", 0xFFF3B638, Color.BLACK);
        overlayButton.setOnClickListener(v -> startOverlayFlow());
        Button refresh = button("↻", 0xFF2A1608, Color.WHITE);
        refresh.setOnClickListener(v -> loadPrompterHtml());
        buttons.addView(permissionButton, new LinearLayout.LayoutParams(0, dp(48), 1));
        LinearLayout.LayoutParams op = new LinearLayout.LayoutParams(0, dp(48),1); op.setMargins(dp(5),0,dp(5),0); buttons.addView(overlayButton,op);
        buttons.addView(refresh, new LinearLayout.LayoutParams(dp(54), dp(48)));
        permission.addView(buttons);
        root.addView(permission);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false); s.setAllowContentAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " FenixPrompterAndroid/1.1");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient(){
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) showFriendlyError("Não foi possível carregar o sistema. Verifique sua internet e toque em ↻.");
            }
        });
        webView.addJavascriptInterface(new NativeBridge(), "FenixNative");
        root.addView(webView, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,0,1));
        setContentView(root);
        updateOverlayStatus();
    }

    private Button button(String text, int bg, int fg) {
        Button b = new Button(this); b.setText(text); b.setTextSize(11); b.setTextColor(fg); b.setBackgroundColor(bg); b.setAllCaps(false); return b;
    }

    private void loadPrompterHtml() {
        webView.loadDataWithBaseURL(APP_URL, "<html><body style='background:#080808;color:#ffd267;font-family:sans-serif;text-align:center;padding-top:30vh'><h2>Carregando FÊNIX PROMPTER…</h2></body></html>", "text/html", "UTF-8", null);
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection)new URL(APP_URL).openConnection();
                c.setConnectTimeout(12000); c.setReadTimeout(18000); c.setRequestProperty("Accept","text/html");
                int code = c.getResponseCode();
                if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
                BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder(); String line;
                while ((line=r.readLine())!=null) sb.append(line).append('\n');
                String html = sb.toString().trim();
                if (!html.toLowerCase().contains("<html") || !html.contains("FÊNIX PROMPTER")) throw new Exception("Resposta inválida");
                runOnUiThread(() -> webView.loadDataWithBaseURL(APP_URL, html, "text/html", "UTF-8", null));
            } catch (Exception e) {
                runOnUiThread(() -> showFriendlyError("Não foi possível carregar o FÊNIX PROMPTER. Verifique a internet e toque em ↻."));
            } finally { if (c != null) c.disconnect(); }
        }).start();
    }

    private void showFriendlyError(String message) {
        String h="<html><body style='background:#080808;color:white;font-family:sans-serif;text-align:center;padding:25vh 24px'><h2 style='color:#ffd267'>FÊNIX PROMPTER</h2><p>"+message+"</p></body></html>";
        webView.loadDataWithBaseURL(APP_URL,h,"text/html","UTF-8",null);
    }

    private void startOverlayFlow() {
        if (!Settings.canDrawOverlays(this)) {
            waitingOverlayPermission = true;
            Toast.makeText(this,"Ative 'Permitir exibição sobre outros apps'. Ao voltar, o FÊNIX PROMPTER continuará automaticamente.",Toast.LENGTH_LONG).show();
            openOverlaySettings();
            return;
        }
        captureAndOpenOverlay();
    }

    private void requestOverlayPermission() {
        waitingOverlayPermission = false;
        if (Settings.canDrawOverlays(this)) { Toast.makeText(this,"Sobreposição já está autorizada.",Toast.LENGTH_SHORT).show(); updateOverlayStatus(); return; }
        Toast.makeText(this,"Na próxima tela, ative a chave 'Permitir exibição sobre outros apps' para FÊNIX PROMPTER.",Toast.LENGTH_LONG).show();
        openOverlaySettings();
    }

    private void openOverlaySettings() {
        try { startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))); }
        catch (Exception e) { startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)); }
    }

    @Override protected void onResume() {
        super.onResume();
        if (overlayStatus != null) updateOverlayStatus();
        if (waitingOverlayPermission && Settings.canDrawOverlays(this)) {
            waitingOverlayPermission = false;
            Toast.makeText(this,"Sobreposição autorizada ✓ Abrindo teleprompter…",Toast.LENGTH_SHORT).show();
            captureAndOpenOverlay();
        }
    }

    private void updateOverlayStatus() {
        boolean ok = Settings.canDrawOverlays(this);
        overlayStatus.setText(ok ? "✓ Sobreposição autorizada — pronta para usar na BIGO" : "⚠ Sobreposição ainda não autorizada — toque em LIBERAR SOBREPOSIÇÃO");
        overlayStatus.setTextColor(ok ? 0xFF70E6A0 : 0xFFFFB36A);
    }

    private void captureAndOpenOverlay() {
        webView.evaluateJavascript("(function(){var e=document.querySelector('#tele');return e?e.innerText:'';})()", value -> {
            String t = decodeJsString(value); if (t != null && !t.trim().isEmpty()) pendingText=t; openOverlayService();
        });
    }

    private String decodeJsString(String value) {
        if (value==null || "null".equals(value)) return "";
        if (value.length()>=2 && value.startsWith("\"") && value.endsWith("\"")) value=value.substring(1,value.length()-1);
        return value.replace("\\n","\n").replace("\\\"","\"").replace("\\\\","\\");
    }

    private void openOverlayService() {
        if (!Settings.canDrawOverlays(this)) { updateOverlayStatus(); return; }
        Intent service=new Intent(this,OverlayService.class); service.putExtra(OverlayService.EXTRA_TEXT,pendingText);
        if (Build.VERSION.SDK_INT>=Build.VERSION_CODES.O) startForegroundService(service); else startService(service);
        Toast.makeText(this,"Teleprompter flutuante ativado. Agora abra a BIGO LIVE.",Toast.LENGTH_LONG).show();
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},22);
    }

    @Override public void onBackPressed() { if (webView!=null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density+.5f); }

    private class NativeBridge {
        @JavascriptInterface public void openOverlay(String text) { runOnUiThread(() -> { if(text!=null&&!text.trim().isEmpty()) pendingText=text; startOverlayFlow(); }); }
    }
}
