import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import BadgeNotification from '../components/BadgeNotification';
import LocationContext from '../context/LocationContext';
import AuthContext from '../context/AuthContext';

const RideTracking = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [activeRide, setActiveRide] = useState(null);
    const [newBadge, setNewBadge] = useState(null);
    const { location, startTracking, stopTracking, isTracking } = useContext(LocationContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/routes');
                setRoutes(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchRoutes();
    }, []);

    // Effect to update ride progress when location changes
    useEffect(() => {
        if (activeRide && isTracking && location) {
            updateRideProgress(location);
        }
    }, [location, activeRide, isTracking]);

    const startRide = async (route) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post('http://localhost:5000/api/rides/start', {
                routeId: route._id
            }, config);

            setActiveRide(data);
            setSelectedRoute(route);
            startTracking();
        } catch (error) {
            console.error(error);
            alert('Failed to start ride');
        }
    };

    const updateRideProgress = async (loc) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put(`http://localhost:5000/api/rides/${activeRide._id}/update`, {
                lat: loc.lat,
                lng: loc.lng
            }, config);

            setActiveRide(data);
        } catch (error) {
            console.error(error);
        }
    };

    const finishRide = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put(`http://localhost:5000/api/rides/${activeRide._id}/finish`, {}, config);

            stopTracking();
            
            // Show comprehensive summary
            let summary = `🎉 Ride Completed!\n\n`;
            summary += `Distance: ${(data.ride.distanceCovered / 1000).toFixed(2)} km\n`;
            summary += `CO₂ Saved: ${data.co2Saved} kg\n`;
            summary += `Points Earned: ${data.pointsEarned}\n`;
            summary += `Total Points: ${data.totalPoints}\n`;
            summary += `Total CO₂ Saved: ${data.totalCo2Saved} kg\n`;
            
            if (data.newBadges && data.newBadges.length > 0) {
                summary += `\n🏆 New Badges Earned:\n${data.newBadges.join('\n')}`;
                
                // Fetch badge details and show notification
                try {
                    const { data: allBadges } = await axios.get('http://localhost:5000/api/badges');
                    const firstBadgeName = data.newBadges[0];
                    const firstBadge = allBadges.find(b => b.name === firstBadgeName);
                    
                    if (firstBadge) {
                        setNewBadge(firstBadge);
                        // Show alert first
                        alert(summary);
                        // After showing notification, navigate to dashboard
                        setTimeout(() => {
                            navigate('/dashboard', { 
                                state: { newBadge: firstBadge } 
                            });
                        }, 6000);
                        return; // Don't navigate immediately
                    }
                } catch (error) {
                    console.error('Error fetching badge details:', error);
                }
            }
            
            alert(summary);
            
            // Update user context if needed
            if (userInfo) {
                userInfo.points = data.totalPoints;
                userInfo.co2Saved = data.totalCo2Saved * 1000;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
            
            setActiveRide(null);
            setSelectedRoute(null);
            
            // Navigate back to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error(error);
            alert('Failed to finish ride');
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row h-screen">
            {newBadge && (
                <BadgeNotification
                    badge={newBadge}
                    onClose={() => {
                        setNewBadge(null);
                        navigate('/dashboard');
                    }}
                />
            )}
            <div className="w-full md:w-1/3 p-4 bg-white shadow-lg overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Select a Route</h2>
                {!activeRide ? (
                    <div className="space-y-4">
                        {routes.map((route) => (
                            <div key={route._id} className="border p-3 rounded cursor-pointer hover:bg-gray-50" onClick={() => setSelectedRoute(route)}>
                                <h3 className="font-semibold">{route.name}</h3>
                                <p className="text-sm text-gray-600">{route.distance} km - {route.difficulty}</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); startRide(route); }}
                                    className="mt-2 w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700"
                                >
                                    Start Ride
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="border p-4 rounded bg-green-50 border-green-200">
                            <h3 className="font-bold text-green-800 mb-3">🚴 Ride In Progress</h3>
                            <p className="font-semibold">Route: {selectedRoute?.name}</p>
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Distance Covered:</span>
                                    <span className="font-bold">{(activeRide.distanceCovered / 1000).toFixed(2)} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Completion:</span>
                                    <span className="font-bold">{activeRide.completionPercentage.toFixed(1)}%</span>
                                </div>
                                
                                {/* CO2 Saved */}
                                <div className="mt-3 p-2 bg-green-100 rounded">
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-800 font-medium">🌱 CO₂ Saved:</span>
                                        <span className="font-bold text-green-900">
                                            {((activeRide.distanceCovered / 1000) * 99 / 1000).toFixed(2)} kg
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Estimated Points */}
                                <div className="mt-2 p-2 bg-yellow-100 rounded">
                                    <div className="flex justify-between items-center">
                                        <span className="text-yellow-800 font-medium">⭐ Estimated Points:</span>
                                        <span className="font-bold text-yellow-900">
                                            {(() => {
                                                const km = activeRide.distanceCovered / 1000;
                                                let points = 10;
                                                if (km >= 5) points += 25;
                                                if (km >= 10) points += 50;
                                                if (km >= 25) points += 150;
                                                return points;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={finishRide}
                                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold"
                            >
                                Finish Ride
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full md:w-2/3">
                <MapComponent
                    routes={selectedRoute ? [selectedRoute] : []}
                    currentLocation={location}
                    isTracking={isTracking}
                />
            </div>
        </div>
    );
};

export default RideTracking;
