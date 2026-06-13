import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Star, Volume2, RefreshCw, Gamepad2, Timer, CheckCircle, HelpCircle } from 'lucide-react';
import { toArabicNumerals } from '../utils/mathHelpers';
import { soundEffects } from '../utils/audio';

interface MiniGamesProps {
  onAddStars: (stars: number) => void;
}

type MiniGameTab = 'balloon' | 'guess';

const BALLOON_EMOJIS = ['🎈', '🍓', '🥭', '🍉', '🍌', '⭐', '🦁', '🦜', '🐑'];

export default function MiniGames({ onAddStars }: MiniGamesProps) {
  const [activeTab, setActiveTab] = useState<MiniGameTab>('balloon');

  // --- GAME 1: Balloon Blitz State ---
  const [balloonScore, setBalloonScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // 0 = not running, >0 = playing
  const [balloonEmoji, setBalloonEmoji] = useState('🎈');
  const [balloonPos, setBalloonPos] = useState({ top: '50%', left: '50%' });
  const [balloonColor, setBalloonColor] = useState('from-red-400 to-pink-500');
  const [game1Finished, setGame1Finished] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);

  const colors = [
    'from-red-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-indigo-500',
    'from-fuchsia-400 to-rose-500',
    'from-yellow-400 to-amber-500',
  ];

  // Start the Balloon Blitz Game
  const startBalloonGame = () => {
    soundEffects.playBeep();
    setBalloonScore(0);
    setTimeLeft(12); // 12 seconds
    setGame1Finished(false);
    moveBalloon();
  };

  const moveBalloon = () => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const padding = 60; // balloon size offset
    const randomTop = Math.floor(Math.random() * (rect.height - padding - 20)) + 10;
    const randomLeft = Math.floor(Math.random() * (rect.width - padding - 20)) + 10;
    setBalloonPos({ top: `${randomTop}px`, left: `${randomLeft}px` });

    // Pick random emoji & color
    setBalloonEmoji(BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)]);
    setBalloonColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  const popBalloon = () => {
    if (timeLeft <= 0) return;
    soundEffects.playPop();
    setBalloonScore(prev => prev + 1);
    moveBalloon();
  };

  // Timer loop for Game 1
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && balloonScore > 0 && !game1Finished) {
      setGame1Finished(true);
      const earnedStars = Math.min(10, Math.ceil(balloonScore / 2));
      onAddStars(earnedStars);
      soundEffects.playStar();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, balloonScore]);


  // --- GAME 2: Secret Number Guess State ---
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [guessFeedback, setGuessFeedback] = useState<'start' | 'low' | 'high' | 'correct'>('start');
  const [starsWonG2, setStarsWonG2] = useState(0);
  const [showTreasurePeek, setShowTreasurePeek] = useState(false);

  const initGuessGame = () => {
    soundEffects.playBeep();
    setSecretNumber(Math.floor(Math.random() * 20) + 1);
    setAttempts([]);
    setGuessFeedback('start');
    setStarsWonG2(0);
    
    // Show peek quickly
    setShowTreasurePeek(true);
  };

  useEffect(() => {
    initGuessGame();
  }, []);

  // Safely auto-hide the treasure peek after 1.1 seconds
  useEffect(() => {
    if (!showTreasurePeek) return;
    const timer = setTimeout(() => {
      setShowTreasurePeek(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [showTreasurePeek]);

  const handleGuess = (num: number) => {
    if (guessFeedback === 'correct') return;
    if (attempts.includes(num)) return;

    soundEffects.playBeep();
    setAttempts(prev => [...prev, num]);

    if (num === secretNumber) {
      soundEffects.playStar();
      setGuessFeedback('correct');
      // Stars based on attempts (less attempts = more stars)
      let won = 10;
      if (attempts.length >= 7) won = 3;
      else if (attempts.length >= 4) won = 5;
      else if (attempts.length >= 2) won = 8;
      setStarsWonG2(won);
      onAddStars(won);
    } else if (num < secretNumber) {
      soundEffects.playError();
      setGuessFeedback('low');
    } else {
      soundEffects.playError();
      setGuessFeedback('high');
    }
  };

  // Speak voice prompt
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-[#1F1F1F] rounded-[40px] border-4 border-[#FFA726] overflow-hidden shadow-2xl text-white" dir="rtl" id="mini-games-section">
      {/* Dynamic Header */}
      <div className="bg-[#2D2D2D] p-5 px-6 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white/20 animate-spin-slow">
            🎮
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-amber-400 flex items-center gap-2">
              ساحة ألعاب عثمان الترفيهية المسلية السريعة!
            </h3>
            <p className="text-gray-400 text-xs font-semibold">استمتع بفرقعة البالونات ومسابقة الخمن الحسابي لتكسب المزيد من النجوم الذهبية!</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-white/10 gap-1.5 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => { soundEffects.playBeep(); setActiveTab('balloon'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'balloon'
                ? 'bg-[#FFA726] text-slate-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🎈 مفرقع البالونات الخفيف
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setActiveTab('guess'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'guess'
                ? 'bg-[#FFA726] text-slate-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ❓ كنز تخمين الأرقام
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'balloon' ? (
            <motion.div
              key="balloon-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-sm font-semibold border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-450">مجموع مفرقعاتك:</span>
                  <span className="bg-amber-400/20 text-yellow-300 font-black px-3 py-1 rounded-full text-base border border-amber-400/30">
                    {toArabicNumerals(balloonScore)} هدفاً 🎯
                  </span>
                </div>
                <div>
                  {timeLeft > 0 ? (
                    <div className="flex items-center gap-2 text-[#FF6584] font-black animate-pulse">
                      <Timer className="w-5 h-5" />
                      <span>الزمن المتبقي: {toArabicNumerals(timeLeft)} ثوانِِ</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-extrabold text-xs">مستعد للمحاولة؟ اضغط زر البدء!</span>
                  )}
                </div>
              </div>

              {timeLeft > 0 ? (
                // Play Arena
                <div
                  ref={arenaRef}
                  className="relative h-60 w-full bg-[#141414] rounded-2xl border-2 border-dashed border-white/10 overflow-hidden cursor-crosshair select-none flex items-center justify-center transition-all shadow-inner"
                >
                  {/* Floating balloon */}
                  <motion.button
                    layout
                    onClick={popBalloon}
                    style={{ position: 'absolute', top: balloonPos.top, left: balloonPos.left }}
                    className={`w-14 h-18 rounded-full bg-gradient-to-b ${balloonColor} flex flex-col items-center justify-center border-2 border-white/50 cursor-pointer shadow-lg`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <span className="text-2xl">{balloonEmoji}</span>
                    <div className="absolute top-2 left-2.5 w-3 h-5 bg-white/30 rounded-full rotate-12" />
                    {/* string of the balloon */}
                    <div className="w-0.5 h-4 bg-white/40 absolute -bottom-4" />
                  </motion.button>
                </div>
              ) : (
                // Start screen or Finished screen
                <div className="h-60 bg-[#141414] rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  {game1Finished ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="space-y-2 max-w-sm"
                    >
                      <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
                      <h4 className="text-lg font-black text-rose-400">انتهى وقت المغامرة والبهجة للبالونات!</h4>
                      <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                        أحسنت بفرقعة <span className="text-yellow-400 font-black">{toArabicNumerals(balloonScore)}</span> رمزاً سريعاً ومنعت تسربها! لقد كسبت اليوم:
                        <span className="block text-emerald-400 font-black text-sm mt-1">+{toArabicNumerals(Math.min(10, Math.ceil(balloonScore / 2)))} نجمة دراسية جديدة! ⭐</span>
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2 max-w-sm">
                      <p className="text-xs text-slate-400 leading-relaxed font-bold">
                        لعبة حركية ممتعة وسريعة البداهة! بمجرد نقرك على زر البدء، ستظهر البالونات والأيقونات التعبيرية في أماكن مختلفة وعليك ملاحقتها وسرعة الضغط عليها لتكسب النماذج المنهجية!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={startBalloonGame}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-6 py-2.5 rounded-xl font-black text-sm shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> {game1Finished ? 'العب من جديد 🎮' : 'ابدأ المغامرة الآن! 🏎️'}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="guess-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 relative overflow-hidden"
            >
              <AnimatePresence>
                {showTreasurePeek && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-30 bg-[#141414]/98 rounded-[30px] border-4 border-[#FFA726] flex flex-col items-center justify-center text-center p-6 space-y-3"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.15, 1, 1.15, 1]
                      }}
                      transition={{ duration: 0.6, repeat: 1 }}
                      className="text-5xl"
                    >
                      🎁✨👑
                    </motion.div>
                    
                    <div>
                      <h4 className="text-lg font-black text-amber-400">⚡ ومضة الكنز السريعة!</h4>
                      <p className="text-[11px] text-gray-300 font-bold max-w-sm leading-relaxed mt-0.5">
                        افتح عينيك جيداً والقط رقم الكنز المضاء بسرعة البرق قبل اختفائه وقفل الصندوق! ⚡
                      </p>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-24 h-24 bg-[#FFA726]/20 rounded-full blur-xl animate-ping" />
                      <div className="relative bg-gradient-to-tr from-[#FFA726] to-yellow-300 text-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-4xl shadow-lg border-2 border-white animate-pulse">
                        {toArabicNumerals(secretNumber)}
                      </div>
                    </div>

                    <div className="text-[9px] text-[#FFA726] font-black tracking-widest animate-pulse">
                      جاري القفل والإخفاء الآن... ركّز! 🔒
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#252525] p-4 rounded-3xl border border-white/5">
                {/* Companion bubble */}
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🦜</div>
                  <div className="text-right">
                    <span className="text-[10px] text-yellow-300 font-extrabold block">توجيه حسون الذكي:</span>
                    <p className="text-xs font-bold leading-relaxed max-w-md">
                      {guessFeedback === 'start' && '🔒 لقد تم قفل الكنز وإخفاء الرقم بنجاح بعد الوميض! خمن موقعه الآن لربح نجوم بخت الرضا كبطل مع عثمان!'}
                      {guessFeedback === 'low' && 'محاولة جيدة يا دكتورنا الصغير! لكن سر كنز الأرقام أكبر 📈 مما خجلت منه! جرب رقماً أكبر!'}
                      {guessFeedback === 'high' && 'تلميحة عاجلة! الرقم المطلوب أصغر 📉 من الرقم الذي اخترته. تفقد الأرقام الأقل!'}
                      {guessFeedback === 'correct' && `يا للروعة المطلقة! لقد هزمت التخمين وكشفت سر الرقم وهو (${toArabicNumerals(secretNumber)}) بالتمام!`}
                    </p>
                  </div>
                </div>

                {guessFeedback === 'correct' ? (
                  <div className="bg-emerald-500/15 text-emerald-400 p-2.5 px-4 rounded-2xl border border-emerald-500/20 text-center text-xs font-extrabold animate-pulse">
                    🏆 ومكافأتك بخت الرضا:
                    <span className="block text-amber-300 font-black">+{toArabicNumerals(starsWonG2)} نجوم كبرى</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-450 font-black">
                    عدد نقراتك: <span className="text-[#FF6584]">{toArabicNumerals(attempts.length)} من أصل ٢٠ خياراً</span>
                  </div>
                )}
              </div>

              {/* Grid 1 to 20 for picking */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const num = idx + 1;
                  const isChecked = attempts.includes(num);
                  const isCorrectAnswer = num === secretNumber && guessFeedback === 'correct';

                  let btnStyle = 'bg-[#181818] text-gray-300 border border-white/10 hover:border-yellow-500 hover:text-white';
                  if (isChecked) {
                    if (num < secretNumber) {
                      btnStyle = 'bg-rose-950/40 text-rose-450 border border-rose-900/40 cursor-not-allowed';
                    } else if (num > secretNumber) {
                      btnStyle = 'bg-rose-950/40 text-rose-450 border border-rose-900/40 cursor-not-allowed';
                    }
                  }
                  if (isCorrectAnswer) {
                    btnStyle = 'bg-emerald-500 text-slate-900 font-black border-2 border-white animate-bounce';
                  }

                  return (
                    <button
                      key={num}
                      disabled={isChecked && !isCorrectAnswer}
                      onClick={() => handleGuess(num)}
                      className={`h-11 rounded-xl text-center flex items-center justify-center font-black text-sm transition-all relative ${btnStyle}`}
                    >
                      {isChecked && num < secretNumber && <span className="absolute text-[8px] top-0 right-1 text-rose-400">▲</span>}
                      {isChecked && num > secretNumber && <span className="absolute text-[8px] bottom-0 right-1 text-rose-400">▼</span>}
                      {isCorrectAnswer ? '🏆' : toArabicNumerals(num)}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={initGuessGame}
                  className="bg-zinc-800 hover:bg-zinc-700 hover:text-white text-gray-300 border border-white/10 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> إعادة اللعب برقم سري جديد!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
