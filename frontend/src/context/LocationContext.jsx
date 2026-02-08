import { createContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [watchId, setWatchId] = useState(null);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: position.timestamp
                });
                setError(null);
            },
            (error) => {
                setError(error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
        setWatchId(id);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    };

    useEffect(() => {
        return () => stopTracking();
    }, []);

    return (
        <LocationContext.Provider value={{ location, error, startTracking, stopTracking, isTracking: watchId !== null }}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;
