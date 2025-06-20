const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { News, User } = require('../models');
const { auth, ownerAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload (single image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all published news (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: news } = await News.findAndCountAll({
      where: { is_published: true },
      include: [{
        model: User,
        as: 'author',
        attributes: ['name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      news,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Ошибка при получении новостей' });
  }
});

// Get single news (public)
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['name']
      }]
    });

    if (!news) {
      return res.status(404).json({ message: 'Новость не найдена' });
    }

    if (!news.is_published) {
      return res.status(404).json({ message: 'Новость не опубликована' });
    }

    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Ошибка при получении новости' });
  }
});

// Create news (owner only)
router.post('/', auth, upload.single('image'), [
  body('title').trim().isLength({ min: 3 }).withMessage('Заголовок минимум 3 символа'),
  body('content').trim().isLength({ min: 10 }).withMessage('Содержание минимум 10 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() });
    }
    // Фото не обязательно
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    const news = await News.create({
      title: req.body.title,
      content: req.body.content,
      image
    });
    res.status(201).json({ message: 'Новость добавлена', news });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Update news (owner only)
router.put('/:id', upload.single('image'), [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Заголовок должен содержать минимум 3 символа'),
  body('content').optional().trim().isLength({ min: 10 }).withMessage('Содержание должно содержать минимум 10 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Новость не найдена' });
    }

    if (news.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для редактирования этой новости' });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await news.update(updateData);

    const updatedNews = await News.findByPk(news.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['name']
      }]
    });

    res.json({
      message: 'Новость обновлена успешно',
      news: updatedNews
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении новости' });
  }
});

// Delete news (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ message: 'Новость не найдена' });
    await news.destroy();
    res.json({ message: 'Новость удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Get owner's news
router.get('/owner/my', async (req, res) => {
  try {
    const news = await News.findAll({
      where: { author_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(news);
  } catch (error) {
    console.error('Get owner news error:', error);
    res.status(500).json({ message: 'Ошибка при получении ваших новостей' });
  }
});

// Get news tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await News.distinct('tags', { isPublished: true });
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Ошибка при получении тегов' });
  }
});

module.exports = router; 