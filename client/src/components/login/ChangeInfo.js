import React, { useEffect, useState } from 'react';
import {
  Modal, Box, Typography, Button, Slide, IconButton, FormControl, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './addUser.css';

function toAgeRangeFromNumber(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return '';
  if (n < 10) return '10대 미만';
  if (n >= 80) return '80대 이상';
  return `${Math.floor(n / 10) * 10}대`;
}

export default function ChangeInfo({ open, onClose }) {
  const FOOTER_HEIGHT = 72;
  const FOOTER_MAX_WIDTH = 650;

  const token = localStorage.getItem('token');

  const [userInfo, setUserInfo] = useState({
    nickname: '',
    ageRange: '',
    email: '',
    name: '',
    gender: 'male',
  });

  const [msg, setMsg] = useState({
    name: '*성명을 입력하세요.',
    ageRange: '*연령대를 선택하세요.',
    nickname: '*닉네임을 적지않으면 기존 값이 유지됩니다.',
    email: '*이메일 형식을 확인하세요.',
  });

  const [serverMessage, setServerMessage] = useState('');

  const hasHangulJamo = (v) => /[ㄱ-ㅎㅏ-ㅣ]/.test(v);
  const isValidName = (name) => /^[A-Za-z가-힣]+$/.test(name) && !hasHangulJamo(name);
  const isValidNick = (nickname) =>
    nickname.trim() === '' || (/^[A-Za-z0-9가-힣]+$/.test(nickname) && !hasHangulJamo(nickname));
  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  useEffect(() => {
    if (!open || !token) return;
    (async () => {
      try {
        const res = await axios.get('/api/me', { headers: { Authorization: `Bearer ${token}` } });
        const fromServerAgeRange =
          res.data.ageRange ?? (res.data.age != null ? toAgeRangeFromNumber(res.data.age) : '');
        const next = {
          nickname: res.data.nickname ?? '',
          ageRange: fromServerAgeRange ?? '',
          email: res.data.email ?? '',
          name: res.data.name ?? '',
          gender:
            res.data.gender === 'male' || res.data.gender === 'female'
              ? res.data.gender
              : 'male',
        };
        setUserInfo(next);
        setMsg((m) => ({
          ...m,
          name: next.name ? '*사용 가능한 이름입니다.' : '*성명을 입력하세요.',
          ageRange: next.ageRange ? '*선택 완료' : '*연령대를 선택하세요.',
          nickname: next.nickname ? '*현재 닉네임을 사용할 수 있습니다.' : m.nickname,
          email: next.email && isValidEmail(next.email) ? '*이메일 확인 완료.' : m.email,
        }));
      } catch (err) {
        console.error('유저 정보 불러오기 실패:', err);
      }
    })();
  }, [open, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...userInfo, [name]: value };
    setUserInfo(next);

    if (name === 'name') {
      if (!value.trim()) setMsg((m) => ({ ...m, name: '*성명을 입력하세요.' }));
      else if (!isValidName(value)) setMsg((m) => ({ ...m, name: '*이름은 영문, 완성형 한글만 사용 가능합니다.' }));
      else setMsg((m) => ({ ...m, name: '*사용 가능한 이름입니다.' }));
    }
    if (name === 'nickname') {
      if (!value.trim()) setMsg((m) => ({ ...m, nickname: '*닉네임을 적지않으면 기존 값이 유지됩니다.' }));
      else if (!isValidNick(value)) setMsg((m) => ({ ...m, nickname: '*닉네임은 영문, 숫자, 완성형 한글만 사용 가능합니다.' }));
      else setMsg((m) => ({ ...m, nickname: '*사용 가능한 닉네임입니다.' }));
    }
    if (name === 'email') {
      if (!value.trim()) setMsg((m) => ({ ...m, email: '*이메일 형식을 확인하세요.' }));
      else if (!isValidEmail(value)) setMsg((m) => ({ ...m, email: '*유효한 이메일이 아닙니다.' }));
      else setMsg((m) => ({ ...m, email: '*이메일 확인 완료.' }));
    }
    if (name === 'ageRange') {
      setMsg((m) => ({ ...m, ageRange: value ? '*선택 완료' : '*연령대를 선택하세요.' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nickname: userInfo.nickname,
        name: userInfo.name,
        ...(userInfo.email?.trim() ? { email: userInfo.email.trim() } : {}),
        gender: userInfo.gender,
        ageRange: userInfo.ageRange,
      };
      const res = await axios.put('/api/change-info', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServerMessage(res.data.message || '수정 완료');
      onClose?.(); // 저장 후 닫기 원하면 유지
    } catch (err) {
      setServerMessage(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{ onClick: onClose }}
      closeAfterTransition
      sx={{
        zIndex: 1200,
        position: 'absolute',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'right',
        marginRight: {lg:'50px',xs:'0px'},
      }}
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            bottom: 0,
            width: {lg:'100%',xs:'88%'},
            position: 'fixed',
            maxWidth: `${FOOTER_MAX_WIDTH}px`,
            minHeight: `${FOOTER_HEIGHT}px`,
            bgcolor: 'white',
            boxShadow: 4,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            sx={{ position: 'absolute', top: 10, right: 10, color: 'gray' }}
            aria-label="닫기"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 1 }}>프로필 편집</Typography>

          {/* ===== 폼 본문 (기존 UI 유지) ===== */}
          <div className="adduser-box" style={{ width: '100%', boxShadow: 'none', padding: 0 }}>
            <input name="nickname" placeholder="닉네임" value={userInfo.nickname} onChange={onChange} maxLength={15} />
            <h6 className="user-only" style={{ color: msg.nickname.includes('한글만') ? 'lightcoral' : msg.nickname.includes('사용 가능한') ? '#2ecc71' : '' }}>
              {msg.nickname}
            </h6>

            <input name="name" placeholder="이름" value={userInfo.name} onChange={onChange} maxLength={15} />
            <h6 className="user-only" style={{ color: msg.name.includes('사용 가능한') ? '#2ecc71' : msg.name.includes('영문, 완성형 한글') ? 'lightcoral' : '' }}>
              {msg.name}
            </h6>

            <FormControl fullWidth sx={{ borderRadius: '8px' }}>
              <Select
                name="ageRange"
                value={userInfo.ageRange}
                onChange={onChange}
                displayEmpty
                renderValue={(v) => (v ? v : <span style={{ color: '#a3a3a3' }}>연령대를 선택하세요</span>)}
                sx={{
                  height: 44, fontWeight: 600, letterSpacing: '1px', borderRadius: '8px',
                  '& .MuiSelect-select': { py: 0, px: 2, display: 'flex', alignItems: 'center', color: userInfo.ageRange ? '#505050' : '#a3a3a3' },
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
            <h6 className="user-only" style={{ color: msg.ageRange.includes('선택 완료') ? '#2ecc71' : msg.ageRange.includes('선택하세요') ? 'lightcoral' : '' }}>
              {msg.ageRange}
            </h6>

            <input name="email" placeholder="이메일" value={userInfo.email} onChange={onChange} maxLength={50} />
            <h6 className="user-only" style={{ color: msg.email.includes('완료') ? '#2ecc71' : msg.email.includes('유효한') ? 'lightcoral' : '' }}>
              {msg.email}
            </h6>
 
            <div className="gender-row">
              <button type="button" className={`gender-box ${userInfo.gender === 'male' ? 'on' : ''}`} onClick={() => setUserInfo({ ...userInfo, gender: 'male' })} aria-pressed={userInfo.gender === 'male'}>
                남성
              </button>
              <button type="button" className={`gender-box ${userInfo.gender === 'female' ? 'on' : ''}`} onClick={() => setUserInfo({ ...userInfo, gender: 'female' })} aria-pressed={userInfo.gender === 'female'}>
                여성
              </button>
            </div>
            <h6 className="user-only">*성별을 선택하세요.</h6>

            <div className="next-btn-container">
              <button onClick={onSubmit}>저장</button>
            </div>

            {serverMessage && <h5>{serverMessage}</h5>}
          </div>
        </Box>
      </Slide>
    </Modal>
  );
}
