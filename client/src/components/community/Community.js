import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Box, Button, Container, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import FlatwareOutlinedIcon from '@mui/icons-material/FlatwareOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewWrite from './ReviewWrite';
import ReviewList from './ReviewList';
import { format } from 'date-fns';
import { getImages, getOneBoard } from '../../service/boardService';
import CommunityHeader from './CommunityHeader';
import Slider from "react-slick";
import axios from 'axios'; //로그인 세션 가져오기용
import { Map, MapMarker } from "react-kakao-maps-sdk" // 지도

const Community = ({rightRef}) => {
 
  const { numBrd } = useParams()
  const [board,setBoard] = useState(null)
  const token = localStorage.getItem('token');
  const [image,setImage] = useState({ images: [] })
  const [reviewCount, setReviewCount] = useState(0)
  const [loginId, setLoginId] = useState('')
  const [writerInfo, setWriterInfo] = useState(null) // 동행장 가져오기
  const boardRef = useRef(null); // 게시글 컨테이너 ref
  
  useEffect(() => {
    (async () => {
      try {
        await axios.put(`/api/board/hit/${numBrd}`)
        
        const [b, img] = await Promise.all([
          getOneBoard(numBrd),
          getImages(numBrd)
        ]);

        setBoard(b || {});              // null 방지
        setImage(img || { images: [] }); // null 방지
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
        setBoard({});
        setImage({ images: [] });
      }
    })();
  }, [numBrd]);


  // useEffect(() => {
  //   console.log('state update',board,image)
  // },[board,image])

  // 로그인 사용자 세션 불러오기
  useEffect(()=> {
    const fetchLogin = async ()=> {
      try{
        const token = localStorage.getItem('token')
        if(!token) return
        const res = await axios.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setLoginId(res.data.userId)
        console.log('현재 로그인 id:', res.data.userId)
      }catch (err) {
        console.log('로그인 세션 불러오기 실패', err)
      }
    }
    fetchLogin()
  },[])

  // 작성자 정보 불러오기 (닉네임, 나이대, 성별)
  useEffect(() => {
    if (board && board.userId) {
      axios.get(`/api/member/by-id/${board.userId}`)
        .then(res => setWriterInfo(res.data))
        .catch(err => console.error('작성자 정보 불러오기 실패:', err));
    }
  }, [board]);

  const fmt = (date) => (date ? format (new Date(date),"yyyy년 MM월 dd일") : "")

  if (!board) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h6" align="center">
          게시글을 불러오는 중입니다...
        </Typography>
      </Container>
    )
  }

  // Community.js (상세) - 공지일 때 여행 UI/댓글 숨김
  if (board.boardType === 'notice') {
    return (
      <>
        <CommunityHeader
          title="공지사항"
          postId={board.numBrd}
          loginId={String(loginId || '')}
          writerId={String(board.userId || '')}
          containerRef={rightRef}
        />
      
        <Container maxWidth="md">
          <Box sx={{ p:2, backgroundColor:'#fafafa'}}>
          {image?.images?.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
              <img src={`http://192.168.0.34:8080/${image.images[0].saveFileName}`} alt="공지 사진" style={{borderRadius: 5, width:'100%', height:'auto', maxHeight:'400px', objectFit:'cover' }}/>
            </Box>
          )}          
            <Typography variant="h4" sx={{ fontWeight:'bold', mb:2 }}>{board.subject}</Typography>
            <Typography variant="body1"
             sx={{
              mb:1,
              whiteSpace: 'pre-line'
            }}><strong>공지사항: </strong>{board.content}</Typography>

            <Typography variant="body2">조회수: {board.hitCount}</Typography>
            <Typography variant="body2">{new Date(board.created).toLocaleDateString('ko-KR')} 작성</Typography>          
            {/* 여행 일정/장소/댓글 UI 렌더링 생략 */}
          </Box>
        </Container>
      </>
    );
  }

  return (

    <>
      {/* 사진 버튼 스타일 */}
      <style>
        {`
          .slick-dots {
            position: absolute;
            bottom: 20px;         
            width: 100%;
          }
          .slick-dots li button:before {
            color: #fff !important; 
            font-size: 5px;
            opacity: 0.8;
          }

           .slick-dots li.slick-active button:before {
              color: #20b2aa !important;
              opacity: 1;
            }
        `}
      </style>

      <CommunityHeader
        title={board.boardType === 'mate' ? '동행' : '포스트'}
        postId={board.numBrd}
        loginId={String(loginId || '')}
        writerId={String(board.userId || '')}
        containerRef={rightRef}
        boardType={board.boardType}
      />

      <Box ref={boardRef} sx={{ position: 'relative',width: '100%',
        maxWidth: 880, mx: 'auto', py: 2, pb: { xs: 15, sm: 15 }
        ,px: { xs: 2, sm: 2 }, overflowX: 'hidden', boxSizing: 'border-box'}}>

        <Box sx={{ backgroundColor: '#fafafa', overflowX: 'hidden',
          width: '100%', boxSizing: 'border-box'}}>

          {image?.images?.length > 0 && (
            <Box sx={{ mb: 1.5, width: '100%', overflow: 'hidden' }}>
              <Slider dots={true} infinite={true} slidesToShow={1} slidesToScroll={1}>
                {image &&
                  image.images.map((item)=> (
                    <Box key={item._id || item.path} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <img src={item.path} alt={`여행 사진`}
                      style={{borderRadius: 8, width:'100%', objectFit: 'cover',
                      maxHeight:'300px', objectFit:'cover', display: 'block' }}/>
                    </Box>
                  ))}
              </Slider>
            </Box>
          )}

          <Typography variant="h5" sx={{ mb: 1, textAlign: 'left' }}>
            {board.subject}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, color: 'gray' }}>
            <Typography variant="body2" sx={{fontSize: '11.5px'}}>
              조회수 {board.hitCount}&nbsp; ·&nbsp; 댓글 {reviewCount}
            </Typography>
            <Typography variant="body2" sx={{mr:1}}>
              {new Date(board.created).toLocaleDateString('ko-KR')} 작성</Typography>
          </Box>

          {/* 동행일 때만 보이게 하기 */}
          {board.boardType === 'mate' && (
            <>
              {(board.startDate || board.endDate ||
                board.tourSpot?.placeName || board.tourSpot?.roadAddress ||
                board.tourSpot?.address || board.tourSpot?.borough) && (
                <>
                  <Typography variant="h6" sx={{ m: 1 }}>여행 일정</Typography>

                  {(board.startDate || board.endDate || 
                    board.tourSpot?.placeName || board.tourSpot?.roadAddress ||
                    board.tourSpot?.address || board.tourSpot?.borough) && (
                    <Box sx={{ backgroundColor: '#e9e9e9d2',
                      borderRadius: 2, p: 1.5, mb: 3, display: 'flex',
                      flexDirection: 'column', gap: 0.5, width:'100%',boxSizing: 'border-box'
                    }}>
                      {(board.startDate || board.endDate) && (
                        <Typography
                          variant="body1"
                          sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}
                        >
                          <CalendarMonthIcon sx={{ color: 'gray', mr: 1 }} />
                          {fmt(board.startDate)} ~ {fmt(board.endDate)}
                        </Typography>
                      )}

                      {(board.tourSpot?.placeName || board.tourSpot?.roadAddress ||
                        board.tourSpot?.address || board.tourSpot?.borough) && (
                        <Typography
                          variant="body1"
                          sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}
                        >
                          <LocationOnIcon sx={{ color: 'gray', mr: 1 }} />
                          {board.tourSpot?.placeName ||
                            board.tourSpot?.roadAddress ||
                            board.tourSpot?.address ||
                            board.tourSpot?.borough}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}
  
          <Typography variant="h6" sx={{ m: 1}}>여행 소개</Typography>
          <Typography variant="body1" sx={{ mb: 3, pl:1, fontSize:'13px' }}>{board.content}</Typography>

          {(board.mateCondition?.age?.length > 0 || board.mateCondition?.gender) && ( 
            <>
              <Typography variant="h6" sx={{ m: 1}}>동행 조건</Typography>
              <Box sx={{mb:4, pl: 1, display: 'flex', gap: 1}}>
                {board.mateCondition?.age?.length > 0 && (
                  <Box
                    sx={{display: 'inline-flex', alignItems: 'center',
                      backgroundColor: '#e9e9e9d2', borderRadius: '20px',
                      px: 1.4, py: '2px', fontSize: '13px', color: '#333'}}>
                    {board.mateCondition.age.join(', ')}
                  </Box>
                )}

                {board.mateCondition?.gender && (
                  <Box
                    sx={{display: 'inline-flex', alignItems: 'center',
                      backgroundColor: '#e9e9e9d2', borderRadius: '20px',
                      px: 1.4, py: '2px', fontSize: '13px', color: '#333'}}>
                    {board.mateCondition.gender}
                  </Box>
                )}
              </Box>
            </>
          )}
                
          {board.mateCondition?.type?.length > 0 && (
            <>
              <Typography variant="h6" sx={{ m: 1}}>동행 유형</Typography>
              {(() => {
                const ICONS = {
                  부분동행: <GroupAddOutlinedIcon sx={{ fontSize: 18, color: '#20b2aa' }} />,
                  식사동행: <FlatwareOutlinedIcon sx={{ fontSize: 18, color: '#20b2aa' }} />,
                  숙박동행: <HotelOutlinedIcon sx={{ fontSize: 18, color: '#20b2aa' }} />,
                  전체동행: <Diversity3OutlinedIcon sx={{ fontSize: 18, color: '#20b2aa' }} />
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 4, pl: 1 }}>
                    {board.mateCondition.type.map((t, i) => {
                        const icon = ICONS[t] || <></>
                        return (
                          <Box key={i}
                            sx={{
                              display: 'inline-flex', alignItems: 'center', backgroundColor: '#e9e9e9d2',
                              borderRadius: '20px', px: 1.2, py: 0.4, fontSize: '13px',
                              color: '#333', whiteSpace: 'nowrap',lineHeight: 0.5}}>
                            <span>{icon}</span>&nbsp;{t}
                          </Box>
                        )
                      })}
                  </Box>
                )
              })()}
            </>
          )}

          {board.tags?.length > 0 && (
            <>
              <Typography variant="h6" sx={{ m: 1}}>동행 태그</Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 3, pl: 1}}>
                {board.tags.map((tag, i) => (
                      <Box key={i} sx={{display: 'inline-flex',
                          alignItems: 'center', backgroundColor: '#e9e9e9d2',
                          borderRadius: '20px', px: 1.2, py: '2px', fontSize: '13px',
                          color: '#333', whiteSpace: 'nowrap'}}>
                        <span style={{ color: '#20b2aa', fontWeight: 'bold' }}>#</span>&nbsp;{tag}
                      </Box>
                    ))}
              </Box>
            </>
          )}

          <Typography variant="h6" sx={{ m: 1}}>여행장</Typography>
          {writerInfo ? (
            <Box sx={{ backgroundColor: '#e9e9e9d2', borderRadius: 3, boxSizing: 'border-box'
              ,p: 2, mb: 4, display: 'flex', flexDirection: 'column', gap: 0.5, width:'100%'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {writerInfo.nickname}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {writerInfo?.ageRange?? '비공개'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ·&nbsp;&nbsp; {writerInfo.gender || '비공개'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="gray">여행장 정보를 불러오는 중...</Typography>
          )}
      </>
    )}

          {/* 지도 */}
          {board.tourSpot?.location?.coordinates?.length === 2 && (
            <Box sx={{ width: '100%', height: 300, mb: 4, borderRadius: 2, overflow: 'hidden'}}>
              <Map
                center={{
                  lat: board.tourSpot.location.coordinates[1],
                  lng: board.tourSpot.location.coordinates[0],
                }}
                style={{ width: "100%", height: "100%" }}
                level={4}
              >
                <MapMarker
                  position={{
                    lat: board.tourSpot.location.coordinates[1],
                    lng: board.tourSpot.location.coordinates[0],
                  }}
                >
                  <div style={{ color: "#000", fontSize: "12px", padding: "2px 4px" }}>
                    {board.tourSpot.placeName || board.tourSpot.roadAddress || '여행지'}
                  </div>
                </MapMarker>
              </Map>
            </Box>
          )}

          {/* 포스트(notice, post)는 여행 관련 섹션 없이 내용만 */}
          {board.boardType !== 'mate' && (
            <Typography variant="body1" sx={{ mb: 6, whiteSpace: 'pre-line' }}>
              {board.content}
            </Typography>
          )}

          <ReviewList numBrd={parseInt(numBrd)} onCountChange={setReviewCount} />

          <Box component="footer" sx={{position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff', borderTop: '1px solid #ddd', py: 2, zIndex: 10,
            justifyContent: 'center', display: 'flex',maxWidth: 880,mx: 'auto'}}>

            <Box sx={{ width: '100%', maxWidth: 850, px: 2 }}>
              <ReviewWrite numBrd={parseInt(numBrd)} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
  

};

export default Community;
