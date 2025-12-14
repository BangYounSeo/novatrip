import { Box, Button, Chip, Divider, IconButton, Modal, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { maxWidth, Stack } from '@mui/system';
import React, { useContext, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close'
import { addBoard, getImages, getOneBoard, updateBoard } from '../../service/boardService';
import SpotStep from './genericAddBoard/SpotStep'
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import InfoStep from './genericAddBoard/InfoStep';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import { BoardContext } from './BoardContext';
import LoginAlertModal from '../login/LoginAlertModal';
import { useParams } from 'react-router-dom';

const TYPE_LABEL = {review:'후기', recommend:'추천', info:'정보', free:'자유주제'}
const TOPICS = ['review','recommend','info','free']
const token = localStorage.getItem('token')

const decoded = token ? jwtDecode(token) : null;
const userIdFromToken = decoded?.userId || ''

const AddBoard = ({container}) => {

    const {form,setForm,modalOpen,setModalOpen,isEdit,setIsEdit} = useContext(BoardContext)
    const {numBrd} = useParams()

    const [images,setImages] = useState([])
    const [imagePreviews,setImagePreviews] = useState([])
    const [existingImages,setExistngImages] = useState([])
    const [imagesToDelete,setImagesToDelete] = useState([])

    const [rfModalOpen,setRfModalOpen] = useState(false)
    const [rfModalType,setRfModalType] = useState('')


    const needsSpot = form.boardType==='review' || form.boardType==='recommend'

    const changeInput = (evt) => {
        const {name,value} = evt.target

        setForm(p => ({
            ...p,[name]:value
        }))
    }

    useEffect(() => {
        setForm({
            ...form,boardType:'free'
        }) 
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
                boardType: b.boardType || 'free',
                tourStyle: b.tourStyle || [],
                tourSpot: b.tourSpot || null,
            }))
    
            setExistngImages(imgDoc?.iamges || []);
            setImagePreviews([])
            setImages([])
            })();
    },[isEdit,numBrd,setForm])

    const [tagInput,setTagInput] = useState('')
    const onTagKey = (e) => {
    const v = e.target.value.trim();
        if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && v) {
        e.preventDefault();
        setForm(p => p.tags.includes(v) ? p : { ...p, tags: [...p.tags, v] });
        setTagInput('');
        }
        if (e.key === 'Backspace' && !tagInput && form.tags.length) {
        setForm(p => ({ ...p, tags: p.tags.slice(0, -1) }));
        }
    };

    const removeTag = (tag) => {
        setForm(form => ({
            ...form,tags: form.tags.filter(t => t!==tag)
        }))
    }

    const handleTag = (evt) => {
        const key = evt.key
        const value = tagInput.trim()

        if((key === ' '|| key==='Enter') && value !==''){
            evt.preventDefault();

            setForm(form => 
                form.tags.includes(value)
                 ? form : {...form,tags:[...form.tags,value]}
                
            )
            setTagInput('')
        }

        if(key === 'Backspace' && tagInput==='' && form.tags.length>0){
            setForm(form => ({...form,tags:form.tags.slice(0,-1)}))
        }
    }
    
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

    const valid = useMemo(() => {
        const baseOk = form.subject.trim().length >= 2 && form.content.trim().length >= 20;
        return baseOk;
    }, [form, needsSpot]);


    const onSubmit = async() => {
        const token = localStorage.getItem('token')
        if(!token){
            setRfModalType('loginAlert')
            setRfModalOpen(true)
            return
        }

        try {
            const board ={
                ...form,
                userId: userIdFromToken,
            }
            if(isEdit){
                await updateBoard()
            }else{
                await addBoard(board,images,images,imagesToDelete)
            }

            setImages([])
            imagePreviews.forEach(u => URL.revokeObjectURL(u))
            setImagePreviews([])
            setForm({
            numBrd:'',userId:'',subject:'',content:'',tags:[],boardType:'free',
            tourStyle:[],startDate:null,endDate:null,tourSpot:null,mateCondition:{
                age:[],gender:'',type:[]
            }})
            setIsEdit(false)
            setModalOpen(false)
            setForm({
            numBrd:'',userId:'',subject:'',content:'',tags:[],boardType:'free',
            tourStyle:[],startDate:null,endDate:null,tourSpot:null,mateCondition:{
                age:[],gender:'',type:[]
            }})

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
        <Modal open={modalOpen} onClose={closeModal} keepMounted disablePortal container={container} sx={{position:'absolute', inset:0}} BackdropProps={{sx:{backgroundColor:'rgba(0,0,0,0.45)',position:'absolute', inset:0,maxHeight:'50%',minHeight:0,bottom:0}}}
         aria-labelledby='addPost-title' aria-describedby='addPost-description'>
            <Box onClick={(e) => e.stopPropagation()} sx={style}>
                <Box sx={card}>
                <IconButton onClick={closeModal} sx={{position:'absolute', top:8, right:8, color:'#bfbfbf'}}><CloseIcon/></IconButton>
                <Typography id='addMate-title'variant='subtitle2' align='center' gutterBottom>
                    포스트 {isEdit? '수정':'작성'}
                </Typography>
                <Stack spacing={1} sx={{mb:2}}>
                    <Typography variant="body2" color="text.secondary">
                    주제선택
                    </Typography>
                    <ToggleButtonGroup
                        value={form.boardType}
                        exclusive
                        onChange={(_, v) => v && setForm(p => ({ ...p, boardType:v }))}
                        size="small"
                        aria-label="board-type"
                        sx={{gap:2}}
                    >
                        {TOPICS.map(t => (
                        <ToggleButton key={t} value={t} sx={{
                            borderRadius:'20px !important',
                            border:'1.5px solid #bfbfbf !important',
                            color:'#666',
                            bgcolor:'white',
                            fontWeight:500,
                            px:2, py:0.5,
                            '&.Mui-selected':{
                                color:'#20b2aa',
                                borderColor:'#20b2aa !important',
                                bgcolor:'white'
                            },
                            '&.Mui-selected:hover': {
                                bgcolor:'#f8f8f8'
                            }
                        }}>{TYPE_LABEL[t]}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
                {/* 3) 공통 입력: 제목/내용/태그/이미지 */}
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

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={closeModal}>취소</Button>
                <Button
                    variant="contained"
                    disabled={!valid}
                    onClick={onSubmit}
                    sx={{ bgcolor:'#20b2aa', '&:hover':{ bgcolor:'#1d9a97' } }}
                >
                    {isEdit?'수정':'등록'}
                </Button>
                {rfModalType === 'loginAlert' && (
                   <LoginAlertModal
                    open={rfModalOpen}
                    onClose={()=>setRfModalOpen(false)}
                    />
                )}
                </Stack>
            </Box>
            </Box>
        </Modal>
    );

};

export default AddBoard;