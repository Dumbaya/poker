import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const token = sessionStorage.getItem('sessionToken');
            if (!token) {
                alert('로그인 후 이용 가능합니다.');
                navigate('/sign_in');
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/user/chk_session", {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (!res.ok) {
                    alert('로그인 후 이용 가능합니다.');
                    navigate('/sign_in');
                }

                const data = await res.json();
                setNickname(data.user_nickname);
            } catch (err) {
                console.log('세션 확인 오류 : ', err);
                navigate('/sign_in');
            }
        };
        checkSession();
    }, [navigate]);

    const logout = async () => {
        const token = sessionStorage.getItem('sessionToken');
        if (token) {
            await fetch("http://localhost:3000/user/sign_out", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
        }

        alert('로그아웃 되었습니다.');
        navigate('/sign_in');
    }

    return(
        <div>
            {
                <>
                    <div>
                        <h1>Homepage</h1>
                        {nickname && <h2>환영합니다, {nickname}님!</h2>}
                    </div>
                    <div>
                        <button onClick={() => logout()}>Logout</button>
                    </div>
                    <div>
                        <button onClick={() => navigate('/room_list')}>게임 시작하기</button>
                    </div>
                </>
            }
        </div>
    );
}

export default Homepage;