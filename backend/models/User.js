const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: {
      values: ['savings', 'checking', 'business'],
      message: '{VALUE} is not a valid account type'
    },
    default: 'savings',
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  isCardFrozen: {
    type: Boolean,
    default: false,
  },
  payees: [
    {
      name: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  accountNumber: {
    type: String,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0, // Starts at 0; they can deposit money to get started
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password and generate unique 10-digit account number
userSchema.pre('save', async function (next) {
  // Generate unique 10-digit account number if not present
  if (!this.accountNumber) {
    let accountNum;
    let exists = true;
    while (exists) {
      // Generate random 10-digit number between 1000000000 and 9999999999
      accountNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      // Access the User model directly to verify uniqueness
      const checkUser = await this.constructor.findOne({ accountNumber: accountNum });
      if (!checkUser) {
        exists = false;
      }
    }
    this.accountNumber = accountNum;
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
