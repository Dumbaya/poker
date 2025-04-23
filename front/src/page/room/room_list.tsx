import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import RoomCreateModal from "./CreateRoomModal";

interface Room {
    room_id: string;
    room_title: string;
    host_nickname: string;
    current_player: number;
    max_player: number;
}

function Room_list() {
    const navigate = useNavigate();
    const [search_room, setSearch_room] = useState<string>('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [sortOption, setSortOption] = useState<'title' | 'created' | 'player'>('title');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        fetch('http://localhost:3000/rooms/get_list')
            .then((res) => res.json())
            .then((data) => {
                console.log('받은 방 리스트:', data);
                setRooms(data);
                setFilteredRooms(data);
            });
    };

    useEffect(() => {
        const keyword = search_room.toLowerCase().trim();

        if (keyword === '') {
            setFilteredRooms(rooms);
        } else {
            const filtered = rooms.filter((room) => {
                const title = room.room_title.toLowerCase();
                return title.includes(keyword);
            });
            setFilteredRooms(filtered);
        }
    }, [search_room, rooms]);

    const sortedRooms = [...filteredRooms].sort((a, b) => {
        if (sortOption === 'title') return a.room_title.localeCompare(b.room_title);
        if (sortOption === 'player') return b.current_player - a.current_player;
        if (sortOption === 'created') return a.room_id.localeCompare(b.room_id);
        return 0;
    });

    const handleRoomCreate = (room_id: string) => {
        fetchRooms();
        navigate(`/rooms/${room_id}`);
    }

    const handleRoomEnter = async (room_id: string) => {
        try{
            console.log('[handleRoomEnter] room_id:', room_id);
            const sessionToken = sessionStorage.getItem('sessionToken');

            if (!sessionToken) {
                alert('세션 토큰이 없습니다. 로그인 상태를 확인하세요.');
                return;
            }

            const res = await fetch(`http://localhost:3000/rooms/enter/${room_id}`, {
                method: "PATCH",
                headers: {
                    'Authorization': sessionToken
                },
            })
            const data = await res.json();

            if (res.ok) {
                navigate(`/rooms/${room_id}`);
            } else {
                alert(data.message || '입장 실패');
            }
        } catch (err) {
            console.error(err);
            alert('서버 오류로 입장 실패');
        }
    }

    return(
        <div>
            <input type="text" onChange={(e) => setSearch_room(e.target.value)} value={search_room} placeholder={'방 검색하기'}/>
            <button onClick={fetchRooms}>새로고침</button>
            <select onChange={(e) => setSortOption(e.target.value as any)}>
                <option value="title">이름 순</option>
                <option value="created">생성 순</option>
                <option value="player">인원 많은 순</option>
            </select>
            <button onClick={() => setShowModal(true)}>방 만들기</button>

            {showModal && (
                <RoomCreateModal onClose={() => setShowModal(false)} onRoomCreated={handleRoomCreate} />
            )}

            <ul>
                {sortedRooms.map((room) => (
                    <li key={room.room_id}>
                        <span>
                        {room.room_title} - {room.current_player}/{room.max_player} - {room.host_nickname}
                        </span>
                        <button
                            disabled={room.current_player >= room.max_player}
                            onClick={() => handleRoomEnter(room.room_id)}
                        >
                            {room.current_player >= room.max_player ? '입장 불가' : '입장'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Room_list;