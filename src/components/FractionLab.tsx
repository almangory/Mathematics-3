import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, HelpCircle, Check, Play, RefreshCw, Star } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface FractionLabProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function FractionLab({ onBack, onAddStars }: FractionLabProps) {
  const [subTab, setSubTab] = useState<'create' | 'match' | 'compare'>('create');
  const [stars, setStars] = useState(0);

  // Creator state
  const [pizzaSlices, setPizzaSlices] = useState(8); // Denominator
  const [coloredSlices, setColoredSlices] = useState<boolean[]>(Array(8).fill(false));

  // Matcher state
  const [matchDenominator, setMatchDenominator] = useState(6);
  const [matchRequired, setMatchRequired] = useState(3); // Match numerator
  const [matchUserSlices, setMatchUserSlices] = useState<boolean[]>(Array(6).fill(false));
  const [matchFeedback, setMatchFeedback] = useState('');
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);

  // Comparer state
  const [compNum1, setCompNum1] = useState(1);
  const [compDen1, setCompDen1] = useState(2);
  const [compNum2, setCompNum2] = useState(1);
  const [compDen2, setCompDen2] = useState(4);
  const [compCorrect, setCompCorrect] = useState<'<' | '>' | '='>('>');
  const [compFeedback, setCompFeedback] = useState('');
  const [compSuccess, setCompSuccess] = useState<boolean | null>(null);

  // Initialize match question
  useEffect(() => {
    generateMatchQuestion();
  }, [subTab]);

  const generateMatchQuestion = () => {
    const denominators = [4, 6, 8, 10, 12];
    const den = denominators[Math.floor(Math.random() * denominators.length)];
    const num = Math.floor(Math.random() * (den - 1)) + 1; // 1 to den-1
    setMatchDenominator(den);
    setMatchRequired(num);
    setMatchUserSlices(Array(den).fill(false));
    setMatchFeedback('مرحباً بك! قم بتلوين الأجزاء لنحصل على الكسر المطلوب.');
    setShowMatchSuccess(false);
  };

  // Convert fraction numerator/denominator directly to standard Arabic written names
  const fractionToWords = (num: number, den: number): string => {
    if (num === 0) return 'صفر';
    if (num === den) return 'الواحد الصحيح (كل الكتل دائرية)';
    
    // Simple basic unit fractions (p.75)
    if (num === 1) {
      if (den === 2) return 'النصف';
      if (den === 3) return 'الثلث';
      if (den === 4) return 'الربع';
      if (den === 5) return 'الخمس';
      if (den === 6) return 'السدس';
      if (den === 7) return 'السبع';
      if (den === 8) return 'الثمن';
      if (den === 9) return 'التسع';
      if (den === 10) return 'العشر';
      return `جزء واحد من أصل ${den}`;
    }

    if (num === 2) {
      if (den === 3) return 'ثلثان';
      if (den === 4) return 'ربعان (أو نصف)';
      if (den === 5) return 'خمسان';
      if (den === 6) return 'سدسان';
      if (den === 8) return 'ثمنان';
      if (den === 10) return 'عشران';
    }

    // Standard plurals for textbook
    const plurals: Record<number, string> = {
      2: 'أجزاء',
      3: 'أرباع',
      4: 'أرباع',
      5: 'أخماس',
      6: 'أسداس',
      7: 'أسباع',
      8: 'أثمان',
      9: 'أتساع',
      10: 'أعشار',
      12: 'أجزاء من اثني عشر',
    };

    const numbersMap = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر'];
    const p = plurals[den] || 'أجزاء';
    return `${numbersMap[num]} ${p}`;
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
    setMatchUserSlices(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const handleVerifyMatch = () => {
    const userCount = matchUserSlices.filter(Boolean).length;
    if (userCount === matchRequired) {
      soundEffects.playStar();
      setShowMatchSuccess(true);
      setMatchFeedback('إجابة عبقرية! لقد نجحت في تلوين الكسر المطلوب بشكل دقيق، خذ نجمتك المضيئة! ⭐');
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setShowMatchSuccess(false);
      setMatchFeedback(`للاسف، القيمة غير مطابقة. أنت لونت ${userCount} أجزاء من أصل ${matchDenominator}، والمطلوب تلوينُ ${matchRequired} أجزاء تماماً.`);
    }
  };

  const activeNumeratorCreator = coloredSlices.filter(Boolean).length;

  // Handles updating denominator in Creator
  const handleDenominatorCreatorChange = (val: number) => {
    soundEffects.playBeep();
    setPizzaSlices(val);
    setColoredSlices(Array(val).fill(false));
  };

  // Comparer Level generator
  useEffect(() => {
    generateComparison();
  }, [subTab]);

  const generateComparison = () => {
    const list = [
      { n1: 1, d1: 2, n2: 1, d2: 4, ans: '>' as const, exp: 'عندما يتساوى البسط (١ و ١)، فإن الجزء صاحب المقام الأصغر يكون هو الأكبر! نصف البيتزا دائماً أكبر من ربعها!' },
      { n1: 1, d1: 3, n2: 1, d2: 6, ans: '>' as const, exp: 'الثلث أكبر من السدس لأن الجزء مقسم على ٣ أشخاص فقط، بينما السدس مقسم على ٦ أشخاص!' },
      { n1: 3, d1: 8, n2: 5, d2: 8, ans: '<' as const, exp: 'عندما يتساوى المقام (٨ و ٨)، نقوم بمقارنة البسط بشكل اعتيادي؛ وبما أن ٣ أصغر من ٥، فكسر ٣ على ٨ أصغر من ٥ على ٨.' },
      { n1: 4, d1: 6, n2: 2, d1_val: 4, d2: 6, ans: '>' as const, exp: 'بما أن لهما نفس المقامات المتساوية (٦)، وبما أن ٤ أكبر من ٢، فكسر ٤ على ٦ أكبر من ٢ على ٦.' },
      { n1: 1, d1: 8, n2: 1, d2: 5, ans: '<' as const, exp: 'المقام الأكبر (٨) يجعل القطعة الواحدة أصغر بكثير من القطعة المشتركة على ٥ أشخاص.' },
      { n1: 2, d1: 4, n2: 1, d2: 2, ans: '=' as const, exp: 'ربعان من البيتزا يعادلان نصف البيتزا تماماً! هذان كسران متكافئان لضرب أو قسمة الطرفين بـ ٢.' }
    ];
    const pick = list[Math.floor(Math.random() * list.length)];
    setCompNum1(pick.n1);
    setCompDen1(pick.d1);
    setCompNum2(pick.n2);
    setCompDen2(pick.d2);
    setCompCorrect(pick.ans);
    setCompFeedback('اختر الإشارة الصحيحة للحصول على النجمة!');
    setCompSuccess(null);
  };

  const handleVerifyComparison = (operator: '<' | '>' | '=') => {
    if (operator === compCorrect) {
      soundEffects.playStar();
      setCompSuccess(true);
      setCompFeedback(`إجابة صحيحة يا بطل! 🌟 تفسير حسون: ${fractionToWords(compNum1, compDen1)} مقارنة مع ${fractionToWords(compNum2, compDen2)}. والبرهان: ${operator === '>' ? 'أكبر من' : operator === '<' ? 'أصغر من' : 'يساوي'} بوضوح.`);
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setCompSuccess(false);
      setCompFeedback('أوه! الإشارة غير موفقة. تذكر مقارنة الحصص أو حجم القطع لتجد الجواب الصحيح.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-rose-400">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-400 to-rose-500 p-6 flex items-center justify-between text-white">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-rose-600/30 hover:bg-rose-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع للمطالعة
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🍕 مختبر الكسور وتلوين البيتزا
        </h2>
        <div className="flex items-center gap-2 bg-rose-600 bg-opacity-30 px-4 py-1.5 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-bold">{stars} ⭐</span>
        </div>
      </div>

      <div className="p-6">
        {/* Toggle Sections Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { soundEffects.playBeep(); setSubTab('create'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              subTab === 'create' 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            🍕 استكشاف الكسور وتلوينها
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setSubTab('match'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              subTab === 'match' 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            🎯 تحدّي الكسر المطلوب
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setSubTab('compare'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              subTab === 'compare' 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            ⚖️ مقارنة الحصص والكسور
          </button>
        </div>

        {subTab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-rose-50/30 p-6 rounded-3xl border-2 border-rose-100">
            {/* Pizza visualizer */}
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-full border-8 border-yellow-700 bg-orange-100 shadow-2xl flex items-center justify-center overflow-hidden">
                {/* SVG splitting circle into matching pizza slices */}
                <svg className="absolute inset-0 w-full h-full transform rotate-3" viewBox="0 0 200 200">
                  {/* Iterate slice angles */}
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

                {/* Draw dotted line markers for help */}
                <div className="absolute inset-0 pointer-events-none rounded-full border-4 border-dashed border-yellow-600 border-opacity-40" />

                {/* Slices label centered inside pizza */}
                <div className="z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 px-3 text-[10px] font-black text-amber-800 shadow">
                  انقر لتلوين الأجزاء!
                </div>
              </div>

              {/* Adjust Slices slider/buttons */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-gray-500">اختر عدد أجزاء الكسر (المقام):</span>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6, 8, 10, 12].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleDenominatorCreatorChange(val)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-transform active:scale-90 ${
                        pizzaSlices === val ? 'bg-rose-500 text-white shadow-md' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation card */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border-4 border-rose-100 shadow text-right">
                <h3 className="text-xl font-black text-rose-800 mb-2">🎓 لوحة تفاصيل الكسر:</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  تعلّمنا في الصفحة <strong>٧٨ من كتاب الرياضيات</strong> أن الكسر يتكون من بسط ومقام. جرب تلوين الأجزاء بالدائرة لتلاحظ التغيّرات:
                </p>

                {/* Animated math formula card */}
                <div className="flex flex-col items-center justify-center py-6 bg-rose-50 rounded-2xl border border-rose-200 my-4 max-w-sm mx-auto">
                  {/* Numerator */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-rose-600">البسط (كم قطعة لونّاها)</span>
                    <span className="text-4xl font-black text-rose-800 animate-pulse">{activeNumeratorCreator}</span>
                  </div>

                  {/* Fraction line */}
                  <div className="w-24 h-1.5 bg-yellow-800 rounded-full my-3" />

                  {/* Denominator */}
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-amber-850">{pizzaSlices}</span>
                    <span className="text-xs font-bold text-amber-700">المقام (مجموع الأجزاء متساوية بالمطبخ)</span>
                  </div>
                </div>

                <div className="text-center font-bold text-rose-900 border-t border-rose-100 pt-4 text-lg">
                  💡 الكسر بالكلمات: <span className="underline underline-offset-4 text-emerald-600 font-extrabold">{fractionToWords(activeNumeratorCreator, pizzaSlices)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {subTab === 'match' && (
          <div className="bg-amber-50/30 p-6 rounded-3xl border-2 border-amber-100 text-center max-w-2xl mx-auto">
            {/* Story challenge top header */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6 flex items-start gap-4 text-right">
              <span className="text-5xl animate-spin">🦜</span>
              <div>
                <h4 className="font-black text-amber-800 mb-1">تحدّي تلوين الكسر المطلوب:</h4>
                <p className="text-amber-700 text-sm leading-relaxed mb-3">
                  مرحباً يا ذكي! يطلب منك حسون مساعدة حيوانات المدرسة الغابة. هل يمكنك تلوين البيتزا لتمثيل هذا الكسر؟
                </p>
                <div className="inline-block bg-white border-2 border-amber-400 rounded-2xl p-3 font-black text-3xl text-amber-900 tracking-wide px-10">
                  {matchRequired} / {matchDenominator}
                </div>
                <span className="block text-gray-500 font-bold text-xs mt-1">({fractionToWords(matchRequired, matchDenominator)})</span>
              </div>
            </div>

            {/* Pizza Match Slices */}
            <div className="flex items-center justify-center relative w-60 h-64 mx-auto overflow-hidden">
              <div className="relative w-56 h-56 rounded-full border-8 border-rose-700 bg-orange-100 shadow-xl flex items-center justify-center overflow-hidden">
                <svg className="absolute inset-0 w-full h-full transform rotate-12" viewBox="0 0 200 200">
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
                        className={`cursor-pointer transition-all duration-300 stroke-rose-700 stroke-2 ${
                          matchUserSlices[idx] 
                            ? 'fill-sky-500 hover:fill-sky-400 animate-pulse' 
                            : 'fill-amber-100 hover:fill-amber-200'
                        }`}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="text-gray-500 font-bold mt-2 text-sm">
              أنت لونت حالياً: {matchUserSlices.filter(Boolean).length} أجزاء من {matchDenominator}
            </div>

            {/* Interaction Buttons details */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={handleVerifyMatch}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-full shadow-lg transition-transform active:scale-95"
              >
                تحقق من الكسر الملوّن! ✅
              </button>

              {matchFeedback && (
                <div className={`p-4 rounded-xl text-sm max-w-md mx-auto leading-relaxed border-2 ${
                  showMatchSuccess ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'
                }`}>
                  {matchFeedback}
                </div>
              )}

              {showMatchSuccess && (
                <button
                  onClick={generateMatchQuestion}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3 px-6 rounded-full shadow text-sm transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> العب تحدٍ جديد!
                </button>
              )}
            </div>
          </div>
        )}

        {subTab === 'compare' && (
          <div className="bg-sky-50/20 p-6 rounded-3xl border-2 border-sky-100 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-sky-800 mb-2">⚖️ ميزان المقارنة:</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              تعلّمنا في الصفحة <strong>٨٩ من كتاب الرياضيات للصف الثالث</strong> أنه كلما زاد عدد الحصص المطروقة (المقام)، تصغر حصة الفرد تدريجياً! هل تتذكر؟ جرب وضع علامة المقارنة المناسبة:
            </p>

            {/* Comparison Cards representational box */}
            <div className="flex justify-around items-center max-w-lg mx-auto py-8 bg-white rounded-3xl border-2 border-sky-100 p-4 shadow-xl">
              {/* Left Fraction Card */}
              <div className="flex flex-col items-center p-4 bg-sky-50 rounded-2xl border border-sky-200 w-24">
                <span className="text-4xl font-black text-sky-800">{compNum1}</span>
                <div className="w-16 h-1 bg-yellow-800 rounded-full my-2" />
                <span className="text-4xl font-black text-gray-800">{compDen1}</span>
                <span className="text-[10px] text-gray-500 mt-2 font-bold">({fractionToWords(compNum1, compDen1)})</span>
              </div>

              {/* Operator Placeholders */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleVerifyComparison('>')}
                  className="w-16 h-12 bg-amber-400 hover:bg-amber-500 text-amber-900 font-extrabold text-2xl rounded-2xl shadow active:scale-90 transition-transform"
                >
                  &gt;
                </button>
                <button
                  onClick={() => handleVerifyComparison('<')}
                  className="w-16 h-12 bg-amber-400 hover:bg-amber-500 text-amber-900 font-extrabold text-2xl rounded-2xl shadow active:scale-90 transition-transform"
                >
                  &lt;
                </button>
                <button
                  onClick={() => handleVerifyComparison('=')}
                  className="w-16 h-12 bg-amber-400 hover:bg-amber-500 text-amber-900 font-extrabold text-2xl rounded-2xl shadow active:scale-90 transition-transform"
                >
                  =
                </button>
              </div>

              {/* Right Fraction Card */}
              <div className="flex flex-col items-center p-4 bg-sky-50 rounded-2xl border border-sky-200 w-24">
                <span className="text-4xl font-black text-sky-800">{compNum2}</span>
                <div className="w-16 h-1 bg-yellow-800 rounded-full my-2" />
                <span className="text-4xl font-black text-gray-800">{compDen2}</span>
                <span className="text-[10px] text-gray-500 mt-2 font-bold">({fractionToWords(compNum2, compDen2)})</span>
              </div>
            </div>

            {/* Evaluated results options */}
            <div className="flex flex-col items-center gap-4 mt-6">
              {compFeedback && (
                <div className={`p-4 rounded-xl text-right text-sm leading-relaxed max-w-md mx-auto border-2 ${
                  compSuccess === null ? 'bg-sky-50 border-sky-200 text-sky-800' : compSuccess ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'
                }`}>
                  {compFeedback}
                </div>
              )}

              {compSuccess && (
                <button
                  onClick={generateComparison}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold p-2 px-6 rounded-full shadow text-sm transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> مقارنة جديدة!
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
