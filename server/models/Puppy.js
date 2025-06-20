const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Puppy = sequelize.define('Puppy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT, // JSON.stringify([...])
    allowNull: true
  }
}, {
  tableName: 'puppies'
});

module.exports = Puppy; 