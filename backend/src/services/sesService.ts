import AWS from 'aws-sdk';
import { SESEmailParams } from '../types';

const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function sendEmail(params: SESEmailParams): Promise<string> {
  try {
    const emailParams: AWS.SES.SendEmailRequest = {
      Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@example.com',
      Destination: {
        ToAddresses: [params.to],
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: params.html,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const result = await ses.sendEmail(emailParams).promise();
    console.log('Email sent successfully:', result.MessageId);
    return result.MessageId;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendRawEmail(
  to: string,
  subject: string,
  html: string,
  attachmentBuffer?: Buffer,
  attachmentName?: string
): Promise<string> {
  try {
    // For simplicity, we'll use sendEmail for now
    // For attachments, you would need to use sendRawEmail with MIME content
    return await sendEmail({
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending raw email:', error);
    throw error;
  }
}

export async function verifyEmailIdentity(email: string): Promise<void> {
  try {
    await ses.verifyEmailIdentity({ EmailAddress: email }).promise();
    console.log(`Email identity ${email} verified`);
  } catch (error) {
    console.error('Error verifying email identity:', error);
    throw error;
  }
}
