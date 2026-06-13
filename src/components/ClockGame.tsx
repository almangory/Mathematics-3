import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, Volume2, RefreshCw, Star, Clock, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ClockGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function ClockGame({ onBack, onAddStars }: ClockGameProps) {
  const [mode, setMode] = useState<'explore' | 'challenge'>('explore');
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [stars, setStars] = useState(0);

  // Time representation states
  const [hours, setHours] = useState(3);       // 1 to 12
  const [minutes, setMinutes] = useState(0);    // 0 to 55, in multiples of 5

  // Challenge state
  const [targetHours, setTargetHours] = useState(9);
  const [targetMinutes, setTargetMinutes] = useState(40);
  const [challengeText, setChallengeText] = useState('الساعة التاسعة إلا ثلثاً');
  const [feedback, setFeedback] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const lessons = [
    { id: 1, title: 'الدرس ١: قياس وضبط الساعات وخانات الدقائق', desc: 'ضبط الأوقات البسيطة وعقارب الساعات من الكتاب القياسي.', page: 'كتاب ص ١٠٤' },
    { id: 2, title: 'الدرس ٢: النصف والربع والثلث بالتحديد', desc: 'تمثيل ربع وثُلث ونصف الساعات على عقارب الزوايا الدائرية.', page: 'كتاب ص ١٠٥' },
    { id: 3, title: 'الدرس ٣: أوقات الاستثناء (إلا ربعاً وثلثاً وعقاربها)', desc: 'تمثيل الدقائق المتأخرة والتحويل للرقم المنهجي التالي.', page: 'كتاب ص ١٠٦' },
  ];

  // Specific question sets for clock lessons
  const challengeSetLesson1 = [
    { hr: 12, min: 5, text: 'الساعة الثانية عشرة وخمس دقائق (١٢:٠٥)' },
    { hr: 3, min: 10, text: 'الساعة الثالثة وعشر دقائق (٣:١٠)' },
    { hr: 6, min: 0, text: 'الساعة السادسة تماماً (٦:٠٠)' },
    { hr: 11, min: 25, text: 'الساعة الحادية عشرة وخمس وعشرون دقيقة (١١:٢٥)' },
  ];

  const challengeSetLesson2 = [
    { hr: 1, min: 15, text: 'الساعة الواحدة والربع (١:١٥)' },
    { hr: 3, min: 30, text: 'الساعة الثالثة والنصف (٣:٣٠)' },
    { hr: 1, min: 20, text: 'الساعة الواحدة والثلث (١:٢٠)' },
    { hr: 8, min: 20, text: 'الساعة الثامنة والثلث (٨:٢٠)' },
  ];

  const challengeSetLesson3 = [
    { hr: 8, min: 40, text: 'الساعة التاسعة إلا ثلثاً (٨:٤٠)' },
    { hr: 12, min: 45, text: 'الساعة الواحدة إلا ربعاً (١٢:٤٥)' },
    { hr: 1, min: 50, text: 'الساعة الثانية إلا عشر دقائق (١:٥٠)' },
    { hr: 6, min: 55, text: 'الساعة السابعة إلا خمس دقائق (٦:٥٥)' },
  ];

  useEffect(() => {
    if (mode === 'challenge') {
      generateChallenge();
    }
  }, [mode, selectedLesson]);

  const generateChallenge = () => {
    let pick = challengeSetLesson1[0];
    if (selectedLesson === 1) {
      pick = challengeSetLesson1[Math.floor(Math.random() * challengeSetLesson1.length)];
    } else if (selectedLesson === 2) {
      pick = challengeSetLesson2[Math.floor(Math.random() * challengeSetLesson2.length)];
    } else {
      pick = challengeSetLesson3[Math.floor(Math.random() * challengeSetLesson3.length)];
    }

    setTargetHours(pick.hr);
    setTargetMinutes(pick.min);
    setChallengeText(pick.text);
    setFeedback('مرحباً بك! اضبط عقارب الساعات والدقائق لتطابق الوقت الصائب من السؤال.');
    setIsSuccess(null);
    setHours(12);
    setMinutes(0);
  };

  const adjustHours = (val: number) => {
    soundEffects.playBeep();
    setHours(prev => {
      let next = prev + val;
      if (next > 12) return 1;
      if (next < 1) return 12;
      return next;
    });
    if (isSuccess === false) setIsSuccess(null);
  };

  const adjustMinutes = (val: number) => {
    soundEffects.playBeep();
    setMinutes(prev => {
      let next = prev + val;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
    if (isSuccess === false) setIsSuccess(null);
  };

  const handleVerify = () => {
    if (hours === targetHours && minutes === targetMinutes) {
      soundEffects.playStar();
      setIsSuccess(true);
      setFeedback('يا سلام! ضبطت التوقيت على عقارب الساعة باحترافية تامة! ⭐ خذ نجمة دراسية لامعة.');
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setIsSuccess(false);
    }
  };

  // Autocomplete correct answer inside sidebar
  const handleApplyCorrection = () => {
    soundEffects.playStar();
    setHours(targetHours);
    setMinutes(targetMinutes);
    setIsSuccess(true);
    setFeedback(`تنبؤ تفاعلي: قمنا بضبط عقارب الساعة على ${targetHours}:${targetMinutes.toString().padStart(2, '0')} تماماً!`);
    speakText(`قمنا بتعديل عقرب الساعات ليشير إلى الرقم ${targetHours} وجعلنا عقرب الدقائق يشير إلى ${targetMinutes / 5} ليكون الوقت تماماً ${challengeText}.`);
  };

  const getTimeName = (hr: number, min: number): string => {
    const hoursInArabic: Record<number, string> = {
      1: 'الواحدة', 2: 'الثانية', 3: 'الثالثة', 4: 'الرابعة', 5: 'الخامسة',
      6: 'السادسة', 7: 'السابعة', 8: 'الثامنة', 9: 'التاسعة', 10: 'العاشرة',
      11: 'الحادية عشرة', 12: 'الثانية عشرة'
    };

    const hrWord = hoursInArabic[hr] || '';
    if (min === 0) return `الساعة ${hrWord} تماماً`;
    if (min === 5) return `الساعة ${hrWord} وخمس دقائق`;
    if (min === 10) return `الساعة ${hrWord} وعشر دقائق`;
    if (min === 15) return `الساعة ${hrWord} والربع`;
    if (min === 20) return `الساعة ${hrWord} والثلث`;
    if (min === 25) return `الساعة ${hrWord} وخمس وعشرون دقيقة`;
    if (min === 30) return `الساعة ${hrWord} والنصف`;
    if (min === 35) return `الساعة ${hrWord} والنصف وخمس دقائق`;
    if (min === 40) {
      const nextHr = hr === 12 ? 1 : hr + 1;
      return `الساعة ${hoursInArabic[nextHr]} إلا ثلثاً`;
    }
    if (min === 45) {
      const nextHr = hr === 12 ? 1 : hr + 1;
      return `الساعة ${hoursInArabic[nextHr]} إلا ربعاً`;
    }
    if (min === 50) {
      const nextHr = hr === 12 ? 1 : hr + 1;
      return `الساعة ${hoursInArabic[nextHr]} إلا عشر دقائق`;
    }
    if (min === 55) {
      const nextHr = hr === 12 ? 1 : hr + 1;
      return `الساعة ${hoursInArabic[nextHr]} إلا خمس دقائق`;
    }

    return `الساعة ${hrWord} و ${min} دقيقة`;
  };

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
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
          ⏰ ورشة الساعات والمواقيت الممنهجة
        </h2>
        <div className="flex items-center gap-2 bg-amber-600 bg-opacity-30 px-4 py-1.5 rounded-full text-sm font-bold">
          <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          <span>{stars} نجوم الزمن ⭐</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Lesson choices */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
          <h3 className="text-xs font-black text-amber-805 mb-2">🏷️ اختر أحد دروس وحدة الساعات والوقت للتعلم وحل المسائل:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md transform scale-[1.01]'
                    : 'bg-white text-gray-700 border-amber-100 hover:border-amber-300 hover:bg-amber-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block p-0.5 px-2 rounded self-start ${
                  mode === 'challenge' && selectedLesson === les.id ? 'bg-amber-600 text-yellow-100' : 'bg-amber-55 text-amber-700'
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
              🧭 نمط استكشاف الوقت الحر (حرّك العقارب بنفسك)
            </button>
          </div>
        </div>

        {/* Central Split Layout: hold clock board and correction assistant sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active play board */}
          <div className={`${
            mode === 'challenge' && isSuccess === false ? 'lg:col-span-8' : 'lg:col-span-12'
          } space-y-6 transition-all`}>
            
            {/* Instruction Banner */}
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200 flex items-start gap-4">
              <span className="text-3xl animate-bounce">🦜</span>
              <div className="flex-1 text-right">
                <h4 className="text-sky-950 font-black text-xs md:text-sm">عصا التدريب لحسون:</h4>
                {mode === 'explore' ? (
                  <p className="text-sky-850 text-[11px] leading-relaxed mt-1 font-semibold">
                    أهلاً بك! اضبط الساعات والدقائق عن طريق نقرات الأزرار أسفل الساعة، ثم استمع لكيف ينطق حسون الوقت من بخت الرضا.
                  </p>
                ) : (
                  <div className="space-y-1.5 mt-1">
                    <span className="text-slate-650 text-[11px] block font-bold">المطلوب تدوير وتعديل العقارب لتكافئ الوقت التالي:</span>
                    <strong className="text-lg text-amber-900 block font-black border-r-4 border-amber-505 pr-2">
                      {challengeText}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Clock Visual Board & Adjustment Controls */}
            <div className="bg-amber-50/20 rounded-3xl p-6 border-2 border-amber-100 flex flex-col md:flex-row items-center justify-around gap-6">
              
              {/* Analogue Clock UI with SVG hands */}
              <div className="relative w-64 h-64 rounded-full border-[10px] border-amber-800 bg-white shadow-xl flex items-center justify-center">
                {/* Clock Face Details */}
                <div className="absolute inset-2 rounded-full border border-slate-200 border-dashed pointer-events-none" />

                {/* Hour ticks */}
                {Array.from({ length: 12 }).map((_, idx) => {
                  const angle = (idx + 1) * 30;
                  const rad = (angle - 90) * (Math.PI / 180);
                  const x = 50 + 40 * Math.cos(rad);
                  const y = 50 + 40 * Math.sin(rad);

                  return (
                    <span 
                      key={idx}
                      className="absolute font-black text-sm text-slate-700 font-mono select-none"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {idx + 1}
                    </span>
                  );
                })}

                {/* Minute Hand (Blue, Long) */}
                <div 
                  className="absolute bottom-1/2 left-1/2 w-1.5 h-24 bg-sky-500 rounded-full origin-bottom transform -translate-x-1/2 transition-transform duration-300 shadow"
                  style={{ transform: `rotate(${minuteAngle}deg)`, transformOrigin: 'bottom center', height: '80px' }}
                />

                {/* Hour Hand (Red, Short) */}
                <div 
                  className="absolute bottom-1/2 left-1/2 w-2.5 h-16 bg-rose-500 rounded-full origin-bottom transform -translate-x-1/2 transition-transform duration-300 shadow"
                  style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: 'bottom center', height: '55px' }}
                />

                {/* Center Hub */}
                <div className="absolute w-5 h-5 bg-amber-950 border-2 border-white rounded-full z-10 shadow-md" />
              </div>

              {/* Digital and manual adjust control cards */}
              <div className="w-full md:w-80 space-y-4">
                
                {/* Digital LCD output */}
                <div className="bg-slate-800 text-white rounded-2xl p-4 border-4 border-amber-900 text-center shadow-lg font-mono">
                  <span className="text-[9.5px] block text-slate-450 font-bold tracking-widest mb-1">النمط الرقمي للوقت</span>
                  <div className="text-4xl font-extrabold tracking-widest text-emerald-400">
                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => speakText(getTimeName(hours, minutes))}
                    className="mt-2.5 p-1 px-4 bg-slate-700 hover:bg-slate-650 rounded-full text-[10px] font-black text-sky-200 inline-flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> نطق السيدة حسونة 🗣️
                  </button>
                </div>

                {/* Adjustment pads */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-100 flex flex-col items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 mb-1">الساعات</span>
                    <button
                      onClick={() => adjustHours(1)}
                      className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-sm flex items-center justify-center hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-transform"
                    >
                      +
                    </button>
                    <span className="my-1.5 font-black text-lg text-slate-800">{hours}</span>
                    <button
                      onClick={() => adjustHours(-1)}
                      className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-sm flex items-center justify-center hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-transform"
                    >
                      -
                    </button>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-100 flex flex-col items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 mb-1">الدقائق</span>
                    <button
                      onClick={() => adjustMinutes(5)}
                      className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-sm flex items-center justify-center hover:bg-sky-100 hover:text-sky-700 active:scale-95 transition-transform"
                    >
                      +
                    </button>
                    <span className="my-1.5 font-black text-lg text-slate-800">{minutes}</span>
                    <button
                      onClick={() => adjustMinutes(-5)}
                      className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-sm flex items-center justify-center hover:bg-sky-100 hover:text-sky-700 active:scale-95 transition-transform"
                    >
                      -
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Action buttons list */}
            {mode === 'challenge' && (
              <div className="flex flex-col items-center gap-3">
                {isSuccess === null && (
                  <button
                    onClick={handleVerify}
                    className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-black text-sm rounded-full shadow-lg transform active:scale-95 transition-transform"
                  >
                    انتهيت! تحقق من دقة العقارب للتصحيح 🏆
                  </button>
                )}

                {isSuccess === true && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border-4 border-emerald-400 p-5 rounded-2xl text-center space-y-3 w-full max-w-lg mx-auto"
                  >
                    <span className="text-3xl">🎉⏰🏆</span>
                    <h4 className="text-xs font-black text-emerald-800">{feedback}</h4>
                    <button
                      onClick={generateChallenge}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10.5px] rounded-full inline-block mt-2 transition-all active:scale-95 font-black"
                    >
                      العب تحدٍّ جديد في الدقائق 🔄
                    </button>
                  </motion.div>
                )}
              </div>
            )}

          </div>

          {/* Clock Failure corrective assistant panel if fail */}
          <AnimatePresence>
            {mode === 'challenge' && isSuccess === false && (
              <motion.div
                initial={{ transform: 'translateX(50px)', opacity: 0 }}
                animate={{ transform: 'translateX(0)', opacity: 1 }}
                exit={{ transform: 'translateX(50px)', opacity: 0 }}
                className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between text-right"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-800 animate-pulse">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <h4 className="text-xs font-black">مصحح حسون لضبط الساعات:</h4>
                  </div>

                  <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                    أوه، عقارب الساعة ومواقيتها غير دقيقة! عقاربك الحالية تمثل <span className="text-rose-600 font-extrabold">{getTimeName(hours, minutes)} ({hours}:{minutes.toString().padStart(2, '0')})</span>، والمطلوب تماماً هو <span className="text-emerald-750 font-black">{challengeText}</span>!
                  </p>

                  <div className="bg-white rounded-2xl p-3 border border-rose-100 space-y-2 text-[10.5px] font-bold text-slate-700 leading-relaxed">
                    <span className="text-[9.5px] text-slate-450 border-b pb-1 font-black block">زوايا عقارب بخت الرضا:</span>
                    <div>- عقرب الساعات (القصير الأحمر) يجب أن يوجه ليشير للرقم المنهجي وهو: <strong className="text-rose-600 text-sm">{targetHours}</strong>.</div>
                    
                    <div>- عقرب الدقائق (الطويل الأزرق) يجب أن يوجه للدقائق المطلوبة وهي: <strong className="text-sky-600 text-sm">{targetMinutes} دقيقة</strong> (وهي مطابقة لحركة الرقم <strong className="text-slate-800">{targetMinutes / 5}</strong> على الساعة).</div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2 items-start text-[10.5px]">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <strong className="text-amber-800 block font-black">توضيحات منهاج بخت الرضا ص ١٠٥:</strong>
                      <span className="text-slate-700 font-semibold leading-relaxed block mt-1">
                        الساعة الواحدة تعادل ٦٠ دقيقة. النصف يعادل ٣٠ دقيقة، والربع يعادل ١٥ دقيقة، والثلث يعادل ٢٠ دقيقة. أوقات "إلا" تعكس دوران العقرب للرقم المنهجي التالي ونقصان الميزان!
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <button
                    onClick={handleApplyCorrection}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                  >
                     طبق ضبط الوقت وتعلّم ⏰
                  </button>

                  <button
                    onClick={() => speakText(`أوه يا بطل، عقارب ساعتك تعبر عن ${getTimeName(hours, minutes)}، ولكن المطلوب ضبطه هو ${challengeText} لتكسب النجمة الذهبية. هيا نضغط زر تطبيق الحل التفاعلي لتشاهد تدوير حركة العقارب وتفهمها!`)}
                    className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                  >
                    🗣️ استمع للشرح الصوتي من حسون
                  </button>

                  <button
                    onClick={generateChallenge}
                    className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center animate-pulse"
                  >
                    تخطى والعب بساعة تالية ➡️
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
