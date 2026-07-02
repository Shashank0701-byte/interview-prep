import React, { useState } from 'react';
import { X, Briefcase, Clock, Target, Building2, FileText } from 'lucide-react';

const CreateInterviewModal = ({ isOpen, onClose, onCreateSession }) => {
    const [formData, setFormData] = useState({
        targetRole: '',
        experience: '',
        topics: '',
        targetCompany: '',
        description: ''
    });

    const [isCreating, setIsCreating] = useState(false);

    const experienceOptions = [
        { value: '0-1', label: '0-1 Years (Entry Level)' },
        { value: '1-3', label: '1-3 Years (Junior)' },
        { value: '3-5', label: '3-5 Years (Mid-Level)' },
        { value: '5-8', label: '5-8 Years (Senior)' },
        { value: '8+', label: '8+ Years (Staff/Principal)' }
    ];

    const popularRoles = [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Software Engineer',
        'DevOps Engineer',
        'Data Scientist',
        'Product Manager',
        'UI/UX Designer'
    ];

    const popularCompanies = [
        'Google', 'Meta', 'Amazon', 'Apple', 'Microsoft',
        'Netflix', 'Tesla', 'Spotify', 'Airbnb', 'Uber'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.targetRole || !formData.experience) {
            return;
        }

        setIsCreating(true);
        try {
            await onCreateSession(formData);
            onClose();
            setFormData({
                targetRole: '',
                experience: '',
                topics: '',
                targetCompany: '',
                description: ''
            });
        } catch (error) {
            console.error('Error creating session:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white dark:bg-slate-800 border-2 border-charcoal rounded-md shadow-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between p-4 sm:p-6 border-b-2 border-charcoal/10">
                    <div className="flex-1 pr-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-charcoal dark:text-white">
                            Start a New Interview Journey
                        </h2>
                        <p className="text-sm text-charcoal/50 dark:text-gray-400 mt-1">
                            Fill out a few quick details and unlock your personalized set of interview questions
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-charcoal/5 dark:hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal/50" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Target Role */}
                        <div>
                            <label className="flex items-center gap-2 section-label mb-3">
                                <Briefcase className="w-4 h-4" />
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={formData.targetRole}
                                onChange={(e) => handleInputChange('targetRole', e.target.value)}
                                placeholder="e.g. Frontend Developer, UI/UX Designer, etc."
                                className="w-full p-3 border-2 border-charcoal/20 bg-white dark:bg-slate-700 text-charcoal dark:text-white rounded-md focus:border-charcoal focus:outline-none transition-all"
                                required
                            />
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                                {popularRoles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleInputChange('targetRole', role)}
                                        className={formData.targetRole === role ? 'chip-active' : 'chip-inactive'}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="flex items-center gap-2 section-label mb-3">
                                <Clock className="w-4 h-4" />
                                Years of Experience
                            </label>
                            <select
                                value={formData.experience}
                                onChange={(e) => handleInputChange('experience', e.target.value)}
                                className="w-full p-3 border-2 border-charcoal/20 bg-white dark:bg-slate-700 text-charcoal dark:text-white rounded-md focus:border-charcoal focus:outline-none transition-all"
                                required
                            >
                                <option value="">Select your experience level</option>
                                {experienceOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Two Column Layout for Topics and Company */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Topics */}
                            <div>
                                <label className="flex items-center gap-2 section-label mb-3">
                                    <Target className="w-4 h-4" />
                                    Topics to Focus On
                                </label>
                                <textarea
                                    value={formData.topics}
                                    onChange={(e) => handleInputChange('topics', e.target.value)}
                                    placeholder="Comma-separated, e.g. React, Node.js, MongoDB"
                                    rows={3}
                                    className="w-full p-3 border-2 border-charcoal/20 bg-white dark:bg-slate-700 text-charcoal dark:text-white rounded-md focus:border-charcoal focus:outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Target Company */}
                            <div>
                                <label className="flex items-center gap-2 section-label mb-3">
                                    <Building2 className="w-4 h-4" />
                                    Target Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.targetCompany}
                                    onChange={(e) => handleInputChange('targetCompany', e.target.value)}
                                    placeholder="Search companies like Google, Meta, Amazon..."
                                    className="w-full p-3 border-2 border-charcoal/20 bg-white dark:bg-slate-700 text-charcoal dark:text-white rounded-md focus:border-charcoal focus:outline-none transition-all"
                                />
                                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2">
                                    {popularCompanies.slice(0, 5).map((company) => (
                                        <button
                                            key={company}
                                            type="button"
                                            onClick={() => handleInputChange('targetCompany', company)}
                                            className={formData.targetCompany === company ? 'chip-active' : 'chip-inactive'}
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-charcoal/40 mt-1">
                                    Select a company to get questions specifically asked there
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 section-label mb-3">
                                <FileText className="w-4 h-4" />
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Any specific goals or notes for this session"
                                rows={2}
                                className="w-full p-3 border-2 border-charcoal/20 bg-white dark:bg-slate-700 text-charcoal dark:text-white rounded-md focus:border-charcoal focus:outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-t-2 border-charcoal/10 bg-cream dark:bg-slate-900/50 gap-3 sm:gap-0">
                    <div className="text-xs uppercase tracking-[0.1em] font-semibold text-charcoal/40 text-center sm:text-left">
                        <span className="font-bold text-charcoal/60">Required:</span> Target Role & Experience Level
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal/20 hover:border-charcoal rounded-md transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCreating || !formData.targetRole || !formData.experience}
                            className="flex-1 sm:flex-initial px-6 py-2.5 bg-charcoal text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-charcoal/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInterviewModal;
