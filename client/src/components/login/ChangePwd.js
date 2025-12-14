import React, { useState } from 'react';
import { Modal, Box, Typography, Slide, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './addUser.css';

export default function ChangePwd({ open, onClose }) {
  const FOOTER_HEIGHT = 72;
  const FOOTER_MAX_WIDTH = 650;

  const token = localStorage.getItem('token');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.');
  const [serverMessage, setServerMessage] = useState('');

  const checkPwd = (pwd, confirm) => {
    const lengthOK = pwd.length >= 8 && pwd.length <= 16;
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    if (!lengthOK || !hasLetter || !hasNumber) setPwdMsg('*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.');
    else if (pwd !== confirm) setPwdMsg('*비밀번호가 일치하지 않습니다.');
    else setPwdMsg('*비밀번호가 일치합니다.');
  };

  const onChangeNew = (e) => { const v = e.target.value; setNewPwd(v); checkPwd(v, confirmPwd); };
  const onChangeConfirm = (e) => { const v = e.target.value; setConfirmPwd(v); checkPwd(newPwd, v); };

  const disabled =
    !currentPwd || newPwd.length < 8 || !/[A-Za-z]/.test(newPwd) || !/\d/.test(newPwd) || newPwd !== confirmPwd;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        '/api/change-password',
        { currentPwd, newPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServerMessage(res.data.message || '비밀번호가 변경되었습니다.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setPwdMsg('*비밀번호는 8~16자리, 영문과 숫자를 반드시 입력하세요.');
      onClose?.();

      localStorage.removeItem('token')
      alert('비밀번호가 변경되어 로그아웃됩니다. 로그인이 필요합니다.')
      try {
      window.location.href = '/login';
      } catch {
        window.location.href = '/';
      }

    } catch (err) {
      setServerMessage(err.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{ onClick: onClose }}
      closeAfterTransition
      sx={{
        zIndex: 1500,
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
          <IconButton onClick={(e) => { e.stopPropagation(); onClose?.(); }} sx={{ position: 'absolute', top: 10, right: 10, color: 'gray' }} aria-label="닫기">
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 1 }}>비밀번호 변경</Typography>

          <div className="adduser-box" style={{ width: '100%', boxShadow: 'none', padding: 0 }}>
            <input type="password" placeholder="현재 비밀번호" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} maxLength={16} />
            <h6 className="user-only">*현재 비밀번호를 입력하세요.</h6>

            <input type="password" placeholder="새 비밀번호" value={newPwd} onChange={onChangeNew} maxLength={16} />
            <h6 className="user-only">*비밀번호는 8~16자리, 영문과 숫자를 반드시 포함.</h6>

            <input type="password" placeholder="새 비밀번호 확인" value={confirmPwd} onChange={onChangeConfirm} maxLength={16} />
            <h6 className="user-only" style={{ color: pwdMsg === '*비밀번호가 일치합니다.' ? '#2ecc71' : pwdMsg === '*비밀번호가 일치하지 않습니다.' ? 'lightcoral' : '' }}>
              {pwdMsg}
            </h6>

            <div className="next-btn-container">
              <button onClick={onSubmit} disabled={disabled}>비밀번호 변경</button>
            </div>

            {serverMessage && <h5>{serverMessage}</h5>}
          </div>
        </Box>
      </Slide>
    </Modal>
  );
}
