import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Sign_up() {
    const navigate = useNavigate();
    const [id, setID] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [nickname, setNickname] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = {
            user_id: id,
            user_password: password,
            user_nickname: nickname,
            user_email: email
        };

        try {
            const res = await fetch('http://localhost:3000/user/sign_up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (res.ok){
                alert('회원가입 되었습니다.');
                navigate('/sign_in');
            } else{
                const error = await res.json();
                alert(`회원가입 실패하였습니다.: ${error.message}`);
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
                <input type="text" value={nickname}
                       onChange={(e)=>setNickname(e.target.value)}
                       placeholder={'닉네임'}/>
                <input type="text" value={email}
                       onChange={(e)=>setEmail(e.target.value)}
                       placeholder={'이메일'}/>
                <button type={'submit'}>회원가입</button>
            </form>
            <button onClick={() => navigate('/sign_in')}>로그인</button>
        </div>
    );
}

export default Sign_up;