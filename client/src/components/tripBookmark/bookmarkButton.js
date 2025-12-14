import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { toggleBookmark, getTripBookmark } from '../tripBookmark/bookmarkApi';
import LoginAlertModal from '../login/LoginAlertModal';

const BookmarkButton = ({ contenttypeid, contentid, userid, openLoginModal }) => {
  const token = localStorage.getItem('token')
  const [bookmark, setBookmark] = useState(false);

  useEffect(() => {


    if (!contenttypeid || !contentid || !userid) return;
    const fetchBookmark = async () => {
      try {
        const res = await getTripBookmark(contenttypeid, contentid, userid);
        setBookmark(res.data.bookmark || false);
      } catch (err) {
        console.error('북마크 초기 상태 불러오기 실패', err);
      }
    };
    fetchBookmark();
  }, [contenttypeid, contentid, userid]);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if(!token){
      openLoginModal();
      return
    }
    const newBookmark = !bookmark;
    setBookmark(newBookmark);

    try {
      await toggleBookmark(contenttypeid, contentid, userid);
    } catch (err) {
      console.error('북마크 토글 실패', err);
      setBookmark(!newBookmark);
    }
  };

  return (
    <Tooltip title={bookmark ? '즐겨찾기 취소' : '즐겨찾기 추가'} arrow>
      
      <IconButton
        onClick={handleBookmark}
        sx={{
          width: 34, // 🔹 크기 줄임
          height: 34, // 🔹 크기 줄임
          borderRadius: '50%',
          border: '2px solid #FFC107',
          backgroundColor: bookmark ? '#FFC107' : 'rgba(255, 255, 255, 0.95)',
          color: bookmark ? '#fff' : '#FFC107',
          boxShadow: bookmark
            ? '0 0 8px rgba(255, 193, 7, 0.6)'
            : '0 0 4px rgba(0,0,0,0.1)',
          transition: 'all 0.25s ease',
          '&:hover': {
            backgroundColor: bookmark
              ? '#FFB300'
              : 'rgba(255, 193, 7, 0.2)',
            transform: 'scale(1.05)', // 🔹 hover 효과도 살짝 줄임
            boxShadow: '0 0 8px rgba(255, 193, 7, 0.4)',
          },
          '&:active': {
            transform: 'scale(0.93)',
          },
        }}
      >
        {bookmark ? (
          <StarIcon fontSize="small" />
        ) : (
          <StarBorderIcon
            fontSize="small"
            sx={{
              color: '#FFC107',
              filter: 'drop-shadow(0 0 1px rgba(255,193,7,0.6))',
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default BookmarkButton;
