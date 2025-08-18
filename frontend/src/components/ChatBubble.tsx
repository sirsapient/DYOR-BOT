import React, { useState, useRef, useEffect } from 'react';
import './ChatBubble.css';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  projectContext?: string[];
}

interface ChatBubbleProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isLoading?: boolean;
  projectsInSession: string[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  onSendMessage,
  messages,
  isLoading = false,
  projectsInSession
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const getProjectContextText = () => {
    if (projectsInSession.length === 0) {
      return 'No projects in session';
    }
    if (projectsInSession.length === 1) {
      return `Project: ${projectsInSession[0]}`;
    }
    return `${projectsInSession.length} projects in session`;
  };

  return (
    <div className="chat-bubble-container">
      {!isExpanded ? (
        <button 
          className="chat-bubble-icon"
          onClick={() => setIsExpanded(true)}
          title="Open DYOR Assistant"
        >
          🤖
        </button>
      ) : (
        <div className="chat-bubble-interface">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-title-text">DYOR Assistant</span>
              <span className="chat-project-context">{getProjectContextText()}</span>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsExpanded(false)}
              title="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">🤖</div>
                <div className="welcome-text">
                  <strong>DYOR Assistant</strong>
                  <p>Ask me anything about the projects in your session!</p>
                  {projectsInSession.length === 0 && (
                    <p className="welcome-hint">Search for a project first to get started.</p>
                  )}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`chat-message ${message.type}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  {message.projectContext && message.projectContext.length > 0 && (
                    <div className="message-context">
                      Based on: {message.projectContext.join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="chat-message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={projectsInSession.length > 0 
                ? "Ask about the projects..." 
                : "Search for a project first..."
              }
              className="chat-input"
              disabled={isLoading || projectsInSession.length === 0}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={isLoading || !inputValue.trim() || projectsInSession.length === 0}
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
