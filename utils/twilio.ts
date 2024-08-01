// utils/twilio.ts

import twilio from 'twilio';

const accountSid = 'AC267c7407add423c2b7da6b28ea458082';
const authToken = '6faa89c14effbea866fd3f57f9981fb0';
const client = twilio(accountSid, authToken);

const verifyServiceSid = 'VAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // Replace with your actual Verify Service SID

export const sendVerification = async (to: string, channel: 'sms' | 'email') => {
    try {
        const verification = await client.verify.services(verifyServiceSid)
            .verifications
            .create({ to, channel });
        return verification;
    } catch (error) {
        console.error('Error sending verification:', error);
        throw new Error('Error sending verification');
    }
};

export const verifyCode = async (to: string, code: string) => {
    try {
        const verificationCheck = await client.verify.services(verifyServiceSid)
            .verificationChecks
            .create({ to, code });
        return verificationCheck;
    } catch (error) {
        console.error('Error verifying code:', error);
        throw new Error('Error verifying code');
    }
};
