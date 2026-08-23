package br.com.fenixwarriors.prompter;

import android.app.*;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.media.session.MediaSession;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.*;

public class OverlayService extends Service {
    public static final String EXTRA_TEXT = "text";
    private static final String CHANNEL_ID = "fenix_prompter_overlay";
    private WindowManager wm;
    private LinearLayout root;
    private ScrollView scroll;
    private TextView text;
    private WindowManager.LayoutParams params;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean playing = false;
    private float speed = 1.0f;
    private float fontSp = 30f;
    private int opacity = 210;
    private boolean mirrored = false;
    private MediaSession mediaSession;

    private final Runnable autoScroll = new Runnable() {
        @Override public void run() {
            if (playing && scroll != null) {
                scroll.scrollBy(0, Math.max(1, Math.round(speed)));
                handler.postDelayed(this, 26);
            }
        }
    };

    @Override public void onCreate() {
        super.onCreate();
        createChannel();
        startForeground(901, notification());
        setupMediaSession();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        String incoming = intent != null ? intent.getStringExtra(EXTRA_TEXT) : null;
        if (!Settings.canDrawOverlays(this)) {
            stopSelf();
            return START_NOT_STICKY;
        }
        if (root == null) {
            createOverlay(incoming);
        } else if (incoming != null && !incoming.trim().isEmpty()) {
            text.setText(incoming);
            scroll.scrollTo(0, 0);
        }
        return START_STICKY;
    }

    private void createOverlay(String content) {
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        params = new WindowManager.LayoutParams(
                dp(350), dp(270), type,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        params.y = dp(110);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(6), dp(5), dp(6), dp(5));
        applyBg();

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);

        TextView brand = new TextView(this);
        brand.setText("🐦‍🔥 FÊNIX PROMPTER");
        brand.setTextColor(0xFFFFCF69);
        brand.setTextSize(12);
        brand.setPadding(dp(5), 0, dp(5), 0);
        bar.addView(brand, new LinearLayout.LayoutParams(0, dp(36), 1));

        Button minimize = smallButton("—");
        minimize.setOnClickListener(v -> toggleCompact());
        bar.addView(minimize);

        Button close = smallButton("✕");
        close.setOnClickListener(v -> stopSelf());
        bar.addView(close);

