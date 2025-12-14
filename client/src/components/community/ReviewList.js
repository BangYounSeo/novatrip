import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import LoginAlertModal from '../login/LoginAlertModal';

const ReviewList = ({ numBrd, onCountChange }) => {

    const [reviews,setReviews] = useState([])
    const [editId,setEditId] = useState(null) // 어떤 댓글을 수정중인지 추척해야함
    const [editContent,setEditContent] = useState('')
    const [replyParent, setReplyParent] = useState(null); // 대댓글 대상 댓글 ID
    const [replyContent, setReplyContent] = useState(''); // 대댓글 내용

    const token = localStorage.getItem('token')
    const decoded = token ? jwtDecode(token) : null
    const loginId = decoded?.userId?.trim() || ''
    const [rfModalOpen,setRfModalOpen] = useState(false)
    const [rfModalType,setRfModalType] = useState('')

    const buttonStyle = {
        fontSize: '10px',
        height: '24px',
        minHeight: '24px'
    }

    useEffect(()=>{
        if(numBrd){
            setReviews([])
            getReviews()
        }
    },[numBrd])
    
    const getReviews = async () =>{
        try{
            const response = await axios.get(`/api/review?numBrd=${numBrd}`)
            setReviews(response.data)
            onCountChange && onCountChange(response.data.length)
        }catch (error){
            console.error('댓글 조회 실패 :', error)
        }
    }

    // 댓글 신고기능
    const reportReview = async (id) => {
        if(!loginId){
            setRfModalType('loginAlert')
            setRfModalOpen(true)
            return
        }
        if (!window.confirm('이 댓글을 신고하시겠습니까?')) return

        try{
            await axios.put(`/api/review/report/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })
            alert('신고가 접수되었습니다.')
            await getReviews()
        }catch(err){
            console.log('댓글 신고 실패:', err)
            alert('신고 처리 중 오류가 발생했습니다.')
        }
    }

    const deleteReview = async (item) => {

        if (!loginId || loginId !== item.userId) {
            alert('삭제 권한이 없습니다.')
            return
        }

        if(window.confirm('댓글을 삭제하시겠습니까?')){
            try{
                await axios.delete('/api/review', { 
                    data: { id: item._id },
                    headers: { Authorization: `Bearer ${token}` }
                })
                alert('댓글이 삭제되었습니다.')
                getReviews()

        } catch (error) {
            console.error('댓글 삭제 실패:', error)
            alert('댓글을 삭제하지 못했습니다.')
        }
    }
}

    const edit = (item) => {
        if (!loginId || loginId !== item.userId) {
            alert('수정 권한이 없습니다.')
            return
        }
        setEditId(item._id)
        setEditContent(item.content)
    }

    const cancelEdit = () => {
        setEditId(null)
        setEditContent('')
    }

    const update = async (id) => {

        if(!editContent.trim()){
            alert('수정할 내용을 입력해주세요.')
            return
        }
        try{
            await axios.put('/api/review', 
                { id, content: editContent },
                { headers: { Authorization: `Bearer ${token}` }}
            )
            setEditId(null)
            setEditContent('')
            await getReviews()
        }catch(error){
            console.error('댓글 수정 실패: ', error)
            alert('댓글을 수정하지 못했습니다.')
        }
    }

    // 로그인 상태확인해서 답글창 열기
    const toggleReply = (id) => {

        if(!loginId){
            alert('로그인이 필요합니다.')
            return
        }

        setReplyParent(replyParent === id ? null : id)
        setReplyContent('')
    }

    const replyParentPost = async (numRev) => {
        if(!replyContent.trim()){
            alert('내용을 입력하세요.')
            return
        }

        try{
            await axios.post ('/api/review', 
            {numBrd, content: replyContent, parent: numRev},
            { headers: { Authorization: `Bearer ${token}` }}
        )
            alert('답글이 등록되었습니다.')
            setReplyParent(null)
            setReplyContent('')
            await getReviews()
        }catch (err) {
            console.error('답글 등록 실패:' ,err)
        }
    }

    return (
        <Box sx={{mt: 4, pl:1}}>
            <Typography variant="h6">댓글</Typography>

           {reviews.filter(r => !r.hidden).length > 0 ? (
                reviews .filter(r => !r.hidden).map((item) => (
                    <Box key={item._id} sx={{ mx: 1 ,mb: item.depth > 0 ? 0.2 : 1, ml: item.depth > 0 ? 3 : 0,
                        p: item.depth > 0 ? 0.5 : 0.5}}>

                    {editId === item._id ? (
                        <>
                            <TextField fullWidth multiline rows={4} onChange={(e) => setEditContent(e.target.value)}
                                value={editContent} sx={{ mb: 2 }}/>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button variant="contained" color="primary" onClick={() => update(item._id)}
                                    size="small" sx={{ backgroundColor:"#5ab8b3ff" ,fontSize: '10px' }}>저장</Button>
                                <Button variant="contained" color="inherit" onClick={cancelEdit}
                                    size="small" sx={{ fontSize: '10px' }}>취소</Button>
                            </Box>
                        </>
                    ) : (
                    <>
                    {item.deleted ? (
                        <Typography variant="body2" sx={{ mt: 3, mb: 1, color: 'gray'}}>
                            댓글이 삭제되었습니다.
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>{item.content}</Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '30px'}}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <Typography variant="body2" sx={{ color: 'gray' }}>
                                        {item.userId || '익명'} · {new Date(item.created).toLocaleString('ko-KR')}
                                    </Typography>

                                    <Button variant="text" color="error" size="small"
                                        sx={{...buttonStyle, p: '2px 4px', minWidth: 'auto'}}
                                        onClick={() => reportReview(item._id)}>
                                        신고
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mb:2}}>
                                    {loginId && item.userId && loginId === item.userId && (
                                        <>
                                        <Button variant="contained" color="inherit" onClick={() => edit(item)}
                                            size="small" sx={{...buttonStyle, '&:hover':{color:'#5ab8b3ff'}}}>수정</Button>
                                        <Button variant="contained" color="inherit" onClick={() => deleteReview(item)}
                                            size="small" sx={{...buttonStyle, '&:hover':{color:'red'}}}>삭제</Button>
                                        </>
                                    )}

                                    {loginId && (
                                        <Button variant="contained" color="inherit" onClick={()=> toggleReply(item.numRev)}
                                            size="small" sx={{...buttonStyle, '&:hover':{color:'green'}}}>답글</Button>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                    </>
                )}
                        <Divider />

                        {replyParent === item.numRev && (
                            <Box sx={{mt:2}}>
                                <TextField fullWidth multiline rows={1} value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)} placeholder="내용을 입력하세요."
                                sx={{ mb: 1}}/>
                                
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
                                    <Button variant="contained" size="small" sx={{backgroundColor:"#5ab8b3ff"}} 
                                    onClick={() => replyParentPost(replyParent)}>등록</Button>
                                    <Button variant="outlined" size="small" sx={{borderColor:'#20B2AA', color: '#20B2AA'}}
                                    onClick={() => {setReplyParent(null); setReplyContent('');}}>취소</Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                ))
            ) : (
                <Box sx={{ mt:8, textAlign: 'center' }}>
                    <Typography>첫 댓글을 작성해보세요 ❤️</Typography>
                </Box>
            )}
          {rfModalType === 'loginAlert' && (
          <LoginAlertModal
            open={rfModalOpen}
            onClose={() => setRfModalOpen(false)}
          />
        )}   
        </Box>
    );
};

export default ReviewList;
