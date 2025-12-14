import axios from "axios";

//회원가입
const register = async(user) => {
    try {
        const res = await axios.post('/api/register', user);
        return res.data;
    } catch (error) {
        console.error('회원가입 실패', err);
        throw err;
    }
}

export default { register };

