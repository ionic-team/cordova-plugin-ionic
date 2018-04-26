package com.ionicframework.common;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.content.SharedPreferences;
import android.util.Log;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.os.Build;

public class IonicCordovaCommon extends CordovaPlugin {
  public static final String TAG = "IonicCordovaCommon";

  private Context myContext = null;
  private SharedPreferences prefs = null;

  private String appId;
  private String debug;
  private String channel;
  private String host;
  private String updateMethod;
  private int maxVersions;
  private String currentVersionId;

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.myContext = this.cordova.getActivity().getApplicationContext();
    this.prefs = getPreferences();

    this.appId = prefs.getString("app_id", getStringResourceByName("ionic_app_id"));
    this.channel = prefs.getString("channel", getStringResourceByName("ionic_channel_name"));
    this.currentVersionId = prefs.getString("uuid", "NO_DEPLOY_AVAILABLE");
    this.debug = prefs.getString("debug", getStringResourceByName("ionic_debug"));
    this.host = getStringResourceByName("ionic_update_api");
    this.updateMethod = getStringResourceByName("ionic_update_method");

    try {
      this.maxVersions = Integer.parseInt(getStringResourceByName("ionic_max_versions"));
    } catch(NumberFormatException e) {
      this.maxVersions = 3;
    }
  }

  private SharedPreferences getPreferences() {
    SharedPreferences prefs = this.myContext.getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    return prefs;
  }

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
    if(action.equals("getAppInfo")) {
      this.getAppInfo(args, callbackContext);
    } else if(action.equals("getPreferences")) {
      this.getPreferences(callbackContext);
    }
    return true;
  }

  public JSONObject getAppInfo(JSONArray args, CallbackContext callbackContext) throws JSONException {
    JSONObject j = new JSONObject();

    try {
      PackageInfo pInfo = this.cordova.getActivity().getPackageManager().getPackageInfo(this.cordova.getActivity().getPackageName(), 0);
      String version = pInfo.versionName;
      String name = pInfo.packageName;
      int versionCode = pInfo.versionCode;
      String platformVersion = String.valueOf(Build.VERSION.RELEASE);

      /*
      String appName = this.cordova.getActivity().getApplicationInfo().loadLabel(this.cordova.getActivity().getPackageManager());
      */

      j.put("platform", "android");
      j.put("platformVersion", platformVersion);
      j.put("version", versionCode);
      j.put("bundleName", name);
      j.put("bundleVersion", version);

      Log.d(TAG, "Got package info. Version: " + version + ", bundleName: " + name + ", versionCode: " + versionCode);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get package info", ex);
    }

    final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);

    return j;
  }

  public JSONObject getPreferences(CallbackContext callbackContext) throws JSONException {
    JSONObject j = new JSONObject();

    try {
      j.put("appId", appId);
      j.put("debug", debug);
      j.put("channel", channel);
      j.put("host", host);
      j.put("updateMethod", updateMethod);
      j.put("maxVersions", maxVersions);
      j.put("currentVersionId", currentVersionId);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get preferences", ex);
    }

    final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);

    return j;
  }
}
