import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Copy, Download, Settings } from 'lucide-react';

const CollaborativeCodeEditor = ({ 
  code, 
  language, 
  onChange, 
  participants, 
  currentUser, 
  socket 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);
  const [cursors, setCursors] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  useEffect(() => {
    if (socket) {
      socket.on('cursor-updated', (data) => {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            username: data.username,
            cursor: data.cursor,
            selection: data.selection
          }
        }));
      });

      return () => {
        socket.off('cursor-updated');
      };
    }
  }, [socket]);

  const handleCodeChange = (newCode) => {
    setEditableCode(newCode);
    
    // Debounce the onChange to avoid too many socket emissions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newCode);
    }, 300);
  };

  const handleCursorMove = () => {
    if (socket && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursor = {
        line: textarea.value.substr(0, textarea.selectionStart).split('\n').length - 1,
        column: textarea.selectionStart - textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) - 1
      };
      
      const selection = textarea.selectionStart !== textarea.selectionEnd ? {
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      } : null;

      socket.emit('cursor-move', { cursor, selection });
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(editableCode);
    // Add toast notification
  };

  const downloadCode = () => {
    const blob = new Blob([editableCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-room-code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt'
    };
    return extensions[lang] || 'txt';
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' }
  ];

  return (
    <div className="h-full flex flex-col font-body">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b-2 border-charcoal/10 dark:border-cream/10 bg-white dark:bg-navy-light">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onChange(editableCode, e.target.value)}
            className="px-3 py-1 border-2 border-charcoal dark:border-cream/40 rounded-md text-sm focus:outline-none bg-white dark:bg-navy text-charcoal dark:text-cream font-bold uppercase tracking-wider"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider border-2 transition-colors hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer ${
                isEditing 
                  ? 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal dark:border-cream/40' 
                  : 'bg-white dark:bg-navy text-charcoal dark:text-cream border-charcoal dark:border-cream/40'
              }`}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Collaborators */}
          <div className="flex items-center gap-1 mr-3">
            {participants.filter(p => p.isActive).map(participant => (
              <div
                key={participant.userId}
                className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-navy border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream font-bold rounded-sm text-xs uppercase tracking-wider"
                title={participant.username}
              >
                <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-full"></div>
                {participant.username}
              </div>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="p-2 text-charcoal dark:text-cream hover:bg-white dark:hover:bg-navy border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-md transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={downloadCode}
            className="p-2 text-charcoal dark:text-cream hover:bg-white dark:hover:bg-navy border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-md transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-charcoal dark:text-cream hover:bg-white dark:hover:bg-navy border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-md transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor/Preview */}
      <div className="flex-1 relative overflow-hidden">
        {isEditing ? (
          <div className="relative h-full">
            <textarea
              ref={textareaRef}
              value={editableCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onSelect={handleCursorMove}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100"
              style={{
                fontFamily: 'Fira Code, Monaco, Consolas, monospace',
                lineHeight: '1.5',
                tabSize: 2
              }}
              placeholder="Start typing your code here..."
              spellCheck={false}
            />

            {/* Cursor indicators for other users */}
            {Object.entries(cursors).map(([userId, cursorData]) => {
              if (userId === currentUser?._id) return null;
              
              return (
                <div
                  key={userId}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${cursorData.cursor.line * 1.5 + 1}rem`,
                    left: `${cursorData.cursor.column * 0.6 + 1}rem`
                  }}
                >
                  <div className="w-0.5 h-5 bg-red-500 animate-pulse"></div>
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {cursorData.username}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full overflow-auto bg-white dark:bg-[#1e1e1e] border-t-2 border-charcoal/10 dark:border-cream/10">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                height: '100%',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: '#6b7280'
              }}
            >
              {editableCode || '// Start coding together!'}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white dark:bg-navy-light rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] border-2 border-charcoal dark:border-cream/40 p-4 z-10 min-w-64">
          <h3 className="font-display font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">Editor Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-charcoal dark:text-cream mb-1 uppercase tracking-wider">
                Theme
              </label>
              <select className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md text-sm bg-white dark:bg-navy text-charcoal dark:text-cream outline-none">
                <option>VS Code Dark</option>
                <option>VS Code Light</option>
                <option>GitHub Dark</option>
                <option>GitHub Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal dark:text-cream mb-1 uppercase tracking-wider">
                Font Size
              </label>
              <select className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md text-sm bg-white dark:bg-navy text-charcoal dark:text-cream outline-none">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal dark:text-cream uppercase tracking-wider">Word Wrap</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-charcoal border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal dark:text-cream uppercase tracking-wider">Show Minimap</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-charcoal border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-charcoal/10 dark:border-cream/10">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-white dark:bg-navy text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 py-2 px-4 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Code Execution Panel (if applicable) */}
      {(language === 'javascript' || language === 'python') && (
        <div className="border-t-2 border-charcoal/10 dark:border-cream/10 bg-white dark:bg-navy p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-charcoal dark:text-cream uppercase tracking-wider">
              Run Code (Coming Soon)
            </span>
            <button
              disabled
              className="bg-emerald-500 text-white px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm opacity-50 cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCodeEditor;
