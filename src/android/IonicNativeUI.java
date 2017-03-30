/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/
package io.ionic.nativeui;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

public class IonicNativeUI extends CordovaPlugin {
    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
//        ViewGroup webViewParent = ((FrameLayout)webView.getView().getParent());
//        webViewParent.removeView(webView.getView());
//        webViewParent.addView();
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
        if ("push".equals(action)) {
            push();
        }
        else if ("pop".equals(action)) {

        }
        else {
            return false;
        }
        return true;
    }

    public void push() {
        PageFragment newPage = new PageFragment();
        FragmentTransaction transaction = cordova.getActivity().getFragmentManager().beginTransaction();
        transaction.add(android.R.id.content, newPage)
            .addToBackStack(null)
            .commit();
    }

    public void pop() {

    }

    public Bitmap takeScreenshot() {
        View v1 = cordova.getActivity().getWindow().getDecorView().getRootView();
        v1.setDrawingCacheEnabled(true);
        Bitmap bitmap = Bitmap.createBitmap(v1.getDrawingCache());
        v1.setDrawingCacheEnabled(false);
        return bitmap;

//        ByteArrayOutputStream stream = new ByteArrayOutputStream();
//        bitmap.compress(Bitmap.CompressFormat.JPEG, 50, stream);
//        return stream.toByteArray();
    }

    public static class PageFragment extends Fragment {
        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {
            View test = new View(getActivity());
            test.setLayoutParams(new LinearLayout.LayoutParams(
                500, 1000
            ));
            test.setBackgroundColor(Color.BLACK);
            return test;
//            View blah = new View();
            // Inflate the layout for this fragment
//            return inflater.inflate(R.layout.example_fragment, container, false);
        }

        @Override
        public void onAttach(Context context) {
            super.onAttach(context);
            ((Activity)context).getFragmentManager().addOnBackStackChangedListener(
                new FragmentManager.OnBackStackChangedListener() {
                    public void onBackStackChanged() {
                        // Update your UI here.
                    }
                });

        }
    }


}
