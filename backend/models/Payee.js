const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Payee extends Model {}

Payee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Payee name is required' },
      },
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Account number is required' },
      },
    },
  },
  {
    sequelize,
    modelName: 'Payee',
  }
);

// Define associations with alias for frontend compatibility
const User = require('./User');
Payee.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Payee, { foreignKey: 'userId', as: 'payees' });

module.exports = Payee;
