import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Sign_in() {
    const navigate = useNavigate();

    const [id, setID] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

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