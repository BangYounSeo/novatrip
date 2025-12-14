import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import './addUser.css'

export default function SignUp_Email({ setToken }) {
  const [email, setEmail] = useState('');
  const [codeSent,setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifiedMsg,setVerifiedMsg] = useState('');
  const [sendCodeMsg,setSendCodeMsg] = useState('');
  const [emailError,setEmailError] = useState('') //오류 상태
  const navigate = useNavigate();

  //버튼눌렀을때 커서 변경
  const emailInputRef = useRef(null);
  const codeInputRef = useRef(null);

  const validateEmail = (email) => {
    // 간단한 이메일 정규식
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  //인증번호 보내기 버튼
  const sendCode = async () => {
    if(!validateEmail(email)) {
        setEmailError('형식에 맞는 이메일이 아닙니다.')
        emailInputRef.current.focus();
        return
    }
    setEmailError('')   //오류 초기화

    try {
        await axios.post('/api/send-code', {email})
        setCodeSent(true)
        setSendCodeMsg('인증번호를 발송했습니다.')

        setTimeout(()=>{
          codeInputRef.current.focus();
        },100)

    } catch (error) {
        setEmailError(error.response?.data?.message || '인증번호 발송 실패')
    }
  }

  // 이메일 인증 코드 확인
  const verifyCode = async () => {
    try {
      const res = await axios.post('/api/verify-code', { email, code });

      // 1️⃣ 이메일 인증 성공 → 토큰 받기
      const newToken = res.data.token;

      // 2️⃣ App에 토큰 저장
      setToken(newToken);

      // 3️⃣ 브라우저에도 저장 (선택)
      localStorage.setItem("token", newToken);

      setVerified(true);
      setVerifiedMsg('✅인증 성공!')
      
    } catch (err) {
      setVerifiedMsg(err.response?.data?.message || '❌인증 실패!')
    }
  };

  // 다음 버튼 클릭 → SignUp_User로 이동
  const goNext = () => {
    navigate('/signup/user');
  };

  return (
        
        <div className='adduser-container'>
        <div className='adduser-box'>
            <div className="back-btn" >
                <ArrowBackIcon onClick={() => navigate(-1)}/>
                  &nbsp;&nbsp;
                <HomeOutlinedIcon onClick={() => navigate('/')}/>
            </div>
        <h2>회원가입</h2>
        <h4>&nbsp;이메일 인증</h4>
       <input
        ref={emailInputRef}
        type='email'
        value={email}
        onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setEmailError('형식에 맞는 이메일이 아닙니다.');
            } else {
                setEmailError('사용가능한 이메일입니다.');
            }
        }}
        placeholder="이메일을 입력해주세요." 
        maxLength={30}
        style={{
            border: emailError ==='사용가능한 이메일입니다.' ? '1px solid green' 
            : emailError ? '1px solid tomato' : ''
        }}
        />
        <h5 style={{ color: emailError === '사용가능한 이메일입니다.' ? 'green' : 'tomato' }}>
            {emailError}
        </h5>

        <button onClick={sendCode} disabled={!validateEmail(email)}>인증번호 보내기</button>
        <br/>

        {codeSent && (
            <>
            <h3 style={{ marginBottom: '7px'}}>{sendCodeMsg}</h3>
            <input
            ref={codeInputRef}
            type='text'
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder="인증코드 6자리를 입력해주세요." 
            maxLength={6} />
            <h5 style={{
              color: verifiedMsg.includes('성공') ? 'green' : 'tomato'}}>
              {verifiedMsg}
            </h5>
            <button onClick={verifyCode}>인증 확인</button>
            </>
        )}
            <br/>
            <div className='next-btn-container'>
            {verified && <button onClick={goNext}>다음</button>}
            </div>
        </div>
        </div>
  );
}
