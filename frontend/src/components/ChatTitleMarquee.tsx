import React, { useRef, useEffect, useState } from 'react';

interface Props {
    title: string;
    className?: string;
}

const SCROLL_PIXELS_PER_SECOND = 40;
const PAUSE_MS = 3000; // пауза на концах (1 секунда)

const ChatTitleMarquee: React.FC<Props> = ({ title, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const [needMarquee, setNeedMarquee] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(-1);
    const [position, setPosition] = useState(0);

    // refs для управления анимацией
    const lastFrameRef = useRef(Date.now());
    const reqIdRef = useRef<number | null>(null);
    const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Проверка, нужен ли marquee
    const checkMarquee = () => {
        if (containerRef.current && textRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const textWidth = textRef.current.scrollWidth;
            if (textWidth > containerWidth + 2) {
                setNeedMarquee(true);
                setScrollDistance(textWidth - containerWidth);
            } else {
                setNeedMarquee(false);
                setPosition(0);
            }
        }
    };

    useEffect(() => {
        checkMarquee();
        window.addEventListener('resize', checkMarquee);
        return () => window.removeEventListener('resize', checkMarquee);
    }, [title]);

    useEffect(() => {
        if (!containerRef.current) return;
        if (typeof window.ResizeObserver === 'function') {
            const ro = new window.ResizeObserver(checkMarquee);
            ro.observe(containerRef.current);
            return () => ro.disconnect();
        }
    }, []);

    useEffect(() => {
        if (!needMarquee) return;
        let running = true;

        function animate() {
            const now = Date.now();
            const elapsed = (now - lastFrameRef.current) / 1000;
            lastFrameRef.current = now;
            setPosition(pos => {
                let newPos = pos + direction * SCROLL_PIXELS_PER_SECOND * elapsed;
                if (newPos <= -scrollDistance) {
                    newPos = -scrollDistance;
                    // Пауза на левом конце
                    running = false;
                    pauseTimeoutRef.current = setTimeout(() => {
                        setDirection(1);
                        lastFrameRef.current = Date.now(); // сбросить frame!
                        running = true;
                        reqIdRef.current = requestAnimationFrame(animate);
                    }, PAUSE_MS);
                } else if (newPos >= 0) {
                    newPos = 0;
                    // Пауза на правом конце
                    running = false;
                    pauseTimeoutRef.current = setTimeout(() => {
                        setDirection(-1);
                        lastFrameRef.current = Date.now(); // сбросить frame!
                        running = true;
                        reqIdRef.current = requestAnimationFrame(animate);
                    }, PAUSE_MS);
                } else if (running) {
                    reqIdRef.current = requestAnimationFrame(animate);
                }
                return newPos;
            });
        }

        // Запуск анимации
        lastFrameRef.current = Date.now();
        reqIdRef.current = requestAnimationFrame(animate);

        return () => {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        };
    }, [needMarquee, direction, scrollDistance, title]);

    // сбрасывать позицию если изменилась строка или ширина
    useEffect(() => {
        setPosition(0);
        setDirection(-1);
        // сброс refs
        lastFrameRef.current = Date.now();
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    }, [title, scrollDistance, needMarquee]);

    return (
        <div
            ref={containerRef}
            className={`chat-title-marquee-container ${className || ''}`}
            style={{
                minWidth: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                height: 32,
                position: 'relative'
            }}
        >
            <div
                ref={textRef}
                className="chat-title-marquee"
                style={{
                    transform: needMarquee ? `translateX(${position}px)` : 'none',
                    transition: needMarquee ? 'none' : 'transform 0.2s',
                    willChange: needMarquee ? 'transform' : undefined,
                    padding: '0',
                }}
                title={title}
            >
                {title}
            </div>
        </div>
    );
};

export default ChatTitleMarquee;
