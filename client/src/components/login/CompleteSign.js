import React from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

const CompleteSign = () => {

    const navigate = useNavigate();
    const goLogin = () => {
        navigate('/login')
        
    }

    const goMain = () => {
        navigate('/')
        
    }

    return (
        <div className='login-container'>
        <div className='login-box'>
            <h2>회원가입을 완료했습니다.</h2>
            <br/>
            <button onClick={goLogin}>
                로그인 하러가기
            </button>
            <br/>
            <br/>
            <button onClick={goMain}>
                메인으로 나가기
            </button>
        </div>
        </div>
    );
};

export default CompleteSign;