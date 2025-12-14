const mongoose = require('mongoose')
const Review = mongoose.model('reviewdbs')
const { checkPenalty } = require('../middlewares/checkPenalty')
const { authMiddleware } =require('./auth')

module.exports = (router) => {

    // 리뷰 조회(get)
    router.route('/api/review').get(async(req, res) => {
        try {
            const { numBrd } = req.query;
            const filter = numBrd 
        ? { numBrd: parseInt(numBrd), hidden: false } 
        : { hidden: false }
            const reviews = await Review.find(filter).sort({ groupNum: -1, orderNo: 1 })
            res.status(200).send(reviews)
        } catch (err) {
            console.error('리뷰 조회 오류:', err)
            res.status(500).send({ message: '리뷰 조회 중 오류가 발생했습니다.' })
        }
    })

    // 리뷰 입력(POST)
    router.route('/api/review').post(authMiddleware,checkPenalty,async(req,res) =>{
        try{
            const {numBrd, content, parent} = req.body
            const userId = req.userId

            // 1.댓글 번호 자동 계산
            const last = await Review.findOne().sort({numRev: -1})
            const numRev = last ? last.numRev +1 : 1

            // 2.대댓글이면 부모 댓글 정보 불러오기
            let depth = 0
            let groupNum = numRev

            if (parent) {
                // 부모 댓글 찾기
                const parentReview = await Review.findOne({ numRev: parent })
                
                if (parentReview) {
                    groupNum = parentReview.groupNum
                    depth = parentReview.depth + 1
                    }
                }
            
            //3. 새 댓글 저장
            const review = await Review.create({
                numRev,numBrd,userId,content,
                parent: parent || null,
                groupNum,depth,
                orderNo: numRev,
                created: new Date(),
                hidden: false
            })
            return res.status(200).send(review)

        }catch (err) {
            return res.status(500).send({ 
                message: '리뷰 입력 중 오류가 발생했습니다.',
                error: err.message 
            })
        }
    })

    // 댓글 신고
    router.put('/api/review/report/:id', authMiddleware, async (req, res) => {
        try{
            const {id} = req.params

            const review = await Review.findById(id)
            if(!review){
                return res.status(404).json({message:'댓글을 찾을 수 없습니다.'})
            }
             review.report = true
             await review.save()

             return res.status(200).json({message: '댓글 신고가 접수되었습니다.', report: true})
        }catch(err){
            console.log('댓글 신고 처리 오류:', err)
            return res.status(500).json({message: '서버 오류로 댓글 신고 처리에 실패했습니다.'})
        }
    })

    // 리뷰 수정(PUT)
    router.route('/api/review').put(authMiddleware,async(req,res) =>{
        try{
            const { id, content } = req.body
            const review = await Review.findByIdAndUpdate(id,{ content },{new:true})

            return res.status(200).send({
                error: false,
                review
            })
        }catch (err){
            console.error('리뷰 수정 오류!: ', err)
            return res.status(500).send({
                error: true,
                message: '리뷰 수정 중 오류가 발생하였습니다.'
            })
        }
    })

    // 댓글 삭제(delete) 
    router.route('/api/review').delete(authMiddleware,async(req,res)=>{
        try{
            const {id} = req.body

            const review = await Review.findById(id)
            if(!review){
                return res.status(404).send({message: '댓글을 찾을 수 없습니다.'})
            }

            // 자식 댓글 존재여부 확인(exists : 단순 존재 확인 메서드)
            const hasChild = await Review.exists({parent: review.numRev})

            if(hasChild){
                // 자식이 있으면 (삭제표시만 : 내용만 변경)
                await Review.findByIdAndUpdate(id, {
                deleted: true,
                content: '댓글이 삭제되었습니다.',
                userId: ''
                })
            }else {
                // 삭제 후 review.parent를 사용하면 이미 삭제된 상태라 부모를 찾을 수 없음
                
                // 1. 삭제 전에 부모 정보를 변수에 먼저 저장!
                let parentNum = review.parent

                // 2. 자식이 없으면 완전 삭제 => 이게 문제 맞았어!
                await Review.findByIdAndDelete(id)

                // 부모 댓글이 있고 deleted 상태라면 확인
                while(parentNum){
                    const parentReview = await Review.findOne({numRev: parentNum})

                    if(parentReview && parentReview.deleted){
                        const hasChildren = await Review.exists({parent: parentNum})

                        if(!hasChildren){
                            parentNum = parentReview.parent
                            await Review.findByIdAndDelete(parentReview._id)
                        }else{
                            break
                        }
                    }else{
                        break
                    }
                }
            }
            res.status(200).send({ message: '댓글이 삭제되었습니다.' })

        }catch (err) {
            console.log('리뷰 삭제 오류!: ', err)
            return res.status(500).send({
                error: true,
                message: '리뷰 삭제 중 오류가 발생하였습니다.'
            })
        }
    })
}