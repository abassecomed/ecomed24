const mail = require("../config").mailConfig;
const nodemailer = require("nodemailer");

// Send Mail

async function LabMailer(to, from, subject, html, attachments) {
  try {
    let transporter = nodemailer.createTransport(mail);
    // Utilise await SANS callback
    await transporter.sendMail({
      to: to,
      from: from,
      subject: subject,
      html: html,
      attachments: attachments,
    });
    // Si pas d'erreur, retourne true
    return true;
  } catch (error) {
    // Si erreur, relance-la
    throw error;
  }
}


module.exports = LabMailer;
