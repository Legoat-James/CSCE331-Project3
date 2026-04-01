import { useState } from 'react';
import './Chatbot.css';

const TAMUS_AI_ENDPOINT = import.meta.env.VITE_TAMUS_AI_CHAT_API_ENDPOINT;
const TAMUS_AI_KEY = import.meta.env.VITE_TAMUS_AI_CHAT_API_KEY;

/**
 * Chatbot component - Testbench for TAMU AI API connection
 * Tests connectivity with Claude models via TAMU's AI chat endpoint
 */
export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('untested');
  const [errorDetails, setErrorDetails] = useState(null);

  // System prompt to guide the chatbot's behavior for the food ordering app
  const systemPrompt = `You are a helpful assistant for a food ordering application called Claudes Teahouse. 
You help customers with:
- Placing orders for menu items like bagel sandwiches, bowls, plates, and other food items
- Explaining menu options and customizations
- Answering questions about the ordering process
- Providing helpful tips for using the app

Be friendly, concise, and helpful. If you don't know something specific about the menu, 
suggest that the customer check the menu board or ask a staff member.`;

  // Test the API connection
  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorDetails(null);
    
    try {
      const response = await fetch(`${TAMUS_AI_ENDPOINT}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TAMUS_AI_KEY}`,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250514',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Respond with "Connection successful!" only.' },
            { role: 'user', content: 'Test connection' }
          ],
          max_tokens: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        console.log('API Connection Test Successful:', data);
        return true;
      } else {
        const errorText = await response.text();
        setConnectionStatus('error');
        setErrorDetails(`HTTP ${response.status}: ${errorText}`);
        console.error('API Connection Test Failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorDetails(error.message);
      console.error('API Connection Test Error:', error);
      return false;
    }
  };

  // Send a message to the AI
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setErrorDetails(null);

    try {
      // Build conversation history for context
      const conversationHistory = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(`${TAMUS_AI_ENDPOINT}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TAMUS_AI_KEY}`,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250514',
          messages: conversationHistory,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        setConnectionStatus('connected');
      } else {
        const errorText = await response.text();
        setErrorDetails(`HTTP ${response.status}: ${errorText}`);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: Unable to get response (${response.status})` 
        }]);
      }
    } catch (error) {
      setErrorDetails(error.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setErrorDetails(null);
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      case 'testing': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>🤖 AI Assistant (Testbench)</h3>
        <div className="connection-status">
          <span 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">
            {connectionStatus === 'untested' && 'Not tested'}
            {connectionStatus === 'testing' && 'Testing...'}
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'error' && 'Error'}
          </span>
        </div>
      </div>

      <div className="chatbot-controls">
        <button 
          onClick={testConnection} 
          disabled={connectionStatus === 'testing'}
          className="btn-test"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </button>
        <button onClick={clearChat} className="btn-clear">
          Clear Chat
        </button>
      </div>

      {errorDetails && (
        <div className="error-details">
          <strong>Error Details:</strong> {errorDetails}
        </div>
      )}

      <div className="api-info">
        <small>
          <strong>Endpoint:</strong> {TAMUS_AI_ENDPOINT || 'Not configured'}<br />
          <strong>API Key:</strong> {TAMUS_AI_KEY ? '***configured***' : 'Not configured'}
        </small>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Welcome! I am here to help you with ordering.</p>
            <p>Try asking: <em>"How can I place an order for a bagel sandwich?"</em></p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.role === 'user' ? '👤' : '🤖'} {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">�� Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask me anything about ordering..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
