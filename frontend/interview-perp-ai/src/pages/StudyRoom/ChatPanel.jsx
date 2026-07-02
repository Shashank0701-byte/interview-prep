import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';

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
        return 'bg-blue-50 text-blue-700 text-center italic';
      case 'code_share':
        return 'bg-green-50 text-green-700';
      case 'question_change':
        return 'bg-purple-50 text-purple-700';
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
    <div className="card-editorial flex flex-col h-96 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-charcoal/10">
        <h3 className="text-lg font-display font-bold text-charcoal flex items-center gap-2 uppercase tracking-wider">
          💬 Chat
        </h3>
        <button className="p-1 text-charcoal/60 hover:text-charcoal rounded">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-charcoal/60 py-8">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1 font-medium">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`${getMessageTypeStyle(message.type)}`}>
              {message.type === 'system' ? (
                <div className="py-2 px-3 rounded-lg text-xs">
                  {message.message}
                </div>
              ) : (
                <div className={`flex ${message.userId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md border-2 border-charcoal font-medium ${
                    message.userId === currentUser?._id
                      ? 'bg-charcoal text-white'
                      : 'bg-cream text-charcoal'
                  } rounded-md px-3 py-2`}>
                    {/* Username for others' messages */}
                    {message.userId !== currentUser?._id && (
                      <div className="text-xs font-bold text-charcoal/80 mb-1">
                        {message.username}
                      </div>
                    )}
                    
                    {/* Message content */}
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs mt-1 font-bold ${
                      message.userId === currentUser?._id
                        ? 'text-white/60'
                        : 'text-charcoal/60'
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

      {/* Input */}
      <div className="p-4 border-t-2 border-charcoal/10">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 pr-20 border-2 border-charcoal rounded-md resize-none focus:outline-none bg-cream text-charcoal font-medium"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Emoji and attachment buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                
                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-lg border p-2 grid grid-cols-6 gap-1 z-10">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-charcoal text-white p-2 border-2 border-charcoal rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Typing indicator */}
        <div className="mt-2 text-xs text-gray-500 h-4">
          {/* You can add typing indicators here */}
        </div>
      </div>

      {/* Click outside to close emoji picker */}
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
