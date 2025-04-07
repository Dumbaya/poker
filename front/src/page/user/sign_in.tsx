import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Sign_in() {
    const navigate = useNavigate();

    const [id, setID] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = {
            user_id: id,
            user_password: password
        };

        try {
            const res = await fetch('http://localhost:3000/user/sign_in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (res.ok){
                const data = await res.json();
                sessionStorage.setItem('sessionToken', data.token);

                alert('로그인 성공!');
                navigate('/');
            } else{
                const error = await res.json();
                alert(`로그인 실패하였습니다.: ${error.message}`);
            }
        } catch (err) {
            console.log('Error', err);
            alert('서버와 통신에 실패했습니다.');
        }
    };

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={id}
                       onChange={(e)=>setID(e.target.value)}
                       placeholder={'아이디'}/>
                <input type="password" value={password}
                       onChange={(e)=>setPassword(e.target.value)}
                       placeholder={'비밀번호'}/>
                <button type={'submit'}>로그인</button>
            </form>
            <button onClick={() => navigate('/sign_up')}>회원가입</button>
        </div>
    );
}

export default Sign_in;