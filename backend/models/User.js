const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Method to compare password
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
        notEmpty: { msg: 'Email is required' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [6],
          msg: 'Password must be at least 6 characters long',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
      },
    },
    accountType: {
      type: DataTypes.ENUM('savings', 'checking', 'business'),
      allowNull: false,
      defaultValue: 'savings',
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Date of birth is required' },
      },
    },
    isCardFrozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      get() {
        const rawValue = this.getDataValue('balance');
        return rawValue ? parseFloat(rawValue) : 0;
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeValidate: async (user) => {
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
      },
      beforeCreate: async (user) => {
        // Generate unique 10-digit account number if not present
        if (!user.accountNumber) {
          let accountNum;
          let exists = true;
          while (exists) {
            accountNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const checkUser = await User.findOne({ where: { accountNumber: accountNum } });
            if (!checkUser) {
              exists = false;
            }
          }
          user.accountNumber = accountNum;
        }

        // Hash password
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
