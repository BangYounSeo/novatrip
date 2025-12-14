// src/components/login/MyInfoData.js
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box, Tab, Typography, Button, Divider, Paper, Stack, IconButton
} from '@mui/material';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarTwoToneIcon from '@mui/icons-material/StarTwoTone';

import axios from 'axios';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import ScrollableCardList from './ScrollableCardList';
import { useNavigate, useLocation } from "react-router-dom";

// ✅ 모달(슬라이드업) 폼 컴포넌트
import ChangeInfo from '../login/ChangeInfo';
import ChangePwd from '../login/ChangePwd';
import DeleteInfo from './DeleteInfo';
import { BoardContext } from '../community/BoardContext';
import { scale } from 'framer-motion';

const MyInfoData = ({
  userId, stayData, tripData, cafeData, foodData, cultureData,
  leisureData, shopData, eventData
}) => {
  const [myGood, setMyGood] = useState([]);
  const [myBookmark, setMyBookMark] = useState([]);
  const [myBoards, setMyBoards] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [mainTab, setMainTab] = useState("myInfo");
  const [goodedBoards, setGoodedBoards] = useState([]);
  const {boardList} = useContext(BoardContext);

  // ✅ 모달 오픈 키 (changeInfo | changePwd | deleteAccount)
  const [modalKey, setModalKey] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 데이터 로드
  useEffect(() => {
    axios.get(`/api/myInfoData/bookmark/${userId}`)
      .then(res => setMyBookMark(res.data.myBookmark))
      .catch(err => console.log(err));

    axios.get(`/api/myInfoData/good/${userId}`)
      .then(res => setMyGood(res.data.myGood))
      .catch(err => console.log(err));

    axios.get(`/api/myInfoData/boards/${userId}`)
      .then(res => setMyBoards(res.data.myBoards))
      .catch(err => console.log(err));

    axios.get('/api/course/course', { params: { numOfRows: 50 } })
      .then(res => setCourseData(res.data))
      .catch(err => console.log(err));

    (async() => {
      try{
        const res = await axios.get('/api/board/goodForUser',{ params: {userId}})
        setGoodedBoards(res.data.likedBoards)
      }catch(e){
        console.error('좋아요 게시물 불러오기 실패',e)
      }
    })();

  }, [userId]);

  // 좋아요/즐겨찾기/코스 매칭
  const getMatchedData = (myList) => {
    if (!myList) return [];
    const allData = [
      ...(stayData || []), ...(tripData || []), ...(cafeData || []), ...(foodData || []),
      ...(cultureData || []), ...(leisureData || []), ...(shopData || []),
    ];
    return allData.filter(dataItem =>
      myList.some(myItem =>
        String(myItem.contentid) === String(dataItem.contentid) &&
        String(myItem.contenttypeid) === String(dataItem.contenttypeid)
      )
    );
  };
  const getMatchedEventData = (myList) => {
    if (!myList) return [];
    const allData = [ ...(eventData || []) ];
    return allData.filter(dataItem =>
      myList.some(myItem =>
        String(myItem.contentid) === String(dataItem.contentid) &&
        String(myItem.contenttypeid) === String(dataItem.contenttypeid)
      )
    );
  };
  const getMatchedCourseData = (myList) => {
    if (!myList) return [];
    const allData = [ ...(courseData || []) ];
    return allData.filter(dataItem =>
      myList.some(myItem =>
        String(myItem.contentid) === String(dataItem.contentid) &&
        String(myItem.contenttypeid) === String(dataItem.contenttypeid)
      )
    );
  };

  const likedSet = useMemo(() => new Set((goodedBoards || []).map(n => Number(n))),[goodedBoards]);

  const goodTripData = useMemo(() => getMatchedData(myGood), [myGood, stayData, tripData, cafeData, foodData, cultureData, leisureData, shopData, courseData]);
  const bookmarkTripData = useMemo(() => getMatchedData(myBookmark), [myBookmark, stayData, tripData, cafeData, foodData, cultureData, leisureData, shopData, courseData]);
  const goodEventData = useMemo(() => getMatchedEventData(myGood), [myGood, eventData]);
  const bookmarkEventData = useMemo(() => getMatchedEventData(myBookmark), [myBookmark, eventData]);
  const goodCourseData = useMemo(() => getMatchedCourseData(myGood), [myGood, courseData]);
  const bookmarkCourseData = useMemo(() => getMatchedCourseData(myBookmark), [myBookmark, courseData]);

  // 카드 클릭 네비게이션
  const onCardClick = (place) => navigate("/map", { state: { selectedPlace: place } });
  const onEventClick = (event) => navigate("/event/detail", { state: { selectedEvent: event } });
  const onMyBoardClick = (numBrd) => navigate(`/community/${numBrd}`);

  // 섹션 렌더
  const renderCategorySection = (label, filteredData) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{label}</Typography>
      <ScrollableCardList data={filteredData} onCardClick={onCardClick} onEventClick={onEventClick} />
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  const boardSection = (data) =>  (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {data.map((item) => (
          <Box
            key={item._id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                borderColor: '#20B2AA',
                backgroundColor: 'rgba(25, 118, 210, 0.03)',
                cursor: 'pointer',
              },
            }}
            onClick={() => onMyBoardClick(item.numBrd)}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {item.subject}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.content}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Typography variant="body2">👍 {item.good || 0}</Typography>
                <Typography variant="body2">조회수 {item.hitCount || 0}</Typography>
              </Box>
              <Typography variant="body2">
                {new Date(item.created).toLocaleString('ko-KR', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                })}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    )
  

  // ✅ 액션 카드(순서 고정: 프로필편집 → 비번변경 → 회원탈퇴)
  const ACTIONS = [
    { id: 'changeInfo',    title: '프로필 변경',   desc: '닉네임, 이메일, 나이, 성별, 이름을 수정합니다.', icon: <ManageAccountsIcon /> },
    { id: 'changePwd',     title: '비밀번호 변경', desc: '현재 비밀번호 확인 후 새 비밀번호로 변경합니다.',   icon: <LockResetIcon /> },
    { id: 'deleteAccount', title: '회원 탈퇴',     desc: '계정과 데이터를 영구 삭제합니다. (취소 불가)',     icon: <DeleteForeverIcon /> },
  ];

  // ✅ URL ?tab=edit|password|delete → 해당 모달 자동 오픈
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get('tab'); // 'edit' | 'password' | 'delete'
    const map = { edit: 'changeInfo', password: 'changePwd', delete: 'deleteAccount' };
    const target = map[urlTab];
    if (target) {
      setMainTab('myInfo');
      setModalKey(target);
    }
  }, [location.search]);

  // 액션 카드
