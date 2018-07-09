package com.ionicframework.common;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.DecelerateInterpolator;
import android.view.Display;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;
import android.app.Activity;
import android.content.pm.PackageInfo;
import android.os.Build;

import java.util.UUID;

public class IonicCordovaCommon extends CordovaPlugin {
  public static final String TAG = "IonicCordovaCommon";
  private static final String  PREFS_KEY = "ionicDeploySavedPreferences";
  private static Dialog splashDialog;

  private ImageView splashImageView;
  private SharedPreferences prefs;
  private String uuid;

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    // Initialize shared preferences
    Context cxt = this.cordova.getActivity().getApplicationContext();
    this.prefs = cxt.getSharedPreferences("com.ionic.common.preferences", Context.MODE_PRIVATE);

    // Get or generate a plugin UUID
    this.uuid = this.prefs.getString("uuid", UUID.randomUUID().toString());
    prefs.edit().putString("uuid", this.uuid).apply();

    // Show the splash screen
    showSplashScreen();
  }

  /**
   * Executes the request and returns PluginResult.
   *
   * @param action            The action to execute.
   * @param args              JSONArry of arguments for the plugin.
   * @param callbackContext   The callback id used when calling back into JavaScript.
   * @return                  True if the action was valid, false if not.
   */
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    switch(action) {
      case "clearSplashFlag":
        this.removeSplashScreen();
        break;
      case "getAppInfo":
        this.getAppInfo(callbackContext);
        break;
      case "getPreferences":
        this.getPreferences(callbackContext);
        break;
      case "setPreferences":
        this.setPreferences(callbackContext, args.getJSONObject(0));
        break;
      default:
        return false;
    }

    return true;
  }

  /**
   * Get basic app information.  Used for the Ionic monitoring service.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   */
  public void getAppInfo(CallbackContext callbackContext) throws JSONException {
    JSONObject j = new JSONObject();

    try {
      PackageInfo pInfo = this.cordova.getActivity().getPackageManager().getPackageInfo(this.cordova.getActivity().getPackageName(), 0);
      String version = pInfo.versionName;
      String name = pInfo.packageName;
      int versionCode = pInfo.versionCode;
      String platformVersion = String.valueOf(Build.VERSION.RELEASE);

      j.put("platform", "android");
      j.put("platformVersion", platformVersion);
      j.put("version", versionCode);
      j.put("bundleName", name);
      j.put("bundleVersion", version);
      j.put("device", this.uuid);

      Log.d(TAG, "Got package info. Version: " + version + ", bundleName: " + name + ", versionCode: " + versionCode);
      final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get package info", ex);
      callbackContext.error(ex.toString());
    }
  }

  /**
   * Grabs a string from the activity's resources.
   *
   * @param aString The name of the resource to retrieve
   * @return        The string contents of the resource
   */
  private String getStringResourceByName(String aString) {
    Activity activity = cordova.getActivity();
    String packageName = activity.getPackageName();
    int resId = activity.getResources().getIdentifier(aString, "string", packageName);
    return activity.getString(resId);
  }

  /**
   * Get cordova plugin preferences and state information.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   */
  public void getPreferences(CallbackContext callbackContext) throws JSONException {

    SharedPreferences prefs = this.cordova.getContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    String prefsString = prefs.getString(this.PREFS_KEY, null);
    JSONObject j;
    if (prefsString != null) {
      Log.i(TAG, "Found saved prefs: " + prefsString);
      j = new JSONObject(prefsString);
      final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }

    j = new JSONObject();
    int maxV;
    int minBackgroundDuration;

    try {
      maxV = Integer.parseInt(getStringResourceByName("ionic_max_versions"));
    } catch(NumberFormatException e) {
      maxV = 2;
    }

    try {
      minBackgroundDuration = Integer.parseInt(getStringResourceByName("ionic_min_background_duration"));
    } catch(NumberFormatException e) {
      minBackgroundDuration = 30;
    }

    try {
      String appId = getStringResourceByName("ionic_app_id");
      j.put("appId", appId);
      j.put("debug", getStringResourceByName("ionic_debug"));
      j.put("channel", getStringResourceByName("ionic_channel_name"));
      j.put("host", getStringResourceByName("ionic_update_api"));
      j.put("updateMethod", getStringResourceByName("ionic_update_method"));
      j.put("maxVersions", maxV);
      j.put("minBackgroundDuration", minBackgroundDuration);
      j.put("updates", new JSONObject("{}"));


      Log.d(TAG, "Got prefs for AppID: " + appId);
      final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get preferences", ex);
      callbackContext.error(ex.toString());
    }
  }

  /**
   * Set cordova plugin preferences and state information.
   *  @param callbackContext The callback id used when calling back into JavaScript.
   * @param newPrefs
   */
  public void setPreferences(CallbackContext callbackContext, JSONObject newPrefs) {
    Log.i(TAG, "Set preferences called with prefs" + newPrefs.toString());
    SharedPreferences prefs = this.cordova.getContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    SharedPreferences.Editor editor = prefs.edit();
    editor.putString(this.PREFS_KEY, newPrefs.toString());
    editor.commit();
    Log.i(TAG, "preferences updated");
    final PluginResult result = new PluginResult(PluginResult.Status.OK, newPrefs);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
  }

  private int getSplashId() {
    int drawableId = 0;
    String splashResource = preferences.getString("SplashScreen", "screen");
    if (splashResource != null) {
      drawableId = this.cordova.getActivity().getResources().getIdentifier(splashResource, "drawable", cordova.getActivity().getClass().getPackage().getName());
      if (drawableId == 0) {
        drawableId = this.cordova.getActivity().getResources().getIdentifier(splashResource, "drawable", cordova.getActivity().getPackageName());
      }
    }
    return drawableId;
  }

  private void removeSplashScreen() {
    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        if (splashDialog != null && splashDialog.isShowing()) {
          final int fadeSplashScreenDuration = 300;
          if (fadeSplashScreenDuration > 0 && splashImageView != null) {
            AlphaAnimation fadeOut = new AlphaAnimation(1, 0);
            fadeOut.setInterpolator(new DecelerateInterpolator());
            fadeOut.setDuration(fadeSplashScreenDuration);

            splashImageView.setAnimation(fadeOut);
            splashImageView.startAnimation(fadeOut);

            fadeOut.setAnimationListener(new Animation.AnimationListener() {
              @Override
              public void onAnimationStart(Animation animation) {}

              @Override
              public void onAnimationEnd(Animation animation) {
                if (splashDialog != null && splashDialog.isShowing()) {
                  splashDialog.dismiss();
                  splashDialog = null;
                  splashImageView = null;
                }
              }

              @Override
              public void onAnimationRepeat(Animation animation) {}
            });
          } else {
            splashDialog.dismiss();
            splashDialog = null;
            splashImageView = null;
          }
        }
      }
    });
  }

  @SuppressWarnings("deprecation")
  private void showSplashScreen() {
    final int drawableId = getSplashId();

    if (cordova.getActivity().isFinishing()) {
      return;
    }
    if (splashDialog != null && splashDialog.isShowing()) {
      return;
    }
    if (drawableId == 0) {
      return;
    }

    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        Display display = cordova.getActivity().getWindowManager().getDefaultDisplay();
        Context context = webView.getContext();

        splashImageView = new ImageView(context);
        splashImageView.setImageResource(drawableId);
        LayoutParams layoutParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
        splashImageView.setLayoutParams(layoutParams);

        splashImageView.setMinimumHeight(display.getHeight());
        splashImageView.setMinimumWidth(display.getWidth());
        splashImageView.setBackgroundColor(preferences.getInteger("backgroundColor", Color.BLACK));

        if (preferences.getBoolean("SplashMaintainAspectRatio", false)) {
          splashImageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        } else {
          splashImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        }

        splashDialog = new Dialog(context, android.R.style.Theme_Translucent_NoTitleBar);
        if ((cordova.getActivity().getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_FULLSCREEN) == WindowManager.LayoutParams.FLAG_FULLSCREEN) {
          splashDialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }
        splashDialog.setContentView(splashImageView);
        splashDialog.setCancelable(false);
        splashDialog.show();
      }
    });
  }
}
