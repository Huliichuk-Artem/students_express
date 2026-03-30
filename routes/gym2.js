import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const exercise = await db.query('SELECT * FROM gym2');

  const modExercise = exercise.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('gym2', { exercise: modExercise || [] });
});
router.get('/addExercise', async function(req, res, next) {
  res.render('forms/gym_form');
})

router.post('/addExercise', async function(req, res, next) {
  console.log("Submitted data: ", req.body);

const { exercise_name, difficult_level, required_level, Muscle_name, Sets } = req.body;

  async function addExer(exercise_name, difficult_level, required_level, Muscle_name, Sets) {
   try {
      const query = `
      INSERT INTO gym2 (
            exercise_name, difficult_level, required_level, Muscle_name, Sets
        )
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
   const res = await db.query(query, [exercise_name, difficult_level, required_level, Muscle_name, Sets]);

   } catch (err) 
      { console.error(err)
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

export default router;
