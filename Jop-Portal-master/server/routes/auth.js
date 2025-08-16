const express = require('express');
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

// Register validation
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['seeker', 'recruiter']).withMessage('Role must be seeker or recruiter')
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

module.exports = router; 