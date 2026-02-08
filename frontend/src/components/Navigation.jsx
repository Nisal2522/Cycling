import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    Layout,
    Route as RouteIcon,
    Trophy,
    Gift,
    PlusSquare,
    LogOut,
    Star,
    Leaf,
    User,
    Menu,
    X,
    Compass
} from 'lucide-react';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Layout },
        { name: 'Routes', path: '/routes', icon: RouteIcon },
        { name: 'Challenges', path: '/challenges', icon: Trophy },
        { name: 'Rewards', path: '/rewards', icon: Gift },
    ];

    if (user?.role === 'admin' || user?.role === 'city_planner') {
        navItems.push({ name: 'Create Route', path: '/admin/create-route', icon: PlusSquare });
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center gap-12">
                        {/* Logo Section */}
                        <div
                            className="group flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate('/dashboard')}
                        >
                            <div className="p-2 rounded-xl bg-gradient-to-br from-[#871053] to-[#fc4f00] shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <Layout className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                                CYCLING <span className="text-[#fc4f00]">SYSTEM</span>
                            </h1>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                            ? 'bg-gradient-to-r from-[#871053] to-[#fc4f00] text-white shadow-lg'
                                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Stats Group */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 group">
                                <Star size={14} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                                <span className="text-xs font-black text-slate-900">{user?.points || 0}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 group">
                                <Leaf size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-black text-slate-900">
                                    {(user?.co2Saved / 1000 || 0).toFixed(1)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">KG CO₂</span>
                            </div>
                        </div>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4 border-l border-slate-100 pl-6 text-right hidden sm:flex">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Operator</p>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="group w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-lg transition-all duration-500 flex items-center justify-center"
                                title="Terminate Session"
                            >
                                <LogOut className="text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
