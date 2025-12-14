import { Avatar, Box, Card, CardMedia, Chip, Stack, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';

const MateItem = ({ item, onClick }) => {
  const { subject, content, tourStyle = [], startDate, endDate, tourSpot, coverImage,author } = item;
  const imageUrl = coverImage?.path;
  const src = author?.profileImage ? encodeURI(author.profileImage) : undefined;

  const fmt = (d) => (d ? format(new Date(d), 'yy.MM.dd') : '');
  const addrText =
    tourSpot?.placeName ||
    tourSpot?.roadAddress ||
    tourSpot?.address ||
    tourSpot?.borough ||
    '';

  const previewStyles = tourStyle.slice(0, 2);
  const age10s = author?.age !=null ? 
  `${Math.floor(Number(author.age) / 10) * 10}대`:'';

  return (
    <Card
      onClick={onClick}
      sx={{
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
    >
      {/* 좌측 텍스트 */}
      <Box sx={{ pr: 0 }}>
        {/* 제목 (최대 2줄) */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {subject}
        </Typography>

        {/* 본문 요약 (최대 2줄) */}
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 13,
            color: 'text.secondary',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {content}
        </Typography>

        <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" alignItems='center'>
            <Avatar src={src} 
            onError={(e) => {e.currentTarget.src='/broken-image.jpg'}} sx={{width:20,height:20,position:'relative',zIndex:1}}/>
            <Typography variant='caption' color='text.secondary'>
                {author?.nickname?? item.userId ?? '알수없음'}{age10s && `·${age10s}`}
                {author?.gender? (author.gender === 'male'?'·남자':'·여자') : ''}
            </Typography>
        </Stack>

        {/* 날짜 · 주소 메타 */}
        <Stack  spacing={0.5} useFlexGap flexWrap="wrap" mt={1}>
          {startDate && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarMonthIcon sx={{ fontSize: 15, color: '#20b2aa' }} />
              <Typography variant="caption" color="text.secondary">
                {fmt(startDate)} {endDate && `~ ${fmt(endDate)}`}
              </Typography>
            </Stack>
          )}
          {addrText && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 15, color: '#20b2aa' }} />
              <Typography variant="caption" color="text.secondary">
                {addrText}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* 우측 썸네일 */}
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
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

export default MateItem;
