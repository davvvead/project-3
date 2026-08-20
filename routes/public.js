const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Notice = require('../models/Notice');

// GET / — Public notice board
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.render('index', { title: 'NoticeHub – Campus Bulletin Board', notices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /login — Admin login form
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('login', { title: 'Admin Login', errors: [], formData: {} });
});

// POST /login — Authenticate credentials
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  const formData = { username: req.body.username };

  if (!errors.isEmpty()) {
    return res.render('login', { title: 'Admin Login', errors: errors.array(), formData });
  }

  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.render('login', {
        title: 'Admin Login',
        errors: [{ msg: 'Invalid username or password' }],
        formData
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Admin Login',
        errors: [{ msg: 'Invalid username or password' }],
        formData
      });
    }

    req.session.adminId = admin._id;
    req.session.adminName = admin.displayName;
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /logout — Destroy session and return to home
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
