const TripBookmark = require('../../../models/tripBookmarkSchema');

exports.toggleBookmark = async (contenttypeid,contentid,userid)=>{
    const existing = await TripBookmark.findOne({contenttypeid,contentid,userid})

    if (existing) {
        
        await TripBookmark.deleteOne({_id:existing._id})
        return{bookmark:false}

    }else{

        await TripBookmark.create({contentid,contenttypeid,userid})
        return {bookmark:true}

    }
};

exports.getTripBookmark = async (contenttypeid, contentid, userid) => {
  let bookmark = false;

  if (userid) {
    const existing = await TripBookmark.findOne({ contenttypeid, contentid, userid });
    bookmark = !!existing;
  }

  return { bookmark }; 
};

