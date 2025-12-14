import axios from "axios";

export const toggleGood = (contenttypeid,contentid,userid) =>{
   return axios.post(`/api/tripGoods/${contenttypeid}/${contentid}/${userid}`)
}

export const getTripGoodCount = (contenttypeid,contentid,userid) =>{
  return  axios.get(`/api/tripGoods/${contenttypeid}/${contentid}/${userid}`)
}