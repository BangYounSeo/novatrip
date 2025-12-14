const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const Member = mongoose.model('member');

async function checkPenalty(req, res, next) {
    try {
        const authHeader = req.headers['authorization']
        if(!authHeader) return res.status(401).json({message: '토큰이 없습니다'})

        const token = authHeader.split(' ')[1]
        let decoded;
        try {
            decoded = jwt.verify(token,process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({message: '유효하지않은 토큰입니다.'})
        }

        const member = await Member.findOne({userId: decoded.userId})
        
        if(!member) return res.status(404).json({message: '회원정보가 없습니다'})

        if(member.status === 'suspend'){
            return res.status(403).json({message: '정지된 계정은 이용할 수 없습니다'})
        }

        if(member.status === 'warn'){
            return res.status(403).json({message: '경고 상태에서는 작성이 제한됩니다.'})
        }

        req.user = decoded;
        next();

    } catch (err) {
        console.error('checkPenalty 오류:', err);
        res.status(500).json({message: '서버 오류'})        
    }
}

module.exports = {checkPenalty};