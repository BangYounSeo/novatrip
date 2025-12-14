import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import GoodButton from '../tripGood/goodButton';
import LoginAlertModal from '../login/LoginAlertModal';

const EventItem = ({ item, onEventClick, userid, openLoginModal }) => {
  const { title, commonInfo, firstimage, contenttypeid, contentid } = item;
  const imageUrl = commonInfo?.firstimage || firstimage || '';

  return (
    <Card
      onClick={() => onEventClick(item)}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
        display: 'flex',
        flexDirection: 'column',
        width: {lg:260,xs:160},
        height: {lg:300,xs:200},
        position: 'relative',
      }}
    >
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={title}
          sx={{ height: {lg:240,xs:160}, objectFit: 'cover' }}
        />
      )}

      {/* 좋아요 버튼 컴포넌트 */}
      <GoodButton
        contenttypeid={contenttypeid}
        contentid={contentid}
        userid={userid}
        islist={true}
        openLoginModal={openLoginModal}
      />

      <CardContent
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          height: 20,
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography
            variant="h6"
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:{lg:16,xs:12}}}
          >
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventItem;
