const mongoose= require('mongoose')

const tripBookmarkSchema = new mongoose.Schema({
    contenttypeid: { type: Number, required: true },
  contentid: { type: Number, required: true },
  userid: { type: String, required: true },
  bookmark: { type: Boolean, default: true }
})

module.exports = mongoose.model('TripBookmark', tripBookmarkSchema);