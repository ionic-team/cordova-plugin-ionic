package com.ionicframework.common;

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
import android.os.Handler;

public class IonicCordovaCommon extends CordovaPlugin {
  public static final String TAG = "IonicCordovaCommon";

  private boolean revertToBase;

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.revertToBase = true;

    // Get the timeout, and default to 10 sec. if you can't.
    int rollbackTimer;

    try {
      rollbackTimer = Integer.parseInt(getStringResourceByName("ionic_rollback_timeout"));
    } catch (NumberFormatException e) {
      Log.d(TAG, "Couldn't read timeout from config, defaulting to 10 seconds...");
      rollbackTimer = 10;
    }

    // Make a runnable to check if a rollback is needed
    class DelayedRollback implements Runnable {
      IonicCordovaCommon weak;
      DelayedRollback(IonicCordovaCommon ionic) { this.weak = ionic; }
      public void run() {
        weak.loadInitialVersion(false);
      }
    }

    // Instantiate the runnable and handler
    DelayedRollback delayed = new DelayedRollback(this);
    Handler handler = new Handler();

    // Kick off our rollback check after 10 seconds
    handler.postDelayed(delayed, rollbackTimer * 1000);
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
   * Executes the request and returns PluginResult.
   *
   * @param action            The action to execute.
   * @param args              JSONArry of arguments for the plugin.
   * @param callbackContext   The callback id used when calling back into JavaScript.
   * @return                  True if the action was valid, false if not.
   */
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    switch(action) {
      case "clearRevertTimer":
        this.clearRevertTimer(callbackContext);
        break;
      case "getAppInfo":
        this.getAppInfo(callbackContext);
        break;
      case "getPreferences":
        this.getPreferences(callbackContext);
        break;
      default:
        return false;
    }

    return true;
  }

  /**
   * Cancel the reversion to the bundled version of the app, signaling a successful deploy.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   */
  public void clearRevertTimer(CallbackContext callbackContext) {
    this.revertToBase = false;

    final PluginResult result = new PluginResult(PluginResult.Status.OK, "success");
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
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
   * Get cordova plugin preferences and state information.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   */
  public void getPreferences(CallbackContext callbackContext) throws JSONException {
    JSONObject j = new JSONObject();
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
   * Checks if the base version bundled with the app should be loaded, and fires off the load if so.
   *
   * @param force Whether to force the load.
   */
  private void loadInitialVersion(boolean force) {
    Log.d(TAG, "Checking if rollback is needed");

    if (force || this.revertToBase) {
      this.loadInitialVersion();
    }
  }

  /**
   * Loads the version of the app bundled in the binary.
   */
  private void loadInitialVersion() {
    Log.d(TAG, "LOADING INITIAL VERSION");
    IonicCordovaCommon self = this;
    cordova.getActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        webView.loadUrlIntoView("file:///android_asset/www/index.html", false);
        webView.clearHistory();
      }
    });
  }
}
