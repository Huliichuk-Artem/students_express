import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  try {
    const moviesData = await db.query('SELECT * FROM movies');
    const modMovies = moviesData.rows.map(s => {
      return { ...s }
    });
    res.render('movies', { movies: modMovies || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка завантаження фільмів");
  }
});

router.post('/create', async function(req, res, next) {
  console.log("Отримані дані з форми: ", req.body);

  const title = req.body.title;
  const director = req.body.director;
  const release_year = req.body.release_year;
  const rating = req.body.rating;

  const isTitleValid = title?.trim().length > 0;
  const isDirectorValid = director?.trim().length > 0;

  const regexYear = /^[0-9]{4}$/;
  const isYearValid = regexYear.test(release_year) && Number(release_year) >= 1890 && Number(release_year) <= 2026;
  const isRatingValid = !isNaN(parseFloat(rating)) && Number(rating) >= 0 && Number(rating) <= 10;
  
  if (!isTitleValid) return res.status(400).send("Помилка.Невірний заголовок");
  if (!isDirectorValid) return res.status(400).send("Помилка.Невірний режисер");
  if (!isYearValid) return res.status(400).send("Помилка.Невірний рік");
  if (!isRatingValid) return res.status(400).send("Помилка.Невірний рейтинг");

  const query = `
    INSERT INTO movies (title, director, release_year, rating) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  
  const values = [title, director, release_year, rating];

  try {
    const result = await db.query(query, values);
    console.log('Фільм успішно додано:', result.rows[0]);
    
    res.redirect('/movies');
  } catch (err) {
    console.error('Помилка при збереженні:', err.message);
    res.status(500).send("Сталася помилка при збереженні фільму.");
  }
});

router.post('/delete/:id', async function(req, res, next) {
  const movieId = req.params.id;

  try {
    await db.query('DELETE FROM movies WHERE id = $1', [movieId]);
    console.log(`Фільм з ID ${movieId} успішно видалено`);
    
    res.redirect('/movies');
  } catch (err) {
    console.error('Помилка при видаленні:', err.message);
    res.status(500).send("Сталася помилка при видаленні фільму.");
  }
});

router.get('/edit/:id', async function(req, res, next) {
  const movieId = req.params.id;

  try {
    const result = await db.query('SELECT * FROM movies WHERE id = $1', [movieId]);
    const movie = result.rows[0];

    res.render('forms/movies_form', { movie: movie });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при пошуку фільму");
  }
});


router.post('/edit/:id', async function(req, res, next) {
  const movieId = req.params.id;

  const title = req.body.title;
  const director = req.body.director;
  const release_year = req.body.release_year;
  const rating = req.body.rating;

  const isTitleValid = title?.trim().length > 0;
  const isDirectorValid =  director?.trim().length > 0;

  const regexYear = /^[0-9]{4}$/;
  const isYearValid = regexYear.test(release_year) && Number(release_year) >= 1890 && Number(release_year) <= 2026;
  const isRatingValid = !isNaN(parseFloat(rating)) && Number(rating) >= 0 && Number(rating) <= 10;
  
  if (!isTitleValid) return res.status(400).send("Помилка.Невірний заголовок");
  if (!isDirectorValid) return res.status(400).send("Помилка.Невірний режисер");
  if (!isYearValid) return res.status(400).send("Помилка.Невірний рік");
  if (!isRatingValid) return res.status(400).send("Помилка.Невірний рейтинг");

  const query = `
    UPDATE movies 
    SET title = $1, director = $2, release_year = $3, rating = $4 
    WHERE id = $5
  `;
  const values = [title, director, release_year, rating, movieId];

  try {
    await db.query(query, values);
    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при збереженні змін");
  }
});

export default router;