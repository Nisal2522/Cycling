import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import IncidentReportForm from '../components/IncidentReportForm';
import Navigation from '../components/Navigation';
import StarRating from '../components/StarRating';

const RouteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showIncidentForm, setShowIncidentForm] = useState(false);
    const [incidentLocation, setIncidentLocation] = useState(null);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/routes/${id}`);
                setRoute(data);
            } catch (error) {
                console.error('Error fetching route:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [id]);

    const handleStartRide = async () => {
        try {
            const token = user?.token;
            const { data } = await axios.post(
                'http://localhost:5000/api/rides/start',
                { routeId: id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            navigate('/ride', { state: { rideId: data._id, route } });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start ride');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="text-center py-12">Loading route...</div>
                </div>
            </div>
        );
    }

    if (!route) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="text-center py-12">Route not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Route Header */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
                                <div className="mt-2 flex items-center space-x-4">
                                    <span className="text-gray-600">{route.distance} km</span>
                                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                                        route.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                        route.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        route.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {route.difficulty}
                                    </span>
                                    {route.averageRating > 0 && (
                                        <div className="flex items-center">
                                            <StarRating rating={Math.round(route.averageRating)} readonly />
                                            <span className="ml-2 text-sm text-gray-600">
                                                {route.averageRating.toFixed(1)} ({route.reviewCount} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleStartRide}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                            >
                                🚴 Start Ride
                            </button>
                        </div>

                        {/* Safety Features */}
                        {route.safetyFeatures && route.safetyFeatures.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Safety Features:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {route.safetyFeatures.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {feature.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Route Map</h2>
                            {user && (
                                <button
                                    onClick={() => setShowIncidentForm(!showIncidentForm)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                    {showIncidentForm ? 'Cancel' : '🚨 Report Safety Issue'}
                                </button>
                            )}
                        </div>
                        <div className="h-96 rounded-lg overflow-hidden relative">
                            <MapComponent
                                routes={[route]}
                                currentLocation={null}
                            />
                            {showIncidentForm && (
                                <div className="absolute top-4 right-4 z-10">
                                    <IncidentReportForm
                                        routeId={id}
                                        location={incidentLocation}
                                        onClose={() => {
                                            setShowIncidentForm(false);
                                            setIncidentLocation(null);
                                        }}
                                        onSubmitted={() => {
                                            setShowIncidentForm(false);
                                            setIncidentLocation(null);
                                            alert('Safety incident reported! You earned 15 points.');
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {showIncidentForm && (
                            <p className="mt-2 text-sm text-gray-600">
                                Click on the map to set the incident location, or use your current location.
                            </p>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Reviews</h2>
                            {user && (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    {showReviewForm ? 'Cancel' : 'Write Review'}
                                </button>
                            )}
                        </div>

                        {showReviewForm && user && (
                            <div className="mb-6">
                                <ReviewForm
                                    routeId={id}
                                    onReviewSubmitted={() => {
                                        setShowReviewForm(false);
                                        window.location.reload();
                                    }}
                                />
                            </div>
                        )}

                        <ReviewList routeId={id} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RouteDetails;
