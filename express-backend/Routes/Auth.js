import express from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword, logout,countUsers } from '../Controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/users_count',countUsers);

export default router;
