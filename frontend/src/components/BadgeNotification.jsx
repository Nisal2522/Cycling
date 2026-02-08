import { useEffect, useState } from 'react';

const BadgeNotification = ({ badge, onClose }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            if (onClose) {
                setTimeout(onClose, 500); // Wait for animation
            }
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!show && !badge) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
            show ? 'opacity-100' : 'opacity-0'
        }`}>
            <div className={`bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center transform transition-all ${
                show ? 'scale-100' : 'scale-95'
            }`}>
                <div className="text-8xl mb-4 animate-bounce">
                    {badge?.icon || '🏆'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    🎉 Badge Earned!
                </h2>
                <h3 className="text-2xl font-semibold text-indigo-600 mb-2">
                    {badge?.name || 'Achievement Unlocked'}
                </h3>
                <p className="text-gray-600 mb-6">
                    {badge?.description || 'Congratulations on your achievement!'}
                </p>
                <div className="flex space-x-3 justify-center">
                    <button
                        onClick={() => {
                            setShow(false);
                            if (onClose) setTimeout(onClose, 500);
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Awesome!
                    </button>
                    <button
                        onClick={() => {
                            // Share functionality
                            if (navigator.share) {
                                navigator.share({
                                    title: `I earned the ${badge?.name} badge!`,
                                    text: `Check out my achievement: ${badge?.description}`,
                                });
                            }
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadgeNotification;
