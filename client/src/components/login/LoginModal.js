import { React, useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography, IconButton, Collapse, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link, redirect, useNavigate } from 'react-router-dom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const LoginModal = ({open, onClose, setToken}) => {
    const navigate = useNavigate();
    const [userInfo,setUserInfo] = useState(null);
    
    const token = localStorage.getItem('token')
    const isLoggedIn = Boolean(token)
    
    //내정보 변경 토글생성
    const [showProfileOption,setShowProfileOption] = useState(false);
    const toggleProfileOption = () => {
      setShowProfileOption(prev => !prev);
    }

    const isAdmin = useMemo(() => {
      if (!token) return false;
      try {
        const decoded = jwtDecode(token);
        return decoded.role === "admin";
      } catch {
        return false;
      }
    }, [token]);

    useEffect(() => {

        if(!token) {
          setUserInfo(null);
          return;
        }
        axios.get('/api/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setUserInfo(res.data))
        .catch(()=> setUserInfo(null))

    },[token]);

  //카카오 로그인
  useEffect(() => {
    const handleKakaoMessage = (event) => {
      if (event.origin !== "http://192.168.0.34:8080" && event.origin !== "http://192.168.0.34:3000") return;
      const { token, nickname } = event.data;
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        alert(`${nickname}님 환영합니다!`);
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

    //버튼 css 균일화
    const MenuButton = styled(Button)(({theme }) => ({ 
      justifyContent: 'flex-start',
      width: '100%',
      textTransform: 'none',
      minHeight: '36px',
      marginBottom: theme.spacing(0.5),
      color: '#5a5a5a'
    }));
    
    
    if (!open) return null;

  
  //로그인 함수
  const goLogin = () => {
    navigate('/login')
  }  

  //토큰 초기화(로그아웃)
  const goLogout = () => {
      localStorage.removeItem("token"); // 브라우저 저장소에서 토큰 제거
      setToken(null);                    // App 상태에서도 초기화
      navigate("/")
      window.location.reload();         // ✅ 새로고침으로 완전 초기화
  };

  const goSignUp = () => {
    navigate('/signup/email')
  }

  // MyInfo의 특정 탭을 바로 열도록 이동
  const openMyInfoTab = (tab) => {
    // 모달 닫기
    if (typeof onClose === 'function') onClose();
    // Main 레이아웃을 유지한 채 /myInfo 로 이동 + 어떤 탭을 열지 쿼리로 전달
    navigate(`/myInfo?tab=${tab}`);
  };

  return (
    
    <>
      {/* 배경 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 12,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          zIndex:1500
        }}
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 270,
          height: '100%',
          backgroundColor: 'white',
          p: 2,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 1600,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">
            {isLoggedIn ? '내 계정' : '로그인해주세요.'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <div>
          <hr style={{ border: 'none', borderTop: '3px solid rgba(80,15,0,0.8)' }} />
        </div>

        {/*  로그인 여부에 따른 분기 */}
        {isLoggedIn ? (
          <>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {userInfo?.nickname || '사용자'} 님 환영합니다!
            </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0}}>
            <MenuButton 
            startIcon={<AssignmentIndOutlinedIcon/>} 
            onClick={toggleProfileOption} 
            sx={{color:'#212121'}}>
              계정 설정</MenuButton>
            <Collapse in={showProfileOption}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <MenuButton startIcon={<ManageAccountsIcon/>}
                onClick={()=> openMyInfoTab('edit')}>
                  프로필 편집
                </MenuButton>
                <MenuButton startIcon={<LockResetIcon/>}
                onClick={()=> openMyInfoTab('password')}>
                  비밀번호 변경</MenuButton>
                <MenuButton startIcon={<PersonRemoveIcon/>}
                onClick={()=> openMyInfoTab('delete')}
                sx={{color:'#ec407a'}}>
                  회원탈퇴</MenuButton>
              </Box>
            </Collapse>
            <hr style={{ margin: '2px 0', borderTop: '2px solid #ccc' }} />
          </Box>
          {isAdmin &&
           <MenuButton startIcon={<AdminPanelSettingsIcon/>} onClick={() => navigate('/admin')}>관리자 페이지</MenuButton>
          }

            <MenuButton
              startIcon={<LogoutOutlinedIcon/>}
              sx={{mt:0, color:'#ec407a'}}
              onClick={goLogout}
            >
              로그아웃
            </MenuButton>
          </>
        ) : (
          <>
            <MenuButton
              sx={{color:'#FBC02D'}}
              onClick={onKakaoLogin}
            >
              카카오톡으로 로그인하기
            </MenuButton>
            <MenuButton
              sx={{color:'#212121'}}
              onClick={goLogin}
            >
              아이디로 로그인하기
            </MenuButton>

            <MenuButton
              sx={{color:'#212121'}}
              onClick={goSignUp}
            >
              아직 회원이 아니신가요?
            </MenuButton>
          </>
        )}
      </Box>
    </>
  );
};

export default LoginModal;