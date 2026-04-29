import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

// CLASS VALIDATION
//--------------------------------------------------------------
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
class Exercise {
  constructor ({exercise_name, difficult_level, required_level, Muscle_name, Sets}) {
     if (!exercise_name) {
      throw new ValidationError("Назва вправи не може бути пустим рядком");
    } else if (!difficult_level) {
      throw new ValidationError("рівень складності не може бути пустим рядком");
    } 
    else if (difficult_level < 1 || difficult_level > 10) {
      throw new ValidationError("рівень складності повинен бути між 1 і 10");
    }
    else if (!required_level) {
      throw new ValidationError("Рівень підготовки не може бути пустим рядком");
    } else if (!Muscle_name) {
      throw new ValidationError("Назва м'яза не може бути пустим рядком");
    }
      else if (!Sets) {
      throw new ValidationError("Кількість підходів не може бути пустим рядком");
    } else if (Sets < 1) {
      throw new ValidationError("Кількість підходів не може бути менше 1");
    } 
    this.exercise_name = exercise_name;
    this.difficult_level = difficult_level;
    this.required_level = required_level;
    this.Muscle_name = Muscle_name;
    this.Sets = Sets;
  }
  }


//--------------------------------------------------------------

// ADD EXERCISE
router.get('/', async function (req, res, next) {
  const exercise = await db.query('SELECT * FROM gym2');

  const modExercise = exercise.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('gym2', { exercise: modExercise || [] });
});
router.get('/addExercise', async function (req, res, next) {
  res.render('forms/gym_form');
})

router.post('/addExercise', async function (req, res, next) {
  console.log("Submitted data: ", req.body);

  

    try {
      const ValidationExercise = new Exercise(req.body)
      const query = `
      INSERT INTO gym2 (
            exercise_name, difficult_level, required_level, Muscle_name, Sets
        )
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
      const result = await db.query(query, [
        ValidationExercise.exercise_name,
        ValidationExercise.difficult_level,
        ValidationExercise.required_level,
        ValidationExercise.Muscle_name,
        ValidationExercise.Sets
      ]);
      res.redirect('/gym2');

    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).send(`Помилка додавання вправи: ${err.message}`);
      }
      res.status(500).send(`Error: ${err.message}`);
    }
  }
);
//--------------------------------------------------------------

// DELETE
router.get("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM gym2 WHERE id = $1", [id]);
    res.redirect("/gym2");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Could not delete exercise");
  }
});
//--------------------------------------------------------------


// Edit
// -------------------------------------------------------------
router.get('/edit/:id', async function (req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM gym2 WHERE id = $1',
      [req.params.id]
    );

    const item = result.rows[0];

    if (!item) {
      return res.status(404).render('error', {
        message: 'exercise not found',
        error: {}
      });
    }

    res.render('forms/gym_form_edit', {
      title: 'Edit exercises',
      mode: 'form',
      pageTitle: 'Edit exercises',
      action: `/gym2/edit/${item.id}`,
      buttonText: 'Save changes',
      item
    });
  } catch (err) {
    next(err);
  }
});

router.post('/edit/:id', async function (req, res, next) {
  try {
    const ValidationExercise = new Exercise(req.body)
    await db.query(
      `
      UPDATE gym2
      SET exercise_name = $1,
          difficult_level = $2,
          required_level = $3,
          Muscle_name = $4,
          Sets = $5
      WHERE id = $6
      `,
      [
        ValidationExercise.exercise_name,
        ValidationExercise.difficult_level,
        ValidationExercise.required_level === '' ? null : ValidationExercise.required_level,
        ValidationExercise.Muscle_name === '' ? null : ValidationExercise.Muscle_name,
        ValidationExercise.Sets === '' ? null : ValidationExercise.Sets,
        req.params.id
      ]
    );
  } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).send(`Помилка додавання вправи: ${err.message}`);
      }
      res.status(500).send(`Error: ${err.message}`);
    }
  res.redirect('/gym2');
});
// -------------------------------------------------------------




export default router;