import React, { useState } from 'react';
import { X, Briefcase, Clock, Target, Building2, FileText } from 'lucide-react';

const CreateInterviewModal = ({ isOpen, onClose, onCreateSession }) => {
    const [formData, setFormData] = useState({
        targetRole: '',
        experience: '',
        topics: '',
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
        'Frontend',
        'Backend',
        'Full Stack',
        'DevOps',
        'Product Manager'
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
        <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden selection:bg-charcoal selection:text-cream">
            <div className="bg-white border-4 border-charcoal rounded-sm shadow-[8px_8px_0px_0px_#1A1A1A] w-full max-w-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-charcoal bg-cream">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-charcoal tracking-wide uppercase">
                            Initialize Session
                        </h2>
                        <p className="text-xs font-mono font-bold text-charcoal/60 mt-1 uppercase tracking-widest">
                            Configure simulation parameters
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 border-2 border-charcoal hover:bg-charcoal hover:text-cream transition-colors rounded-sm group flex-shrink-0"
                    >
                        <X className="w-5 h-5 text-charcoal group-hover:text-cream transition-colors" strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 bg-white font-mono flex-1 custom-scrollbar">
                    <form id="create-session-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Target Role & Experience Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Target Role */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-widest mb-3">
                                    <div className="w-2 h-2 bg-charcoal"></div>
                                    Target Role
                                </label>
                                <input
                                    type="text"
                                    value={formData.targetRole}
                                    onChange={(e) => handleInputChange('targetRole', e.target.value)}
                                    placeholder="e.g. Frontend Developer"
                                    className="w-full p-3 border-4 border-charcoal bg-cream text-charcoal text-sm font-bold placeholder:text-charcoal/30 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all rounded-sm mb-3"
                                    required
                                />
                                <div className="flex flex-wrap gap-2">
                                    {popularRoles.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleInputChange('targetRole', role)}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border-2 border-charcoal rounded-sm transition-all ${
                                                formData.targetRole === role 
                                                ? 'bg-charcoal text-cream' 
                                                : 'bg-white text-charcoal hover:bg-cream'
                                            }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-widest mb-3">
                                    <div className="w-2 h-2 bg-charcoal"></div>
                                    Experience
                                </label>
                                <select
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    className="w-full p-3 border-4 border-charcoal bg-cream text-charcoal text-sm font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all rounded-sm cursor-pointer appearance-none"
                                    required
                                >
                                    <option value="">Select Level</option>
                                    {experienceOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Topics */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-widest mb-3">
                                <div className="w-2 h-2 bg-charcoal"></div>
                                Focus Vectors (Topics)
                            </label>
                            <textarea
                                value={formData.topics}
                                onChange={(e) => handleInputChange('topics', e.target.value)}
                                placeholder="React, System Design, Algorithms..."
                                rows={2}
                                className="w-full p-3 border-4 border-charcoal bg-cream text-charcoal text-sm font-bold placeholder:text-charcoal/30 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all rounded-sm resize-none"
                            />
                        </div>



                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-widest mb-3">
                                <div className="w-2 h-2 bg-charcoal"></div>
                                Additional Parameters
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Specific goals for this simulation..."
                                rows={2}
                                className="w-full p-3 border-4 border-charcoal bg-cream text-charcoal text-sm font-bold placeholder:text-charcoal/30 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all rounded-sm resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-charcoal bg-cream flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] uppercase font-bold text-charcoal/50 tracking-widest text-center sm:text-left">
                        <span className="text-charcoal font-black">REQ:</span> Role & Experience
                    </div>
                    
                    <button
                        type="submit"
                        form="create-session-form"
                        disabled={isCreating || !formData.targetRole || !formData.experience}
                        className="w-full sm:w-auto px-8 py-3 bg-charcoal text-cream font-bold text-xs uppercase tracking-widest border-2 border-charcoal rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {isCreating ? (
                            <>
                                <div className="w-3 h-3 bg-cream animate-ping rounded-sm"></div>
                                Initializing...
                            </>
                        ) : (
                            'Launch Session'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateInterviewModal;
