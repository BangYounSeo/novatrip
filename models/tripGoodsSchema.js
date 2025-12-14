const mongoose = require('mongoose');

const tripGoodsSchema = new mongoose.Schema({
  contenttypeid: { type: Number, required: true },
  contentid: { type: Number, required: true },
  userid: { type: String, required: true },
  good: { type: Boolean, default: true }
});

module.exports = mongoose.model('TripGood', tripGoodsSchema);