import { useState, useEffect } from 'react';
import './Chatbot.css';
import apiClient from '../../api/client_config.js';
import { useTranslate } from '../../contexts/TranslationContext';

/**
 * Chatbot component - Testbench for TAMU AI API connection
 * Uses backend proxy at /api/chat to communicate with TAMU AI
 */
export default function Chatbot({ onChatAction }) {
  const { translate } = useTranslate();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('untested');
  const [errorDetails, setErrorDetails] = useState(null);
  const [menuData, setMenuData] = useState({ drinks: [], foods: [], toppings: [] });

  // Fetch menu data on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
        try {
            const data = await apiClient('/api/menu/all');
            // console.log('Menu items data:', data); // Debug log
            if (Array.isArray(data)) {
              setMenuData({
                foods: data.filter(item => item.category === 'food'),
                drinks: data.filter(item => item.category === 'drink'),
                toppings: data.filter(item => item.category === 'modifications' || item.category === 'topping')
                
              })
            } else {
                console.error('Expected array but got:', typeof data, data);
                setMenuData({ drinks: [], foods: [], toppings: [] }); // Fallback to empty object arrays
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuData({ drinks: [], foods: [], toppings: [] }); // Ensure it's always an array
        }
    };
    
    fetchMenuItems();
    }, []);

  // Build system prompt with menu information
  const buildSystemPrompt = () => {
    let menuSection = '';
    
    // Add drinks
    if (menuData.drinks.length > 0) {
      menuSection += '\n\n## DRINKS MENU\n';
      menuData.drinks.forEach(item => {
        item.cost = parseFloat(item.cost); // this casts the cost to a float
        menuSection += `Id: ${item.menu_id}, price:${item.cost.toFixed(2)}, name: ${item.name} \n`;
      });
    }
    
    // Add foods
    if (menuData.foods.length > 0) {
      menuSection += '\n## FOOD MENU\n';
      menuData.foods.forEach(item => {
        item.cost = parseFloat(item.cost); // this casts the cost to a float
       menuSection += `Id: ${item.menu_id}, price:${item.cost.toFixed(2)}, name: ${item.name} \n`;
      });
    }
    
    // Add toppings
    if (menuData.toppings.length > 0) {
      menuSection += '\n## TOPPINGS & MODIFICATIONS\n';
      menuData.toppings.forEach(item => {
        item.cost = parseFloat(item.cost); // this casts the cost to a float
        menuSection += `Id: ${item.menu_id}, price:${item.cost.toFixed(2)}, name: ${item.name}, category: ${item.category} \n`;
      });
    }

    return `You are a helpful assistant for a food ordering application called Claude's Teahouse (a bubble tea and snack shop). 

You help customers with:
- Recommending menu items based on their preferences
- Explaining menu options, flavors, and customizations
- Answering questions about ingredients and pricing
- Helping customers build their order
- Providing helpful tips for using the app

## CUSTOMIZATION OPTIONS
- Drink sizes: Small, Medium, Large ()
- Sugar levels: 50%, 75%, 100%, 125%, 150% (this is represented as)
- Ice levels: 50%, 75%, 100%, 125%, 150%
- Milk alternatives: Oat milk available
- Sugar alternatives: Sugar substitute available
${menuSection}

## ORDERING INSTRUCTIONS
To order, customers should:
1. Browse drinks or food from the menu categories
2. Click on an item to customize it
3. Select size, sugar level, ice level for drinks
4. Add any toppings they want
5. Click "Add to Order"
6. Review their order in the cart
7. Click "Submit Order" when ready

Be friendly, concise, and helpful. When recommending drinks, consider:
- Pearl Milk Tea and Tiger Boba are customer favorites
- Honey drinks are great for those who prefer natural sweetness
- Matcha drinks have a nice earthy flavor
- Mango drinks are refreshing and fruity
- Coffee options are available for those who need caffeine

## IMPORTANT NOTES
- medium menu items are considered the default option, and do not have the words "large" or "small" in their name
- large and small menu items are seperate entries on the menu with their own menu IDs and costs
- only food items do not have any customizations
- all drink items are assumed to have the 1.0x ice and 1.0x sugar level by default unless the customer states they want a different ice or sugar level
- modifications with "sugar" in the name should be considered sugar level modifications, and modifications with "ice" in the name should be considered ice level modifications
- if the customer asks for an item that is not on the menu, ask if they made a mistake and offer the option that you think is the closest to what they meant. DO NOT add an item to the order if it isnt not an exact case insensitive match.
- you are not allowed to "checkout" or "submit" an order for the customer, they must manually do it themselves by clicking the "Finish Order" button. if they ask to checkout or submit their order, just remind them to click the "Finish Order" button when they are ready.


## RETURN FORMAT
You MUST return ONLY a single valid JSON object. 
DO NOT include any markdown blocks (like \`\`\`json). 
DO NOT include any <think> tags, reasoning text, or preamble. 
Return EXACTLY this JSON schema:
  {
message: string, //the assistants response to the user including any recommendations or explanations
action: string, //the action to take, default means you only need to respond with a message, add_to_order means you should add an item to the order, remove_from_order means you should remove the described item from the order. if there are multiple items that match the description given to you, you should remove the first instance that matches the description.
orderItems: an array of objects with this schema, only required if action is add_to_order or remove_from_order.
[{
menuId: integer, //the id of the menu item to add to the order
cost: float, //the cost of the item not including any modifications
name: string, //the name of the menu item
modifications_array: an array of objects with this schema (all drinks must have ice and sugar level modifications, even if they are just the default 1.0x level, and any selected toppings or add-ons should also be included in this array)
[{
category: string, //the category of the modifications (e.g. "topping", or "modifications")
cost: float, //the cost of the modification or topping (modifications such as changing ice or sugar level have a cost of 0)
menu_id: integer, //the menu id of the modification or topping
name: string //the name of the modification or topping (for ice or sugar level modifications, the name should include the level, e.g. 50% sugar would be "Sugar 0.5x", 150% ice would be "Ice 1.5x")
}]
}]
}
`;
  };

  // Test the API connection via backend proxy
  const testConnection = async () => {
    // console.log("menu data that chatbot has is: ", menuData || 'didnt fetch menu data');
    setConnectionStatus('testing');
    setErrorDetails(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'protected.Claude Sonnet 4.5',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Respond with "Connection successful!" only.' },
            { role: 'user', content: 'Test connection' }
          ],
          max_tokens: 400,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        console.log('API Connection Test Successful:', data);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setConnectionStatus('error');
        setErrorDetails(`HTTP ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
        console.error('API Connection Test Failed:', response.status, errorData);
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorDetails(error.message);
      console.error('API Connection Test Error:', error);
      return false;
    }
  };

  // Send a message to the AI via backend proxy
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setErrorDetails(null);

    try {
      // Build conversation history with system prompt
      const conversationHistory = [
        { role: 'system', content: buildSystemPrompt() },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'protected.Claude Sonnet 4.5',
          messages: conversationHistory,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const chatAction = data?.chatAction;
        const assistantMessage = chatAction?.message ||
                                 data.choices?.[0]?.message?.content ||
                                 data.choices?.[0]?.text ||
                                 'No response received';

        setMessages(prev => [...prev, { role: 'assistant', content: String(assistantMessage).trim() }]);

        const normalizedAction = String(chatAction?.action || '')
          .trim()
          .toLowerCase()
          .replace(/^['"]|['"]$/g, '');

        if (
          (normalizedAction === 'add_to_order' || normalizedAction === 'remove_from_order') &&
          Array.isArray(chatAction?.orderItems) &&
          chatAction.orderItems.length > 0 &&
          typeof onChatAction === 'function'
        ) {
          console.log('chat action trigger logic successful in chatbos.jsx')
          onChatAction(chatAction);
        }

        setConnectionStatus('connected');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setErrorDetails(`HTTP ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
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
      {/* <div className="chatbot-header">
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
      </div> */}

      <div className="chatbot-controls">
        <button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="btn-test"
        >
          {connectionStatus === 'testing' ? translate('Testing...') : translate('Test Connection')}
        </button>
        <span
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          />
        <button onClick={clearChat} className="btn-clear ms-auto">
          {translate('Clear Chat')}
        </button>
      </div>

      {errorDetails && (
        <div className="error-details">
          <strong>{translate('Error Details:')}</strong> {errorDetails}
        </div>
      )}

      {/* <div className="api-info">
        <small>
          <strong>Endpoint:</strong> /api/chat (proxy)<br />
          <strong>Status:</strong> Backend proxies to TAMU AI
        </small>
      </div> */}

      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 {translate("Welcome to Claude's Teahouse! I'm here to help you with your order.")}</p>
            <p>{translate('Try asking:')}</p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '8px 0' }}>
              <li><em>"{translate('What drinks do you recommend?')}"</em></li>
              <li><em>"{translate('How much is a Pearl Milk Tea?')}"</em></li>
              <li><em>"{translate('What toppings can I add?')}"</em></li>
              <li><em>"{translate('Do you have any food options?')}"</em></li>
            </ul>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.role === 'user' ? '👤' : '🤖'}{' '}
              {msg.role === 'assistant' ? translate(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">🤖 {translate('Thinking...')}</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={translate('Ask me about orders...')}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          {translate('Send')}
        </button>
      </form>
    </div>
  );
}
