import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import RoomCreateModal from "./CreateRoomModal";

interface Room_in {
    room_id: string;
    room_title: string;
    host_nickname: string;
    current_player: number;
    max_player: number;
}

function Room_in() {
    const navigate = useNavigate();
    const [room_id, setRoom_id] = useState<string>('');
    const [user_nickname, setUser_nickname] = useState<string>('');
    const [userList, setUserList] = useState<string[]>([]);
    const [message, setMessage] = useState<string>('');
    const [chat, setChat] = useState<{ nickname: string; message: string; timestamp: string; }[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const getNickname = async () => {
            try{
                const sessionToken = sessionStorage.getItem('sessionToken');

                if (!sessionToken) {
                    alert('세션 토큰이 없습니다. 로그인 상태를 확인하세요.');
                    return;
                }

                const res = await fetch(`http://localhost:3000/user/chk_session`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    },
                });

                const data = await res.json();
                console.log(data);
                setUser_nickname(data.user_nickname);
            } catch (err) {
                console.error('닉네임 호출 실패:', err);
                alert('서버와 통신에 실패했습니다.');
            }
        }
        getNickname();
    }, []);

    useEffect(() => {
        if (!user_nickname) return;

        const urlParts = window.location.pathname.split('/');
        const id = urlParts[urlParts.length - 1];
        setRoom_id(id);

        console.log(user_nickname);
        const newSocket = io('http://localhost:3000', {
            query: { nickname: user_nickname },
        });
        setSocket(newSocket);

        newSocket.emit("joinRoom", id);

        newSocket.on("userList", (userList: string[]) => {
            setUserList(userList);
        });

        newSocket.on("chatMessage", (data: { nickname: string; message: string; timestamp: string }) => {
            setChat((prevChat) => [...prevChat, {
                nickname: data.nickname,
                message: data.message,
                timestamp: data.timestamp,
            },]);
        });

        return () => {
            if (newSocket) {
                newSocket.emit("leaveRoom", id);
                newSocket.off("userList");
                newSocket.off("chatMessage");
                newSocket.disconnect();
            }
        };
    }, [user_nickname]);

    useEffect(() => {
        if (room_id && socket) {
            fetchRoomUsers(room_id);
        }
    }, [room_id, socket]);

    const deleteRoom = async (room_id: string) => {
        try{
            const sessionToken = sessionStorage.getItem('sessionToken');

            if (!sessionToken) {
                alert('세션 토큰이 없습니다. 로그인 상태를 확인하세요.');
                return;
            }

            const res = await fetch(`http://localhost:3000/rooms/delete/${room_id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': sessionToken
                },
            });

            const data = await res.json();

            if (data.flag === 'success') {
                alert(data.message);
                navigate('/room_list');
            } else {
                alert('방 삭제 실패: ' + data.message);
            }
        } catch (err) {
            console.error('삭제 요청 실패:', err);
            alert('서버와 통신에 실패했습니다.');
        }
    }

    const sendMessage = () => {
        if (message.trim() && socket) {
            socket.emit("sendChat", { roomId: room_id, message });
            setMessage('');
        }
    };

    const startGame = () => {
        if (socket) {
            socket.emit("startGame", room_id);
            alert('곧 게임을 시작합니다.');
        }
    };

    const fetchRoomUsers = async (roomId: string) => {
        try {
            const res = await fetch(`http://localhost:3000/rooms/users/${roomId}`);
            const data = await res.json();
            setUserList(data.users); // 유저 리스트 저장
        } catch (err) {
            console.error('유저 리스트 가져오기 실패', err);
        }
    };

    return(
        <div>
            <h2>방 아이디: {room_id}</h2>

            <div style={{ marginBottom: "20px" }}>
                <h3>참가자 목록</h3>
                <ul>
                    {userList.map((user, index) => (
                        <li key={index}>{user}</li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>채팅</h3>
                <div style={{ border: "1px solid #ccc", height: "200px", overflowY: "auto", padding: "10px" }}>
                    {chat.map((c, idx) => (
                        <div key={idx}><strong>{c.nickname} [{new Date(c.timestamp).toLocaleString()}]:</strong> {c.message}</div>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                    placeholder="메시지 입력하세요."
                    style={{ width: "80%", marginRight: "10px" }}
                />
                <button onClick={sendMessage}>보내기</button>
            </div>

            <div style={{ marginTop: "20px" }}>
                <button onClick={() => deleteRoom(room_id)}>방 나가기</button>
                <button onClick={() => startGame()}>게임 시작하기</button>
            </div>
        </div>
    );
}

export default Room_in;