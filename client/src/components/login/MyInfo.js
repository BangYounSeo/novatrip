import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PermMediaTwoToneIcon from '@mui/icons-material/PermMediaTwoTone';
import LoginAlertModal from './LoginAlertModal';
import './myInfo.css';
import MyInfoData from './MyInfoData';

const MyInfo = ({setToken,stayData,tripData,cafeData,foodData,cultureData,leisureData,shopData,eventData}) => {
    // 드로어가 렌더될 호스트 컨테이너 (MyInfo 안에서만 열리게)
    const drawerHostRef = useRef(null);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    // edit | password | delete 중 하나. 기본은 edit(=프로필편집)
    const initialTab = params.get('tab') || 'edit';  

    const [userInfo,setUserInfo] = useState(null);
    const [coverImage, setCoverImage] = 
    useState('https://source.unsplash.com/random/300x180')

    const [profileImage,setProfileImage] = useState('https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U')
    const navigate = useNavigate();    
    const token = localStorage.getItem('token');


    useEffect(()=> {
    //서버에서 userId기반으로 정보가져오기
    axios.get('/api/me', {
            headers: {Authorization: `Bearer ${token}`}
        })
        .then(res=> {
            setUserInfo(res.data)
            if(res.data.backgroundPicture){
                setCoverImage(res.data.backgroundPicture);
            }
            if(res.data.profileImage){
                setProfileImage(res.data.profileImage)
            }
        })
        .catch(()=>{
            localStorage.removeItem('token') //유효하지않은토큰이면 삭제하기
            navigate('/login') 
        })
    },[]);

    //이미지 파일 선택 시
    const handleImageChange = async (evt) => {
        const file = evt.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = () => setCoverImage(reader.result)
            reader.readAsDataURL(file);
        }        
        const formData = new FormData();
        formData.append('backgroundPicture',file);

        try {
            const token = localStorage.getItem('token')
            const res = await axios.post('/api/me/upload-background',formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            //서버에서 저장된 경로를 이미지로 사용
            setCoverImage(res.data.backgroundPicture);
            console.log(res.data.backgroundPicture);            

        } catch (err) {
            console.error('fail upload',err);            
        }
    }
    
    //이미지 파일 선택 시
    const handleProfileImageChange = async (evt) => {
        const file = evt.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = () => setProfileImage(reader.result)
            reader.readAsDataURL(file);
        }        
        const formData = new FormData();
        formData.append('profileImage',file);

        try {
            const token = localStorage.getItem('token')
            const res = await axios.post('/api/me/upload-profileImage',formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            //서버에서 저장된 경로를 이미지로 사용
            setProfileImage(res.data.profileImage);
            console.log(res.data.profileImage);            

        } catch (err) {
            console.error('fail upload',err);            
        }
    }

    if(!userInfo) return <div>로딩 중...</div>

  return (
    <Box ref={drawerHostRef} id="myinfo-panel-root" sx={{ height: '75vh', position: 'relative' }}>
    {/* 기존 상단 커버/프로필 영역 등 MyInfo 화면 내용들... */}

  <div className="card">
        <div className="card-image" style={{ backgroundImage: `url("${encodeURI(coverImage)}")` }}>
        <label className="image-upload-label">
          <PermMediaTwoToneIcon fontSize="large" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </label>
        </div>

        {/* 카드 안에 프로필 */}
        <div className="card-content">
          <div className="profile-row">
            {/* 15x15 프로필 (클릭 시 파일 선택) */}
            <label htmlFor="profileInput" className="avatar-xxs" title="프로필 변경">
              <img
                src={profileImage || 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U'}
                alt="프로필"
                onError={(e) => {
                   if (e.currentTarget.src.includes('https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U')) return; // ✅ 반복 방지
                  e.currentTarget.src = 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U';
                }}
              />
            </label>

           {/* ⬇ 사진 '아래' 한 줄: 이름, 나이 · 성별 */}
            <div className="meta-line">
              <span className="nickname">{userInfo.nickname}</span>
              <span className="ageRange">{userInfo.ageRange}</span>
              {userInfo.gender && (
                <>
                  <span className="dot">·</span>
                  <span className="gender">{userInfo.gender}</span>
                </>
              )}
            </div>

            {/* 숨김 파일 입력 (라벨 클릭 시만 열림) */}
            <input
              id="profileInput"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="sr-only"
            />
          </div>
        </div>

    </div>

     <MyInfoData
        initialTab={initialTab}
        userId={userInfo.userId}
        stayData={stayData}
        tripData={tripData}
        foodData={foodData}
        cafeData={cafeData}
        cultureData={cultureData}
        leisureData={leisureData}
        shopData={shopData}
        eventData={eventData}
      />
    
  </Box>
  );
};


export default MyInfo;