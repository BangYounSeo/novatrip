import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { FormControl, Select, MenuItem } from '@mui/material';
import './addUser.css'


export default function SignUp_User({ token,setToken }) {
  //console.log(`토큰왔음 : ${token}`);
  
  const [verifyEmail,setVerifyEmail] = useState('');
  const [userIdMsg,setUserIdMsg] = useState('*아이디는 최소 3자 이상 입력하세요.')
  const [pwdMsg,setPwdMsg] =useState('*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.')
  const [nameMsg,setNameMsg] = useState('*성명을 입력하세요.');
  const [ageRangeMsg,setAgeRangeMsg] = useState('*연령대를 선택하세요.');
  const [nicknameMsg,setNicknameMsg] = useState('*닉네임을 적지않으면 랜덤으로 생성됩니다. 로그인 후 변경 가능.');
  
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: '',
    pwd: '',
    pwdConfirm: '',   //비밀번호 확인用
    name: '',
    ageRange: '',
    nickname: '',
    gender: 'male', //성별 추가 //초기값은 male
  });
  
  //이름 유효성체크
  const isValidName = (name) => {
    const hasHangulJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(name)
    const isValid = /^[A-Za-z가-힣]+$/.test(name)
    return isValid && !hasHangulJamo
  }

  //닉네임 유효성체크
  const isValidNickName = (nickname) => {
    const hasHangulJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(nickname)
    const isValid = /^[A-Za-z0-9가-힣]+$/.test(nickname)
    return isValid && !hasHangulJamo
  }

//유효성검사
const handleChange = (e) => {
    const {name, value} = e.target
    const newForm = { ...form, [name]:value }
    setForm(newForm);
    
    //비밀번호 확인 유효성검사    
    if(name === 'pwd' || name === 'pwdConfirm'){
      const pwd = newForm.pwd
      const pwdConfirm = newForm.pwdConfirm

      const isValidLength = pwd.length >= 8;
      const hasLetter = /[A-Za-z]/.test(pwd);
      const hasNumber = /\d/.test(pwd);

      if(pwd.length < 8 || !hasLetter || !hasNumber){
        setPwdMsg('*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.')
      }else if(pwd !== pwdConfirm){
        setPwdMsg('*비밀번호가 일치하지 않습니다.')
      }else {
        setPwdMsg('*비밀번호가 일치합니다.')
      } 
    }

    //닉네임 유효성 검사
    if(name === 'nickname') {
      if(value.trim() === ''){
        setNicknameMsg('*닉네임을 적지않으면 랜덤으로 생성됩니다. 로그인 후 변경 가능.')
      }else if(!isValidNickName(value)) {
        setNicknameMsg('*닉네임은 영문, 숫자, 완성형 한글만 사용 가능합니다.')
      }else{
        setNicknameMsg('*사용 가능한 닉네임입니다.')
      }
    }

    //이름 유효성 검사
    if(name === 'name') {
      if(value.trim() === ''){
        setNameMsg('*성명을 입력하세요.')
      }else if(!isValidName(value)) {
        setNameMsg('*이름은 영문, 완성형 한글만 사용 가능합니다.')
      }else{
        setNameMsg('*사용 가능한 이름입니다.')
      }
    }

    //나이 유효성 검사
    if(name === 'ageRage') {
     if(!value){
      setAgeRangeMsg('*연령대를 선택하세요.')
     }else {
      setAgeRangeMsg('*선택완료')
     }
    }

    // ✅ 연령대 유효성 검사 (오타 수정 + 메시지 통일)
    if (name === 'ageRange') {
      if (!value) setAgeRangeMsg('*연령대를 선택하세요.');
      else setAgeRangeMsg('*선택 완료');
    }

};

