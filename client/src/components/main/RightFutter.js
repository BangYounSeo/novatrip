import * as React from 'react';
import { useState, useImperativeHandle, forwardRef, useContext, useRef, useEffect } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import GroupsIcon from '@mui/icons-material/Groups';
import MapIcon from '@mui/icons-material/Map';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import { Box, Popover, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BoardContext } from '../community/BoardContext';

const RightFutter = forwardRef(({ onMenu, setRfModalOpen, setRfModalType }, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setModalCat, setModalOpen } = useContext(BoardContext);

  const navigate = useNavigate();
  const path = window.location.pathname.split("/")[1];
  const menu = path || 'community';
  const [value, setValue] = useState(menu);

  // 부모(Main)에서 setValue를 직접 제어할 수 있게 공개
  useImperativeHandle(ref, () => ({
    setFooterValue: (val) => setValue(val),
  }));

  // 토큰 확인
  const token = localStorage.getItem('token');

  // 메뉴 변경 핸들러
  const handleChange = (event, newValue) => {
    // 로그인 모달
    if (newValue === 'myInfo' && !token) {
      setRfModalType('loginAlert');
      setRfModalOpen(true);
      return;
    }

    if (newValue === 2) return; // Add 버튼 방지

    const newQuery = new URLSearchParams();
    newQuery.set('menu', newValue);
    navigate({ search: newQuery.toString() });

    setValue(newValue);
    onMenu(newValue);
  };

  // + 버튼 클릭 시
  const handlePlusClick = (evt) => {
    evt.stopPropagation();

    if (!token) {
      setRfModalType('loginAlert');
      setRfModalOpen(true);
      return;
    }

    setAnchorEl(anchorEl ? null : evt.currentTarget);
  };

  const open = Boolean(anchorEl);

  const onAddPost = (val) => {
    setAnchorEl(null);
    setModalOpen(true);
    setModalCat(val);
  };

  const footerRef = useRef(null);

  return (
    <Box ref={footerRef} sx={{ position: 'relative', bottom: 0, width: '100%', zIndex: 1000 }}>
      {/* 팝오버 */}
      <Popover
        disablePortal
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(50,50,50,0.9)',
            color: 'white',
            borderRadius: 2,
            paddingY: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          },
        }}
      >
        <Box sx={{ px: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.7,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => onAddPost('mate')}
          >
            <GroupAddIcon sx={{ mr: 1 }} />
            <Typography variant="body2">동행글 작성</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.7,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => onAddPost('post')}
          >
            <DescriptionIcon sx={{ mr: 1 }} />
            <Typography variant="body2">포스트 작성</Typography>
          </Box>
        </Box>
      </Popover>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        sx={{
          width: '100%',
          bottom: 0,
          borderTop: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
          transition: 'none',
          zIndex: 1000,
          color: '#20B2AA',
          '& .MuiBottomNavigationAction-root': {
            color: '#808080',
            transition: 'color 0.3s ease',
            '& .MuiSvgIcon-root': {
              color: '#808080',
              transition: 'color 0.2s ease',
            },
            '&:hover': {
              color: '#20B2AA',
              '& .MuiSvgIcon-root': { color: '#20B2AA' },
            },
          },
          '& .Mui-selected': {
            fontSize: 12,
            color: '#20B2AA',
            '& .MuiSvgIcon-root': { color: '#20B2AA' },
          },
          '& .Mui-selected svg': { color: '#20B2AA' },
        }}
        showLabels
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction label="커뮤니티" value="community" icon={<GroupsIcon />} />
        <BottomNavigationAction label="여행정보" value="event" icon={<ImportContactsIcon />} />
        <BottomNavigationAction
          className="fab"
          sx={{
            '& .MuiSvgIcon-root': { color: '#20b2aa !important' },
            '&:hover .MuiSvgIcon-root': { color: '#20B2AA' },
          }}
          icon={<AddCircleIcon sx={{ fontSize: 35 }} onClick={handlePlusClick} />}
        />
        <BottomNavigationAction label="내 여행" value="myInfo" icon={<CardTravelIcon />} />
        <BottomNavigationAction label="지도" value="map" icon={<MapIcon />} />
      </BottomNavigation>
    </Box>
  );
});

export default RightFutter;
