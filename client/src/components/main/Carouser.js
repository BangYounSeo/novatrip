// src/components/main/Carouser.js
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'react-slick';


const SlickCarousel = ({ onSelect }) => {
const [items, setItems] = useState([]);
const navigate = useNavigate();


const settings = {
dots: true,
infinite: true,
speed: 500,
slidesToShow: 1,
slidesToScroll: 1,
autoplay: true,
autoplaySpeed: 3000,
};


useEffect(() => {
(async () => {
try {
    console.log('bbb');
    
const res = await axios.get('/api/ad/event-ads/public', { params: { limit: 5 } });
console.log('aaa');

const raw = res.data || [];
const norm = raw.map((v) => ({
...v,
contentId: v.contentid,
image: v.firstimage,
}));
setItems(norm);
} catch (e) {
console.error('광고 로드 실패', e);
setItems([]);
}
})();
}, []);


const fallback = [{ title: 'NovaTrip', image: 'https://placehold.co/1200x700?text=NovaTrip' }];
const data = items.length ? items : fallback;


const go = (it) => {
if (!it?.contentId) return; // placeholder 슬라이드 무시
if (onSelect) onSelect(it);
else navigate(`/event/detail/${it.contentId}`, { state: { selectedEvent: it } });
};


return (
<Box sx={{ width: 400, mx: 'auto' }}>
<Slider {...settings}>
{data.map((it, idx) => (
<Box
key={`${it.contentId || 'fb'}-${idx}`}
sx={{ height: 580, position: 'relative', cursor: it.contentId ? 'pointer' : 'default' }}
onClick={() => go(it)}
>
<Box component="img" src={it.image} alt={it.title || `slide-${idx}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5 }} />
{it.title && (
<Typography
variant="subtitle2"
sx={{ position: 'absolute', left: 12, bottom: 12, px: 1, py: 0.5, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 1 }}
>
{it.title}
</Typography>
)}
</Box>
))}
</Slider>
</Box>
);
};


export default SlickCarousel;