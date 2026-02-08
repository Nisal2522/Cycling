import { useState } from 'react';
import axios from 'axios';

const IncidentReportForm = ({ routeId, location, onClose, onSubmitted }) => {
    const [type, setType] = useState('hazard');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const incidentTypes = [
        { value: 'hazard', label: 'Hazard' },
        { value: 'accident', label: 'Accident' },
        { value: 'unsafe_condition', label: 'Unsafe Condition' },
        { value: 'infrastructure_issue', label: 'Infrastructure Issue' },
        { value: 'other', label: 'Other' }
    ];

    const severityLevels = [
        { value: 'low', label: 'Low', color: 'green' },
        { value: 'medium', label: 'Medium', color: 'yellow' },
        { value: 'high', label: 'High', color: 'orange' },
        { value: 'critical', label: 'Critical', color: 'red' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!location || !location.lat || !location.lng) {
            setError('Please select a location on the map');
            setSubmitting(false);
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.post(
                'http://localhost:5000/api/safety-incidents',
                {
                    routeId,
                    type,
                    location: {
                        lat: location.lat,
                        lng: location.lng
                    },
                    description,
                    severity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDescription('');
            if (onSubmitted) onSubmitted();
            if (onClose) onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit incident report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Safety Incident</h3>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Type
                </label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {incidentTypes.map(incident => (
                        <option key={incident.value} value={incident.value}>
                            {incident.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {severityLevels.map(level => (
                        <button
                            key={level.value}
                            type="button"
                            onClick={() => setSeverity(level.value)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                severity === level.value
                                    ? `bg-${level.color}-600 text-white`
                                    : `bg-${level.color}-100 text-${level.color}-800 hover:bg-${level.color}-200`
                            }`}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the safety issue..."
                />
            </div>

            {location && (
                <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
            )}

            {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-3">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
                You will earn 15 points for reporting a safety incident.
            </p>
        </form>
    );
};

export default IncidentReportForm;
