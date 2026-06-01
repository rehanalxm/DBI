const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdraw'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Amount must be greater than zero',
        },
      },
      get() {
        const rawValue = this.getDataValue('amount');
        return rawValue ? parseFloat(rawValue) : 0;
      },
    },
    category: {
      type: DataTypes.ENUM('salary', 'food', 'utilities', 'entertainment', 'shopping', 'transfer', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
  }
);

// Define associations
const User = require('./User');
Transaction.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Transaction, { foreignKey: 'userId' });

module.exports = Transaction;
