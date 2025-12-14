// src/components/main/Main.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Grid, Box, useTheme, useMediaQuery } from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SlickCarousel from './Carouser';
import NovatripLogo from './Logo';
import LeftFutter from './LeftFutter';
import RightFutter from './RightFutter';
import LoginModal from '../login/LoginModal';
import Event from '../info/Event';
import EventDetail from '../info/EventDetail';
import axios from 'axios';
import SeoulMap from './SeoulMap';
import MenuIcon from '@mui/icons-material/Menu';
import Board from '../community/Board';
import AddMate from '../community/AddMate';
import { BoardContext } from '../community/BoardContext';
import AddBoard from '../community/AddBoard';
import MyInfo from '../login/MyInfo';
import MateCondition from '../community/genericAddBoard/MateCondition';
import SpotStep from '../community/genericAddBoard/SpotStep';
import { jwtDecode } from 'jwt-decode';
import Community from '../community/Community';
import LoginAlertModal from '../login/LoginAlertModal';
import Banner from './Banner';

const Main = ({ setToken }) => {
  const rightRef = useRef(null);
  const contentScrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { boards, modalOpen, modalCat, subModalOpen, subModalCat, setModalOpen, setIsEdit } = useContext(BoardContext);

  const query = new URLSearchParams(location.search);
  // const [menu, setMenu] = useState(query.get('menu') || 'community');

  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [tripData, setTripData] = useState([]);
  const [foodData, setFoodData] = useState([]);
  const [cafeData, setCafeData] = useState([]);
  const [cultureData, setCultureData] = useState([]);
  const [leisureData, setLeisureData] = useState([]);
  const [shopData, setShopData] = useState([]);
  const [stayData, setStayData] = useState([]);

  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isLoadingMapData, setIsLoadingMapData] = useState(false);

  const [rfModalOpen, setRfModalOpen] = useState(false);
  const [rfModalType, setRfModalType] = useState('');

  const rightFutterRef = useRef(null);

  const openLoginModal = () => {
    setRfModalType('loginAlert');
    setRfModalOpen(true);
  };


  // 캐러셀 클릭 → 상세로 (contentId 파라미터 전달 + 최소 필드 정규화)
  const handleCarouselSelect = (item) => {
    if (!item?.contentId) return;
    setSelectedEvent({
      ...item,
      contentid: item.contentId,
      firstimage: item.image || item.firstimage,
    });
    navigate(`/event/detail/${item.contentId}`, { state: { selectedEvent: item } });
    rightFutterRef.current?.setFooterValue('event');
  };

