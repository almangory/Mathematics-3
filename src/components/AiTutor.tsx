import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Sparkles, Trophy, HelpCircle, Volume2, Bot, Hourglass } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface AiTutorProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Message {
  sender: 'user' | 'tutor';
  text: string;
}

export default function AiTutor({ onBack, onAddStars }: AiTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'tutor',
      text: 'مرحباً بك يا بطل الصف الثالث الابتدائي! 🦜 أنا مرشدك الذكي "حسون"، بطل الرياضيات في مدرستنا الغابة السودانية! هل لديك سؤال عن الضرب، الجداول، القسمة، الكسور، أو الساعات الجميلة؟ اسألني لأشرح لك فوراً بطريقة ممتعة للغاية!'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested direct prompt shortcuts for children
  const suggestions = [
    { text: 'اشرح لي جدول ضرب السبعة بمثال لطيف 🍎', prompt: 'اشرح لي جدول ضرب السبعة بمثّل لطيف وقصة سهلة للأطفال' },
    { text: 'كيف أعرف إن الكسرين متكافئان؟ 🍕', prompt: 'كيف أعرف إن الكسرين متكافئان وشرح مبسط بمثال البيتزا للأطفال' },
    { text: 'مسألة لفظية ممتعة عن الطيور في سوداننا الحبيب 🇸🇩', prompt: 'أعطني مسألة لفظية رياضية ممتعة ومحلولة تناسب الصف الثالث عن الطيور والرحلات في السودان' },
    { text: 'ما الفرق بين المربع والمستطيل والقطع الهندسية؟ 📐', prompt: 'ما الفرق بين المربع والمستطيل والقطع الهندسية في كتاب الصف الثالث بمميزاتها؟' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Clean markdown tags out of speech for child-friendliness
      const formatted = text.replace(/[*#_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(formatted);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    soundEffects.playBeep();
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    if (!customPrompt) setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await response.json();
      if (data.status === 'ok' && data.explanation) {
        setMessages(prev => [...prev, { sender: 'tutor', text: data.explanation }]);
        soundEffects.playCorrect();
        onAddStars(3); // reward user for querying educational tutor!
      } else {
        setMessages(prev => [...prev, { 
          sender: 'tutor', 
          text: 'أعتذر يا صديقي البطل! يبدو أن البالونات تطايرت وحدث عطل مؤقت في التواصل مع حسون المساعد. هل يمكنك المحاولة مرة أخرى لاحقاً؟'
        }]);
        soundEffects.playError();
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'tutor', 
        text: 'أوه، واجهنا صعوبة في شبكة غابة الأرقام. تذكر أن حسون يحب المحاولة وسينتظرك مجدداً!'
      }]);
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-400 flex flex-col h-[600px]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-5 flex items-center justify-between text-white shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-sky-600/30 hover:bg-sky-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع للمطالعة
        </button>
        <h2 className="text-xl font-bold flex items-center gap-2">
          🗣️ المرشد الحكيم حسون (معاد الذكاء الاصطناعي)
        </h2>
        <div className="bg-sky-600 bg-opacity-30 p-2 rounded-full px-3 text-xs font-bold">
          مساعد الصف الثالث
        </div>
      </div>

      {/* Messages area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 text-right">
        {/* Tutor Initial Avatar Info Card */}
        <div className="bg-gradient-to-l from-sky-500/10 to-transparent p-4 rounded-2xl border border-sky-100 flex items-start gap-4 mb-2">
          <span className="text-5xl shrink-0 animate-bounce">🦜</span>
          <div className="flex-1">
            <h4 className="font-extrabold text-sky-800 text-sm">الببغاء الذكي حسون:</h4>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
              مرشد معتمد لكتاب الرياضيات السوداني للصف الثالث الابتدائي. يجيب على الأسئلة بروح وطنية مشجعة للأطفال مستعيناً بالأمثلة التوضيحية الملموسة.
            </p>
          </div>
        </div>

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-3 max-w-xl max-w-full ${
              msg.sender === 'user' ? 'justify-start' : 'justify-end'
            }`}
          >
            {msg.sender === 'user' ? (
              <div className="flex items-start gap-3">
                <div className="bg-sky-600 text-white rounded-2xl p-3 px-4 text-sm font-bold shadow-md break-words max-w-[80%]">
                  {msg.text}
                </div>
                <span className="text-3xl">👦</span>
              </div>
            ) : (
              <div className="flex items-start gap-3 justify-end">
                <span className="text-3xl shrink-0">🦜</span>
                <div className="bg-white text-gray-800 rounded-3xl p-4 border-2 border-sky-100 text-right leading-relaxed text-sm shadow-sm max-w-[80%] whitespace-pre-wrap">
                  {msg.text}
                  <div className="mt-3 border-t border-slate-100 pt-2 flex justify-start">
                    <button
                      onClick={() => speakText(msg.text)}
                      className="p-1 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-full flex items-center gap-1 transition-all active:scale-95"
                      title="استمع للمعلومة بصوت مسموع"
                    >
                      <Volume2 className="w-4 h-4" /> استمع للشرح بصوت حسون
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 justify-end">
            <span className="text-2xl animate-spin">⏳</span>
            <div className="bg-white/80 p-3 rounded-2xl border border-dashed border-sky-200 text-xs italic text-gray-500">
              حسون يفكر ويجمع بالونات الأرقام لك ببراعة...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested choices (Shrink-0) */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2 justify-center scroll-all select-none">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug.prompt)}
            className="p-1.5 px-3 bg-white hover:bg-sky-50 text-sky-800 text-[11px] font-bold rounded-full border border-sky-200 shadow-sm transition-transform active:scale-95 cursor-pointer max-w-sm truncate"
          >
            {sug.text}
          </button>
        ))}
      </div>

      {/* Bottom Input typing panel */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0">
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className={`p-3 rounded-2xl text-white shadow-md active:scale-95 transition-all flex items-center justify-center ${
            inputText.trim() ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="افترض سؤالاً: كيف نختصر الكسر ١٢ / ١٨؟"
          className="flex-1 py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-right text-sm focus:outline-none focus:border-sky-400 focus:bg-white shadow-inner font-extrabold"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
      </div>
    </div>
  );
}
