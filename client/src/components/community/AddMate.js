import { Backdrop, Box, Button, Chip, Divider, IconButton, Modal, Stack, styled, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useContext, useEffect, useMemo } from 'react';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close'
import { DateCalendar, DatePicker, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { addBoard, getImages, getOneBoard, getRandomImage, updateBoard } from '../../service/boardService';
import { isAfter, isBefore, isSameDay, isWithinInterval } from 'date-fns';
import InfoStep from './genericAddBoard/InfoStep'
import {jwtDecode} from 'jwt-decode'
import LoginAlertModal from '../login/LoginAlertModal';
import { BoardContext } from './BoardContext';
import { useParams } from 'react-router-dom';

const steps = ['여행 일정선택','글 정보 입력']

const AddMate = ({container}) => {

    const {numBrd} = useParams()
    const [activeStep,setActiveStep] = useState(0)

    const [startDate,setStartDate] = useState(null)
    const [endDate,setEndDate] = useState(null)
    const [images,setImages] = useState([])
    const [imagePreviews,setImagePreviews] = useState([])
    const [rfModalOpen,setRfModalOpen] = useState(false)
    const [rfModalType,setRfModalType] = useState('')
    const [existingImages,setExistngImages] = useState([])
    const [imagesToDelete,setImagesToDelete] = useState([])
    const {form,setForm,modalOpen,setModalOpen,isEdit,setIsEdit} = useContext(BoardContext)

    const token = localStorage.getItem('token')
    let userId = ''
    if(token){
        const decoded = jwtDecode(token)
        userId = decoded.userId
    }

    const changeInput = (evt) => {
        const {name,value} = evt.target

        setForm({
            ...form,[name]:value
        })
    }

    useEffect(() => {
        setForm({...form,boardType:'mate'})

        if(!isEdit) return;

        (async() => {
            const [b,imgDoc] = await Promise.all([
                getOneBoard(numBrd),
                getImages(numBrd)
            ])
        

        setForm(p => ({
            ...p,
            subject:b.subject || '',
            content: b.content || '',
            tags: b.tags || [],
            boardType: b.boardType || 'mate',
            tourStyle: b.tourStyle || [],
            startDate: b.startDate ? new Date(b.startDate) : null,
            endDate: b.endDate ? new Date(b.endDate) : null,
            tourSpot: b.tourSpot || null,
            mateCondition: b.mateCondition || { age:[], gender:'', type:[] }
        }))

        setStartDate(b.startDate? new Date(b.startDate):null)
        setEndDate(b.endDate? new Date(b.endDate):null)
        setExistngImages(imgDoc?.images || []);
        setImagePreviews([])
        setImages([])
        })();
    },[isEdit,numBrd])

    const handleChipKey = (e,field,setFieldInput) => {
        const key = e.key;
        const value = e.target.value.trim();
        if ((key === 'Enter' || key === ',' || key === ' ') && value) {
            e.preventDefault();
            setForm((p) =>
            p[field].includes(value) ? p : { ...p, [field]: [...p[field], value] }
            );
            setFieldInput('');
        }
        if (key === 'Backspace' && !e.target.value && form[field].length > 0) {
            setForm((p) => ({ ...p, [field]: p[field].slice(0, -1) }));
        }
    }

    const removeChip = (field,value) => {
        setForm(p => ({
            ...p,[field]: p[field].filter(t => t!==value)
        }))
    }

    const handleDateChange = (day) => {
        if(!startDate || (startDate&&endDate)){
            setStartDate(day)
            setEndDate(null)
            setForm(prev => ({...prev,startDate:day,endDate:null}))
        }else if(isBefore(day, form.startDate)){
            setStartDate(day)
            setForm(prev => ({...prev,startDate:day}))
        }else {
            setEndDate(day)
            setForm(prev => ({...prev,endDate:day}))
        }
    }

     // range day 스타일
        const RangePickersDay = styled(PickersDay, {
        shouldForwardProp: (prop) =>
            prop !== 'inRange' && prop !== 'isStart' && prop !== 'isEnd',
        })(({ theme, inRange, isStart, isEnd }) => ({
        // 기본은 네모 -> 구간은 연결감 주기 위해 라운드 제거
        borderRadius: 0,
        margin:0,
        '&.MuiPickersDay-outsideCurrentMonth':{
            opacity:0.6,
            margin:0
        },
        // 구간 내부 색
        ...(inRange && {
            backgroundColor: 'rgba(32, 178, 171, 0.2)', // #20b2aa 연한색
        }),
        // 시작/끝 날짜(동그랗게)
        ...(isStart && {
            borderTopLeftRadius: '25%',
            borderBottomLeftRadius: '25%',
            backgroundColor: '#20b2aa',
            color: theme.palette.common.black,
        }),
        ...(isEnd && {
            borderTopRightRadius: '25%',
            borderBottomRightRadius: '25%',
            backgroundColor: '#20b2aa',
            color: theme.palette.common.black,
        }),
        ...((isStart || isEnd) && {
            '&.Mui-selected':{
                backgroundColor: '#20b2aa',
                color: '#fff',
                '&:hover,&:focus': { backgroundColor: '#1d9a97' },
            }
        }),
        // hover
        '&:hover': {
            backgroundColor: '#20b2aa',
        },
        }));
    
        // DateCalendar에 꽂아줄 Day 컴포넌트
        function RangeDay(props) {
        const { day, outsideCurrentMonth, startDate, endDate, ...other } = props;
    
        const d = day?.toDate ? day.toDate() : day; // day-fns 호환 안전 처리
    
        const isStart =
            startDate && isSameDay(d, startDate);
        const isEnd =
            endDate && isSameDay(d, endDate);
    
        const inRange =
            startDate &&
            endDate &&
            isWithinInterval(d, {
            start: isBefore(startDate, endDate) ? startDate : endDate,
            end: isAfter(endDate, startDate) ? endDate : startDate,
            });
    
        return (
            <RangePickersDay
            {...other}
            day={day}
            outsideCurrentMonth={outsideCurrentMonth}
            // MUI 내부 selected 스타일은 시작/끝에만 주기
            selected={Boolean(isStart || isEnd)}
            inRange={Boolean(inRange)}
            isStart={Boolean(isStart)}
            isEnd={Boolean(isEnd)}
            disableMargin
            sx={{ px: 1.5 }}
            />
        );
        }

     // 이미지 선택 & 미리보기
    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const next = files;
        setImages(prev => [...prev,...next])
        const urls = next.map(f => URL.createObjectURL(f))
        setImagePreviews(prev => [...prev,...urls])

        e.target.value=''
    };
    const removeImage = (idx) => {
        setImages(prev => prev.filter((_,i) => i !== idx))

        setImagePreviews(prev => {
            if(prev[idx]) URL.revokeObjectURL(prev[idx])
            return prev.filter((_,i) => i !==idx)
        })
    };
    const toggleDeleteExisting = (idx) => {
        const target = existingImages[idx];
        const pathOrId = target._id || target.saveFileName || target.path;
        setImagesToDelete(prev =>
            prev.includes(pathOrId) ? prev.filter(v => v !== pathOrId) : [...prev, pathOrId]
            );
    };

     const stepValid = useMemo(() => {
        const f = form??{};

        if (activeStep === 0) return !!f.startDate && !!f.endDate;
        if (activeStep === 1) return f.subject.trim().length >= 5 && f.subject.trim().length <=100 && f.content.trim().length >= 20;
        return false;
    }, [activeStep, form]);

    const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    const back = () => setActiveStep((s) => Math.max(s - 1, 0));

    const onSubmit = async() => {
        if(!token){
            setRfModalType('loginAlert')
            setRfModalOpen(true)
            return
        }

        const board = {
            ...form,userId:userId
        }

        try {
            let defaultImageUrl = null
            if(!images || images.length===0){
                try{
                    const { url } = await getRandomImage()
                    defaultImageUrl = url
                }catch(e){
                    console.error('기본 이미지 가져오기 실패:', e)
                }
            }

            if(isEdit){
                await updateBoard(numBrd,board,images,imagesToDelete)
            }else{
                await addBoard(board,images,defaultImageUrl)
            }

            setImages([])
            setForm({
            numBrd:'',userId:'',subject:'',content:'',tags:[],boardType:'free',
            tourStyle:[],startDate:null,endDate:null,tourSpot:null,mateCondition:{
                age:[],gender:'',type:[]
            }})
            imagePreviews.forEach(u => URL.revokeObjectURL(u))
            setImagePreviews([])
            setIsEdit(false)
            setModalOpen(false)
            
        } catch (error) {
           const status = error?.response?.status
           const msg = error?.response?.data?.message
           if(status === 403 && msg) {
            alert(msg);
           }else if(status === 401){
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
           }else{
            alert(msg || '댓글 등록 중 오류가 발생했습니다.')
           }

        }
        
    }

    const closeModal = () => {
        setModalOpen(false)
        setForm({
            numBrd:'',userId:'',subject:'',content:'',tags:[],boardType:'free',
            tourStyle:[],startDate:null,endDate:null,tourSpot:null,mateCondition:{
                age:[],gender:'',type:[]
            }})
    }

    const style = {
        position:'absolute',
        inset:0,
        overflow: 'auto',
        display:'flex',
        justifyContent:'center',
        alignItems:'end'
    }

    const card = {
        width:'100%',
        maxWidth:660,
        bgcolor:'background.paper',
        justifyContent:'center',
        p:4,
        boxShadow:4,
        zIndex:1301,
        position:'relative',
        height:'50vh',
        overflowY:'auto',
        animation:'slideUp 0.3s ease',
        borderRadius:'12px 12px 0 0',
        bottom:0,
        '& *':{ maxWidth:'100%' }
    }

    return (
        <Modal open={modalOpen} onClose={closeModal} keepMounted disablePortal container={container} sx={{position:'absolute', inset:0}} BackdropProps={{sx:{backgroundColor:'rgba(0,0,0,0.45)',position:'absolute', inset:0,}}}
         aria-labelledby='addMate-title' aria-describedby='addMate-description'>
            <Box onClick={(e) => e.stopPropagation()} sx={style}>
                <Box sx={card}>
                <IconButton onClick={closeModal} sx={{position:'absolute', top:8, right:8, color:'#bfbfbf'}}><CloseIcon/></IconButton>
                <Typography id='addMate-title'variant='subtitle2' align='center' gutterBottom>
                    {isEdit? '동행 모집 글 수정':'동행 모집 글 작성'}
                </Typography>

                    {/* --- Step 0: 일정 --- */}
                    {activeStep === 0 && (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                            여행일정 또는 동행일정을 설정해 주세요
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent='center'>
                            <DateCalendar
                            value={null}
                            onChange={handleDateChange}
                            showDaysOutsideCurrentMonth
                            slots={{day: RangeDay}}
                            slotProps={{day:{startDate,endDate},calendarHeader:{format: 'yyyy년 MM월'}}}
                            minDate={new Date()}
                            sx={{mx:'auto',minWidth:360,
                                '& .MuiDayCalendar-root': {
                                    '--DayCalendar-headerHeight':'32px',
                                    '--DayCalendar-rowHeight':'44px'
                                },
                                '& .MuiDayCalendar-monthContainer':{
                                    height:'auto',
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    width:44,
                                    height:44,
                                    margin:0,
                                    fontSize:'0.85rem',
                                    display:'inline-flex',
                                    alignItems:'center',
                                    justifyContent:'center',
                                },
                                '& .MuiDayCalendar-weekContainer':{
                                    margin:0,
                                },
                                '& .MuiPickersDay-root': {
                                    width: 44,
                                    height: 44,
                                    fontSize: '0.85rem'
                                }
                            }}
                            />
                        </Stack>
                        </Stack>
                    </LocalizationProvider>
                    )}

                    {/* --- Step 1: 장소 --- */}

                    {/* --- Step 2: 글 정보 --- */}
                    {activeStep === 1 && (
                    <InfoStep
                        form={form}
                        setForm={setForm}
                        handleFiles={handleFiles}
                        removeImage={removeImage}
                        handleChange={changeInput}
                        imagePreviews={imagePreviews}
                        existingImages={existingImages}
                        imagesToDelete={imagesToDelete}
                        toggleDeleteExisting={toggleDeleteExisting}
                    />
                    )}
                    

                    <Divider sx={{ my: 2 }} />

                    {/* 하단 버튼들 */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button onClick={closeModal}>취소</Button>
                    <Button disabled={activeStep === 0} onClick={back}>
                        이전
                    </Button>
                    {activeStep < steps.length - 1 ? (
                        <Button
                        variant="contained"
                        onClick={next}
                        disabled={!stepValid}
                        sx={{ bgcolor: '#20b2aa', '&:hover': { bgcolor: '#1d9a97' } }}
                        >
                        다음
                        </Button>
                    ) : (
                        <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={!stepValid}
                        sx={{ bgcolor: '#20b2aa', '&:hover': { bgcolor: '#1d9a97' } }}
                        >
                        {isEdit?'수정':'등록'}
                        </Button>
                    )}
                    {rfModalType === 'loginAlert' && (
                    <LoginAlertModal
                        open={rfModalOpen}
                        onClose={() => setRfModalOpen(false)}
                    />
                    )}                      
                    </Stack>
            </Box>
            </Box>
            
        </Modal>
    );

};





const TOUR_STYLES = [
  '맛집탐방','카페투어','사진/인스타',
  '힐링/산책','온천·스파','호캉스',
  '문화·역사','전시·공연·축제',
  '쇼핑','야경감상','드라이브',
  '등산·트레킹','바다·서핑','캠핑·글램핑','액티브·레저',
  '아이와 함께','반려동물 동반','당일치기'
];

function TourStylePicker({value,onChange,max=5}) {
  const handleChange = (_,next) => {
    if(next.length > max) return;
    onChange(next)
  }

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        여행 스타일을 선택하세요. (최대 {max}개)
      </Typography>
      <ToggleButtonGroup
        value={value}
        onChange={handleChange}
        aria-label="tour-style"
        size="small"
      >
        <Box sx={{
          display:'grid',
          gridAutoFlow: 'column',              // 좌→우가 아니라 "위→아래→오른쪽"으로 채움
          gridTemplateRows: 'repeat(3, 1fr)',  // 항상 2줄
          gridAutoColumns: 'minmax(88px, 1fr)',// 각 칸 최소 너비
          gap: 1,
          alignItems: 'stretch',
          '& .MuiToggleButton-root': {
            borderRadius: 2,
            px: 1.2,
            py: 0.6,
          },
        }}>
        {TOUR_STYLES.map(s => (
          <ToggleButton key={s} value={s}>{s}</ToggleButton>
        ))}
        </Box>
      </ToggleButtonGroup>

      {/* 선택 결과 미리보기 */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {value.map(v => (
          <Chip key={v} label={v} onDelete={() => onChange(value.filter(x => x!==v))}/>
        ))}
      </Stack>
    </Stack>
  )


}

export default AddMate;