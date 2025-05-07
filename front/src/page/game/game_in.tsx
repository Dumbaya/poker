import React, { useEffect, useState } from 'react';

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const generateDeck = () => {
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank, code: `${rank}${suit}` });
        }
    }
    return deck;
};

const shuffleDeck = (deck: any[]) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Card = ({ rank, suit }: { rank: string; suit: string }) => {
    const isRed = suit === '♥' || suit === '♦';
    return (
        <div
            className={`w-16 h-24 border rounded-lg shadow-md p-2 flex flex-col justify-between items-center text-xl font-bold cursor-pointer select-none ${
                isRed ? 'text-red-500' : 'text-black'
            } bg-white`}
        >
            <span>{rank}</span>
            <span>{suit}</span>
        </div>
    );
};

const SevenPoker = () => {
    const [playerCards, setPlayerCards] = useState<any[]>([]);

    useEffect(() => {
        const fullDeck = generateDeck();
        const shuffled = shuffleDeck(fullDeck);
        const playerHand = shuffled.slice(0, 3); // 초기 3장 지급
        setPlayerCards(playerHand);
    }, []);

    return (
        <div className="flex flex-col items-center mt-10">
            <h1 className="text-2xl font-semibold mb-4">세븐 포커 - 내 카드</h1>
            <div className="flex gap-4">
                {playerCards.map((card, index) => (
                    <Card key={index} rank={card.rank} suit={card.suit} />
                ))}
            </div>
        </div>
    );
};

export default SevenPoker;
