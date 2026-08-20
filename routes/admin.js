const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const Notice = require('../models/Notice');

const CATEGORIES = ['Academic', 'IT & Systems', 'Exam Schedule', 'Campus Life'];
const URGENCIES  = ['Low', 'Medium', 'High'];

// GET /admin — Management dashboard
router.get('/admin', isAuthenticated, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.render('admin/dashboard', { title: 'Admin Dashboard', notices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/notices/add — Notice creation form
router.get('/admin/notices/add', isAuthenticated, (req, res) => {
  res.render('admin/add', {
    title: 'Add Notice',
    errors: [],
    formData: {},
    categories: CATEGORIES,
    urgencies: URGENCIES
  });
});

// POST /admin/notices/add — Validate and insert notice
router.post('/admin/notices/add', isAuthenticated, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('category').notEmpty().withMessage('Please select a category'),
  body('urgency').isIn(URGENCIES).withMessage('Please select a valid urgency level'),
  body('authorDepartment').trim().notEmpty().withMessage('Author department is required'),
  body('content').trim().isLength({ min: 15 }).withMessage('Content must be at least 15 characters')
], async (req, res) => {
  const errors = validationResult(req);
  const formData = {
    title:            req.body.title,
    category:         req.body.category,
    urgency:          req.body.urgency,
    authorDepartment: req.body.authorDepartment,
    content:          req.body.content
  };

  if (!errors.isEmpty()) {
    return res.render('admin/add', {
      title: 'Add Notice',
      errors: errors.array(),
      formData,
      categories: CATEGORIES,
      urgencies: URGENCIES
    });
  }

  try {
    await Notice.create(formData);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/notices/delete/:id — Remove notice from MongoDB
router.post('/admin/notices/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
