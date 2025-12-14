const TripGoods = require('../../../models/tripGoodsSchema');

exports.toggleGood = async (contenttypeid,contentid,userid)=>{
    const existing = await TripGoods.findOne({contenttypeid,contentid,userid})

    if (existing) {
        
        await TripGoods.deleteOne({_id:existing._id})
        return{good:false}

    }else{

        await TripGoods.create({contentid,contenttypeid,userid})
        return {good:true}

    }
};

exports.getTripGoodCount = async (contenttypeid, contentid, userid) => {
  const count = await TripGoods.countDocuments({ contenttypeid, contentid });
  let good = false;

  if (userid) {
    const existing = await TripGoods.findOne({ contenttypeid, contentid, userid });
    good = !!existing;
  }

  return { count, good }; // count와 gooded 모두 반환
};