//아이디 유효성검사

  //아이디 낱자 방지
  const isValidId = (id) => {
    const hasHangulJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(id)
    const isValid = /^[A-Za-z0-9가-힣]+$/.test(id)
    return isValid && !hasHangulJamo
  }

  const handleChangeId = async (e) => {
    const value = e.target.value
    setForm({
      ...form,
      userId: value
    });

    if(value.length < 3) {
      setUserIdMsg('*아이디는 최소 3자 이상 입력하세요.')
      return
    }
    
    if(!isValidId(value)){
      setUserIdMsg('*아이디는 영문, 숫자, 완성형 한글만 사용 가능합니다.')
      return
    }
    
    //서버에 아이디 중복체크 요청
    try {
      const res = await axios.post('/api/check-userId', {userId: value})
      if(res.data.exists){
        setUserIdMsg('*이미 존재하는 아이디입니다.')
      }else{
        setUserIdMsg('*사용 가능한 아이디입니다.')
      }
    } catch (error) {
      setUserIdMsg('*아이디 확인 중 오류가 발생했습니다.')
    }


  }

  
//회원가입 등록
  const register = async () => {
    
    if(userIdMsg !== '*사용 가능한 아이디입니다.' ||
      pwdMsg !== '*비밀번호가 일치합니다.' ||
      !form.ageRange) {
      alert('*입력값을 확인해 주세요.')
      return
    }
    try {
      const payload = {...form, token}
      const res = await axios.post('/api/register', payload , {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifyEmail(res.data.message);
    
      localStorage.removeItem('token')
      setToken('')

      navigate('/signup/complete')

    } catch (err) {
      
      if (!token) {
        setVerifyEmail('*이메일 인증이 필요합니다.');
       
      }else{
        setVerifyEmail(err.response?.data?.message || '*회원가입 실패');
      }
     
    }
  };

  return (
    <div className='adduser-container'>
    <div className='adduser-box'>
        <div className="back-btn" >
            <ArrowBackIcon onClick={() => navigate(-1)}/>
              &nbsp;&nbsp;
            <HomeOutlinedIcon onClick={() => navigate('/')}/>
        </div>
      <h2>회원정보 입력</h2>

      <input 
      name="userId" placeholder="아이디" 
      onChange={handleChangeId}
      maxLength={20} minLength={3}

      />
      <h6 className='user-only'
          style={{
          color: userIdMsg === '*사용 가능한 아이디입니다.' ? '#2ecc71' 
          : userIdMsg === '*이미 존재하는 아이디입니다.' ||
           userIdMsg === '*아이디는 영문, 숫자, 완성형 한글만 사용 가능합니다.' ? 'lightcoral' 
          : ''
      }}>
      {userIdMsg}
      </h6>      
      <input name="pwd" type="password" 
      placeholder="비밀번호" onChange={handleChange}
      maxLength={16} minLength={8} />
      <h6 className='user-only'>*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.</h6>

      <input name="pwdConfirm" type="password" 
      placeholder="비밀번호 확인" onChange={handleChange}
      maxLength={16} minLength={8} />
      <h6 className='user-only' style={{
        color: pwdMsg === '*비밀번호가 일치하지 않습니다.' ? 'lightcoral' 
            : pwdMsg === '*비밀번호가 일치합니다.' ? '#2ecc71' 
            : ''
      }}>
        {pwdMsg}
      </h6>

      <input name="name" placeholder="이름" onChange={handleChange} 
      minLength={1} maxLength={15}/>
      <h6 className='user-only'
      style={{
        color: nameMsg === '*이름은 영문, 완성형 한글만 사용 가능합니다.' ? 'lightcoral'
        : nameMsg === '*사용 가능한 이름입니다.' ? '#2ecc71' 
        : ''
      }}>{nameMsg}</h6>

{/* 연령대 선택 (필수) */}
<FormControl
  fullWidth
  sx={{
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b8b8b8' },
    // 포커스 보더
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#b8b8b8' },
    borderRadius: '8px',
  }}
>
  <Select
    name="ageRange"                          // ← name 지정
    value={form.ageRange}
    onChange={handleChange}                  // ← 공용 핸들러 사용
    displayEmpty
    renderValue={(v) =>
      v ? v : <span style={{ color: '#b8b8b8' }}>연령대를 선택하세요</span>
    }
    MenuProps={{
      PaperProps: {
        sx: {
          borderRadius: '10px',
          boxShadow: '0 6px 22px #505050',
        },
      },
    }}
    sx={{
      height: 44,
      fontWeight: 600,
      letterSpacing: '1px',
      borderRadius: '8px',
      '& .MuiSelect-select': {
        py: 0, px: 2, display: 'flex', alignItems: 'center',
        color: form.ageRange ? '#a3a3a3' : '#b8b8b8',   // ← 선택 여부에 따라 색상
      },
      '& .MuiSvgIcon-root': { color: '#b8b8b8' },
    }}
  >
    <MenuItem value=""><em>연령대를 선택하세요</em></MenuItem>
    <MenuItem value="10대 미만">10대 미만</MenuItem>
    <MenuItem value="10대">10대</MenuItem>
    <MenuItem value="20대">20대</MenuItem>
    <MenuItem value="30대">30대</MenuItem>
    <MenuItem value="40대">40대</MenuItem>
    <MenuItem value="50대">50대</MenuItem>
    <MenuItem value="60대">60대</MenuItem>
    <MenuItem value="70대">70대</MenuItem>
    <MenuItem value="80대 이상">80대 이상</MenuItem>
  </Select>
</FormControl>


        <h6
          className="user-only"
          style={{
            color:
              ageRangeMsg === '*선택 완료'
                ? '#2ecc71'
                : ageRangeMsg === '*연령대를 선택하세요.'
                ? 'lightcoral'
                : '',
          }}
        >
          {ageRangeMsg}
        </h6>

      {/* 성별 */}
      <div className="gender-row">
        <button
          type="button"
          className={`gender-box ${form.gender === 'male' ? 'on' : ''}`}
          onClick={() => setForm({ ...form, gender: 'male' })}
          aria-pressed={form.gender === 'male'}
        >
          남성
        </button>
        <button
          type="button"
          className={`gender-box ${form.gender === 'female' ? 'on' : ''}`}
          onClick={() => setForm({ ...form, gender: 'female' })}
          aria-pressed={form.gender === 'female'}
          
        >
          여성
        </button>
      </div>
      <h6 className="user-only">*성별을 선택하세요.</h6>



      <input name="nickname" placeholder="닉네임" onChange={handleChange} 
      minLength={1} maxLength={15}/>
      <h6 className='user-only'
      style={{
        color: nicknameMsg ==='*닉네임은 영문, 숫자, 완성형 한글만 사용 가능합니다.' ? 'lightcoral'
        : nicknameMsg === '*사용 가능한 닉네임입니다.' ? '#2ecc71'
        : nicknameMsg === '*닉네임을 적지않으면 랜덤으로 생성됩니다. 로그인 후 변경 가능.' ? '' 
        : ''
      }}>{nicknameMsg}</h6>

      <br/>
      <br/>
      <div>
        <h5>
          {verifyEmail} 
          {verifyEmail === '*이메일 인증이 필요합니다.' && (
            <Link to='/signup/email' 
            style={{marginLeft: '5px' ,color: 'black', textDecoration: 'underline'}}>
              이메일 인증하기
            </Link>
          )}
        </h5>
      </div>
      <button 
      onClick={register}
      disabled={
        userIdMsg !== '*사용 가능한 아이디입니다.' 
        || pwdMsg !=='*비밀번호가 일치합니다.'  
        || form.pwd.length < 8 
        || nameMsg !=='*사용 가능한 이름입니다.'
        || ageRangeMsg !=='*선택 완료'
        || nicknameMsg === '*닉네임은 영문, 숫자, 완성형 한글만 사용 가능합니다.'
        || !form.gender                         
      }
      >
        회원가입
      </button>
      </div>
    </div>
  );
}
