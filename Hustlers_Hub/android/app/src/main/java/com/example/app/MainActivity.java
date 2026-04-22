package com.example.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {

    // Install splash screen BEFORE super.onCreate()
    SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

    super.onCreate(savedInstanceState);

    // Capacitor automatically loads your web app (no need for setContentView)
    // Optional: keep splash while loading
    splashScreen.setKeepOnScreenCondition(() -> {
      // Return true to keep splash, false to dismiss
      return false;
    });
  }
}
