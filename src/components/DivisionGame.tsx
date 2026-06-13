import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, Trophy, HelpCircle as HelpIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DivisionGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function DivisionGame({ onBack, onAddStars }: DivisionGameProps) {
  const [subGame, setSubGame] = useState<'sharing' | 'operations'>('sharing');
  
  // Sharing Game State
  const [sharingTotal, setSharingTotal] = useState(23);
  const [sharingDivisor, setSharingDivisior] = useState(7);
  const [userQuotient, setUserQuotient] = useState('');
  const [userRemainder, setUserRemainder] = useState('');
  const [sharingFeedback, setSharingFeedback] = useState('');
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [sharingHint, setSharingHint] = useState('');

  // Operations Game State
  const [opNum1, setOpNum1] = useState(2);
  const [opNum2, setOpNum2] = useState(12);
  const [opNum3, setOpNum3] = useState(4);
  const [opType, setOpType] = useState<'+' | '-'>('+');
  const [opUserAnswer, setOpUserAnswer] = useState('');
  const [opFeedback, setOpFeedback] = useState('');
  const [opStatus, setOpStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const [stars, setStars] = useState(0);

  // Sharing Questions Bank from Sudan Textbook:
  // p.48: 23 ÷ 7 = 3 R 2
  // p.48: 50 ÷ 7 = 7 R 1
  // p.48: 29 ÷ 7 = 4 R 1
  // p.60: 75 ÷ 8 = 9 R 3
  // p.60: 61 ÷ 8 = 7 R 5
  // p.66: 89 ÷ 9 = 9 R 8
  const sharingQuestions = [
    { total: 23, divisor: 7, quotient: 3, remainder: 2, item: 'تفاحة', target: 'قرود جائعة' },
    { total: 50, divisor: 7, quotient: 7, remainder: 1, item: 'سمكة ملوّنة', target: 'قطط مواء' },
    { total: 29, divisor: 7, quotient: 4, remainder: 1, item: 'كراسة دراسية', target: 'تلاميذ مجتهدين' },
    { total: 75, divisor: 8, quotient: 9, remainder: 3, item: 'حلوى السمسم', target: 'أطفال الغابة' },
    { total: 61, divisor: 8, quotient: 7, remainder: 5, item: 'ممحاة لطيفة', target: 'مجموعات رسم' },
    { total: 89, divisor: 9, quotient: 9, remainder: 8, item: 'طائرة ورقية', target: 'نوادي طيران' },
    { total: 42, divisor: 7, quotient: 6, remainder: 0, item: 'قلم رصاص', target: 'فصول دراسية' },
  ];

  // Operations Questions Bank from page 69 & 70
  // p.69: 3 + 2 × 5 = 13
  // p.69: 7 - 3 × 6 = 11 (Wait, 7 - 18 is negative, Sudanese page says: p.15 is 3 × 3 - 14 = 5? No, they probably mean 14 - 3x3)
  // Let's check page 69 OCR: "مثال 2: 7 - 3 × 6" then "7 - 18 = 7 - 3 × 6". Ah, the book is designed with subtract on the left but written right to left or vice versa, the actual calculation is 18 - 7 = 11.
  // We will provide clear positive-result questions:
  // - 4 + 21 ÷ 7 = 7
  // - 15 - 3 × 3 = 6
  // - 2 + 12 ÷ 4 = 5
  // - 8 - 36 ÷ 9 = 4
  const operationsQuestions = [
    { num1: 4, num2: 21, num3: 7, type: '+' as const, isDiv: true, ans: 7, exp: 'القسمة تسبق الجمع! نقوم بالقسمة أولاً: ٢١ ÷ ٧ = ٣، ثم نجمع: ٤ + ٣ = ٧.' },
    { num1: 15, num2: 3, num3: 3, type: '-' as const, isDiv: false, ans: 6, exp: 'الضرب يسبق الطرح! نقوم بالضرب أولاً: ٣ × ٣ = ٩، ثم نطرح: ١٥ - ٩ = ٦.' },
    { num1: 2, num2: 12, num3: 4, type: '+' as const, isDiv: true, ans: 5, exp: 'القسمة تسبق الجمع! نقسم أولاً: ١٢ ÷ ٤ = ٣، ثم نجمع: ٢ + ٣ = ٥.' },
    { num1: 14, num2: 2, num3: 3, type: '-' as const, isDiv: false, ans: 8, exp: 'الضرب يسبق الطرح! نضرب أولاً: ٢ × ٣ = ٦، ثم نطرح: ١٤ - ٦ = ٨.' },
    { num1: 8, num2: 36, num3: 9, type: '-' as const, isDiv: true, ans: 4, exp: 'القسمة تسبق الطرح! نقسم أولاً: ٣٦ ÷ ٩ = ٤، ثم نطرح من الـ ٨: ٨ - ٤ = ٤.' },
  ];

  const [activeSharingIdx, setActiveSharingIdx] = useState(0);
  const [activeOpIdx, setActiveOpIdx] = useState(0);

  useEffect(() => {
    loadSharingQuestion(activeSharingIdx);
  }, [activeSharingIdx]);

  useEffect(() => {
    loadOpQuestion(activeOpIdx);
  }, [activeOpIdx]);

  const loadSharingQuestion = (idx: number) => {
    const q = sharingQuestions[idx];
    setSharingTotal(q.total);
    setSharingDivisior(q.divisor);
    setUserQuotient('');
    setUserRemainder('');
    setSharingFeedback('');
    setSharingStatus('idle');
    setSharingHint(`مثال لحل المسألة: كم مرة يتكرر الرقم ${q.divisor} في العدد ${q.total} دون أن يتخطاه؟`);
  };

  const loadOpQuestion = (idx: number) => {
    const q = operationsQuestions[idx];
    setOpNum1(q.num1);
    setOpNum2(q.num2);
    setOpNum3(q.num3);
    setOpType(q.type);
    setOpUserAnswer('');
    setOpFeedback('');
    setOpStatus('idle');
  };

  const handleVerifySharing = () => {
    const q = sharingQuestions[activeSharingIdx];
    const qAns = parseInt(userQuotient);
    const rAns = parseInt(userRemainder || '0');

    if (qAns === q.quotient && rAns === q.remainder) {
      soundEffects.playCorrect();
      setSharingStatus('success');
      setSharingFeedback(`إجابة مذهلة! هنيئاً لك يا دكتور الرياضيات الصغير! لكل من الـ ${q.divisor} سيحصل على ${q.quotient} وباقي معك ${q.remainder} بالتمام والكمال! 🌟`);
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setSharingStatus('fail');
      setSharingFeedback(`أممم، الإجابة غير دقيقة تماماً. تذكر أن حاصل ضرب ${q.divisor} × ${q.quotient} = ${q.divisor * q.quotient}، والباقي المكمل للـ ${q.total} هو ${q.remainder}. جرب مرة أخرى!`);
    }
  };

  const handleVerifyOp = () => {
    const q = operationsQuestions[activeOpIdx];
    const userAns = parseInt(opUserAnswer);

    if (userAns === q.ans) {
      soundEffects.playStar();
      setOpStatus('success');
      setOpFeedback(`أحسنت القول! إجابة صحيحة مئة بالمئة! ⭐ ${q.exp}`);
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setOpStatus('fail');
      setOpFeedback(`أوه! حاول مجدداً. ${q.isDiv ? 'القسمة' : 'الضرب'} دائماً تسبق ${q.type === '+' ? 'الجمع' : 'الطرح'}! احسب الطرف الثاني أولاً!`);
    }
  };

  const nextSharing = () => {
    soundEffects.playBeep();
    setActiveSharingIdx(prev => (prev + 1) % sharingQuestions.length);
  };

  const nextOp = () => {
    soundEffects.playBeep();
    setActiveOpIdx(prev => (prev + 1) % operationsQuestions.length);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-emerald-400">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 flex items-center justify-between text-white">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-emerald-700/30 hover:bg-emerald-700/50 p-2 px-4 rounded-full transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع للمطالعة
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🌳 مغامرة غابة القسمة والعمليات
        </h2>
        <div className="flex items-center gap-2 bg-emerald-700 bg-opacity-30 px-4 py-1.5 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-bold">{stars} ⭐</span>
        </div>
      </div>

      <div className="p-6">
        {/* Toggle Game Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { soundEffects.playBeep(); setSubGame('sharing'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              subGame === 'sharing' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            🐒 مشاركة الكنز (القسمة بباقٍ)
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setSubGame('operations'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              subGame === 'operations' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            🧠 تحدّي ترتيب العمليات
          </button>
        </div>

        {subGame === 'sharing' ? (
          <div>
            {/* Sharing Game Story UI */}
            <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 mb-6 text-right">
              <h3 className="text-xl font-black text-emerald-800 mb-2">🐢 تحدّي مشاركة الكنز بالتساوي:</h3>
              <p className="text-emerald-700 leading-relaxed text-sm mb-4">
                تخيّل أن لديك في غابة الأرقام السودانية <strong>{sharingTotal} {sharingQuestions[activeSharingIdx].item}</strong> تريد تقسيمها
                بالعدل والإنصاف على <strong>{sharingDivisor} {sharingQuestions[activeSharingIdx].target}</strong>. 
                كم سيأخذ كل واحد منهم؟ وكم قطعة ستتبقى معك في المخزن؟
              </p>

              {/* Graphic representations of Items for kids to visual count */}
              <div className="flex flex-wrap gap-2 justify-center py-4 bg-white/70 rounded-xl my-4 p-4 border border-emerald-100 max-h-40 overflow-y-auto">
                {Array.from({ length: sharingTotal }).map((_, idx) => (
                  <span key={idx} className="text-3xl filter drop-shadow select-none animate-bounce" style={{ animationDelay: `${idx * 50}ms`, animationDuration: '2s' }}>
                    {sharingQuestions[activeSharingIdx].total % 5 === 0 ? '🍌' : '🍎'}
                  </span>
                ))}
              </div>
            </div>

            {/* Inputs Form */}
            <div className="bg-amber-50/50 rounded-3xl p-6 border-4 border-dashed border-amber-200 max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-xs font-bold text-amber-800">الباقي (المتبقي في يدك):</label>
                  <input
                    type="number"
                    value={userRemainder}
                    onChange={(e) => setUserRemainder(e.target.value)}
                    placeholder="باقٍ"
                    className="w-full text-center py-3 bg-white font-black text-2xl rounded-2xl border-3 border-amber-300 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-xs font-bold text-amber-800">حاصل القسمة (نصيب الفرد):</label>
                  <input
                    type="number"
                    value={userQuotient}
                    onChange={(e) => setUserQuotient(e.target.value)}
                    placeholder="نصيب"
                    className="w-full text-center py-3 bg-white font-black text-2xl rounded-2xl border-3 border-amber-300 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-center gap-4 mt-6">
                <button
                  onClick={handleVerifySharing}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-full shadow-lg transition-transform active:scale-95"
                >
                  تحقق من قسمة الكنز! ✅
                </button>

                {sharingFeedback && (
                  <div className={`p-4 rounded-2xl text-right text-sm leading-relaxed border-2 ${
                    sharingStatus === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'
                  }`}>
                    {sharingFeedback}
                  </div>
                )}

                {sharingStatus === 'success' && (
                  <button
                    onClick={nextSharing}
                    className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-2 rounded-full shadow text-sm transition-transform active:scale-95"
                  >
                    انتقل للتحدي التالي <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Operations Game UI */}
            <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-200 mb-6 text-center">
              <h3 className="text-xl font-black text-sky-800 mb-2">⭐ ميزان ترتيب العمليات الحسابية:</h3>
              <p className="text-sky-700 leading-relaxed text-sm mb-4">
                تعلّمنا في الصفحة <strong>69 من كتاب الرياضيات</strong> أن عمليات <strong>الضرب والقسمة</strong> دائماً تسبق عمليات 
                <strong> الجمع والطرح</strong>! هل يمكنك وزن هذه المعادلة الذهبية بدقة؟
              </p>

              {/* The Equation Chalkboard */}
              <div className="bg-slate-800 rounded-2xl p-6 text-center inline-block max-w-sm w-full mx-auto my-4 text-white border-4 border-amber-900 shadow-lg">
                <div className="text-4xl font-extrabold tracking-wide font-mono">
                  {opNum1} {opType} {opNum2} {operationsQuestions[activeOpIdx].isDiv ? '÷' : '×'} {opNum3} = ؟
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 max-w-md mx-auto text-center">
              <label className="block text-sm font-bold text-gray-700 mb-2">أدخل الناتج النهائي للمعادلة:</label>
              <input
                type="number"
                value={opUserAnswer}
                onChange={(e) => setOpUserAnswer(e.target.value)}
                placeholder="الناتج"
                className="w-32 text-center py-2 bg-white font-black text-2xl rounded-xl border-2 border-sky-300 focus:outline-none focus:border-sky-500 shadow-inner mb-4"
              />

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleVerifyOp}
                  className="px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full shadow-md active:scale-95 transition-transform"
                >
                  أرسل الناتج الحسابي ✍️
                </button>

                {opFeedback && (
                  <div className={`p-4 rounded-xl text-right text-sm leading-relaxed border-2 ${
                    opStatus === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'
                  }`}>
                    {opFeedback}
                  </div>
                )}

                {opStatus === 'success' && (
                  <button
                    onClick={nextOp}
                    className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-2 rounded-full shadow text-sm transition-transform active:scale-95"
                  >
                    المعادلة التالية <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
