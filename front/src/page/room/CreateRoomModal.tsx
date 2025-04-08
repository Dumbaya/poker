import React, { useState } from 'react';

interface RoomCreateModalProps {
    onClose: () => void;
    onRoomCreated: (roomId: string) => void;
}

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({ onClose, onRoomCreated }) => {
    const [roomTitle, setRoomTitle] = useState('');
    const [maxPlayer, setMaxPlayer] = useState(4);
    const [isLock, setIsLock] = useState(false);
    const [password, setPassword] = useState('');

    const handleCreateRoom = async () => {
        const res = await fetch('http://localhost:3000/rooms/create_room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('sessionToken') || '',
            },
            body: JSON.stringify({
                room_title: roomTitle,
                max_player: maxPlayer,
                is_locked: isLock,
                password: isLock ? password : '',
            }),
        });

        if (res.ok) {
            const data = await res.json();
            onRoomCreated(data.room_id);
            onClose();
        } else {
            alert('방 생성에 실패했습니다.');
        }
    };

    const chk_maxPlayer = async (e: number) => {
        const max = Math.max(2, Math.min(6, e));
        setMaxPlayer(max);
    }

    return (
        <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white', padding: 20, borderRadius: 10, zIndex: 1000,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}>
            <h2>방 만들기</h2>
            <input type="text" placeholder="방 제목" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} />
            <input type="number" placeholder="최대 인원" value={maxPlayer} onChange={e => chk_maxPlayer(Number(e.target.value))}/>
            <label>
                <input type="checkbox" checked={isLock} onChange={() => setIsLock(!isLock)} />
                비밀방
            </label>
            {isLock && (
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
            )}
            <br />
            <button onClick={handleCreateRoom}>생성</button>
            <button onClick={onClose}>취소</button>
        </div>
    );
};

export default RoomCreateModal;
