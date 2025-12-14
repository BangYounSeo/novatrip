import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, CircularProgress } from '@mui/material';
import EventList from './EventList';


const Event = ({ searchText, setSearchText, onEventClick,eventData,isLoadingEvent,userid,openLoginModal}) => {
  

  // 검색어로 필터링
  const filteredData = eventData.filter(item =>
    (item.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.addr1 || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{width:'100%', maxWidth:880, mx:'auto',minHeight:0}}>
      <Box sx={{  maxWidth:'100%', mt:2,justifyContent:'center',display:'flex' }}>
        <TextField
          label="검색 (지역명 또는 이벤트명)"
          variant="outlined"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          sx={{width:'85%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#20B2AA' },
              borderRadius: '20px', height: '35px', display: 'flex', alignItems: 'center',
              '&:hover fieldset': { borderColor: '#1ca092' },
              '&.Mui-focused fieldset': { borderColor: '#008080' },
            },
            '& .MuiInputLabel-root': { color: '#20B2AA' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#008080'},
            '& .MuiInputBase-input': { fontSize: 14, padding: '0 16px' , lineHeight: '35px',
              height: '35px', boxSizing: 'border-box'}
          }}
          size='small'
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>

          {isLoadingEvent ?
        ( filteredData.length > 0 ? (
          <EventList eventData={filteredData} onEventClick={onEventClick} isLoadingEvent={isLoadingEvent} userid={userid} openLoginModal={openLoginModal}/>
        ) : (
          <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>검색 결과가 없습니다.</Typography>
        )) :
        (
          <Box sx={
            {display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            mt : 10}
            }>
          <CircularProgress sx={{color:'#20b2aa'}} />
          <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>
                    데이터 로딩중...
          </Typography>
          </Box>
        )
      }
      </Box>
    </Box>
  );
};

export default Event;
