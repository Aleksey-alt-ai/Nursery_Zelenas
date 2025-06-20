const sequelize = require('../config/database');
const User = require('./User');
const Puppy = require('./Puppy');
const News = require('./News');
const Message = require('./Message');
const Dog = require('./Dog');

// Удалены все связи между моделями

// Функция для синхронизации базы данных
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // всегда пересоздаём таблицы
    console.log('База данных полностью пересоздана!');
  } catch (error) {
    console.error('Ошибка синхронизации базы данных:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Puppy,
  News,
  Message,
  Dog,
  syncDatabase
}; 