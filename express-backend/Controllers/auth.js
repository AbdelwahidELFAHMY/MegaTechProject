import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../connectdb.js";
import nodemailer from "nodemailer";
import { isValidEmail } from "../server.js";

const secretKey = "SECRET_KEY";
const saltRounds = 10;

export const register = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Tous les champs sont requis." });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ status: "error", message: "L'adresse email est invalide." });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM utilisateurs WHERE Email = ?",
      [email]
    );

    if (results.length > 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Cet e-mail est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationToken = jwt.sign({ email }, secretKey, {
      expiresIn: "1h",
    });

    await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, Email, Mot_passe, verificationToken) VALUES (?, ?, ?, ?, ?)",
      [nom, prenom, email, hashedPassword, verificationToken]
    );

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "abdelwahidfhmy@gmail.com",
        pass: "yjvt blgt eswp bpfx",
      },
    });

    const verificationUrl = `http://localhost:3000/login`;

    let mailOptions = {
      from: "abdelwahidfhmy@gmail.com",
      to: email,
      subject: "Vérification email",
      html: `
        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 100px;">
              <img src="https://i.postimg.cc/FRznV8sR/soralogo-template.png" alt="Logo" style="width: auto; height: 90px; background-color: blue;border-radius: 5px;">
            </div>
            <h3 style="color: #4CAF50;">Bonjour <strong>${prenom}${' '}${nom}</strong>,</h3>
            <h4 style="color: #555;">Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:</h4>
            <p style="text-align: center; margin: 20px 0;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifiez votre email</a>
            </p>
          </div>
        </body>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      status: "success",
      message:
        "Votre inscription a été enregistrée avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ status: "error", message: "Token de vérification manquant." });
  }

  try {
    const decoded = await jwt.verify(token, secretKey);
    const { email } = decoded;

    await pool.query("UPDATE utilisateurs SET verified = 1 WHERE Email = ?", [
      email,
    ]);

    res.json({ status: "success", message: "Email vérifié avec succès." });
  } catch (err) {
    res
      .status(400)
      .json({
        status: "error",
        message: "Token de vérification invalide ou expiré.",
      });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Tous les champs sont requis." });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM utilisateurs WHERE Email = ?",
      [email]
    );

    if (results.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    const { Mot_passe, ...others } = results[0];

    const isMatch = await bcrypt.compare(password, Mot_passe);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ id: others.id, email: others.Email }, secretKey, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res
      .status(200)
      .json({ status: "success", message: "Connexion réussie.", user: others });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT * FROM utilisateurs WHERE Email = ?",
      [email]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Email non trouvé." });
    }

    const resetToken = Math.random().toString(36).substr(2);
    const resetUrl = `http://localhost:3000/login`;

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "abdelwahidfhmy@gmail.com",
        pass: "yjvt blgt eswp bpfx",
      },
    });

    let mailOptions = {
      from: "abdelwahidfhmy@gmail.com",
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `<body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 100px;">
          <img src="https://i.postimg.cc/FRznV8sR/soralogo-template.png" alt="Logo" style="width: auto; height: 90px; background-color: blue;border-radius: 5px;">
         </div>
          <h3 style="color: #ff5722;">Bonjour,</h3>
          <h4 style="color: #555;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour vous connecter avec le nouveau mot de passe :</h4>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #ff5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se Connecter</a>
          </p>
        </div>
      </body>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email de réinitialisation envoyé." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query("UPDATE utilisateurs SET Mot_passe = ? WHERE Email = ?", [
      hashedPassword,
      email,
    ]);

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès.",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("token", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    })
    .status(200)
    .json("User has been logged out.");
};

export const countUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM utilisateurs"
    );

    const count = rows[0].count;
    res.status(200).json({ status: "success", count });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
