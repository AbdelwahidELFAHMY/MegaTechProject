// routes.js
import path from 'path';
import express from 'express';
import multer from 'multer';
import { deleteProfileImage, updateProfile, sendAttestation } from '../Controllers/profile.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
 
const upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post('/update-profile', upload.single('profile_img'), updateProfile);

router.post('/delete-profile-image', deleteProfileImage);
router.post('/send-attestation', sendAttestation);

export default router;
