const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: String
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
