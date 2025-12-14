import React, { useState } from 'react';
import axios from 'axios';
import './findUser.css'

const FindPassword = () => {
    const [form, setForm] = useState({ userId: '', email: '' });
    const [result, setResult] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/find-password', form);
            setResult(res.data.message);
        } catch (err) {
            setResult(err.response?.data?.message || '서버 오류');
        }
    };

    return (
        <div className='findid-container'>
            <h2>비밀번호 찾기</h2>
            <form onSubmit={handleSubmit}>
                <input name="userId" placeholder="아이디" onChange={handleChange} required />
                <input name="email" placeholder="이메일" type="email" onChange={handleChange} required />
                <button type="submit">임시 비밀번호 발급</button>
            </form>
            {result && <p>{result}</p>}
        </div>
    );
};

export default FindPassword;
