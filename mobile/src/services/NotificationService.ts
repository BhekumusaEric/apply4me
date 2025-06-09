import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../context/AuthContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.registerForPushNotifications();
      await this.setupNotificationCategories();
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });

      this.expoPushToken = token.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create specific channels for different notification types
        await Notifications.setNotificationChannelAsync('applications', {
          name: 'Application Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007A4D',
        });

        await Notifications.setNotificationChannelAsync('deadlines', {
          name: 'Application Deadlines',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('application_update', [
        {
          identifier: 'view_application',
          buttonTitle: 'View Application',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('deadline_reminder', [
        {
          identifier: 'apply_now',
          buttonTitle: 'Apply Now',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'remind_later',
          buttonTitle: 'Remind Later',
          options: { opensAppToForeground: false },
        },
      ]);
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data;

    switch (actionIdentifier) {
      case 'view_application':
        // Navigate to application details
        console.log('Navigate to application:', data.applicationId);
        break;
      case 'apply_now':
        // Navigate to institution or application form
        console.log('Navigate to apply:', data.institutionId);
        break;
      case 'remind_later':
        // Schedule reminder for later
        this.scheduleDeadlineReminder(data.applicationId, 24 * 60 * 60); // 24 hours
        break;
      default:
        // Default action (tap notification)
        console.log('Default notification action:', data);
        break;
    }
  }

  async savePushTokenToDatabase(userId: string): Promise<void> {
    try {
      if (!this.expoPushToken) {
        console.log('No push token available');
        return;
      }

      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          push_token: this.expoPushToken,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error saving push token to database:', error);
    }
  }

  async scheduleLocalNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  async scheduleDeadlineReminder(
    applicationId: string,
    secondsFromNow: number
  ): Promise<string | null> {
    try {
      return await this.scheduleLocalNotification(
        {
          title: 'Application Deadline Reminder',
          body: 'Don\'t forget to submit your application!',
          data: { applicationId, type: 'deadline_reminder' },
          categoryId: 'deadline_reminder',
        },
        { seconds: secondsFromNow }
      );
    } catch (error) {
      console.error('Error scheduling deadline reminder:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  async sendTestNotification(): Promise<void> {
    try {
      await this.scheduleLocalNotification(
        {
          title: 'Test Notification',
          body: 'This is a test notification from Apply4Me!',
          data: { test: true },
        },
        { seconds: 2 }
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
