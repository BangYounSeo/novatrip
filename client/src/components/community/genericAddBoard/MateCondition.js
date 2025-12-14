import { Box, Button, Chip, IconButton, Modal, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { BoardContext } from '../BoardContext';
import CloseIcon from '@mui/icons-material/Close'

const MateCondition = () => {

    const {subModalOpen,setSubModalOpen,setModalOpen,setForm} = useContext(BoardContext)

    const [selectAge,setSelectAge] = useState([
        {age:20,selected:false},
        {age:30,selected:false},
        {age:40,selected:false},
        {age:50,selected:false},
        {age:60,selected:false},
    ])
    const [selectGender,setSelectGender] = useState([
        {gender:'남자',selected:false},
        {gender:'여자',selected:false},
    ])
    const [selectType,setSelectType] = useState([
        {type:'부분동행',selected:false},
        {type:'식사동행',selected:false},
        {type:'숙박동행',selected:false},
        {type:'전체동행',selected:false},
    ])

    const onSelectedAge = (age) => {
        setSelectAge(prev => prev.map(item => 
            item.age===age ? {...item,selected:!item.selected}:item
        ))
    }

    const onSelectedGender = (gender) => {
        setSelectGender(prev => prev.map(item =>(
        {...item,selected:item.gender===gender}
        )))
    }

    const onSelectedType = (t) => {
        setSelectType(prev => prev.map(item => 
            item.type===t ? {...item,selected:!item.selected}:item
        ))
    }

    const handleDeleteAge = (age) => {
        setSelectAge(prev=>prev.map(item=>
                item.age===age?{...item,selected:!item.selected}:item
            )
        )
    }
    const handleDeleteGender = (gen) => {
        setSelectGender(prev => prev.map(item => 
                item.gender===gen?{...item,selected:!item.selected}:item
            )
        )
    }
    const handleDeleteType = (t) => {
        setSelectType(prev => prev.map(item => 
                item.type===t?{...item,selected:!item.selected}:item
            )
        )
    }


    const onSubmit = () => {

        const ages = selectAge.filter(i => i.selected).map(i => i.age)
        const gender = selectGender.find(i => i.selected)?.gender || ''
        const types = selectType.filter(i => i.selected).map(i => i.type)

        setForm(prev => ({
            ...prev,
            mateCondition:{
                ...prev.mateCondition,
                age:ages,
                gender,
                type:types
            }
        }))

        setSubModalOpen(false)
    }

    const style = {
            position:'absolute',
            inset:0,
            overflow: 'auto',
            display:'flex',
            justifyContent:'center',
            alignItems:'end',
        }
    
        const card = {
            width:'100%',
            maxWidth:660,
            bgcolor:'background.paper',
            p:4,
            borderRadius:2,
            boxShadow:4,
            zIndex:1500,
            position:'relative',
            height:'50vh',
            overflowY:'auto',
            animation:'slideUp 0.3s ease-in-out',
            '& *':{ maxWidth:'100%' }
        }

        const onBack = () => {
            setSubModalOpen(false)
        }

    return (
        <Modal open={subModalOpen} onClose={onBack} keepMounted disablePortal sx={{position:'absolute', inset:0}} BackdropProps={{sx:{backgroundColor:'rgba(0,0,0,0.45)',position:'absolute', inset:0}}}
         aria-labelledby='condition-title' aria-describedby='condition-description'>
            <Box onClick={(e) => e.stopPropagation()} sx={style}>
                <Box sx={card}>
                    <IconButton onClick={onBack} sx={{position:'absolute', top:8, right:8, color:'#bfbfbf'}}><CloseIcon/></IconButton>
                    <Typography id='addMate-title'variant='subtitle2' align='center' gutterBottom>
                    동행 조건 설정
                    </Typography>
                    {
                        selectAge.map(item => item.selected===true?
                            <Chip key={item.age} size='small' label={`${item.age}대`} onDelete={() => handleDeleteAge(item.age)} sx={{mx:0.5}}/>:''
                        )
                    }
                    {
                        selectGender.map(item => item.selected===true?
                            <Chip key={item.gender} size='small' label={item.gender} onDelete={() => handleDeleteGender(item.gender)} sx={{mx:0.5}}/>:''
                        )
                    }
                    {
                        selectType.map(item =>  item.selected===true?
                            <Chip key={item.type} size='small' label={item.type} onDelete={() => handleDeleteType(item.type)} sx={{mx:0.5}}/>:''
                        )
                    }
                    <Typography sx={{mt:1}}>
                    성별
                    </Typography>
                    <p>
                    {
                        selectGender.map((gender) => 
                            <Button variant='outlined' key={gender.gender} sx={{
                                borderColor:gender.selected?'#20b2aa':'#bfbfbf',borderRadius:20,mr:1,color:gender.selected?'#20b2aa':'#bfbfbf', my:0.5}}onClick={() => onSelectedGender(gender.gender)}>{gender.gender}</Button>
                        )
                    } 
                    </p>
                    연령대
                    <p>
                    {
                        selectAge.map((ages) => 
                            <Button variant='outlined' key={ages.age} sx={{
                                borderColor:ages.selected?'#20b2aa':'#bfbfbf',borderRadius:20,mr:1,color:ages.selected?'#20b2aa':'#bfbfbf', my:0.5}}onClick={() => onSelectedAge(ages.age)}>{ages.age}대</Button>
                        )
                    }
                    </p>
                    동행조건
                    <p>
                    {
                        selectType.map(types => 
                            <Button variant='outlined' key={types.type} sx={{
                                borderColor:types.selected?'#20b2aa':'#bfbfbf',borderRadius:20,mr:1,color:types.selected?'#20b2aa':'#bfbfbf', my:0.5}}onClick={() => onSelectedType(types.type)}>{types.type}</Button>
                        )
                    }
                    </p>
                    <Box sx={{display:'flex',justifyContent:'flex-end', mt:2}}>
                    <Button variant='contained' onClick={onSubmit} sx={{color:'white', backgroundColor:'#20b2aa', borderRadius:20,px:3}}>확인</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default MateCondition;