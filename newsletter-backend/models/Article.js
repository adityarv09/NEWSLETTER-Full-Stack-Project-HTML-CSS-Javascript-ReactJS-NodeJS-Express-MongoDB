const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  // author: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
  votesInteresting: {
    type: Number,
    default: 0
  },
  votesMindblowing: {
    type: Number,
    default: 0
  },
  votesFalse: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Article', ArticleSchema);
