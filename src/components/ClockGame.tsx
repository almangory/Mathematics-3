import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, Volume2, RefreshCw, Star, Clock } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ClockGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function ClockGame({ onBack, onAddStars }: ClockGameProps) {
  const [mode, setMode] = useState<'explore' | 'challenge'>('explore');
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

  // Typical times list from Sudanese book:
  // p.105:
  // - 1:15 (الواحدة والربع)
  // - 1:20 (الواحدة والثلث)
  // - 3:30 (الثالثة والنصف)
  // - 8:40 (الثامنة وأربعون دقيقة / الثامنة والثلثان أو التاسعة إلا ثلثاً)
  // - 12:05 (الثانية عشرة وخمس دقائق)
  // - 12:35 (الثانية عشرة ونصف وخمس دقائق)
  // - 1:45 (الواحدة وخمس وأربعون دقيقة / الثانية إلا ربعاً)
  // - 12:50 (الواحدة إلا عشر دقائق)
  const challengeSet = [
    { hr: 1, min: 15, text: 'الساعة الواحدة والربع (١:١٥)', phrase: 'الواحدة والربع' },
    { hr: 3, min: 30, text: 'الساعة الثالثة والنصف (٣:٣٠)', phrase: 'الثالثة والنصف' },
    { hr: 1, min: 20, text: 'الساعة الواحدة والثلث (١:٢٠)', phrase: 'الواحدة والثلث' },
    { hr: 8, min: 40, text: 'الساعة التاسعة إلا ثلثاً (٨:٤٠)', phrase: 'التاسعة إلا ثلثاً' },
    { hr: 12, min: 5, text: 'الساعة الثانية عشرة وخمس دقائق (١٢:٠٥)', phrase: 'الثانية عشرة وخمس دقائق' },
    { hr: 12, min: 45, text: 'الساعة الواحدة إلا ربعاً (١٢:٤٥)', phrase: 'الواحدة إلا ربعاً' },
    { hr: 8, min: 20, text: 'الساعة الثامنة والثلث (٨:٢٠)', phrase: 'الثامنة والثلث' },
    { hr: 1, min: 50, text: 'الساعة الثانية إلا عشر دقائق (١:٥٠)', phrase: 'الثانية إلا عشر دقائق' },
  ];

  useEffect(() => {
    if (mode === 'challenge') {
      generateChallenge();
    }
  }, [mode]);

  const generateChallenge = () => {
    const pick = challengeSet[Math.floor(Math.random() * challengeSet.length)];
    setTargetHours(pick.hr);
    setTargetMinutes(pick.min);
    setChallengeText(pick.text);
    setFeedback('مرحباً بك! اضبط العداد الساعات ليتطابق مع الوقت المطلوب.');
    setIsSuccess(null);
    // Move current test clock to a generic random time
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
  };

  const adjustMinutes = (val: number) => {
    soundEffects.playBeep();
    setMinutes(prev => {
      let next = prev + val;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
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
      const userFriendlyStr = getTimeName(hours, minutes);
      setFeedback(`الوقت الذي أدخلته هو: ${userFriendlyStr}. والمطلوب هو: ${challengeText}. حاول التعديل لتطابقه بدقة!`);
    }
  };

  // Convert numbers to Arabic clock description wording (p.105)
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
      // In Arabic, 40 min is often phrased as next hour "إلا ثلثاً"
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

  // Calculate hands rotation angles in degrees
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  const speakTimeText = () => {
    if ('speechSynthesis' in window) {
      const text = getTimeName(hours, minutes);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
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
          ⏰ مغامرة قياس الوقت والساعة
        </h2>
        <div className="flex items-center gap-2 bg-amber-600 bg-opacity-30 px-4 py-1.5 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-bold">{stars} ⭐</span>
        </div>
      </div>

      <div className="p-6">
        {/* Toggle Game Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { soundEffects.playBeep(); setMode('explore'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              mode === 'explore' 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            🧭 مستكشف الساعة الحر
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setMode('challenge'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              mode === 'challenge' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            🎯 تحدّي عقارب الساعة
          </button>
        </div>

        {/* Story details */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-right flex items-start gap-4 mb-8">
          <span className="text-5xl animate-bounce">🦜</span>
          <div className="flex-1">
            <h3 className="text-lg font-black text-amber-800 mb-1">المرشد حسون الساعي:</h3>
            {mode === 'explore' ? (
              <p className="text-amber-700 text-sm leading-relaxed">
                هل تعلم يا رفيق أن قياس الوقت ينظّم يومنا وصلاتنا ودراستنا؟ 
                <strong>الشوكة القصيرة (الحمراء)</strong> تحدد الساعات، بينما <strong>الشوكة الطويلة (الزرقاء)</strong> تحدد الدقائق. 
                قم بتحريك الأزرار بالأسفل لتتعلم نطق الأوقات الحكيمة!
              </p>
            ) : (
              <div>
                <p className="text-sky-800 font-extrabold text-base mb-2">{feedback}</p>
                <div className="inline-block bg-white border-2 border-emerald-400 text-emerald-950 font-black text-2xl p-3 px-8 rounded-2xl">
                  {challengeText}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-orange-50/20 p-6 rounded-3xl border border-orange-100">
          {/* Analog Clock Dial visual container */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 rounded-full border-12 border-amber-800 bg-white shadow-2xl flex items-center justify-center">
              {/* Center point */}
              <div className="absolute w-4 h-4 bg-yellow-900 rounded-full z-30 shadow" />

              {/* Hour Numbers on Dial */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
                const angle = idx * 30; // 30 deg each number
                const style = {
                  transform: `rotate(${angle}deg) translate(0, -90px) rotate(-${angle}deg)`,
                };
                return (
                  <span 
                    key={num} 
                    style={style} 
                    className="absolute font-black text-lg text-amber-950 text-center font-mono w-8 h-8 flex items-center justify-center select-none"
                  >
                    {num}
                  </span>
                );
              })}

              {/* Minute notches ticks */}
              {Array.from({ length: 12 }).map((_, idx) => (
                <div 
                  key={idx}
                  className="absolute w-1 h-3.5 bg-amber-800 opacity-30 origin-bottom"
                  style={{
                    transform: `rotate(${idx * 30}deg) translate(0, -112px)`,
                  }}
                />
              ))}

              {/* Hours hand needle - Red/amber (القصيرة) */}
              <div 
                className="absolute w-2 h-14 bg-rose-600 rounded-full origin-bottom z-10 transition-transform duration-300"
                style={{
                  transform: `rotate(${hourAngle}deg) translateY(-28px)`,
                }}
              />

              {/* Minutes hand needle - Blue (الطويلة) */}
              <div 
                className="absolute w-1.5 h-20 bg-sky-600 rounded-full origin-bottom z-20 transition-transform duration-300"
                style={{
                  transform: `rotate(${minuteAngle}deg) translateY(-40px)`,
                }}
              />
            </div>

            {/* Micro details captions */}
            <div className="flex gap-4 mt-4 text-[10px] font-bold text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-600 rounded-full" /> شوكة الساعات</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-600 rounded-full" /> شوكة الدقائق</span>
            </div>
          </div>

          {/* Clock controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Hour and minute selector values */}
            <div className="flex gap-8 justify-center bg-white p-6 rounded-3xl border-2 border-orange-100 shadow w-full max-w-sm">
              {/* Hour Adjustment */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 mb-1">الساعات</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustHours(-1)}
                    className="w-10 h-10 bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold rounded-xl active:scale-90 transition-transform text-lg"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black text-gray-800 font-mono w-12 text-center">
                    {hours}
                  </span>
                  <button 
                    onClick={() => adjustHours(1)}
                    className="w-10 h-10 bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold rounded-xl active:scale-90 transition-transform text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Minute adjustment */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 mb-1">الدقائق</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustMinutes(-5)}
                    className="w-10 h-10 bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold rounded-xl active:scale-90 transition-transform text-lg"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black text-gray-800 font-mono w-16 text-center">
                    {minutes.toString().padStart(2, '0')}
                  </span>
                  <button 
                    onClick={() => adjustMinutes(5)}
                    className="w-10 h-10 bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold rounded-xl active:scale-90 transition-transform text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Read text card */}
            <div className="bg-amber-800 bg-opacity-5 p-4 rounded-2xl text-center w-full max-w-sm border border-amber-800/10">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1">الوقت المنطوق</span>
              <div className="text-lg font-bold text-amber-950 flex items-center justify-center gap-2">
                <span>{getTimeName(hours, minutes)}</span>
                <button
                  onClick={speakTimeText}
                  className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full hover:scale-105 active:scale-95 transition-transform"
                  title="انطق الوقت"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Challenge submission button */}
            {mode === 'challenge' && (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleVerify}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  تحقق من الوقت المضبوط! 🎯
                </button>

                {isSuccess && (
                  <button
                    onClick={generateChallenge}
                    className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold p-2 px-6 rounded-full shadow text-sm transition-transform active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> جرب وقتاً آخر!
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
