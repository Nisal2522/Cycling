import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    Layout as DashboardIcon,
    Route as RouteIcon,
    Trophy,
    Gift,
    PlusSquare,
    Settings,
    HelpCircle,
    ChevronRight,
    Activity,
    Leaf,
    User
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
        { name: 'Routes', path: '/routes', icon: RouteIcon },
        { name: 'Challenges', path: '/challenges', icon: Trophy },
        { name: 'Rewards', path: '/rewards', icon: Gift },
    ];

    if (user?.role === 'admin' || user?.role === 'city_planner') {
        navItems.push({ name: 'Create Route', path: '/admin/create-route', icon: PlusSquare });
    }

    return (
        <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-slate-100 hidden lg:flex flex-col overflow-y-auto flex-shrink-0">
            {/* User Profile Summary */}
            <div className="p-6 border-b border-slate-50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#871053] to-[#fc4f00] p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                                <User className="text-slate-400 w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                            {user?.role === 'admin' ? 'System Admin' : 'Elite Rider'}
                        </p>
                    </div>
                </div>

                {/* Mini Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Impact</p>
                        <div className="flex items-center gap-1">
                            <Leaf size={10} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-900">{(user?.co2Saved / 1000 || 0).toFixed(1)}k</span>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Nodes</p>
                        <div className="flex items-center gap-1">
                            <Activity size={10} className="text-[#871053]" />
                            <span className="text-[10px] font-black text-slate-900">{user?.completedRoutes || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-grow p-4 mt-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Operations</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl group transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-[#871053]/5 to-[#fc4f00]/5 text-slate-900 border border-[#871053]/10 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={isActive ? 'text-[#fc4f00]' : 'group-hover:text-slate-900'} />
                                    <span className={`text-xs font-black tracking-widest uppercase ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#fc4f00] shadow-[0_0_8px_#fc4f00]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-10 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Support</p>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 group">
                        <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase opacity-60 group-hover:opacity-100">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 group">
                        <HelpCircle size={18} />
                        <span className="text-xs font-black tracking-widest uppercase opacity-60 group-hover:opacity-100">Help Center</span>
                    </button>
                </div>
            </nav>

            {/* Bottom Accent */}
            <div className="p-6">
                <div className="bg-gradient-to-br from-[#871053] to-[#fc4f00] p-4 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
                        <Activity size={40} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Global Status</p>
                    <p className="text-lg font-black text-white tracking-tighter">OPERATIONAL</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
