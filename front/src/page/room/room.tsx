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
    const [search_room, setSearch_room] = useState<string>('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

    const fetchRooms = () => {
        fetch('http://localhost:3000/rooms/get_list')
            .then((res) => res.json())
            .then((data) => {
                setRooms(data);
                setFilteredRooms(data);
            });
    };

    useEffect(() => {
        const filteredRooms = rooms.filter((room) =>
            room.room_title.toLowerCase().includes(search_room.toLowerCase()));
        setFilteredRooms(filteredRooms);
    }, [search_room, rooms]);

    const handleRoomCreate = (room_id: string) => {
        fetchRooms();
        navigate(`/rooms/${room_id}`);
    }

    return(
        <div>
            test
        </div>
    );
}

export default Room;