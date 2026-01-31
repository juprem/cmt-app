import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

interface TimerContextType {
    isActive: boolean;
    seconds: number;
    earnings: number;
    poopLevel: number;
    sessionStartTime: Date | null;
    startTimer: () => void;
    pauseTimer: () => void;
    stopTimer: () => Promise<void>;
    statusMessages: string[];
}

const statusMessages = [
    "Dropping a heavy load... of cash! 💸",
    "Making bank while you tank 🚽",
    "Productivity at its peak 📈",
    "The golden flush is coming ✨",
    "Your boss is paying for this 🤝",
    "Tax-free environment? 💩",
    "Inflation-proof sessions 📊",
];

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};

interface TimerProviderProps {
    children: ReactNode;
    hourlyRate: number;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children, hourlyRate }) => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [earnings, setEarnings] = useState(0);
    const [poopLevel, setPoopLevel] = useState(1);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    useEffect(() => {
        // Calculate earnings real-time
        const currentEarnings = (hourlyRate / 3600) * seconds;
        setEarnings(currentEarnings);

        // Poop levels up every 10 euros
        const newLevel = Math.floor(currentEarnings / 10) + 1;
        if (newLevel > poopLevel) {
            setPoopLevel(newLevel);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8B4513', '#FFD700', '#A855F7']
            });
        }
    }, [seconds, hourlyRate, poopLevel]);

    const startTimer = () => {
        if (!sessionStartTime) {
            setSessionStartTime(new Date());
        }
        setIsActive(true);
    };

    const pauseTimer = () => {
        setIsActive(false);
    };

    const stopTimer = async () => {
        setIsActive(false);

        if (user && seconds > 0) {
            try {
                const { authService } = await import('@/app/lib/auth');
                await authService.createSession({
                    user_id: user.id,
                    duration_seconds: seconds,
                    earnings: earnings,
                    hourly_rate: hourlyRate,
                    started_at: sessionStartTime || new Date(Date.now() - seconds * 1000),
                    poop_level: poopLevel,
                });
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        }

        // Reset state
        setSeconds(0);
        setEarnings(0);
        setPoopLevel(1);
        setSessionStartTime(null);

        // Celebration
        confetti({
            particleCount: 150,
            velocity: 30,
            spread: 360,
            origin: { y: 0.5 },
            shapes: ['circle'],
            colors: ['#60A5FA', '#3B82F6', '#2563EB']
        });
    };

    return (
        <TimerContext.Provider
            value={{
                isActive,
                seconds,
                earnings,
                poopLevel,
                sessionStartTime,
                startTimer,
                pauseTimer,
                stopTimer,
                statusMessages
            }}
        >
            {children}
        </TimerContext.Provider>
    );
};
