import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import RoomCreateModal from "./CreateRoomModal";

interface Room {
    room_id: string;
    room_title: string;
    host_nickname: string;
    current_player: number;
    max_player: number;
}

function Room() {
    const navigate = useNavigate();
    const [room_id, setRoom_id] = useState<string>('');

    useEffect(() => {
        // 예시: URL에서 roomId를 가져올 수 있다면
        const urlParts = window.location.pathname.split('/');
        const id = urlParts[urlParts.length - 1];
        setRoom_id(id);
    }, []);


    const deleteRoom = async (room_id: string) => {
        try{
            const res = await fetch(`http://localhost:3000/rooms/delete/${room_id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                navigate('/room_list');
            } else {
                alert('방 삭제 실패: ' + data.message);
            }
        } catch (err) {
            console.error('삭제 요청 실패:', err);
            alert('서버와 통신에 실패했습니다.');
        }
    }

    return(
        <div>
            <button onClick={() => deleteRoom(room_id)}>방 나가기</button>
        </div>
    );
}

export default Room;