// 이벤트 목록 카드 클릭 핸들러
const onEventClick = (it) => {
  if (!it?.contentid) return;
  setSelectedEvent(it);
  navigate(`/event/detail/${it.contentid}`, { state: { selectedEvent: it } });
};

  // 토큰에서 userid 추출
  const token = localStorage.getItem('token');
  let userid = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userid = decoded.userId;
    } catch (err) {
      console.error('Token decoding failed', err);
    }
  }

  // 메뉴 이동
  const onMenu = (menu) => {
    setSelectedEvent(null);
    navigate(`/${menu}`);
  };

  // 데이터 로드
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await axios.get('/api/tour/event', { params: { numOfRows: 50 } });
        setEventData(res.data);
        setIsLoadingEvent(true);
      } catch (err) {
        console.error('❌ Event 데이터 로딩 실패:', err);
      }
    };
    fetchEventData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchMapData = async () => {
      setIsLoadingMapData(true);
      try {
        const [stayRes, tripRes, foodRes, cafeRes, cultureRes, leisureRes, shopRes] = await Promise.all([
          axios.get('/api/tour/stay', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/trip', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/food', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/cafe', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/culture', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/leisure', { params: { numOfRows: 100 } }),
          axios.get('/api/tour/shop', { params: { numOfRows: 100 } }),
        ]);

        const cafeIds = new Set(cafeRes.data.map((item) => item.contentid));
        const filteredFoodData = foodRes.data.filter((item) => !cafeIds.has(item.contentid));

        if (isMounted) {
          setStayData(stayRes.data);
          setTripData(tripRes.data);
          setFoodData(filteredFoodData);
          setCafeData(cafeRes.data);
          setCultureData(cultureRes.data);
          setLeisureData(leisureRes.data);
          setShopData(shopRes.data);
          setIsLoadingMapData(false);
        }
      } catch (err) {
        console.error('❌ Map 데이터 로딩 실패:', err);
      }
    };
    fetchMapData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = rfModalOpen ? 'hidden' : '';
  }, [rfModalOpen]);

  const theme = useTheme();
  // const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const FOOTER_H = 72;

  if (location.pathname === '/map') {
    return (
      <SeoulMap
        onMenu={onMenu}
        stayData={stayData}
        isLoadingMapData={isLoadingMapData}
        tripData={tripData}
        foodData={foodData}
        cafeData={cafeData}
        cultureData={cultureData}
        leisureData={leisureData}
        shopData={shopData}
        userid={userid}
      />
    );
  }

  return (
    <Grid container sx={{ minHeight: { lg: '100vh' }, bgcolor: '#f1f1f3', justifyContent: 'center', zIndex: 1 }} wrap="nowrap">
      {/* 왼쪽 패널 */}
      <Grid
        item
        width={'40%'}
        sx={{
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          position: { lg: 'sticky' },
          alignSelf: 'flex-start',
          height: { lg: '100vh' },
          zIndex: 110,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 520,
            px: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <NovatripLogo size={56} />
          <Box sx={{ borderRadius: 5, overflow: 'hidden', mb: 6 }}>
            <SlickCarousel onSelect={handleCarouselSelect} />
          </Box>
          <LeftFutter />
        </Box>
      </Grid>

      {/* 오른쪽 콘텐츠 영역 */}
      <Grid
        item
        xs={12}
        width={{ lg: '60%' }}
        id="right-panel"
        ref={rightRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100vh',
          overflowY: 'hidden',
          overflowX: 'hidden',
          bgcolor: '#ffffff',
          mr: { lg: 5, xs: 0 },
          maxWidth: 660,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 660,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            minHeight: '100vh',
            position: 'relative',
          }}
        >
          {/* 상단 메뉴 아이콘 */}
          
          <MenuIcon
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 24, lg: 15 },
              right: { xs: 20, md: 40, lg: 10 },
              cursor: 'pointer',
              zIndex: 1100,
              fontSize: { xs: 28, md: 32, lg: 36 },
            }}
            onClick={() => setLoginMenuOpen(true)}
          />
          <Banner />
          <LoginModal
            setToken={setToken}
            open={loginMenuOpen}
            onClose={() => setLoginMenuOpen(false)}
            onKakaoLogin={() => alert('카카오 로그인')}
          />

          <Box
            sx={{
              pt: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              position: 'relative',
            }}
          >
            <Box
              ref={contentScrollRef}
              id="route-scroll"
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              }}
            >
              <Routes>
                <Route path="/community" element={<Board rightRef={rightRef} scrollRef={contentScrollRef} />} />
                <Route path="/community/:numBrd" element={<Community />} rightRef={rightRef} />
                
                <Route
                  path="/event"
                  element={
                    <Event
                      eventData={eventData}
                      searchText={searchText}
                      setSearchText={setSearchText}
                      onEventClick={onEventClick}
                      isLoadingEvent={isLoadingEvent}
                      userid={userid}
                      openLoginModal={openLoginModal}
                    />
                  }
                />
                <Route
                  path="/event/detail/:contentId"
                  element={
                    <EventDetail
                      event={selectedEvent}
                      onEventBack={() => navigate('/event')}
                      userid={userid}
                      openLoginModal={openLoginModal}
                    />
                  }
                />
                <Route
                  path="/myInfo"
                  element={
                    <MyInfo
                      stayData={stayData}
                      tripData={tripData}
                      foodData={foodData}
                      cafeData={cafeData}
                      cultureData={cultureData}
                      leisureData={leisureData}
                      shopData={shopData}
                      eventData={eventData}
                    />
                  }
                />
                <Route path="*" element={<Board rightRef={rightRef} />} />
              </Routes>
            </Box>
          </Box>
          
          {/* 모달 */}
          {modalOpen && modalCat === 'mate' && (
            <AddMate open={modalOpen} onClose={() => {setModalOpen(false); setIsEdit(false)}} container={rightRef.current} boards={boards} />
          )}
          {modalOpen && modalCat !== 'mate' && (
            <AddBoard open={modalOpen} onClose={() => {setModalOpen(false);setIsEdit(false)}} container={rightRef.current} boards={boards} />
          )}
          
          {subModalOpen && subModalCat==='condition' && <MateCondition container={rightRef.current}/>} 

          {subModalOpen && subModalCat==='spot' &&
            <SpotStep 
              modalCat={modalCat}
              stayData={stayData}
              isLoadingMapData={isLoadingMapData}
              tripData={tripData}
              foodData={foodData}
              cafeData={cafeData}
              cultureData={cultureData}
              leisureData={leisureData}
              shopData={shopData}
              eventData={eventData}/>
          }
          
          <LoginAlertModal
            open={rfModalOpen}
            onClose={() => setRfModalOpen(false)}
            container={rightRef}
            sx={{ justifyContent: 'center' }}
          />
          {/* Footer */}
          <Box
            sx={{
              position: 'sticky',
              bottom: {lg:-15},
              right: 0,
              left: 0,
              mt: 'auto',
              width: '100%',
              maxWidth: { xs: '100%', lg: 660 },
              mx: 'auto',
              flexShrink: 0,
              zIndex: 1200,
            }}
          >
            <RightFutter
              onMenu={onMenu}
              menu={location.pathname.replace('/', '')}
              anchorElRef={rightRef}
              setRfModalOpen={setRfModalOpen}
              setRfModalType={setRfModalType}
              ref={rightFutterRef}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Main;
