import React, { createContext, useEffect, useMemo, useState } from 'react';
import boardService, { addBoard, getBoard, getImages, getOneBoard } from '../../service/boardService';
import axios from 'axios';

export const BoardContext = createContext()

const BoardProvider = ({children}) => {

    const [boardList,setBoardList] = useState([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState('')
    const [skip,setSkip] = useState(0)
    const [modalOpen,setModalOpen] = useState(false)
    const [modalCat,setModalCat] = useState('')
    const [subModalOpen,setSubModalOpen] = useState(false)
    const [subModalCat,setSubModalCat] = useState('')
    const [isEdit,setIsEdit] = useState(false)
    const limit = 5
    const [form,setForm] = useState({
            numBrd:'',userId:'',subject:'',content:'',tags:[],boardType:'free',
            tourStyle:[],startDate:null,endDate:null,tourSpot:null,mateCondition:{
                age:[],gender:'',type:[]
            }
        })
    
    const onListData = async(params) => {
        try{
            const boardListData = await getBoard(params)

            return {boardListData}
        }catch(e) {
            setError(e?.message || '목록을 불러오지 못했습니다.')
        }
    }

    const value = useMemo(() => ({
        boardList,setBoardList,loading,error,skip,setSkip,limit,setLoading,onListData,form,setForm,modalOpen,modalCat,setModalOpen,setModalCat,subModalOpen,subModalCat,setSubModalCat,setSubModalOpen,isEdit,setIsEdit
    }),[boardList,loading,error,skip,limit,form,modalCat,modalOpen,subModalCat,subModalOpen,isEdit])

    return (
        <BoardContext.Provider value={value}>
            {children}
        </BoardContext.Provider>
    );
};

export default BoardProvider;