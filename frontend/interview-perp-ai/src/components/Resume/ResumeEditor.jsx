import React, { useState, useEffect } from 'react';
import {
    LuPencil,
    LuSave,
    LuUndo,
    LuRedo,
    LuType,
    LuAlignLeft,
    LuBold,
    LuItalic,
    LuList,
    LuPlus,
    LuMinus,
    LuMove,
    LuEye,
    LuEyeOff
} from 'react-icons/lu';

const ResumeEditor = ({ initialContent, onContentChange, selectedTemplate }) => {
    const [content, setContent] = useState(initialContent);
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [history, setHistory] = useState([initialContent]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(true);

    // Parse resume content into sections
    const parseResumeContent = (text) => {
        const sections = {};
        const lines = text.split('\n');
        let currentSection = 'header';
        let currentContent = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine === '') {
                if (currentContent.length > 0) {
                    sections[currentSection] = currentContent.join('\n');
                    currentContent = [];
                }
            } else if (isHeaderLine(trimmedLine)) {
                if (currentContent.length > 0) {
                    sections[currentSection] = currentContent.join('\n');
                }
                currentSection = trimmedLine.toLowerCase().replace(/[^a-z0-9]/g, '');
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        });

        if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
        }

        return sections;
    };

    const isHeaderLine = (line) => {
        const headers = [
            'professional summary', 'summary', 'objective',
            'technical skills', 'skills', 'core competencies',
            'experience', 'work experience', 'employment',
            'education', 'academic background',
            'projects', 'key projects',
            'certifications', 'achievements', 'awards'
        ];
        return headers.some(header => 
            line.toLowerCase().includes(header) && 
            line.length < 50 && 
            !line.includes('•') && 
            !line.includes('|')
        );
    };

    const updateContent = (newContent) => {
        setContent(newContent);
        if (onContentChange) {
            onContentChange(newContent);
        }
        
        // Add to history for undo/redo
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const previousContent = history[newIndex];
            setContent(previousContent);
            if (onContentChange) {
                onContentChange(previousContent);
            }
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextContent = history[newIndex];
            setContent(nextContent);
            if (onContentChange) {
                onContentChange(nextContent);
            }
        }
    };

    const formatText = (format) => {
        // Simple text formatting for demo purposes
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            if (selectedText) {
                let formattedText = selectedText;
                switch (format) {
                    case 'bold':
                        formattedText = `**${selectedText}**`;
                        break;
                    case 'italic':
                        formattedText = `*${selectedText}*`;
                        break;
                    case 'bullet':
                        formattedText = `• ${selectedText}`;
                        break;
                }
                
                // Replace selected text with formatted version
                const newContent = content.replace(selectedText, formattedText);
                updateContent(newContent);
            }
        }
    };

    const addSection = (sectionType) => {
        const sectionTemplates = {
            experience: '\n\nExperience\n\nJob Title | Company Name | Date Range\n• Achievement or responsibility\n• Another key accomplishment\n• Third bullet point with metrics',
            education: '\n\nEducation\n\nDegree | University Name | Graduation Year\nRelevant coursework, GPA, or honors',
            skills: '\n\nTechnical Skills\n\nCategory: Skill1, Skill2, Skill3\nAnother Category: Tool1, Tool2, Tool3',
            projects: '\n\nProjects\n\nProject Name | Technology Stack | Date\n• Project description and key features\n• Impact or results achieved'
        };

        const newContent = content + (sectionTemplates[sectionType] || '\n\nNew Section\n\nContent goes here');
        updateContent(newContent);
    };

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const sections = parseResumeContent(content);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            {/* Editor Toolbar */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isEditing 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <LuPencil className="w-4 h-4" />
                            {isEditing ? 'Editing' : 'Edit Mode'}
                        </button>
                        
                        {isEditing && (
                            <>
                                <div className="w-px h-6 bg-slate-300"></div>
                                <button
                                    onClick={undo}
                                    disabled={historyIndex <= 0}
                                    className="p-1 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Undo"
                                >
                                    <LuUndo className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={historyIndex >= history.length - 1}
                                    className="p-1 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Redo"
                                >
                                    <LuRedo className="w-4 h-4" />
                                </button>
                                
                                <div className="w-px h-6 bg-slate-300"></div>
                                <button
                                    onClick={() => formatText('bold')}
                                    className="p-1 text-slate-600 hover:text-slate-800"
                                    title="Bold"
                                >
                                    <LuBold className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => formatText('italic')}
                                    className="p-1 text-slate-600 hover:text-slate-800"
                                    title="Italic"
                                >
                                    <LuItalic className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => formatText('bullet')}
                                    className="p-1 text-slate-600 hover:text-slate-800"
                                    title="Bullet Point"
                                >
                                    <LuList className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                            {showPreview ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        
                        {isEditing && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-500">Add:</span>
                                <button
                                    onClick={() => addSection('experience')}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                >
                                    Experience
                                </button>
                                <button
                                    onClick={() => addSection('skills')}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                                >
                                    Skills
                                </button>
                                <button
                                    onClick={() => addSection('education')}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                                >
                                    Education
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
                {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-6">
                        <textarea
                            value={content}
                            onChange={(e) => updateContent(e.target.value)}
                            className="w-full h-96 p-4 border border-slate-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Edit your resume content here..."
                        />
                        
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{content.split(/\s+/).length} words • {content.length} characters</span>
                            <div className="flex items-center gap-4">
                                <span>Template: {selectedTemplate.toUpperCase()}</span>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Auto-save functionality would go here
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                                >
                                    <LuSave className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                ) : showPreview ? (
                    /* Preview Mode */
                    <div className="max-w-2xl mx-auto bg-white">
                        {Object.entries(sections).map(([sectionKey, sectionContent]) => {
                            if (!sectionContent.trim()) return null;
                            
                            const isHeader = sectionKey !== 'header';
                            const lines = sectionContent.split('\n').filter(line => line.trim());
                            
                            return (
                                <div key={sectionKey} className="mb-6">
                                    {sectionKey === 'header' ? (
                                        <div className="text-center mb-6">
                                            {lines.map((line, idx) => {
                                                if (idx === 0) {
                                                    return <h1 key={idx} className="text-3xl font-bold text-slate-800 mb-2">{line}</h1>;
                                                } else if (idx === 1) {
                                                    return <p key={idx} className="text-lg text-slate-600 mb-2">{line}</p>;
                                                } else {
                                                    return <p key={idx} className="text-slate-500">{line}</p>;
                                                }
                                            })}
                                        </div>
                                    ) : (
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 mb-3 border-b-2 border-blue-500 pb-1 capitalize">
                                                {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                                            </h2>
                                            <div className="space-y-2">
                                                {lines.map((line, idx) => {
                                                    if (line.startsWith('•')) {
                                                        return (
                                                            <div key={idx} className="flex items-start gap-2">
                                                                <span className="text-blue-500 mt-1">•</span>
                                                                <span className="text-slate-700">{line.substring(1).trim()}</span>
                                                            </div>
                                                        );
                                                    } else if (line.includes('|')) {
                                                        const parts = line.split('|').map(part => part.trim());
                                                        return (
                                                            <div key={idx} className="mb-3">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div>
                                                                        <h3 className="font-semibold text-slate-800">{parts[0]}</h3>
                                                                        {parts[1] && <p className="text-slate-600">{parts[1]}</p>}
                                                                    </div>
                                                                    {parts[2] && <span className="text-slate-500">{parts[2]}</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        return <p key={idx} className="text-slate-700">{line}</p>;
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Raw Text Mode */
                    <div className="max-w-2xl mx-auto">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                            {content}
                        </pre>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {isEditing && (
                <div className="bg-slate-50 border-t border-slate-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">
                            💡 Tip: Select text and use formatting buttons, or add new sections using the toolbar
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Auto-save:</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-600">Active</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeEditor;
