import axios from 'axios'
import qs from 'qs'

export const api = axios.create({
    baseURL:'/api',
    timeout:30000,
})

//게시물 등록
export const addBoard = async(board,images,defaultImageUrl) => {

    const spot = board.tourSpot
    const formData = new FormData()

    const list = Array.isArray(images)?images:images?[images]:[]
    list.forEach(image => formData.append('upload',image));

    formData.append('board',JSON.stringify(board))
    if(defaultImageUrl){
        formData.append('defaultImageUrl',defaultImageUrl)
    }

    const token = localStorage.getItem('token')
    return api.post('/board',formData, {
        headers: { Authorization: `Bearer ${token}`}        
    })   
        
}

export const getBoard = async(params) => {
    const res = await api.get('/board',{params,paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),})
    return res.data
}

export const getOneBoard = async(numBrd) => {
    const res = await api.get('/oneboard',{params:{numBrd}})

    return res.data
}

export const getImages = async(numBrd) => {
    const res = await api.get('/images',{params:{numBrd}})

    return res.data
}

export const updateBoard = async(numBrd,board,images,imagesToDelete=[]) => {
    const formData = new FormData()
    const list = Array.isArray(images) ? images : images ? [images] : [];
    list.forEach(file => formData.append('upload', file));

    formData.append('board', JSON.stringify(board));
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    return api.put(`/board/edit/${numBrd}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }); 
}

export const toggleGood = async(numBrd,userId) => {
    const token = localStorage.getItem('token')
    const res = await api.post(`/board/good/${numBrd}`,{userId},{
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
}

export const getGoodStatus = async(numBrd,userId) => {
    const token = localStorage.getItem('token')
    const res = await api.get(`/board/good/${numBrd}`,{
        headers: { Authorization: `Bearer ${token}` },
        params: { userId }
    })
    return res.data
}

export const getRandomImage = async() => {
    const res = await api.get('/randomImage')
    return res.data
}
