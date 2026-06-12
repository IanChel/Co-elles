const { Expo } = require('expo-server-sdk');

// Crée une instance client de l'Expo SDK
const expo = new Expo();

/**
 * Envoie une notification push à un ou plusieurs tokens
 * @param {Array<Object>} messages - Tableau d'objets { to: 'ExponentPushToken[...]', title: '...', body: '...', data: {...} }
 */
const sendPushNotifications = async (messages) => {
  const notifications = [];

  for (const message of messages) {
    if (!Expo.isExpoPushToken(message.to)) {
      console.error(`❌ Token push invalide : ${message.to}`);
      continue;
    }

    notifications.push({
      to: message.to,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data || {},
    });
  }

  // L'API Expo recommande d'envoyer les notifications par lots (chunks)
  const chunks = expo.chunkPushNotifications(notifications);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du chunk de notifications:', error);
    }
  }

  return tickets;
};

module.exports = { sendPushNotifications };
