const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user,url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split('')[0];
    this.url = url;
    this.from = `KARAN NAIDU <${process.env.EMAIL_FROM}>`

  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid

      return nodemailer.createTransport({
        service: 'SendGrid', // we dont have to specify host and port as send grid alreadyknows when we specify  service
        auth: {
          user: process.env.SENDGRID_USERNAME,

          pass: process.env.SENDGRID_PASSWORD

        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  //send actual email 
  async send(template, subject) {
    //1) render html based on pug template 
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });// here dir name is utils 
    //2)define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
      //html:
    };
    //3) create a transport and send email 


    await this.newTransport().sendMail(mailOptions);//sendMail  is built-in node-Mailer 




  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to the Navtours family!')

  }



  async sendPasswordReset() {
    await this.send('passwordReset', 'Your Password reset token (valid for 10 mins)')

  }
}