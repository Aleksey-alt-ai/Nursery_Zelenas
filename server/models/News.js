const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
}, {
  tableName: 'news'
});

module.exports = News; 