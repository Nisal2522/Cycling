import { useState, useEffect } from 'react';
import axios from 'axios';

const Rewards = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReward, setSelectedReward] = useState(null);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rewardsRes, myRewardsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/rewards'),
                    user ? axios.get('http://localhost:5000/api/rewards/my-rewards', {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }) : Promise.resolve({ data: { points: 0 } })
                ]);
                setRewards(rewardsRes.data);
                setUserPoints(myRewardsRes.data.points || user?.points || 0);
            } catch (error) {
                console.error('Error fetching rewards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleRedeem = async () => {
        if (!selectedReward) return;

        try {
            const token = user?.token;
            const { data } = await axios.post(
                `http://localhost:5000/api/rewards/${selectedReward._id}/redeem`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(`Reward redeemed! ${data.discountCode ? `Discount Code: ${data.discountCode}` : ''}`);
            setShowRedeemModal(false);
            setSelectedReward(null);

            // Update user points
            setUserPoints(data.remainingPoints);

            // Refresh rewards to update stock
            const { data: updatedRewards } = await axios.get('http://localhost:5000/api/rewards');
            setRewards(updatedRewards);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to redeem reward');
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            discount: '🎟️',
            badge: '🏅',
            certificate: '📜',
            physical_item: '📦',
            experience: '🎯'
        };
        return icons[type] || '🎁';
    };

    const canAfford = (pointsRequired) => {
        return userPoints >= pointsRequired;
    };

    return (
        <div className="relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
                <p className="mt-2 text-gray-600">
                    Redeem your points for amazing rewards!
                </p>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-yellow-800">
                        Your Points: <span className="text-2xl">{userPoints}</span>
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading rewards...</div>
            ) : rewards.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No rewards available at the moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => {
                        const affordable = canAfford(reward.pointsRequired);
                        const outOfStock = reward.stock !== -1 && reward.stock <= 0;
                        const expired = reward.expiryDate && new Date(reward.expiryDate) < new Date();

                        return (
                            <div
                                key={reward._id}
                                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${!affordable || outOfStock || expired ? 'opacity-75' : ''
                                    }`}
                            >
                                <div className="text-5xl text-center mb-4">
                                    {getTypeIcon(reward.type)}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                    {reward.name}
                                </h3>
                                <p className="text-gray-600 mb-4 text-center text-sm">
                                    {reward.description}
                                </p>

                                {reward.partner && (
                                    <p className="text-sm text-indigo-600 mb-4 text-center font-medium">
                                        Partner: {reward.partner}
                                    </p>
                                )}

                                <div className="mb-4 text-center">
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {reward.pointsRequired}
                                    </span>
                                    <span className="text-gray-600 ml-1">points</span>
                                </div>

                                {reward.discountPercentage && (
                                    <div className="mb-4 text-center">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            {reward.discountPercentage}% OFF
                                        </span>
                                    </div>
                                )}

                                {reward.stock !== -1 && (
                                    <p className="text-sm text-gray-500 mb-4 text-center">
                                        Stock: {reward.stock} remaining
                                    </p>
                                )}

                                {reward.expiryDate && (
                                    <p className="text-xs text-gray-500 mb-4 text-center">
                                        Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                                    </p>
                                )}

                                <button
                                    onClick={() => {
                                        setSelectedReward(reward);
                                        setShowRedeemModal(true);
                                    }}
                                    disabled={!affordable || outOfStock || expired || !user}
                                    className={`w-full py-2 px-4 rounded-md font-medium ${!affordable
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : outOfStock || expired
                                            ? 'bg-red-300 text-red-700 cursor-not-allowed'
                                            : !user
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {!user
                                        ? 'Login to Redeem'
                                        : !affordable
                                            ? 'Insufficient Points'
                                            : outOfStock
                                                ? 'Out of Stock'
                                                : expired
                                                    ? 'Expired'
                                                    : 'Redeem Now'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Redeem Modal */}
            {showRedeemModal && selectedReward && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">Redeem Reward</h2>
                        <div className="mb-4">
                            <p className="text-lg font-semibold">{selectedReward.name}</p>
                            <p className="text-gray-600">{selectedReward.description}</p>
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Cost: <span className="font-bold text-yellow-600">
                                        {selectedReward.pointsRequired} points
                                    </span>
                                </p>
                                <p className="text-sm text-gray-700 mt-2">
                                    Your Points: <span className="font-bold">{userPoints}</span>
                                </p>
                                <p className="text-sm text-gray-700 mt-2">
                                    After Redemption: <span className="font-bold text-green-600">
                                        {userPoints - selectedReward.pointsRequired} points
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    setShowRedeemModal(false);
                                    setSelectedReward(null);
                                }}
                                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRedeem}
                                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Confirm Redemption
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Rewards;
