import twilio from 'twilio';
import { config } from 'dotenv';

config({ path: './config.env' });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * @breif Send message to user
 * @param {String} message -> The SMS message
 * @param {String} to -> The receiver of the sms number
 */
const sendMessage = async (message, to) => {
  const from = process.env.TWILIO_FROM;
  if (process.env.NODE_ENV === 'production') {
    await client.messages.create({
      body: message,
      from,
      to,
    });
  }
};

export default sendMessage;
