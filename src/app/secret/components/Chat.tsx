'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
  isPending?: boolean;
}

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      user_id: parseInt(session.user.id as string),
      username: session.user.username || session.user.name || 'You',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      isPending: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        // Replace the pending message with the actual message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...sentMessage, isPending: false }
              : msg
          )
        );
      } else {
        // Remove the optimistic message if sending failed
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageToSend); // Restore the message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageToSend); // Restore the message
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/chat/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Adelaide'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Convert to Adelaide time for comparison
    const adelaideDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Adelaide' }));
    const adelaideToday = new Date(today.toLocaleString('en-US', { timeZone: 'Australia/Adelaide' }));
    const adelaideYesterday = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Australia/Adelaide' }));

    if (adelaideDate.toDateString() === adelaideToday.toDateString()) {
      return 'Today';
    } else if (adelaideDate.toDateString() === adelaideYesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return adelaideDate.toLocaleDateString('en-AU', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'Australia/Adelaide'
      });
    }
  };

  const renderMessageWithLinks = (text: string) => {
    // URL regex that matches http/https URLs and naked domains
    const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.(?:[a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})(?:\/[^\s]*)?)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        let href = part;
        // Add protocol if missing
        if (!part.startsWith('http://') && !part.startsWith('https://')) {
          href = 'https://' + part;
        }
        
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      // Convert to Adelaide time for grouping
      const adelaideDate = new Date(message.created_at).toLocaleDateString('en-AU', {
        timeZone: 'Australia/Adelaide'
      });
      if (!groups[adelaideDate]) {
        groups[adelaideDate] = [];
      }
      groups[adelaideDate].push(message);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-[900px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💬</span>
          <div>
            <h2 className="font-aeonik-bold text-lg">Team Chat</h2>
            <p className="font-aeonik-regular text-sm text-gray-400">
              Stay connected with your team
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-aeonik-regular text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messageGroups.length > 0 ? (
          messageGroups.map(([date, dayMessages]) => (
            <div key={date} className="space-y-4">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="px-4 text-xs font-aeonik-regular text-gray-500 bg-black">
                  {formatDate(date)}
                </span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-6 ${
                      message.username === session?.user?.username ? 'justify-end' : 'justify-start'
                    } ${message.isPending ? 'opacity-50' : ''}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-opacity duration-200 ${
                        message.username === session?.user?.username
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-white'
                      } ${message.isPending ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-aeonik-medium opacity-75">
                          {message.username}
                        </span>
                        {message.username === session?.user?.username && (
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="text-xs opacity-50 hover:opacity-100 ml-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <p className="font-aeonik-regular text-sm">
                        {renderMessageWithLinks(message.message)}
                      </p>
                      <div className="text-xs opacity-50 mt-1 flex items-center gap-1">
                        {message.isPending ? (
                          <>
                            <span className="animate-pulse">sending...</span>
                          </>
                        ) : (
                          formatTime(message.created_at)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="font-aeonik-regular text-gray-400">No messages yet</p>
              <p className="font-aeonik-regular text-gray-500 text-sm">
                Start the conversation!
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-6 rounded-lg transition duration-200"
          >
            Send
          </button>
        </form>
        <div className="flex justify-center mt-2">
          <p className="text-xs font-aeonik-regular text-gray-500">
            Press Enter to send • Messages refresh automatically
          </p>
        </div>
      </div>

      {/* Online Users Indicator */}
      <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-aeonik-regular text-gray-400">Team:</span>
          <div className="flex space-x-2">
            {['giordan', 'ghazi', 'kalan', 'asad'].map((username) => (
              <span
                key={username}
                className={`text-xs px-2 py-1 rounded ${
                  username === session?.user?.username
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {username}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
