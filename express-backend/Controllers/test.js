// controllers/tests.js
import pool from "../connectdb.js";
import fs from "fs";
import sharp from "sharp";

export const addTest = async (req, res) => {
  const { title, description, documentation } = req.body;
  let image = null;

  if (req.file) {
    const filename = Date.now() + ".webp"; // Nom du fichier converti
    const outputPath = `./uploads/Upload/${filename}`;
    
    try {
      // Compression et conversion de l'image en WebP
      await sharp(req.file.buffer)
        .resize(800) // Redimensionner l'image à une largeur maximale de 800px
        .webp({ quality: 100 }) // Convertir en WebP avec une qualité de 80
        .toFile(outputPath);
      
      image = filename;
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ error: 'Failed to process image' });
    }
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tests (title, image, description, documentation) VALUES (?, ?, ?, ?)',
      [title, image, description, documentation]
    );

    const newTestId = result.insertId;

    const [newTestResult] = await pool.query(
      'SELECT * FROM tests WHERE id_test = ?',
      [newTestId]
    );

    if (newTestResult.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.status(201).json(newTestResult[0]);
  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({ error: 'Failed to add test' });
  }
};

export const updateTest = async (req, res) => {
  const { id } = req.params;
  const { title, description, documentation } = req.body;
  let image;

  try {
    if (req.file) {
      const filename = Date.now() + ".webp"; // Nom du fichier converti
      const outputPath = `./uploads/Upload/${filename}`;

      // Compression et conversion de l'image en WebP
      await sharp(req.file.buffer)
        .resize(800) // Redimensionner l'image
        .webp({ quality: 80 }) // Convertir en WebP
        .toFile(outputPath);
      
      image = filename;

      const oldImageQuery = "SELECT image FROM tests WHERE id_test = ?";
      const [oldImageResult] = await pool.execute(oldImageQuery, [id]);

      if (oldImageResult.length > 0 && oldImageResult[0].image) {
        const oldImagePath = `./uploads/Upload/${oldImageResult[0].image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Build the SQL query dynamically
    let updateQuery =
      "UPDATE tests SET title = ?, description = ?, documentation = ?";
    const queryParams = [title, description, documentation];

    if (image) {
      updateQuery += ", image = ?";
      queryParams.push(image);
    }

    updateQuery += " WHERE id_test = ?";
    queryParams.push(id);

    // Execute the update query
    const [result] = await pool.execute(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cours not found" });
    }

    res.json({ message: "Cours updated successfully" });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ message: "Error updating test" });
  }
};

export const deleteTest = async (req, res) => {
  const testId = req.params.id;

  try {
    // Fetch the image associated with the test
    const oldImageQuery = "SELECT image FROM tests WHERE id_test = ?";
    const [oldImageResult] = await pool.execute(oldImageQuery, [testId]);

    if (oldImageResult.length > 0 && oldImageResult[0].image) {
      const oldImagePath = `./uploads/Upload/${oldImageResult[0].image}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const [result] = await pool.execute("DELETE FROM tests WHERE id_test = ?", [
      testId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    res.status(200).json({ message: "Cours supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du Cours:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getTests = async (req, res) => {
  const q = `SELECT * FROM tests`;

  try {
    const [data] = await pool.query(q);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTestById = async (req, res) => {
  const testId = req.params.id;

  const queryTest = `SELECT * FROM tests WHERE id_test = ?`;
  const queryQuestions = `SELECT * FROM questions WHERE id_test = ?`;
  const queryOptions = `SELECT * FROM options WHERE id_question = ?`;
  const queryCorrectAnswers = `SELECT id_option FROM correct_answers WHERE id_option IN (SELECT id_option FROM options WHERE id_question = ?)`;

  try {
    const [[test]] = await pool.query(queryTest, [testId]);

    if (!test) return res.status(404).json({ message: "Test not found" });

    const [questions] = await pool.query(queryQuestions, [testId]);

    // Fetch options and correct answers for each question
    const fetchOptionsAndAnswers = questions.map(async (question) => {
      const [optionResults] = await pool.query(queryOptions, [
        question.id_question,
      ]);
      const [correctAnswerResults] = await pool.query(queryCorrectAnswers, [
        question.id_question,
      ]);

      // Create a map of options by their id
      const optionsMap = new Map(
        optionResults.map((option) => [option.id_option, option.option_text])
      );

      // Determine the index of the correct answers
      const correctAnswerIndices = correctAnswerResults
        .map((answer) => optionsMap.get(answer.id_option))
        .map((correctOptionText) =>
          optionResults.findIndex(
            (option) => option.option_text === correctOptionText
          )
        );

      // Add options and correct answers to the question object
      question.options = optionResults.map((option) => option.option_text);
      question.correctAnswer = correctAnswerIndices;
    });

    await Promise.all(fetchOptionsAndAnswers);

    // Organize the final structure of the test object
    const formattedTest = {
      id: test.id_test,
      documentation: test.documentation,
      title: test.title,
      image: test.image, // Adjust this if the field name is different
      description: test.description,
      questions: questions.map((q) => ({
        id: q.id_question,
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswer, // Multiple correct answers are now handled
      })),
    };

    res.status(200).json(formattedTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTitles = async (req, res) => {
  const q = `SELECT id_test, title, description FROM tests`;

  try {
    const [data] = await pool.query(q);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const addQuestion = async (req, res) => {
  const { testId, question, options, correct_answer } = req.body;

  try {
    const [questionResult] = await pool.query(
      'INSERT INTO questions (id_test, question) VALUES (?, ?)',
      [testId, question]
    );

    const questionId = questionResult.insertId;

    const optionInserts = options.map(option => 
      pool.query('INSERT INTO options (id_question, option_text) VALUES (?, ?)', [questionId, option])
    );

    await Promise.all(optionInserts);

    const [correctOptionResult] = await pool.query(
      'SELECT id_option FROM options WHERE id_question = ? AND option_text = ?',
      [questionId, options[correct_answer - 1]]
    );

    const correctOptionId = correctOptionResult[0]?.id_option;

    if (correctOptionId) {
      // Insert correct answer into the database
      await pool.query(
        'INSERT INTO correct_answers (id_option) VALUES (?)',
        [correctOptionId]
      );
    }

    res.status(201).json({ message: 'Question added successfully', questionId });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

