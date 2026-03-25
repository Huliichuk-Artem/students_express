import express from "express"
const router = express.Router();
import db from "../db/connector.js";


router.get('/', async function(req, res, next) {
  const dhd = await db.query('SELECT * FROM desperate_housewives_divas');

  const modDhd = dhd.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('dhd', { dhd: modDhd || [] });
});

export default router;

