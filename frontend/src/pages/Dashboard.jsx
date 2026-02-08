import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LeaderboardWidget from '../components/LeaderboardWidget';
import BadgeNotification from '../components/BadgeNotification';
import {
    Activity,
    Route as RouteIcon,
    Trophy,
    Flame,
    Leaf,
    Car,
    Target,
    Plus,
    Map as MapIcon,
    Compass,
    Gift,
    Medal,
    ChevronRight,
    Star,
    Layout
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [routes, setRoutes] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBadge, setNewBadge] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch routes
                const routesRes = await axios.get('http://localhost:5000/api/routes');
                setRoutes(routesRes.data);

                // Fetch user badges if user has badges
                if (user?.badges && user.badges.length > 0) {
                    const badgePromises = user.badges.map(badgeId =>
                        axios.get(`http://localhost:5000/api/badges/${badgeId}`).catch(() => null)
                    );
                    const badgeResults = await Promise.all(badgePromises);
                    setBadges(badgeResults.filter(b => b).map(b => b.data));
                }

                // Check for new badge from ride completion
                if (location.state?.newBadge) {
                    setNewBadge(location.state.newBadge);
                    // Clear state
                    window.history.replaceState({}, document.title);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, location.state]);

    const treesEquivalent = user?.environmentalImpact?.treesEquivalent || 0;
    const carKmEquivalent = user?.environmentalImpact?.carKmEquivalent || 0;

    return (
        <div className="relative">
            {newBadge && (
                <BadgeNotification
                    badge={newBadge}
                    onClose={() => setNewBadge(null)}
                />
            )}

            {/* Header Section */}
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#871053] to-[#fc4f00] shadow-lg">
                        <Layout className="text-white w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Overview</p>
                </div>
                <h1 className="text-4xl font-extrabold tracking-taller bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                    OPERATIONS DASHBOARD
                </h1>
            </header>

            <div className="space-y-12">
                {/* Stats Grid */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Distance */}
                        <div className="group bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#871053]/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Activity className="w-24 h-24" />
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#871053]/10 group-hover:text-[#871053] transition-colors duration-500">
                                        <Activity size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Distance</span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {user?.totalDistance?.toFixed(2) || 0}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">KM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Routes Completed */}
                        <div className="group bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#fc4f00]/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <RouteIcon className="w-24 h-24" />
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#fc4f00]/10 group-hover:text-[#fc4f00] transition-colors duration-500">
                                        <RouteIcon size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {user?.completedRoutes || 0}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Nodes</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Points */}
                        <div className="group bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#871053]/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Trophy className="w-24 h-24" />
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#871053]/10 group-hover:text-[#871053] transition-colors duration-500">
                                        <Trophy size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#871053] to-[#fc4f00] tracking-tighter">
                                            {user?.points || 0}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Points</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Streak */}
                        <div className="group bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#fc4f00]/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Flame className="w-24 h-24" />
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#fc4f00]/10 group-hover:text-[#fc4f00] transition-colors duration-500">
                                        <Flame size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-orange-500 tracking-tighter drop-shadow-sm">
                                            {user?.currentStreak || 0}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sustainability Impact Section */}
                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Leaf size={14} className="text-emerald-500" />
                        Sustainability Impact Matrix
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-50/50 backdrop-blur-md p-8 rounded-[2rem] border border-emerald-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 p-4 opacity-[0.05]">
                                <Leaf className="w-32 h-32" />
                            </div>
                            <dt className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest mb-4">Carbon Sequestration</dt>
                            <dd className="text-3xl font-black text-emerald-900 tracking-tighter">
                                {(user?.co2Saved / 1000 || 0).toFixed(2)} <span className="text-sm font-bold opacity-60">KG CO₂</span>
                            </dd>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Leaf size={14} className="text-emerald-600" />
                                </div>
                                <p className="text-xs font-bold text-emerald-700/80 uppercase tracking-tighter">
                                    Equivalent to <span className="text-emerald-900">{treesEquivalent}</span> full-grown trees
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 backdrop-blur-md p-8 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 p-4 opacity-[0.05]">
                                <Car className="w-32 h-32" />
                            </div>
                            <dt className="text-[10px] font-black text-blue-800/60 uppercase tracking-widest mb-4">Fossil Fuel Mitigation</dt>
                            <dd className="text-3xl font-black text-blue-900 tracking-tighter">
                                {carKmEquivalent.toFixed(1)} <span className="text-sm font-bold opacity-60">KM</span>
                            </dd>
                            <p className="mt-4 text-xs font-bold text-blue-700/80 uppercase tracking-tighter">
                                Conventional vehicle trips avoided
                            </p>
                        </div>

                        <div className="bg-purple-50/50 backdrop-blur-md p-8 rounded-[2rem] border border-purple-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 p-4 opacity-[0.05]">
                                <Target className="w-32 h-32" />
                            </div>
                            <dt className="text-[10px] font-black text-purple-800/60 uppercase tracking-widest mb-4">Historical Peak</dt>
                            <dd className="text-3xl font-black text-purple-900 tracking-tighter">
                                {user?.longestStreak || 0} <span className="text-sm font-bold opacity-60">DAYS</span>
                            </dd>
                            <p className="mt-4 text-xs font-bold text-purple-700/80 uppercase tracking-tighter">
                                Peak performance consistency achieved
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions & Trajectories */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Action Modules */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Compass className="w-24 h-24" />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">System Commands</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate('/ride')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#871053] to-[#fc4f00] hover:shadow-[0_10px_30px_rgba(252,79,0,0.3)] text-white group/btn transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Compass size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Initiate Ride</span>
                                    </div>
                                    <ChevronRight size={18} className="opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/routes')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-900 group/btn transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center">
                                            <MapIcon size={20} className="text-slate-500" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Browse Routes</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/challenges')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-900 group/btn transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center">
                                            <Trophy size={20} className="text-slate-500" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Active Challenges</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/rewards')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-900 group/btn transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center">
                                            <Gift size={20} className="text-slate-500" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Redeem Rewards</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Modules: Leaderboard & Badges */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* Leaderboard Module */}
                            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Elite Leaderboard</h3>
                                <div className="flex-grow">
                                    <LeaderboardWidget type="points" limit={5} />
                                </div>
                            </div>

                            {/* Badges Module */}
                            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between items-center">
                                    Achievement Vault
                                    <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500">{badges.length} Earned</span>
                                </h3>
                                <div className="flex-grow">
                                    {badges.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {badges.slice(0, 4).map((badge, index) => (
                                                <div key={index} className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-[#fc4f00]/30 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center mb-3 shadow-inner">
                                                        <Medal className="text-amber-500 w-6 h-6" />
                                                    </div>
                                                    <span className="font-bold text-[10px] text-center text-slate-900 uppercase tracking-tight line-clamp-1">{badge.name}</span>
                                                    <div className="mt-1 flex items-center gap-1 opacity-40">
                                                        <Activity size={8} className="text-slate-500" />
                                                        <span className="text-[8px] font-black uppercase">Unlocked</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                                            <Medal size={40} className="text-slate-300 mb-4" />
                                            <p className="text-xs uppercase font-black tracking-widest">No achievements found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Trajectories */}
                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <MapIcon size={14} className="text-[#871053]" />
                        Available Trajectories
                    </h3>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse"></div>
                            ))}
                        </div>
                    ) : routes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {routes.slice(0, 6).map((route) => (
                                <div
                                    key={route._id}
                                    className="group bg-white hover:bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:border-[#871053]/40 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-500"
                                    onClick={() => navigate(`/routes/${route._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-[#871053] transition-colors">{route.name}</h4>
                                        <div className={`p-1.5 rounded-lg ${route.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' :
                                            route.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <Activity size={12} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-900">{route.distance}</span>
                                            <span className="text-[10px] font-bold text-slate-400">KM</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{route.difficulty}</span>
                                        </div>
                                    </div>
                                    {route.averageRating > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={10} className={`${star <= route.averageRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">({route.reviewCount})</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                            <MapIcon size={32} className="text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No trajectories archived</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
