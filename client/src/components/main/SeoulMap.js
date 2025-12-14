import {
  Box,
  Typography,
  Button,
  Modal,
  CircularProgress,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { Map, CustomOverlayMap, Polyline } from 'react-kakao-maps-sdk';
import RightFutter from './RightFutter';
import Logo from './Logo';
import HouseIcon from '@mui/icons-material/House';
import TourRoundedIcon from '@mui/icons-material/TourRounded';
import EmojiFoodBeverageRoundedIcon from '@mui/icons-material/EmojiFoodBeverageRounded';
import FlatwareRoundedIcon from '@mui/icons-material/FlatwareRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RoomIcon from '@mui/icons-material/Room';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SkateboardingIcon from '@mui/icons-material/Skateboarding';
import { RiPinDistanceFill } from "react-icons/ri";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import axios from 'axios';
import GoodButton from '../tripGood/goodButton';
import BookmarkButton from '../tripBookmark/bookmarkButton';
import { useLocation } from 'react-router-dom';
import { BoardContext } from '../community/BoardContext';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginAlertModal from '../login/LoginAlertModal';

const SEOUL_BOROUGHS = [
  '종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구',
  '노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구',
  '관악구','서초구','강남구','송파구','강동구'
];

const SeoulMap = ({
  onMenu, 
  menu,
  stayData,
  tripData,
  cafeData,
  foodData,
  cultureData,
  leisureData,
  shopData,
  isLoadingMapData,
  userid
}) => {
  //로그인모달
  const [rfModalOpen, setRfModalOpen] = useState(false);
  const [rfModalType, setRfModalType] = useState('');
  const handleOpenLoginModal = () => {
    setRfModalType('loginAlert');
    setRfModalOpen(true);
  };

  /** ---------- state ---------- */
  const [kakaoReady, setKakaoReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);

  const [detailData, setDetailData] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const [courseData, setCourseData] = useState([]);
  const [courseDetailData, setCourseDetailData] = useState(null);
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [isLoadingCourseData, setIsLoadingCourseData] = useState(false);

  const [highlightedMarker, setHighlightedMarker] = useState(null);
  const [courseMarkers, setCourseMarkers] = useState([]);
  const [coursePathMarkers, setCoursePathMarkers] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState();

  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [selectBorough, setSelectBorough] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 37.5662952, lng: 126.9779451 });

  const listRef = useRef(null);
  const location = useLocation();
  const { selectedPlace } = location.state || {};
  const { boardList } = useContext(BoardContext);

  const [activeIcons, setActiveIcons] = useState({
    stay: true, trip: false, cafe: false, food: false,
    culture: false, leisure: false, shop: false,
    course: false, board: false
  });

  const [goodState, setGoodState] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isCourseFirstRender, setIsCourseFirstRender] = useState(true);
  const [pendingSelectedCourse, setPendingSelectedCourse] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // sm 이하 → 모바일
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // md 이상 → 데스크탑

  /** ---------- util ---------- */
  const extractBorough = (str='') => {
    const hit = str.split(/\s+/).find(t => t.endsWith('구') && SEOUL_BOROUGHS.includes(t));
    return hit || '';
  };
  const withBorough = (arr=[]) => arr.map(it => ({
    ...it,
    _borough: it.borough || extractBorough(`${it.addr1||''} ${it.addr2||''}`),
  }));

  const isRecruiting = (b, now=new Date()) => {
    if(b?.hidden || b?.report) return false;
    if(b?.boardType !== 'mate') return false;

    const s = b?.startDate ? new Date(b.startDate) : null;
    const e = b?.endDate ? new Date(b.endDate) : null;

    // 날짜 미지정 → 모집중으로 간주 (원하면 false로 바꾸세요)
    if (!s && !e) return true;

    // start~end 구간이 있으면 end 기준으로 열려있다고 판단
    if (s && e) return now <= e;

    // start만 있는 경우: 출발 전까지 모집중
    if (s && !e) return now <= s;

    // end만 있는 경우: end 전까지 모집중
    if (!s && e) return now <= e;

    return false;
  }

  const boardsToPlaces = (boards=[]) =>
    boards.filter(b => isRecruiting(b))
    .map(b => {

        const coords = Array.isArray(b?.tourSpot?.location?.coordinates) ? b.tourSpot.location.coordinates : null;

        const lng = coords && Number.isFinite(coords[0]) ? Number(coords[0]) : Number(b?.tourSpot?.lng);
        
        const lat = coords && Number.isFinite(coords[1]) ? Number(coords[1]) : Number(b?.tourSpot?.lat);

        return {
          contentid: `board-${b.numBrd}`,
          contenttypeid: 'board',
          title: b.subject || '(제목없음)',
          firstimage: b.coverImage?.path || b.cover?.url || null,
          overview: b.content || '',
          mapx: Number.isFinite(lng) ? lng : undefined,
          mapy: Number.isFinite(lat) ? lat : undefined,
          addr1: b?.tourSpot?.roadAddress || b?.tourSpot?.address || '',
          addr2: b?.tourSpot?.placeName || '',
          _borough: b?.tourSpot?.borough || extractBorough(`${b?.tourSpot?.roadAddress || ''} ${b?.tourSpot?.address || ''}`),
          _boardRaw: b,
        }
      }).filter(it => it && Number.isFinite(Number(it.mapx)) && Number.isFinite(Number(it.mapy)));

  /** ---------- toggle ---------- */
  const toggleIcon = (icon) => {
    setActiveIcons(prev => {
      const next = Object.fromEntries(
        Object.keys(prev).map(k => {
          if (icon === 'course') return [k, k === 'course' ? !prev.course : false];
          if (k === 'course') return [k, false];
          return [k, k === icon ? !prev[icon] : prev[k]];
        })
      );
      // 코스 off 시 리셋
      if (!next.course) {
        setCourseMarkers([]);
        setCoursePathMarkers([]);
        setSelectedCourseId(null);
        setCourseDetailData(null);
        setCourseDetailOpen(false);
        setHighlightedMarker(null);
      }
      return next;
    });
    setSelectedMarkerId(null);
    setDetailOpen(false);
  };

  /** ---------- memo: source + borough ---------- */
  const stayWithBorough    = useMemo(() => withBorough(stayData || []), [stayData]);
  const tripWithBorough    = useMemo(() => withBorough(tripData || []), [tripData]);
  const cafeWithBorough    = useMemo(() => withBorough(cafeData || []), [cafeData]);
  const foodWithBorough    = useMemo(() => withBorough(foodData || []), [foodData]);
  const cultureWithBorough = useMemo(() => withBorough(cultureData || []), [cultureData]);
  const leisureWithBorough = useMemo(() => withBorough(leisureData || []), [leisureData]);
  const shopWithBorough    = useMemo(() => withBorough(shopData || []), [shopData]);
  const boardPlaces        = useMemo(() => boardsToPlaces(boardList || []), [boardList]);

  /** ---------- merge by toggle ---------- */
  const mergedByToggle = useMemo(() => ([
    ...(activeIcons.stay ? stayWithBorough : []),
    ...(activeIcons.trip ? tripWithBorough : []),
    ...(activeIcons.cafe ? cafeWithBorough : []),
    ...(activeIcons.food ? foodWithBorough : []),
    ...(activeIcons.culture ? cultureWithBorough : []),
    ...(activeIcons.leisure ? leisureWithBorough : []),
    ...(activeIcons.shop ? shopWithBorough : []),
    ...(activeIcons.course ? courseData : []),
    ...(activeIcons.board ? boardPlaces : []),
  ]), [
    activeIcons,
    stayWithBorough, tripWithBorough, cafeWithBorough, foodWithBorough,
    cultureWithBorough, leisureWithBorough, shopWithBorough, courseData, boardPlaces
  ]);

  /** ---------- list vs marker 분리 ---------- */
  // 리스트: 구 필터만. 좌표 없어도 OK (동행 글 노출 보장)
  const listData = useMemo(() => {
    return !selectBorough
      ? mergedByToggle
      : mergedByToggle.filter(it =>
          (it._borough || extractBorough(`${it.addr1||''} ${it.addr2||''}`)) === selectBorough
        );
  }, [mergedByToggle, selectBorough]);

  // 마커: 리스트에서 좌표 숫자화 후 유효 좌표만
  const markerData = useMemo(() => {
    return listData
      .map(it => ({ ...it, _lat: Number(it.mapy), _lng: Number(it.mapx) }))
      .filter(it => Number.isFinite(it._lat) && Number.isFinite(it._lng));
  }, [listData]);

  /** ---------- category helpers ---------- */
  const categoryMap = {
    stay:   { icon: HouseIcon,            color: '#20B2AA' },
    trip:   { icon: TourRoundedIcon,      color: '#FF8C00' },
    cafe:   { icon: EmojiFoodBeverageRoundedIcon, color: '#8B4513' },
    food:   { icon: FlatwareRoundedIcon,  color: '#C71585' },
    culture:{ icon: AccountBalanceIcon,   color: '#4B0082' },
    leisure:{ icon: SkateboardingIcon,    color: '#FF4500' },
    shop:   { icon: ShoppingCartIcon,     color: '#008000' },
    course: { icon: RiPinDistanceFill,    color: '#adb903ff' },
    board:  { icon: GroupsIcon,           color: '#FF1493' },
  };

  const staySet   = useMemo(() => new Set((stayWithBorough||[]).map(i => i.contentid)), [stayWithBorough]);
  const tripSet   = useMemo(() => new Set((tripWithBorough||[]).map(i => i.contentid)), [tripWithBorough]);
  const cafeSet   = useMemo(() => new Set((cafeWithBorough||[]).map(i => i.contentid)), [cafeWithBorough]);
  const foodSet   = useMemo(() => new Set((foodWithBorough||[]).map(i => i.contentid)), [foodWithBorough]);
  const culSet    = useMemo(() => new Set((cultureWithBorough||[]).map(i => i.contentid)), [cultureWithBorough]);
  const leisSet   = useMemo(() => new Set((leisureWithBorough||[]).map(i => i.contentid)), [leisureWithBorough]);
  const shopSet   = useMemo(() => new Set((shopWithBorough||[]).map(i => i.contentid)), [shopWithBorough]);
  const courseSet = useMemo(() => new Set((courseData||[]).map(i => i.contentid)), [courseData]);
  const boardSet  = useMemo(() => new Set((boardPlaces||[]).map(i => i.contentid)), [boardPlaces]);

  const getCategory = (item) => {
    const id = item.contentid;
    if (staySet.has(id)) return 'stay';
    if (tripSet.has(id)) return 'trip';
    if (cafeSet.has(id)) return 'cafe';
    if (foodSet.has(id)) return 'food';
    if (culSet.has(id))  return 'culture';
    if (leisSet.has(id)) return 'leisure';
    if (shopSet.has(id)) return 'shop';
    if (courseSet.has(id)) return 'course';
    if (boardSet.has(id)) return 'board';
    return 'stay';
  };

  /** ---------- effects ---------- */
  // kakao sdk
  useEffect(() => {
    if (typeof window.kakao !== 'undefined') {
      setKakaoReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=26e2113c7c24f40e0c3e45695a54a43f&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setKakaoReady(true));
    document.head.appendChild(script);
  }, []);

  // 리스트 자동 스크롤
  useEffect(() => {
    if (!selectedMarkerId || !listRef.current) return;
    const el = document.getElementById(`list-card-${selectedMarkerId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedMarkerId]);

  // 코스 데이터 fetch
  useEffect(() => {
    if (!activeIcons.course || courseData.length > 0) return;
    (async () => {
      setIsLoadingCourseData(true);
      try {
        const res = await axios.get('/api/course/course', { params: { numOfRows: 50 } });
        setCourseData(res.data);
      } catch (err) {
        console.error('❌ Course 데이터 로딩 실패:', err);
      } finally {
        setIsLoadingCourseData(false);
      }
    })();
  }, [activeIcons.course, courseData.length]);

  // 디테일 진입 애니메이션 딜레이
  useEffect(() => {
    if (!detailData) return;
    const t = setTimeout(() => setIsFirstRender(false), 50);
    return () => clearTimeout(t);
  }, [detailData]);

  useEffect(() => {
    if (!courseDetailData) return;
    const t = setTimeout(() => setIsCourseFirstRender(false), 150);
    return () => clearTimeout(t);
  }, [courseDetailData, courseDetailOpen]);

  // 외부에서 카드 클릭 유입
  useEffect(() => {
    if (!selectedPlace) return;
    myCardClick(selectedPlace);
  }, [selectedPlace]);

  // 코스 pending 선택
  useEffect(() => {
    if (!pendingSelectedCourse || courseData.length === 0) return;
    setSelectedMarkerId(pendingSelectedCourse);
    setPendingSelectedCourse(null);
  }, [pendingSelectedCourse, courseData]);

  /** ---------- handlers ---------- */
  const handleMarkerClick = (place) => {
    // 코스 패널
    if (place.places) {
      setCourseDetailData(place);
      setCourseDetailOpen(true);
      setSelectedMarkerId(place.contentid);
      setLeftOpen(true);
      return;
    }  
    // 일반/동행
    setDetailData(place);
    setDetailOpen(true);
    setSelectedMarkerId(place.contentid);
    setLeftOpen(true);

    const lat = Number(place.mapy);
    const lng = Number(place.mapx);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapCenter({ lat, lng: lng - 0.015 });
    }
  };



useEffect(() => {
  if (detailData ) {
    // 0.1ms 정도 지연 후 열기
    setTimeout(() => setIsFirstRender(false), 50);
    
  }
}, [detailData]);


useEffect(() => {
  if (courseDetailData) {
    const timer = setTimeout(() => setIsCourseFirstRender(false), 150);
    return () => clearTimeout(timer); // cleanup
  }
}, [ courseDetailOpen, courseDetailData]);


   // 클릭한 코스 카드 강조 + 마커 이동
const handleCourseClick = (item) => {
  console.log('item:', item);

  // 카드 클릭이든 마커 클릭이든 둘 다 처리
  const lat = parseFloat(item.mapy ?? item.lat);
  const lng = parseFloat(item.mapx ?? item.lng);

  if (isNaN(lat) || isNaN(lng)) {
    console.warn('⚠️ 좌표값이 유효하지 않습니다:', item);
    return;
  }

  // 기존 경로 초기화
  setCourseMarkers([]);
    setCoursePathMarkers([]);

  // 클릭 카드 강조용 ID 설정
  setSelectedCourseId(item.subcontentid || item.contentid);

  // 지도 중심 이동
  setMapCenter({ lat: parseFloat(item.mapy), lng: parseFloat(item.mapx) });

  // 마커 업데이트
  setHighlightedMarker({
      lat: parseFloat(item.mapy),
      lng: parseFloat(item.mapx),
      contentid: item.subcontentid || item.contentid,
      title: item.subname || item.title,
      category: 'course',
    });
  };


const handleCourseFind = async () => {
  if (!courseDetailData?.places?.length) return;

  const positions = courseDetailData.places.map(p => ({
    lat: parseFloat(p.mapy),
    lng: parseFloat(p.mapx),
  }));

  const polylines = [];

  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i];
    const end = positions[i + 1];

    try {
      const res = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
        headers: { Authorization: 'KakaoAK ' + '9526921df04e90d8eb9dbaa64b1f3477' },
        params: {
          origin: `${start.lng},${start.lat}`,
          destination: `${end.lng},${end.lat}`,
          priority: 'RECOMMEND',
        },
      });

      const roads = res.data.routes?.[0]?.sections?.[0]?.roads || [];
      roads.forEach(road => {
        for (let j = 0; j < road.vertexes.length; j += 2) {
          const lng = road.vertexes[j];
          const lat = road.vertexes[j + 1];
          polylines.push({ lat, lng });
        }
      });
    } catch (e) {
      console.error('길찾기 API 실패:', e);
    }
  }

  console.log('최종 폴리라인:', polylines);

  setCourseDetailOpen(false)
  setHighlightedMarker([])
  // ✅ 폴리라인(길) 좌표 세팅
  setCoursePathMarkers(polylines);

  // ✅ 코스 장소 좌표만 별도 저장
  setCourseMarkers(positions);

  if (positions.length > 0) {
    setMapCenter(positions[0]);
  }
};

  const handleGoodChange = (contentid, newGood) => {
    setGoodState(prev => ({ ...prev, [contentid]: newGood }));
  };

  const myCardClick = (place) => {
    const category = getCategory(place);
    setActiveIcons({
      stay: category === 'stay',
      trip: category === 'trip',
      cafe: category === 'cafe',
      food: category === 'food',
      culture: category === 'culture',
      leisure: category === 'leisure',
      shop: category === 'shop',
      course: category === 'course',
      board: category === 'board',
    });

    if (place.places) {
      toggleIcon('course');
      setCourseDetailData(place);
      setCourseDetailOpen(true);
      setPendingSelectedCourse(place.contentid);
      return;
    }

    setDetailData(place);
    setDetailOpen(true);
    setSelectedMarkerId(place.contentid);

    const lat = Number(place.mapy);
    const lng = Number(place.mapx);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapCenter({ lat, lng: lng - 0.015 });
    }
  };


   useEffect(() => {
    if (location.state?.fromBanner) {
      bannerClick(); // ✅ 원하는 함수 실행
    }
  }, [location.state]);

const bannerClick = () =>{
    setActiveIcons({
    stay: false,
    trip: false,
    cafe: false,
    food:false,
    culture: false,
    leisure: false,
    shop: false,
    course: true,
  });
}

  /** ---------- derived ---------- */
  const hasCoords = detailData &&
    Number.isFinite(Number(detailData?.mapy)) &&
    Number.isFinite(Number(detailData?.mapx));

  const kakaoMapUrl = hasCoords
    ? `https://map.kakao.com/link/to/${encodeURIComponent(detailData.title)},${encodeURIComponent(String(detailData.mapy))},${encodeURIComponent(String(detailData.mapx))}`
    : '#';

  /** ---------- render ---------- */
  return (
    <Box sx={{ width: '100%', height: { lg: '100vh', xs: '92vh' }, position: 'relative' }}>
      {/* 왼쪽 패널 */}
      <Box
      
        sx={{
          position: 'absolute',
          bottom: { xs: 0 }, left: -8, top: 0,
          height: { lg: '101%', xs: '50%' },
          width: { lg: '25%', xs: '103%' },
          bgcolor: 'white', boxShadow: 3, borderRight: '1px solid rgba(0,0,0,0.2)',
          transform: { lg: leftOpen ? 'translateX(0)' : 'translateX(-100%)', xs: leftOpen ? 'translateY(0)' : 'translateY(-100%)' },
          transition: 'transform 0.3s ease-in-out', zIndex: 20, display: 'flex', flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)',display: 'flex', alignItems: 'flex-end', justifyContent: 'row'}}>
          <Logo />

          {isMobile && (
          <Box sx={{order:{lg:-1,xs:0},flexBasis:'100%', pb: {lg:1,xs:0}, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'end' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>지역</Typography>
            <select
              value={selectBorough}
              onChange={(e) => setSelectBorough(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}
            >
              <option value="">전체</option>
              {SEOUL_BOROUGHS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Box>
          )}
        </Box>

        {/* 카테고리 + 구 선택 */}
        <Box
          variant="scrollable"
          sx={{
            py: { lg: 2, xs: 1 }, display: 'flex', flexDirection: 'row', flexWrap: { lg: 'wrap', xs: 'nowrap' },
            gap: 1, justifyContent: { lg: 'center', xs: 'flex-start' }, alignItems: 'center', height: 'auto',
            borderBottom: '1px solid rgba(0,0,0,0.1)', whiteSpace: 'nowrap', textAlign: 'center',
            overflowX: { xs: 'auto' }, overflowY: { xs: 'hidden' },
          }}
        >

          {isDesktop && (
          <Box sx={{order:-1,flexBasis:'100%', pb: 1, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'end' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>지역</Typography>
            <select
              value={selectBorough}
              onChange={(e) => setSelectBorough(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}
            >
              <option value="">전체</option>
              {SEOUL_BOROUGHS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Box>
          )}
          {Object.entries(categoryMap).map(([key, { icon: Icon, color }]) => (
            <IconButton
              key={key}
              onClick={() => toggleIcon(key)}
              sx={{
                color: activeIcons[key] ? color : 'gray',
                flexDirection: 'column',
                flex: { lg: '1 0 33%', xs: '0 0 auto' },
                minWidth: { xs: '30%', lg: '30%' }, maxWidth: { lg: '30%', xs: '30%' }, flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 30 }} />
              <Typography>
                {key === 'stay' ? '숙박'
                  : key === 'trip' ? '관광지'
                  : key === 'cafe' ? '카페'
                  : key === 'food' ? '식당'
                  : key === 'culture' ? '문화시설'
                  : key === 'leisure' ? '레저'
                  : key === 'course' ? '추천코스'
                  : key === 'shop' ? '쇼핑'
                  : '동행'}
              </Typography>
            </IconButton>
          ))}
        </Box>

        {/* 리스트 */}
        <Box
          sx={{
            flex: 1, display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            overflowX: { xs: 'auto', md: 'hidden' }, overflowY: { xs: 'hidden', md: 'auto' },
            gap: { xs: 1 }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, p: 2
          }}
          ref={listRef}
        >
          {listData.length > 0 ? (
            listData.map((item) => {
              const isSelected = selectedMarkerId === item.contentid;
              const category = getCategory(item);
              return (
                <Card
                  id={`list-card-${item.contentid}`}
                  key={item.contentid}
                  onClick={() => handleMarkerClick(item)}
                  sx={{
                    cursor: 'pointer', boxShadow: isSelected ? 4 : 1, borderRadius: 2, mb: 2,
                    flex: { xs: '0 0 40%', lg: '1 0 auto' }, height: { lg: 'auto', xs: '97%' },
                    border: isSelected ? `2px solid ${categoryMap[category].color}` : 'none',
                    transition: 'all 0.3s', position: 'relative', '&:hover': { boxShadow: 4 },
                  }}
                >
                  {item.firstimage && (
                    <CardMedia component="img" image={item.firstimage} alt={item.title} sx={{ height: { lg: 140, xs: 100 } }} />
                  )}
                  {/* 동행글은 GoodButton 제외 */}
                  {item.contenttypeid !== 'board' && (
                    <GoodButton
                      contenttypeid={item.contenttypeid}
                      contentid={item.contentid}
                      userid={userid}
                      islist={true}
                      goodState={goodState[item.contentid]}
                      onGoodChange={handleGoodChange}
                      openLoginModal={handleOpenLoginModal}
                    />
                  )}

                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold',
                      whiteSpace: { xs: 'nowrap', md: 'normal' },
                       overflow: { xs: 'hidden', md: 'visible' },
                        textOverflow: { xs: 'ellipsis', md: 'unset' },
                        display: 'block', }}>
                      {item.title}
                    </Typography>
                    {activeIcons.course || (
                      <Typography variant="caption" sx={{ color: '#999' }}>{item.addr1}</Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'gray', mt: 4 }}>
              데이터가 없습니다.
            </Typography>
          )}
        </Box>
      </Box>

      {/* 지도 */}
      {kakaoReady ? (
        <Map center={mapCenter} style={{ width: '100%', height: '100%' }} level={8}>
          {/* 일반/동행 마커 */}
          {markerData.map((place) => {
            const isSelected = selectedMarkerId === place.contentid;
            const category = getCategory(place);
            const iconSize = isSelected ? 64 : 36;
            return (
              <CustomOverlayMap
                key={place.contentid}
                position={{ lat: place._lat, lng: place._lng }}
                yAnchor={1}
              >
                <Box
                  sx={{ color: categoryMap[category].color, fontSize: iconSize, position: 'relative', cursor: 'pointer' }}
                  onClick={() => handleMarkerClick(place)}
                  onMouseEnter={() => setHoveredMarker({ lat: place._lat, lng: place._lng, name: place.title })}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  <RoomIcon fontSize="inherit" />
                  {(hoveredMarker?.lat === place._lat && hoveredMarker?.lng === place._lng) && (
                    <Box
                      sx={{
                        position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                        bgcolor: 'white', color: '#333', px: 1, py: 0.5, borderRadius: 1,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', fontSize: 12, zIndex: 10,
                      }}
                    >
                      {hoveredMarker.name}
                    </Box>
                  )}
                </Box>
              </CustomOverlayMap>
            );
          })}

          {/* 추천 코스 단일 강조 마커 */}
          {highlightedMarker?.lat && highlightedMarker?.lng && (
            <CustomOverlayMap
              position={{ lat: parseFloat(highlightedMarker.lat), lng: parseFloat(highlightedMarker.lng) }}
              yAnchor={1}
            >
              <Box
                sx={{
                  color: categoryMap['course'].color, fontSize: 48, cursor: 'pointer',
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={() => setHoveredMarker({
                  lat: parseFloat(highlightedMarker.lat),
                  lng: parseFloat(highlightedMarker.lng),
                  name: highlightedMarker.title
                })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => handleCourseClick(highlightedMarker)}
              >
                <RoomIcon fontSize="inherit" />
                {(hoveredMarker?.lat === parseFloat(highlightedMarker.lat) &&
                  hoveredMarker?.lng === parseFloat(highlightedMarker.lng)) && (
                  <Box
                    sx={{
                      position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                      bgcolor: 'white', color: '#333', px: 1, py: 0.5, borderRadius: 1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', fontSize: 12, zIndex: 10,
                    }}
                  >
                    {hoveredMarker.name}
                  </Box>
                )}
              </Box>
            </CustomOverlayMap>
          )}

          {/* 코스 포인트 마커 */}
          {courseMarkers.map((marker, index) => (
            <CustomOverlayMap key={`course-marker-${index}`} position={{ lat: marker.lat, lng: marker.lng }} yAnchor={1}>
              <Box
                sx={{ color: categoryMap['course'].color, fontSize: 36, position: 'relative', cursor: 'default' }}
                onMouseEnter={() => setHoveredMarker({ lat: marker.lat, lng: marker.lng, name: courseDetailData.places[index].subname })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => handleCourseClick(courseDetailData.places[index])}
              >
                <RoomIcon fontSize="inherit" />
                {(hoveredMarker?.lat === marker.lat && hoveredMarker?.lng === marker.lng) && (
                  <Box
                    sx={{
                      position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                      bgcolor: 'white', color: '#333', px: 1, py: 0.5, borderRadius: 1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', fontSize: 12, zIndex: 10,
                    }}
                  >
                    {index + 1}코스 : {hoveredMarker.name}
                  </Box>
                )}
              </Box>
            </CustomOverlayMap>
          ))}

          {/* 코스 경로 */}
          {coursePathMarkers.length > 1 && (
            <Polyline
              path={coursePathMarkers}
              strokeWeight={5}
              strokeColor={categoryMap['course'].color}
              strokeOpacity={0.7}
              strokeStyle="solid"
            />
          )}
        </Map>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 12 }}>지도 로딩 중...</Typography>
      )}

      {/* 상세 패널 */}
      {detailData && (
        <Box
          sx={{
            position: 'absolute', top: { lg: 0, xs: '22%' }, left: { lg: '24.4%', xs: 0 }, bottom: 0,
            width: { lg: '25%', xs: '87%' }, height: { lg: '95%', xs: '62%' }, bgcolor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2, borderLeft: '1px solid rgba(0,0,0,0.1)',
            transform: !isFirstRender && detailOpen && leftOpen ? 'translateX(0)' : 'translateX(-200%)',
            transition: 'transform 0.4s ease-in-out', zIndex: { lg: 15, xs: 32 }, p: 3,
            overflowY: 'auto', flexDirection: 'column', gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#333', textAlign: 'center' }}>
            {detailData.title}
          </Typography>

          <Box display="flex" justifyContent="end" alignItems="center" sx={{ mb: 3 }} gap={1}>
            {detailData.contenttypeid !== 'board' && (
              <GoodButton
                contenttypeid={detailData.contenttypeid}
                contentid={detailData.contentid}
                userid={userid}
                goodState={goodState[detailData.contentid]}
                onGoodChange={handleGoodChange}
                openLoginModal={handleOpenLoginModal}
              />
            )}
            <BookmarkButton contenttypeid={detailData.contenttypeid} contentid={detailData.contentid} userid={userid} openLoginModal={handleOpenLoginModal} />
          </Box>

          {detailData.firstimage && (
            <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', mb: 2, mt: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              <img src={detailData.firstimage} alt={detailData.title} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
            </Box>
          )}

          <Box sx={{ pb: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555', lineHeight: 1.6 }}>
              {detailData.overview || '설명 정보가 없습니다.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
            {detailData.tel && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
                <Typography variant="body2" sx={{ flexShrink: 0 }}>📞전화번호 : </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555' }}>{detailData.tel}</Typography>
              </Box>
            )}
            {detailData.addr1 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
                <Typography variant="body2" sx={{ flexShrink: 0 }}>🏠주소 : </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555' }}>
                  {detailData.addr1} {detailData.addr2 || ''}
                </Typography>
              </Box>
            )}
            {detailData.homepage && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
                <Typography variant="body2" sx={{ flexShrink: 0 }}>🌐홈페이지 : </Typography>
                <Link
                  href={detailData.homepage.replace(/<[^>]+>/g, '').trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ whiteSpace: 'pre-line', color: '#20B2AA', textDecoration: 'none', wordBreak: 'break-all',
                    '&:hover': { textDecoration: 'underline', color: '#1ca092' } }}
                >
                  {detailData.homepage.replace(/<[^>]+>/g, '').trim()}
                </Link>
              </Box>
            )}
            {hasCoords && (
              <Button
                variant="contained"
                href={kakaoMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  backgroundColor: '#20B2AA', color: 'white', fontWeight: 'bold', mt: 2, mb: 3,
                  '&:hover': { backgroundColor: '#1ca092' }, boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                  borderRadius: 2, textTransform: 'none', px: 3, py: 1.2,
                }}
                startIcon={<OpenInNewIcon />}
              >
                길찾기
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* 추천코스 상세 패널 */}
      {courseDetailData && (
        <Box
          key={courseDetailData.contentid}
          sx={{
            position: 'absolute', top: { lg: 0, xs: '22%' }, bottom: 0, left: { lg: '24.4%', xs: 0 },
            width: { lg: '25%', xs: '87%' }, height: { lg: '95%', xs: '62%' }, bgcolor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2, borderLeft: '1px solid rgba(0,0,0,0.1)',
            transform: !isCourseFirstRender && courseDetailOpen && leftOpen ? 'translateX(0)' : 'translateX(-200%)',
            transition: 'transform 0.4s ease-in-out', zIndex: { lg: 15, xs: 32 }, p: 3, overflowY: 'auto',
          }}
        >
          <Box sx={{ pb: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333', textAlign: 'center' }}>
              {courseDetailData.title}
            </Typography>
            <Box display="flex" justifyContent="end" alignItems="center" sx={{ mb: 3 }} gap={1}>
              <GoodButton
                contenttypeid={courseDetailData.contenttypeid}
                contentid={courseDetailData.contentid}
                userid={userid}
                goodState={goodState[courseDetailData.contentid]}
                onGoodChange={handleGoodChange}
                openLoginModal={handleOpenLoginModal}
              />
              <BookmarkButton contenttypeid={courseDetailData.contenttypeid} contentid={courseDetailData.contentid} userid={userid} openLoginModal={handleOpenLoginModal} />
            </Box>
            {courseDetailData.firstimage && (
              <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', mb: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                <img src={courseDetailData.firstimage} alt={courseDetailData.title} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
              </Box>
            )}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555', lineHeight: 1.6 }}>
              {courseDetailData.overview ? courseDetailData.overview.replace(/<br\s*\/?>/gi, '') : '설명 정보가 없습니다.'}
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#333', textAlign: 'center', py: 3 }}>
            코스 구성
          </Typography>

          {(courseDetailData.places && courseDetailData.places.length > 0) ? (
            courseDetailData.places.map((item, index) => (
              <Card
                id={`list-card-${item.subcontentid}`}
                key={item.subcontentid}
                onClick={() => handleCourseClick(item)}
                sx={{
                  cursor: 'pointer', borderRadius: 2, mb: 2, overflow: 'hidden', transition: 'all 0.3s',
                  border: (selectedCourseId === item.subcontentid) ? `2px solid ${categoryMap['course'].color}` : 'none',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                {item.firstimage && <CardMedia component="img" height="140" image={item.firstimage} alt={item.subname} />}
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {index + 1}코스 : {item.subname}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555', lineHeight: 1.6 }}>
                    {item.subdetailoverview || '설명 정보가 없습니다.'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
                    {item.tel && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
                        <Typography variant="body2" sx={{ flexShrink: 0 }}>📞전화번호 : </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555' }}>{item.tel}</Typography>
                      </Box>
                    )}
                    {item.addr1 && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
                        <Typography variant="body2" sx={{ flexShrink: 0 }}>🏠주소 : </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555' }}>
                          {item.addr1} {item.addr2 || ''}
                        </Typography>
                      </Box>
                    )}
                    {item.homepage && (() => {
  // 1️⃣ HTML 태그 제거
  let homepageText = item.homepage.replace(/<[^>]+>/g, '').trim();

  // 2️⃣ 한글 + 줄바꿈 제거
  homepageText = homepageText
    .replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/g, '') // 한글 제거
    .replace(/\n|\r/g, ' ')              // 줄바꿈 제거
    .replace(/\s+/g, ' ');               // 연속 공백 정리

  // 3️⃣ http 또는 https로 시작하는 첫 번째 URL만 추출
  const urlMatch = homepageText.match(/https?:\/\/[^\s]+/i);
  const homepageUrl = urlMatch ? urlMatch[0] : '';

  // 4️⃣ 주소가 있으면 출력
  return homepageUrl ? (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'row' }}>
      <Typography variant="body2" sx={{ flexShrink: 0 }}>🌐홈페이지 : </Typography>
      <Link
        href={homepageUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          whiteSpace: 'pre-line',
          color: '#20B2AA',
          textDecoration: 'none',
          wordBreak: 'break-all',
          '&:hover': { textDecoration: 'underline', color: '#1ca092' },
        }}
      >
        {homepageUrl}
      </Link>
    </Box>
  ) : null;
})()}
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'gray', mt: 4 }}>데이터가 없습니다.</Typography>
          )}

          <Button
            variant="contained"
            onClick={handleCourseFind}
            sx={{
              width: '100%', backgroundColor: '#20B2AA', color: 'white', fontWeight: 'bold', mt: 2, mb: 3,
              '&:hover': { backgroundColor: '#1ca092' }, boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
              borderRadius: 2, textTransform: 'none', px: 3, py: 1.2,
            }}
            startIcon={<OpenInNewIcon />}
          >
            코스찾기
          </Button>
        </Box>
      )}

      {/* 패널 토글 */}
      <BookmarkIcon
        onClick={() => setLeftOpen(v => !v)}
        sx={{
          position: 'absolute', scale: 2.5,
          left: { lg: leftOpen ? '24%' : '0.8%', xs: '90%' },
          top: { lg: 13, xs: leftOpen ? '50%' : '1%' },
          zIndex: 30, transition: 'left 0.3s ease-in-out, top 0.3s ease-in-out',
          color: '#20B2AA', filter: 'drop-shadow(-4px 4px 2px rgba(0,0,0,0.4))',
          rotate: { lg: '-90deg', xs: '0deg' },
        }}
      />
      <ArrowForwardIcon
        onClick={() => setLeftOpen(v => !v)}
        sx={{
          transition: 'transform 0.5s',
          transform: { lg: leftOpen ? 'rotate(-180deg)' : 'rotate(0deg)', xs: leftOpen ? 'rotate(-90deg)' : 'rotate(90deg)' },
          position: 'absolute', top: { lg: 13, xs: leftOpen ? '50%' : '0.8%' },
          zIndex: 31, left: { lg: leftOpen ? '23.5%' : '0.5%', xs: '90%' }, color: 'white'
        }}
      />

      {/* 디테일 패널 토글 */}
      <BookmarkIcon
        onClick={() => {
          if (activeIcons.course) { setCourseDetailOpen(false); setIsCourseFirstRender(true); }
          else { setDetailOpen(false); }
        }}
        sx={{
          position: 'absolute', scale: 2.5,
          top: { lg: 13, xs: '26%' },
          left: {
            lg: (leftOpen && (detailOpen || courseDetailOpen) ? '52.5%' : '-10%') || '-10%',
            xs: (leftOpen && (detailOpen || courseDetailOpen) ? '91%' : '-10%') || '-10%'
          },
          zIndex: { lg: 16, xs: 34 }, transition: 'left 0.3s ease-in-out',
          color: '#20B2AA', rotate: { lg: '-90deg', xs: '90deg' },
          filter: 'drop-shadow(-4px 4px 2px rgba(0,0,0,0.4))',
        }}
      />
      <ArrowForwardIcon
        onClick={() => {
          if (activeIcons.course) { setCourseDetailOpen(false); setIsCourseFirstRender(true); }
          else { setDetailOpen(false); }
        }}
        sx={{
          transition: { lg: 'transform 0.3s ease-in-out', xs: 'left 0.5s ease-in-out' },
          position: 'absolute', top: { lg: 13, xs: '26%' }, zIndex: { lg: 17, xs: 35 },
          left: {
            lg: (leftOpen && (detailOpen || courseDetailOpen) ? '52%' : '-10%') || '-10%',
            xs: (leftOpen && (detailOpen || courseDetailOpen) ? '91%' : '-10%') || '-10%'
          },
          rotate: '-180deg', color: 'white'
        }}
      />

      <LoginAlertModal
        open={rfModalOpen}
        onClose={() => setRfModalOpen(false)}
        sx={{ justifyContent: 'center' }}
      />

      {/* Right Footer */}
      <Box
        sx={{
          position: {lg:'absolute',xs:'fixed'}, bottom: 0, right: 0,
          width: { lg: !leftOpen ? '100%' : (detailOpen || courseDetailOpen) ? '48%' : '77%', xs: '100%' },
           overflow: 'hidden', zIndex: 5, transition: 'width 0.3s ease-in-out',
        }}
      >
        <RightFutter onMenu={onMenu} menu={menu} setRfModalOpen={setRfModalOpen}
              setRfModalType={setRfModalType}/>
      </Box>

      {/* 로딩 모달 */}
      <Modal open={isLoadingMapData || isLoadingCourseData}>
        <Box
          sx={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', color: 'white', zIndex: 9999,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            지도 데이터 로딩중...
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default SeoulMap;
