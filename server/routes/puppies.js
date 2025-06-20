const express = require('express');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { Puppy, User } = require('../models');
const { auth, ownerAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload (single image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'puppy-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'));
    }
  }
});

// Get all puppies (public)
router.get('/', async (req, res) => {
  try {
    const { gender, minPrice, maxPrice, available, size } = req.query;
    const where = { is_available: true };
    if (size) where.size = size;
    if (gender) where.gender = gender;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }
    if (available === 'false') where.is_available = false;

    const puppies = await Puppy.findAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['name', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(puppies);
  } catch (error) {
    console.error('Get puppies error:', error);
    res.status(500).json({ message: 'Ошибка при получении списка щенков' });
  }
});

// Get single puppy (public)
router.get('/:id', async (req, res) => {
  try {
    const puppy = await Puppy.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['name', 'phone']
      }]
    });

    if (!puppy) {
      return res.status(404).json({ message: 'Щенок не найден' });
    }

    res.json(puppy);
  } catch (error) {
    console.error('Get puppy error:', error);
    res.status(500).json({ message: 'Ошибка при получении данных щенка' });
  }
});

// Create puppy (owner only)
router.post('/', auth, upload.array('images', 5), [
  body('name').trim().isLength({ min: 3 }).withMessage('Имя минимум 3 символа'),
  body('size').notEmpty().withMessage('Рост обязателен'),
  body('age').isInt({ min: 0 }).withMessage('Возраст — положительное число'),
  body('price').isFloat({ min: 0 }).withMessage('Цена — положительное число'),
  body('description').trim().isLength({ min: 10 }).withMessage('Описание минимум 10 символов'),
  body('gender').isIn(['male', 'female']).withMessage('Пол: male/female'),
  body('color').notEmpty().withMessage('Цвет обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Загрузите хотя бы одно фото' });
    }
    const images = req.files.map(file => `/uploads/${file.filename}`);
    const puppy = await Puppy.create({
      ...req.body,
      age: Number(req.body.age),
      price: Number(req.body.price),
      images: JSON.stringify(images),
      owner_id: req.user.id
    });
    res.status(201).json({ message: 'Щенок добавлен', puppy });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Update puppy (owner only)
router.put('/:id', auth, upload.array('images', 5), [
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Имя должно содержать минимум 3 символа'),
  body('size').optional().notEmpty().withMessage('Рост обязателен'),
  body('age').optional().isInt({ min: 0 }).withMessage('Возраст должен быть положительным числом'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Описание должно содержать минимум 10 символов'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Неверный пол'),
  body('color').optional().trim().notEmpty().withMessage('Цвет обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const puppy = await Puppy.findByPk(req.params.id);
    
    if (!puppy) {
      return res.status(404).json({ message: 'Щенок не найден' });
    }

    if (puppy.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для редактирования этого объявления' });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = JSON.stringify(newImages);
    }

    await puppy.update(updateData);

    const updatedPuppy = await Puppy.findByPk(puppy.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['name', 'phone']
      }]
    });

    res.json({
      message: 'Объявление обновлено успешно',
      puppy: updatedPuppy
    });
  } catch (error) {
    console.error('Update puppy error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении объявления' });
  }
});

// Delete puppy (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const puppy = await Puppy.findByPk(req.params.id);
    
    if (!puppy) {
      return res.status(404).json({ message: 'Щенок не найден' });
    }

    if (puppy.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для удаления этого объявления' });
    }

    await puppy.destroy();

    res.json({ message: 'Объявление удалено успешно' });
  } catch (error) {
    console.error('Delete puppy error:', error);
    res.status(500).json({ message: 'Ошибка при удалении объявления' });
  }
});

// Get owner's puppies
router.get('/owner/my', async (req, res) => {
  try {
    const puppies = await Puppy.findAll({
      where: { owner_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(puppies);
  } catch (error) {
    console.error('Get owner puppies error:', error);
    res.status(500).json({ message: 'Ошибка при получении ваших объявлений' });
  }
});

module.exports = router; 