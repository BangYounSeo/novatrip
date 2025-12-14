// src/components/common/LoginAlertModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, Slide, IconButton, Grid } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

export default function LoginAlertModal({ open, onClose,container }) {
  const navigate = useNavigate();
  const FOOTER_HEIGHT = 72;      // RightFutter 높이
  const FOOTER_MAX_WIDTH = 650;  // RightFutter maxWidth
  const [token,setToken] = useState(() => localStorage.getItem('token'));

   //카카오 로그인
      useEffect(() => {
        const handleKakaoMessage = (event) => {
          if (event.origin !== "http://192.168.0.34:8080" && event.origin !== "http://192.168.0.34:3000") return;
          const { token, nickname } = event.data;
          if (token) {
            localStorage.setItem('token', token);
            setToken(token);
            alert(`${nickname}님 환영합니다!`);
            window.location.href='/';
          }
       };
     
        window.addEventListener('message', handleKakaoMessage);
        return () => window.removeEventListener('message', handleKakaoMessage);
      }, []);
    
      
    // 카카오로그인 (팝업창 방식)
    const onKakaoLogin = () => {
      window.open(
        'http://192.168.0.34:8080/login/auth/kakao',
        'kakaoLogin',
        'width=500,height=600'
      );
    };

  return (

    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      container={container?.current}
      disableScrollLock
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.35)', // 기존처럼 얕은 어둡기
        },
        onClick: onClose,
      }}      
      sx={{
        display: 'flex',            // 하단 중앙 정렬의 핵심
        alignItems: 'flex-end',     // ↓ 화면 하단으로 내리기
        justifyContent: 'center',
        position:'absolute',
      }}

    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            bottom: 0,
            left: {lg:'41%'},
            width: '90%',
            position: 'fixed',
            maxWidth: `${FOOTER_MAX_WIDTH}px`,
            height: '30vh',
            minHeight: `${FOOTER_HEIGHT}px`,
            bgcolor: 'white',
            boxShadow: 4,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
        <IconButton
            onClick={(e) => {
              e.stopPropagation(); onClose();
            }}
            sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'gray',
            }}
            aria-label='닫기'
            >
            <CloseIcon/>
        </IconButton>

          <Typography variant="h6">
            로그인이 필요합니다          

          </Typography>

          <Typography variant="body2">
            로그인이 필요한 기능입니다. 로그인 후 이용해주세요.
          </Typography>

          <Button
            variant="contained"
            sx={{ bgcolor: '#20B2AA' }}
            onClick={() => {
              onClose();
              navigate('/login');
            }}
          >
            로그인하러 가기
          </Button>
          
          <Button
            variant="contained"
            sx={{ bgcolor: '#FBC02D' }}
            onClick={() => {
              onClose();
              onKakaoLogin();
            }}
          >
            카카오로 로그인하기
          </Button>
          <div>
            <div>아직 회원이 아니신가요? <Link to='/signup/email'>회원가입</Link></div>
          </div>
        </Box>
      </Slide>
    </Modal>
  );
}
