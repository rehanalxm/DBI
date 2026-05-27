const express = require('express');
  const router = express.Router();
  const {
  depositMoney,
  withdrawMoney,
  getTransactions,
  transferMoney,
  toggleCardStatus,
  addPayee,
  deletePayee,
} = require('../controllers/accountController');
  const { protect } = require('../middleware/authMiddleware');

  // Secure endpoints using the JWT protect middleware
  router.post('/deposit', protect, depositMoney);
  router.post('/withdraw', protect, withdrawMoney);
  router.get('/transactions', protect, getTransactions);
  router.post('/transfer', protect, transferMoney);
  router.post('/toggle-card', protect, toggleCardStatus);
  router.post('/payees', protect, addPayee);
  router.delete('/payees/:accountNumber', protect, deletePayee);

  module.exports = router;
