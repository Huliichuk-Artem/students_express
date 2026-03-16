import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const weapon = await db.query('SELECT * FROM users_test');

  const modWeapons = weapon.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('dead_space', { weapons: modWeapons || [] });
});

export default router;
