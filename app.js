import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors';
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import gamesRouter from './routes/games.js'
import weaponRouter from './routes/dead_space.js'
import carsRouter from './routes/cars.js'
import slonikiRouter from './routes/sloniki.js'
import moviesRouter from './routes/movies.js'
import gymRouter from './routes/gym2.js'
import heroesRouter from './routes/heroes_mlbb.js' 
import catsRouter from './routes/cats.js' 
import dhdRouter from './routes/dhd.js'
import streetFoodRouter from './routes/street_food.js'
import heroessRouter from './routes/heroes.js'
import presidentRouter from './routes/president.js'
import productRouter from './routes/product.js'
import batmanRouter from './routes/batman.js'
import barRouter from './routes/bar.js'
import accountsRouter from './routes/accounts.js'
import brawlerRouter from './routes/brawlstars.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

import hbs from 'hbs';

// Реєстрація хелпера для порівняння значень у шаблонах
hbs.registerHelper('eq', function (a, b) {
  return String(a) === String(b);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Маршрути
app.use('/', indexRouter);
app.use('/movies', moviesRouter);
app.use('/students', usersRouter);
app.use('/games', gamesRouter);
app.use('/weapons', weaponRouter);
app.use('/sloniki', slonikiRouter);
app.use('/cars', carsRouter);
app.use('/heroes_mlbb', heroesRouter); 
app.use('/cats', catsRouter); 
app.use('/heroes', heroessRouter); 
app.use('/gym2', gymRouter);
app.use('/dhd', dhdRouter);
app.use('/street_food', streetFoodRouter);
app.use('/product', productRouter);
app.use('/villains', batmanRouter);
app.use('/bar', barRouter);
app.use('/accounts', accountsRouter);
app.use('/brawlers', brawlerRouter);

// --- НОВИЙ ОБРОБНИК ПОМИЛОК ДЛЯ ДІАГНОСТИКИ ---
app.use((err, req, res, next) => {
  // Виводимо повну помилку в термінал VS Code
  console.error('=== КРИТИЧНА ПОМИЛКА ===');
  console.error(err.stack); 
  console.error('========================');

  // Виводимо текст помилки в браузер, щоб ми зрозуміли причину
  res.status(err.status || 500);
  res.render('error', { 
    message: err.message, // Тут з'явиться причина (наприклад: column "class" does not exist)
    error: err 
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

export default app;
