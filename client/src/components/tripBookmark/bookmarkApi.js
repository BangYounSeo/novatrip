import axios from "axios";

export const toggleBookmark = (contenttypeid,contentid,userid) =>{
   return axios.post(`/api/tripBookmark/${contenttypeid}/${contentid}/${userid}`)
}

export const getTripBookmark = (contenttypeid,contentid,userid) =>{
  return  axios.get(`/api/tripBookmark/${contenttypeid}/${contentid}/${userid}`)
}