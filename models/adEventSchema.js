// models/adEventSchema.js
const mongoose = require('mongoose');


const adEventSchema = new mongoose.Schema(
{
// 12개 필드
title: { type: String, required: true, trim: true },
contenttypeid: { type: String, trim: true },
contentid: { type: String, required: true, unique: true, index: true },
addr1: { type: String, trim: true },
addr2: { type: String, trim: true },
tel: { type: String, trim: true },
mapx: { type: Number },
mapy: { type: Number },
eventstartdate: { type: String }, // yyyyMMdd
eventenddate: { type: String }, // yyyyMMdd
firstimage: { type: String, trim: true },
overview: { type: String },


// 광고 메타
active: { type: Boolean, default: true },
priority: { type: Number, default: 100 },
link: { type: String, default: '' },
},
{ timestamps: true, collection: 'event_ads' }
);


adEventSchema.index({ title: 'text', overview: 'text', addr1: 'text' });
module.exports = mongoose.model('event_ad', adEventSchema);