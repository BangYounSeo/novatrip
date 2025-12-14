import React, { useEffect, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { toggleGood, getTripGoodCount } from '../tripGood/goodApi';
const GoodButton = ({
  contenttypeid,
  contentid,
  userid,
  islist = false,
  goodState, // 부모에서 내려주는 { good, count } 객체 (optional)
  onGoodChange, // 부모에 전달할 콜백 (optional)
  openLoginModal
}) => {
  const [localGood, setLocalGood] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const token = localStorage.getItem('token')

  // 초기 좋아요 상태 불러오기
  useEffect(() => {
    if (!contenttypeid || !contentid || !userid) return;
    const fetchGood = async () => {
      try {
        const res = await getTripGoodCount(contenttypeid, contentid, userid);
        const data = {
          good: res.data.good || false,
          count: res.data.count || 0,
        };
        setLocalGood(data.good);
        setLocalCount(data.count);
        if (onGoodChange) onGoodChange(contentid, data); // 부모에 초기값 전달
      } catch (err) {
        console.error('좋아요 초기 상태 불러오기 실패', err);
      }
    };
    fetchGood();
  }, [contenttypeid, contentid, userid]);

  // 부모에서 내려준 상태가 있으면 그걸 우선 사용
  const good = goodState?.good ?? localGood;
  const count = goodState?.count ?? localCount;


  const handleLike = async () => {
    if(!token){
      openLoginModal();
      return
    }

    const newGood = !good;
    const newCount = count + (newGood ? 1 : -1);

    // 내부 상태 즉시 반영 (낙관적 업데이트)
    setLocalGood(newGood);
    setLocalCount(newCount);

    try {
      await toggleGood(contenttypeid, contentid, userid);
      if (onGoodChange) onGoodChange(contentid, { good: newGood, count: newCount });
    } catch (err) {
      console.error('좋아요 토글 실패', err);
      // 실패하면 롤백
      setLocalGood(!newGood);
      setLocalCount(count);
    }
  };

  // 리스트용 버튼
  if (islist) {
    return (
      <Tooltip title={good ? '좋아요 취소' : '좋아요 추가'} arrow>
        <IconButton
          onClick={(e)=>{
            e.stopPropagation();
            handleLike();}}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: good ? 'red' : 'white',
            '&:hover': {
              backgroundColor: good ? 'darkred' : 'rgba(255,0,0,0.2)',
            },
            padding: 0,
          }}
        >
          {good ? (
            <FavoriteIcon sx={{ fontSize: 20, color: 'white' }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 20, color: 'red' }} />
          )}
          
        </IconButton>
      </Tooltip>
    );
  }

  // 상세용 버튼
  return (
    
    <Tooltip title={good ? '좋아요 취소' : '좋아요 추가'} arrow>
      <Box
        onClick={handleLike}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          cursor: 'pointer',
          backgroundColor: good ? 'red' : 'transparent',
          color: good ? 'white' : 'red',
          border: '1px solid red',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: good ? 'darkred' : 'rgba(255,0,0,0.1)',
          },
        }}
      >
        {good ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        <Typography variant="body2">{count}</Typography>

      </Box>
    </Tooltip>
  );
};

export default GoodButton;