const ActionCard = ({ action }) => (
  <Paper
    elevation={0}
    variant="outlined"
    onClick={() => setModalKey(action.id)} 
    sx={{
      cursor: 'pointer',
      p: 1.5,
      borderRadius: 2,
      height: '100%',
      borderColor: modalKey === action.id ? '#20B2AA' : 'divider',
      transition: 'all .2s ease',
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)',
        borderColor: '#20B2AA',
      },
    }}
  >
    <Stack spacing={1.2}>
      <Box sx={{
        width: 40, height: 40, borderRadius: 2, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: 'rgba(32,178,170,0.08)'
      }}>
        {action.icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {action.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {action.desc}
      </Typography>
    </Stack>
  </Paper>
);

  // 액션 캐러셀
  const ScrollableActions = ({ actions }) => {
    const scrollRef = React.useRef(null);
    const [canLeft, setCanLeft] = React.useState(false);
    const [canRight, setCanRight] = React.useState(true);

    const updateButtons = () => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft < maxScroll - 1);
    };

    const scroll = (dir) => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const amount = Math.round(el.clientWidth * 0.9);
      el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
      setTimeout(updateButtons, 350);
    };

    React.useEffect(() => {
      updateButtons();
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => updateButtons();
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
      <Box sx={{ position: 'relative', mt: 2 }}>

        <Box
          ref={scrollRef}
          sx={{
            display:'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flexDirection: 'row',
            gap: 2,
            px: 1,
          }}
        >
          {actions.map((action) => (
            <Box key={action.id} sx={{overflow:'hidden',borderRadius: 2, height: '100%', pt:1}}>
              <ActionCard action={action} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", mt: 4, minHeight:250}}>
      <TabContext value={mainTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            TabIndicatorProps={{ style: { backgroundColor: '#20B2AA' } }}
            onChange={(e, v) => setMainTab(v)}
            centered
          >
            <Tab label="내 정보" value="myInfo" sx={{'&.Mui-selected': {color: '#20B2AA'}}}/>
            <Tab label="좋아요" value="good" sx={{'&.Mui-selected': {color: '#20B2AA'}}} />
            <Tab label="즐겨찾기" value="bookmark" sx={{'&.Mui-selected': {color: '#20B2AA'}}}/>
            <Tab label="내 게시글" value="myBoard" sx={{'&.Mui-selected': {color: '#20B2AA'}}}/>
          </TabList>
        </Box>

        {/* ✅ 내 정보 탭 */}
        <TabPanel value="myInfo" sx={{ overflow: "hidden", p: { xs: 1, md: 0, } }}>
          <ScrollableActions actions={ACTIONS} />
        </TabPanel>

        {/* ✅ 좋아요 탭 */}
        <TabPanel value="good" sx={{ overflow: "visible", p: 0 }}>
          {renderCategorySection((<><FavoriteTwoToneIcon/>여행지</>), goodTripData)}
          {renderCategorySection((<><FavoriteTwoToneIcon/>이벤트</>), goodEventData)}
          {renderCategorySection((<><FavoriteTwoToneIcon/>추천코스</>), goodCourseData)}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              <FavoriteTwoToneIcon/>게시글
            </Typography>
            {goodedBoards.length===0 ? (
              <Typography sx={{ mt: 2, textAlign: 'start', color: 'text.secondary' }}>
                좋아요한 게시글이 없습니다.
              </Typography>
            ):<>{boardSection(goodedBoards)}</>
            }
            <Divider sx={{ mt: 2 }} />
          </Box>
          
        </TabPanel>

        {/* ✅ 즐겨찾기 탭 */}
        <TabPanel value="bookmark" sx={{ overflow: "visible", p: 0 }}>
          {renderCategorySection((<><StarTwoToneIcon/>여행지</>), bookmarkTripData)}
          {renderCategorySection((<><StarTwoToneIcon/>이벤트</>), bookmarkEventData)}
          {renderCategorySection((<><StarTwoToneIcon/>추천코스</>), bookmarkCourseData)}
        </TabPanel>

        {/* ✅ 내 게시글 */}
        <TabPanel value="myBoard" sx={{ overflow: "visible", p: 0 }}>
          {myBoards.length===0 ? (
            <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                작성한 게시글이 없습니다.
              </Typography>
            ) : <>{boardSection(myBoards)}</>
          }
        </TabPanel>
      </TabContext>

      {/* ✅ LoginAlertModal 스타일 슬라이드업 모달 3종 */}
      <ChangeInfo
        open={modalKey === 'changeInfo'}
        onClose={() => setModalKey(null)}
      />
      <ChangePwd
        open={modalKey === 'changePwd'}
        onClose={() => setModalKey(null)}
      />
      <DeleteInfo
        open={modalKey === 'deleteAccount'}
        onClose={() => setModalKey(null)}
      />
    </Box>
  );
};

export default MyInfoData;
