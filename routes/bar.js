import express from 'express';
const router = express.Router();
import db from '../db/connector.js';


const regexBar_name = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s\-]+$/;
const regexCost = /^([0-9][0-9]*)$/;
const regexCreated_at = /^\d{2}\.\d{2}\.\d{4}$/;



router.get('/', async function(req, res, next) {
  const bar_items = await db.query('SELECT * FROM bar_items ORDER BY id ASC');

  const modbar_items = bar_items.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('bar', { bar_items: modbar_items || [] });
});
router.get('/create', async function(req, res, next) {
  res.render('forms/bar_form');
})

router.post('/create', async function(req, res, next) {
  console.log("Submitted data: ", req.body);

  const bar_name = req.body.bar_name;
  const cost = req.body.cost;
  const created_at = req.body.created_at;

if (!regexBar_name.test(bar_name) || !regexCost.test(cost) || !regexCreated_at.test(created_at)) {
    return res.status(400).send("Щось не так :D");
}
    const query = `
      INSERT INTO bar_items (
        bar_name,
        cost,
        created_at
      ) 
      VALUES ($1, $2, $3) 
      RETURNING *`;

    const values = [bar_name, cost, created_at];

    try {
       const res = await db.query(query, values);
       console.log('bar item was added:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err.message);
    }
        res.redirect(`/bar`);

})

router.get('/update/:id', async function(req, res, next) {
  res.render('forms/bar_form');
});

router.post('/update/:id', async function(req, res, next) {
  console.log("Submitted data: ", req.body);

  const id = req.params.id;
  const bar_name = req.body.bar_name;
  const cost = req.body.cost;
  const created_at = req.body.created_at;

if (!regexBar_name.test(bar_name) || !regexCost.test(cost) || !regexCreated_at.test(created_at)) {
    return res.status(400).send("Щось не так :D");
}

    const query = `
      UPDATE bar_items
      SET bar_name = $2,
          cost = $3,
          created_at = $4
      WHERE id = $1
      RETURNING*`;

    const values = [id, bar_name, cost, created_at];

try {
      const res = await db.query(query, values);
      console.log("bar item was updated:", res.rows[0]);
    } catch (err) {
      console.error('Error:', err.message);
    }
      res.redirect('/bar'); 
});

router.get('/delete/:id', async function(req, res, next) {

  const id = req.params.id;

  const query = `
    DELETE FROM bar_items
    WHERE id = $1
    RETURNING*`;

  const values = [id];
  
  try {
      const res = await db.query(query, values);
      console.log("bar item was deleted:", res.rows[0]);
    } catch (err) {
      console.error('Error:', err.message);
    }
      res.redirect('/bar'); 
});


export default router;
