import { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardWidget = ({ type = 'points', limit = 5 }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentType, setCurrentType] = useState(type);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Note: This endpoint needs to be created in backend
                // For now, we'll use a placeholder or fetch from user data
                // You'll need to create GET /api/users/leaderboard?type=points
                const { data } = await axios.get(`http://localhost:5000/api/users/leaderboard?type=${currentType}&limit=${limit}`);
                setLeaderboard(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                // Fallback: Show empty state
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentType, limit]);

    const getTypeLabel = () => {
        const labels = {
            points: 'Points',
            distance: 'Distance',
            co2: 'CO₂ Saved',
            routes: 'Routes Completed'
        };
        return labels[currentType] || 'Points';
    };

    const getTypeIcon = () => {
        const icons = {
            points: '⭐',
            distance: '📏',
            co2: '🌱',
            routes: '🗺️'
        };
        return icons[currentType] || '⭐';
    };

    const formatValue = (user, type) => {
        switch (type) {
            case 'points':
                return user.points || 0;
            case 'distance':
                return `${(user.totalDistance || 0).toFixed(1)} km`;
            case 'co2':
                return `${((user.co2Saved || 0) / 1000).toFixed(1)} kg`;
            case 'routes':
                return user.completedRoutes || 0;
            default:
                return user.points || 0;
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500">Loading leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">🏆 Leaderboard</h3>
                <select
                    value={currentType}
                    onChange={(e) => setCurrentType(e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="points">Points</option>
                    <option value="distance">Distance</option>
                    <option value="co2">CO₂ Saved</option>
                    <option value="routes">Routes</option>
                </select>
            </div>

            {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                    No leaderboard data available yet.
                </p>
            ) : (
                <div className="space-y-2">
                    {leaderboard.map((user, index) => (
                        <div
                            key={user._id || index}
                            className={`flex items-center justify-between p-2 rounded ${
                                index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                                index === 1 ? 'bg-gray-50 border border-gray-200' :
                                index === 2 ? 'bg-orange-50 border border-orange-200' :
                                'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className={`text-lg font-bold ${
                                    index === 0 ? 'text-yellow-600' :
                                    index === 1 ? 'text-gray-600' :
                                    index === 2 ? 'text-orange-600' :
                                    'text-gray-400'
                                }`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {user.name || 'Anonymous'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span>{getTypeIcon()}</span>
                                <span className="font-semibold text-indigo-600">
                                    {formatValue(user, currentType)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-center">
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                    View Full Leaderboard →
                </button>
            </div>
        </div>
    );
};

export default LeaderboardWidget;
