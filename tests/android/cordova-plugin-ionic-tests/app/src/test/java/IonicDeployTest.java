import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import com.ionicframework.deploy.IonicDeploy;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.junit.Test;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

/**
 * Created by fuiste on 3/16/18.
 */
public class IonicDeployTest {

    /**
     * Instantiate a mocked CordovaInterface for testing
     *
     * @return the mocked interface
     */
    private static CordovaInterface getMockCordovaInterface(String version_label) throws Exception {
        // Init prefs mocks
        Editor mockEditor = mock(Editor.class);
        when(mockEditor.putString(anyString(), anyString())).thenReturn(mockEditor);
        when(mockEditor.remove(anyString())).thenReturn(mockEditor);

        SharedPreferences mockPreferences = mock(SharedPreferences.class);
        when(mockPreferences.edit()).thenReturn(mockEditor);
        when(mockPreferences.getString(eq("app_id"), anyString())).thenReturn("abcd1234");
        when(mockPreferences.getString(eq("channel"), anyString())).thenReturn("testing");
        when(mockPreferences.getString(eq("debug"), anyString())).thenReturn("false");
        when(mockPreferences.getString(eq("uuid"), anyString())).thenReturn("fake-uuid");
        when(mockPreferences.getString(eq("ionicdeploy_version_label"), anyString()))
                .thenReturn(version_label);

        // Init context mocks
        Context mockContext = mock(Context.class);
        when(mockContext.getSharedPreferences("com.ionic.deploy.preferences",
                Context.MODE_PRIVATE)).thenReturn(mockPreferences);

        // Init Package mocks
        PackageInfo mockPackageInfo = mock(PackageInfo.class);
        mockPackageInfo.versionName = "fake";
        mockPackageInfo.lastUpdateTime = 1521579650;

        PackageManager mockPackageManager = mock(PackageManager.class);
        when(mockPackageManager.getPackageInfo(anyString(), anyInt())).thenReturn(mockPackageInfo);

        // Init Activity mocks
        Activity mockActivity = mock(Activity.class);
        when(mockActivity.getApplicationContext()).thenReturn(mockContext);
        when(mockActivity.getPackageName()).thenReturn("testing");
        when(mockActivity.getPackageManager()).thenReturn(mockPackageManager);

        // Init Cordova mocks
        CordovaInterface mockCordova = mock(CordovaInterface.class);
        when(mockCordova.getActivity()).thenReturn(mockActivity);

        return mockCordova;
    }

    /**
     * Instantiate a mocked CordovaWebView.
     *
     * @return the mocked CordovaWebView
     */
    private static CordovaWebView getMockCordovaWebView() {
        return mock(CordovaWebView.class);
    }

    /**
     * Instantiate a mock IonicDeploy for testing, mocking out file access for config vars.
     *
     * @return the mocked IonicDeploy
     */
    private static IonicDeploy getMockDeploy() {
        return IonicDeployTest.getMockDeploy("false", "none");
    }

    /**
     * Instantiate a mock IonicDeploy for testing, mocking out file access for config vars.
     *
     * @param debug the debug config flag
     * @param updateMethod the update method config flag
     * @return the mocked IonicDeploy
     */
    private static IonicDeploy getMockDeploy(String debug, String updateMethod) {
        IonicDeploy deploy = mock(IonicDeploy.class);

        // Init file access mocks
        when(deploy.getStringResourceByName("ionic_app_id")).thenReturn("fake");
        when(deploy.getStringResourceByName("ionic_channel_name")).thenReturn("fake");
        when(deploy.getStringResourceByName("ionic_debug")).thenReturn(debug);
        when(deploy.getStringResourceByName("ionic_max_versions")).thenReturn("3");
        when(deploy.getStringResourceByName("ionic_update_method"))
                .thenReturn(updateMethod);

        return deploy;
    }

    /**
     * Test that the plugin can be initialized with a basic config.
     */
    @Test
    public void testInitialize() throws Exception {
        // Get a new deploy, cordova interface, and cordova webview
        CordovaInterface cordova = IonicDeployTest
                .getMockCordovaInterface(IonicDeploy.NO_DEPLOY_LABEL);
        CordovaWebView webView = IonicDeployTest.getMockCordovaWebView();
        IonicDeploy deploy = IonicDeployTest.getMockDeploy();

        // Use real init method
        doCallRealMethod().when(deploy).initialize(cordova, webView);

        // Call initialize with mock data
        deploy.initialize(cordova, webView);

        // Assert the deploy got initialized correctly
        assertEquals(deploy.app_id, "abcd1234");
        assertEquals(deploy.autoUpdate, "none");
        assertEquals(deploy.channel, "testing");
        assertEquals(deploy.debug, false);
    }
}
