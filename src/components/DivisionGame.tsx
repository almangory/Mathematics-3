import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, HelpCircle, ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Volume2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DivisionGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function DivisionGame({ onBack, onAddStars }: DivisionGameProps) {
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [stars, setStars] = useState(0);

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

  const lessons = [
    { id: 1, title: 'الدرس ١: غابة القسمة على ٧ والعد بالتساوي', desc: 'توزيع كميات كبيرة بالتساوي على العدد ٧ واستخراج الباقي المنهجي.', page: 'كتاب ص ٤٦-٤٨' },
    { id: 2, title: 'الدرس ٢: القسمة على ٨ وعلى ٩ وباقي الفواكه', desc: 'توزيع الكميات بالتساوي على ٨ أو ٩ قرود وأرانب لحساب البواقي.', page: 'كتاب ص ٥٨-٦٦' },
    { id: 3, title: 'الدرس ٣: قواعد ترتيب العمليات والضرب والقسمة أولاً', desc: 'تعلّم أن أولويات الضرب والقسمة دائماً تسبق عمليات الجمع والطرح.', page: 'كتاب ص ٦٩-٧٠' },
  ];

  // Sharing Questions Bank (Sudanese Textbook)
  const sharingQuestionsLesson1 = [
    { total: 23, divisor: 7, quotient: 3, remainder: 2, item: 'تفاحة', target: 'قرود جائعة' },
    { total: 50, divisor: 7, quotient: 7, remainder: 1, item: 'سمكة ملوّنة', target: 'قطط مواء' },
    { total: 29, divisor: 7, quotient: 4, remainder: 1, item: 'كراسة دراسية', target: 'تلاميذ مجتهدين' },
    { total: 42, divisor: 7, quotient: 6, remainder: 0, item: 'قلم رصاص', target: 'فصول دراسية' },
  ];

  const sharingQuestionsLesson2 = [
    { total: 75, divisor: 8, quotient: 9, remainder: 3, item: 'حلوى السمسم', target: 'أطفال الغابة' },
    { total: 61, divisor: 8, quotient: 7, remainder: 5, item: 'ممحاة لطيفة', target: 'مجموعات رسم' },
    { total: 89, divisor: 9, quotient: 9, remainder: 8, item: 'طائرة ورقية', target: 'نوادي طيران' },
    { total: 53, divisor: 9, quotient: 5, remainder: 8, item: 'برتقالة طازجة', target: 'أسر سودانية' },
  ];

  // Operations Questions Bank
  const operationsQuestions = [
    { num1: 4, num2: 21, num3: 7, type: '+' as const, isDiv: true, ans: 7, exp: 'القسمة تسبق الجمع! نقوم بالقسمة أولاً: ٢١ ÷ ٧ = ٣، ثم نجمع: ٤ + ٣ = ٧.' },
    { num1: 15, num2: 3, num3: 3, type: '-' as const, isDiv: false, ans: 6, exp: 'الضرب يسبق الطرح! نقوم بالضرب أولاً: ٣ × ٣ = ٩، ثم نطرح: ١٥ - ٩ = ٦.' },
    { num1: 2, num2: 12, num3: 4, type: '+' as const, isDiv: true, ans: 5, exp: 'القسمة تسبق الجمع! نقسم أولاً: ١٢ ÷ ٤ = ٣، ثم نجمع: ٢ + ٣ = ٥.' },
    { num1: 14, num2: 2, num3: 3, type: '-' as const, isDiv: false, ans: 8, exp: 'الضرب يسبق الطرح! نضرب أولاً: ٢ × ٣ = ٦، ثم نطرح: ١٤ - ٦ = ٨.' },
    { num1: 8, num2: 36, num3: 9, type: '-' as const, isDiv: true, ans: 4, exp: 'القسمة تسبق الطرح! نقسم أولاً: ٣٦ ÷ ٩ = ٤، ثم نطرح من الـ ٨: ٨ - ٤ = ٤.' },
  ];

  const [activeSharingIdx, setActiveSharingIdx] = useState(0);
  const [activeOpIdx, setActiveOpIdx] = useState(0);

  // Load appropriate sharing question
  useEffect(() => {
    if (selectedLesson === 1) {
      loadSharingQuestion(sharingQuestionsLesson1[activeSharingIdx % sharingQuestionsLesson1.length]);
    } else if (selectedLesson === 2) {
      loadSharingQuestion(sharingQuestionsLesson2[activeSharingIdx % sharingQuestionsLesson2.length]);
    }
  }, [activeSharingIdx, selectedLesson]);

  // Load operations question
  useEffect(() => {
    if (selectedLesson === 3) {
      loadOpQuestion(activeOpIdx % operationsQuestions.length);
    }
  }, [activeOpIdx, selectedLesson]);

  const loadSharingQuestion = (q: typeof sharingQuestionsLesson1[0]) => {
    setSharingTotal(q.total);
    setSharingDivisior(q.divisor);
    setUserQuotient('');
    setUserRemainder('');
    setSharingFeedback('');
    setSharingStatus('idle');
    setSharingHint(`المسألة: لدينا ${q.total} ${q.item} نريد توزيعها على ${q.divisor} من الـ ${q.target}. كم نصيب الواحد والباقي؟`);
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
    const currentList = selectedLesson === 1 ? sharingQuestionsLesson1 : sharingQuestionsLesson2;
    const q = currentList[activeSharingIdx % currentList.length];
    const qAns = parseInt(userQuotient);
    const rAns = parseInt(userRemainder || '0');

    if (qAns === q.quotient && rAns === q.remainder) {
      soundEffects.playCorrect();
      setSharingStatus('success');
      setSharingFeedback(`إجابة مذهلة! هنيئاً لك يا دكتور الرياضيات الصغير! لكل واحد سياخذ ${q.quotient} ويتبقى معك ${q.remainder} بالتمام! ⭐`);
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setSharingStatus('fail');
    }
  };

  const handleVerifyOp = () => {
    const q = operationsQuestions[activeOpIdx % operationsQuestions.length];
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
    }
  };

  // Autocomplete correct answer for division/sharing
  const handleApplySharingCorrection = () => {
    soundEffects.playStar();
    const currentList = selectedLesson === 1 ? sharingQuestionsLesson1 : sharingQuestionsLesson2;
    const q = currentList[activeSharingIdx % currentList.length];
    
    setUserQuotient(q.quotient.toString());
    setUserRemainder(q.remainder.toString());
    setSharingStatus('success');
    setSharingFeedback(`تطبيق تلقائي تفاعلي: وزعنا ${q.total} حبة على ${q.divisor} أشخاص. نصيب الفرد هو ${q.quotient} والباقي هو ${q.remainder}.`);
    speakText(`قمنا بتطبيق التوزيع الصحيح: كل واحد سيحصل على ${q.quotient} قطع، ويتبقى في الخارج ${q.remainder} قطع.`);
  };

  // Autocomplete correct answer for operations
  const handleApplyOpCorrection = () => {
    soundEffects.playStar();
    const q = operationsQuestions[activeOpIdx % operationsQuestions.length];
    setOpUserAnswer(q.ans.toString());
    setOpStatus('success');
    setOpFeedback(`تجديد تلقائي: الحل الصحيح هو ${q.ans}. تذكر دائماً البدء بـ ${q.isDiv ? 'القسمة' : 'الضرب'}.`);
    speakText(`الحل الصحيح والنهائي للعملية مع ترتيب خطواتها هو ${q.ans}.`);
  };

  const nextSharingNum = () => {
    soundEffects.playBeep();
    setActiveSharingIdx(prev => prev + 1);
  };

  const nextOpNum = () => {
    soundEffects.playBeep();
    setActiveOpIdx(prev => prev + 1);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentList = selectedLesson === 1 ? sharingQuestionsLesson1 : sharingQuestionsLesson2;
  const currQ = currentList[activeSharingIdx % currentList.length];
  const currOpQ = operationsQuestions[activeOpIdx % operationsQuestions.length];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-emerald-450 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 p-2 px-4 rounded-full transition-all text-sm font-bold self-start sm:self-auto animate-pulse"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة
        </button>
        <h2 className="text-2xl font-black flex items-center gap-2">
          👨‍🏫 غابة القسمة وترتيب العمليات
        </h2>
        <div className="flex items-center gap-2 bg-emerald-600 bg-opacity-30 px-4 py-1.5 rounded-full font-bold text-sm">
          <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          <span>{stars} نجوم القسمة ⭐</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* Lesson choices */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-6">
          <h3 className="text-xs font-black text-emerald-850 mb-2">🎈 اختر أحد دروس القسمة والترتيب للمذاكرة وحل التدريبات المرفوعة:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => {
                  soundEffects.playBeep();
                  setSelectedLesson(les.id);
                  setSharingStatus('idle');
                  setOpStatus('idle');
                }}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  selectedLesson === les.id
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md transform scale-[1.01]'
                    : 'bg-white text-gray-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/30'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block">{les.title}</strong>
                  <span className="text-[10px] leading-relaxed block mt-1 opacity-90">{les.desc}</span>
                </div>
                <span className={`text-[9px] mt-2 font-bold inline-block p-0.5 px-2 rounded self-start ${
                  selectedLesson === les.id ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {les.page}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Central Layout columns: holds play area and dynamic corrective assistant side column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Lesson play panel */}
          <div className={`${
            ((selectedLesson === 1 || selectedLesson === 2) && sharingStatus === 'fail') || 
            (selectedLesson === 3 && opStatus === 'fail') 
              ? 'lg:col-span-8' 
              : 'lg:col-span-12'
          } space-y-6 transition-all`}>
            
            {/* Lessons 1 & 2: Food Sharing Game */}
            {(selectedLesson === 1 || selectedLesson === 2) && (
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl p-6 border-2 border-emerald-120">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Visual Display */}
                  <div className="flex-1 space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 flex items-center gap-4">
                      <span className="text-4xl">🐒</span>
                      <div>
                        <strong className="text-slate-800 text-xs font-black block">مسألة توزيع عادل:</strong>
                        <p className="text-slate-650 text-[11px] leading-relaxed mt-1 font-bold">
                          لدينا مجموع <span className="text-emerald-700 font-extrabold text-sm">{sharingTotal}</span> من الـ ({currQ.item})، نريد تقسيمها بالتساوي على <span className="text-amber-800 font-extrabold text-sm">{sharingDivisor}</span> من ({currQ.target})!
                        </p>
                      </div>
                    </div>

                    {/* Shared dots layout visualizer */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-wrap justify-center gap-1 min-h-24">
                      {Array.from({ length: sharingTotal }).map((_, idx) => (
                        <div 
                          key={idx}
                          className="w-5 h-5 bg-orange-400 border border-orange-500 rounded-full flex items-center justify-center text-[9px] text-white shadow-sm font-bold"
                          title={currQ.item}
                        >
                          🍎
                        </div>
                      ))}
                    </div>

                    <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200 text-[11px] font-bold text-sky-800">
                      💡 <strong>إرشاد حسون:</strong> {sharingHint}
                    </div>
                  </div>

                  {/* Submission and Input card */}
                  <div className="w-full md:w-80 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 border-b pb-2 mb-3">حساباتك:</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold mb-1">١. نصيب الفرد الواحد بالقسمة:</label>
                          <input
                            type="number"
                            value={userQuotient}
                            onChange={(e) => setUserQuotient(e.target.value)}
                            placeholder="اجب هنا..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold mb-1">٢. كم سيتبقى في الخارج دون توزيع؟</label>
                          <input
                            type="number"
                            value={userRemainder}
                            onChange={(e) => setUserRemainder(e.target.value)}
                            placeholder="الباقي الحقيقي..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleVerifySharing}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      تحقق من التوزيع العادل وعقد القسمة! ✔️
                    </button>
                  </div>

                </div>

                {/* Sharing Success Feedback */}
                {sharingStatus === 'success' && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border-4 border-emerald-400 p-4 rounded-2xl text-center mt-6 space-y-2"
                  >
                    <span className="text-3xl">👏🦁👏</span>
                    <h4 className="text-xs font-black text-emerald-800">{sharingFeedback}</h4>
                    <button
                      onClick={nextSharingNum}
                      className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] rounded-full mt-2 inline-flex items-center gap-1"
                    >
                      موافق، التوزيع التالي ➡️
                    </button>
                  </motion.div>
                )}

              </div>
            )}

            {/* Lesson 3: Order of Operations */}
            {selectedLesson === 3 && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-sky-50/50 rounded-3xl p-6 border-2 border-indigo-120">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Chalkboard Display */}
                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-800 rounded-3xl p-8 text-center border-8 border-amber-900 shadow-xl relative w-full">
                      <span className="absolute top-2 right-4 text-[9px] font-mono text-indigo-400">منهاج الصف الثالث ص ٦٩</span>
                      <div className="text-[10px] text-slate-350 font-bold mb-2">احسب حاصل المعادلة باتباع قاعدة الأسبقية:</div>
                      <div className="text-4xl font-extrabold text-white py-2 tracking-wide font-mono">
                        {opNum1} {opType} {opNum2} ÷ {opNum3} = ؟
                      </div>
                      <p className="text-indigo-300 text-[10px] italic mt-2">هل تبدأ بالقسمة والضرب أم الجمع والطرح؟</p>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex gap-2 items-start shrink-0 text-[10.5px]">
                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <strong className="text-amber-900 block font-black">قوانين بخت الرضا في الحساب:</strong>
                        <span className="text-slate-650 leading-relaxed font-semibold">
                          قاعدة هامة جداً: نقوم بالعمليات القوية أولاً (الضرب والقسمة) من اليمين لليسار، ثم العمليات الضعيفة (الجمع والطرح). لا تحسب بترتيب الأرقام عشوائياً!
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission and Input card */}
                  <div className="w-full md:w-85 bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 border-b pb-2 mb-3">الحل المنشود:</h4>
                      <div>
                        <label className="block text-[11px] text-slate-500 font-bold mb-1">الناتج الكلي للمعادلة:</label>
                        <input
                          type="number"
                          value={opUserAnswer}
                          onChange={(e) => setOpUserAnswer(e.target.value)}
                          placeholder="النتيجة الكلية..."
                          className="w-full p-2.5 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-center text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleVerifyOp}
                      className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      تحقق من الناتج النهائي! ✔️
                    </button>
                  </div>

                </div>

                {/* Operations Success Feedback */}
                {opStatus === 'success' && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-indigo-50 border-4 border-indigo-400 p-4 rounded-2xl text-center mt-6 space-y-2 text-indigo-900"
                  >
                    <span className="text-3xl">🎉🧠🎉</span>
                    <h4 className="text-xs font-black leading-relaxed">{opFeedback}</h4>
                    <button
                      onClick={nextOpNum}
                      className="px-6 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[11px] rounded-full mt-2 inline-flex items-center gap-1"
                    >
                      التحدي الحسابي التالي ➡️
                    </button>
                  </motion.div>
                )}

              </div>
            )}

          </div>

          {/* Self-Correction Assistant Side panel */}
          <AnimatePresence>
            {(((selectedLesson === 1 || selectedLesson === 2) && sharingStatus === 'fail') || 
              (selectedLesson === 3 && opStatus === 'fail')) && (
              <motion.div
                initial={{ transform: 'translateX(50px)', opacity: 0 }}
                animate={{ transform: 'translateX(0)', opacity: 1 }}
                exit={{ transform: 'translateX(50px)', opacity: 0 }}
                className="lg:col-span-4 bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between text-right"
              >
                
                {/* Division Failure details */}
                {(selectedLesson === 1 || selectedLesson === 2) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح حسون للتوزيع العادل:</h4>
                    </div>

                    <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                      أوه، هناك خطأ في التوزيع! قمت بالمحاولة، ولكن التجزئة الصحيحة لـ <span className="font-extrabold text-rose-600">{sharingTotal} ÷ {sharingDivisor}</span> تتطلب حساباً دقيقاً كالتالي:
                    </p>

                    {/* Step-by-step resolution display */}
                    <div className="bg-white rounded-2xl p-3 border border-rose-100 flex flex-col gap-1.5 text-[11px] font-bold text-slate-700">
                      <span className="text-[10px] text-slate-400 border-b pb-1 font-black">خطوات المعلم حسون:</span>
                      <div>١. كم مرة نكرر الـ <span className="text-amber-800">{sharingDivisor}</span> بدون تخطي الـ <span className="text-emerald-700">{sharingTotal}</span>؟</div>
                      <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded text-center my-1">
                        {sharingDivisor} × {currQ.quotient} = {sharingDivisor * currQ.quotient}
                      </div>
                      <div>٢. نطرح المجموع المحسوب من الرقم الكلي لاستخراج المتبقي:</div>
                      <div className="bg-amber-50 text-amber-800 p-1.5 rounded text-center my-1">
                        {sharingTotal} - {sharingDivisor * currQ.quotient} = {currQ.remainder} (الباقي الحقيقي)
                      </div>
                      <span className="block text-[10px] text-rose-800 font-semibold leading-relaxed mt-1">
                        لذلك: نصيب الواحد = {currQ.quotient}، وحبة الفاكهة الباقية بالخارج = {currQ.remainder}!
                      </span>
                    </div>

                    {/* Autocomplete button inside Correction Side */}
                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplySharingCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبّق التقسيم الصحيح وتعلّم 🟢
                      </button>

                      <button
                        onClick={() => speakText(`أوه يا بطل، لتوزيع ${sharingTotal} حبة على ${sharingDivisor} أشخاص، اضرب ${sharingDivisor} في ${currQ.quotient} لتكسب ${sharingDivisor * currQ.quotient} حبة، ويتبقى بالخارج ${currQ.remainder} حبات فقط. اضغط زر تطبيق الحل لتشاهدها!`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للشرح الصوتي من حسون
                      </button>

                      <button
                        onClick={nextSharingNum}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl text-center"
                      >
                        تخطى إلى مسألة تالية ➡️
                      </button>
                    </div>

                  </div>
                )}

                {/* Operations Failure details */}
                {selectedLesson === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-black">مصحح حسون لترتيب العمليات:</h4>
                    </div>

                    <p className="text-slate-650 text-[11px] leading-relaxed font-bold">
                      أوه، النتيجة الحسابية غير صحيحة! تذكر قواعد الأولوية وحل المعادلة <span className="font-extrabold text-indigo-700">{opNum1} {opType} {opNum2} ÷ {opNum3}</span> بالترتيب المنهجي:
                    </p>

                    {/* Step-by-step priority breakdown */}
                    <div className="bg-white rounded-2xl p-3 border border-rose-100/70 space-y-2 text-[10.5px] font-semibold text-slate-700">
                      <span className="text-[9.5px] text-slate-400 font-black border-b pb-1 block">تفكيك خطوة بخطوة:</span>
                      <div>
                        <strong>الخطوة ١:</strong> قم بعملية {currOpQ.isDiv ? 'القسمة لـ' : 'الضرب لـ'} <span className="text-indigo-700">{opNum2} ÷ {opNum3}</span> أولاً:
                        <div className="bg-indigo-50 text-indigo-800 p-1 rounded-lg text-center font-bold my-1">
                          {opNum2} ÷ {opNum3} = {Math.floor(opNum2 / opNum3)}
                        </div>
                      </div>
                      <div>
                        <strong>الخطوة ٢:</strong> الآن اجمع أو اطرح الناتج من الرقم الأول <span className="text-slate-900 font-black">{opNum1}</span>:
                        <div className="bg-emerald-50 text-emerald-800 p-1 rounded-lg text-center font-bold my-1">
                          {opNum1} {opType} {Math.floor(opNum2 / opNum3)} = {currOpQ.ans}
                        </div>
                      </div>
                    </div>

                    {/* Autocomplete button for priorities */}
                    <div className="space-y-2 border-t pt-3">
                      <button
                        onClick={handleApplyOpCorrection}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                         طبّق خطوات الحل وتعلّم 🟢
                      </button>

                      <button
                        onClick={() => speakText(`تذكر يا دكتور الرياضيات الصغير أن القسمة دائماً تسبق الجمع والطرح. لذلك نقسم ${opNum2} على ${opNum3} أولاً لنحصل على ثلاثة، ثم نجمعها مع أربعة فنكسب سبعة!`)}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold text-[10px] rounded-xl border border-rose-250 flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors"
                      >
                        🗣️ استمع للمدرس الصوتي
                      </button>

                      <button
                        onClick={nextOpNum}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-xl text-center"
                      >
                        تخطى إلى معادلة تالية ➡️
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
