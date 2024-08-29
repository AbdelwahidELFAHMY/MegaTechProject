import pool from "../connectdb.js";

export const getUsers = async (req, res) => {

  const userId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, prenom, Email, ville, id_role FROM utilisateurs WHERE id != ?`,[userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const promoteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE utilisateurs SET id_role = ? WHERE id = ?",
      [2, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [updatedUser] = await pool.query(
      "SELECT id, nom, prenom, Email, ville, id_role FROM utilisateurs WHERE id = ?",
      [userId]
    );
    res.json(userId);
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) =>{
  const userId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
