import React, { useContext, useState } from 'react';
import BoardItem from './BoardItem';
import MateItem from './MateItem';
import { BoardContext } from './BoardContext';
import { useNavigate } from 'react-router-dom';
import { getImages, getOneBoard } from '../../service/boardService';
import { Box, Divider } from '@mui/material';

const BoardList = ({cat}) => {

    const {boardList} = useContext(BoardContext)
    const navigate = useNavigate()

    const {setNumBrd} = useContext(BoardContext)
    const handleClick = (numBrd) => {
        navigate(`/community/${numBrd}`)
    }

    return (
        <Box>
            {
                cat==='mate' ?
                boardList.filter(item=>(item.boardType===cat&&!item.hidden)).map((item,index) =>
                    <React.Fragment key={item.numBrd}>
                        <MateItem item={item} onClick={() => handleClick(item.numBrd)}/>
                        {index < boardList.length -1 && (
                            <Divider sx={{borderColor:'#d8d8d8'}}/>
                        )}
                    </React.Fragment>)
                     : 
                boardList.filter(item=>(item.boardType!=='mate'&&!item.hidden)).map((item,index) =>
                    <React.Fragment key={item.numBrd}>
                        <BoardItem key={item.numBrd} item={item} onClick={() => handleClick(item.numBrd)}/>
                        {index < boardList.length -1 && (
                            <Divider sx={{borderColor:'#d8d8d8'}}/>
                        )}
                    </React.Fragment>)
            }
        </Box>
    );
};

export default BoardList;