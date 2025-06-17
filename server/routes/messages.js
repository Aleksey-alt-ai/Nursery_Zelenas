const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, Puppy, User } = require('../models');
const { auth, ownerAuth } = require('../middleware/auth');

const router = express.Router();

// Send message to owner (authenticated users)
router.post('/', auth, [
  body('puppyId').notEmpty().withMessage('ID щенка обязателен'),
  body('content').trim().isLength({ min: 5 }).withMessage('Сообщение должно содержать минимум 5 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const { puppyId, content } = req.body;

    // Check if puppy exists
    const puppy = await Puppy.findByPk(puppyId);
    if (!puppy) {
      return res.status(404).json({ message: 'Щенок не найден' });
    }

    // Check if puppy is available
    if (!puppy.is_available) {
      return res.status(400).json({ message: 'Этот щенок больше не доступен' });
    }

    // Create message
    const message = await Message.create({
      puppy_id: puppyId,
      sender_id: req.user.id,
      receiver_id: puppy.owner_id,
      content
    });

    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'phone']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['name', 'phone']
        },
        {
          model: Puppy,
          as: 'puppy',
          attributes: ['name', 'breed']
        }
      ]
    });

    res.status(201).json({
      message: 'Сообщение отправлено успешно',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Ошибка при отправке сообщения' });
  }
});

// Get messages for a specific puppy (owner only)
router.get('/puppy/:puppyId', ownerAuth, async (req, res) => {
  try {
    const { puppyId } = req.params;

    // Check if puppy exists and belongs to owner
    const puppy = await Puppy.findByPk(puppyId);
    if (!puppy) {
      return res.status(404).json({ message: 'Щенок не найден' });
    }

    if (puppy.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для просмотра сообщений' });
    }

    const messages = await Message.findAll({
      where: { puppy_id: puppyId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'phone']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['name', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Get puppy messages error:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Get all messages for owner
router.get('/owner/all', ownerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const offset = (page - 1) * limit;
    const where = { receiver_id: req.user.id };

    if (unread === 'true') {
      where.is_read = false;
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'phone']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['name', 'phone']
        },
        {
          model: Puppy,
          as: 'puppy',
          attributes: ['name', 'breed', 'images']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get owner messages error:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Get user's sent messages
router.get('/user/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Message.findAndCountAll({
      where: { sender_id: req.user.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'phone']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['name', 'phone']
        },
        {
          model: Puppy,
          as: 'puppy',
          attributes: ['name', 'breed', 'images']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Reply to message (owner only)
router.post('/reply/:messageId', ownerAuth, [
  body('content').trim().isLength({ min: 5 }).withMessage('Ответ должен содержать минимум 5 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.array() 
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;

    // Get original message
    const originalMessage = await Message.findByPk(messageId, {
      include: [{
        model: Puppy,
        as: 'puppy'
      }]
    });

    if (!originalMessage) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Check if owner is the receiver of original message
    if (originalMessage.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для ответа на это сообщение' });
    }

    // Create reply message
    const replyMessage = await Message.create({
      puppy_id: originalMessage.puppy_id,
      sender_id: req.user.id,
      receiver_id: originalMessage.sender_id,
      content
    });

    // Mark original message as read
    await originalMessage.update({ is_read: true });

    const populatedReply = await Message.findByPk(replyMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'phone']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['name', 'phone']
        },
        {
          model: Puppy,
          as: 'puppy',
          attributes: ['name', 'breed']
        }
      ]
    });

    res.status(201).json({
      message: 'Ответ отправлен успешно',
      data: populatedReply
    });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ message: 'Ошибка при отправке ответа' });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Check if user is the receiver
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для изменения статуса сообщения' });
    }

    await message.update({ is_read: true });

    res.json({ message: 'Сообщение отмечено как прочитанное' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Ошибка при изменении статуса сообщения' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        receiver_id: req.user.id,
        is_read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Ошибка при получении количества непрочитанных сообщений' });
  }
});

module.exports = router; 