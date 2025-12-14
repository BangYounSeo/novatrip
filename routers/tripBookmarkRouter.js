const express = require('express')
const router = express.Router();
const tripBookmarkService = require('../client/src/service/tripBookmarkService')

router.post('/:contenttypeid/:contentid/:userid',async(req,res) => {
    const result = await tripBookmarkService.toggleBookmark(req.params.contenttypeid,req.params.contentid,req.params.userid)
    res.json(result)
});

// 사용자가 눌렀는지 가져오기
router.get('/:contenttypeid/:contentid/:userid', async (req, res) => {
  const { contenttypeid, contentid, userid } = req.params;
  const result = await tripBookmarkService.getTripBookmark(contenttypeid, contentid, userid);
  res.json(result);
});


module.exports = router;


