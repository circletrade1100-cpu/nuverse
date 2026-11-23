/**
 * OneSignal Push Notification Service
 * 
 * Service untuk mengelola push notification menggunakan OneSignal
 */

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

const ONESIGNAL_CONFIG = {
  appId: "49f7341a-a53d-4a22-96bb-8cff716b5691",
  safari_web_id: "web.onesignal.auto.1f13959d-363e-4480-ae37-ce4b59dbb72b",
};

class OneSignalService {
  private initialized = false;

  /**
   * Initialize OneSignal
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.log('OneSignal sudah diinisialisasi');
      return;
    }

    try {
      // Pastikan OneSignal SDK sudah loaded
      if (!window.OneSignalDeferred) {
        window.OneSignalDeferred = [];
      }

      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: ONESIGNAL_CONFIG.appId,
          safari_web_id: ONESIGNAL_CONFIG.safari_web_id,
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true, // Untuk development
        });

        this.initialized = true;
        console.log('OneSignal berhasil diinisialisasi');
      });
    } catch (error) {
      console.error('Error inisialisasi OneSignal:', error);
    }
  }

  /**
   * Request permission untuk notifikasi
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!window.OneSignal) {
        console.error('OneSignal belum diinisialisasi');
        return false;
      }

      const permission = await window.OneSignal.Notifications.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error request permission:', error);
      return false;
    }
  }

  /**
   * Get user ID dari OneSignal
   */
  async getUserId(): Promise<string | null> {
    try {
      if (!window.OneSignal) {
        return null;
      }

      const userId = await window.OneSignal.User.PushSubscription.id;
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Set external user ID (untuk mapping dengan user di database)
   */
  async setExternalUserId(userId: string | number): Promise<void> {
    try {
      if (!window.OneSignal) {
        console.error('OneSignal belum diinisialisasi');
        return;
      }

      await window.OneSignal.login(userId.toString());
      console.log('External User ID set:', userId);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  /**
   * Remove external user ID (saat logout)
   */
  async removeExternalUserId(): Promise<void> {
    try {
      if (!window.OneSignal) {
        return;
      }

      await window.OneSignal.logout();
      console.log('External User ID removed');
    } catch (error) {
      console.error('Error removing external user ID:', error);
    }
  }

  /**
   * Send tag ke OneSignal untuk segmentasi
   */
  async sendTag(key: string, value: string): Promise<void> {
    try {
      if (!window.OneSignal) {
        console.error('OneSignal belum diinisialisasi');
        return;
      }

      await window.OneSignal.User.addTag(key, value);
      console.log(`Tag sent: ${key} = ${value}`);
    } catch (error) {
      console.error('Error sending tag:', error);
    }
  }

  /**
   * Send multiple tags
   */
  async sendTags(tags: Record<string, string>): Promise<void> {
    try {
      if (!window.OneSignal) {
        console.error('OneSignal belum diinisialisasi');
        return;
      }

      await window.OneSignal.User.addTags(tags);
      console.log('Tags sent:', tags);
    } catch (error) {
      console.error('Error sending tags:', error);
    }
  }

  /**
   * Check apakah notifikasi sudah diizinkan
   */
  async isNotificationPermissionGranted(): Promise<boolean> {
    try {
      if (!window.OneSignal) {
        return false;
      }

      const permission = await window.OneSignal.Notifications.permission;
      return permission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check apakah user sudah subscribe
   */
  async isPushSubscribed(): Promise<boolean> {
    try {
      if (!window.OneSignal) {
        return false;
      }

      const subscription = await window.OneSignal.User.PushSubscription.optedIn;
      return subscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }
}

// Export singleton instance
export const oneSignalService = new OneSignalService();
export default oneSignalService;