        root.addView(bar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(40)));
        makeDraggable(bar);

        scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.TRANSPARENT);

        text = new TextView(this);
        text.setText(content == null || content.trim().isEmpty()
                ? "Escolha um roteiro no FÊNIX PROMPTER e toque em 'ABRIR SOBRE A BIGO'."
                : content);
        text.setTextColor(Color.WHITE);
        text.setTextSize(fontSp);
        text.setGravity(Gravity.CENTER_HORIZONTAL);
        text.setLineSpacing(0, 1.25f);
        text.setPadding(dp(14), dp(120), dp(14), dp(120));
        scroll.addView(text, new ScrollView.LayoutParams(ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.WRAP_CONTENT));
        root.addView(scroll, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));

        LinearLayout controls1 = new LinearLayout(this);
        controls1.setGravity(Gravity.CENTER);
        Button prev = smallButton("↟");
        prev.setOnClickListener(v -> scroll.smoothScrollTo(0, 0));
        Button slower = smallButton("−V");
        slower.setOnClickListener(v -> { speed = Math.max(.5f, speed - .5f); toast("Velocidade " + speed); });
        Button play = smallButton("▶/Ⅱ");
        play.setOnClickListener(v -> togglePlay());
        Button faster = smallButton("+V");
        faster.setOnClickListener(v -> { speed = Math.min(7f, speed + .5f); toast("Velocidade " + speed); });
        Button mirror = smallButton("↔");
        mirror.setOnClickListener(v -> { mirrored = !mirrored; text.setScaleX(mirrored ? -1 : 1); });
        controls1.addView(prev);
        controls1.addView(slower);
        controls1.addView(play);
        controls1.addView(faster);
        controls1.addView(mirror);
        root.addView(controls1, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44)));

        LinearLayout controls2 = new LinearLayout(this);
        controls2.setGravity(Gravity.CENTER);
        Button fminus = smallButton("A−");
        fminus.setOnClickListener(v -> { fontSp = Math.max(18, fontSp - 2); text.setTextSize(fontSp); });
        Button fplus = smallButton("A+");
        fplus.setOnClickListener(v -> { fontSp = Math.min(64, fontSp + 2); text.setTextSize(fontSp); });
        Button opminus = smallButton("◐−");
        opminus.setOnClickListener(v -> { opacity = Math.max(60, opacity - 25); applyBg(); });
        Button opplus = smallButton("◐+");
        opplus.setOnClickListener(v -> { opacity = Math.min(245, opacity + 25); applyBg(); });
        Button wider = smallButton("↔+");
        wider.setOnClickListener(v -> { params.width = Math.min(dp(520), params.width + dp(40)); wm.updateViewLayout(root, params); });
        Button narrower = smallButton("↔−");
        narrower.setOnClickListener(v -> { params.width = Math.max(dp(240), params.width - dp(40)); wm.updateViewLayout(root, params); });
        controls2.addView(fminus);
        controls2.addView(fplus);
        controls2.addView(opminus);
        controls2.addView(opplus);
        controls2.addView(narrower);
        controls2.addView(wider);
        root.addView(controls2, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44)));

        wm.addView(root, params);
    }

    private void toggleCompact() {
        boolean compact = scroll.getVisibility() == View.VISIBLE;
        scroll.setVisibility(compact ? View.GONE : View.VISIBLE);
        if (root.getChildCount() > 2) {
            root.getChildAt(2).setVisibility(compact ? View.GONE : View.VISIBLE);
            root.getChildAt(3).setVisibility(compact ? View.GONE : View.VISIBLE);
        }
        params.height = compact ? dp(46) : dp(270);
        wm.updateViewLayout(root, params);
    }

    private void togglePlay() {
        playing = !playing;
        if (playing) handler.post(autoScroll); else handler.removeCallbacks(autoScroll);
        toast(playing ? "Rolagem iniciada" : "Rolagem pausada");
    }

    private void setupMediaSession() {
        mediaSession = new MediaSession(this, "FenixPrompterMedia");
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override public void onPlay() { if (!playing) togglePlay(); }
            @Override public void onPause() { if (playing) togglePlay(); }
            @Override public void onSkipToNext() { speed = Math.min(7f, speed + .5f); toast("Velocidade " + speed); }
            @Override public void onSkipToPrevious() { speed = Math.max(.5f, speed - .5f); toast("Velocidade " + speed); }
            @Override public void onFastForward() { fontSp = Math.min(64, fontSp + 2); if (text != null) text.setTextSize(fontSp); }
            @Override public void onRewind() { fontSp = Math.max(18, fontSp - 2); if (text != null) text.setTextSize(fontSp); }
            @Override public void onStop() { if (scroll != null) scroll.smoothScrollTo(0, 0); }
        });
        mediaSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);
        mediaSession.setActive(true);
    }

    private void makeDraggable(View handle) {
        handle.setOnTouchListener(new View.OnTouchListener() {
            int startX, startY;
            float touchX, touchY;

            @Override public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        startX = params.x;
                        startY = params.y;
                        touchX = e.getRawX();
                        touchY = e.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = startX + (int) (e.getRawX() - touchX);
                        params.y = startY + (int) (e.getRawY() - touchY);
                        wm.updateViewLayout(root, params);
                        return true;
                    default:
                        return false;
                }
            }
        });
    }

    private Button smallButton(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(Color.WHITE);
        b.setTextSize(11);
        b.setPadding(dp(2), 0, dp(2), 0);
        b.setMinWidth(0);
        b.setMinimumWidth(0);
        b.setBackgroundColor(0xFF2A1608);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(38), 1);
        lp.setMargins(dp(1), dp(1), dp(1), dp(1));
        b.setLayoutParams(lp);
        return b;
    }

    private void applyBg() {
        if (root != null) root.setBackgroundColor(Color.argb(opacity, 7, 7, 7));
    }

    private void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_SHORT).show();
    }

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density + .5f);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CHANNEL_ID, "FÊNIX PROMPTER", NotificationManager.IMPORTANCE_LOW);
            c.setDescription("Mantém o teleprompter flutuante ativo durante a live.");
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    private Notification notification() {
        Intent i = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(br.com.fenixwarriors.prompter.R.drawable.fenix_logo)
                .setContentTitle("FÊNIX PROMPTER ativo")
                .setContentText("Teleprompter flutuante disponível sobre a BIGO LIVE")
                .setContentIntent(pi)
                .setOngoing(true)
                .build();
    }

    @Override public void onDestroy() {
        playing = false;
        handler.removeCallbacksAndMessages(null);
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        if (root != null && wm != null) {
            try { wm.removeView(root); } catch (Exception ignored) { }
        }
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) {
        return null;
    }
}
