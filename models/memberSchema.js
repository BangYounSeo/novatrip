const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type:String, unique:true, required: function(){ return !this.oauthProvider; } },
  pwd:    { type:String, required: function(){ return !this.oauthProvider; } },
  nickname: { type:String },
  ageRange: { type:String },
  name:   { type:String, required: function(){ return !this.oauthProvider; } },
  email:  { type:String, required: function(){ return !this.oauthProvider; } },
  Role:   { type:String },
  gender: { type:String, enum: ['male','female'], default: 'male' },
  oauthProvider: { type:String },
  oauthId:       { type:String },
  status: { type:String, enum: ['normal','warn','suspend'], default: 'normal' },
  tempPwd: { type:Boolean },
  backgroundPicture: { type:String },
  profileImage:      { type:String },
  created:{type:Date, default:Date.now()},
});

module.exports = mongoose.models.member || mongoose.model('member', memberSchema);
