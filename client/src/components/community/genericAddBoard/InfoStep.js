import { Box, Button, Chip, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useContext, useEffect, useState } from "react";
import { BoardContext } from "../BoardContext";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

/** 제목/내용/태그/이미지 스텝 */
function InfoStep({ form, setForm, handleFiles, removeImage, handleChange, imagePreviews,existingImages,imagesToDelete,toggleDeleteExisting}) {
  const [tagInput, setTagInput] = useState('');

  const {setSubModalCat,setSubModalOpen,modalCat} = useContext(BoardContext)

  const hasMateCond = 
    (form.mateCondition?.age?.length || 0) > 0 ||
    !!form.mateCondition?.gender ||
    (form.mateCondition?.type?.length || 0) > 0;

  const onTagKey = (e) => {
    const val = (e.target?.value??'').trim();
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && val) {
      e.preventDefault();
      setForm((p) =>
        p.tags.includes(val) ? p : { ...p, tags: [...p.tags, val] }
      );
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setForm((p) => ({ ...p, tags: p.tags.slice(0, -1) }));
    }
  };

  const handleDeleteAge = (age) => {
      setForm(prev => ({
          ...prev,mateCondition:{
              ...prev.mateCondition,
              age: prev.mateCondition.age.filter(item => item!==age)
          }
      }))
  }

  const handleDeleteGender = (gender) => {
      setForm(prev => ({
          ...prev,mateCondition:{
              ...prev.mateCondition,
              gender: ''
          }
      }))
  }

  const handleDeleteType = (type) => {
      setForm(prev => ({
          ...prev,mateCondition:{
              ...prev.mateCondition,
              type: prev.mateCondition.type.filter(item => item!==type)
          }
      }))
  }

  const onConditionModal = (val) => {
        setSubModalCat(val)
        setSubModalOpen(true)
  }

  const handleDeleteAddress = () => {
    setForm({...form,tourSpot:null})
  }

  const placeholders = {
    mate: {
      subject:'ex) 12월 홍대 카페 투어 같이 다니실 분!',
      content:'ex) 12월에 홍대 근처 카페거리 같이 돌아다니실 분 있나요?'
    },
    default: {
      subject:'서울 여행 중 추천하고 싶은 장소나 후기 제목을 적어 주세요',
      content:'최근 다녀온 서울 여행 후기나 추천 장소를 공유해주세요'
    }
  }

  const place = {
    mate:'동행할 위치 또는 방문할 위치를 선택해 보세요!',
    review:'방문한 곳의 위치를 선택해 보세요!',
    recommend:'추천할 곳의 위치를 선택해 보세요!'
  }

  return (
    <Stack spacing={1}>
      <Typography component="span" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: '2px'}}>
      제목
      <Typography component='span' color="error">*</Typography>
      </Typography>
      <TextField
        size="small"
        name="subject"
        placeholder={
          form.boardType==='mate' ? 
          placeholders.mate.subject:
          placeholders.default.subject
        }
        helperText='(최소 5자 이상/최대 100자 이내)'
        FormHelperTextProps={{
          sx:{color:'#20b2aa'}
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },      // 기본 테두리 제거
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' },
           }
        }}
        value={form.subject}
        onChange={handleChange}
        fullWidth
        required
      />
      <Divider/>
      <Typography component="span" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: '2px'}}>
      내용
      <Typography component='span' color="error">*</Typography>
      </Typography>
      <TextField
        size="small"
        name="content"
        placeholder={
          form.boardType==='mate' ? 
          placeholders.mate.content:
          placeholders.default.content
        }
        helperText='(최소 20자 이상/최대 1000자 이내)'
        FormHelperTextProps={{
          sx:{color:'#20b2aa'}
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },      // 기본 테두리 제거
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' },
           }
        }}
        value={form.content}
        onChange={handleChange}
        fullWidth
        multiline
        required
        minRows={6}
      />
      <Divider/>
      {/* 태그 */}
      <Stack spacing={1}>
        <Typography component="span" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: '2px'}}>태그</Typography>
        <TextField
          size="small"
          value={tagInput}
          sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },      // 기본 테두리 제거
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' },
           }
          }}
          placeholder="태그를 추가해보세요!(입력 후 엔터,쉼표,스페이스로 추가)"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKey}
          fullWidth
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {form.tags.map((t) => (
            <Chip
              key={t}
              label={`# ${t}`}
              onDelete={() =>
                setForm((p) => ({ ...p, tags: p.tags.filter((v) => v !== t) }))
              }
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Stack>
      {modalCat==='mate' &&
      <>
      <Divider sx={{my:2}}/>
      <Stack alignItems='center' justifyContent='space-between' direction='row' sx={{width:'100%', cursor:'pointer'}} onClick={() => onConditionModal('condition')}>
        <Box sx={{minWidth:0}}>
          <Typography variant="body2">동행조건</Typography>
          {!hasMateCond?
            <Typography variant="caption" sx={{color:'#20b2aa',mt:0.5}}>
              원하는 동행의 조건을 설정해 보세요!
            </Typography>
          :
          <Stack direction='row' spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
          {
              form.mateCondition?.age?.map?.(item =>
                  <Chip key={item} size='small' label={`${item}대`} onDelete={(e) => {e.stopPropagation(); handleDeleteAge(item)}} onClick={(e) => e.stopPropagation()}/>
              )
          }
          {
              form.mateCondition?.gender && 
                  <Chip size='small' label={form.mateCondition.gender} onDelete={(e) => {e.stopPropagation();handleDeleteGender(form.mateCondition.gender)}} onClick={(e) => e.stopPropagation()}/>
              
          }
          {
              form.mateCondition?.type?.map?.(item =>
                  <Chip key={item} size='small' label={item} onDelete={(e) =>{e.stopPropagation(); handleDeleteType(item)}} onClick={(e) => e.stopPropagation()}/>
              )
          }
          </Stack>
          }
        </Box>
        <ArrowForwardIosIcon sx={{fontSize:12}}/>
      </Stack>
      </>
      }
      {(form.boardType==='mate' || form.boardType==='review' || form.boardType==='recommend') &&
      <>
      <Divider sx={{my:2}}/>

      <Stack alignItems='center' justifyContent='space-between' direction='row' sx={{width:'100%',cursor:'pointer'}} onClick={() => onConditionModal('spot')}>
          <Box sx={{minWidth:0}}>
            <Typography variant="body2">동행위치</Typography>
            {
              !form.tourSpot?
              <Typography variant="caption" sx={{color:'#20b2aa',mt:0.5}}>
                {place[form.boardType]}
              </Typography>
            : 
              <Stack direction='row' spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                <Chip size='small' label={
                  form.tourSpot?.placeName ||
                  form.tourSpot?.roadAddress ||
                  form.tourSpot?.address ||
                  form.tourSpot?.borough ||
                  '선택된 위치'
                } onDelete={(e) => {e.stopPropagation(); handleDeleteAddress()}}/>
              </Stack>
            }
          </Box>
          <ArrowForwardIosIcon sx={{fontSize:12}}/>
      </Stack>
      </>
      }
      <Divider sx={{my:2}}/>

      {/* 이미지 업로드 & 미리보기 */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          component="label"
          startIcon={<PhotoCamera/>}
          variant="outlined"
        >
          사진 추가
          <input type="file" hidden multiple accept="image/*" onChange={handleFiles} />
        </Button>
        <Typography variant="caption" color="text.secondary">
          최대 10장 권장
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt:1 }}>
        {existingImages.map((img, i) => {
          const marked = imagesToDelete.includes(img._id || img.saveFileName || img.path);
          return (
            <Box key={i} sx={{
              position:'relative', width:88, height:88, borderRadius:2, overflow:'hidden',
              border: marked ? '2px solid #e53935' : '1px solid #eee'
            }}>
              <img src={img.path} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              <Button
                size="small"
                onClick={() => toggleDeleteExisting(i)}
                sx={{ position:'absolute', bottom:2, left:2, fontSize:10, bgcolor:'rgba(0,0,0,0.45)', color:'#fff' }}
              >
                {marked ? '취소' : '삭제'}
              </Button>
            </Box>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {imagePreviews.map((src, i) => (
          <Box key={i} sx={{ position: 'relative', width: 88, height: 88, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton
              size="small"
              onClick={() => removeImage(i)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.45)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

export default InfoStep