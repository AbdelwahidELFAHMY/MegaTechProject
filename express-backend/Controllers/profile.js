// profile.js
import path from 'path';
import fs from 'fs/promises'; // Utilisation de fs/promises pour utiliser les promesses
import { fileURLToPath } from 'url';
import pool from '../connectdb.js';
import nodemailer from 'nodemailer';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {
  const { id, nom, prenom, Email, ville } = req.body;
  const profile_img = req.file ? req.file.filename : null;

  if (!nom || !prenom || !Email) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  try {
    // Retrieve the current profile image filename
    const [rows] = await pool.query('SELECT profile_img FROM utilisateurs WHERE id = ?', [id]);
    const oldProfileImg = rows[0].profile_img;

    // If a new image was uploaded, set it as the new profile image, otherwise keep the old one
    const newProfileImg = profile_img || oldProfileImg;

    // Update profile in the database
    const [result] = await pool.query(
      'UPDATE utilisateurs SET nom = ?, prenom = ?, Email = ?, ville = ?, profile_img = ? WHERE id = ?',
      [nom, prenom, Email, ville, newProfileImg, id]
    );

    if (result.affectedRows > 0) {
      // If there was an old profile image and a new image is uploaded, delete the old image file
      if (oldProfileImg && profile_img) {
        const oldFilePath = path.join(__dirname, '../uploads/', oldProfileImg);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old profile image:', err);
        }
      }
      res.json({ status: 'success', message: 'Profile updated successfully!', user: { id, nom, prenom, Email, ville, profile_img: newProfileImg } });
    } else {
      res.status(400).json({ status: 'error', message: 'Profile update failed!' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ status: 'error', message: 'Server error!' });
  }
};

export const deleteProfileImage = async (req, res) => {
  const { id, profile_img } = req.body;

  if (!id || !profile_img) {
    return res.status(400).json({ status: 'error', message: 'Invalid request.' });
  }

  try {
    const filePath = path.join(__dirname, '../uploads/', profile_img);

    // Delete the image file
    await fs.unlink(filePath);

    // Update database to remove image reference
    const [result] = await pool.query(
      'UPDATE utilisateurs SET profile_img = NULL WHERE id = ?',
      [id]
    );

    if (result.affectedRows > 0) {
      res.json({ status: 'success', message: 'Profile image deleted successfully!' });
    } else {
      res.status(400).json({ status: 'error', message: 'Error updating user profile.' });
    }
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'abdelwahidfhmy@gmail.com',
    pass: 'yjvt blgt eswp bpfx'
  }
});

export const sendAttestation = async (req, res) => {
  const { name, email, course, result, address, phone, testId, userId } = req.body;

  const mailOptions = {
    from: email, 
    to: 'abdelwahidfhmy@gmail.com',
    subject: 'Demande d\'Attestation de Réussite',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 100px;">
          <img src="https://i.postimg.cc/FRznV8sR/soralogo-template.png" alt="Logo" style="width: auto; height: 90px; background-color: blue;border-radius: 5px;">
        </div>
        <p style="font-size: 16px; color: #333;">Bonjour,</p>
        <p style="font-size: 16px; color: #333;">L'utilisateur <strong>${name}</strong> a complété le test <strong>"${course}"</strong>.</p>
        <p style="font-size: 16px; color: #333;">Le Resultat Final : <strong>${result}%</strong>.</p>
        <p style="font-size: 16px; color: #333;">Adresse de l'utilisateur : <strong>${address}</strong>.</p>
        <p style="font-size: 16px; color: #333;">Téléphone de l'utilisateur : <strong>${phone}</strong>.</p>
        <p style="font-size: 16px; color: #333;">Email de l'utilisateur : <strong>${email}</strong>.</p>
        <p style="font-size: 16px; color: #333;">Merci de lui livrer l'attestation correspondante.</p>
        <div style="text-align: center; margin-top: 20px;">
        </div>
      </div>`
  };

  try {
    
    await transporter.sendMail(mailOptions);

    await pool.query(
      'INSERT INTO attestations (id_test, id_utilisateur) VALUES (?, ?)',
      [testId, userId]
    );

    res.send('Demande d\'attestation envoyée avec succès.');
  } catch (error) {
    console.error('Error sending email or saving data:', error);
    res.status(500).send('Erreur lors de l’envoi de l’email ou de l’enregistrement des données.');
  }
};