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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onChange(editableCode, e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isEditing 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                title={participant.username}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {participant.username}
              </div>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={downloadCode}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="h-full overflow-auto">
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
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border p-4 z-10 min-w-64">
          <h3 className="font-semibold text-gray-800 mb-3">Editor Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>VS Code Dark</option>
                <option>VS Code Light</option>
                <option>GitHub Dark</option>
                <option>GitHub Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Word Wrap</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Show Minimap</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Code Execution Panel (if applicable) */}
      {(language === 'javascript' || language === 'python') && (
        <div className="border-t bg-gray-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Run Code (Coming Soon)
            </span>
            <button
              disabled
              className="bg-green-500 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2"
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
