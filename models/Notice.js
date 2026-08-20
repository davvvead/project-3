const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  category:         { type: String, required: true },
  urgency:          { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
  authorDepartment: { type: String, required: true },
  content:          { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
