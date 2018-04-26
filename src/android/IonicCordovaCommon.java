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
import android.content.Context;
import android.content.pm.PackageInfo;
import android.os.Build;

public class IonicCordovaCommon extends CordovaPlugin {
  public static final String NO_DEPLOY_LABEL = "none";
  public static final String TAG = "IonicCordovaCommon";

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
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
   * Get basic app information.  Used for the Ionic monitoring service.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   * @return                True
   */
  public Boolean getAppInfo(CallbackContext callbackContext) throws JSONException {
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

    return true;
  }

  /**
   * Get cordova plugin preferences and state information.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   * @return                True
   */
  public Boolean getPreferences(CallbackContext callbackContext) throws JSONException {
    JSONObject j = new JSONObject();
    int maxV;

    try {
      maxV = Integer.parseInt(getStringResourceByName("ionic_max_versions"));
    } catch(NumberFormatException e) {
      maxV = 2;
    }

    try {
      String appId = getStringResourceByName("ionic_app_id");
      j.put("appId", appId);
      j.put("debug", getStringResourceByName("ionic_debug"));
      j.put("channel", getStringResourceByName("ionic_channel_name"));
      j.put("host", getStringResourceByName("ionic_update_api"));
      j.put("updateMethod", getStringResourceByName("ionic_update_method"));
      j.put("maxVersions", maxV);

      // Until we update prefs in native-land, the only possible UUID here is 'none'
      j.put("currentVersionId", IonicCordovaCommon.NO_DEPLOY_LABEL);

      Log.d(TAG, "Got prefs for AppID: " + appId);
      final PluginResult result = new PluginResult(PluginResult.Status.OK, j);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get preferences", ex);
      callbackContext.error(ex.toString());
    }

    return true;
  }
}
