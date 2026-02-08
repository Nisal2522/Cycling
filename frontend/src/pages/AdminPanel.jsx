import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, DrawingManager, Polyline, Autocomplete, DirectionsService, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import routeService from '../services/routeService';
import {
    Edit,
    Trash2,
    Plus,
    X,
    MapPin,
    Navigation,
    Search,
    Layers,
    Route as RouteIcon,
    Compass,
    Activity,
    Info,
    CheckCircle2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';

const libraries = ['drawing', 'geometry', 'places'];

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '1.5rem',
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
};

const center = {
    lat: 7.8731, // Default center (Sri Lanka)
    lng: 80.7718,
};

const AdminPanel = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [routes, setRoutes] = useState([]);
    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [polylinePath, setPolylinePath] = useState([]);
    const [distance, setDistance] = useState(0);
    const [editingRouteId, setEditingRouteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [originAddress, setOriginAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [creationMode, setCreationMode] = useState('directions');
    const [originRef, setOriginRef] = useState(null);
    const [destinationRef, setDestinationRef] = useState(null);
    const [showTraffic, setShowTraffic] = useState(false);

    const mapRef = useRef();
    const navigate = useNavigate();

    const fetchRoutes = useCallback(async () => {
        try {
            const data = await routeService.getRoutes();
            setRoutes(data);
        } catch (error) {
            console.error('Failed to fetch routes:', error);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    useEffect(() => {
        if (origin && destination && creationMode === 'directions') {
            calculateRoute();
        }
    }, [origin, destination, creationMode]);

    const onPolylineComplete = (polyline) => {
        const path = polyline.getPath();
        const coordinates = [];
        for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
        }
        const totalDistance = google.maps.geometry.spherical.computeLength(path) / 1000;
        setPolylinePath(coordinates);
        setDistance(totalDistance.toFixed(2));
    };

    const calculateRoute = async () => {
        if (!origin || !destination) return;
        setLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const directionsService = new google.maps.DirectionsService();
            const originLocation = origin.geometry?.location || origin.formatted_address;
            const destinationLocation = destination.geometry?.location || destination.formatted_address;
            const modes = [
                google.maps.TravelMode.BICYCLING,
                google.maps.TravelMode.WALKING,
                google.maps.TravelMode.DRIVING
            ];
            let results = null;
            let finalMode = '';
            for (const mode of modes) {
                try {
                    const response = await directionsService.route({
                        origin: originLocation,
                        destination: destinationLocation,
                        travelMode: mode,
                    });
                    if (response && response.routes && response.routes.length > 0) {
                        results = response;
                        finalMode = mode;
                        break;
                    }
                } catch (e) { continue; }
            }
            if (results) {
                setDirectionsResponse(results);
                setDistance((results.routes[0].legs[0].distance.value / 1000).toFixed(2));
                const path = results.routes[0].overview_path.map(point => ({ lat: point.lat(), lng: point.lng() }));
                setPolylinePath(path);
                setOriginAddress(origin.formatted_address || origin.name || '');
                setDestinationAddress(destination.formatted_address || destination.name || '');
                setStatusMessage({ type: 'success', text: 'Premium path calculated.' });
            } else {
                if (origin.geometry?.location && destination.geometry?.location) {
                    const start = { lat: origin.geometry.location.lat(), lng: origin.geometry.location.lng() };
                    const end = { lat: destination.geometry.location.lat(), lng: destination.geometry.location.lng() };
                    const directDistance = google.maps.geometry.spherical.computeLength([origin.geometry.location, destination.geometry.location]) / 1000;
                    setDirectionsResponse(null);
                    setPolylinePath([start, end]);
                    setDistance(directDistance.toFixed(2));
                    setOriginAddress(origin.formatted_address || origin.name || '');
                    setDestinationAddress(destination.formatted_address || destination.name || '');
                    setStatusMessage({ type: 'success', text: 'Direct vector path established.' });
                }
            }
        } catch (error) {
            console.error('Calculation error:', error);
            setStatusMessage({ type: 'error', text: 'Route processing failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const routeData = {
                name,
                distance: parseFloat(distance),
                difficulty,
                polyline: polylinePath,
                originAddress,
                destinationAddress,
            };
            if (editingRouteId) {
                await routeService.updateRoute(editingRouteId, routeData);
            } else {
                await routeService.createRoute(routeData);
            }
            resetForm();
            fetchRoutes();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const reverseGeocode = (latLng) => {
        return new Promise((resolve) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    resolve(`${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`);
                }
            });
        });
    };

    const handleEdit = async (route) => {
        setEditingRouteId(route._id);
        setName(route.name);
        setDifficulty(route.difficulty);
        setDistance(route.distance);
        setPolylinePath(route.polyline);
        let oAddr = route.originAddress || '';
        let dAddr = route.destinationAddress || '';
        if (!oAddr && route.polyline?.length > 0) oAddr = await reverseGeocode(route.polyline[0]);
        if (!dAddr && route.polyline?.length > 1) dAddr = await reverseGeocode(route.polyline[route.polyline.length - 1]);
        setOriginAddress(oAddr);
        setDestinationAddress(dAddr);
        setCreationMode('directions');
        if (route.polyline?.length > 0 && mapRef.current) mapRef.current.panTo(route.polyline[0]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this route trajectory?')) {
            try {
                await routeService.deleteRoute(id);
                fetchRoutes();
            } catch (error) { console.error(error); }
        }
    };

    const resetForm = () => {
        setEditingRouteId(null);
        setName('');
        setDifficulty('Medium');
        setDistance(0);
        setPolylinePath([]);
        setOrigin(null);
        setDestination(null);
        setOriginAddress('');
        setDestinationAddress('');
        setDirectionsResponse(null);
        setStatusMessage({ type: '', text: '' });
    };

    if (loadError) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white font-light text-xl">Satellite link failed</div>;
    if (!isLoaded) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white font-light text-xl animate-pulse">Initializing navigation systems...</div>;

    return (
        <>
            <div className="relative">
                <div className="space-y-10">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="group/back flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 hover:border-[#871053] hover:shadow-lg transition-all duration-500"
                            >
                                <ArrowLeft className="text-slate-400 group-hover/back:text-[#871053] group-hover/back:-translate-x-1 transition-all w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#871053] to-[#fc4f00] shadow-[0_0_20px_rgba(252,79,0,0.3)]">
                                    <Compass className="text-white w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-taller bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                                        ROUTE ARCHITECT
                                    </h1>
                                    <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">System Control Center</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowTraffic(!showTraffic)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all duration-500 font-bold text-xs tracking-widest uppercase ${showTraffic
                                    ? 'bg-[#fc4f00]/10 border-[#fc4f00]/30 text-[#fc4f00] shadow-[0_0_20px_rgba(252,79,0,0.1)]'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                    }`}
                            >
                                <Activity className={`w-4 h-4 ${showTraffic ? 'animate-pulse' : ''}`} />
                                {showTraffic ? 'Traffic Live' : 'Enable Traffic'}
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Control Panel */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Layers className="w-24 h-24" />
                                </div>

                                <div className="flex justify-between items-center mb-10 relative">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        {editingRouteId ? <Edit className="w-6 h-6 text-[#fc4f00]" /> : <Plus className="w-6 h-6 text-[#871053]" />}
                                        {editingRouteId ? 'MODIFY' : 'INITIATE'}
                                    </h2>
                                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                            onClick={() => setCreationMode('draw')}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${creationMode === 'draw' ? 'bg-gradient-to-r from-[#871053] to-[#fc4f00] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            DRAW
                                        </button>
                                        <button
                                            onClick={() => setCreationMode('directions')}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${creationMode === 'directions' ? 'bg-gradient-to-r from-[#871053] to-[#fc4f00] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            AUTO
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 relative">
                                    {creationMode === 'directions' && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="group/input">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within/input:text-[#871053] transition-colors">Start Vector</label>
                                                <Autocomplete
                                                    onLoad={setOriginRef}
                                                    onPlaceChanged={() => {
                                                        if (originRef) {
                                                            const p = originRef.getPlace();
                                                            setOrigin(p);
                                                            setOriginAddress(p.formatted_address || p.name || '');
                                                        }
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#871053] transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder="Establish origin..."
                                                            value={originAddress}
                                                            onChange={(e) => setOriginAddress(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#871053]/20 focus:border-[#871053] transition-all placeholder:text-slate-400"
                                                        />
                                                    </div>
                                                </Autocomplete>
                                            </div>
                                            <div className="group/input">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within/input:text-[#fc4f00] transition-colors">Target Vector</label>
                                                <Autocomplete
                                                    onLoad={setDestinationRef}
                                                    onPlaceChanged={() => {
                                                        if (destinationRef) {
                                                            const p = destinationRef.getPlace();
                                                            setDestination(p);
                                                            setDestinationAddress(p.formatted_address || p.name || '');
                                                        }
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#fc4f00] transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder="Define destination..."
                                                            value={destinationAddress}
                                                            onChange={(e) => setDestinationAddress(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#fc4f00]/20 focus:border-[#fc4f00] transition-all placeholder:text-slate-400"
                                                        />
                                                    </div>
                                                </Autocomplete>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="group/input">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within/input:text-white transition-colors">Identification</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Route label..."
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Complexity</label>
                                                <select
                                                    value={difficulty}
                                                    onChange={(e) => setDifficulty(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#871053]/10 appearance-none transition-all cursor-pointer shadow-sm"
                                                >
                                                    <option value="Easy">LEVEL I</option>
                                                    <option value="Medium">LEVEL II</option>
                                                    <option value="Hard">LEVEL III</option>
                                                    <option value="Expert">LEVEL IV</option>
                                                </select>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Magnitude</span>
                                                <span className="text-xl font-bold text-slate-900">{distance} <span className="text-[10px] text-slate-400">KM</span></span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading || polylinePath.length === 0}
                                                className="grow bg-gradient-to-r from-[#871053] to-[#fc4f00] hover:shadow-[0_10px_30px_rgba(252,79,0,0.4)] text-white font-black py-4 rounded-2xl transition-all duration-500 disabled:opacity-30 disabled:grayscale uppercase tracking-[0.2em] text-xs"
                                            >
                                                {loading ? 'Processing...' : (editingRouteId ? 'Update Archive' : 'Commit Route')}
                                            </button>
                                            {editingRouteId && (
                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-2xl border border-slate-200 transition-colors"
                                                >
                                                    <X size={24} />
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    {statusMessage.text && (
                                        <div className={`flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border animate-in zoom-in duration-300 ${statusMessage.type === 'error'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                            {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                            {statusMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Routes Visualization */}
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 p-8 shadow-xl">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center justify-between">
                                    GLOBAL TRAJECTORIES
                                    <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500">{routes.length} Active</span>
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {routes.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Info className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                            <p className="text-slate-600 text-xs uppercase font-black tracking-widest">No nodes found</p>
                                        </div>
                                    ) : (
                                        routes.map((route) => (
                                            <div key={route._id} className="group/item flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-[#fc4f00]/40 transition-all duration-300">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-800 truncate group-hover/item:text-[#fc4f00] transition-colors">{route.name}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{route.distance} KM</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${route.difficulty === 'Easy' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                                                            route.difficulty === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                                                                'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                                                            }`}></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEdit(route)} className="p-2 text-slate-400 hover:text-[#871053] transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(route._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Integrated Map Viewport */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-slate-100 p-[2px] rounded-[2.5rem] shadow-2xl relative group ring-1 ring-slate-200">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#871053] to-[#fc4f00] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                                <div className="relative bg-white h-full w-full rounded-[2.4rem] overflow-hidden">
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        zoom={8}
                                        center={center}
                                        onLoad={onMapLoad}
                                        options={mapOptions}
                                    >
                                        {showTraffic && <TrafficLayer />}
                                        {creationMode === 'draw' && !editingRouteId && (
                                            <DrawingManager
                                                onPolylineComplete={onPolylineComplete}
                                                options={{
                                                    drawingControl: true,
                                                    drawingControlOptions: {
                                                        position: google.maps.ControlPosition.TOP_CENTER,
                                                        drawingModes: ['polyline'],
                                                    },
                                                    polylineOptions: {
                                                        strokeColor: '#fc4f00',
                                                        strokeWeight: 5,
                                                        editable: true,
                                                    },
                                                }}
                                            />
                                        )}

                                        {creationMode === 'directions' && directionsResponse && (
                                            <DirectionsRenderer
                                                options={{
                                                    directions: directionsResponse,
                                                    polylineOptions: {
                                                        strokeColor: '#fc4f00',
                                                        strokeWeight: 6,
                                                        strokeOpacity: 0.9,
                                                    }
                                                }}
                                            />
                                        )}

                                        {polylinePath.length > 0 && (creationMode === 'draw' || !directionsResponse) && (
                                            <Polyline
                                                path={polylinePath}
                                                options={{
                                                    strokeColor: '#871053',
                                                    strokeWeight: 5,
                                                    strokeOpacity: 0.8,
                                                    editable: creationMode === 'draw',
                                                }}
                                            />
                                        )}
                                    </GoogleMap>
                                </div>
                            </div>

                            {/* Systems Log / Tip */}
                            <div className="bg-[#fc4f00]/5 backdrop-blur-md rounded-3xl border border-[#fc4f00]/10 p-6 flex items-start gap-4">
                                <div className="p-2 bg-[#fc4f00]/20 rounded-xl">
                                    <Info className="text-[#fc4f00] w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Systems Guidance</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                        {creationMode === 'draw'
                                            ? 'MANUAL MODE: Utilize the top toolbar to map coordinates. Double-click to terminate path string.'
                                            : 'AUTO-ARCHIVE: Destination vectors will automatically synthesize optimized bicycling trajectories.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* ... scrollbar and autocomplete styling overrides ... */
            `}</style>
        </>
    );
};

export default AdminPanel;
