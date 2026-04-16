import express from 'express';
import db from '../db/connector.js';
const router = express.Router();

// 1. Головна таблиця (Список)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM brawl_stars_heroes ORDER BY id ASC');
        res.render('brawlers', { brawlers: result.rows });
    } catch (err) {
        res.status(500).send("Помилка БД: " + err.message);
    }
});

// 2. Сторінка створення
router.get('/create', (req, res) => {
    res.render('forms/brawler_form', { isEdit: false });
});

// 3. Обробка створення
router.post('/create', async (req, res) => {
    const { name, rarity, brawler_class, health, damage } = req.body;
    try {
        await db.query(
            'INSERT INTO brawl_stars_heroes (name, rarity, class, health, damage) VALUES ($1, $2, $3, $4, $5)',
            [name, rarity, brawler_class, health || 0, damage || 0]
        );
        res.redirect('/brawlers');
    } catch (err) {
        res.status(500).send("Помилка створення: " + err.message);
    }
});

// 4. Сторінка редагування
router.get('/update', async (req, res) => {
    const nameFromUrl = req.query.name; 
    try {
        const result = await db.query('SELECT * FROM brawl_stars_heroes WHERE name = $1', [nameFromUrl]);
        const brawlerData = result.rows[0];
        if (!brawlerData) return res.status(404).send("Героя не знайдено");

        res.render('forms/brawler_form', { 
            isEdit: true, 
            brawler: brawlerData 
        });
    } catch (err) {
        res.status(500).send("Помилка пошуку: " + err.message);
    }
});

// 5. Обробка оновлення
router.post('/update', async (req, res) => {
    const { currentName, newName, newRarity, newClass, newHealth, newDamage } = req.body;
    try {
        await db.query(
            'UPDATE brawl_stars_heroes SET name=$1, rarity=$2, class=$3, health=$4, damage=$5 WHERE name=$6',
            [newName || currentName, newRarity, newClass, newHealth, newDamage, currentName]
        );
        res.redirect('/brawlers');
    } catch (err) {
        res.status(500).send("Помилка оновлення: " + err.message);
    }
});

// 6. Обробка видалення (Нове!)
router.post('/delete', async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('DELETE FROM brawl_stars_heroes WHERE name = $1', [name]);
        res.redirect('/brawlers');
    } catch (err) {
        res.status(500).send("Помилка видалення: " + err.message);
    }
});

export default router;