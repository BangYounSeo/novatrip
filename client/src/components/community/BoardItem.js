import { Avatar, Box, Card, CardContent, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format, isAfter, isBefore } from 'date-fns';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

const BoardItem = ({item,onClick}) => {

    const { numBrd,userId,subject,content,tags,boardType,author,
        tourStyle,startDate,endDate,tourSpot,hitCount,good,created} = item
        
    const imageUrl = item.coverImage?.path
    const src = author?.profileImage ? encodeURI(author.profileImage) : undefined;
    const age10s = author?.age !=null ? 
    `${Math.floor(Number(author.age) / 10) * 10}대`:'';
    const fmt = (d) => {
        if(!d) return;

        const date = new Date(d)
        const now = new Date()
        const diffDays = differenceInDays(now,date)

        if(diffDays === 0){
            return format(date,'MM-dd hh:mm')
        }else if(diffDays===1){
            return '1일전'
        }else if(diffDays<7){
            return `${diffDays}일전`
        }else{
            return format(date,'yy-MM-dd')
        }
    }

    const navigate = useNavigate()

    const boardTypes={
        review:'후기',
        recommend:'추천',
        info:'정보',
        free:'자유주제',
        notice:'공지'
    }

    return (
        <Card sx={{
        position:'relative',
        zIndex:0,
        borderRadius: 3,
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
        p: 2,
        display: 'grid',
        gridTemplateColumns: imageUrl ? '1fr 120px' : '1fr',
        columnGap: 2,
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.12)', transform: 'translateY(-1px)' },
        transition: 'all .2s ease',
        }}
        onClick={onClick}
        >
            {/* 썸네일 이미지 */}
        {/* 내용 */}
        <Box sx={{ flex: 1, py: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={boardTypes[boardType]} size="small" sx={{color:'#20b2aa',fontSize:12, height:18,bgcolor:'#e4e4e4',fontWeight:'bold'}} variant="filled" />
            <Typography variant="caption" color="text.secondary">
                 <AccessTimeFilledIcon sx={{width:17,height:17,verticalAlign:'middle',color:'gray',mb:'1px'}}/>{fmt(created)}
            </Typography>
            </Stack>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5,fontSize:14 }}>
            {subject}
            </Typography>

            <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1,fontSize:13,display:'-webkit-box',
                WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis' }}
            >
            {content}
            </Typography>
            <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" alignItems='center'>
                <Avatar src={src}
                onError={(e) => {e.currentTarget.src='/broken-image.jpg'}} sx={{width:20,height:20,position:'relative',zIndex:1}}/>
                <Typography variant='caption' color='text.secondary'>
                    {author?.nickname?? item.userId ?? '알수없음'}
                    {age10s && `·${age10s}`}
                    {author?.gender? (author.gender === 'male'?'·남자':'·여자') : ''}
                </Typography>
            </Stack>

        </Box>
        {imageUrl && (
        <Box
            component="img"
            src={imageUrl}
            alt={subject}
            sx={{
                width: 75,
                aspectRatio: '4 / 3',
                borderRadius: 2,
                objectFit: 'cover',
                bgcolor: '#f5f5f5',
                justifySelf: 'end',
            }}
            loading="lazy"
        />
        )}
        </Card>
    );
};

export default BoardItem;