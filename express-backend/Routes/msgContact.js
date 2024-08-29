import express from 'express';
import sendEmail  from '../Controllers/msgContact.js';

const router = express.Router();

router.post('/send-email', sendEmail);

export default router;
