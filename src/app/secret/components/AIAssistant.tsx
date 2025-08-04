'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

const AIAssistant = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-assistant-messages');
    const savedConversation = localStorage.getItem('ai-assistant-conversation');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading saved messages:', error);
        // Initialize with default message if loading fails
        initializeDefaultMessage();
      }
    } else {
      initializeDefaultMessage();
    }

    if (savedConversation) {
      try {
        const parsedConversation = JSON.parse(savedConversation);
        setConversationMessages(parsedConversation);
      } catch (error) {
        console.error('Error loading saved conversation:', error);
      }
    }
  }, [session?.user?.username]);

  const initializeDefaultMessage = () => {
    const defaultMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: `Hey ${session?.user?.username || 'there'}! 👋 I'm your productivity AI assistant with access to all your productivity data. I can help you:

• View and manage your tasks
• Check what team members are listening to
• Monitor study sessions and productivity stats
• Send messages to team chat
• Get leaderboard information
• Update your status

I have memory across our conversations, so I remember what we've talked about. What would you like to work on?`,
      timestamp: new Date()
    };
    setMessages([defaultMessage]);
  };

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-assistant-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (conversationMessages.length > 0) {
      localStorage.setItem('ai-assistant-conversation', JSON.stringify(conversationMessages));
    }
  }, [conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent, customAction?: string) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          messages: conversationMessages // Send the conversation history
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response:', data); // Debug log

      // Update conversation messages with the new ones from the API
      if (data.messages) {
        setConversationMessages(data.messages);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'Sorry, I had trouble processing that.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I had trouble connecting. Please try again!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'What are my current tasks?',
    'What is everyone listening to right now?',
    'Show me the productivity leaderboard',
    'What study sessions are active?',
    'Send a message to team chat saying "Working on some code"',
    'Add a task to review deployment process',
  ];

  const handleQuickAction = async (action: string) => {
    setInputMessage(action);
    
    // Auto-send the quick action
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: action,
          messages: conversationMessages // Send the conversation history
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update conversation messages with the new ones from the API
      if (data.messages) {
        setConversationMessages(data.messages);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'Sorry, I had trouble processing that.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setInputMessage(''); // Clear the input

    } catch (error) {
      console.error('Error with quick action:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I had trouble with that quick action. Please try again!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <CardSpotlight className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-800">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <h2 className="font-aeonik-bold text-xl">AI Assistant</h2>
            <p className="font-aeonik-regular text-sm text-gray-400">
              Your personal productivity companion with memory
            </p>
          </div>
          <button
            onClick={() => {
              setMessages([]);
              setConversationMessages([]);
              localStorage.removeItem('ai-assistant-messages');
              localStorage.removeItem('ai-assistant-conversation');
              initializeDefaultMessage();
            }}
            className="text-gray-400 hover:text-gray-200 text-sm font-aeonik-regular px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition duration-200"
          >
            Clear Chat
          </button>
          <div className="ml-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 border border-gray-700'
                }`}
              >
                <p className="font-aeonik-regular whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm font-aeonik-regular">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-gray-800">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full transition duration-200 font-aeonik-regular"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything or tell me what to do..."
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-6 rounded-lg transition duration-200"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
          
          <p className="text-xs font-aeonik-regular text-gray-500 mt-2 text-center">
            Try: "What are my tasks?" or "What is everyone listening to?" - I remember our conversation!
          </p>
        </div>
      </CardSpotlight>
    </div>
  );
};

export default AIAssistant;
