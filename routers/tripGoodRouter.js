const express = require('express')
const router = express.Router();
const tripGoodsService = require('../client/src/service/tripGoodsService')

router.post('/:contenttypeid/:contentid/:userid',async(req,res) => {
    const result = await tripGoodsService.toggleGood(req.params.contenttypeid,req.params.contentid,req.params.userid)
    res.json(result)
});

// 좋아요 수 + 사용자가 눌렀는지 가져오기
router.get('/:contenttypeid/:contentid/:userid', async (req, res) => {
  const { contenttypeid, contentid, userid } = req.params;
  const result = await tripGoodsService.getTripGoodCount(contenttypeid, contentid, userid);
  res.json(result);
});

// userid 없이 그냥 수만 가져오기
router.get('/:contenttypeid/:contentid', async (req, res) => {
  const { contenttypeid, contentid } = req.params;
  const result = await tripGoodsService.getTripGoodCount(contenttypeid, contentid);
  res.json(result);
});

module.exports = router;


