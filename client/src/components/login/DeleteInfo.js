import React, { useState } from 'react';
import { Modal, Box, Typography, Slide, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './addUser.css';
import { useNavigate } from 'react-router-dom';

export default function DeleteInfo({ open, onClose, onDeleted }) {
  const FOOTER_HEIGHT = 72;
  const FOOTER_MAX_WIDTH = 650;

  const token = localStorage.getItem('token');

  const [currentPwd, setCurrentPwd] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const disabled = !(confirmText === '회원탈퇴');

  const handleDelete = async () => {
    try {
      const res = await axios.post(
        '/api/delete-account',
        { currentPwd, confirm: '회원탈퇴' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || '회원 탈퇴가 완료되었습니다.');

      localStorage.removeItem('token');

      if (typeof onDeleted === 'function') onDeleted();
      onClose?.();

      navigate('/delete/complete')

    } catch (err) {
      setMessage(err.response?.data?.message || '회원 탈퇴 실패');
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

          <Typography variant="h6" sx={{ mb: 1 }}>회원 탈퇴</Typography>

          <div className="adduser-box" style={{ width: '100%', boxShadow: 'none', padding: 0 }}>
            <input
              type="password"
              placeholder="현재 비밀번호 (소셜계정은 비워도 됩니다)"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              maxLength={16}
            />
            <h6 className="user-only">*보안 확인을 위해 비밀번호를 입력하세요. (카카오/소셜 계정은 생략 가능)</h6>

            <input
              type="text"
              placeholder="'회원탈퇴'를 입력하세요"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <h6 className="user-only">*이 작업은 되돌릴 수 없습니다.</h6>

            <div className="next-btn-container">
              <button onClick={handleDelete} disabled={disabled}>회원 탈퇴</button>
            </div>

            {message && <h5>{message}</h5>}
          </div>
        </Box>
      </Slide>
    </Modal>
  );
}
