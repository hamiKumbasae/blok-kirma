package com.hamikumbasae.blokyildizi;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * BlokYıldızı — Android TV kabuğu. Oyun (index.html + src/) uygulamanın içinde
 * gelir; internet gerekmez (yalnız telefon kumandası internet kullanır). Kumandanın
 * ok tuşları ve OK doğrudan oyuna gider, Geri / Oynat-Duraklat / renkli tuşlar
 * burada çevrilir.
 */
public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(0xFF080C18);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // kayıt (Continue) ve hız ayarı
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " BlokTV");
        web.addJavascriptInterface(new Bridge(), "AndroidTV");
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        setContentView(web);
        hideBars();
        web.loadUrl("file:///android_asset/index.html");
        web.requestFocus();
    }

    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void js(String code) { web.evaluateJavascript(code, null); }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int k = e.getKeyCode();
        boolean down = e.getAction() == KeyEvent.ACTION_DOWN;
        switch (k) {
            case KeyEvent.KEYCODE_BACK:
            case KeyEvent.KEYCODE_ESCAPE:
                if (down && e.getRepeatCount() == 0) {
                    web.evaluateJavascript("window.__tv ? window.__tv.back() : 'exit'", v -> {
                        if (v != null && v.contains("exit")) finish();
                    });
                }
                return true;
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_PLAY:
            case KeyEvent.KEYCODE_MEDIA_PAUSE:
            case KeyEvent.KEYCODE_PROG_RED:
                if (down && e.getRepeatCount() == 0) js("window.__tv && window.__tv.pause()");
                return true;
            case KeyEvent.KEYCODE_PROG_YELLOW:
            case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
                if (down && e.getRepeatCount() == 0) js("window.__tv && window.__tv.speed()");
                return true;
            case KeyEvent.KEYCODE_PROG_GREEN:
                if (down && e.getRepeatCount() == 0) js("window.__tv && window.__tv.lives()");
                return true;
            case KeyEvent.KEYCODE_PROG_BLUE:
                // Telefon kumandası panelini (QR kod) aç / kapat.
                if (down && e.getRepeatCount() == 0) js("window.__tv && window.__tv.phone && window.__tv.phone()");
                return true;
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_NUMPAD_ENTER:
                // OK tuşunu oyunun beklediği Enter olarak gönder.
                String type = down ? "keydown" : "keyup";
                if (!down || e.getRepeatCount() == 0)
                    js("window.dispatchEvent(new KeyboardEvent('" + type + "',{key:'Enter'}))");
                return true;
            default:
                return super.dispatchKeyEvent(e);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    private class Bridge {
        @JavascriptInterface
        public void exit() { runOnUiThread(MainActivity.this::finish); }
    }
}
