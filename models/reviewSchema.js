const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    numRev: { type: Number },
    numBrd: { type: Number },
    userId: { type: String },
    content: { type: String },
    created: { type: Date, default: Date.now },
    groupNum: { type: Number },
    depth: { type: Number, default: 0 },
    orderNo: { type: Number, default: 0 },
    parent: { type: Number, default: null },
    deleted: { type: Boolean, default: false }, // 댓글 삭제 후, 새로고침 시 문구 유지
    hidden:{type:Boolean, default:false},
    report:{type:Boolean, default:false}
})
console.log('리뷰 스키마 정의')

// 모델 정의
mongoose.model('reviewdbs', reviewSchema)
console.log('리뷰 모델 정의')