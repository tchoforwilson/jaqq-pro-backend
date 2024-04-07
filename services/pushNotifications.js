import { Expo } from 'expo-server-sdk';
import config from '../configurations/config';

/**
 * @breif Send a push notification to the user
 * @param {String} targetExpoPushToken Expo Push notification token
 * @param {Object} message Message to send
 */
const sendPushNotification = async (targetExpoPushToken, message) => {
  const expo = new Expo({
    accessToken: config.expo.accessToken,
  });

  const chunks = expo.chunkPushNotifications([
    {
      to: targetExpoPushToken,
      sound: 'default',
      body: message,
    },
  ]);

  const sendChunks = async () => {
    chunks.forEach(async (chunk) => {
      console.log('Sending Chunk', chunk);

      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        console.log('Tickets', tickets);
      } catch (error) {
        console.log('Error sending chunk', error);
      }
    });
  };

  await sendChunks();
};

export default sendPushNotification;
