const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('phone')
    .matches(/^\+7\d{10}$/, 'Номер телефона должен быть в формате +7XXXXXXXXXX')
    .withMessage('Неверный формат номера телефона'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Имя должно содержать минимум 2 символа')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const { phone, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже существует' });
    }

    // Create new user
    const user = await User.create({
      phone,
      password,
      name
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
});

// Login
router.post('/login', [
  body('phone')
    .matches(/^\+7\d{10}$/, 'Номер телефона должен быть в формате +7XXXXXXXXXX')
    .withMessage('Неверный формат номера телефона'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(400).json({ message: 'Неверный номер телефона или пароль' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный номер телефона или пароль' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(400).json({ message: 'Аккаунт заблокирован' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        phone: req.user.phone,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
  }
});

// Temporary route to create owner (remove in production)
router.post('/create-owner', async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже существует' });
    }

    // Create owner user
    const user = await User.create({
      phone,
      password,
      name,
      role: 'owner' // Set role as owner
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Владелец создан успешно',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create owner error:', error);
    res.status(500).json({ message: 'Ошибка при создании владельца' });
  }
});

// Test route to check/create owner (remove in production)
router.get('/test-owner', async (req, res) => {
  try {
    // Check if owner exists
    let owner = await User.findOne({ where: { phone: '+70000000001' } });
    
    if (!owner) {
      // Create owner if doesn't exist
      owner = await User.create({
        phone: '+70000000001',
        password: 'Admin',
        name: 'Владелец питомника',
        role: 'owner'
      });
      res.json({ 
        message: 'Владелец создан',
        phone: '+70000000001',
        password: 'Admin',
        role: owner.role
      });
    } else {
      res.json({ 
        message: 'Владелец уже существует',
        phone: owner.phone,
        role: owner.role
      });
    }
  } catch (error) {
    console.error('Test owner error:', error);
    res.status(500).json({ message: 'Ошибка при проверке владельца' });
  }
});

module.exports = router; 