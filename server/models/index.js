const sequelize = require('../config/database');
const User = require('./User');
const Puppy = require('./Puppy');
const News = require('./News');
const Message = require('./Message');
const Dog = require('./Dog');

// Определение связей между моделями
User.hasMany(Puppy, { foreignKey: 'owner_id', as: 'puppies' });
Puppy.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(News, { foreignKey: 'author_id', as: 'news' });
News.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

Puppy.hasMany(Message, { foreignKey: 'puppy_id', as: 'messages' });
Message.belongsTo(Puppy, { foreignKey: 'puppy_id', as: 'puppy' });

// Функция для синхронизации базы данных
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // force: true удалит все таблицы и создаст заново
    console.log('База данных синхронизирована');
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