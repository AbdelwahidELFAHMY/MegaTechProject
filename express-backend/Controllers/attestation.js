import pool from "../connectdb.js";

export const attestation = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM attestations"
    );

    const count = rows[0].count;
    res.status(200).json({ status: "success", count });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAttestations = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT a.id, u.nom, u.prenom, u.Email, t.title, a.date_Demande 
      FROM attestations a
      JOIN utilisateurs u ON a.id_utilisateur = u.id
      JOIN tests t ON a.id_test = t.id_test
      ORDER BY a.date_Demande DESC
    `);
    res.json(result);
  } catch (error) {
    console.error('Error fetching attestations:', error);
    res.status(500).send('Server Error');
  }
};

export const deleteAttestation = async (req, res) => {
  const attestationId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM attestations WHERE id = ?',
      [attestationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attestation non trouvé' });
    }

    res.status(200).json({ message: 'Attestation supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression d Attestation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
