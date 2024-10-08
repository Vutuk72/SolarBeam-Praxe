"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.vojtechpetrasek.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "solarbeam@vojtechpetrasek.com",
    pass: "kz@4^MxUo@P@nyLL3V!G7F5*IC1UGqe0A!qE%FNn",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Solarbeam 👻" <solarbeam@vojtechpetrasek.com>', // sender address
    to: "brincil@solarbeam.cz", // list of receivers
    bcc: ["vpetras@vojtechpetrasek.com", "vojtechpetrasek@gmail.com"],
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}

main().catch(console.error);
