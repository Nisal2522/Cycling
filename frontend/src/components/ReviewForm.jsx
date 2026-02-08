import { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

const ReviewForm = ({ routeId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [safetyIssues, setSafetyIssues] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const safetyIssueOptions = [
        'heavy_traffic',
        'poor_lighting',
        'potholes',
        'no_bike_lane',
        'dangerous_intersection',
        'other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.post(
                'http://localhost:5000/api/reviews',
                {
                    routeId,
                    rating,
                    comment,
                    safetyIssues
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setComment('');
            setSafetyIssues([]);
            setRating(5);
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSafetyIssue = (issue) => {
        setSafetyIssues(prev =>
            prev.includes(issue)
                ? prev.filter(i => i !== issue)
                : [...prev, issue]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Share your experience..."
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Issues (if any)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {safetyIssueOptions.map((issue) => (
                        <label key={issue} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={safetyIssues.includes(issue)}
                                onChange={() => toggleSafetyIssue(issue)}
                                className="mr-2"
                            />
                            <span className="text-sm capitalize">
                                {issue.replace('_', ' ')}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
