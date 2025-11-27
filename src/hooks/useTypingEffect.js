import { useState, useEffect } from 'react';

/**
 * Custom hook to create a typewriter/streaming effect for text
 * @param {string} text - The full text to display
 * @param {number} speed - Speed in milliseconds between each character (default: 20ms)
 * @param {boolean} enabled - Whether the typing effect is enabled
 * @returns {string} The text with typing effect applied
 */
export function useTypingEffect(text, speed = 12, enabled = true) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!enabled || !text) {
            setDisplayedText(text || '');
            return;
        }

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [text, currentIndex, speed, enabled]);

    // Reset when text changes
    useEffect(() => {
        setCurrentIndex(0);
        setDisplayedText('');
    }, [text]);

    return displayedText;
}
