import { GoogleMap, useLoadScript, Polyline, Marker } from '@react-google-maps/api';

const libraries = ['places', 'drawing', 'geometry'];

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: 7.8731, // Default center (Sri Lanka)
    lng: 80.7718,
};

const MapComponent = ({
    routes = [],
    currentLocation,
    isTracking,
    onMapLoad,
    children
}) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={currentLocation || center}
            onLoad={onMapLoad}
        >
            {/* Display Routes */}
            {routes.map((route) => (
                <Polyline
                    key={route._id}
                    path={route.polyline}
                    options={{
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                    }}
                />
            ))}

            {/* Current Location Marker */}
            {currentLocation && (
                <Marker
                    position={currentLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: 'white',
                    }}
                />
            )}

            {children}
        </GoogleMap>
    );
};

export default MapComponent;
