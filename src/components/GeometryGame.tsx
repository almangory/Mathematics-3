import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Trophy, 
  Sparkles, 
  Check, 
  Award, 
  RefreshCw, 
  Star, 
  AlertCircle, 
  Lightbulb, 
  Volume2, 
  VolumeX,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  HelpCircle as GuideIcon,
  BookOpen
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { geometryQuestions, GeometryQuestion } from '../utils/geometryData';
import { toArabicNumerals } from '../utils/mathHelpers';

interface GeometryGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

export default function GeometryGame({ onBack, onAddStars }: GeometryGameProps) {
  // Navigation & Menu state
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [starsWon, setStarsWon] = useState<number>(0);
  const [textSpeechPlaying, setTextSpeechPlaying] = useState<boolean>(false);

  // Lesson 1-3 Question State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [lessonQuestions, setLessonQuestions] = useState<GeometryQuestion[]>([]);
  const [lessonStarsAwarded, setLessonStarsAwarded] = useState<Record<string, boolean>>({});

  // Lesson 4 (Quiz Challenge) Specific States
  const [quizQuestions, setQuizQuestions] = useState<GeometryQuestion[]>([]);
  const [quizActiveIndex, setQuizActiveIndex] = useState<number>(0);
  const [quizSelectedChoice, setQuizSelectedChoice] = useState<string | null>(null);
  const [quizCorrectAnswersCount, setQuizCorrectAnswersCount] = useState<number>(0);
  const [quizIsFinished, setQuizIsFinished] = useState<boolean>(false);
  const [quizAnswersRecord, setQuizAnswersRecord] = useState<Record<number, { userAns: string; isCorrect: boolean }>>({});

  // --- DYNAMIC INTERACTIVE GAME PIECE STATES ---
  // Lesson 1 States
  const [activeGridPoint, setActiveGridPoint] = useState<'أ' | 'ب' | 'جـ' | 'د'>('أ');
  const [segmentLength, setSegmentLength] = useState<number>(6); // 4, 6, 8, 10
  const [rayLeftToRight, setRayLeftToRight] = useState<boolean>(true);
  const [linePointsCount, setLinePointsCount] = useState<number>(2); // 2, 3, 4

  // Lesson 2 States
  const [activeVertex, setActiveVertex] = useState<string | null>(null);
  const [triangleType, setTriangleType] = useState<'isosceles' | 'equilateral' | 'scalene'>('isosceles');
  const [measuredSides, setMeasuredSides] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
  const [showProtractor, setShowProtractor] = useState<boolean>(false);

  // Lesson 3 States
  const [rectSize, setRectSize] = useState({ w: 75, h: 40 });
  const [squareHighlightSide, setSquareHighlightSide] = useState<number | null>(null);
  const [drawDiagonals, setDrawDiagonals] = useState<boolean>(true);
  const [sheepCount, setSheepCount] = useState<number>(1); // 1, 2, 3, 4, 5

  const lessons = [
    { id: 1, title: 'الدرس ١: النقطة والقطعة المستقيمة والخطوط', desc: 'استدراك خطوط الهندسة وبدايتها ونهايتها على الدفتر.', page: 'كتاب ص ١١١' },
    { id: 2, title: 'الدرس ٢: المثلث وأبناؤه الثلاثة وأضلاعه', desc: 'تمييز المثلث وأركانه المتصلة بالصفحة المنهجية.', page: 'كتاب ص ١١٢' },
    { id: 3, title: 'الدرس ٣: المربع والمستطيل والفروقات بينهما', desc: 'مقايسات الأضلاع والزوايا في الأشكال الرباعية المغلقة.', page: 'كتاب ص ١١٣-١١٤' },
    { id: 4, title: 'الدرس ٤: اختبار التحدي الهندسي الكبير 🏆', desc: 'تحديث أسئلة عشوائية لتحدي ذكائك وجمع النجوم الملونة!', page: 'كتاب ص ١١٥' },
  ];

  // Load questions for the active lesson on startup or change
  useEffect(() => {
    stopNarrative();
    setSelectedChoice(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);

    if (selectedLesson < 4) {
      // Filter questions by selected lesson and shuffle them slightly to provide variety
      const filtered = geometryQuestions.filter(q => q.lessonId === selectedLesson);
      // To satisfy "do questions change?", let's shuffle them!
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setLessonQuestions(shuffled);
    } else {
      // Lesson 4 is a comprehensive quiz: Shuffle all questions and pick 5 random ones!
      startNewQuizChallenge();
    }
  }, [selectedLesson]);

  // Handle TTS and dynamic voices
  const speakNarrative = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => setTextSpeechPlaying(false);
      utterance.onerror = () => setTextSpeechPlaying(false);
      setTextSpeechPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('ميزة نطق الصوت غير مدعومة في متصفحك الحالي، لكن يمكنك الاستمرار في القراءة والحل!');
    }
  };

  const stopNarrative = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTextSpeechPlaying(false);
    }
  };

  // Start a fresh randomized Quiz for Lesson 4
  const startNewQuizChallenge = () => {
    stopNarrative();
    soundEffects.playBeep();
    const shuffled = [...geometryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5); // 5 random questions
    setQuizQuestions(selected);
    setQuizActiveIndex(0);
    setQuizSelectedChoice(null);
    setQuizCorrectAnswersCount(0);
    setQuizIsFinished(false);
    setQuizAnswersRecord({});
  };

  // Trigger sound and speech on question transition
  useEffect(() => {
    setSelectedChoice(null);
    setIsCorrect(null);
    setShowExplanation(false);
    stopNarrative();
    // Auto-narrate the hint or question speech occasionally
  }, [currentQuestionIndex]);

  useEffect(() => {
    setQuizSelectedChoice(null);
    stopNarrative();
  }, [quizActiveIndex]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopNarrative();
    };
  }, []);

  // Answer Checker for regular lessons
  const handleChoiceSelect = (choice: string, correctAns: string, questionId: string) => {
    if (selectedChoice !== null) return; // Prevent double clicks
    
    setSelectedChoice(choice);
    const correct = choice === correctAns;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      soundEffects.playCorrect();
      // Check if we already awarded stars for this question in this session
      if (!lessonStarsAwarded[questionId]) {
        setLessonStarsAwarded(prev => ({ ...prev, [questionId]: true }));
        setStarsWon(prev => prev + 5);
        onAddStars(5);
        soundEffects.playStar();
      }
    } else {
      soundEffects.playError();
    }
  };

  // Answer Checker for Quiz Challenge
  const handleQuizChoiceSelect = (choice: string, correctAns: string) => {
    if (quizSelectedChoice !== null) return;
    
    setQuizSelectedChoice(choice);
    const correct = choice === correctAns;
    
    // Save record
    setQuizAnswersRecord(prev => ({
      ...prev,
      [quizActiveIndex]: { userAns: choice, isCorrect: correct }
    }));

    if (correct) {
      soundEffects.playCorrect();
      setQuizCorrectAnswersCount(prev => prev + 1);
      setStarsWon(prev => prev + 3);
      onAddStars(3);
    } else {
      soundEffects.playError();
    }
  };

  const handleNextQuizQuestion = () => {
    soundEffects.playBeep();
    if (quizActiveIndex < quizQuestions.length - 1) {
      setQuizActiveIndex(prev => prev + 1);
    } else {
      // Quiz finished! Award extra badge stars if they did perfectly
      if (quizCorrectAnswersCount === quizQuestions.length) {
        setStarsWon(prev => prev + 15);
        onAddStars(15);
        soundEffects.playStar();
      }
      setQuizIsFinished(true);
    }
  };

  // Manual shuffle of questions for replayability
  const handleShuffleQuestions = () => {
    soundEffects.playBeep();
    setSelectedChoice(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    const filtered = geometryQuestions.filter(q => q.lessonId === selectedLesson);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setLessonQuestions(shuffled);
  };

  // Render Interactive SVGs dynamically based on type
  const renderInteractiveSvg = (type: string) => {
    switch (type) {
      case 'point':
        return (
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر على أحد الخانات لتغيير موضع النقطة (أ) ومشاهدة ترحالها:
            </span>
            <div className="grid grid-cols-4 gap-2 bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-100 w-full max-w-xs relative shadow-inner">
              {(['أ', 'ب', 'جـ', 'د'] as const).map((letter) => {
                const isSelected = activeGridPoint === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => {
                      soundEffects.playPop();
                      setActiveGridPoint(letter);
                    }}
                    className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all relative ${
                      isSelected 
                        ? 'bg-rose-500 text-white border-rose-600 scale-105 shadow-md shadow-rose-200' 
                        : 'bg-white text-gray-700 border-gray-150 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white"></span>
                      </span>
                    )}
                    <span>{letter}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-bold text-gray-500">
              موضع النقطة الحالي هو الحرف: <span className="text-rose-600 font-extrabold text-xs">{activeGridPoint}</span>
            </p>
          </div>
        );

      case 'segment':
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 اسحب الشريط أو انقر على الأزرار لتطويل أو تقصير القطعة المستقيمة [أ ب]:
            </span>
            
            <div className="flex items-center gap-3 w-full max-w-xs">
              <button 
                onClick={() => {
                  soundEffects.playPop();
                  setSegmentLength(prev => Math.max(4, prev - 2));
                }}
                className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-black text-lg rounded-xl transition-all"
              >
                -
              </button>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-150 relative min-h-[90px] flex items-center justify-center">
                {/* Visual SVG Segment */}
                <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line 
                    x1={50 - segmentLength * 4} 
                    y1="50" 
                    x2={50 + segmentLength * 4} 
                    y2="50" 
                    className="stroke-rose-500" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />
                  {/* Endpoint A */}
                  <circle cx={50 - segmentLength * 4} cy="50" r="5.5" className="fill-orange-600" />
                  <text x={50 - segmentLength * 4} y="34" className="fill-gray-705 font-bold text-xs font-sans" textAnchor="middle">أ</text>
                  {/* Endpoint B */}
                  <circle cx={50 + segmentLength * 4} cy="50" r="5.5" className="fill-orange-600" />
                  <text x={50 + segmentLength * 4} y="34" className="fill-gray-705 font-bold text-xs font-sans" textAnchor="middle">ب</text>
                </svg>

                {/* Simulated ruler measuring */}
                <span className="absolute bottom-1.5 text-[9px] text-indigo-500 font-bold bg-indigo-50/50 px-2 rounded-full">
                  المسطرة تقرأ: {toArabicNumerals(segmentLength)} سم بالتمام
                </span>
              </div>
              <button 
                onClick={() => {
                  soundEffects.playPop();
                  setSegmentLength(prev => Math.min(10, prev + 2));
                }}
                className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-black text-lg rounded-xl transition-all"
              >
                +
              </button>
            </div>
          </div>
        );

      case 'ray':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر على الشعاع لتغيير اتجاه السهم الطائر (امتداد المعرفة):
            </span>

            <div 
              onClick={() => {
                soundEffects.playPop();
                setRayLeftToRight(!rayLeftToRight);
              }}
              className="bg-white p-6 rounded-2xl border border-gray-150 w-full max-w-xs cursor-pointer hover:bg-amber-50/20 transition-all flex items-center justify-center shadow-sm min-h-[100px]"
            >
              <svg className="w-full h-10" viewBox="0 0 100 100">
                {rayLeftToRight ? (
                  <>
                    <line x1="15" y1="50" x2="80" y2="50" className="stroke-indigo-600" strokeWidth="4" />
                    {/* Bounded start on left */}
                    <circle cx="15" cy="50" r="5" className="fill-red-500" />
                    <text x="15" y="35" className="fill-gray-600 font-bold text-xs" textAnchor="middle">أ (البداية)</text>
                    {/* Unlimited arrow on right */}
                    <polygon points="85,50 77,44 77,56" className="fill-indigo-600" />
                    <text x="80" y="35" className="fill-indigo-600 font-bold text-[10px]" textAnchor="middle">ب (ممتد ➔)</text>
                  </>
                ) : (
                  <>
                    <line x1="85" y1="50" x2="20" y2="50" className="stroke-indigo-600" strokeWidth="4" />
                    {/* Bounded start on right */}
                    <circle cx="85" cy="50" r="5" className="fill-red-500" />
                    <text x="85" y="35" className="fill-gray-600 font-bold text-xs" textAnchor="middle">ب (البداية)</text>
                    {/* Unlimited arrow on left */}
                    <polygon points="15,50 23,44 23,56" className="fill-indigo-600" />
                    <text x="21" y="35" className="fill-indigo-600 font-bold text-[10px]" textAnchor="middle">(ممتد 🠞) أ</text>
                  </>
                )}
              </svg>
            </div>
            
            <p className="text-[10.5px] font-bold text-gray-500 text-center leading-relaxed">
              {rayLeftToRight ? 'يبدأ من (أ) ويمر بـ (ب) ممتداً إلى ما لا نهاية باليمين!' : 'يبدأ من (ب) ويمر بـ (أ) ممتداً إلى ما لا نهاية باليسار!'}
            </p>
          </div>
        );

      case 'line':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 تحكّم في عدد نقاط المستقيم بخت الرضا عبر الضغط بالأسفل:
            </span>

            <div className="flex items-center gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    soundEffects.playPop();
                    setLinePointsCount(num);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${linePointsCount === num ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-600'}`}
                >
                  {toArabicNumerals(num)} نقاط
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-150 w-full max-w-xs flex items-center justify-center shadow-sm min-h-[90px]">
              <svg className="w-full h-10" viewBox="0 0 100 100">
                <line x1="10" y1="50" x2="90" y2="50" className="stroke-indigo-500" strokeWidth="4" />
                {/* Infinite arrows on both ends */}
                <polygon points="5,50 14,44 14,56" className="fill-indigo-500" />
                <polygon points="95,50 86,44 86,56" className="fill-indigo-500" />

                {/* Render points based on count */}
                {linePointsCount >= 2 && (
                  <>
                    <circle cx="25" cy="50" r="4.5" className="fill-rose-500" />
                    <text x="25" y="35" className="fill-gray-650 font-bold text-[10px]" textAnchor="middle">أ</text>
                    <circle cx="75" cy="50" r="4.5" className="fill-rose-500" />
                    <text x="75" y="35" className="fill-gray-650 font-bold text-[10px]" textAnchor="middle">ب</text>
                  </>
                )}
                {linePointsCount >= 3 && (
                  <>
                    <circle cx="50" cy="50" r="4.5" className="fill-rose-500" />
                    <text x="50" y="35" className="fill-gray-650 font-bold text-[10px]" textAnchor="middle">جـ</text>
                  </>
                )}
                {linePointsCount >= 4 && (
                  <>
                    <circle cx="62" cy="50" r="4.5" className="fill-rose-550" />
                    <text x="62" y="35" className="fill-gray-650 font-bold text-[10px]" textAnchor="middle">د</text>
                  </>
                )}
              </svg>
            </div>
            <p className="text-[10.5px] font-bold text-gray-500 text-center">
              يمتد من الطرفين بلا حدود، وتستوي عليه كل النقاط المصطفة!
            </p>
          </div>
        );

      case 'triangle_vertices':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر على أحد رؤوس المثلث (الزوايا المتلقية) لكشف اسمها:
            </span>

            <div className="bg-white p-5 rounded-2xl border border-gray-150 w-full max-w-xs flex flex-col items-center justify-center relative shadow-sm min-h-[160px]">
              {/* Triangular SVG with clickable buttons on coordinate nodes */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <polygon points="50,15 15,85 85,85" className="stroke-indigo-500 stroke-4 fill-indigo-50" />
                </svg>
                {/* Vertex A (top) */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveVertex('أ (الرأس العلوي)');
                  }}
                  className={`absolute top-1 left-[41%] w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${activeVertex?.startsWith('أ') ? 'bg-orange-500 text-white border-orange-650 scale-110' : 'bg-gray-100 text-gray-700'}`}
                >
                  أ
                </button>
                {/* Vertex B (bottom-left) */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveVertex('ب (الرأس الأيمن)');
                  }}
                  className={`absolute bottom-1 left-2 w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${activeVertex?.startsWith('ب') ? 'bg-orange-500 text-white border-orange-650 scale-110' : 'bg-gray-100 text-gray-700'}`}
                >
                  ب
                </button>
                {/* Vertex C (bottom-right) */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveVertex('جـ (الرأس الأيسر)');
                  }}
                  className={`absolute bottom-1 right-2 w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${activeVertex?.startsWith('جـ') ? 'bg-orange-500 text-white border-orange-650 scale-110' : 'bg-gray-100 text-gray-700'}`}
                >
                  جـ
                </button>
              </div>

              {activeVertex && (
                <div className="absolute bottom-2 bg-indigo-600 text-white text-[10px] font-black py-1 px-3 rounded-full animate-bounce">
                  أنت نقرت على الركن: {activeVertex}
                </div>
              )}
            </div>
          </div>
        );

      case 'triangle_types':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 غيّر نوع المثلث لمشاهدة تحولات أضلاعه عياناً:
            </span>

            <div className="grid grid-cols-3 gap-1.5 w-full max-w-xs">
              {(['isosceles', 'equilateral', 'scalene'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    soundEffects.playPop();
                    setTriangleType(t);
                  }}
                  className={`p-1 rounded-lg text-center text-[10px] font-black border leading-tight ${triangleType === t ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {t === 'isosceles' ? 'متساوي الساقين' : t === 'equilateral' ? 'متساوي الأضلاع' : 'مختلف الأضلاع'}
                </button>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex items-center justify-center shadow-sm min-h-[140px]">
              <svg className="w-32 h-32 transition-all duration-500" viewBox="0 0 100 100">
                {triangleType === 'isosceles' && (
                  <polygon points="50,15 25,85 75,85" className="stroke-indigo-500 stroke-4 fill-indigo-100/50" />
                )}
                {triangleType === 'equilateral' && (
                  <polygon points="50,20 15,80 85,80" className="stroke-indigo-500 stroke-4 fill-emerald-100/50" />
                )}
                {triangleType === 'scalene' && (
                  <polygon points="40,20 15,85 85,75" className="stroke-indigo-500 stroke-4 fill-purple-100/50" />
                )}
              </svg>
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold text-center">
              {triangleType === 'isosceles' && 'ساقين متساويين: الضلع اليمين = الضلع اليسار تماماً!'}
              {triangleType === 'equilateral' && 'كل الأضلاع الثلاثة متطابقة بنفس الطول والزاوية!'}{triangleType === 'scalene' && 'مختلف الأضلاع كلياً: كل ضلع له طول مستقل وعشوائي!'}
            </p>
          </div>
        );

      case 'equilateral':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر على أضلاع المثلث الثلاثة لقياسها وتأكيد التساوي بالمسطرة:
            </span>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex flex-col items-center justify-center shadow-sm min-h-[150px] relative">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <polygon points="50,15 15,80 85,80" className="stroke-indigo-500 stroke-4 fill-amber-100/30" />
                </svg>
                {/* Side 1: Right */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setMeasuredSides(prev => ({ ...prev, 1: !prev[1] }));
                  }}
                  className={`absolute top-1/3 left-3 px-2 py-1 rounded text-[10px] font-black border ${measuredSides[1] ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {measuredSides[1] ? 'الضلع ١ = ٥سم' : 'قس ضلع ١'}
                </button>
                {/* Side 2: Left */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setMeasuredSides(prev => ({ ...prev, 2: !prev[2] }));
                  }}
                  className={`absolute top-1/3 right-3 px-2 py-1 rounded text-[10px] font-black border ${measuredSides[2] ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {measuredSides[2] ? 'الضلع ٢ = ٥سم' : 'قس ضلع ٢'}
                </button>
                {/* Side 3: Base */}
                <button 
                  onClick={() => {
                    soundEffects.playPop();
                    setMeasuredSides(prev => ({ ...prev, 3: !prev[3] }));
                  }}
                  className={`absolute bottom-2 left-1/3 px-2 py-1 rounded text-[10px] font-black border ${measuredSides[3] ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {measuredSides[3] ? 'القاعدة = ٥سم' : 'قس القاعدة'}
                </button>
              </div>

              {measuredSides[1] && measuredSides[2] && measuredSides[3] && (
                <p className="text-[11px] font-bold text-center text-emerald-600 animate-bounce mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  مبروك! أثبتنا أن الأضلاع الثلاثة متساوية بالتمام = ٥ سم! 🌟
                </p>
              )}
            </div>
          </div>
        );

      case 'right_angle':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر الزر لوضع مثلث القياس والتأكد من الزاوية القائمة (٩٠ درجة):
            </span>

            <button
              onClick={() => {
                soundEffects.playPop();
                setShowProtractor(!showProtractor);
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs border ${showProtractor ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-rose-700 border-rose-300'}`}
            >
              {showProtractor ? 'إخفاء مثلث التعامد ✖️' : 'أظهر هندسة التعامد 📐'}
            </button>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex items-center justify-center shadow-sm min-h-[140px] relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <polygon points="20,15 20,85 85,85" className="stroke-indigo-500 stroke-4 fill-rose-100/30" strokeLinejoin="round" />
                
                {/* 90 degree Square Marker */}
                <rect x="20" y="75" width="10" height="10" className="stroke-red-500 stroke-2 fill-red-100" />
                <circle cx="25" cy="80" r="1.5" className="fill-red-500" />

                {showProtractor && (
                  <path d="M 20 85 A 35 35 0 0 1 55 50" fill="none" stroke="#E11D48" strokeWidth="4" strokeDasharray="4 2" className="animate-pulse" />
                )}
              </svg>
              
              {showProtractor && (
                <span className="absolute bottom-3 bg-red-650 text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-md animate-bounce">
                  زاوية قائمة تماماً = ٩٠ درجة!
                </span>
              )}
            </div>
          </div>
        );

      case 'rectangle':
        return (
          <div className="flex flex-col items-center gap-3 w-full animate-fade-in">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 اسحب الشريط لتعديل العرض، وشاهد ثبات الأضلاع المتقابلة:
            </span>

            <input 
              type="range"
              min="50"
              max="90"
              value={rectSize.w}
              onChange={(e) => setRectSize(prev => ({ ...prev, w: parseInt(e.target.value, 10) }))}
              className="w-full max-w-xs accent-amber-500 cursor-pointer h-2 bg-gray-105 rounded-lg"
            />

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex flex-col items-center justify-center shadow-sm min-h-[140px]">
              <svg className="h-28 w-full" viewBox="0 0 100 100">
                {/* Dynamic rectangle drawing */}
                <rect 
                  x={50 - rectSize.w/2} 
                  y={50 - rectSize.h/2} 
                  width={rectSize.w} 
                  height={rectSize.h} 
                  className="stroke-indigo-500 stroke-4 fill-indigo-50/50" 
                  rx="3"
                />
                
                {/* Labels indicating opposite equality */}
                <text x="50" y={45 - rectSize.h/2} className="fill-emerald-600 font-bold text-[8.5px] text-center" textAnchor="middle">الطول العلوي</text>
                <text x="50" y={58 + rectSize.h/2} className="fill-emerald-600 font-bold text-[8.5px] text-center" textAnchor="middle">الطول السفلي (متساويان!)</text>
              </svg>
            </div>
          </div>
        );

      case 'square':
        return (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر على أي ضلع لتأكيد أن المربع لديه أطوال متساوية:
            </span>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex flex-col items-center justify-center shadow-sm min-h-[150px] relative">
              <div className="relative w-32 h-32 bg-indigo-50/20 rounded-xl border-4 border-indigo-500 flex items-center justify-center">
                {/* Visual labels on clicking sides */}
                <div className="text-center">
                  <span className="text-lg">🫵</span>
                  <p className="font-extrabold text-[10px] text-indigo-850 mt-1">اضغط على أجنحة المربع للقياس</p>
                </div>

                {/* Top Border side */}
                <button
                  onClick={() => { soundEffects.playPop(); setSquareHighlightSide(1); }}
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-black rounded ${squareHighlightSide === 1 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
                >
                  الضلع ١ = ٦سم
                </button>
                {/* Bottom Border side */}
                <button
                  onClick={() => { soundEffects.playPop(); setSquareHighlightSide(2); }}
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-black rounded ${squareHighlightSide === 2 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
                >
                  الضلع ٢ = ٦سم
                </button>
                {/* Right side */}
                <button
                  onClick={() => { soundEffects.playPop(); setSquareHighlightSide(3); }}
                  className={`absolute top-1/2 -translate-y-1/2 -right-4 rotate-90 px-2 py-0.5 text-[9px] font-black rounded ${squareHighlightSide === 3 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
                >
                  الضلع ٣ = ٦سم
                </button>
                {/* Left side */}
                <button
                  onClick={() => { soundEffects.playPop(); setSquareHighlightSide(4); }}
                  className={`absolute top-1/2 -translate-y-1/2 -left-4 -rotate-90 px-2 py-0.5 text-[9px] font-black rounded ${squareHighlightSide === 4 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
                >
                  الضلع ٤ = ٦سم
                </button>
              </div>
            </div>
          </div>
        );

      case 'diagonals':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 انقر لتوصيل أقطار المربع (حرف X) بداخل لوح الهندسيات:
            </span>

            <button
              onClick={() => {
                soundEffects.playPop();
                setDrawDiagonals(!drawDiagonals);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${drawDiagonals ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              {drawDiagonals ? 'إخفاء الأقطار ✖️' : 'وصّل القطرين ✏️'}
            </button>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex items-center justify-center shadow-sm min-h-[140px] relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <rect x="15" y="15" width="70" height="70" className="stroke-indigo-500 stroke-4 fill-yellow-50/20" rx="4" />
                
                {drawDiagonals && (
                  <>
                    <line x1="15" y1="15" x2="85" y2="85" className="stroke-red-500 stroke-2" strokeDasharray="3 3" />
                    <line x1="85" y1="15" x2="15" y2="85" className="stroke-red-500 stroke-2" strokeDasharray="3 3" />
                    {/* Intersection Center letter */}
                    <circle cx="50" cy="50" r="4.5" className="fill-red-650" />
                    <text x="50" y="42" className="fill-red-800 font-extrabold text-[10px]" textAnchor="middle">م (المركز)</text>
                  </>
                )}
              </svg>
            </div>
          </div>
        );

      case 'perimeter':
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
              👇 أضف خرافاً في زريبة أمير المربعة (طول الضلع ٦ أمتار) لتسمع ثغائها:
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setSheepCount(prev => Math.max(1, prev - 1));
                }}
                disabled={sheepCount <= 1}
                className="w-8 h-8 rounded-full bg-gray-100 font-black text-gray-600"
              >
                -
              </button>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100">
                {toArabicNumerals(sheepCount)} خراف 🐑
              </span>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setSheepCount(prev => Math.min(5, prev + 1));
                }}
                disabled={sheepCount >= 5}
                className="w-8 h-8 rounded-full bg-gray-100 font-black text-gray-600"
              >
                +
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 w-full max-w-xs flex flex-col items-center justify-center shadow-sm min-h-[150px] relative overflow-hidden">
              <div className="relative w-32 h-32 bg-green-50 rounded-xl border-4 border-amber-850 flex items-center justify-center flex-wrap gap-1 p-3">
                
                {Array(sheepCount).fill(null).map((_, i) => (
                  <span key={i} className="text-2xl animate-pulse cursor-pointer" title="خروف أمير">🐑</span>
                ))}
                
                {/* Labels indicating dimensions */}
                <div className="absolute top-1 text-[8.5px] font-black text-amber-800">٦ أمتار (سياج)</div>
                <div className="absolute bottom-1 text-[8.5px] font-black text-amber-800">٦ أمتار</div>
                <div className="absolute right-1 text-[8.5px] font-black text-amber-800 rotate-90 origin-right translate-y-3.5">٦ أمتار</div>
                <div className="absolute left-1 text-[8.5px] font-black text-amber-800 -rotate-90 origin-left translate-y-3.5">٦ أمتار</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Safe checks for the selected lesson question lists
  const currentQuestion = lessonQuestions[currentQuestionIndex];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-indigo-400 text-right select-none" dir="rtl" id="geometry-root">
      
      {/* Top Banner with back button and score tracker */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 p-5 flex flex-col sm:flex-row items-center justify-between text-white gap-4 shadow-md">
        <button 
          onClick={() => {
            stopNarrative();
            onBack();
          }}
          id="back-btn"
          className="flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 p-2.5 px-4 rounded-full transition-all text-sm font-black active:scale-95 text-white"
        >
          <ArrowLeft className="w-5 h-5 ml-1" /> رجوع للمدينة الرئيسية
        </button>
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
          📐 مغامرة الهندسة والأشكال المغلقة
        </h2>
        <div className="flex items-center gap-2 bg-yellow-400 text-indigo-900 px-4.5 py-2 rounded-full text-xs font-black shadow-lg border-2 border-white animate-bounce">
          <Trophy className="w-5 h-5 text-yellow-600 xl animate-spin-slow" />
          <span>+{toArabicNumerals(starsWon)} نجوم دراسية</span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        
        {/* Dynamic lesson selector cards */}
        <div className="bg-indigo-50/60 rounded-3xl p-4 border border-indigo-100/70">
          <h3 className="text-xs font-black text-indigo-900 mb-2.5">🎈 اختر مسار الدرس الهندسي المنهجي ص ١١١ إلى ١١٥:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lessons.map(les => {
              const isActive = selectedLesson === les.id;
              return (
                <button
                  key={les.id}
                  onClick={() => {
                    soundEffects.playBeep();
                    setSelectedLesson(les.id);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md transform scale-[1.01]'
                      : 'bg-white text-gray-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/20'
                  }`}
                >
                  <div>
                    <strong className="text-xs md:text-sm font-black block">{les.title}</strong>
                    <span className="text-[10px] md:text-xs leading-relaxed block mt-1.5 opacity-90">{les.desc}</span>
                  </div>
                  <span className={`text-[9px] font-black inline-block p-1 px-2.5 rounded-full mt-3 self-start ${
                    isActive ? 'bg-indigo-750 text-white' : 'bg-indigo-50 text-indigo-705 border border-indigo-100'
                  }`}>
                    {les.page}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Outer Split Play Area: Right is dynamic play screen, Left is Assistant Companion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN GAME BLOCK */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Lessons 1 to 3 View */}
            {selectedLesson < 4 && (
              <div className="bg-white rounded-[35px] p-5 md:p-7 shadow-xl border-4 border-indigo-50/80 flex flex-col relative overflow-hidden" id="lesson-screen">
                
                {/* Upper progress bar */}
                {lessonQuestions.length > 0 && currentQuestion && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3.5 mb-5 select-none">
                    <div>
                      <span className="text-xs font-black text-indigo-805 block mb-0.5">
                        الدرس {toArabicNumerals(selectedLesson)} من منهج بخت الرضا
                      </span>
                      <h4 className="text-sm md:text-base font-black text-slate-800">
                        التحدي {toArabicNumerals(currentQuestionIndex + 1)} من {toArabicNumerals(lessonQuestions.length)}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShuffleQuestions}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-200 transition-all active:scale-95 flex items-center gap-1"
                        title="غيّر الأسئلة الحالية عشوائياً لمزيد من التمرن واللعب الممتع!"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> توليد أسئلة متنوعة 🔄
                      </button>
                    </div>
                  </div>
                )}

                {/* Question & Prompt Row */}
                {lessonQuestions.length > 0 && currentQuestion ? (
                  <div className="space-y-6">
                    
                    {/* Active Question Box */}
                    <div className="bg-amber-50/40 rounded-3xl p-5 border-2 border-dashed border-amber-200 shadow-inner relative text-right">
                      <span className="absolute -top-3 right-6 bg-amber-450 text-white text-[10.5px] font-black px-3 py-1 rounded-full shadow-sm">
                        المعضلة الهندسية التفاعلية
                      </span>
                      <p className="text-sm md:text-base text-gray-800 font-bold leading-relaxed whitespace-pre-wrap select-text">
                        {currentQuestion.prompt}
                      </p>
                    </div>

                    {/* TWO-COLUMN GRID: LEFT is interactive Visual Widget, RIGHT are choices */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Interactive visual widget panel (Col: 5) */}
                      <div className="md:col-span-5 bg-indigo-50/30 p-4 rounded-3xl border-2 border-dashed border-indigo-100 flex flex-col justify-center items-center min-h-[220px]">
                        {renderInteractiveSvg(currentQuestion.svgType)}
                      </div>

                      {/* Answer Choices list (Col: 7) */}
                      <div className="md:col-span-7 flex flex-col gap-3">
                        <span className="text-[10px] text-gray-400 font-black block select-none">اختر الإجابة المناسبة للشكل:</span>
                        
                        {currentQuestion.choices.map((choice) => {
                          const isSelected = selectedChoice === choice;
                          const isCorrectChoice = choice === currentQuestion.correctAnswer;
                          
                          let style = "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20";
                          let icon = null;

                          if (selectedChoice !== null) {
                            if (isSelected) {
                              style = isCorrectChoice 
                                ? "bg-green-100 border-green-500 text-green-800" 
                                : "bg-red-100 border-red-500 text-red-800";
                              icon = isCorrectChoice 
                                ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                : <XCircle className="w-5 h-5 text-red-650 shrink-0" />;
                            } else if (isCorrectChoice) {
                              style = "bg-green-50 border-green-300 text-green-800 opacity-90";
                            } else {
                              style = "opacity-45 border-gray-150 cursor-not-allowed bg-gray-50 text-gray-400";
                            }
                          }

                          return (
                            <button
                              key={choice}
                              disabled={selectedChoice !== null}
                              onClick={() => handleChoiceSelect(choice, currentQuestion.correctAnswer, currentQuestion.id)}
                              className={`p-4 rounded-2xl border-2 text-right font-black text-xs md:text-sm flex items-center justify-between gap-3 active:translate-y-0.5 focus:outline-none transition-all ${style}`}
                            >
                              <span>{choice}</span>
                              {icon}
                            </button>
                          );
                        })}
                      </div>

                    </div>

                    {/* Pagination control footer inside current card */}
                    <div className="flex items-center justify-between border-t-2 border-gray-100 pt-5 mt-6">
                      <button
                        onClick={() => {
                          soundEffects.playBeep();
                          setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-4 h-4 ml-1" /> التمرين السابق
                      </button>

                      {/* Indicators */}
                      <div className="flex gap-1.5">
                        {lessonQuestions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              soundEffects.playBeep();
                              setCurrentQuestionIndex(idx);
                            }}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentQuestionIndex ? 'bg-indigo-600 w-6' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          soundEffects.playBeep();
                          if (currentQuestionIndex < lessonQuestions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1);
                          } else {
                            // Reset back to 0
                            setCurrentQuestionIndex(0);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-750 transition-all shadow-md shadow-indigo-100"
                      >
                        {currentQuestionIndex === lessonQuestions.length - 1 ? 'البداية مكرراً 🔄' : (
                          <>التمرين الموالي <ChevronLeft className="w-4 h-4 mr-1" /></>
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center p-12 space-y-4">
                    <span className="text-4xl animate-pulse">📝</span>
                    <h5 className="font-extrabold text-sm text-gray-700">جاري تحميل الأسئلة الرياضية المتنوعة لهذا الدرس...</h5>
                  </div>
                )}

              </div>
            )}

            {/* Lesson 4 View: Timed Comprehensive Random Quiz challenge */}
            {selectedLesson === 4 && (
              <div className="bg-white rounded-[35px] p-5 md:p-7 shadow-xl border-4 border-indigo-50/80 flex flex-col relative overflow-hidden" id="quiz-challenge-screen">
                
                {!quizIsFinished ? (
                  <div className="space-y-6">
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between border-b pb-3.5 select-none">
                      <div>
                        <span className="text-xs font-black text-[#5c53df] bg-[#5c53df]/5 px-2.5 py-1 rounded-full border border-[#5c53df]/15">
                          تحدي بخت الرضا الهندسي الكلي
                        </span>
                        <h4 className="text-sm font-black text-gray-700 mt-2">
                          السؤال المختار {toArabicNumerals(quizActiveIndex + 1)} من أصل {toArabicNumerals(quizQuestions.length)}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-250">
                          الإجابات الصائبة: {toArabicNumerals(quizCorrectAnswersCount)}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    {quizQuestions.length > 0 && quizQuestions[quizActiveIndex] ? (
                      <div className="space-y-6">
                        
                        <div className="bg-slate-800 rounded-3xl p-5 text-center border-8 border-amber-900 shadow-md">
                          <span className="text-[10px] text-emerald-400 font-mono block mb-1">تحدي بخت الرضا ص ١١٥</span>
                          <blockquote className="text-sm md:text-base text-white font-extrabold px-3 py-3 bg-slate-700/50 rounded-2xl border border-dashed border-slate-500 whitespace-pre-wrap select-text">
                            " {quizQuestions[quizActiveIndex].prompt} "
                          </blockquote>
                        </div>

                        {/* Interactive Widget representing this quiz question SVG */}
                        <div className="bg-indigo-50/30 p-4 rounded-3xl border border-indigo-100 flex flex-col justify-center items-center min-h-[170px]">
                          {renderInteractiveSvg(quizQuestions[quizActiveIndex].svgType)}
                        </div>

                        {/* Answers choices */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {quizQuestions[quizActiveIndex].choices.map((choice) => {
                            const isSelected = quizSelectedChoice === choice;
                            const isCorrectChoice = choice === quizQuestions[quizActiveIndex].correctAnswer;
                            
                            let style = "bg-white border-gray-150 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/10";
                            
                            if (quizSelectedChoice !== null) {
                              if (isSelected) {
                                style = isCorrectChoice 
                                  ? "bg-green-150 border-green-500 text-green-800"
                                  : "bg-red-150 border-red-500 text-red-800";
                              } else if (isCorrectChoice) {
                                style = "bg-green-50 border-green-300 text-green-700 font-bold";
                              } else {
                                style = "opacity-45 bg-gray-50 border-gray-100 cursor-not-allowed";
                              }
                            }

                            return (
                              <button
                                key={choice}
                                disabled={quizSelectedChoice !== null}
                                onClick={() => handleQuizChoiceSelect(choice, quizQuestions[quizActiveIndex].correctAnswer)}
                                className={`p-3.5 rounded-2xl border-2 text-center transition-all font-black text-xs md:text-sm active:translate-y-0.5 ${style}`}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation Footer for quiz */}
                        {quizSelectedChoice !== null && (
                          <div className="flex justify-center border-t pt-4">
                            <button
                              onClick={handleNextQuizQuestion}
                              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                            >
                              {quizActiveIndex === quizQuestions.length - 1 ? 'شاهد النتيجة الكلية وتتويج النجوم 🏆' : 'السؤال العشوائي التالي ➡️'}
                            </button>
                          </div>
                        )}

                      </div>
                    ) : (
                      <p className="text-center font-bold text-gray-500 p-8">جاري توليد المسابقة الرياضية الكبرى...</p>
                    )}

                  </div>
                ) : (
                  /* Quiz End screen */
                  <div className="text-center py-6 space-y-6">
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-5xl shadow-md border border-yellow-250 mx-auto animate-bounce">
                      🏆
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-black text-indigo-900">ألعاب مرويا الهندسية المتوجة!</h3>
                      <p className="text-gray-500 font-bold text-xs md:text-sm">
                        لقد أجبت بنجاح على <span className="text-indigo-600 font-black">{toArabicNumerals(quizCorrectAnswersCount)}</span> مسألة من أصل <span className="text-gray-700 font-bold">{toArabicNumerals(quizQuestions.length)}</span> مسائل هندسية وبقاعية!
                      </p>
                    </div>

                    {/* Result Card */}
                    <div className="bg-indigo-50/50 rounded-3xl p-5 border border-indigo-120 max-w-md mx-auto space-y-3.5">
                      <h5 className="font-extrabold text-xs text-indigo-900 border-b pb-2">سجل إجاباتك الرياضية في هذا التحدي:</h5>
                      <div className="space-y-2 text-right">
                        {quizQuestions.map((q, idx) => {
                          const record = quizAnswersRecord[idx];
                          return (
                            <div key={idx} className="flex items-center justify-between gap-3 text-xs font-bold border-b border-white/40 pb-1.5">
                              <span className="text-gray-500 truncate max-w-[200px]">({toArabicNumerals(idx + 1)}) {q.prompt.substring(0, 40)}...</span>
                              <span className={`text-[10px] font-black p-1 px-2.5 rounded-full ${record?.isCorrect ? 'bg-green-150 text-green-700' : 'bg-red-150 text-red-700'}`}>
                                {record?.isCorrect ? '✓ صحيح' : '✖ خطأ'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-yellow-105 border border-yellow-300 p-3 rounded-2xl flex items-center justify-between text-yellow-800 text-xs font-extrabold">
                        <span>النجوم والمكافآت المحصودة:</span>
                        <span>{quizCorrectAnswersCount === quizQuestions.length ? '+١٥ نجمة بخت الرضا!' : `+${toArabicNumerals(quizCorrectAnswersCount * 3)} نجوم خضراء 🌟`}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                      <button
                        onClick={startNewQuizChallenge}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" /> تحدي بأسئلة جديدة عشوائياً 🔄
                      </button>

                      <button
                        onClick={() => setSelectedLesson(1)}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-xl transition-all"
                      >
                        العودة للدروس الأولى لمزيد من المراجعة
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* LEFT COLUMN: HAZOUN'S CORRECTION AND LEARNING ASSISTANT SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="companion-area">
            
            <div className="bg-white rounded-[35px] p-5 shadow-xl border-4 border-yellow-300 flex-1 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4 select-none">
                  <div className="w-10 h-10 bg-yellow-450 text-white rounded-full flex items-center justify-center text-xl animate-bounce">
                    💡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-800 leading-tight">مرشد الهندسة والأشكال</h4>
                    <p className="text-[10px] text-gray-400 font-bold block">مفاهيم كتاب ص ١١١ إلى ١١٥</p>
                  </div>
                </div>

                {/* Question speech section */}
                <div className="bg-gradient-to-l from-yellow-50 to-indigo-50 rounded-2xl p-3 border border-yellow-105 mb-4 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🦜</span>
                    <span className="text-[10px] text-indigo-850 font-black">حسون المعكّم يقرأ لك الدرس:</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mb-2.5">
                    الرياضيات تحيط بك في كورتي وتلال مروي والدندر! اضغط لتسمع مساعدة حسون بصوته الدافئ.
                  </p>
                  
                  {textSpeechPlaying ? (
                    <button
                      onClick={stopNarrative}
                      className="w-full py-1.5 bg-red-500 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1 shadow-sm"
                    >
                      <VolumeX className="w-3.5 h-3.5" /> إيقاف صوت حسون
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedLesson < 4 && currentQuestion) {
                          speakNarrative(currentQuestion.prompt + " . وتذكر " + currentQuestion.hint);
                        } else if (selectedLesson === 4 && quizQuestions[quizActiveIndex]) {
                          speakNarrative(quizQuestions[quizActiveIndex].prompt);
                        } else {
                          speakNarrative("هيا بنا نبسط علم الهندسة والخطوط والأشكال المغلقة يا غندور!");
                        }
                      }}
                      className="w-full py-1.5 bg-[#6C63FF] text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1 shadow hover:bg-[#5249cf] active:translate-y-0.5 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> استمع ومس القضاء بصوت حسون
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {/* Explanation and hint zone */}
                  {selectedLesson < 4 && showExplanation && currentQuestion ? (
                    <motion.div
                      key="show-explain"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 text-right"
                    >
                      <div className={`p-3 rounded-2xl flex items-center gap-2.5 border ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {isCorrect ? (
                          <>
                            <span className="text-2xl">😊</span>
                            <div className="flex-1">
                              <div className="font-black text-[11px] md:text-xs">إجابة هندسية بارعة!</div>
                              <p className="text-[10px] font-bold opacity-90 leading-tight">لقد جمعت ٥ نجوم هندسية!</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl animate-pulse">😟</span>
                            <div className="flex-1">
                              <div className="font-black text-[11px] md:text-xs">المفهوم يحتاج مراجعة طفيفة!</div>
                              <p className="text-[10px] font-bold opacity-90 leading-tight">راجع تلميح الأستاذ حسون تحت الرسم!</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-2 select-text">
                        <strong className="text-indigo-850 font-black text-[11px] block border-b pb-1">
                          📐 توجيه الأستاذ حسون الرياضي:
                        </strong>
                        <p className="text-gray-650 font-semibold text-[11px] leading-relaxed text-justify">
                          {currentQuestion.explanation}
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-250 p-3 rounded-2xl text-center">
                        <span className="text-lg">🌴🌾🗺️</span>
                        <p className="text-gray-700 font-extrabold text-[10px] mt-1 leading-snug">
                          جميع المسائل مستوحاة من البيئة اليومية كأنفس عابرة على طين النيل العظيم!
                        </p>
                      </div>

                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-explain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center p-4 space-y-3"
                    >
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-yellow-105 animate-pulse">
                        🤔
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-gray-700">تلميح الدرس الحالي:</h5>
                        <p className="text-gray-400 text-[10.5px] font-bold leading-relaxed mt-1">
                          {selectedLesson < 4 && currentQuestion ? currentQuestion.hint : 'أجب على إحدى المسائل التفاعلية المعروضة لفتح لوحة شروح ودروس حسون الذكية مباشرة!'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Standard curriculum banner at the bottom */}
              <div className="mt-4 pt-3 border-t border-gray-105">
                <div className="bg-[#6C63FF]/5 rounded-2xl p-3 border border-[#6C63FF]/10 text-center select-none">
                  <span className="text-[10px] text-[#6C63FF] font-black uppercase tracking-wider block">هوية بخت الرضا السودانية</span>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">
                    ترسيخ الرياضيات ببيئة الطفل السوداني المنهجية لغرس المعرفة والجمال.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
