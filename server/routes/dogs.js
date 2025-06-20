const express = require('express');
const router = express.Router();
const { Dog } = require('../models');
const multer = require('multer');
const path = require('path');

// Настройка хранения файлов д фото
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Получить всех собак
router.get('/', async (req, res) => {
  try {
    const dogs = await Dog.findAll();
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить одну собаку по id
router.get('/:id', async (req, res) => {
  try {
    const dog = await Dog.findByPk(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Собака не найдена' });
    res.json(dog);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать собаку (только для админа)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, achievements, description } = req.body;
    const photo = req.file ? req.file.path : null;
    const dog = await Dog.create({ name, achievements, description, photo });
    res.status(201).json(dog);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить собаку (только для админа)
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const dog = await Dog.findByPk(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Собака не найдена' });
    const { name, achievements, description } = req.body;
    if (req.file) dog.photo = req.file.path;
    if (name) dog.name = name;
    if (achievements) dog.achievements = achievements;
    if (description) dog.description = description;
    await dog.save();
    res.json(dog);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить собаку (только для админа)
router.delete('/:id', async (req, res) => {
  try {
    const dog = await Dog.findByPk(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Собака не найдена' });
    await dog.destroy();
    res.json({ message: 'Собака удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 