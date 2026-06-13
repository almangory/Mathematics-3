import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, ArrowLeft, Star, Volume2, Award } from 'lucide-react';
import { numberToArabicWords } from '../utils/mathHelpers';
import { soundEffects } from '../utils/audio';

interface AbacusGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function AbacusGame({ onBack, onAddStars }: AbacusGameProps) {
  // Abacus columns: thousands, hundreds, tens, units
  const [thousands, setThousands] = useState(1);
  const [hundreds, setHundreds] = useState(5);
  const [tens, setTens] = useState(1);
  const [units, setUnits] = useState(0);

  const [mode, setMode] = useState<'explore' | 'challenge'>('explore');
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [starsWon, setStarsWon] = useState(0);

  const currentNumber = thousands * 1000 + hundreds * 100 + tens * 10 + units;

  useEffect(() => {
    if (mode === 'challenge') {
      generateChallenge();
    }
  }, [mode]);

  const generateChallenge = () => {
    // Generate a child-friendly 4-digit number
    // We can pull from the textbook examples (3583, 2497, 7350, 4303, 1510, 2073)
    const textbookExamples = [3583, 2497, 7350, 4303, 1510, 2073, 1260, 3210, 2001, 3027];
    const rand = textbookExamples[Math.floor(Math.random() * textbookExamples.length)];
    setTargetNumber(rand);
    setMessage('مرحباً بك في تحدي حسون! هل يمكنك تمثيل هذا العدد على العداد؟');
    setIsSuccess(null);
    // Reset abacus to random state so they have to work it out
    setThousands(1);
    setHundreds(0);
    setTens(0);
    setUnits(0);
  };

