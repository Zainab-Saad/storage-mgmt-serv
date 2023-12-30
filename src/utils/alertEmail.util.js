import nodemailer from 'nodemailer';
import ejs from 'ejs';

import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD
  }
});

const mailConfigurations = (userName, storageLeft, to) => {
  return {
    from: process.env.SENDER_EMAIL,
    to,
    subject: 'Photo Gallery - 80% Usage Alert',
    html: ejs.render(
      `
    <html>
      <body>
        <h3>Hello <%= userName %></h3>
        <p>You have crossed the threshold of 80% storage usage out of the 10 MBs</p>
        <p>Your current storage left is <b> <%= storageLeft %> MBs </b> </p>
        <p>You may delete some images to create more space</p>
        <p>Thanks</p>
      </body>
    </html>
  `,
      { userName, storageLeft }
    )
  };
};

export const sendAlertEmail = (userName, storageLeft, to) => {
  transporter.sendMail(
    mailConfigurations(userName, storageLeft, to, (error, info) => {
      if (error) {
        throw new Error(error);
      }
    })
  );
};
