import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLanguage } from '../context/LanguageContext';

const SYSTEM_PROMPT = `You are Sakhi, a warm and caring women's health assistant for CycleSakhi app.

STRICT RULES:
- ONLY answer about: periods, PCOD, menstrual health, hormones, diet for menstrual health, lifestyle tips, pain management, stress
- If asked anything else, politely say: "I can only help with menstrual health topics 🌸"
- NEVER give medical diagnoses
- NEVER recommend specific medications
- Always suggest consulting a doctor for serious symptoms
- Keep responses under 100 words
- Use bullet points for lists
- Add relevant emoji for warmth

PERSONALITY:
- Warm, friendly, non-judgmental
- Speaks like a caring elder sister
- Uses simple language, not medical jargon
- Always ends with encouragement

WHEN TO SUGGEST DOCTORS:
- Cycles longer than 35 days
- Severe pain
- Unusual bleeding
- Any concerning symptoms`;

const QUICK_REPLIES = [
  "Why is my period late?",
  "Help with cramps 😣",
  "What is PCOD?",
  "Foods to eat during period",
];

const MOCK_RESPONSES = {
  "why is my period late?": "Periods can be late due to stress, diet changes, weight fluctuations, or hormonal shifts. If it's more than 7 days late, consider a pregnancy test or consult a doctor. Track your cycle consistently for better insights! 🌸",
  "help with cramps": "For cramps:\n• Apply a heating pad on your lower belly\n• Try gentle yoga (child's pose, cat-cow)\n• Ginger or chamomile tea can help\n• Magnesium-rich foods like dark chocolate 🍫\n• Gentle walks also relieve pain\n\nHang in there, you're doing great! 💪",
  "what is pcod?": "PCOD (Polycystic Ovarian Disease) is a hormonal condition where the ovaries produce immature eggs, causing irregular periods and hormonal imbalance. It's very manageable with:\n• Regular exercise 🏃‍♀️\n• Balanced diet\n• Stress management\n• Medical guidance\n\nYou're not alone — it affects 1 in 10 women! 🌸",
  "foods to eat during period": "Best foods during your period:\n• 🫐 Berries — reduce inflammation\n• 🍫 Dark chocolate — eases cramps\n• 🥦 Leafy greens — replenish iron\n• 🐟 Salmon — omega-3 for pain relief\n• 🍌 Bananas — reduce bloating\n\nStay hydrated and avoid processed foods! 💧",
};

const ChatBot = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ text: t('chatbot_greeting'), sender: 'bot' }]);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey === 'your_key_here' || apiKey === 'YOUR_GEMINI_API_KEY') {
        throw new Error('No valid API key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `${SYSTEM_PROMPT}\n\nUser says: "${userText}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    } catch {
      const lowerText = userText.toLowerCase();
      let reply = "That's a great question! 🌸 For menstrual health, I always recommend staying hydrated, eating iron-rich foods, and getting enough rest. Consult your doctor if symptoms are severe. You've got this! 💪";

      for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
        if (lowerText.includes(key.split(' ')[0]) || lowerText.includes(key)) {
          reply = val;
          break;
        }
      }

      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button — sits above bottom tab bar on mobile (mb-20 lg:mb-6) */}
      {!isOpen && (
        <motion.button
          id="chatbot-open"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#FF6B8A] to-pink-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(255,107,138,0.5)] z-40"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-panel"
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={[
              /* Mobile: full-screen overlay */
              'fixed inset-0 z-50 flex flex-col bg-white/98 backdrop-blur-xl',
              /* sm+: corner panel */
              'sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96 sm:h-[580px] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-pink-100',
              /* lg: sits above tab bar (none) but floated over sidebar */
              'lg:bottom-6 lg:right-6',
            ].join(' ')}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF6B8A] to-pink-500 p-4 sm:p-5 flex items-center justify-between flex-shrink-0 sm:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl">🌸</div>
                <div>
                  <p className="font-bold text-white text-sm sm:text-base">Sakhi</p>
                  <p className="text-pink-100 text-xs">Your Health Assistant</p>
                </div>
              </div>
              <button
                id="chatbot-close"
                onClick={() => setIsOpen(false)}
                className="bg-white/20 p-2 min-h-[40px] min-w-[40px] rounded-full hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-pink-50/50 to-white">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#FF6B8A] to-pink-400 text-white rounded-tr-sm shadow-md'
                      : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-1.5 items-center">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-[#FF6B8A] rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies — horizontally scrollable */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide border-t border-gray-100">
              {QUICK_REPLIES.map(r => (
                <button
                  key={r}
                  id={`chatbot-quick-${r.slice(0, 10).replace(/\s/g, '-')}`}
                  onClick={() => sendMessage(r)}
                  className="flex-shrink-0 text-xs bg-pink-50 text-[#FF6B8A] font-medium px-3 py-2 min-h-[36px] rounded-full border border-pink-200 hover:bg-pink-100 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 flex-shrink-0 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-[#FF6B8A] transition-colors">
                <input
                  id="chatbot-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={t('chatbot_placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 min-h-[36px]"
                />
                <button
                  id="chatbot-send"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className={`w-9 h-9 min-h-[36px] rounded-xl flex items-center justify-center transition-all ${
                    input.trim() ? 'bg-[#FF6B8A] text-white shadow-md hover:bg-pink-600' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;