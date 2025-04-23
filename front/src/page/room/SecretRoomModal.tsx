import React from "react";

interface SecretRoomModalProps {
    onClose: () => void;
    onSubmit: (password: string) => void;
    roomTitle?: string;
}

function SecretRoomModal({ onClose, onSubmit, roomTitle }: SecretRoomModalProps) {
    const [password, setPassword] = React.useState('');

    const handleSubmit = () => {
        if (!password.trim()) {
            alert("비밀번호를 입력하세요");
            return;
        }
        onSubmit(password);
        setPassword('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: 20,
            borderRadius: 10,
            zIndex: 1000,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}>
            <h3>{roomTitle ? `"${roomTitle}" 입장 비밀번호` : "비밀번호 입력"}</h3>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />
            <div style={{ marginTop: 10 }}>
                <button onClick={handleSubmit}>입장</button>
                <button onClick={onClose} style={{ marginLeft: 10 }}>취소</button>
            </div>
        </div>
    );
}

export default SecretRoomModal;
