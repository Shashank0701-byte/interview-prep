import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

const ChatPanel = ({ messages, newMessage, setNewMessage, onSendMessage, currentUser }) => {
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageTypeStyle = (type) => {
    switch (type) {
      case 'system':
        return 'bg-cream dark:bg-navy border-2 border-dashed border-charcoal/20 dark:border-cream/20 text-charcoal/70 dark:text-cream/70 text-center font-mono text-[10px] uppercase font-bold py-2 px-3 rounded-sm my-1';
      case 'code_share':
        return 'border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-mono text-xs p-2 rounded-sm my-1';
      case 'question_change':
        return 'border-l-4 border-purple-500 bg-purple-500/10 text-purple-800 dark:text-purple-300 font-mono text-xs p-2 rounded-sm my-1';
      default:
        return '';
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🚀', '💡'];

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="card-editorial flex flex-col h-96 bg-white dark:bg-navy-light relative z-10 flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-charcoal/10 dark:border-cream/10 bg-cream dark:bg-navy">
        <h3 className="text-xs font-mono font-bold text-charcoal dark:text-cream flex items-center gap-1.5 uppercase tracking-widest">
          💬 Chat Room
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="text-center text-charcoal/50 dark:text-cream/50 py-12">
            <p className="text-xs font-mono font-bold uppercase tracking-wider">Lobby Quiet</p>
            <p className="text-[10px] font-mono mt-1">Send a message to start collaboration!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`${getMessageTypeStyle(message.type)}`}>
              {message.type === 'system' ? (
                <div>
                  {message.message}
                </div>
              ) : (
                <div className={`flex ${message.userId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] border-2 border-charcoal dark:border-cream/40 font-body ${
                    message.userId === currentUser?._id
                      ? 'bg-charcoal text-white border-charcoal shadow-[2px_2px_0px_0px_var(--color-shadow)]'
                      : 'bg-cream dark:bg-navy text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]'
                  } rounded-sm px-3 py-2`}>
                    {/* Username */}
                    {message.userId !== currentUser?._id && (
                      <div className="text-[10px] font-mono font-bold text-charcoal/80 dark:text-cream/80 uppercase tracking-wider mb-1">
                        {message.username}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="text-xs font-bold leading-relaxed whitespace-pre-wrap break-words">
                      {message.message}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-[9px] font-mono font-bold mt-1 text-right ${
                      message.userId === currentUser?._id
                        ? 'text-white/60'
                        : 'text-charcoal/50 dark:text-cream/50'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t-2 border-charcoal/10 dark:border-cream/10 bg-cream/30 dark:bg-navy/30">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message class..."
              className="w-full px-3 py-2 pr-16 border-2 border-charcoal dark:border-cream/40 rounded-sm resize-none outline-none bg-white dark:bg-navy text-charcoal dark:text-cream font-bold text-xs focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all leading-normal"
              rows="1"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
            
            {/* Emoji and Attachment picker */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-charcoal/40 hover:text-charcoal dark:text-cream/40 dark:hover:text-cream rounded-sm cursor-pointer"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-8 right-0 bg-white dark:bg-navy-light rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)] border-3 border-charcoal dark:border-cream/40 p-2.5 grid grid-cols-6 gap-1 z-20 min-w-[150px]">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="p-1.5 hover:bg-cream dark:hover:bg-navy rounded-sm text-sm cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                className="p-1 text-charcoal/40 hover:text-charcoal dark:text-cream/40 dark:hover:text-cream rounded-sm cursor-pointer"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-charcoal text-white dark:bg-cream dark:text-navy p-2.5 border-2 border-charcoal dark:border-cream rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            title="Send"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowEmojiPicker(false)}
        ></div>
      )}
    </div>
  );
};

export default ChatPanel;
