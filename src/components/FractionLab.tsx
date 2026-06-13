import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, HelpCircle, Check, Play, RefreshCw, Star, AlertCircle, Lightbulb, Volume2, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { toArabicNumerals } from '../utils/mathHelpers';

interface FractionLabProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function FractionLab({ onBack, onAddStars }: FractionLabProps) {
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [stars, setStars] = useState(0);

  // Creator & Matcher state
  const [pizzaSlices, setPizzaSlices] = useState(8); // Denominator
  const [coloredSlices, setColoredSlices] = useState<boolean[]>(Array(8).fill(false));

  const [matchDenominator, setMatchDenominator] = useState(6);
  const [matchRequired, setMatchRequired] = useState(3); // Match numerator
  const [matchUserSlices, setMatchUserSlices] = useState<boolean[]>(Array(6).fill(false));
  const [matchFeedback, setMatchFeedback] = useState('');
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  // Comparer state
  const [compNum1, setCompNum1] = useState(1);
  const [compDen1, setCompDen1] = useState(2);
  const [compNum2, setCompNum2] = useState(1);
  const [compDen2, setCompDen2] = useState(4);
  const [compCorrect, setCompCorrect] = useState<'<' | '>' | '='>('>');
  const [compFeedback, setCompFeedback] = useState('');
  const [compStatus, setCompStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const lessons = [
    { id: 1, title: 'الدرس ١: تمثيل الكسر ومفهوم البسط والمقام', desc: 'تلوين قطع الكيك الدائري والبيتزا لفهم بسط ومقام الكسور.', page: 'كتاب ص ٧٢-٧٥' },
    { id: 2, title: 'الدرس ٢: تلوين الأجزاء ومطابقة الكسر المطلوب', desc: 'تلوين أجزاء مساوية تماماً للكسر الكلي واستنباط الأشكال.', page: 'كتاب ص ٧٧' },
    { id: 3, title: 'الدرس ٣: مقارنة الحصص والكسور والترتيب', desc: 'مقارنة الكسور ذات المقامات المتساوية أو البسوط المتساوية.', page: 'كتاب ص ٨٤-٨٧' },
  ];

  useEffect(() => {
    if (selectedLesson === 2) {
      generateMatchQuestion();
    } else if (selectedLesson === 3) {
      generateComparison();
    }
  }, [selectedLesson]);

  const generateMatchQuestion = () => {
    const denominators = [4, 6, 8, 10, 12];
    const den = denominators[Math.floor(Math.random() * denominators.length)];
    const num = Math.floor(Math.random() * (den - 1)) + 1; // 1 to den-1
    setMatchDenominator(den);
    setMatchRequired(num);
    setMatchUserSlices(Array(den).fill(false));
    setMatchFeedback('مرحباً بك! قم بتلوين الأجزاء لنحصل على الكسر المطلوب.');
    setMatchStatus('idle');
  };

  const fractionToWords = (num: number, den: number): string => {
    if (num === 0) return 'صفر';
    if (num === den) return 'الواحد الصحيح';
    
    if (num === 1) {
      if (den === 2) return 'النصف (١/٢)';
      if (den === 3) return 'الثلث (١/٣)';
      if (den === 4) return 'الربع (١/٤)';
      if (den === 5) return 'الخمس (١/٥)';
      if (den === 6) return 'السدس (١/٦)';
      if (den === 8) return 'الثمن (١/٨)';
      if (den === 10) return 'العشر (١/١٠)';
      return `جزء واحد من أصل ${den}`;
    }

    if (num === 2) {
      if (den === 3) return 'ثلثان (٢/٣)';
      if (den === 4) return 'ربعان (٢/٤)';
      if (den === 5) return 'خمسان (٢/٥)';
      if (den === 6) return 'سدسان (٢/٦)';
      if (den === 8) return 'ثمنان (٢/٨)';
    }

    return `${num} أجزاء من أصل ${den}`;
  };

  const handleSliceClickCreator = (idx: number) => {
    soundEffects.playBeep();
    setColoredSlices(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const handleSliceClickMatcher = (idx: number) => {
    soundEffects.playBeep();
    if (matchStatus === 'success') return;
    setMatchUserSlices(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
    setMatchStatus('idle');
  };

  const handleVerifyMatch = () => {
    const userCount = matchUserSlices.filter(Boolean).length;
    if (userCount === matchRequired) {
      soundEffects.playStar();
      setMatchStatus('success');
      setMatchFeedback('إجابة عبقرية! لقد نجحت في تلوين الكسر المطلوب بشكل دقيق، خذ نجمتك المضيئة! ⭐');
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setMatchStatus('fail');
    }
  };

  const handleVerifyComparison = (operator: '<' | '>' | '=') => {
    if (operator === compCorrect) {
      soundEffects.playStar();
      setCompStatus('success');
      setCompFeedback(`إجابة صحيحة يا بطل! 🌟 البرهان: ${fractionToWords(compNum1, compDen1)} مقارنة مع ${fractionToWords(compNum2, compDen2)}. والبرهان: الكسر الأول هو ${operator === '>' ? 'أكبر من' : operator === '<' ? 'أصغر من' : 'يساوي'} الكسر الثاني.`);
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setCompStatus('fail');
    }
  };

  const handleApplyMatchCorrection = () => {
    soundEffects.playStar();
    const correctedArray = Array(matchDenominator).fill(false);
    for (let i = 0; i < matchRequired; i++) {
      correctedArray[i] = true;
    }
    setMatchUserSlices(correctedArray);
    setMatchStatus('success');
    setMatchFeedback(`تطبيق تلقائي: قمنا بتلوين ${matchRequired} أجزاء من أصل ${matchDenominator} ليمثل كسر المطابقة بشكل صحيح.`);
    speakText(`قمنا بتلوينِ ${matchRequired} أجزاء من أصل ${matchDenominator} وهو يقرأ ${fractionToWords(matchRequired, matchDenominator)}.`);
  };

  const handleApplyCompCorrection = () => {
    soundEffects.playStar();
    setCompStatus('success');
    setCompFeedback(`تطبيق تلقائي: الإشارة الصحيحة هي [ ${compCorrect} ].`);
    speakText(`الإشارة الصائبة والمنهجية هي ${compCorrect === '>' ? 'أكبر من' : compCorrect === '<' ? 'أصغر من' : 'يساوي'}.`);
  };

  const activeNumeratorCreator = coloredSlices.filter(Boolean).length;

  const handleDenominatorCreatorChange = (val: number) => {
    soundEffects.playBeep();
    setPizzaSlices(val);
    setColoredSlices(Array(val).fill(false));
  };

  const generateComparison = () => {
    const list = [
      { n1: 1, d1: 2, n2: 1, d2: 4, ans: '>' as const, exp: 'عندما يتساوى البسط (١ و ١)، فإن الكسر صاحب المقام الأصغر (٢) يكون هو الأكبر! نصف البيتزا دائماً أكبر من ربعها!' },
      { n1: 1, d1: 3, n2: 1, d2: 6, ans: '>' as const, exp: 'الثلث أكبر من السدس لأن الجزء مقسم على ٣ أشخاص فقط، بينما السدس مقسم على ٦ أشخاص!' },
      { n1: 3, d1: 8, n2: 5, d2: 8, ans: '<' as const, exp: 'عندما يتساوى المقام (٨ و ٨)، نقوم بمقارنة البسط بشكل اعتيادي؛ وبما أن ٣ أصغر من ٥، فكسر ٣ على ٨ أصغر من ٥ على ٨.' },
      { n1: 4, d1: 6, n2: 2, d2: 6, ans: '>' as const, exp: 'بما أن لهما نفس المقامات المتساوية (٦)، وبما أن ٤ أكبر من ٢، فكسر ٤ على ٦ أكبر من ٢ على ٦.' },
      { n1: 1, d1: 8, n2: 1, d2: 5, ans: '<' as const, exp: 'المقام الأكبر (٨) يجعل القطعة الواحدة أصغر بكثير من القطعة المشتركة على ٥ أشخاص.' },
      { n1: 2, d1: 4, n2: 1, d2: 2, ans: '=' as const, exp: 'ربعان من البيتزا يعادلان نصف البيتزا تماماً! هذان كسران متكافئان لضرب أو قسمة الطرفين بـ ٢.' }
    ];
    const pick = list[Math.floor(Math.random() * list.length)];
    setCompNum1(pick.n1);
    setCompDen1(pick.d1);
    setCompNum2(pick.n2);
    setCompDen2(pick.d2);
    setCompCorrect(pick.ans);
    setCompStatus('idle');
    setCompFeedback('اختر الإشارة الصحيحة للحصول على النجمة!');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const matchUserCount = matchUserSlices.filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-rose-400 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-400 to-rose-500 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-rose-600/30 hover:bg-rose-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold self-start sm:self-auto animate-pulse"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة
        </button>
        <h2 className="text-2xl font-black flex items-center gap-2">
          🍕 مختبر الكسور وتلوين البيتزا
        </h2>
        <div className="flex items-center gap-2 bg-rose-600 bg-opacity-30 px-4 py-1.5 rounded-full font-bold text-sm">
          <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          <span>{toArabicNumerals(stars)} نجوم الكسور ⭐</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Lesson choices */}
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 mb-6">
          <h3 className="text-xs font-black text-rose-850 mb-2">🎈 اختر أحد دروس وحدة الكسور للمطالعة والحل التفاعلي:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => {
                  soundEffects.playBeep();
                  setSelectedLesson(les.id);
                  setMatchStatus('idle');
                  setCompStatus('idle');
                }}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  selectedLesson === les.id
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md transform scale-[1.01]'
                    : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300 hover:bg-rose-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block p-0.5 px-2 rounded self-start ${
                  selectedLesson === les.id ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                }`}>
                  {les.page}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Split holding playboard & correction assistant sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active play board */}
          <div className={`${
            (selectedLesson === 2 && matchStatus === 'fail') || (selectedLesson === 3 && compStatus === 'fail')
              ? 'lg:col-span-8'
              : 'lg:col-span-12'
          } space-y-6 transition-all`}>
            
            {/* Lesson 1: Concept Constructor */}
            {selectedLesson === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-rose-50/20 p-6 rounded-3xl border-2 border-rose-100">
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 rounded-full border-8 border-yellow-700 bg-orange-100 shadow-2xl flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full transform rotate-3" viewBox="0 0 200 200">
                      {Array.from({ length: pizzaSlices }).map((_, idx) => {
                        const angle = 360 / pizzaSlices;
                        const startAngle = idx * angle;
                        const endAngle = (idx + 1) * angle;

                        const rad1 = (startAngle - 90) * (Math.PI / 180);
                        const rad2 = (endAngle - 90) * (Math.PI / 180);

                        const x1 = 100 + 100 * Math.cos(rad1);
                        const y1 = 100 + 100 * Math.sin(rad1);
                        const x2 = 100 + 100 * Math.cos(rad2);
                        const y2 = 100 + 100 * Math.sin(rad2);

                        const largeArc = angle > 180 ? 1 : 0;
                        const d = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return (
                          <path
                            key={idx}
                            d={d}
                            onClick={() => handleSliceClickCreator(idx)}
                            className={`cursor-pointer transition-all duration-300 stroke-yellow-700 stroke-2 ${
                              coloredSlices[idx] 
                                ? 'fill-amber-500 hover:fill-amber-400' 
                                : 'fill-amber-100 hover:fill-amber-200'
                            }`}
                          />
                        );
                      })}
                    </svg>
                    <div className="z-10 bg-white/90 rounded-full p-2 px-4 text-[10px] font-black text-amber-800 shadow">
                      انقر لتلوين الأجزاء! 🍕
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">اختر عدد الأجزاء الكلية للبيتزا (المقام):</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[2, 3, 4, 5, 6, 8, 10, 12].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleDenominatorCreatorChange(val)}
                          className={`w-10 h-10 rounded-xl font-black text-sm transition-transform active:scale-90 ${
                            pizzaSlices === val ? 'bg-rose-500 text-white shadow-md' : 'bg-rose-100 text-rose-700 hover:bg-rose-200/50'
                          }`}
                        >
                          {toArabicNumerals(val)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-rose-800 border-b pb-2">📊 قراءة قيمة هذا الكسر:</h4>
                    <div className="flex justify-center items-center gap-4 py-2 border-b border-rose-50">
                      <div className="flex flex-col items-center justify-center font-black text-2xl text-rose-900">
                        <span>{toArabicNumerals(activeNumeratorCreator)}</span>
                        <div className="w-10 h-1 bg-rose-900 rounded my-1" />
                        <span>{toArabicNumerals(pizzaSlices)}</span>
                      </div>
                      <span className="text-xs text-slate-400">البسط الملون على المقام الكلي</span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-700">
                      مسمى الكسر: <span className="text-rose-600 underline">{fractionToWords(activeNumeratorCreator, pizzaSlices)}</span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-500 pt-1">
                      الكسر يعلمنا كيف نقسم قطعة خبز أو بيتزا بالعدل بالتساوي بين الأصدقاء!
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2">
                    <span className="text-2xl">🦜</span>
                    <div>
                      <strong className="text-[11px] text-amber-800 block font-black">تعريف بخت الرضا ص ٧٣:</strong>
                      <p className="text-[10.5px] leading-relaxed text-slate-750 mt-1 font-semibold">
                        الكسر هو جزء أو أجزاء متساوية من الواحد الكلي. نكتب الجزء المأخوذ أعلى الخط الكسري ونسميه (البسط)، والأجزاء الكلية نقسمها بأسفل الخط ونسميها (المقام).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson 2: Matcher */}
            {selectedLesson === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-rose-50/20 p-6 rounded-3xl border-2 border-rose-100">
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 rounded-full border-8 border-yellow-700 bg-orange-100 shadow-2xl flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full transform rotate-3" viewBox="0 0 200 200">
                      {Array.from({ length: matchDenominator }).map((_, idx) => {
                        const angle = 360 / matchDenominator;
                        const startAngle = idx * angle;
                        const endAngle = (idx + 1) * angle;

                        const rad1 = (startAngle - 90) * (Math.PI / 180);
                        const rad2 = (endAngle - 90) * (Math.PI / 180);

                        const x1 = 100 + 100 * Math.cos(rad1);
                        const y1 = 100 + 100 * Math.sin(rad1);
                        const x2 = 100 + 100 * Math.cos(rad2);
                        const y2 = 100 + 100 * Math.sin(rad2);

                        const largeArc = angle > 180 ? 1 : 0;
                        const d = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return (
                          <path
                            key={idx}
                            d={d}
                            onClick={() => handleSliceClickMatcher(idx)}
                            className={`cursor-pointer transition-all duration-300 stroke-yellow-700 stroke-2 ${
                              matchUserSlices[idx] 
                                ? 'fill-amber-500 hover:fill-amber-400' 
                                : 'fill-amber-100 hover:fill-amber-200'
                            }`}
                          />
                        );
                      })}
                    </svg>
                    <div className="z-10 bg-white/95 rounded-full p-2 px-4 shadow text-[10px] font-black text-amber-800">
                      لون القطع بالضغط! 🍕
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-2xl p-5 text-center border-4 border-amber-900 shadow-md">
                    <div className="text-[10px] text-emerald-400 mb-1 font-black">تحدي تلوين الكسر المطلوب:</div>
                    <span className="text-xs text-slate-300 font-bold block">مطلوب تلوين حصة تكافئ:</span>
                    <strong className="text-4xl text-white font-extrabold block my-2 font-mono">
                      {toArabicNumerals(matchRequired)} / {toArabicNumerals(matchDenominator)}
                    </strong>
                    <span className="text-[11px] text-amber-200 font-semibold block">
                      أي كسر: {fractionToWords(matchRequired, matchDenominator)}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-rose-100 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">تلوينك الحالي:</span>
                      <strong className="text-rose-700 font-black text-sm">{toArabicNumerals(matchUserCount)} من {toArabicNumerals(matchDenominator)} قطعة</strong>
                    </div>

                    {matchStatus !== 'success' && (
                      <button
                        onClick={handleVerifyMatch}
                        className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95"
                      >
                        تحقق من تلوينك للكسر الآن! ⭐
                      </button>
                    )}
                  </div>

                  {matchStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50 border-4 border-emerald-400 p-4 rounded-2xl text-center space-y-2"
                    >
                      <span className="text-3xl">🎉🍕⭐</span>
                      <p className="text-xs font-black text-emerald-800 leading-relaxed">{matchFeedback}</p>
                      <button
                        onClick={generateMatchQuestion}
                        className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-full inline-block"
                      >
                        العب تحدياً تالياً للكسور 🔄
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Lesson 3: Comparing Fractions */}
            {selectedLesson === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-rose-50/20 p-6 rounded-3xl border-2 border-rose-100">
                <div className="flex flex-col gap-6 items-center">
                  
                  {/* Two comparative visualizer pizzas */}
                  <div className="flex justify-center gap-4 w-full">
                    
                    {/* Pizza 1 */}
                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-rose-100 w-1/2">
                      <span className="text-[10px] font-black text-slate-500 mb-1">البيتزا الأولى:</span>
                      <div className="relative w-28 h-28 rounded-full border-4 border-yellow-700 bg-orange-100 overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full transform" viewBox="0 0 200 200">
                          {Array.from({ length: compDen1 }).map((_, idx) => {
                            const angle = 360 / compDen1;
                            const startAngle = idx * angle;
                            const endAngle = (idx + 1) * angle;

                            const rad1 = (startAngle - 90) * (Math.PI / 180);
                            const rad2 = (endAngle - 90) * (Math.PI / 180);

                            const x1 = 100 + 100 * Math.cos(rad1);
                            const y1 = 100 + 100 * Math.sin(rad1);
                            const x2 = 100 + 100 * Math.cos(rad2);
                            const y2 = 100 + 100 * Math.sin(rad2);

                            const d = `M 100 100 L ${x1} ${y1} A 100 100 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

                            return (
                              <path
                                key={idx}
                                d={d}
                                className={`stroke-yellow-700 stroke-2 ${idx < compNum1 ? 'fill-amber-500' : 'fill-amber-100'}`}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <strong className="text-base text-rose-900 mt-2 font-mono">{toArabicNumerals(compNum1)} / {toArabicNumerals(compDen1)}</strong>
                      <span className="text-[9px] text-gray-400 block text-center">({fractionToWords(compNum1, compDen1)})</span>
                    </div>

                    {/* Pizza 2 */}
                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-rose-100 w-1/2">
                      <span className="text-[10px] font-black text-slate-500 mb-1">البيتزا الثانية:</span>
                      <div className="relative w-28 h-28 rounded-full border-4 border-yellow-700 bg-orange-100 overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full transform" viewBox="0 0 200 200">
                          {Array.from({ length: compDen2 }).map((_, idx) => {
                            const angle = 360 / compDen2;
                            const startAngle = idx * angle;
                            const endAngle = (idx + 1) * angle;

                            const rad1 = (startAngle - 90) * (Math.PI / 180);
                            const rad2 = (endAngle - 90) * (Math.PI / 180);

                            const x1 = 100 + 100 * Math.cos(rad1);
                            const y1 = 100 + 100 * Math.sin(rad1);
                            const x2 = 100 + 100 * Math.cos(rad2);
                            const y2 = 100 + 100 * Math.sin(rad2);

                            const d = `M 100 100 L ${x1} ${y1} A 100 100 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

                            return (
                              <path
                                key={idx}
                                d={d}
                                className={`stroke-yellow-700 stroke-2 ${idx < compNum2 ? 'fill-amber-500' : 'fill-amber-100'}`}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <strong className="text-base text-rose-900 mt-2 font-mono">{toArabicNumerals(compNum2)} / {toArabicNumerals(compDen2)}</strong>
                      <span className="text-[9px] text-gray-400 block text-center">({fractionToWords(compNum2, compDen2)})</span>
                    </div>

                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-2xl p-5 text-center border-4 border-amber-900">
                    <span className="text-[10px] text-amber-300 font-bold block mb-1">مقارنة الحصص والرموز ص ٨٤:</span>
                    <p className="text-xs text-white leading-relaxed">
                      اختر الرمز الصحيح للمقارنة بين حصتي الكسرين في البيتزا بالأعلى:
                    </p>
                    <div className="flex justify-center items-center gap-2 mt-3 font-mono font-black text-xl text-amber-140">
                      <span>{toArabicNumerals(compNum1)}/{toArabicNumerals(compDen1)}</span>
                      <span className="bg-slate-700 p-1 px-3 rounded text-rose-400">؟</span>
                      <span>{toArabicNumerals(compNum2)}/{toArabicNumerals(compDen2)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-center gap-3">
                    {['>', '<', '='].map((op) => (
                      <button
                        key={op}
                        onClick={() => handleVerifyComparison(op as any)}
                        className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-xl shadow-md transition-transform active:scale-90"
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  {compStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50 border-4 border-emerald-400 p-4 rounded-2xl text-center text-emerald-900 text-xs font-bold leading-relaxed space-y-2"
                    >
                      <span className="text-2xl">👏⚖️🌟</span>
                      <p>{compFeedback}</p>
                      <button
                        onClick={generateComparison}
                        className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9.5px] rounded-full inline-block mt-2"
                      >
                        تحدّي تالٍ في المقارنة 🔄
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Corrective Assistant Side Panel when fail */}
          <AnimatePresence>
            {((selectedLesson === 2 && matchStatus === 'fail') || (selectedLesson === 3 && compStatus === 'fail')) && (
              <motion.div
                initial={{ transform: 'translateX(50px)', opacity: 0 }}
                animate={{ transform: 'translateX(0)', opacity: 1 }}
                exit={{ transform: 'translateX(50px)', opacity: 0 }}
                className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between text-right"
              >
                
                {/* Match Failure info */}
                {selectedLesson === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح الكسور والمطابقة التفاعلي:</h4>
                    </div>

                    <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                      أوه، تلوينك غير متطابق! الكسر الذي تلوّنه يمثّل بالصيغة <span className="text-rose-600 font-extrabold">{toArabicNumerals(matchUserCount)} / {toArabicNumerals(matchDenominator)}</span>، بينما الكسر المطلوب بالتحديد هو <span className="text-emerald-750 font-black text-sm">{toArabicNumerals(matchRequired)} / {toArabicNumerals(matchDenominator)}</span>!
                    </p>

                    <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-2 text-[11px] font-bold text-slate-700 leading-relaxed">
                      <span className="text-[10px] text-slate-450 font-black border-b pb-1 block">شرح المدرس حسون بالمنظومة:</span>
                      <div>- المقام هو <span className="text-rose-600">{toArabicNumerals(matchDenominator)}</span>: هذا يعني كعكة البيتزا مقسمة كجسم لـ {toArabicNumerals(matchDenominator)} قطع متساوية.</div>
                      <div>- البسط المطلوب هو <span className="text-emerald-700">{toArabicNumerals(matchRequired)}</span>: يعني يجب أن نلون بقطعة الجبن والزعتر {toArabicNumerals(matchRequired)} أجزاء منها بالتحديد.</div>
                      <div className="bg-amber-50 p-1.5 rounded text-amber-800 text-[10px] my-1 text-center font-bold">
                        تذكر: لون {toArabicNumerals(matchRequired)} قطع فقط!
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplyMatchCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبّق الكسر الصحيح وتعلّم 🍕
                      </button>

                      <button
                        onClick={() => speakText(`أوه يا بطل، عدد القطع التلوينية التي اخترتها هي ${matchUserCount} من أصل ${matchDenominator}، ولكن الكسر الأصلي المطلوب تلوينه يتطلب منك تلوينُ ${matchRequired} قطع تماماً. هيا نضغط زر تطبيق الحل لتشاهد الكسر الصحيح وتفهمه!`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للشرح الصوتي للكسر المطلوب
                      </button>

                      <button
                        onClick={generateMatchQuestion}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center"
                      >
                        تخطى إلى كسر تالٍ ➡️
                      </button>
                    </div>

                  </div>
                )}

                {/* Compare Failure info */}
                {selectedLesson === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح مقارنة الكسور:</h4>
                    </div>

                    <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                      أوه، الإشارة المختارة غير صحيحة! دعنا نقارن الكسر الأول <span className="font-extrabold text-indigo-700">{compNum1}/{compDen1}</span> مع الكسر الثاني <span className="font-extrabold text-rose-600">{compNum2}/{compDen2}</span> بقواعد منهاج بخت الرضا ص ٨٤:
                    </p>

                    <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-2 text-[10.5px] font-bold text-slate-705 leading-relaxed">
                      <span className="text-[9.5px] text-slate-450 font-black border-b pb-1 block">قواعد المقارنة المنهجية:</span>
                      {compDen1 === compDen2 ? (
                        <div>
                          <strong>١. متساويا المقام ({compDen1} و {compDen2}):</strong> بما أن الأجزاء مقسمة بالتساوي، فإن المقارنة سهلة جداً؛ الكسر ذو البسط الأكبر هو الكسر الأكبر مباشرة! {compNum1} مقارنة مع {compNum2}.
                        </div>
                      ) : compNum1 === compNum2 ? (
                        <div>
                          <strong>٢. متساويا البسط ({compNum1} و {compNum2}):</strong> انتبه لخدعة الحصص! عندما تتوزع قطعة واحدة على عدد أقل من الأفراد، يكون نصيب الفرد أكبر بكثير. لذلك: الكسر ذو المقام الأصغر يكون هو الكسر الأكبر!
                        </div>
                      ) : (
                        <div>
                          تأمل شكل البيتزا بالأعلى؛ الجزء المظلل باللون البرتقالي للكسر {compNum1}/{compDen1} هو بوضوح {compCorrect === '>' ? 'أكبر من' : compCorrect === '<' ? 'أصغر من' : 'يساوي'} الجزء المظلل للكسر {compNum2}/{compDen2}.
                        </div>
                      )}
                      
                      <div className="bg-amber-100 p-1.5 rounded text-amber-800 text-[10px] text-center">
                        الإشارة الصائبة والنهائية هي: [ {compCorrect} ]
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplyCompCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبّق الاختيار الصحيح وتعلّم ⚖️
                      </button>

                      <button
                        onClick={() => speakText(`تذكر أنه عندما يتساوى بسط الكسرين، فإن الكسر صاحب المقام الأصغر يكون هو الأكبر! لذلك فإن الكسر الأول هو ${compCorrect === '>' ? 'أكبر من' : compCorrect === '<' ? 'أصغر من' : 'يساوي'} الكسر الثاني.`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للشرح الصوتي للمقارنة
                      </button>

                      <button
                        onClick={generateComparison}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center"
                      >
                        تخطى إلى مقارنة تالية ➡️
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
