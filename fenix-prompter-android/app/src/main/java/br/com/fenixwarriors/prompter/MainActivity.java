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
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends android.app.Activity {
    private static final String APP_URL = "https://knzuhcccujtwzlhbsbss.supabase.co/functions/v1/fenix-prompter";
    private WebView webView;
    private String pendingText = "Bem-vindo ao FÊNIX PROMPTER. Escolha ou crie um roteiro para iniciar.";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        buildUi();
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " FenixPrompterAndroid/1.0");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new NativeBridge(), "FenixNative");
        root.addView(webView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        LinearLayout action = new LinearLayout(this);
        action.setOrientation(LinearLayout.VERTICAL);
        action.setGravity(Gravity.CENTER_HORIZONTAL);
        action.setPadding(dp(8), dp(8), dp(8), dp(8));
        action.setBackgroundColor(0xEE0A0A0A);

        TextView title = new TextView(this);
        title.setText("🐦‍🔥 FÊNIX PROMPTER • ANDROID");
        title.setTextColor(0xFFFFCF69);
        title.setTextSize(12);
        title.setGravity(Gravity.CENTER);
        action.addView(title, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        Button overlayButton = new Button(this);
        overlayButton.setText("🔥 ABRIR SOBRE A BIGO");
        overlayButton.setTextColor(Color.BLACK);
        overlayButton.setBackgroundColor(0xFFF3B638);
        overlayButton.setOnClickListener(v -> captureAndOpenOverlay());
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(50));
        bp.topMargin = dp(4);
        action.addView(overlayButton, bp);

        Button refresh = new Button(this);
        refresh.setText("↻ ATUALIZAR SISTEMA");
        refresh.setTextColor(Color.WHITE);
        refresh.setBackgroundColor(0xFF24180C);
        refresh.setOnClickListener(v -> webView.reload());
        LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44));
        rp.topMargin = dp(4);
        action.addView(refresh, rp);

        FrameLayout.LayoutParams ap = new FrameLayout.LayoutParams(dp(250), FrameLayout.LayoutParams.WRAP_CONTENT);
        ap.gravity = Gravity.BOTTOM | Gravity.END;
        ap.setMargins(dp(10), dp(10), dp(10), dp(12));
        root.addView(action, ap);

        setContentView(root);
        webView.loadUrl(APP_URL);
    }

    private void captureAndOpenOverlay() {
        webView.evaluateJavascript("(function(){var e=document.querySelector('#tele');return e?e.innerText:'';})()", value -> {
            String t = decodeJsString(value);
            if (t != null && !t.trim().isEmpty()) pendingText = t;
            openOverlay();
        });
    }

    private String decodeJsString(String value) {
        if (value == null || "null".equals(value)) return "";
        if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1);
        }
        return value.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private void openOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            Toast.makeText(this, "Autorize 'Exibir sobre outros apps' para usar o teleprompter sobre a BIGO.", Toast.LENGTH_LONG).show();
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            startActivity(intent);
            return;
        }
        Intent service = new Intent(this, OverlayService.class);
        service.putExtra(OverlayService.EXTRA_TEXT, pendingText);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(service); else startService(service);
        Toast.makeText(this, "FÊNIX PROMPTER flutuante ativado. Agora abra a BIGO LIVE.", Toast.LENGTH_LONG).show();
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 22);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density + 0.5f);
    }

    private class NativeBridge {
        @JavascriptInterface
        public void openOverlay(String text) {
            runOnUiThread(() -> {
                if (text != null && !text.trim().isEmpty()) pendingText = text;
                MainActivity.this.openOverlay();
            });
        }
    }
}
