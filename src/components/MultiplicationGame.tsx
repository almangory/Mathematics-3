import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Heart, HelpCircle, ShieldQuestion, Star } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface MultiplicationGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Question {
  text: string;
  answer: number;
  options: number[];
  hint: string;
}

export default function MultiplicationGame({ onBack, onAddStars }: MultiplicationGameProps) {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [question, setQuestion] = useState<Question | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [balloonFloating, setBalloonFloating] = useState<boolean>(true);

  // Generate a customized question based on the chosen textbook level
  const generateQuestion = (currentLevel: number) => {
    setShowHint(false);
    setBalloonFloating(true);

    let num1 = 1;
    let num2 = 1;
    let text = '';
    let answer = 0;
    let hint = '';

    if (currentLevel === 1) {
      // Level 1: Multiplications of 0 and 1 (Book page 18)
      num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
      num2 = Math.random() > 0.5 ? 0 : 1;
      answer = num1 * num2;
      text = `${num1} × ${num2}`;
      hint = num2 === 0 ? "قاعدة: أي عدد تضربه في صفر، يختفي ويصبح الناتج صفراً!" : "قاعدة: أي عدد تضربه في واحد، يظل ثابتاً كما هو دون تغيّر!";
    } else if (currentLevel === 2) {
      // Level 2: Table of 7 (Book page 20)
      num1 = 7;
      num2 = Math.floor(Math.random() * 10) + 1; // 7x1 to 7x10
      answer = num1 * num2;
      text = `٧ × ${num2}`;
      hint = `٧ × ${num2} تعني جمع الرقم ٧ مكرراً ${num2} من المرات!`;
    } else if (currentLevel === 3) {
      // Level 3: Table of 8 (Book page 23)
      num1 = 8;
      num2 = Math.floor(Math.random() * 10) + 1; // 8x1 to 8x10
      answer = num1 * num2;
      text = `٨ × ${num2}`;
      hint = `٨ × ${num2} تعني جمع الرقم ٨ مكرراً ${num2} من المرات!`;
    } else if (currentLevel === 4) {
      // Level 4: Table of 9 (Book page 26)
      num1 = 9;
      num2 = Math.floor(Math.random() * 10) + 1; // 9x1 to 9x10
      answer = num1 * num2;
      text = `٩ × ${num2}`;
      hint = `هل تذكر طريقة أصابع اليد لجدول ٩؟ حاصل ضرب ٩ في ${num2} هو ${answer}!`;
    } else {
      // Level 5: Multiples of 10 & Distributive property (Book page 29 & 36)
      const choice = Math.random() > 0.5;
      if (choice) {
        // Multiples of 10
        const multiples = [10, 20, 30, 40, 50, 60, 70, 80, 90];
        num1 = multiples[Math.floor(Math.random() * multiples.length)];
        num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        answer = num1 * num2;
        text = `${num1} × ${num2}`;
        hint = `قاعدة: اضرب الأرقام الباقية أولاً ثم ضع الصفر على يمين الناتج! مثلاً اضرب ${num1 / 10} في ${num2}.`;
      } else {
        // Distributive property
        // Let's do numbers like 15x3 (page 36: three times 15 is 45) or 18x7
        const pairs = [
          { a: 15, b: 3, h: "١٥ × ٣ = (١٠ + ٥) × ٣ = ٣٠ + ١٥" },
          { a: 18, b: 7, h: "١٨ × ٧ = (١٠ + ٨) × ٧ = ٧٠ + ٥٦" },
          { a: 24, b: 5, h: "٢٤ × ٥ = (٢٠ + ٤) × ٥ = ١٠٠ + ٢٠" },
          { a: 12, b: 6, h: "١٢ × ٦ = (١٠ + ٢) × ٦ = ٦٠ + ١٢" },
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        num1 = pick.a;
        num2 = pick.b;
        answer = num1 * num2;
        text = `${num1} × ${num2}`;
        hint = `خاصية التوزيع: ${pick.h}`;
      }
    }

    // Generate option distractors
    const optionsSet = new Set<number>();
    optionsSet.add(answer);
    while (optionsSet.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const possible = Math.max(0, answer + offset);
      optionsSet.add(possible);
    }

    setQuestion({
      text,
      answer,
      options: shuffleArray(Array.from(optionsSet)),
      hint,
    });
  };

  const shuffleArray = (arr: any[]) => {
    return arr.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    generateQuestion(level);
  }, [level]);

  const handlePop = (selected: number) => {
    if (!question) return;

    if (selected === question.answer) {
      soundEffects.playPop();
      setScore(prev => prev + 10);
      onAddStars(2);

      // Check for level up
      if (score + 10 >= 50) {
        if (level < 5) {
          soundEffects.playStar();
          setLevel(prev => prev + 1);
          setScore(0);
        } else {
          soundEffects.playCorrect();
          setIsWin(true);
        }
      } else {
        generateQuestion(level);
      }
    } else {
      soundEffects.playError();
      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
        return nextLives;
      });
      generateQuestion(level);
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsWin(false);
    generateQuestion(1);
  };

  // Fun color configurations for the floating balloons
  const balloonColors = [
    'from-rose-400 to-rose-600',
    'from-sky-400 to-sky-600',
    'from-emerald-400 to-emerald-600',
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-400">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 flex items-center justify-between text-white">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-sky-600/30 hover:bg-sky-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold animate-pulse"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع للمطالعة
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎈 مدرسة البالونات وجدول الضرب
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-5 h-5 ${idx < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="bg-sky-600 bg-opacity-30 px-4 py-1.5 rounded-full font-bold">
            درجات: {score}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Unit Info Tabs */}
        <div className="grid grid-cols-5 gap-2 mb-6 text-center text-xs font-black">
          {[
            '1️⃣ أساسيات (٠، ١)',
            '2️⃣ جدول السبعة (٧)',
            '3️⃣ جدول الثمانية (٨)',
            '4️⃣ جدول التسعة (٩)',
            '5️⃣ التوزيع والمضاعفات',
          ].map((title, idx) => (
            <div 
              key={idx}
              className={`p-2.5 rounded-xl border ${
                level === idx + 1 
                  ? 'bg-sky-500 text-white border-sky-600 shadow-md transform scale-105' 
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {title}
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="bg-rose-50 rounded-3xl p-8 border-4 border-rose-200 text-center max-w-md mx-auto my-8">
            <span className="text-6xl text-rose-500 block mb-4">😢</span>
            <h3 className="text-2xl font-black text-rose-800 mb-2">انتهت المحاولات!</h3>
            <p className="text-rose-600 mb-6">لا تحزن يا بطل! الفشل هو خطوة في طريق العلم. تعلم من جدول الضرب وحاول مجدداً لتفوز!</p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95"
            >
              العب مجدداً 🔄
            </button>
          </div>
        )}

        {isWin && (
          <div className="bg-emerald-50 rounded-3xl p-8 border-4 border-emerald-200 text-center max-w-md mx-auto my-8">
            <span className="text-6xl text-yellow-500 block mb-4">🏆</span>
            <h3 className="text-2xl font-black text-emerald-800 mb-2">أنت بطل الضرب الخارق!</h3>
            <p className="text-emerald-600 mb-6">لقد اجتزت جميع المستويات وحفظت الضرب بما في ذلك التوزيع والضرب بمضاعفات ١٠٠! هنيئاً لك التاج الذهبي.</p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95"
            >
              ابدأ من جديد 🔄
            </button>
          </div>
        )}

        {!isGameOver && !isWin && question && (
          <div className="flex flex-col items-center">
            {/* The Chalkboard display of the math problem */}
            <div className="bg-slate-800 rounded-3xl p-8 text-center border-8 border-amber-900 shadow-2xl relative max-w-lg w-full mb-8">
              <span className="absolute top-2 right-4 text-xs font-mono text-emerald-400">الصف الثالث الابتدائي</span>
              <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest">حل المسألة التالية لفرقعة البالونات المناسبة:</div>
              <div className="text-6xl font-black text-white py-4 tracking-wider font-mono">
                {question.text} = ؟
              </div>
              <p className="text-emerald-300 text-sm italic mt-2">انقر على البالون الذي يحتوي على الحل الصحيح!</p>
            </div>

            {/* Hint Box */}
            <div className="w-full max-w-lg mb-6">
              <button 
                onClick={() => { soundEffects.playBeep(); setShowHint(prev => !prev); }}
                className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-bold bg-sky-50 px-4 py-2 rounded-full border border-sky-200 mx-auto active:scale-95 transition-all"
              >
                <HelpCircle className="w-4 h-4" /> {showHint ? 'إخفاء المساعدة' : 'أريد مساعدة (تلميحة حسون!)'}
              </button>
              
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-2xl p-4 mt-3 text-right text-sm leading-relaxed"
                  >
                    ⭐ <strong>تلميحة حسون:</strong> {question.hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Level Goal gauge */}
            <div className="w-full max-w-lg bg-gray-100 h-4 rounded-full overflow-hidden mb-12 border border-gray-200 relative">
              <div 
                className="bg-sky-500 h-full transition-all duration-500" 
                style={{ width: `${(score / 50) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                الوصول للمستوى التالي ({score} / ٥٠ درجة)
              </span>
            </div>

            {/* The Floating Balloons (Interactive) */}
            <div className="flex justify-around w-full max-w-2xl px-4 py-8 bg-sky-50/40 rounded-3xl border-2 border-dashed border-sky-100 min-h-60 relative overflow-hidden">
              {question.options.map((val, idx) => (
                <motion.div
                  key={val + '-' + idx}
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: [20, -20, 20], opacity: 1 }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      duration: 3 + idx * 0.5,
                      ease: 'easeInOut',
                    },
                    opacity: { duration: 0.5 }
                  }}
                  className="flex flex-col items-center relative group cursor-pointer"
                  onClick={() => handlePop(val)}
                >
                  {/* Balloon Body */}
                  <div className={`w-28 h-36 rounded-full bg-gradient-to-b ${balloonColors[idx % balloonColors.length]} shadow-lg flex flex-col items-center justify-center border-4 border-white border-opacity-30 relative select-none transform hover:scale-110 active:scale-95 transition-transform`}>
                    <span className="text-3xl font-black text-white drop-shadow">
                      {val}
                    </span>
                    
                    {/* Glossy reflection on balloon */}
                    <div className="absolute top-3 left-4 w-6 h-10 bg-white bg-opacity-20 rounded-full rotate-12" />
                  </div>
                  
                  {/* Knot */}
                  <div className="w-3 h-2 bg-gray-600 rounded-b opacity-50 -mt-0.5" />
                  
                  {/* S-shaped Balloon String */}
                  <svg className="w-6 h-20 -mt-1 opacity-60 text-gray-400" viewBox="0 0 20 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10,0 Q18,25 10,50 T10,100" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
