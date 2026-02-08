import { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

const ReviewList = ({ routeId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/reviews/route/${routeId}`
                );
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (routeId) {
            fetchReviews();
        }
    }, [routeId]);

    const handleHelpful = async (reviewId) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.post(
                `http://localhost:5000/api/reviews/${reviewId}/helpful`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setReviews(reviews.map(r => r._id === reviewId ? data : r));
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    if (loading) {
        return <div className="text-gray-500">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
            {reviews.map((review) => (
                <div key={review._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <StarRating rating={review.rating} readonly />
                    </div>
                    
                    {review.comment && (
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    
                    {review.safetyIssues && review.safetyIssues.length > 0 && (
                        <div className="mb-2">
                            <span className="text-sm font-medium text-red-600">Safety Issues: </span>
                            <span className="text-sm text-gray-600">
                                {review.safetyIssues.map(issue => issue.replace('_', ' ')).join(', ')}
                            </span>
                        </div>
                    )}
                    
                    <button
                        onClick={() => handleHelpful(review._id)}
                        className="text-sm text-gray-600 hover:text-indigo-600"
                    >
                        👍 Helpful ({review.helpful || 0})
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
