import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Heart, HelpCircle, ShieldQuestion, Star, AlertCircle, Lightbulb, CheckSquare, Volume2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { toArabicNumerals } from '../utils/mathHelpers';

interface MultiplicationGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Question {
  num1: number;
  num2: number;
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
  const [answeredVal, setAnsweredVal] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [starsWon, setStarsWon] = useState(0);

  const lessons = [
    { id: 1, title: 'الدرس ١: أساسيات الضرب (٠، ١)', desc: 'قواعد الضرب الأساسية في الصفر والواحد من الكتاب.', page: 'كتاب ص ١٧-١٨' },
    { id: 2, title: 'الدرس ٢: جدول ضرب السبعة (٧)', desc: 'العد بمضاعفات الرقم ٧ وحفظ نواتج عملياته المنهجية.', page: 'كتاب ص ١٩-٢١' },
    { id: 3, title: 'الدرس ٣: جدول ضرب الثمانية (٨)', desc: 'الضرب في الرقم ٨ وتكراره وحسابه بالجمع والتوزيع.', page: 'كتاب ص ٢٣-٢٤' },
    { id: 4, title: 'الدرس ٤: جدول ضرب التسعة (٩)', desc: 'طرق سحرية لحساب مضاعفات وجدول ضرب الرمز ٩.', page: 'كتاب ص ٢٦' },
    { id: 5, title: 'الدرس ٥: الضرب بمضاعفات ١٠ وتوزيعه', desc: 'استخدام خاصية التوزيع والضرب بمضاعفات العشرة.', page: 'كتاب ص ٣٠-٣٦' },
  ];

