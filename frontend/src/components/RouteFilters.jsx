import { useState } from 'react';

const RouteFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        difficulty: initialFilters.difficulty || '',
        minDistance: initialFilters.minDistance || '',
        maxDistance: initialFilters.maxDistance || '',
        minSafetyRating: initialFilters.minSafetyRating || '',
        safetyFeature: initialFilters.safetyFeature || '',
        search: initialFilters.search || ''
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const clearFilters = () => {
        const emptyFilters = {
            difficulty: '',
            minDistance: '',
            maxDistance: '',
            minSafetyRating: '',
            safetyFeature: '',
            search: ''
        };
        setFilters(emptyFilters);
        if (onFilterChange) {
            onFilterChange(emptyFilters);
        }
    };

    const safetyFeatures = [
        'bike_lane',
        'dedicated_path',
        'low_traffic',
        'well_lit',
        'traffic_calmed',
        'separated_lane'
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filter Routes</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    Clear All
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                </label>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search routes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Difficulty */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                </label>
                <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>

            {/* Distance Range */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        value={filters.minDistance}
                        onChange={(e) => handleFilterChange('minDistance', e.target.value)}
                        placeholder="Min"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        value={filters.maxDistance}
                        onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                        placeholder="Max"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Safety Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Safety Rating
                </label>
                <select
                    value={filters.minSafetyRating}
                    onChange={(e) => handleFilterChange('minSafetyRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Any</option>
                    <option value="1">⭐ 1+</option>
                    <option value="2">⭐⭐ 2+</option>
                    <option value="3">⭐⭐⭐ 3+</option>
                    <option value="4">⭐⭐⭐⭐ 4+</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
            </div>

            {/* Safety Features */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Features
                </label>
                <select
                    value={filters.safetyFeature}
                    onChange={(e) => handleFilterChange('safetyFeature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Any</option>
                    {safetyFeatures.map(feature => (
                        <option key={feature} value={feature}>
                            {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default RouteFilters;
