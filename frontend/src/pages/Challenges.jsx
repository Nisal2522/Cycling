import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Challenges = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/challenges?isActive=true');
                setChallenges(data);
            } catch (error) {
                console.error('Error fetching challenges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const handleJoin = async (challengeId) => {
        try {
            const token = user?.token;
            await axios.post(
                `http://localhost:5000/api/challenges/${challengeId}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert('Successfully joined challenge!');
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join challenge');
        }
    };

    const getProgress = (challenge) => {
        if (!user) return 0;
        const participant = challenge.participants?.find(
            p => p.user?._id === user._id || p.user === user._id
        );
        if (!participant) return 0;
        return Math.min((participant.progress / challenge.target) * 100, 100);
    };

    const isParticipating = (challenge) => {
        if (!user) return false;
        return challenge.participants?.some(
            p => p.user?._id === user._id || p.user === user._id
        );
    };

    const getTypeIcon = (type) => {
        const icons = {
            distance: '📏',
            routes: '🗺️',
            streak: '🔥',
            community: '👥',
            environmental: '🌱',
            safety: '🛡️'
        };
        return icons[type] || '🏆';
    };

    return (
        <div className="relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
                <p className="mt-2 text-gray-600">Join challenges to earn points and badges!</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading challenges...</div>
            ) : challenges.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No active challenges at the moment. Check back later!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge) => {
                        const progress = getProgress(challenge);
                        const participating = isParticipating(challenge);
                        const isExpired = new Date(challenge.endDate) < new Date();

                        return (
                            <div
                                key={challenge._id}
                                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{getTypeIcon(challenge.type)}</div>
                                    {participating && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            Joined
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {challenge.name}
                                </h3>
                                <p className="text-gray-600 mb-4">{challenge.description}</p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold">
                                            {challenge.participants?.find(
                                                p => p.user?._id === user?._id || p.user === user?._id
                                            )?.progress || 0} / {challenge.target}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4 text-sm text-gray-500">
                                    <p>Ends: {new Date(challenge.endDate).toLocaleDateString()}</p>
                                    {challenge.rewards?.points && (
                                        <p className="mt-1">
                                            Reward: {challenge.rewards.points} points
                                            {challenge.rewards.badge && ' + Badge'}
                                        </p>
                                    )}
                                </div>

                                {!isExpired && (
                                    <button
                                        onClick={() => handleJoin(challenge._id)}
                                        disabled={participating}
                                        className={`w-full py-2 px-4 rounded-md font-medium ${participating
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {participating ? 'Already Joined' : 'Join Challenge'}
                                    </button>
                                )}

                                {isExpired && (
                                    <div className="w-full py-2 px-4 bg-gray-200 text-gray-600 rounded-md text-center font-medium">
                                        Challenge Ended
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Challenges;
