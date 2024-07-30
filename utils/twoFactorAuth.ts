import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
}

const client = twilio(accountSid, authToken);

export const sendTwoFactorAuthEmail = async (email: string, token: string) => {
  // Your email sending logic here
};

export const sendTwoFactorAuthSMS = async (phone: string, token: string) => {
  await client.messages.create({
    body: `Your verification code is ${token}`,
    from: '+1234567890', // Your Twilio phone number
    to: phone,
  });
};
