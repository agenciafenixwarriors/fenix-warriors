package br.com.fenixwarriors.prompter;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends android.app.Activity {
    private static final String APP_URL = "https://knzuhcccujtwzlhbsbss.supabase.co/functions/v1/fenix-prompter";
    private static final String VERSION_URL = "https://knzuhcccujtwzlhbsbss.supabase.co/functions/v1/fenix-prompter-version";
    private static final String LOGO_URL = "https://knzuhcccujtwzlhbsbss.supabase.co/functions/v1/fenix-prompter-logo";
    private static final String BIGO_PACKAGE = "sg.bigo.live";
    private static final int VERSION_CODE = 4;
    private static final String VERSION_NAME = "1.2.1";

    private WebView webView;
    private TextView overlayStatus;
    private TextView updateStatus;
    private boolean waitingOverlayPermission = false;
    private String pendingText = "Bem-vindo ao FÊNIX PROMPTER. Escolha ou crie um roteiro para iniciar.";

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        buildUi();
        loadPrompterHtml();
        new Handler(Looper.getMainLooper()).postDelayed(() -> checkForUpdates(false), 1800);
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
        logo.setScaleType(ImageView.ScaleType.CENTER_CROP);
        logo.setAdjustViewBounds(true);
        header.addView(logo, new LinearLayout.LayoutParams(dp(58), dp(58)));
        loadBrandLogo(logo);

        LinearLayout titles = new LinearLayout(this);
        titles.setOrientation(LinearLayout.VERTICAL);
        titles.setPadding(dp(8),0,0,0);
        TextView title = new TextView(this);
        title.setText("FÊNIX PROMPTER");
        title.setTextColor(0xFFFFCF69);
        title.setTextSize(18);
        title.setTypeface(null, Typeface.BOLD);
        TextView sub = new TextView(this);
        sub.setText("Agência & Família Fênix Warriors • v" + VERSION_NAME);
        sub.setTextColor(0xFFB9B0A4);
        sub.setTextSize(11);
        titles.addView(title);
        titles.addView(sub);
        header.addView(titles, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT,1));

        Button update = button("🔄 Atualizar", 0xFF2A1608, Color.WHITE);
        update.setOnClickListener(v -> checkForUpdates(true));
        header.addView(update, new LinearLayout.LayoutParams(dp(105), dp(46)));
        root.addView(header);

        LinearLayout livePanel = new LinearLayout(this);
        livePanel.setOrientation(LinearLayout.VERTICAL);
        livePanel.setPadding(dp(10), dp(7), dp(10), dp(9));
        livePanel.setBackgroundColor(0xFF15100B);

        overlayStatus = new TextView(this);
        overlayStatus.setTextSize(13);
        overlayStatus.setGravity(Gravity.CENTER);
        overlayStatus.setPadding(0,0,0,dp(5));
        livePanel.addView(overlayStatus);

        Button startLive = button("🔥 INICIAR LIVE HOUSE • ABRIR SOBRE A BIGO", 0xFFF3B638, Color.BLACK);
        startLive.setTextSize(13);
        startLive.setTypeface(null, Typeface.BOLD);
        startLive.setOnClickListener(v -> startOverlayFlow());
        livePanel.addView(startLive, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(54)));

        LinearLayout smallActions = new LinearLayout(this);
        smallActions.setOrientation(LinearLayout.HORIZONTAL);
        Button permissionButton = button("⚙ Liberar sobreposição", 0xFF3A2A16, Color.WHITE);
        permissionButton.setOnClickListener(v -> requestOverlayPermission());
        Button refresh = button("↻ Recarregar", 0xFF2A1608, Color.WHITE);
        refresh.setOnClickListener(v -> loadPrompterHtml());
        smallActions.addView(permissionButton, new LinearLayout.LayoutParams(0, dp(45),1));
        LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(0, dp(45),1);
        rlp.setMargins(dp(5),0,0,0);
        smallActions.addView(refresh, rlp);
        livePanel.addView(smallActions);

        updateStatus = new TextView(this);
        updateStatus.setText("Atualizações: verificação automática ativada");
        updateStatus.setTextColor(0xFFB9B0A4);
        updateStatus.setTextSize(10);
        updateStatus.setGravity(Gravity.CENTER);
        updateStatus.setPadding(0,dp(5),0,0);
        livePanel.addView(updateStatus);
        root.addView(livePanel);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " FenixPrompterAndroid/1.2.1");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient(){
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) showFriendlyError("Não foi possível carregar o sistema. Verifique sua internet e toque em Recarregar.");
            }
        });
        webView.addJavascriptInterface(new NativeBridge(), "FenixNative");
        root.addView(webView, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,0,1));
        setContentView(root);
        updateOverlayStatus();
    }

    private void loadBrandLogo(ImageView target) {
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection)new URL(LOGO_URL).openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(10000);
                c.setRequestProperty("Accept","image/*");
                if (c.getResponseCode() != 200) return;
                try (InputStream in = c.getInputStream()) {
                    Bitmap bmp = BitmapFactory.decodeStream(in);
                    if (bmp != null) runOnUiThread(() -> target.setImageBitmap(bmp));
                }
            } catch (Exception ignored) {
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    private Button button(String text, int bg, int fg) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(11);
        b.setTextColor(fg);
        b.setBackgroundColor(bg);
        b.setAllCaps(false);
        return b;
    }

    private void loadPrompterHtml() {
        webView.loadDataWithBaseURL(APP_URL, "<html><body style='background:#080808;color:#ffd267;font-family:sans-serif;text-align:center;padding-top:30vh'><h2>Carregando FÊNIX PROMPTER…</h2></body></html>", "text/html", "UTF-8", null);
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection)new URL(APP_URL).openConnection();
                c.setConnectTimeout(12000);
                c.setReadTimeout(18000);
                c.setRequestProperty("Accept","text/html");
                int code = c.getResponseCode();
                if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
                BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line=r.readLine())!=null) sb.append(line).append('\n');
                String html = sb.toString().trim();
                if (!html.toLowerCase().contains("<html") || !html.contains("FÊNIX PROMPTER")) throw new Exception("Resposta inválida");
                runOnUiThread(() -> webView.loadDataWithBaseURL(APP_URL, html, "text/html", "UTF-8", null));
            } catch (Exception e) {
                runOnUiThread(() -> showFriendlyError("Não foi possível carregar o FÊNIX PROMPTER. Verifique a internet e toque em Recarregar."));
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    private void showFriendlyError(String message) {
        String h="<html><body style='background:#080808;color:white;font-family:sans-serif;text-align:center;padding:25vh 24px'><h2 style='color:#ffd267'>FÊNIX PROMPTER</h2><p>"+message+"</p></body></html>";
        webView.loadDataWithBaseURL(APP_URL,h,"text/html","UTF-8",null);
    }

    private void startOverlayFlow() {
        if (!Settings.canDrawOverlays(this)) {
            waitingOverlayPermission = true;
            Toast.makeText(this,"Ative 'Permitir exibição sobre outros apps'. Ao voltar, a Live House continuará automaticamente.",Toast.LENGTH_LONG).show();
            openOverlaySettings();
            return;
        }
        captureAndOpenOverlay(true);
    }

    private void requestOverlayPermission() {
        waitingOverlayPermission = false;
        if (Settings.canDrawOverlays(this)) {
            Toast.makeText(this,"Sobreposição já está autorizada.",Toast.LENGTH_SHORT).show();
            updateOverlayStatus();
            return;
        }
        Toast.makeText(this,"Ative a chave 'Permitir exibição sobre outros apps' para FÊNIX PROMPTER.",Toast.LENGTH_LONG).show();
        openOverlaySettings();
    }

    private void openOverlaySettings() {
        try {
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())));
        } catch (Exception e) {
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION));
        }
    }

    @Override protected void onResume() {
        super.onResume();
        if (overlayStatus != null) updateOverlayStatus();
        if (waitingOverlayPermission && Settings.canDrawOverlays(this)) {
            waitingOverlayPermission = false;
            Toast.makeText(this,"Sobreposição autorizada ✓ Abrindo teleprompter e BIGO…",Toast.LENGTH_SHORT).show();
            captureAndOpenOverlay(true);
        }
    }

    private void updateOverlayStatus() {
        boolean ok = Settings.canDrawOverlays(this);
        overlayStatus.setText(ok ? "✓ Sobreposição autorizada — toque em INICIAR LIVE HOUSE" : "⚠ Sobreposição não autorizada — toque em Liberar sobreposição");
        overlayStatus.setTextColor(ok ? 0xFF70E6A0 : 0xFFFFB36A);
    }

    private void captureAndOpenOverlay(boolean openBigo) {
        webView.evaluateJavascript("(function(){var e=document.querySelector('#tele');return e?e.innerText:'';})()", value -> {
            String t = decodeJsString(value);
            if (t != null && !t.trim().isEmpty()) pendingText=t;
            openOverlayService(openBigo);
        });
    }

    private String decodeJsString(String value) {
        if (value==null || "null".equals(value)) return "";
        if (value.length()>=2 && value.startsWith("\"") && value.endsWith("\"")) value=value.substring(1,value.length()-1);
        return value.replace("\\n","\n").replace("\\\"","\"").replace("\\\\","\\");
    }

    private void openOverlayService(boolean openBigo) {
        if (!Settings.canDrawOverlays(this)) {
            updateOverlayStatus();
            return;
        }
        Intent service=new Intent(this,OverlayService.class);
        service.putExtra(OverlayService.EXTRA_TEXT,pendingText);
        if (Build.VERSION.SDK_INT>=Build.VERSION_CODES.O) startForegroundService(service); else startService(service);
        Toast.makeText(this,"Teleprompter flutuante ativado.",Toast.LENGTH_SHORT).show();
        if (openBigo) new Handler(Looper.getMainLooper()).postDelayed(this::launchBigo, 650);
    }

    private void launchBigo() {
        Intent bigo = getPackageManager().getLaunchIntentForPackage(BIGO_PACKAGE);
        if (bigo != null) {
            bigo.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(bigo);
        } else {
            Toast.makeText(this,"BIGO LIVE não foi encontrada. Abra a BIGO manualmente; o teleprompter continuará flutuando.",Toast.LENGTH_LONG).show();
        }
    }

    private void checkForUpdates(boolean userRequested) {
        if (updateStatus != null) {
            updateStatus.setText("Verificando atualizações…");
            updateStatus.setTextColor(0xFFFFCF69);
        }
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection)new URL(VERSION_URL).openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(10000);
                c.setRequestProperty("Accept","application/json");
                if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
                BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line=r.readLine())!=null) sb.append(line);
                JSONObject j = new JSONObject(sb.toString());
                int latestCode = j.optInt("latestVersionCode", VERSION_CODE);
                String latestName = j.optString("latestVersion", VERSION_NAME);
                String downloadUrl = j.optString("downloadUrl", "");
                boolean mandatory = j.optBoolean("mandatory", false);
                runOnUiThread(() -> {
                    if (latestCode > VERSION_CODE) {
                        updateStatus.setText("Nova versão disponível: v" + latestName);
                        updateStatus.setTextColor(0xFFFFB36A);
                        showUpdateDialog(latestName, downloadUrl, mandatory);
                    } else {
                        updateStatus.setText("✓ Aplicativo atualizado • v" + VERSION_NAME);
                        updateStatus.setTextColor(0xFF70E6A0);
                        if (userRequested) Toast.makeText(this,"Você já está usando a versão mais recente.",Toast.LENGTH_SHORT).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    updateStatus.setText("Não foi possível verificar atualizações agora");
                    updateStatus.setTextColor(0xFFB9B0A4);
                    if (userRequested) Toast.makeText(this,"Falha ao verificar atualizações. Tente novamente com internet ativa.",Toast.LENGTH_LONG).show();
                });
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    private void showUpdateDialog(String version, String downloadUrl, boolean mandatory) {
        AlertDialog.Builder b = new AlertDialog.Builder(this)
                .setTitle("Atualização FÊNIX PROMPTER")
                .setMessage("A versão " + version + " está disponível. Deseja baixar e atualizar agora?")
                .setPositiveButton("Atualizar agora", (d,w) -> {
                    if (downloadUrl != null && !downloadUrl.isEmpty()) {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl)));
                    }
                });
        if (!mandatory) b.setNegativeButton("Depois", null);
        b.show();
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},22);
        }
    }

    @Override public void onBackPressed() {
        if (webView!=null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density+.5f); }

    private class NativeBridge {
        @JavascriptInterface public void openOverlay(String text) {
            runOnUiThread(() -> {
                if(text!=null&&!text.trim().isEmpty()) pendingText=text;
                startOverlayFlow();
            });
        }
    }
}
