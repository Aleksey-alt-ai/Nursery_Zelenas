const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false, // Отключаем логи SQL запросов
  define: {
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    underscored: true // Использует snake_case для имен полей
  }
});

module.exports = sequelize; 