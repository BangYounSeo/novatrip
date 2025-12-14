// routers/eventAdRouter.js
const express = require('express');
const router = express.Router();
const EventAd = require('../models/adEventSchema');


const PICK12 = 'title contenttypeid contentid addr1 addr2 tel mapx mapy eventstartdate eventenddate firstimage overview';
const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
const pick12 = (v = {}) => ({
title: v.title,
contenttypeid: v.contenttypeid || v.contentTypeId,
contentid: v.contentid || v.contentid,
addr1: v.addr1,
addr2: v.addr2,
tel: v.tel,
mapx: toNum(v.mapx),
mapy: toNum(v.mapy),
eventstartdate: v.eventstartdate,
eventenddate: v.eventenddate,
firstimage: v.firstimage || v.image,
overview: v.overview,
});
const stripUndef = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));


// 업서트 (활성 최대 5개)
router.post('/event-ads', async (req, res) => {
try {
const meta = { priority: req.body.priority ?? 100, active: req.body.active ?? true, link: req.body.link ?? '' };
const base = stripUndef(pick12(req.body));
if (!base.contentid || !base.title || !base.firstimage) return res.status(400).json({ message: 'contentid/title/firstimage 필수' });


if (meta.active) {
const activeCount = await EventAd.countDocuments({ active: true });
const exists = await EventAd.findOne({ contentid: base.contentid }).lean();
const willIncrease = !exists || (exists && !exists.active);
if (willIncrease && activeCount >= 5) return res.status(400).json({ message: '활성 광고는 최대 5개까지만 등록할 수 있습니다.' });
}


const $set = { ...base, ...meta };
const doc = await EventAd.findOneAndUpdate({ contentid: base.contentid }, { $set }, { new: true, upsert: true, runValidators: true, strict: true });
res.json({ ok: true, doc });
} catch (err) {
console.error('이벤트 광고 등록 오류:', err);
res.status(500).json({ message: '이벤트 광고 등록 오류' });
}
});


// 관리자 목록
router.get('/event-ads', async (req, res) => {
try {
const q = (req.query.q || '').trim();
const cond = q ? { $text: { $search: q } } : {};
const list = await EventAd.find(cond).sort({ active: -1, priority: 1, updatedAt: -1 }).select(`${PICK12} active priority link updatedAt`).lean();
res.json({ list });
} catch (err) {
console.error('이벤트 광고 목록 오류:', err);
res.status(500).json({ message: '이벤트 광고 목록 오류' });
}
});





// 활성 토글 (최대 5개 유지)
router.post('/event-ads/:contentid/toggle', async (req, res) => {
try {
const { contentid } = req.params;
const doc = await EventAd.findOne({ contentid });
if (!doc) return res.status(404).json({ message: '항목 없음' });


if (!doc.active) {
const activeCount = await EventAd.countDocuments({ active: true });
if (activeCount >= 5) return res.status(400).json({ message: '활성 광고는 최대 5개까지만 가능합니다.' });
}


doc.active = !doc.active;
await doc.save();
res.json({ ok: true, active: doc.active });
} catch (err) {
console.error('이벤트 광고 토글 오류:', err);
res.status(500).json({ message: '이벤트 광고 토글 오류' });
}
});


// 삭제
router.delete('/event-ads/:contentid', async (req, res) => {
try {
const { contentid } = req.params;
await EventAd.deleteOne({ contentid });
res.json({ ok: true });
} catch (err) {
console.error('이벤트 광고 삭제 오류:', err);
res.status(500).json({ message: '이벤트 광고 삭제 오류' });
}
});


// 퍼블릭(캐러셀)
router.get('/event-ads/public', async (req, res) => {
try {
const limit = Number(req.query.limit || 5);
const list = await EventAd.find({ active: true }).sort({ priority: 1, updatedAt: -1 }).limit(limit).select(PICK12).lean();
res.json(list);
} catch (err) {
console.error('이벤트 광고 조회 오류:', err);
res.status(500).json({ message: '이벤트 광고 조회 오류', error: err.message });
}
});

// 단건 조회
router.get('/event-ads/:contentid', async (req, res) => {
try {
const doc = await EventAd.findOne({ contentid: req.params.contentid }).select(PICK12).lean();
if (!doc) return res.status(404).json({ message: '항목 없음' });
res.json(doc);
} catch (err) {
console.error('이벤트 광고 단건 조회 오류:', err);
res.status(500).json({ message: '이벤트 광고 단건 조회 오류' });
}
});

module.exports = router;
