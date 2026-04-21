import db from '../../db/connector.js';
import bcrypt from 'bcrypt';
import { NotabugDB } from './NotabugDB.js';
import { NotabugHelpers } from './NotabugHelpers.js';

export class AuthController {
  static async getRegister(req, res, next) {
    try {
      const stats = await NotabugDB.getGlobalStats();
      res.render('notabug/register', {
        ...NotabugHelpers.buildBaseContext(stats),
        layout: 'layout'
      });
    } catch (err) {
      next(err);
    }
  }

  static async postRegister(req, res, next) {
    try {
      const { username, password, confirmPassword, email } = req.body;

      if (!NotabugHelpers.validateUsername(username)) {
        return res.status(400).render('notabug/register', {
          error: 'Username must be 3-30 characters, alphanumeric with - and _ only',
          layout: 'layout'
        });
      }

      if (!NotabugHelpers.validatePassword(password)) {
        return res.status(400).render('notabug/register', {
          error: 'Password must be 6-100 characters',
          layout: 'layout'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).render('notabug/register', {
          error: 'Passwords do not match',
          layout: 'layout'
        });
      }

      const existing = await NotabugDB.getUserByUsername(username);
      if (existing) {
        return res.status(400).render('notabug/register', {
          error: 'Username already taken',
          layout: 'layout'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await db.query(
        'INSERT INTO notabug_users (username, password_hash, email, sanity, reputation, balance) VALUES ($1, $2, $3, 100, 0, 0)',
        [username, passwordHash, email || null]
      );

      await NotabugDB.addFeedEvent(`<span class="user-ref">@${username}</span> joined the hunters`);

      res.cookie('notabug_hunter', username, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.redirect('/notabug');
    } catch (err) {
      next(err);
    }
  }

  static async getLogin(req, res, next) {
    try {
      const stats = await NotabugDB.getGlobalStats();
      res.render('notabug/login', {
        ...NotabugHelpers.buildBaseContext(stats),
        layout: 'layout'
      });
    } catch (err) {
      next(err);
    }
  }

  static async postLogin(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!NotabugHelpers.validateUsername(username) || !password) {
        return res.status(400).render('notabug/login', {
          error: 'Invalid username or password',
          layout: 'layout'
        });
      }

      const user = await NotabugDB.getUserByUsername(username);
      if (!user) {
        return res.status(400).render('notabug/login', {
          error: 'Invalid username or password',
          layout: 'layout'
        });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).render('notabug/login', {
          error: 'Invalid username or password',
          layout: 'layout'
        });
      }

      res.cookie('notabug_hunter', username, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      const redirect = req.query.redirect || '/notabug';
      res.redirect(redirect);
    } catch (err) {
      next(err);
    }
  }

  static logout(req, res) {
    res.clearCookie('notabug_hunter');
    res.redirect('/notabug');
  }
}
