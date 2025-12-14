import React, { useContext, useEffect, useState } from 'react';
import {
    Box,Typography,IconButton,Tooltip,Dialog,Slide,Divider,Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BoardContext } from './BoardContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getGoodStatus, toggleGood } from '../../service/boardService';
import LoginAlertModal from '../login/LoginAlertModal';
import { Token } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const CommunityHeader = ({ title, postId, loginId, writerId,containerRef,boardType}) => {

  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleBack = () => navigate(-1);
  const {setModalOpen,setModalCat,setIsEdit} = useContext(BoardContext)

  const [like,setLike] = useState(false)
  const [likeCount,setLikeCount] = useState(0)

  const [rfModalOpen,setRfModalOpen] = useState(false)
  const [rfModalType,setRfModalType] = useState('')
  const isLoggedIn = !!loginId

  useEffect(() => {
    let mounted = true;
    (async() => {
      if(!postId || !loginId) return;
      try{
          const {liked,goodCount} = await getGoodStatus(postId,loginId)
          if(mounted){
         
              setLike(liked)
              setLikeCount(goodCount)
              console.log('좋아요 상태:', { liked, goodCount });
          }
      }catch(err){
          console.error('좋아요 상태 조회 실패:', err)
      }
    })()

    return () => { mounted = false } 
    
  },[postId,loginId])

  // 공유하기 (링크)
  const shareBoard = async () => { 
      if(!loginId){
        setRfModalType('loginAlert')
        setRfModalOpen(true)
        return
      }
      const shareUrl = `${window.location.origin}/community/${postId}`
      try{
        await navigator.clipboard.writeText(shareUrl)
        alert('게시글 링크가 복사되었습니다!')
      }catch(err) {
        console.error('링크 복사 실패:' ,err)
        alert('링크 복사 중 오류가 발생했습니다.')
      }
      setOpen(false)
  }

  // 게시글 신고
  const handleReport = async () => { 
      if(!isLoggedIn){
        setRfModalType('loginAlert')
        setRfModalOpen(true)
        return
      }

      if(!window.confirm('이 게시글을 신고하시겠습니까?')) return
      console.log('신고 요청 URL:', `/api/board/report/${postId}`)

      try{
          await axios.put(`/api/board/report/${postId}`)
          alert('신고가 접수되었습니다.');
      }catch (err){
          console.error('게시글 신고 실패:', err)
          alert('신고 처리 중 오류가 발생했습니다.')
      }
      setOpen(false)
  }

  // 삭제
  const boardDelete = async () => {
      if(!window.confirm('정말 이 게시글을 삭제 하시겠습니까?')) return

      try{
          await axios.delete(`/api/board/${postId}`, {
              data: {userId:loginId} // 작성자 검증
          })
          alert('게시글이 삭제되었습니다.')
          navigate('/'); // 목록으로 이동
      }catch(err){
          console.log('게시글 삭제 실패:', err)
          alert(err.response?.data?.message || '게시글 삭제 실패')
      }
      setOpen(false)
  }

  //수정 모달
  const editModalOpen = () => {
    setModalCat(boardType)
    setIsEdit(true)
    setModalOpen(true)
  }

const handleToggle = async () => {
  if (!isLoggedIn) {
    setRfModalType('loginAlert');
    setRfModalOpen(true);
    return;
  }

  try {
    setLike(prev => !prev);
    setLikeCount(prev => like ? Math.max(0, prev - 1) : prev + 1);

    const { liked, goodCount } = await toggleGood(postId, loginId);
    setLike(!!liked);
    setLikeCount(goodCount ?? 0);
  } catch (err) {
    console.error('좋아요 토글 실패:', err);
    try {
      const { liked, goodCount } = await getGoodStatus(postId, loginId);
      setLike(liked);
      setLikeCount(goodCount ?? 0);
    } catch (e) { }
  }
};

  return (
    <>
      <Box
        sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          py: 0.5, px: 2, width: '100%',maxWidth: '880px', mx: 'auto', boxSizing: 'border-box',
          backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 20,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml:-1  }}>
          <Tooltip>
            <IconButton onClick={handleBack}><ArrowBackIcon /></IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{
            fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', maxWidth: '55vw',
          }}>
            {title || ''}
          </Typography>
        </Box>
        <Box justifyContent='end'>
        <IconButton 
          onClick={isLoggedIn ? handleToggle : () => {
            setRfModalType('loginAlert');
            setRfModalOpen(true);
          }}
            >
            {like ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>

          <IconButton onClick={() => setOpen(true)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Dialog open={open}
        TransitionComponent={Transition} onClose={() => setOpen(false)}
        maxWidth={false}
        disablePortal // body 화면 밖으로 안나가게
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        container={containerRef?.current || undefined}
        scroll='paper'
        sx={{ position: 'absolute !important', right: 0, bottom: 0,
                '& .MuiDialog-container': { 
                    position: 'absolute !important',
                    alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%',display: 'flex',overflow:'hidden',height:'100%'
                },
            }}
        PaperProps={{
          sx: {position: 'absolute',left:0,right:0,bottom:0,
            width: { xs: '100%', lg: '100%' }, maxWidth:{ xs: 880, lg: 880 },
            mx: { xs: 'auto', lg: 0 }, borderTopLeftRadius: 12, borderTopRightRadius: 12,m:0,maxHeight:'60vh',overflowY:'auto'
          }
        }}
        BackdropProps={{sx:{position:'absolute',inset:0,backgroundColor:'rgba(0,0,0,0.45)'},
        onWheel:(e) => e.preventDefault(),
        onTouchMove:(e) => e.preventDefault(),}}
      >
        <Box sx={{ p: 0.5, textAlign: 'center' ,fontSize: '13px'}}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'text.secondary',m:1 }}>
                {['포스트', '공지'].includes(title) ? title : `${title}글`}
                </Typography>
            <IconButton onClick={() => setOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>

          <Button fullWidth color="inherit"
          sx={{ fontSize: '13px'}} 
          onClick={loginId ? shareBoard : () => {
                setRfModalType('loginAlert');
                setRfModalOpen(true);
          }}>
            {['포스트', '공지'].includes(title) ? `${title} 공유` : `${title}글 공유`}
          </Button>

          <Divider />

          <Button fullWidth disableRipple
            sx={{ 
                py:1, color: 'error.main', fontSize: '13px'
            }}
            onClick={isLoggedIn ? handleReport : () => {
              setRfModalType('loginAlert')
              setRfModalOpen(true)
            }}>
              신고
          </Button>

            {loginId && writerId && loginId === writerId && (
                <>
                    <Divider />
                    
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.5}}>

                        <Button fullWidth disableRipple
                            sx={{color: 'primary.main',fontSize: '13px'}}
                            onClick={editModalOpen}>
                            수정
                        </Button>

                        <Button fullWidth disableRipple
                            sx={{color:'error.main', fontSize:'13px'}} onClick={boardDelete}>
                            삭제
                        </Button>
                    </Box>
                </>
            )}

        {rfModalType === 'loginAlert' && (
          <LoginAlertModal
            open={rfModalOpen}
            onClose={() => setRfModalOpen(false)}
          />
        )}   

        </Box>
      </Dialog>
    </>
  );
};

export default CommunityHeader;
