const express = require('express');
const router = express.Router();
const { getUserProfile, deleteUserAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

// Secure route to fetch or delete current authenticated user profile
router.route('/profile')
  .get(protect, getUserProfile)
  .delete(protect, deleteUserAccount);


module.exports = router;
