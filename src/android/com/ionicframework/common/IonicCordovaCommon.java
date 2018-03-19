package com.ionicframework.common;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;
import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

public class IonicCordovaCommon extends CordovaPlugin {
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
}
