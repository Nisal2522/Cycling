import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RouteFilters from '../components/RouteFilters';
import StarRating from '../components/StarRating';

const Routes = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
                if (filters.minDistance) queryParams.append('minDistance', filters.minDistance);
                if (filters.maxDistance) queryParams.append('maxDistance', filters.maxDistance);
                if (filters.minSafetyRating) queryParams.append('minSafetyRating', filters.minSafetyRating);
                if (filters.safetyFeature) queryParams.append('safetyFeature', filters.safetyFeature);
                if (filters.search) queryParams.append('search', filters.search);

                const { data } = await axios.get(
                    `http://localhost:5000/api/routes?${queryParams.toString()}`
                );
                setRoutes(data);
                setFilteredRoutes(data);
            } catch (error) {
                console.error('Error fetching routes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">All Routes</h1>
                <p className="mt-2 text-gray-600">Browse and filter cycling routes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <RouteFilters onFilterChange={handleFilterChange} />
                </div>

                {/* Routes List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="text-center py-12">Loading routes...</div>
                    ) : filteredRoutes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No routes found matching your filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRoutes.map((route) => (
                                <div
                                    key={route._id}
                                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/routes/${route._id}`)}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {route.name}
                                    </h3>
                                    <div className="flex items-center space-x-4 mb-3">
                                        <span className="text-gray-600">{route.distance} km</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${route.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                            route.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                route.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {route.difficulty}
                                        </span>
                                    </div>

                                    {route.averageRating > 0 && (
                                        <div className="mb-3 flex items-center">
                                            <StarRating rating={Math.round(route.averageRating)} readonly />
                                            <span className="ml-2 text-sm text-gray-600">
                                                {route.averageRating.toFixed(1)} ({route.reviewCount} reviews)
                                            </span>
                                        </div>
                                    )}

                                    {route.safetyFeatures && route.safetyFeatures.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {route.safetyFeatures.slice(0, 3).map((feature, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                                >
                                                    {feature.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/routes/${route._id}`);
                                        }}
                                        className="w-full mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Routes;
