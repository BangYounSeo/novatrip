// src/components/info/EventDetail.js
import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, Divider, Stack, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import GoodButton from '../tripGood/goodButton';
import BookmarkButton from '../tripBookmark/bookmarkButton';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { BoardContext } from '../community/BoardContext';


const EventDetail = ({ event: propEvent, onEventBack, userid, openLoginModal }) => {
const [kakaoReady, setKakaoReady] = useState(false);
const [event, setEvent] = useState(propEvent || null);
const { contentId } = useParams();


const location = useLocation();
const { selectedEvent } = location.state || {};
const { setForm, setModalOpen, setModalCat } = useContext(BoardContext);


// 최초 진입 시(캐러셀/리스트) 상태 or 저장본 사용
useEffect(() => {
const saved = propEvent || selectedEvent;
if (saved) {
const normalized = {
...saved,
contentid: saved.contentid || saved.contentId,
firstimage: saved.firstimage || saved.image,
};
setEvent(normalized);
localStorage.setItem('selectedEvent', JSON.stringify(normalized));
} else {
const stored = localStorage.getItem('selectedEvent');
if (stored) setEvent(JSON.parse(stored));
}
}, [propEvent, selectedEvent]);

// 카카오 지도 SDK 로딩
useEffect(() => {
if (typeof window.kakao !== 'undefined') {
setKakaoReady(true);
} else {
const script = document.createElement('script');
const JS_KEY = process.env.REACT_APP_KAKAO_JS_KEY || 'YOUR_KAKAO_JS_KEY';
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&autoload=false`;
script.async = true;
script.onload = () => window.kakao.maps.load(() => setKakaoReady(true));
document.head.appendChild(script);
}
}, []);





// 필수 필드(mapx/mapy/contenttypeid 등) 누락 시 보강
useEffect(() => {
const id = event?.contentid || contentId;
const lacksCore = !event?.mapx || !event?.mapy || !event?.contenttypeid;
if (id && event && lacksCore) {
(async () => {
try {
const res = await axios.get('/api/tour/event/detail', { params: { contentId: id } });
setEvent((prev) => ({ ...prev, ...res.data }));
localStorage.setItem('selectedEvent', JSON.stringify({ ...(event || {}), ...res.data }));
} catch (err) {
console.error('이벤트 상세(보강) 실패:', err);
}
})();
}
}, [event, contentId]);

// URL 파라미터만 있을 때 상세 조회
useEffect(() => {
if (!event && contentId) {
(async () => {
try {
const res = await axios.get('/api/tour/event/detail', { params: { contentId } });
setEvent(res.data);
localStorage.setItem('selectedEvent', JSON.stringify(res.data));
} catch (err) {
console.error('이벤트 상세 불러오기 실패:', err);
}
})();
}
}, [contentId, event]);

const getHomepageUrl = (homepage) => {
if (!homepage) return null;
const match = homepage.match(/href=["']([^"']+)["']/);
return match?.[1]?.trim() || homepage.trim();
};


if (!event) return <Typography sx={{ p: 4 }}>로딩 중...</Typography>;


const { title, contenttypeid, contentid, addr1, addr2, tel, mapx, mapy, eventstartdate, eventenddate, firstimage, overview } = event;


const onMateAdd = () => {
setForm((prev) => ({
...prev,
boardType: 'mate',
subject: `[동행구함] ${title}`,
content: `안녕하세요! 이번에 ${title}에 함께 가실 동행을 구합니다.`,
tourSpot: {
address: addr1,
roadAddress: addr2,
placeName: title,
borough: '',
location: { type: 'Point', coordinates: [Number(mapx), Number(mapy)] },
},
}));
setModalCat('mate');
setModalOpen(true);
};


const xy = { lat: Number(mapy), lng: Number(mapx) };
const homepageUrl = getHomepageUrl(event.homepage);


return (
<Box sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
<Box sx={{ position: 'relative', height: '40vh', overflow: 'hidden' }}>
{firstimage && (
<Box component="img" src={firstimage} alt={title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
)}
<Typography variant="h3" sx={{ position: 'absolute', bottom: 20, left: 40, color: 'white', fontWeight: 'bold', textShadow: '2px 2px 6px rgba(0,0,0,0.5)' }}>
{title}
</Typography>
</Box>


<Box sx={{ flexGrow: 1, p: 4 }}>
<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
<Typography variant="h5" gutterBottom fontWeight="bold">이벤트 정보</Typography>
<ArrowBackIcon sx={{ cursor: 'pointer' }} onClick={onEventBack} fontSize="large" />
</Box>
<Divider sx={{ mb: 3 }} />

<Stack spacing={2}>
<Box display="flex" justifyContent="space-between" alignItems="center">
<Typography variant="body1"><strong>📍 주소:</strong> {addr1} {addr2}</Typography>
{contenttypeid && contentid ? (
<Box display="flex" gap={1}>
<GoodButton contenttypeid={Number(contenttypeid)} contentid={Number(contentid)} userid={userid} openLoginModal={openLoginModal} />
<BookmarkButton contenttypeid={Number(contenttypeid)} contentid={Number(contentid)} userid={userid} openLoginModal={openLoginModal} />
</Box>
) : null}
</Box>



<Typography variant="body1"><strong>☎️ 전화:</strong> {tel || '정보 없음'}</Typography>
<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}><strong>🌐 개요:</strong> {overview || '정보 없음'}</Typography>
<Typography variant="body1"><strong>📅 기간:</strong> {eventstartdate || '정보 없음'} ~ {eventenddate || '정보 없음'}</Typography>


<Typography variant="body1">
<strong>홈페이지:</strong>{' '}
{homepageUrl ? (
<Link href={homepageUrl} target="_blank" rel="noopener noreferrer" sx={{ color: '#20B2AA', textDecoration: 'underline', '&:hover': { color: '#1ca092' } }}>
{homepageUrl} <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
</Link>
) : (
' 정보 없음'
)}
</Typography>


<Box sx={{ width: '100%', height: 300 }}>
{kakaoReady ? (
<Map center={xy} style={{ width: '100%', height: '100%' }} level={3}>
<MapMarker position={xy} title={title} />
</Map>
) : (
<Typography sx={{ textAlign: 'center', mt: 12 }}>'지도 로딩 중.'</Typography>
)}
</Box>


<Button variant="outlined" onClick={onMateAdd} sx={{ borderColor: '#20B2AA', color: '#20B2AA' }}>동행 구하기</Button>


{/* 관리자용: 캐러셀 업서트 */}
<Button
variant="contained"
onClick={async () => {
try {
const payload = {
title,
contenttypeid,
contentid,
addr1,
addr2,
tel,
mapx: Number(mapx),
mapy: Number(mapy),
eventstartdate,
eventenddate,
firstimage,
overview,
active: true,
priority: 10,
link: `/event/detail/${contentid}`,
};
await axios.post('/api/ad/event-ads', payload);
alert('캐러셀 광고로 등록되었습니다.');
} catch (e) {
alert('광고 등록 실패: ' + (e?.response?.data?.message || e.message));
}
}}
>
캐러셀에 올리기
</Button>
</Stack>
</Box>
</Box>
);
};


export default EventDetail;