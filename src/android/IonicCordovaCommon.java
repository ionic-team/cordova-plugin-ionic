package com.ionicframework.common;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.net.Uri;

import org.apache.commons.io.FileUtils;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.os.Environment;
import android.util.Log;
import android.app.Activity;
import android.content.pm.PackageInfo;
import android.os.Build;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Iterator;
import java.util.UUID;

public class IonicCordovaCommon extends CordovaPlugin {
  public static final String TAG = "IonicCordovaCommon";
  private static final String  PREFS_KEY = "ionicDeploySavedPreferences";
  private static final String  CUSTOM_PREFS_KEY = "ionicDeployCustomPreferences";
  private AssetManager assetManager;


  private SharedPreferences prefs;
  private String uuid;

  private interface FileOp {
    void run(final JSONArray args, final CallbackContext callbackContext) throws Exception;
  }

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
    assetManager = cordova.getContext().getAssets();

    // Get or generate a plugin UUID
    this.uuid = this.prefs.getString("uuid", UUID.randomUUID().toString());
    prefs.edit().putString("uuid", this.uuid).apply();
  }

  private void threadhelper(final FileOp f, final JSONArray args, final CallbackContext callbackContext){
    cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        try {
          f.run(args, callbackContext);
        } catch ( Exception e) {
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  /**
   * Executes the request and returns PluginResult.
   *
   * @param action            The action to execute.
   * @param args              JSONArray of arguments for the plugin.
   * @param callbackContext   The callback id used when calling back into JavaScript.
   * @return                  True if the action was valid, false if not.
   */
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("getAppInfo")) {
      this.getAppInfo(callbackContext);
    } else if (action.equals("getPreferences")) {
      this.getPreferences(callbackContext);
    } else if (action.equals("setPreferences")) {
      this.setPreferences(callbackContext, args.getJSONObject(0));
    } else if (action.equals("configure")){
      this.configure(callbackContext, args.getJSONObject(0));
    } else if (action.equals("copyTo")){
      this.copyTo(callbackContext, args.getJSONObject(0));
    } else if (action.equals("remove")){
      this.remove(callbackContext, args.getJSONObject(0));
    } else if (action.equals("downloadFile")){
      threadhelper( new FileOp( ){
        public void run(final JSONArray passedArgs, final CallbackContext cbcontext) throws JSONException {
          downloadFile(cbcontext, passedArgs.getJSONObject(0));
        }
      }, args, callbackContext);

    } else {
      return false;
    }

    return true;
  }

  private File getDirectory(String directory) {
    Context c = cordova.getContext();
    switch(directory) {
      case "DOCUMENTS":
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
      case "DATA":
        return c.getFilesDir();
      case "CACHE":
        return c.getCacheDir();
      case "EXTERNAL":
        return c.getExternalFilesDir(null);
      case "EXTERNAL_STORAGE":
        return Environment.getExternalStorageDirectory();
    }
    return null;
  }

  private void copyAssets(String assetPath, String targetDir) throws IOException {
    String[] files = null;
    try {
      files = assetManager.list(assetPath);
    } catch (IOException e) {
      Log.e("tag", "Failed to get asset file list.", e);
    }
    if (files != null) for (String filename : files) {
      InputStream in = null;
      OutputStream out = null;
      try {
        if (assetManager.list(assetPath + "/" + filename).length > 0) {
          File newDir = new File(targetDir, filename);
          newDir.mkdir();
          copyAssets(assetPath + "/" + filename, newDir.getPath());
          continue;
        }
        in = assetManager.open(assetPath + "/" + filename);
        File destDir = new File(targetDir);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }
        File outFile = new File(targetDir, filename);
        out = new FileOutputStream(outFile);
        copyFile(in, out);
      } catch(IOException e) {
        Log.e("tag", "Failed to copy asset file: " + filename, e);
      }
      finally {
        if (in != null) {
          try {
            in.close();
          } catch (IOException e) {
            // NOOP
          }
        }
        if (out != null) {
          try {
            out.close();
          } catch (IOException e) {
            // NOOP
          }
        }
      }
    }
  }

  private void copyFile(InputStream in, OutputStream out) throws IOException {
    byte[] buffer = new byte[1024];
    int read;
    while((read = in.read(buffer)) != -1){
      out.write(buffer, 0, read);
    }
  }

  /**
   * copy a directory or file to another location
   *
   */
  public void copyTo(CallbackContext callbackContext, JSONObject options) throws JSONException {
    Log.d(TAG, "copyTo called with " + options.toString());
    PluginResult result;

    try {
      JSONObject source = options.getJSONObject("source");
      String target = options.getString("target");

      if (source.getString("directory").equals("APPLICATION")) {
        this.copyAssets(source.getString("path"), target);
      } else {
        File srcDir = this.getDirectory(source.getString("directory"));
        File srcFile = new File(srcDir.getPath() + "/" + source.getString("path"));

        if (!srcFile.exists()) {
          result = new PluginResult(PluginResult.Status.ERROR, "source file or directory does not exist");
          result.setKeepCallback(false);
          callbackContext.sendPluginResult(result);
          return;
        }

        if (srcFile.isDirectory()) {
          FileUtils.copyDirectory(srcFile, new File(target));
        } else {
          FileUtils.copyFile(srcFile, new File(target));
        }
      }
    } catch (Exception e) {
      result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }

    result = new PluginResult(PluginResult.Status.OK);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
  }

  /**
   * recursively remove a directory or a file
   *
   */
  public void remove(CallbackContext callbackContext, JSONObject options) throws JSONException {
    Log.d(TAG, "recursiveRemove called with " + options.toString());
    String target = options.getString("target");
    File dest = new File(target);
    final PluginResult result;

    if (!dest.exists()) {
      result = new PluginResult(PluginResult.Status.ERROR, "file or directory does not exist");
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }

    try {
      FileUtils.forceDelete(dest);
    } catch (IOException e) {
      result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }

    result = new PluginResult(PluginResult.Status.OK);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
  }

  public void downloadFile(CallbackContext callbackContext, JSONObject options) throws JSONException {
    Log.d(TAG, "downloadFile called with " + options.toString());
    String url = options.getString("url");
    String dest = options.getString("target");
    final PluginResult result;

    try {
      URL u = new URL(url);
      InputStream is = u.openStream();

      DataInputStream dis = new DataInputStream(is);

      byte[] buffer = new byte[1024];
      int length;

      File downFile = new File(dest);
      downFile.getParentFile().mkdirs();
      downFile.createNewFile();
      FileOutputStream fos = new FileOutputStream(downFile);
      while ((length = dis.read(buffer))>0) {
        fos.write(buffer, 0, length);
      }

    } catch (Exception e) {
      Log.e(TAG, "downloadFile error", e);
      result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }
    result = new PluginResult(PluginResult.Status.OK);
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
      String versionName = pInfo.versionName;
      String name = pInfo.packageName;
      int versionCode = pInfo.versionCode;
      String platformVersion = String.valueOf(Build.VERSION.RELEASE);

      j.put("platform", "android");
      j.put("platformVersion", platformVersion);
      j.put("version", versionCode);
      j.put("binaryVersionCode", versionCode);
      j.put("bundleName", name);
      j.put("bundleVersion", versionName);
      j.put("binaryVersionName", versionName);
      j.put("device", this.uuid);
      j.put("dataDirectory", toDirUrl(cordova.getActivity().getFilesDir()));

      Log.d(TAG, "Got package info. Version: " + versionName + ", bundleName: " + name + ", versionCode: " + versionCode);
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
   * Get saved prefs configured via code at runtime
   *
   */
  public JSONObject getCustomConfig() throws JSONException {
    SharedPreferences prefs = this.cordova.getActivity().getApplicationContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    String prefsString = prefs.getString(this.CUSTOM_PREFS_KEY, null);
    if (prefsString != null) {
      JSONObject customPrefs = new JSONObject(prefsString);
      return customPrefs;
    }
    return new JSONObject("{}");
  }

  /**
   * Set saved prefs configured via code at runtime
   *
   */
  public void configure(CallbackContext callbackContext, JSONObject newConfig) throws JSONException {
    Log.i(TAG, "Set custom config called with " + newConfig.toString());
    SharedPreferences prefs = this.cordova.getActivity().getApplicationContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    SharedPreferences.Editor editor = prefs.edit();
    JSONObject storedConfig = this.getCustomConfig();
    this.mergeObjects(storedConfig, newConfig);
    editor.putString(this.CUSTOM_PREFS_KEY, storedConfig.toString());
    editor.commit();
    Log.i(TAG, "config updated");

    final PluginResult result = new PluginResult(PluginResult.Status.OK, storedConfig);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
  }

  /**
   * Get cordova plugin preferences and state information.
   *
   * @param callbackContext The callback id used when calling back into JavaScript.
   */
  public void getPreferences(CallbackContext callbackContext) throws JSONException {

    JSONObject nativePrefs = this.getNativeConfig();
    JSONObject customPrefs = this.getCustomConfig();

    // Check for prefs that have been saved before
    SharedPreferences prefs = this.cordova.getActivity().getApplicationContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    String prefsString = prefs.getString(this.PREFS_KEY, null);
    if (prefsString != null) {
      JSONObject savedPrefs;
      Log.i(TAG, "Found saved prefs: " + prefsString);
      // grab the save prefs
      savedPrefs = new JSONObject(prefsString);

      // update with the lastest things from config.xml
      this.mergeObjects(savedPrefs, nativePrefs);

      // update with the lastest things from custom configuration
      this.mergeObjects(savedPrefs, customPrefs);

      final PluginResult result = new PluginResult(PluginResult.Status.OK, savedPrefs);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
      return;
    }

    // no saved prefs were found
    try {
      nativePrefs.put("updates", new JSONObject("{}"));
      final PluginResult result = new PluginResult(PluginResult.Status.OK, nativePrefs);
      result.setKeepCallback(false);
      callbackContext.sendPluginResult(result);
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get preferences", ex);
      callbackContext.error(ex.toString());
    }
  }

  private JSONObject getNativeConfig() throws JSONException {
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
    String versionName;
    int versionCode;
    try {
      PackageInfo pInfo = this.cordova.getActivity().getPackageManager().getPackageInfo(this.cordova.getActivity().getPackageName(), 0);
      versionName = pInfo.versionName;
      versionCode = pInfo.versionCode;
    } catch(Exception ex) {
      Log.e(TAG, "Unable to get package info", ex);
      versionName = "unknown";
      versionCode = 0;
    }

    String appId = getStringResourceByName("ionic_app_id");
    j.put("appId", appId);
    j.put("disabled", preferences.getBoolean("DisableDeploy", false));
    j.put("channel", getStringResourceByName("ionic_channel_name"));
    j.put("host", getStringResourceByName("ionic_update_api"));
    j.put("updateMethod", getStringResourceByName("ionic_update_method"));
    j.put("maxVersions", maxV);
    j.put("minBackgroundDuration", minBackgroundDuration);
    j.put("binaryVersion", versionName);
    j.put("binaryVersionName", versionName);
    j.put("binaryVersionCode", versionCode);


    Log.d(TAG, "Got Native Prefs for AppID: " + appId);
    return j;
  }

  /**
   * Add any keys from obj2 into obj1 overwriting them if they exist
   */
  private void mergeObjects(JSONObject obj1, JSONObject obj2) {
    Iterator it = obj2.keys();
    while (it.hasNext()) {
      String key = (String)it.next();
      try {
        obj1.putOpt(key, obj2.opt(key));
      } catch (JSONException ex) {
        Log.d(TAG, "key didn't exist when merging object");
      }
    }
  }

  /**
   * Set cordova plugin preferences and state information.
   *  @param callbackContext The callback id used when calling back into JavaScript.
   * @param newPrefs
   */
  public void setPreferences(CallbackContext callbackContext, JSONObject newPrefs) {
    Log.i(TAG, "Set preferences called with prefs" + newPrefs.toString());
    SharedPreferences prefs = this.cordova.getActivity().getApplicationContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    SharedPreferences.Editor editor = prefs.edit();
    editor.putString(this.PREFS_KEY, newPrefs.toString());
    editor.commit();
    Log.i(TAG, "preferences updated");
    final PluginResult result = new PluginResult(PluginResult.Status.OK, newPrefs);
    result.setKeepCallback(false);
    callbackContext.sendPluginResult(result);
  }

  private static String toDirUrl(File f) {
    return Uri.fromFile(f).toString() + '/';
  }

}
