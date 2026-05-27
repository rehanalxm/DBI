const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.status(200).json({
        success: true,
        user,
      });
    } else {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error retrieving profile.' });
  }
};

// @desc    Deposit money into account
// @route   POST /api/account/deposit
// @access  Private
const depositMoney = async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const depositAmount = Number(amount);

    // Validate amount
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount greater than zero.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if card is frozen
    if (user.isCardFrozen) {
      return res.status(400).json({ success: false, message: 'Transaction blocked. Your virtual debit card is frozen.' });
    }

    // Update balance
    user.balance += depositAmount;
    await user.save();

    // Create deposit transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: depositAmount,
      category: category || 'other',
      description: description || 'Self deposit',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deposited ₹${depositAmount.toFixed(2)}.`,
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    console.error('Deposit Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error processing deposit.' });
  }
};

// @desc    Withdraw money from account
// @route   POST /api/account/withdraw
// @access  Private
const withdrawMoney = async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const withdrawAmount = Number(amount);

    // Validate amount
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount greater than zero.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if card is frozen
    if (user.isCardFrozen) {
      return res.status(400).json({ success: false, message: 'Transaction blocked. Your virtual debit card is frozen.' });
    }

    // Check balance sufficiency
    if (user.balance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Your current balance is ₹${user.balance.toFixed(2)}.`,
      });
    }

    // Update balance
    user.balance -= withdrawAmount;
    await user.save();

    // Create withdraw transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdraw',
      amount: withdrawAmount,
      category: category || 'other',
      description: description || 'Self withdrawal',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully withdrew ₹${withdrawAmount.toFixed(2)}.`,
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    console.error('Withdrawal Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error processing withdrawal.' });
  }
};

// @desc    Get user transaction history
// @route   GET /api/account/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    // Find all transactions for current user and sort descending (latest first)
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Transactions Log Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error retrieving transaction logs.' });
  }
};

// @desc    Delete user account and all transaction data permanently
// @route   DELETE /api/user/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all transactional records associated with the user
    await Transaction.deleteMany({ userId });

    // Delete the user profile document
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Account not found or already deleted.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Account and associated financial logs permanently deleted.',
    });
  } catch (error) {
    console.error('Account Deletion Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error processing account closure.' });
  }
};

// @desc    Transfer money to another user (via Email or Account Number)
// @route   POST /api/account/transfer
// @access  Private
const transferMoney = async (req, res) => {
  try {
    const { recipientIdentifier, amount } = req.body;
    const transferAmount = Number(amount);

    // Validate inputs
    if (!recipientIdentifier || isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid recipient and amount greater than zero.' });
    }

    // Fetch sender profile
    const sender = await User.findById(req.user.id);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender account not found.' });
    }

    // Check card freeze
    if (sender.isCardFrozen) {
      return res.status(400).json({ success: false, message: 'Transaction blocked. Your virtual debit card is frozen.' });
    }

    // Check balance sufficiency
    if (sender.balance < transferAmount) {
      return res.status(400).json({ success: false, message: `Insufficient funds. Your current balance is ₹${sender.balance.toFixed(2)}.` });
    }

    // Look up recipient (look up by email if it contains '@', else by account number)
    let query = {};
    if (recipientIdentifier.includes('@')) {
      query = { email: recipientIdentifier.trim().toLowerCase() };
    } else {
      query = { accountNumber: recipientIdentifier.trim() };
    }

    const recipient = await User.findOne(query);
    if (!recipient) {
      const errMsg = recipientIdentifier.includes('@') 
        ? 'The recipient email is not registered or wrong.' 
        : 'The recipient account number is not registered or wrong.';
      return res.status(404).json({ success: false, message: errMsg });
    }

    // Prevent self-transfers
    if (sender._id.equals(recipient._id)) {
      return res.status(400).json({ success: false, message: 'Cannot transfer funds to your own account.' });
    }

    // Update balances
    sender.balance -= transferAmount;
    recipient.balance += transferAmount;
    
    await sender.save();
    await recipient.save();

    // Create Debit Transaction log (Sender)
    const debitTx = await Transaction.create({
      userId: sender._id,
      type: 'withdraw',
      amount: transferAmount,
      category: 'transfer',
      description: `Transfer to: ${recipient.name} (${recipient.email})`,
    });

    // Create Credit Transaction log (Recipient)
    const creditTx = await Transaction.create({
      userId: recipient._id,
      type: 'deposit',
      amount: transferAmount,
      category: 'transfer',
      description: `Transfer from: ${sender.name} (${sender.email})`,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ₹${transferAmount.toFixed(2)} to ${recipient.name}.`,
      balance: sender.balance,
      transaction: debitTx,
    });

  } catch (error) {
    console.error('Transfer Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error processing transfer.' });
  }
};

// @desc    Toggle virtual card freeze state
// @route   POST /api/account/toggle-card
// @access  Private
const toggleCardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isCardFrozen = !user.isCardFrozen;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isCardFrozen 
        ? 'Virtual card frozen. All transaction features are locked.' 
        : 'Virtual card activated. Transactions unlocked.',
      isCardFrozen: user.isCardFrozen,
    });
  } catch (error) {
    console.error('Card Toggle Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating card security.' });
  }
};

// @desc    Add a payee to user saved payees directory
// @route   POST /api/account/payees
// @access  Private
const addPayee = async (req, res) => {
  try {
    const { name, accountNumber } = req.body;

    if (!name || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Payee name and account number are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if recipient account exists in database
    const checkRecipient = await User.findOne({ accountNumber });
    if (!checkRecipient) {
      return res.status(404).json({ success: false, message: 'Cannot save: Account number does not exist.' });
    }

    // Check for duplicate payee accountNumber
    const duplicate = user.payees.find(p => p.accountNumber === accountNumber);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Payee is already saved in your directory.' });
    }

    user.payees.push({ name, accountNumber });
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${name} has been added to your payees list.`,
      payees: user.payees,
    });
  } catch (error) {
    console.error('Add Payee Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error saving payee.' });
  }
};

// @desc    Delete a payee from directory
// @route   DELETE /api/account/payees/:accountNumber
// @access  Private
const deletePayee = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.payees = user.payees.filter(p => p.accountNumber !== accountNumber);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Payee deleted from your directory.',
      payees: user.payees,
    });
  } catch (error) {
    console.error('Delete Payee Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting payee.' });
  }
};

module.exports = {
  getUserProfile,
  depositMoney,
  withdrawMoney,
  getTransactions,
  deleteUserAccount,
  transferMoney,
  toggleCardStatus,
  addPayee,
  deletePayee,
};

