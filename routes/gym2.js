import express from 'express';
const router = express.Router();
import db from '../db/connector.js';


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

  const { exercise_name, difficult_level, required_level, Muscle_name, Sets } = req.body;
  if (!exercise_name) {
      return res.status(400).send("Назва вправи не може бути пустим рядком");
    } else if (!difficult_level) {
      return res.status(400).send("рівень складності не може бути пустим рядком");
    } 
    else if (difficult_level < 1 || difficult_level > 10) {
      return res.status(400).send("рівень складності повинен бути між 1 і 10");
    }
    else if (!required_level) {
      return res.status(400).send("Рівень підготовки не може бути пустим рядком");
    } else if (!Muscle_name) {
      return res.status(400).send("Назва м'яза не може бути пустим рядком");
    }
      else if (!Sets) {
      return res.status(400).send("Кількість підходів не може бути пустим рядком");
    } else if (Sets < 1) {
      return res.status(400).send("Кількість підходів не може бути менше 1");
    } 

  async function addExer(exercise_name, difficult_level, required_level, Muscle_name, Sets) {
    try {
      const query = `
      INSERT INTO gym2 (
            exercise_name, difficult_level, required_level, Muscle_name, Sets
        )
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
      const res = await db.query(query, [exercise_name, difficult_level, required_level, Muscle_name, Sets]);

    } catch (err) {
      console.error(err)
      throw err;
    }
  }

  try {
    await addExer(exercise_name, difficult_level, required_level, Muscle_name, Sets);

    res.redirect('/gym2');
  } catch (err) {
    res.status(500).send("Помилка при додаванні вправи. Можливо, вона вже існує.");
  }
});

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
    const { exercise_name, difficult_level, required_level, Muscle_name, Sets } = req.body;
    if (!exercise_name) {
      return res.status(400).send("Назва вправи не може бути пустим рядком");
    } else if (!difficult_level) {
      return res.status(400).send("рівень складності не може бути пустим рядком");
    } else if (difficult_level < 1 || difficult_level > 10) {
      return res.status(400).send("рівень складності повинен бути між 1 і 10");
    } else if (!required_level) {
      return res.status(400).send("Рівень підготовки не може бути пустим рядком");
    } else if (!Muscle_name) {
      return res.status(400).send("Назва м'яза не може бути пустим рядком");
    }
      else if (!Sets) {
      return res.status(400).send("Кількість підходів не може бути пустим рядком");
    } else if (Sets < 1) {
      return res.status(400).send("Кількість підходів не може бути менше 1");
    } 

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
        exercise_name,
        difficult_level,
        required_level === '' ? null : required_level,
        Muscle_name === '' ? null : Muscle_name,
        Sets === '' ? null : Sets,
        req.params.id
      ]
    );
  } catch (err) {
    next(err);
  }
  res.redirect('/gym2');
});
// -------------------------------------------------------------




export default router;