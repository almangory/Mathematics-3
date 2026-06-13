import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, Check, Heart, Award, RefreshCw, Star, AlertCircle, Lightbulb, Volume2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GeometryGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface ShapeCard {
  id: string;
  name: string;
  desc: string;
  svg: React.ReactNode;
}

export default function GeometryGame({ onBack, onAddStars }: GeometryGameProps) {
  const [stars, setStars] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [starsWon, setStarsWon] = useState(0);

  // Match shape puzzle state
  const shapesList: ShapeCard[] = [
    { 
      id: 'point', 
      name: 'نقطة', 
      desc: 'أثر يتركه القلم على الورق الممثّل هنا بالحرف (أ)',
      svg: (
        <svg className="w-24 h-24 stroke-amber-955 fill-transparent" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="8" className="fill-rose-500 stroke-none" />
          <text x="50" y="32" className="fill-gray-750 font-bold text-lg text-center" textAnchor="middle">أ</text>
        </svg>
      )
    },
    { 
      id: 'segment', 
      name: 'قطعة مستقيمة', 
      desc: 'لها نقطة بداية ونقطة نهاية محددين (أ ب)',
      svg: (
        <svg className="w-24 h-24 stroke-rose-500 stroke-4 fill-none" viewBox="0 0 100 100">
          <line x1="20" y1="50" x2="80" y2="50" strokeLinecap="round" />
          <circle cx="20" cy="50" r="5" className="fill-amber-800" />
          <circle cx="80" cy="50" r="5" className="fill-amber-805" />
          <text x="20" y="38" className="fill-gray-705 font-bold text-sm" textAnchor="middle">أ</text>
          <text x="80" y="38" className="fill-gray-705 font-bold text-sm" textAnchor="middle">ب</text>
        </svg>
      )
    },
    { 
      id: 'triangle', 
      name: 'مثلث', 
      desc: 'شكل ذو ثلاثة أضلاع وثلاث قطع مستقيمة متصلة',
      svg: (
        <svg className="w-24 h-24 stroke-sky-500 stroke-4 fill-sky-100" viewBox="0 0 100 100">
          <polygon points="50,20 20,80 80,80" strokeLinejoin="round" />
          <text x="50" y="15" className="fill-gray-705 font-bold text-xs" textAnchor="middle">أ</text>
          <text x="14" y="86" className="fill-gray-705 font-bold text-xs" textAnchor="middle">ب</text>
          <text x="86" y="86" className="fill-gray-705 font-bold text-xs" textAnchor="middle">جـ</text>
        </svg>
      )
    },
    { 
      id: 'rectangle', 
      name: 'مستطيل', 
      desc: 'شكل رباعي فيه كل ضلعين متقابلين متساويين في الطول',
      svg: (
        <svg className="w-24 h-24 stroke-emerald-500 stroke-4 fill-emerald-100" viewBox="0 0 100 100">
          <rect x="15" y="30" width="70" height="40" rx="4" />
          <text x="12" y="27" className="fill-gray-705 font-bold text-xs">جـ</text>
          <text x="85" y="27" className="fill-gray-705 font-bold text-xs">د</text>
          <text x="12" y="85" className="fill-gray-705 font-bold text-xs">ب</text>
          <text x="85" y="85" className="fill-gray-705 font-bold text-xs">أ</text>
        </svg>
      )
    },
    { 
      id: 'square', 
      name: 'مربع', 
      desc: 'شكل رباعي جميع أضلاعه الأربعة متساوية تماماً في الطول',
      svg: (
        <svg className="w-24 h-24 stroke-amber-500 stroke-4 fill-amber-100" viewBox="0 0 100 100">
          <rect x="25" y="25" width="50" height="50" rx="4" />
          <text x="21" y="21" className="fill-gray-705 font-bold text-xs">م</text>
          <text x="78" y="21" className="fill-gray-705 font-bold text-xs">ن</text>
          <text x="21" y="83" className="fill-gray-705 font-bold text-xs">ل</text>
          <text x="78" y="83" className="fill-gray-705 font-bold text-xs">ك</text>
        </svg>
      )
    }
  ];

  const lessons = [
    { id: 1, title: 'الدرس ١: النقطة والقطعة المستقيمة والخطوط', desc: 'استدراك خطوط الهندسة وبدايتها ونهايتها على الدفتر.', page: 'كتاب ص ١١١' },
    { id: 2, title: 'الدرس ٢: المثلث وأبناؤه الثلاثة وأضلاعه', desc: 'تمييز المثلث وأركانه المتصلة بالصفحة المنهجية.', page: 'كتاب ص ١١٢' },
    { id: 3, title: 'الدرس ٣: المربع والمستطيل والفروقات بينهما', desc: 'مقايسات الأضلاع والزوايا في الأشكال الرباعية المغلقة.', page: 'كتاب ص ١١٣-١١٤' },
    { id: 4, title: 'الدرس ٤: اختبار التعريفات الهندسية والتحقق', desc: 'تحدي كشف الأشكال الهندسية بناءً على أوصافها وعقودها.', page: 'كتاب ص ١١٥' },
  ];

  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedMatchName, setSelectedMatchName] = useState<string | null>(null);
  const [completedMatches, setCompletedMatches] = useState<Record<string, string>>({}); // maps shape.id to matched name
  const [matchFeedback, setMatchFeedback] = useState('انقر على الرسم الهندسي، ثم انقر على الكلمة المطابقة له في اليسار لتكشف سره!');
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  // For failure details caching
  const [failedPair, setFailedPair] = useState<{ id: string; userTypedName: string } | null>(null);

  // Definitions Game State (Page 113, 114)
  const definitionsList = [
    { text: 'شكل رباعي فيه كل ضلعين متقابلين متساويان في الطول وزواياها قائمة.', ans: 'مستطيل', hint: 'تذكّر: المستطيل كشاشة التلفاز به ضلعان طويلان وضلعان قصيران!' },
    { text: 'شكل رباعي جميع أضلاعه الأربعة متساوية ولها نفس الطول بالتمام.', ans: 'مربع', hint: 'تذكّر: المربع كعلبة مكعب اللعب أضلاعه الأربعة عادلة ومتكافئة تماماً!' },
    { text: 'شكل هندسي ذو ثلاثة أضلاع وثلاث زوايا.', ans: 'مثلث', hint: 'تذكّر: المثلث لديه ٣ أضلاع كالقطعة من الجبن أو شريحة البيتزا!' },
    { text: 'أثر يتركه سن القلم على السطح ونرمز لها بحرف واحد أ.', ans: 'نقطة', hint: 'تذكّر: النقطة هي موضع صغير ثابت لا طول له.' },
    { text: 'لها نقطة بداية ونقطة نهاية محددين وتكتب أ ب ولها طول محدد.', ans: 'قطعة مستقيمة', hint: 'تذكّر: القطعة المستقيمة تصل بين نقطتين ومحصورة بينهما.' }
  ];

  const [activeDefIdx, setActiveDefIdx] = useState(0);
  const [defFeedback, setDefFeedback] = useState('');
  const [defStatus, setDefStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleShapeSelect = (shapeId: string) => {
    soundEffects.playBeep();
    if (completedMatches[shapeId]) return;
    setSelectedShape(shapeId);
    setMatchStatus('idle');
    checkMatch(shapeId, selectedMatchName);
  };

  const handleNameSelect = (name: string) => {
    soundEffects.playBeep();
    if (Object.values(completedMatches).includes(name)) return;
    setSelectedMatchName(name);
    setMatchStatus('idle');
    checkMatch(selectedShape, name);
  };

  const checkMatch = (shapeId: string | null, name: string | null) => {
    if (!shapeId || !name) return;

    const shape = shapesList.find(s => s.id === shapeId);
    if (shape && shape.name === name) {
      soundEffects.playStar();
      setCompletedMatches(prev => ({ ...prev, [shapeId]: name }));
      setMatchFeedback(`رائع! تطابق صحيح: رسم الـ (${name}) يطابق القاعدة ويبرهن لنا الأضلاع المفتوحة!`);
      setSelectedShape(null);
      setSelectedMatchName(null);
      setMatchStatus('success');
      setStars(prev => prev + 1);
      setStarsWon(prev => prev + 1);
      onAddStars(3);
    } else {
      soundEffects.playError();
      if (shapeId) {
        setFailedPair({ id: shapeId, userTypedName: name });
      }
      setMatchStatus('fail');
      setSelectedShape(null);
      setSelectedMatchName(null);
    }
  };

  // Autocomplete shape matching inside sidebar
  const handleApplyMatchCorrection = () => {
    if (!failedPair) return;
    soundEffects.playStar();
    const correctShape = shapesList.find(s => s.id === failedPair.id);
    if (correctShape) {
      setCompletedMatches(prev => ({ ...prev, [correctShape.id]: correctShape.name }));
      setMatchStatus('success');
      setMatchFeedback(`تطبيق تلقائي: طابقنا ${correctShape.name} مع رسمها الهندسي بنجاح.`);
      speakText(`قمنا بمطابقة الشكل الصحيح وهو ${correctShape.name}.`);
    }
  };

  // Autocomplete definition selection inside sidebar
  const handleApplyDefCorrection = () => {
    soundEffects.playStar();
    const q = definitionsList[activeDefIdx % definitionsList.length];
    setDefStatus('success');
    setDefFeedback(`تجديد تلقائي: الأثر الصحيح والتعريفي لهذه العبارة هو رسم [ ${q.ans} ].`);
    speakText(`الحل الصحيح المناسب الذي تقصده العبارة الهندسية المنهجية هو ${q.ans}.`);
  };

  const handleVerifyDefinition = (userAns: string) => {
    const q = definitionsList[activeDefIdx % definitionsList.length];
    if (userAns === q.ans) {
      soundEffects.playCorrect();
      setDefStatus('success');
      setDefFeedback(`أحسنت القول! إجابة هندسية عبقرية! هنيئاً لك ٣ نجوم دراسية! 🌟`);
      setStars(prev => prev + 1);
      setStarsWon(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setDefStatus('fail');
    }
  };

  const nextDefinition = () => {
    soundEffects.playBeep();
    setActiveDefIdx(prev => prev + 1);
    setDefStatus('idle');
  };

  const resetMatches = () => {
    soundEffects.playBeep();
    setCompletedMatches({});
    setMatchFeedback('تمت إعادة اللوح مجدداً! ابدأ المطابقة!');
    setMatchStatus('idle');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeDefQuestion = definitionsList[activeDefIdx % definitionsList.length];
  const activeFailedShape = failedPair ? shapesList.find(s => s.id === failedPair.id) : null;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-indigo-400 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold self-start sm:self-auto animate-pulse"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة
        </button>
        <h2 className="text-2xl font-black flex items-center gap-2">
          📐 مغامرة الهندسة والأشكال المغلقة
        </h2>
        <div className="flex items-center gap-2 bg-indigo-600 bg-opacity-30 px-4 py-1.5 rounded-full text-sm font-bold animate-bounce">
          <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          <span>{starsWon} أشكال ⭐</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Lesson choices */}
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 mb-6">
          <h3 className="text-xs font-black text-indigo-850 mb-2">🎈 اختر أحد دروس وحدة الهندسة للمذاكرة والتطابق التفاعلي:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => {
                  soundEffects.playBeep();
                  setSelectedLesson(les.id);
                  setMatchStatus('idle');
                  setDefStatus('idle');
                }}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  selectedLesson === les.id
                    ? 'bg-indigo-500 text-white border-indigo-600 shadow-md transform scale-[1.01]'
                    : 'bg-white text-gray-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block p-0.5 px-2 rounded self-start ${
                  selectedLesson === les.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {les.page}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Central screen with dynamic corrective sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active play board */}
          <div className={`${
            (selectedLesson < 4 && matchStatus === 'fail') || (selectedLesson === 4 && defStatus === 'fail')
              ? 'lg:col-span-8'
              : 'lg:col-span-12'
          } space-y-6 transition-all`}>
            
            {/* Guide strip */}
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-150 flex items-start gap-4">
              <span className="text-3xl">🦜</span>
              <div>
                <strong className="text-sky-900 block text-xs font-black">مرشد الهندسة حسون:</strong>
                {selectedLesson < 4 ? (
                  <p className="text-sky-800 text-[11px] font-bold mt-1 leading-relaxed">
                    انقر أولاً على أحد الرسوم الهندسية باليمين ليتحاوط باللون البرتقالي، ثم انقر على الكلمة الصحيحة المعبرة عنه في البطاقات باليسار ليحدث التلاحم!
                  </p>
                ) : (
                  <p className="text-sky-850 text-[11px] font-bold mt-1 leading-relaxed">
                    اقرأ العبارة التعريفية المأخوذة من كتاب ص ١١٣-١١٥، ثم انقر على اسم الشكل الهندسي المطابق لها من الخيارات البراقة!
                  </p>
                )}
              </div>
            </div>

            {/* Lessons 1, 2, 3: Interactive Card Matching puzzle board */}
            {selectedLesson < 4 && (
              <div className="bg-indigo-50/10 rounded-3xl p-6 border-2 border-indigo-100">
                
                {/* Feedback line */}
                <div className="bg-white p-3 rounded-xl border mb-6 text-center text-xs font-semibold text-slate-705">
                  ⭐ {matchFeedback}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Side: SVGs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {shapesList.map((shape) => {
                      const isMatched = !!completedMatches[shape.id];
                      const isSelected = selectedShape === shape.id;
                      
                      return (
                        <div
                          key={shape.id}
                          onClick={() => handleShapeSelect(shape.id)}
                          className={`bg-white rounded-2xl p-3 border-2 transition-all flex flex-col items-center justify-between cursor-pointer shadow-sm relative ${
                            isMatched
                              ? 'border-emerald-300 bg-emerald-50 bg-opacity-30 pointer-events-none'
                              : isSelected
                              ? 'border-amber-500 ring-4 ring-amber-200'
                              : 'border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20'
                          }`}
                        >
                          <div className="w-full h-24 flex items-center justify-center p-1">
                            {shape.svg}
                          </div>
                          
                          {isMatched ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black p-0.5 px-2 rounded-full mt-2">
                              ✓ {shape.name}
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-bold text-gray-400 mt-2">انقر للمطابقة</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Side: Words list */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-black text-slate-500 mb-1 border-b pb-1">اختر الاسماء المطابقة:</h4>
                    {shapesList.map((shape) => {
                      const isMatchedValue = Object.values(completedMatches).includes(shape.name);
                      const isSelectValue = selectedMatchName === shape.name;

                      return (
                        <button
                          key={shape.id}
                          onClick={() => handleNameSelect(shape.name)}
                          className={`p-3 rounded-2xl border-2 text-right transition-all font-black text-xs flex justify-between items-center ${
                            isMatchedValue
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250 pointer-events-none'
                              : isSelectValue
                              ? 'bg-amber-450 text-white border-amber-600'
                              : 'bg-white text-gray-700 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <span>{shape.name}</span>
                          {isMatchedValue && <Check className="w-4 h-4 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={resetMatches}
                    className="px-6 py-2 border-2 border-dashed border-indigo-350 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-50 active:scale-95 transition-all"
                  >
                    إعادة لوح الأشكال لمكانه 🔄
                  </button>
                </div>

              </div>
            )}

            {/* Lesson 4: Definitions quiz */}
            {selectedLesson === 4 && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-teal-50/50 rounded-3xl p-6 border-2 border-indigo-120">
                <div className="max-w-xl mx-auto space-y-4">
                  
                  {/* Quiz chalkboard/screen */}
                  <div className="bg-slate-800 rounded-3xl p-6 text-center border-8 border-amber-900 shadow-md">
                    <span className="text-[9.5px] text-emerald-400 font-mono block mb-1">تحدّي التعريف الهرمي ص ١١٥</span>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed mb-3">ما هو المصطلح الهندسي المعياري الذي تصفه العبارة التالية؟</p>
                    <blockquote className="text-base text-white font-extrabold px-4 leading-relaxed leading-medium py-3 bg-slate-700 bg-opacity-40 rounded-xl border border-dashed border-slate-500">
                      " {activeDefQuestion.text} "
                    </blockquote>
                  </div>

                  {/* Options lists based on shapes */}
                  <div className="grid grid-cols-2 gap-3">
                    {shapesList.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => handleVerifyDefinition(shape.name)}
                        className="p-3 bg-white hover:bg-indigo-50 text-slate-700 font-black text-xs rounded-xl border border-slate-200 text-center shadow-sm hover:scale-[1.02] transform transition-transform"
                      >
                        {shape.name}
                      </button>
                    ))}
                  </div>

                  {/* Feedback block */}
                  {defStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50 border-4 border-emerald-400 p-4 rounded-xl text-center space-y-2 text-emerald-900"
                    >
                      <span className="text-2xl">🎉⭐🏆</span>
                      <p className="text-xs font-black">{defFeedback}</p>
                      <button
                        onClick={nextDefinition}
                        className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10.5px] rounded-full inline-block"
                      >
                        التعريف الموالي ➡️
                      </button>
                    </motion.div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Self-Correction Assistant Side Panel if wrong answer */}
          <AnimatePresence>
            {(((selectedLesson < 4 && matchStatus === 'fail') || (selectedLesson === 4 && defStatus === 'fail'))) && (
              <motion.div
                initial={{ transform: 'translateX(50px)', opacity: 0 }}
                animate={{ transform: 'translateX(0)', opacity: 1 }}
                exit={{ transform: 'translateX(50px)', opacity: 0 }}
                className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between text-right"
              >
                
                {/* Match Failure sidebar details */}
                {selectedLesson < 4 && failedPair && activeFailedShape && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800 animate-pulse">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح حسون الهندسي:</h4>
                    </div>

                    <p className="text-slate-650 text-[11.5px] leading-relaxed font-bold">
                      أوه، زوايا التطابق غير صحيحة! قمت بمطاولة هذا الرسم الهندسي مع بطاقة الاسم <span className="text-rose-600">({failedPair.userTypedName})</span>. بينما الوصف العلمي والمنهجي لهذا الرسم هو:
                    </p>

                    <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-2 text-[10.5px] font-bold text-slate-705 leading-relaxed">
                      <strong className="text-rose-800 font-black shrink-0 border-b pb-1 flex items-center gap-1">
                        ✔️ الاسم الصائب المنهجي: [{activeFailedShape.name}]
                      </strong>
                      <p className="text-slate-700 leading-relaxed font-semibold">
                        - {activeFailedShape.desc}
                      </p>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplyMatchCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبق الحل وتعلّم 📐
                      </button>

                      <button
                        onClick={() => speakText(`أوه يا بطل، هذا الرسم الهندسي يمثّل كونه ${activeFailedShape.name}. ${activeFailedShape.desc}. هيا نضغط زر تطبيق الحل لتلافي الخطأ وتثبيته!`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للشرح الصوتي للشكل الهرمي
                      </button>

                      <button
                        onClick={() => setMatchStatus('idle')}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center"
                      >
                        سأحاول التطابق مجدداً بنفسي 🔄
                      </button>
                    </div>
                  </div>
                )}

                {/* Definition Failure info */}
                {selectedLesson === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800 animate-pulse">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح التعريفات الهندسية:</h4>
                    </div>

                    <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                      أوه، المصطلح المختار يختلف عن المفهوم العلمي! العبارة الهندسية المروية ص ١١٥ هي: <span className="font-extrabold text-indigo-700">"{activeDefQuestion.text}"</span>. بينما مصطلحها الصحيح هو:
                    </p>

                    <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-1 text-[11px] font-bold text-slate-700 leading-relaxed">
                      <div className="font-black text-emerald-800 flex items-center gap-1 border-b pb-1">
                        ✔️ الخيار الصحيح: {activeDefQuestion.ans}
                      </div>
                      <p className="text-slate-600 mt-1 font-semibold leading-relaxed">
                        {activeDefQuestion.hint}
                      </p>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplyDefCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبق الخيار الصحيح وتعلّم 🟢
                      </button>

                      <button
                        onClick={() => speakText(`تذكر يا غندور أننا عندما نقول ${activeDefQuestion.text} فإن الإجابة العلمية المنهجية هي كونه ${activeDefQuestion.ans}. اضغط لتشاهد الاختيار الصحيح وتحفظ القاعدة!`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للمراجع الصوتي
                      </button>

                      <button
                        onClick={nextDefinition}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center"
                      >
                        تخطى إلى السؤال الهرمي التالي ➡️
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