  // Generate a customized question based on the chosen textbook level
  const generateQuestion = (currentLevel: number) => {
    setShowHint(false);
    setAnsweredVal(null);
    setIsAnswerCorrect(null);

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
        const multiples = [10, 20, 30, 40, 50, 100];
        num1 = multiples[Math.floor(Math.random() * multiples.length)];
        num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        answer = num1 * num2;
        text = `${num1} × ${num2}`;
        hint = `قاعدة: اضرب الأرقام الباقية أولاً ثم ضع الصفر على يمين الناتج! مثلاً اضرب ${num1 / 10} في ${num2} وضع صفر.`;
      } else {
        // Distributive property
        const pairs = [
          { a: 15, b: 3, h: "١٥ × ٣ = (١٠ + ٥) × ٣ = ٣٠ + ١٥" },
          { a: 12, b: 5, h: "١٢ × ٥ = (١٠ + ٢) × ٥ = ٥٠ + ١٠" },
          { a: 13, b: 4, h: "١٣ × ٤ = (١٠ + ٣) × ٤ = ٤٠ + ١٢" },
          { a: 14, b: 3, h: "١٤ × ٣ = (١٠ + ٤) × ٣ = ٣٠ + ١٢" },
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        num1 = pick.a;
        num2 = pick.b;
        answer = num1 * num2;
        text = `${num1} × ${num2}`;
        hint = `خاصية التوزيع التفكيكي: ${pick.h}`;
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
      num1,
      num2,
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
    if (!question || answeredVal !== null) return;
    setAnsweredVal(selected);
    const correct = selected === question.answer;
    setIsAnswerCorrect(correct);

    if (correct) {
      soundEffects.playPop();
      const newScore = score + 10;
      setScore(newScore);
      setStarsWon(prev => prev + 1);
      onAddStars(5);

      if (newScore >= 50) {
        if (level < 5) {
          setLevel(prev => prev + 1);
          setScore(0);
        } else {
          setIsWin(true);
        }
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
    }
  };

  const handleProceedNext = () => {
    if (!question) return;
    generateQuestion(level);
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsWin(false);
    setAnsweredVal(null);
    setIsAnswerCorrect(null);
    setTimeout(() => generateQuestion(1), 100);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const balloonColors = [
    'from-rose-400 to-rose-600',
    'from-sky-400 to-sky-600',
    'from-emerald-400 to-emerald-600',
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-400 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-sky-600/30 hover:bg-sky-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold self-start sm:self-auto"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة
        </button>
        <h2 className="text-2xl font-black flex items-center gap-2">
          🎈 مدرسة البالونات وجدول الضرب
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-5 h-5 ${idx < lives ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} 
              />
            ))}
          </div>
          <div className="bg-sky-600 bg-opacity-30 px-4 py-1.5 rounded-full text-xs font-black">
            الدرجة بالدرس: {toArabicNumerals(score)} / ٥٠ ⭐
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* Unit Lessons selectors */}
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 mb-6">
          <h3 className="text-xs font-black text-sky-800 mb-2">🏷️ اختر أحد دروس الضرب للمطالعة وحل التحديات:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => {
                  soundEffects.playBeep();
                  setLevel(les.id);
                  setScore(0);
                  setIsGameOver(false);
                  setIsWin(false);
                  setAnsweredVal(null);
                  setIsAnswerCorrect(null);
                }}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  level === les.id
                    ? 'bg-sky-500 text-white border-sky-600 shadow-md transform scale-[1.02]'
                    : 'bg-white text-gray-700 border-sky-100 hover:border-sky-300 hover:bg-sky-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10.5px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block p-0.5 px-2 rounded ${
                  level === les.id ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700'
                }`}>
                  {les.page}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Game State Screens */}
        {isGameOver && (
          <div className="bg-rose-50 rounded-3xl p-8 border-4 border-rose-250 text-center max-w-lg mx-auto my-8 space-y-4">
            <span className="text-6xl block">😢</span>
            <h3 className="text-xl font-black text-rose-800">انتهت المحاولات الثلاث يا بطل!</h3>
            <p className="text-xs font-bold text-rose-700 leading-relaxed">
              لا بأس على الإطلاق، الرياضيات تحتاج صبراً وتدريباً! تذكر كيف نقوم بالعمليات وحاول الضرب مرة أخرى من البداية.
            </p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-full shadow-lg transition-transform active:scale-95"
            >
              العب مجدداً وتدرّب 🔄
            </button>
          </div>
        )}

        {isWin && (
          <div className="bg-emerald-50 rounded-3xl p-8 border-4 border-emerald-205 text-center max-w-lg mx-auto my-8 space-y-4">
            <span className="text-6xl block">🏆👑⭐</span>
            <h3 className="text-xl font-black text-emerald-800">أنت بطل الضرب والبالونات!</h3>
            <p className="text-xs font-bold text-emerald-700 leading-relaxed">
              مدهش! لقد أجبت إجابات صحيحة واجتزت من التحدي كل دروس الوحدة الثانية بنجاح باهر!
            </p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-full shadow-lg transition-transform active:scale-95"
            >
              ابدأ المغامرة من جديد 🔄
            </button>
          </div>
        )}

        {!isGameOver && !isWin && question && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Play Area */}
            <div className={`${(answeredVal !== null && !isAnswerCorrect) ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all`}>
              
              {/* chalkboard math statement */}
              <div className="bg-slate-800 rounded-3xl p-8 text-center border-8 border-amber-900 shadow-2xl relative max-w-xl mx-auto w-full">
                <span className="absolute top-2 right-4 text-[10px] font-mono text-emerald-400">منهاج الصف الثالث</span>
                <div className="text-[10px] text-slate-300 font-bold mb-2">حل عملية الضرب لفرقعة البالون الصحيح:</div>
                <div className="text-5xl font-black text-white py-4 tracking-widest font-mono">
                  {toArabicNumerals(question.text)} = ؟
                </div>
                <p className="text-emerald-300 text-xs italic mt-2 animate-pulse">انقر على البالون الملون المطابق للحل!</p>
              </div>

              {/* Tweakable Hint dropdown */}
              <div className="max-w-xl mx-auto">
                <button
                  onClick={() => { soundEffects.playBeep(); setShowHint(prev => !prev); }}
                  className="flex items-center gap-1.5 text-sky-600 bg-sky-50 hover:bg-sky-100 text-xs font-bold px-4 py-2 rounded-full border border-sky-200 mx-auto transition-all"
                >
                  <HelpCircle className="w-4 h-4" /> {showHint ? 'إخفاء الإرشاد المساعد' : 'مساعدة من حسون 🦜'}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-2xl p-4 mt-3 text-sm font-semibold text-right leading-relaxed"
                    >
                      💡 <strong>تلميحة حسون:</strong> {question.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Balloon Selector Grid */}
              <div className="flex flex-wrap justify-around gap-6 w-full max-w-3xl mx-auto py-8 bg-sky-50/20 rounded-3xl border-2 border-dashed border-sky-100 min-h-64 relative overflow-hidden">
                {question.options.map((val, idx) => (
                  <motion.div
                    key={val + '-' + idx}
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ 
                      y: answeredVal !== null ? (answeredVal === val ? 300 : [40, 40]) : [15, -15, 15], 
                      opacity: answeredVal !== null ? (answeredVal === val ? 0 : 0.4) : 1 
                    }}
                    transition={{
                      y: {
                        repeat: answeredVal !== null ? 0 : Infinity,
                        duration: 3.5 + idx * 0.4,
                        ease: 'easeInOut',
                      },
                      opacity: { duration: 0.4 }
                    }}
                    className={`flex flex-col items-center relative ${answeredVal !== null ? 'pointer-events-none' : 'cursor-pointer'}`}
                    onClick={() => handlePop(val)}
                  >
                    {/* Balloon Shape */}
                    <div className={`w-28 h-36 rounded-full bg-gradient-to-b ${balloonColors[idx % balloonColors.length]} shadow-lg flex flex-col items-center justify-center border-4 border-white border-opacity-35 select-none transform hover:scale-108 active:scale-95 transition-transform`}>
                      <span className="text-3xl font-black text-white drop-shadow">
                        {toArabicNumerals(val)}
                      </span>
                      {/* Polish specular shine */}
                      <div className="absolute top-3 left-4 w-6 h-10 bg-white/20 rounded-full rotate-12" />
                    </div>
                    <div className="w-2.5 h-1.5 bg-gray-500/50 rounded-b" />
                    {/* Rope */}
                    <svg className="w-5 h-16 -mt-1 text-gray-300" viewBox="0 0 20 100" fill="none">
                      <path d="M10,0 Q18,25 10,50 T10,100" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Progress gauge */}
              <div className="max-w-xl mx-auto space-y-2">
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200 relative">
                  <div 
                    className="bg-sky-500 h-full transition-all duration-500" 
                    style={{ width: `${(score / 50) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-center font-bold text-slate-500">
                  كسب الأهداف للدرس الحالي: ({toArabicNumerals(score)} من أصل ٥٠ نقطة المطلوبة)
                </div>
              </div>

              {/* Correct Feedback Panel only if isAnswerCorrect is true */}
              {answeredVal !== null && isAnswerCorrect && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-50 border-4 border-emerald-400 p-5 rounded-[25px] text-center max-w-xl mx-auto space-y-3"
                >
                  <span className="text-3xl">🎉⭐🏆</span>
                  <h3 className="text-base font-black text-emerald-800">إصابة دقيقة تماماً وصحيحة!</h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    أحسنت! حاصل ضرب {question.text} هو بالفعل {question.answer}. كسبت نقاطاً إضافية في رصيدك!
                  </p>
                  <button
                    onClick={handleProceedNext}
                    className="px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-full shadow-md transition-all active:scale-95 inline-block"
                  >
                    استمر للتحدي التالي ➡️
                  </button>
                </motion.div>
              )}

            </div>

            {/* Self-Correction Assistant Panel if wrong answer */}
            <AnimatePresence>
              {answeredVal !== null && !isAnswerCorrect && (
                <motion.div
                  initial={{ transform: 'translateX(50px)', opacity: 0 }}
                  animate={{ transform: 'translateX(0)', opacity: 1 }}
                  exit={{ transform: 'translateX(50px)', opacity: 0 }}
                  className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between text-right"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-sm font-black">مساعد حسون للتصحيح التفاعلي:</h4>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed font-bold">
                      أوه! لقد اخترت البالون رقم <span className="text-rose-600 font-black">{toArabicNumerals(answeredVal)}</span>، بينما الحل الصحيح والصائب لـ <span className="text-slate-700 font-extrabold">{toArabicNumerals(question.text)}</span> هو <span className="text-emerald-750 font-black text-sm">{toArabicNumerals(question.answer)}</span>!
                    </p>

                    {/* Repeated addition illustration */}
                    <div className="bg-white rounded-2xl p-3 border border-rose-100/70 space-y-2">
                       <h5 className="text-[10px] font-black text-rose-800 border-b pb-1">📚 مفهوم الجمع المتكرر للضرب:</h5>
                       <p className="text-[10.5px] font-bold text-slate-700 leading-relaxed mb-2">
                         {question.num2 === 0 ? (
                           "قاعدة الختم بالصفر: عند الضرب بأي شكل في الرقم صفر، فإن المجموعة تختفي وتصبح النتيجة صِفراً تماماً!"
                         ) : question.num2 === 1 ? (
                           `قاعدة الرقم واحد المحايد: أي شيء يُضرب في ١ يظل كما هو تماماً، وهو تكرار الشيء لمرة واحدة: [ ${toArabicNumerals(question.num1)} ].`
                         ) : (
                           `الضرب في ${toArabicNumerals(question.num2)} يعني أن نكرر جمع العدد أربع أو عدة مرات: كالتالي:`
                         )}
                       </p>
                       {question.num2 > 1 && (
                         <div className="bg-rose-50 text-center rounded-xl p-1.5 font-bold text-xs text-rose-700 tracking-wide">
                           {Array(question.num2).fill(question.num1).map(x => toArabicNumerals(x)).join(' + ')} = {toArabicNumerals(question.answer)}
                         </div>
                       )}
                    </div>

                    {/* Matrix visual dots representing products */}
                    {question.num1 <= 10 && question.num2 <= 10 && question.num2 > 1 && (
                      <div className="bg-white rounded-2xl p-3 border border-rose-100/70 space-y-1.5">
                        <h5 className="text-[10px] font-black text-slate-500">✨ خريطة المصفوفة المنهجية (العد بالنقاط):</h5>
                        <div className="flex flex-col items-center gap-0.5 mt-1">
                          {Array.from({ length: question.num2 }).map((_, rIdx) => (
                            <div key={rIdx} className="flex gap-1 justify-center">
                              {Array.from({ length: question.num1 }).map((_, cIdx) => (
                                <span key={cIdx} className="w-3.5 h-3.5 bg-yellow-400 border border-yellow-500 rounded-full flex items-center justify-center text-[7px] font-bold text-yellow-800 select-none">⭐</span>
                              ))}
                            </div>
                          ))}
                        </div>
                        <span className="block text-[8px] text-center text-slate-400 mt-1">
                          (عدّ النجوم بالأعلى لتجد المجموع الكلي: {toArabicNumerals(question.answer)} نجوم!)
                        </span>
                      </div>
                    )}

                    {/* Sudanese teacher tip */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2 items-start">
                      <Lightbulb className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <strong className="text-[10px] font-black text-amber-800 block">نصيحة المدرس حسون بالمنشور:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700 font-semibold mt-1">
                          {question.hint || "الضرب هو أساس قياس القسمة والمساحة للكسور، كرره وحفظه جيداً لتبني ذكاءك الرياضي!"}
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <button
                      onClick={() => {
                        soundEffects.playStar();
                        setAnsweredVal(question.answer);
                        setIsAnswerCorrect(true);
                        speakText(`الحل الصحيح والنهائي هو ${question.answer}.`);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                    >
                      بفهم النجوم، طبّق الإجابة الصحيحة وتعلّم 🟢
                    </button>

                    <button
                      onClick={() => speakText(`أوه يا بطل، لقد اخترت البالون رقم ${answeredVal}، ولكن الإجابة الصائبة هي ${question.answer} لأنَّ تكرار ${question.num1} مضافةً لعدد ${question.num2} من المرات يعطي ${question.answer}. تأمل مصفوفة النجوم بالخريطة لتترسخ القاعدة بعقلك!`)}
                      className="w-full py-2 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors"
                    >
                      🗣️ استمع للشرح الصوتي من حسون
                    </button>

                    <button
                      onClick={handleProceedNext}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      تخطى والعب سؤالاً جديداً ➡️
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>

    </div>
  );
}
