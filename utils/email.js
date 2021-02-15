const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.fromEmail = 'hello@skillthrive';
    this.fromName = 'Skillthrive';
  }

  async sendMagicLink() {
    const mailOptions = {
      to: this.to,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      templateId: 'd-677437ff4a564f16843acc9e722c0f34',
      dynamic_template_data: {
        url: this.url,
      },
    };

    await sgMail.send(mailOptions).then(() => {}, console.error);
  }
};
