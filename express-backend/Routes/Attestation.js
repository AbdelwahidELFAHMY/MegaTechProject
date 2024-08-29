import express from 'express';
import { attestation,getAttestations, deleteAttestation } from '../Controllers/attestation.js';

const router = express.Router();

router.get('/attestations_count', attestation);
router.get('/attestations',getAttestations );
router.delete('/attestation/delete/:id', deleteAttestation);


export default router;