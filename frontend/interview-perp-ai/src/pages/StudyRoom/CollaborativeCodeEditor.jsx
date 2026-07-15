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
  const [isEditing, setIsEditing] = useState(true);
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
    try {
      await navigator.clipboard.writeText(editableCode);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
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
    <div className="h-full flex flex-col font-body bg-cream dark:bg-navy relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b-4 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light relative z-20">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onChange(editableCode, e.target.value)}
            className="px-3 py-1.5 border-2 border-charcoal dark:border-cream/40 rounded-sm text-xs font-mono font-bold uppercase tracking-wider focus:outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream cursor-pointer"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] ${
                isEditing 
                  ? 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal dark:border-cream/40' 
                  : 'bg-white dark:bg-navy text-charcoal dark:text-cream border-charcoal dark:border-cream/40'
              }`}
            >
              {isEditing ? 'Live Mode' : 'Edit Code'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Collaborators */}
          <div className="hidden sm:flex items-center gap-1.5 mr-3">
            {participants.filter(p => p.isActive).slice(0, 3).map(participant => (
              <div
                key={participant.userId}
                className="flex items-center gap-1 px-2.5 py-1 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream font-mono font-bold rounded-sm text-[10px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                title={participant.username}
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>{participant.username}</span>
              </div>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Copy code"
          >
            <Copy className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <button
            onClick={downloadCode}
            className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Download code"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Code Editor/Preview */}
      <div className="flex-1 relative overflow-hidden bg-charcoal dark:bg-[#1a1a1a]">
        {isEditing ? (
          <div className="relative h-full">
            <textarea
              ref={textareaRef}
              value={editableCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onSelect={handleCursorMove}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              className="w-full h-full p-6 font-mono text-sm border-none outline-none resize-none bg-charcoal text-emerald-400 dark:bg-[#121212]"
              style={{
                fontFamily: 'Consolas, Monaco, Fira Code, monospace',
                lineHeight: '1.6',
                tabSize: 2
              }}
              placeholder="// Type collaboration script..."
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
                    top: `${cursorData.cursor.line * 1.6 + 1.5}rem`,
                    left: `${cursorData.cursor.column * 0.55 + 1.5}rem`
                  }}
                >
                  <div className="w-0.5 h-5 bg-crimson animate-pulse"></div>
                  <div className="absolute -top-6 left-0 bg-crimson text-white text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                    {cursorData.username}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full overflow-auto bg-charcoal dark:bg-[#121212] border-t-2 border-charcoal/10 dark:border-cream/10">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                height: '100%',
                fontSize: '13px',
                fontFamily: 'Consolas, Monaco, Fira Code, monospace',
                lineHeight: '1.6',
                background: 'transparent'
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: '#4b5563'
              }}
            >
              {editableCode || '// Start coding together!'}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white dark:bg-navy-light rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)] border-3 border-charcoal dark:border-cream/40 p-5 z-30 min-w-[260px]">
          <h3 className="font-display font-bold text-charcoal dark:text-cream text-sm uppercase tracking-wider mb-4">Workspace Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 mb-1.5 uppercase tracking-wider">
                Theme Preset
              </label>
              <select className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm text-xs font-mono font-bold bg-cream dark:bg-navy text-charcoal dark:text-cream outline-none cursor-pointer">
                <option>VS Code Dark</option>
                <option>Classic Charcoal</option>
                <option>Cyberpunk Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 mb-1.5 uppercase tracking-wider">
                Font Size
              </label>
              <select className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm text-xs font-mono font-bold bg-cream dark:bg-navy text-charcoal dark:text-cream outline-none cursor-pointer">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-3">
              <span className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider font-mono">Word Wrap</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-charcoal border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 cursor-pointer bg-cream dark:bg-navy"
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-charcoal/10 dark:border-cream/10">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream py-2 rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all shadow-[1px_1px_0px_0px_var(--color-shadow)]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCodeEditor;
