const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a paper title'],
    trim: true,
  },
  authors: [{
    type: String,
    trim: true,
  }],
  year: {
    type: Number,
  },
  keywords: [{
    type: String,
    trim: true,
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

paperSchema.index({ projectId: 1 });

module.exports = mongoose.model('Paper', paperSchema);
