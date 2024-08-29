// controllers/comments.js
import pool from "../connectdb.js";

export const getComments = async (req, res) => {
  const { id_test } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT c.id_comment, c.id_test, c.id_utilisateur, c.date_creation, c.description, c.signaled,
             u.prenom AS Nom, u.profile_img AS ProfileImg
      FROM comments c
      JOIN utilisateurs u ON c.id_utilisateur = u.id
      WHERE c.id_test = ?
    `,
      [id_test]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const countComments = async (req, res) => {
  const { id_test } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE id_test = ?',
      [id_test]
    );

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ status: 'error', message: 'Server error!' });
  }
};

export const addComment = async (req, res) => {
  const { id_test, id_utilisateur, description } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO comments (id_test, id_utilisateur, description, date_creation)
      VALUES (?, ?, ?, NOW())
    `,
      [id_test, id_utilisateur, description]
    );

    const insertedId = result.insertId;
    const [newComment] = await pool.query(
      `
      SELECT c.id_comment, c.id_test, c.id_utilisateur, c.date_creation, c.description, c.signaled,
             u.prenom AS Nom, u.profile_img AS ProfileImg
      FROM comments c
      JOIN utilisateurs u ON c.id_utilisateur = u.id
      WHERE c.id_comment = ?
    `,
      [insertedId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ status: 'error', message: 'Server error!' });
  }
};

export const signalComment = async (req, res) => {
  const { id_comment } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE comments SET signaled = TRUE WHERE id_comment = ?`,
      [id_comment]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    res.json({ status: 'success', message: 'Comment signaled' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ status: 'error', message: 'Server error!' });
  }
};

export const countReportedComments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM comments WHERE signaled = 1"
    );

    const count = rows[0].count;
    res.status(200).json({ status: "success", count });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const query = `
      SELECT comments.id_comment, comments.description, comments.date_creation, comments.signaled, 
             utilisateurs.nom, utilisateurs.prenom, tests.title 
      FROM comments 
      JOIN utilisateurs ON comments.id_utilisateur = utilisateurs.id 
      JOIN tests ON comments.id_test = tests.id_test
    `;
    const [comments] = await pool.execute(query);
    res.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
}

export const deleteComment = async (req, res) =>{
  const commentId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id_comment = ?',
      [commentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    res.status(200).json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du Commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
