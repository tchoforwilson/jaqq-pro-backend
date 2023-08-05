import twilio from 'twilio';
import config from '../configurations/config.js';

const client = twilio(config.twilio.sid, config.twilio.token);

/**
 * @breif Send message to user
 * @param {String} message -> The SMS message
 * @param {String} to -> The receiver of the sms number
 */
const sendMessage = async (message, to) => {
  const from = config.twilio.from;
  if (config.env === 'production') {
    await client.messages.create({
      body: message,
      from,
      to,
    });
  }
};

export default sendMessage;
