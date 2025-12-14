
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, InputAdornment } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import LoginAlertModal from '../login/LoginAlertModal';

const ReviewWrite = ({ numBrd }) => {

    const [content, setContent] = useState('')
    const [loginId, setLoginId] = useState('')
    const [rfModalOpen,setRfModalOpen] = useState(false)
    const [rfModalType,setRfModalType] = useState('')    
    const token = localStorage.getItem('token')

    
    // 로그인 ID 관리
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
            try {
                setLoginId(jwtDecode(token).userId)
            } catch (error) {}
        }
    }, [])

    const ChangeRevSub = async (e) => {
        e.preventDefault()

        if(!token){
            setRfModalType('loginAlert')
            setRfModalOpen(true)
            return
        }       
        
        if(!content.trim()){
        alert('내용을 입력해주세요')
        return
        }

        try{

            await axios.post('/api/review', {
                userId: loginId,
                content,
                numBrd
            }, {
                headers: {Authorization: `Bearer ${token}`}
            }    
            )

            alert('댓글이 등록되었습니다.')
            setContent('')
            window.location.reload()
            
        }catch (error) {
           const status = error?.response?.status
           const msg = error?.response?.data?.message
           if(status === 403 && msg) {
            alert(msg);
           }else if(status === 401){
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
           }else{
            alert(msg || '댓글 등록 중 오류가 발생했습니다.')
           }
        }

        }
    

    return (
        <Box component="form" onSubmit={ChangeRevSub}>
            <TextField fullWidth value={content} variant="outlined"
                onChange={(e) => setContent(e.target.value)} placeholder="댓글을 작성해보세요."
                InputProps={{ 
                    endAdornment : (
                    <InputAdornment position="end">
                        <Button type="submit" variant="text" size="small"
                        sx={{ fontSize: '12px', backgroundColor: 'transparent',
                            boxShadow: 'none', color: '#20b2aa', borderRadius: '15px'}}>등록</Button>
                    </InputAdornment> ),
                        sx: {borderRadius: '25px', height: '40px', paddingLeft: '10px',
                            '& .MuiInputBase-input::placeholder': { color: '#000'}}
                }}
            />
                {rfModalType === 'loginAlert' && (
                <LoginAlertModal
                    open={rfModalOpen}
                    onClose={() => setRfModalOpen(false)}
                />
                )}               
        </Box>
    );
};

export default ReviewWrite;