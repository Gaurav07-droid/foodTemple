const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `Gaurav Bhardwaj <${process.env.Email_From}>`);
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid
      return nodemailer.createTransport({
        service: 'Sendinblue',
        auth: {
          user: process.env.sendInBlue_Username,
          pass: process.env.sendInBlue_Password,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.Email_port,
      auth: {
        user: process.env.Email_username,
        pass: process.env.Email_password,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1.. render html based on apug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2.. Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //3.. create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the FoodTemple family!');
  }

  async sendPasswordToken() {
    await this.send(
      'passwordReset',
      'Reset password token(Valid for only 10 minutes)'
    );
  }
};
