import { isValidEmail } from "../server.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const sendEmail = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ status: "error", message: "Tous les champs sont requis." });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ status: "error", message: "L'adresse email est invalide." });
  }

  // Créer un transporteur pour l'envoi d'e-mail
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "abdelwahidfhmy@gmail.com",
      pass: "yjvt blgt eswp bpfx",
    },
  });

  // Définir les options de l'e-mail
  const mailOptions = {
    from: email,
    to: "abdelwahidfhmy@gmail.com",
    subject: "Nouveau message de contact",
    html: `
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; justify-content: center; align-content: center;">
        <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border-radius: 10px;text-align: justify; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7); justify-content: center; align-content: center;">
            <div style="text-align: center; margin-bottom: 100px;">
              <img src="https://i.postimg.cc/FRznV8sR/soralogo-template.png" alt="Logo" style="width: auto; height: 90px; background-color: blue;border-radius: 5px;">
            </div>          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #0d47a1; margin: 0; text-align: center">Nom :</h2>
            <p style="font-size: 18px; color: #555; margin: 0px 20px; text-align: center">${name}</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #0d47a1; margin: 0; text-align: center">Email :</h2>
            <p style="font-size: 16px; color: #555; margin: 0px 20px; text-align: center">${email}</p>
          </div>
          <h2 style="color: #0d47a1; width: 100%; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; margin-bottom: 20px; text-align: center">Message :</h2>
          <p style="font-size: 16px; font-weight: 550; color: #777; line-height: 1.6; text-align: justify">${message}</p>
        </div>
      </body>
    `,
  };

  // Envoyer l'e-mail avec les promesses
  transporter
    .sendMail(mailOptions)
    .then(() => {
      res.json({ status: "success", message: "E-mail envoyé avec succès." });
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).json({
        status: "error",
        message: `Échec de l'envoi de l'e-mail. Erreur : ${error.message}`,
      });
    });
};

export default sendEmail;
