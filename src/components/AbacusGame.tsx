import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, ArrowLeft, Star, Volume2, Award, Lightbulb, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { numberToArabicWords } from '../utils/mathHelpers';
import { soundEffects } from '../utils/audio';

interface AbacusGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Lesson {
  id: number;
  title: string;
  desc: string;
  page: string;
}

export default function AbacusGame({ onBack, onAddStars }: AbacusGameProps) {
  // Abacus columns: thousands, hundreds, tens, units
  const [thousands, setThousands] = useState(1);
  const [hundreds, setHundreds] = useState(5);
  const [tens, setTens] = useState(1);
  const [units, setUnits] = useState(0);

  const [mode, setMode] = useState<'explore' | 'challenge'>('explore');
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [equationText, setEquationText] = useState<string>(''); // For math puzzles
  const [lessonExplanation, setLessonExplanation] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [starsWon, setStarsWon] = useState(0);

  const currentNumber = thousands * 1000 + hundreds * 100 + tens * 10 + units;

  const lessons: Lesson[] = [
    { id: 1, title: 'الدرس ١: قراءة وكتابة الأعداد حتى ٩٩٩٩', desc: 'تمثيل الأعداد الكلية وقراءة خاناتها الأربعة المنهجية.', page: 'كتاب ص ٦-٧' },
    { id: 2, title: 'الدرس ٢: مضاعفات العشرة والمئة والألف', desc: 'تمثيل أنماط ومضاعفات الأعداد الكبيرة على العداد.', page: 'كتاب ص ٩-١٠' },
    { id: 3, title: 'الدرس ٣: الجمع السريع ضمن العدد ٩٩٩٩', desc: 'اجمع عددين ومثل المجموع الكلي النهائي بالخرزات.', page: 'كتاب ص ١٢-١٣' },
    { id: 4, title: 'الدرس ٤: الطرح التفاعلي ضمن العدد ٩٩٩٩', desc: 'اطرح عددين ومثل باقي الطرح المتبقي بالإستعانة بالعداد.', page: 'كتاب ص ١٤-١٥' }
  ];

  useEffect(() => {
    if (mode === 'challenge') {
      generateChallenge();
    }
  }, [mode, selectedLesson]);

  const generateChallenge = () => {
    setIsSuccess(null);
    setThousands(1);
    setHundreds(0);
    setTens(0);
    setUnits(0);

    if (selectedLesson === 1) {
      // Lesson 1: General 4-digit numbers from textbook
      const list = [3583, 2497, 7350, 4303, 1510, 2073, 5126, 4082, 1872, 9080];
      const rand = list[Math.floor(Math.random() * list.length)];
      setTargetNumber(rand);
      setEquationText('');
      setLessonExplanation('تذكّر: آحاد، عشرات، مئات، ألوف بالترتيب لتشكل العدد الكلي!');
    } else if (selectedLesson === 2) {
      // Lesson 2: Multiples
      const list = [300, 4000, 60, 500, 2000, 900, 80, 7000, 100, 50];
      const rand = list[Math.floor(Math.random() * list.length)];
      setTargetNumber(rand);
      setEquationText('');
      setLessonExplanation('تذكّر: في المضاعفات تكون بعض الخانات صفراً، لا تضع بها أي خرزات!');
    } else if (selectedLesson === 3) {
      // Lesson 3: Addition
      const sums = [
        { eq: '٢٤٠٠ + ١٣٠٠ = ؟', ans: 3700, exp: 'الجمع سهل: لجمع ٢٤٠٠ مع ١٣٠٠ نجمع الخانات بالتوالي لنحصل على ٣٧٠٠!' },
        { eq: '٤١٢٠ + ١٨٠٠ = ؟', ans: 5920, exp: 'نجمع: ٠+٠=٠ آحاد، ٢+٠=٢ عشرات، ١+٨=٩ مئات، ٤+١=٥ ألوف. الناتج ٥٩٢٠!' },
        { eq: '١٥٠٠ + ٣٠٠ = ؟', ans: 1800, exp: 'أولاً اجمع المئات: ٥٠٠ + ٣٠٠ = ٨٠٠. الناتج النهائي: ١٨٠٠!' },
        { eq: '٣٠٠٠ + ٥٠٠٠ = ؟', ans: 8000, exp: 'مضاعفات الألف السريعة: ٣ آلاف زائد ٥ آلاف تعطي ٨ آلاف (٨٠٠٠)!' }
      ];
      const pick = sums[Math.floor(Math.random() * sums.length)];
      setTargetNumber(pick.ans);
      setEquationText(pick.eq);
      setLessonExplanation(pick.exp);
    } else {
      // Lesson 4: Subtraction
      const diffs = [
        { eq: '٤٥٠٠ - ١٢٠٠ = ؟', ans: 3300, exp: 'اطرح الخانات بالتوالي: ٠-٠=٠ آحاد، ٠-٠=٠ عشرات، ٥-٢=٣ مئات، ٤-١=٣ ألوف. الناتج ٣٣٠٠!' },
        { eq: '٣٠٠٠ - ١٥٠٠ = ؟', ans: 1500, exp: '٣ آلاف ناقص ألف ونصف يتبقى ألف ونصف (١٥٠٠) تماماً!' },
        { eq: '٥٢٠٠ - ٣٠0٠ = ؟', ans: 2200, exp: 'اطرح الآلاف: ٥ آلاف ناقص ٣ آلاف يعطي ألفان، ومائتان تبقى كما هي (٢٢٠٠)!' },
        { eq: '٩٠٠ - ٤٠٠ = ؟', ans: 500, exp: 'المئات الواضحة: ٩ مئات ناقص ٤ مئات يتبقى ٥ مئات (٥٠٠)!' }
      ];
      const pick = diffs[Math.floor(Math.random() * diffs.length)];
      setTargetNumber(pick.ans);
      setEquationText(pick.eq);
      setLessonExplanation(pick.exp);
    }
  };

  const handleVerify = () => {
    if (currentNumber === targetNumber) {
      soundEffects.playStar();
      setIsSuccess(true);
      setStarsWon(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setIsSuccess(false);
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
    // If they change something mid-way after failing, reset isSuccess state to retry
    if (isSuccess === false) {
      setIsSuccess(null);
    }
  };

  // Automatically apply the correct configuration to show the child.
  const handleApplyCorrection = () => {
    soundEffects.playStar();
    const correctTh = Math.floor(targetNumber / 1000);
    const correctH = Math.floor((targetNumber % 1000) / 100);
    const correctT = Math.floor((targetNumber % 100) / 10);
    const correctU = targetNumber % 10;

    setThousands(correctTh);
    setHundreds(correctH);
    setTens(correctT);
    setUnits(correctU);
    setIsSuccess(true);
    
    // Play sound & tell them
    speakText(`أصلحنا العداد معاً! يمثل العدد كالتالي: آلاف ${correctTh}، مئات ${correctH}، عشرات ${correctT}، وآحاد ${correctU}.`);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const targetTh = Math.floor(targetNumber / 1000);
  const targetH = Math.floor((targetNumber % 1000) / 100);
  const targetT = Math.floor((targetNumber % 100) / 10);
  const targetU = targetNumber % 10;

  const colors = {
    th: 'bg-rose-500 shadow-rose-300',
    h: 'bg-amber-500 shadow-amber-300',
    t: 'bg-emerald-500 shadow-emerald-300',
    u: 'bg-sky-500 shadow-sky-300',
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-amber-400 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-amber-600/30 hover:bg-amber-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold self-start sm:self-auto"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة
        </button>
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Sparkles className="text-yellow-100 fill-yellow-100" /> مغامرة العداد الذكي والدروس
        </h2>
        <div className="flex items-center gap-2 bg-amber-600 bg-opacity-30 px-4 py-1.5 rounded-full text-sm font-bold">
          <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          <span>{starsWon} من الأعداد ⭐</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Unit Lessons Selection bar or drawer */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
          <h3 className="text-xs font-black text-amber-800 mb-2">🎈 اختر أحد دروس الوحدة الأولى للمذاكرة واللعب:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => {
                  soundEffects.playBeep();
                  setSelectedLesson(les.id);
                  setMode('challenge');
                }}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  mode === 'challenge' && selectedLesson === les.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md transform scale-[1.02]'
                    : 'bg-white text-gray-700 border-amber-100 hover:border-amber-300 hover:bg-amber-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block self-start p-0.5 px-2 rounded ${
                  mode === 'challenge' && selectedLesson === les.id ? 'bg-amber-600 text-yellow-105' : 'bg-amber-50 text-amber-700'
                }`}>
                  {les.page}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center border-t border-amber-200/50 pt-4">
            <button
              onClick={() => {
                soundEffects.playBeep();
                setMode('explore');
                setIsSuccess(null);
              }}
              className={`px-8 py-2 rounded-full font-black text-xs transition-all ${
                mode === 'explore'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
              }`}
            >
              🧭 نمط الاستكشاف الحر (جرّب العداد وتعلّم النطق)
            </button>
          </div>
        </div>

        {/* Central Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Work Area */}
          <div className={`${isSuccess === false ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all space-y-6`}>
            
            {/* Informational Prompt */}
            <div className="bg-sky-50 rounded-[25px] p-5 relative border-2 border-sky-100 flex items-start gap-4">
              <span className="text-4xl animate-bounce shrink-0">🦜</span>
              <div className="flex-1 text-right">
                <h4 className="text-sky-900 font-black text-base mb-1">المرشد حسون ينادي الأبطال:</h4>
                {mode === 'explore' ? (
                  <p className="text-sky-700 text-xs md:text-sm font-semibold">
                    أهلاً بك يا بطل! قم بزيادة الخرزات بالضغط على زري (+) و (-) على العداد لتشكل خانات الأرقام الأربعة: 
                    <strong> (الآحاد، العشرات، المئات، الألوف)</strong>. انظر بالأسفل كيف ينطق حسون نصوص الأعداد بخت الرضا!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sky-900 text-xs md:text-sm font-bold">
                      أنت الآن في تحدي <span className="text-amber-800 underline">{lessons.find(l => l.id === selectedLesson)?.title}</span>:
                    </p>
                    {equationText ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-700 text-xs md:text-sm font-semibold">قم بحل هذه المسألة ومثّلها على العداد:</span>
                        <div className="bg-indigo-100 border-2 border-indigo-300 rounded-xl p-2 px-4 text-indigo-900 font-extrabold text-lg">
                          {equationText}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-slate-705 text-xs font-semibold">مثّل العدد المنشود التالي بالخرزات:</span>
                        <div className="bg-emerald-100 border-2 border-emerald-400 rounded-xl p-2 px-6 font-black text-2xl text-emerald-800">
                          {targetNumber}
                        </div>
                      </div>
                    )}
                    <span className="block text-[10px] text-sky-600 font-medium">
                      ({numberToArabicWords(targetNumber)})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Abacus Interactive Board */}
            <div className="bg-amber-50/40 rounded-3xl p-6 border-4 border-dashed border-amber-200">
              <div className="relative h-72 w-full max-w-lg mx-auto flex items-end justify-around pb-6 bg-slate-100 rounded-2xl p-4 border-2 border-amber-100">
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
                    <div className="absolute top-2 bottom-6 w-1.5 bg-gray-300 rounded-full z-0 shadow-inner" />

                    {/* Beads Stack */}
                    <div className="absolute bottom-6 flex flex-col-reverse items-center justify-start w-full gap-0.5 z-10">
                      {Array.from({ length: col.value }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ y: -100, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: 'spring', damping: 12, stiffness: 220 }}
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

              {/* Control Pad +/- */}
              <div className="flex justify-around max-w-lg mx-auto mt-4 px-2">
                {[
                  { key: 'th' as const, label: 'ألوف' },
                  { key: 'h' as const, label: 'مئات' },
                  { key: 't' as const, label: 'عشرات' },
                  { key: 'u' as const, label: 'آحاد' },
                ].map((col) => (
                  <div key={col.key} className="flex flex-col items-center gap-1 bg-white p-2 px-3 rounded-2xl border border-amber-100 shadow-sm">
                    <button
                      onClick={() => adjustColumn(col.key, 1)}
                      className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-full shadow-md flex items-center justify-center text-lg active:scale-95 transition-transform"
                    >
                      +
                    </button>
                    <span className="text-[10px] font-black text-gray-500 my-0.5">{col.label}</span>
                    <button
                      onClick={() => adjustColumn(col.key, -1)}
                      className="w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-full shadow-md flex items-center justify-center text-lg active:scale-95 transition-transform"
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current State Indicator */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-500">تمثيل العداد الحالي:</span>
              <strong className="text-3xl font-black text-indigo-900 tracking-widest mt-1">
                {currentNumber}
              </strong>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-sky-800">
                <span>({numberToArabicWords(currentNumber)})</span>
                <button
                  onClick={() => speakText(numberToArabicWords(currentNumber))}
                  className="p-1 px-2.5 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع النطق
                </button>
              </div>
            </div>

            {/* Verification & Success feedback section */}
            {mode === 'challenge' && (
              <div className="flex flex-col items-center gap-3">
                {isSuccess === null && (
                  <button
                    onClick={handleVerify}
                    className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white text-lg font-black rounded-full shadow-xl transform active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Award className="w-5 h-5" /> تحقق من العداد الآن!
                  </button>
                )}

                {isSuccess === true && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border-4 border-emerald-400 p-5 rounded-[25px] text-center space-y-3 w-full max-w-lg"
                  >
                    <div className="text-4xl">🌟🏆🌟</div>
                    <h3 className="text-lg font-black text-emerald-900">عمل عبقري يا بطل الصف الثالث!</h3>
                    <p className="text-xs font-bold text-emerald-700">
                      لقد طابقت العدد بنجاح! نطق وحساب صحيح مئة بالمئة كسبت من خلاله ٥ نجوم ذهبية!
                    </p>
                    <button
                      onClick={generateChallenge}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-full transition-transform active:scale-95 shadow-md inline-block"
                    >
                      تحدّي جديد في هذا الدرس 🔄
                    </button>
                  </motion.div>
                )}
              </div>
            )}

          </div>

          {/* Interactive Self-Correction Side panel */}
          <AnimatePresence>
            {mode === 'challenge' && isSuccess === false && (
              <motion.div
                initial={{ transform: 'translateX(50px)', opacity: 0 }}
                animate={{ transform: 'translateX(0)', opacity: 1 }}
                exit={{ transform: 'translateX(50px)', opacity: 0 }}
                className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <h3 className="text-sm font-black">مصحح حسون الذكي: الإجابة غير دقيقة!</h3>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed font-bold">
                    أوه! العداد الحالي يمثل القيمة <span className="text-rose-600">({currentNumber})</span>، بينما القيمة الصحيحة المطلوبة هي <span className="text-emerald-700">({targetNumber})</span>. لندرسها سوياً لنتعلم الدرس!
                  </p>

                  {/* Comparisons card layout */}
                  <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-2">
                    <h4 className="text-[10px] font-black text-slate-500 border-b pb-1">مقارنة الخانات والخرزات:</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-rose-100/50 p-1.5 rounded text-center">
                        <span className="text-rose-800 font-extrabold block">خرزاتك ❌</span>
                        <div className="text-[10px] text-rose-700 mt-1 font-bold">
                          - آلاف: {thousands}<br />
                          - مئات: {hundreds}<br />
                          - عشرات: {tens}<br />
                          - آحاد: {units}
                        </div>
                      </div>
                      <div className="bg-emerald-100/50 p-1.5 rounded text-center">
                        <span className="text-emerald-800 font-extrabold block">الصحيح المنهجي ✔️</span>
                        <div className="text-[10px] text-emerald-700 mt-1 font-bold">
                          - آلاف: {targetTh}<br />
                          - مئات: {targetH}<br />
                          - عشرات: {targetT}<br />
                          - آحاد: {targetU}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Textbook rule block */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <h4 className="text-[10px] font-black text-amber-800 flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" /> قاعدة من منهاج بخت الرضا:
                    </h4>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                      {lessonExplanation || 'لتمثيل العدد بصورة صحيحة قسّم خاناته للآحاد (عمود أول على اليمين)، ثم العشرات، المئات، والألوف بالتتالي.'}
                    </p>
                  </div>
                </div>

                {/* Interactive Autocomplete and Audio help */}
                <div className="space-y-2 pt-4 border-t border-rose-200">
                  <button
                    onClick={handleApplyCorrection}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white text-xs font-black rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> طبق الحل الصحيح وتعلّم 🦜
                  </button>

                  <button
                    onClick={() => speakText(`أوه يا بطل، العداد غير متطابق. القيمة الصحيحة هي ${targetNumber}، وتمثيلها الصحيح هو آلاف ${targetTh}، مئات ${targetH}، عشرات ${targetT}، وآحاد ${targetU}. اضغط زر تطبيق الحل لتشاهد تمثيلها وتحفظ القاعدة!`)}
                    className="w-full py-2 bg-white hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> استمع للمدرس حسون 🗣️
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
