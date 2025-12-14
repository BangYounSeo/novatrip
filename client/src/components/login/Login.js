import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import FindId from './FindId';
import FindPassword from './FindPassword';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { jwtDecode } from 'jwt-decode';

function Login({token,setToken}) {
  const [user, setUser] = useState({
    userId: '',
    pwd: ''
  });
  const [message, setMessage] = useState('');

  //모달
  const [isFindIdOpen,setIsFindIdOpen] = useState(false);
  const [isFindPwdOpen,setIsFindPwdOpen] = useState(false);

  //이전주소로넘어가기
  const navigate = useNavigate();
  const location = useLocation();

  //토글
  const [showPwd,setShowPwd] = useState(false);

  //유효성검사
  const [focused,setFocused] = useState({userId: false, pwd: false})
  const isUserIdValid = (value) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return value !== '' && regex.test(value)
  }
  const isPwdValid = (value) => {
  return value !== ''; // 간단히 비어있지 않으면 통과
  };

  const ifFormFilled = user.userId !== '' && user.pwd !== '';

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/login', user);
      console.log("로그인 응답", res.data);
      setMessage(res.data.message);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token); //토큰 저장
        const decoded = jwtDecode(res.data.token)
        setToken(res.data.token); // 화면에 토큰 표시
        
        if(decoded.role ==='admin') {
          navigate('/admin');  //관리자페이지로 이동
        }else{
          navigate('/');  //이전주소로 이동 || 주소없으면 홈으로
        }
      } else {
        setMessage('');
      }

    } catch (err) {

      if(err.response?.status === 403 && err.response?.data?.message?.includes('정지'))  {
        setMessage(err.response.data.message);
      }else if(err.response && err.response.data && err.response.data.message){
        setMessage(err.response.data.message);
      }else {
        setMessage('서버 에러 또는 네트워크 오류');
      }
    }

  };

    //카카오 로그인
    useEffect(() => {
      const handleKakaoMessage = (event) => {
        if (event.origin !== "http://192.168.0.34:8080" && event.origin !== "http://192.168.0.34:3000") return;
        const { token, nickname } = event.data;
        if (token) {
          localStorage.setItem('token', token);
          setToken(token);
          alert(`${nickname}님 환영합니다!`);
          window.location.href='/';
        }
     };
  
      window.addEventListener('message', handleKakaoMessage);
      return () => window.removeEventListener('message', handleKakaoMessage);
    }, []);
  
    
  // 카카오로그인 (팝업창 방식)
  const onKakaoLogin = () => {
    window.open(
      'http://192.168.0.34:8080/login/auth/kakao',
      'kakaoLogin',
      'width=500,height=600'
    );
  };
  

  const closeModal = (setter) => () => setter(false);   //모달닫기 공통함수

  return (
    <div className='login-container'>
      <div className='login-box'>
      <div className="back-btn" onClick={() => navigate('/')}>
         <HomeOutlinedIcon/>
      </div>
      <h3>로그인</h3>
      <input
        type="text"
        placeholder="아이디"
        value={user.userId}
        onChange={evt => setUser({ ...user, userId: evt.target.value })}
        maxLength={30}
        onFocus={()=> setFocused({...focused, userId: true})}
        className= {focused.userId && !isUserIdValid(user.userId) ? 'invalid' : ''}
      />
      <div className='input-container'>
      <input
          type={showPwd ? 'text' : 'password'}
          placeholder="비밀번호"
          value={user.pwd}
          onChange={e => setUser({ ...user, pwd: e.target.value })}
          maxLength={16}
          onFocus={()=> setFocused({...focused, userPwd: true})}
          className= {focused.userPwd && !isPwdValid(user.pwd) ? 'invalid' : ''}
        />
        <span
          type="button"
          className="toggle-pwd"
          onClick={() => setShowPwd(!showPwd)}
        >
          {showPwd ? <VisibilityIcon/> : <VisibilityOffIcon/>}
        </span>
        </div>
    

      <button
       onClick={handleLogin}
       disabled={!ifFormFilled}
       className={ifFormFilled ? 'active-btn' : 'inactive-btn'}
      >로그인</button>

      <button
       onClick={onKakaoLogin}
       style={{backgroundColor:'#FBC02D'}}
      >카카오로 로그인</button>
      {message && <p className="message">{message}</p>}
      
      {/* 🔽 아이디/비밀번호 찾기 섹션 */}
     <div className='link-container'>
       <div className="find-links">
        <p onClick={() => setIsFindIdOpen(true)} 
        style={{ cursor: 'pointer' }}>아이디 찾기</p>
        <span>|</span>
        <p onClick={() => setIsFindPwdOpen(true)} 
        style={{ cursor: 'pointer'}}>비밀번호 찾기</p>
      </div>      
      <div className='signUp-links'>
         <Link className='signup-link' to='/signup/email' style={{textDecoration:'none'}}>회원가입</Link>
      </div>
     </div>
      
    </div>
      {/* 모달 섹션 */}
      {isFindIdOpen && (
        <div className="modal-overlay" onClick={closeModal(setIsFindIdOpen)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal(setIsFindIdOpen)}>X</button>
            <FindId />
          </div>
        </div>
      )}

      {isFindPwdOpen && (
        <div className="modal-overlay" onClick={closeModal(setIsFindPwdOpen)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal(setIsFindPwdOpen)}>X</button>
            <FindPassword />
          </div>
        </div>
      )}


    </div>
  );
}

export default Login;
