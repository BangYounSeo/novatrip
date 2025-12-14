const mongoose = require('mongoose');

const ALLOWED_TOUR_STYLES = [
  '맛집탐방','카페투어','사진/인스타',
  '힐링/산책','온천·스파','호캉스',
  '문화·역사','전시·공연·축제',
  '쇼핑','야경감상','드라이브',
  '등산·트레킹','바다·서핑','캠핑·글램핑','액티브·레저',
  '아이와 함께','반려동물 동반','당일치기'
];


const SpotSchema = new mongoose.Schema({
  address: String,        // 지번/도로명 전체 주소
  roadAddress: String,    // 도로명 주소
  placeName: String,      // 장소명(선택)
  borough: String,        // '강남구' 같은 행정구
  location: {             // GeoJSON
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {        // [lng, lat]
      type: [Number],
    }
  }
}, {_id:false});

const boardSchema = mongoose.Schema({
    numBrd:{type:Number,required: true,unique:true},
    userId:{type:String},
    tags:[String],
    good:{type:Number, default:0},

    boardType:{type:String, required: true},
    subject:{type:String},
    content:{type:String},

    //공지전용
    pinTop: {type: Boolean, default: false},
    highlight: {type: Boolean, default: false},

    hidden: { type: Boolean, default: false}, //숨기기
    report: { type: Boolean, default: false}, //신고하기

    tourStyle:{
      type: [String],
      default: [],
      validate: [{
        validator: arr => arr.every(v => ALLOWED_TOUR_STYLES.includes(v)),
        message: '허용되지 않은 tourStyle이 포함되어 있습니다.'
      }, {
        validator: arr => new Set(arr).size === arr.length,
        message: 'tourStyle에 중복 값이 있습니다.'
      }, {
        validator: arr => arr.length <= 5, // 최대 5개 정도 추천
        message: 'tourStyle 선택은 최대 5개입니다.'
      }]
    },
    mateCondition:{
      age:{type:[String]},
      gender:{type:String},
      type:{type:[String]}
    },
    startDate:{type:Date},
    endDate:{type:Date},
    tourSpot:{type:SpotSchema},
    hitCount:{type:Number, default:0},
    created:{type:Date, default:Date.now()},
})

const Board = mongoose.model('board', boardSchema);

// Image
const imageSchema = new mongoose.Schema({
  numBrd: { type: Number },
  images: [
    {
      originalFileName: { type: String },
      saveFileName: { type: String },
      path: { type: String },
    },
  ],
});

const Image = mongoose.model('image', imageSchema);

// Good
const goodSchema = new mongoose.Schema({
  userId: { type: String, index: true, unique: true },
  numBrd: { type:[Number],default: [] },
});

const Good = mongoose.model('good', goodSchema);

// 모듈 내보내기
module.exports = { Board, Image, Good, ALLOWED_TOUR_STYLES};