  const handleVerify = () => {
    if (currentNumber === targetNumber) {
      soundEffects.playStar();
      setIsSuccess(true);
      setMessage('يا سلام عليك يا عبقري! إجابة صحيحة هنيئاً لك نجمة ذهبية! ⭐');
      setStarsWon(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setIsSuccess(false);
      
      const targetTh = Math.floor(targetNumber / 1000);
      const targetH = Math.floor((targetNumber % 1000) / 100);
      const targetT = Math.floor((targetNumber % 100) / 10);
      const targetU = targetNumber % 10;

      setMessage(`أوه، الإجابة غير دقيقة! العدد المستهدف هو ${targetNumber}، وتمثيله الصحيح: [ألوف = ${targetTh}، مئات = ${targetH}، عشرات = ${targetT}، آحاد = ${targetU}]. اضبط الخانات وصحح العداد!`);
    }
  };

  const adjustColumn = (col: 'th' | 'h' | 't' | 'u', val: number) => {
    soundEffects.playBeep();
    if (col === 'th') {
      setThousands(prev => Math.max(0, Math.min(9, prev + val)));
    } else if (col === 'h') {
      setHundreds(prev => Math.max(0, Math.min(9, prev + val)));
    } else if (col === 't') {
      setTens(prev => Math.max(0, Math.min(9, prev + val)));
    } else if (col === 'u') {
      setUnits(prev => Math.max(0, Math.min(9, prev + val)));
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD'; // Arabic
      window.speechSynthesis.speak(utterance);
    }
  };

  // Predefined gorgeous colors for the beads
  const colors = {
    th: 'bg-rose-500 shadow-rose-300',
    h: 'bg-amber-500 shadow-amber-300',
    t: 'bg-emerald-500 shadow-emerald-300',
    u: 'bg-sky-500 shadow-sky-300',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-amber-400">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 flex items-center justify-between text-white">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-amber-600/30 hover:bg-amber-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع للمطالعة
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-100 fill-yellow-100" /> مغامرة العداد الذكي
        </h2>
        <div className="flex items-center gap-2 bg-amber-600 bg-opacity-30 px-4 py-1.5 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-bold">{starsWon} ⭐</span>
        </div>
      </div>

      <div className="p-6">
        {/* Toggle Mode Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('explore')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              mode === 'explore' 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            🧭 الاستكشاف الحر
          </button>
          <button
            onClick={() => setMode('challenge')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              mode === 'challenge' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            🎯 تحدّي حسون
          </button>
        </div>

        {/* Informational Prompt */}
        <div className="bg-sky-50 rounded-2xl p-4 mb-6 relative border-2 border-sky-200 flex items-start gap-4">
          <img 
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='70' font-size='70'>🦜</text></svg>" 
            alt="حسون الببغاء" 
            className="w-16 h-16 animate-bounce"
          />
          <div className="flex-1 text-right">
            <h4 className="text-sky-800 font-bold text-lg mb-1">المرشد الذكي حسون:</h4>
            {mode === 'explore' ? (
              <p className="text-sky-700">
                أهلاً بك يا بطل! قم بزيادة الخرزات أو إنقاصها على العداد لتقرأ الأرقام المكونة من أربع خانات: 
                <strong> (الآحاد، العشرات، المئات، الألوف)</strong>. انظر كيف يتغير النطق وسير الأعداد!
              </p>
            ) : (
              <div>
                <p className="text-sky-800 font-semibold mb-2">{message}</p>
                <div className="bg-emerald-100 border-2 border-emerald-400 rounded-xl p-3 inline-block font-black text-2xl text-emerald-800 tracking-wide px-8">
                  {targetNumber}
                </div>
                <div className="mt-2 text-sm text-sky-600">
                  {numberToArabicWords(targetNumber)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactivity Area */}
        <div className="bg-orange-50/50 rounded-3xl p-6 border-4 border-dashed border-orange-200 mb-6">
          <div className="relative h-72 w-full max-w-lg mx-auto flex items-end justify-around pb-6 bg-amber-900 bg-opacity-5 rounded-2xl p-4 border-2 border-orange-100">
            {/* Horizontal wood beam */}
            <div className="absolute bottom-6 left-0 right-0 h-4 bg-amber-800 rounded-lg shadow-md z-0" />
            
            {/* The 4 wires: thousands, hundreds, tens, units */}
            {[
              { label: 'ألوف', value: thousands, color: colors.th, key: 'th' },
              { label: 'مئات', value: hundreds, color: colors.h, key: 'h' },
              { label: 'عشرات', value: tens, color: colors.t, key: 't' },
              { label: 'آحاد', value: units, color: colors.u, key: 'u' },
            ].map((col) => (
              <div key={col.key} className="flex flex-col items-center relative h-full w-20">
                {/* Vertical wires */}
                <div className="absolute top-2 bottom-6 w-1.5 bg-gray-400 rounded-full z-0 shadow-inner" />

                {/* Beads Stack */}
                <div className="absolute bottom-6 flex flex-col-reverse items-center justify-start w-full gap-0.5 z-10">
                  {Array.from({ length: col.value }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                      className={`w-14 h-5 rounded-full ${col.color} border-2 border-white shadow-md cursor-pointer hover:brightness-110 flex items-center justify-center`}
                      onClick={() => adjustColumn(col.key as any, -1)}
                    >
                      <div className="w-10 h-1 bg-white opacity-40 rounded-full" />
                    </motion.div>
                  ))}
                </div>

                {/* Label Base at bottom */}
                <div className="absolute -bottom-2 bg-amber-800 text-white text-xs font-bold px-3 py-1 rounded shadow-md z-20 w-16 text-center">
                  {col.label}
                  <span className="block text-yellow-300 font-extrabold text-sm">{col.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Plus / Minus Control Pad for kids (especially helpful on mobile!) */}
          <div className="flex justify-around max-w-lg mx-auto mt-4 px-2">
            {[
              { key: 'th' as const, label: 'ألوف' },
              { key: 'h' as const, label: 'مئات' },
              { key: 't' as const, label: 'عشرات' },
              { key: 'u' as const, label: 'آحاد' },
            ].map((col) => (
              <div key={col.key} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => adjustColumn(col.key, 1)}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-full shadow-md flex items-center justify-center text-lg active:scale-90 transition-transform"
                >
                  +
                </button>
                <span className="text-xs font-bold text-gray-500">{col.label}</span>
                <button
                  onClick={() => adjustColumn(col.key, -1)}
                  className="w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-full shadow-md flex items-center justify-center text-lg active:scale-90 transition-transform"
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Display Current Numeric Value */}
        <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200 max-w-2xl mx-auto text-center shadow-inner">
          <div className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-1">العدد الحالي على العداد</div>
          <div className="text-5xl font-black text-amber-900 tracking-wider mb-2 select-all">
            {currentNumber.toString().padStart(4, '0')}
          </div>
          <div className="text-lg font-bold text-sky-800 flex items-center justify-center gap-2">
            <span>{numberToArabicWords(currentNumber)}</span>
            <button 
              onClick={() => speakText(numberToArabicWords(currentNumber))}
              className="p-1.5 bg-sky-100 hover:bg-sky-200 rounded-full text-sky-800 hover:scale-110 active:scale-95 transition-all"
              title="انطق العدد"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Button for Challenge mode */}
        {mode === 'challenge' && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={handleVerify}
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl rounded-full shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Award className="w-6 h-6 animate-pulse" /> تحقق من الإجابة بالعداد!
            </button>
            {isSuccess && (
              <button
                onClick={generateChallenge}
                className="mt-2 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full text-sm shadow-md transition-all active:scale-95 translate-y-1"
              >
                لعبة جديدة 🔄
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
