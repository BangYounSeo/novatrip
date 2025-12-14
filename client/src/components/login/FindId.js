import React, { useState } from 'react';
import axios from 'axios';
import './findUser.css'

const FindId = () => {
    const [form, setForm] = useState({ name: '', email: '' });
    const [result, setResult] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('/api/find-id', form);
            setResult(`${res.data.message}`);
        } catch (err) {
            if (err.response) {
                setResult(err.response.data.message);
            } else {
                setResult('서버 연결 실패');
            }
        }
    };

    return (
        <div className='findid-container'>
            <h2>아이디 찾기</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="이름" onChange={handleChange} required />
                <input name="email" placeholder="이메일" type="email" onChange={handleChange} required />
                <button type="submit">아이디 찾기</button>
            </form>
            {result && <p>{result}</p>}
        </div>
    );
};

export default FindId;
