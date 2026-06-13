import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Star, 
  Volume2, 
  VolumeX,
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Smile,
  AlertCircle,
  Activity,
  Heart
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface StorybookProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Story {
  id: number;
  title: string;
  location: string;
  hero: string;
  concept: string;
  narrativeText: string;
  mathPrompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  unitLabel: string;
  accentColor: string;
}

export default function Storybook({ onBack, onAddStars }: StorybookProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [textSpeechPlaying, setTextSpeechPlaying] = useState<boolean>(false);
  const [starsAwarded, setStarsAwarded] = useState<boolean>(false);
  
  // Interactive mini-states for visual demonstrations
  const [story1BoxClicked, setStory1BoxClicked] = useState<Record<string, number>>({
    thousand: 0,
    hundred: 0,
    ten: 0,
    unit: 0
  });
  const [story2PoppedBalloons, setStory2PoppedBalloons] = useState<boolean[]>(Array(56).fill(false));
  const [story3AssignedFish, setStory3AssignedFish] = useState<number>(0);
  const [story4SlicesEaten, setStory4SlicesEaten] = useState<boolean[]>([true, true, true, false, false, false, false, false]);
  const [story5ClockSliderValue, setStory5ClockSliderValue] = useState<number>(15);

  const stories: Story[] = [
    {
      id: 1,
      title: 'حصاد التمر في قرية كـورتي',
      location: 'الولاية الشمالية 🌴',
      hero: 'الجد محجوب الكندري',
      concept: 'قراءة الأعداد والآحاد والعشرات والمئات والآلاف',
      unitLabel: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
      accentColor: 'emerald',
      narrativeText: 'يا بطل! الجد محجوب في قرية كورتي الجميلة على شواطئ النيل بالولاية الشمالية، قام اليوم بجني ثمار نخلاته المباركة. لتعبئة التمر اللذيذ لتصديره إلى سوق أم درمان العريق، رتبها بدقة متناهية: وضع كرتونتين (٢) كبيرتين في كل واحدة ألف بلحة، وأربعة (٤) صناديق في كل واحد مائة بلحة، وخمسة (٥) أكياس صغيرة في كل واحد عشر بلحات، وحمل في كفه ثمانية (٨) تمرات منفردة طازجة. كم بلحة حصد الجد محجوب بالتمام في الإجمالي؟',
      mathPrompt: 'اجمع الخانات الآتية: ٢ ألوف، و ٤ مئات، و ٥ عشرات، و ٨ آحاد:',
      choices: ['٢٤٥٨ بلحة', '٢٥٤٨ بلحة', '٤٢٥٨ بلحة', '٢٤٨٥ بلحة'],
      correctAnswer: '٢٤٥٨ بلحة',
      explanation: 'يا بطل كورتي الذكي! الخانة الكبرى هي الألوف (٢ آلاف = ٢٠٠٠)، ثم المئات (٤ مئات = ٤٠٠)، ثم العشرات (٥ عشرات = ٥٠)، والآحاد المنفردة (٨). بجمعها نحصل على ٢٤٥٨ بلحة تمر سودانية شهية!',
    },
    {
      id: 2,
      title: 'بالونات الفرح في مـروي تيمناً بأمير',
      location: 'مدينة مروي الطيبة 🎈',
      hero: 'الخالة هدى المحبة',
      concept: 'مفهوم جدول الضرب وعملياته الممتعة',
      unitLabel: 'الوحدة الثانية: عمليات الضرب الطائرة',
      accentColor: 'amber',
      narrativeText: 'تجهز الخالة هدى فناء منزلها الواسع بمروي لاستقبال الأهل والجيران احتفالاً بنجاح ابنها البطل أمير في امتحانات الصف الثالث وتفوقه! اشترت لتزيين السقف سبعة (٧) مجموعات من بالونات الهليوم الدائرية الملونة. كل مجموعة تحتوي بالضبط على ثمانية (٨) بالونات مربوطة بخيط صوف متين. كم عدد بالونات الفرح الطائرة الإجمالي التي ستزين البيت السعيد؟',
      mathPrompt: 'احسب حاصل ضرب المجموعات: ٧ مجموعات مضروبة في ٨ بالونات (٧ × ٨)',
      choices: ['٤٨ بالونة', '٥٤ بالونة', '٥٦ بالونة', '٦٤ بالونة'],
      correctAnswer: '٥٦ بالونة',
      explanation: 'يا بطل مروي الرائع! عملية الضرب هي اختصار للجمع المتكرر. تكرار الرقم ٨ لسبع مرات (٧ × ٨) يعطينا ٥٦ بالونة زاهية تملأ فناء المنزل بهجة وسروراً!',
    },
    {
      id: 3,
      title: 'صيد السمك الوفير بـمحمية الدندر',
      location: 'محمية الدندر القومية 🐟',
      hero: 'العم عباس الصياد الماهر',
      concept: 'القسمة بالتساوي ومعرفة باقي التوزيع',
      unitLabel: 'الوحدة الثالثة: غابة القسمة العادلة',
      accentColor: 'fuchsia',
      narrativeText: 'ركب العم عباس قاربه الخشبي الصغير فجر اليوم في مياه النهر بمحمية الدندر الطبيعية الخلابة، ووفقه الله باصطياد أربعة وثلاثين (٣٤) سمكة بلطي نيلية طازجة! قرر عباس كعادته السمحة أن يقسم صيده بالتساوي على أربعة (٤) من أسر جيرانه المحتاجين، على أن يأخذ السمكات القليلة المتبقية لطهي عشاء دافئ لأطفاله. كم سمكة نالتها كل أسرة من الجيران، وكم سمكة تبقت للعم عباس وعائلته؟',
      mathPrompt: 'قم بقسمة ٣٤ سمكة على ٤ أسر بالتساوي، واعرف الباقي المتبقي:',
      choices: [
        'كل جار يأخذ ٨ سمكات، ويتبقى للعم عباس سمكتان (٢)',
        'كل جار يأخذ ٧ سمكات، ويتبقى للعم عباس ٦ سمكات',
        'كل جار يأخذ ٩ سمكات، ويتبقى للعم عباس سمكة واحدة',
        'كل جار يأخذ ٨ سمكات، ويتبقى للعم عباس ٤ سمكات'
      ],
      correctAnswer: 'كل جار يأخذ ٨ سمكات، ويتبقى للعم عباس سمكتان (٢)',
      explanation: 'يا صائد المعرفة الذكي! نبحث عن عدد يضرب في ٤ ليكون قريباً من ٣٤ دون تجاوزه، ونجد ٤ × ٨ = ٣٢. إذن تنال كل أسرة ٨ سمكات بلطي ويفيض للعم عباس سمكتان لذيذتان لعائلته المحترمة!',
    },
    {
      id: 4,
      title: 'صناعة اللقيمات ومشاركة الكسور بمقرن النيلين',
      location: 'مقرن النيلين بالخرطوم 🍕',
      hero: 'الأخت منى بائعة الفرح',
      concept: 'الأجزاء المتطابقة وتسمية الكسور المنهجية (البسط والمقام)',
      unitLabel: 'الوحدة الرابعة: مختبر الكسور والبيتزا واللقيمات',
      accentColor: 'sky',
      narrativeText: 'الأخت منى بائعة شاي ولقيمات مشهورة بجوار مقرن النيلين الأزرق والأبيض الفاتن بالخرطوم. قامت اليوم بصنع قرص كيك دائري شهي من الدقيق والسمسم، وقسمته بسكينها إلى ثمانية (٨) أجزاء متساوية تماماً. مر عليها ثلاثة (٣) أطفال صغار يرتدون الزي المدرسي واشتروا ثلاثة أجزاء من الكعك الساخن ليتناولوها مع حليب الصباح. ما هو الكسر الدقيق الذي يمثل القطع التي أكلها هؤلاء الصغار، ومن هو بسطه ومقامه؟',
      mathPrompt: 'حدد الكسر المناسب للأجزاء ٣ من أصل ٨ قطع متساوية:',
      choices: ['٣ / ٨ (البسط ٣ والمقام ٨)', '٨ / ٣ (البسط ٨ والمقام ٣)', '٢ / ٨ (البسط ٢ والمقام ٨)', '٥ / ٨ (البسط ٥ والمقام ٨)'],
      correctAnswer: '٣ / ٨ (البسط ٣ والمقام ٨)',
      explanation: 'أحسنتم يا صغارنا! الكسر يمثل (الجزء المأكول) على (كل الأجزاء). الأجزاء المأكولة هي البسط وتساوي ٣، والأجزاء الكلية للكعكة هي المقام وتساوي ٨. إذن الكسر هو ثلاثة أثمان وتكتب ٣/٨!',
    },
    {
      id: 5,
      title: 'قهوة الجبنة وجلسة الـمغرب بالأبيض',
      location: 'مدينة الأبيض كردفان الغرة ☕',
      hero: 'الحبوبة فاطمة الطيبة',
      concept: 'قراءة وتحريك الساعة وحساب فترات الدقائق الزمنية',
      unitLabel: 'الوحدة الخامسة: دوران الساعة والزمن',
      accentColor: 'rose',
      narrativeText: 'تحت ظل شجرة النيم الكبيرة المتدلية في حوش المنزل بمدينة الأبيض، جهزت الحبوبة فاطمة الكانون وموقد الجمر لتحضير قهوة (الجبنة) الفخارية السودانية الفواحة لأحفادها العائدين من المدارس. بدأت الحبوبة بتحميص حبات البن وصنع القهوة بالضبط في تمام الساعة الرابعة والربع (٤:١٥) عصراً. استغرقت عملية التحميص والطبخ والغلي حتى صبتها في الفناجين خمسة وثلاثين (٣٥) دقيقة كاملة. في أي وقت تماماً نضجت القهوة وأصبحت جاهزة لارتشاف الضحكات؟',
      mathPrompt: 'اجمع ٣٥ دقيقة إلى وقت البدء ٤:١٥ عصراً:',
      choices: ['الساعة ٤:٣٠ عصراً', 'الساعة ٤:٥٠ عصراً', 'الساعة ٥:٠٠ مساءً', 'الساعة ٤:٤٠ عصراً'],
      correctAnswer: 'الساعة ٤:٥٠ عصراً',
      explanation: 'رائع جداً يا عالم الزمن! لدينا وقت البدء ٤:١٥، نضيف ٣٥ دقيقة إلى الدقائق الموجودة: ١٥ + ٣٥ = ٥٠ دقيقة. بما أن الساعات لم تتخط الـ ٦٠ دقيقة، يظل وقت نضج الجبنة هو الرابعة وخمسين دقيقة (٤:٥٠) عصراً قبيل المغرب!',
    }
  ];

  const currentStory = stories[currentStoryIndex];

  // TTS audio function with cancellation
  const speakNarrative = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const parts = text.split(/[،!.؟]/); // break it down a bit for smoother TTS pacing
      let partIndex = 0;

      const speakNextPart = () => {
        if (partIndex < parts.length) {
          const partText = parts[partIndex].trim();
          if (partText.length > 0) {
            const utterance = new SpeechSynthesisUtterance(partText);
            utterance.lang = 'ar-SD';
            utterance.rate = 0.88; // friendly and warm pacing for kids
            utterance.pitch = 1.15; // friendly sound for Hassoun parrot
            utterance.onend = () => {
              partIndex++;
              speakNextPart();
            };
            utterance.onerror = () => {
              setTextSpeechPlaying(false);
            };
            window.speechSynthesis.speak(utterance);
          } else {
            partIndex++;
            speakNextPart();
          }
        } else {
          setTextSpeechPlaying(false);
        }
      };

      setTextSpeechPlaying(true);
      speakNextPart();
    } else {
      alert('ميزة نطق الصوت غير مدعومة في متصفحك الحالي، لكن يمكنك الاستمرار في القراءة واللعب!');
    }
  };

  const stopNarrative = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTextSpeechPlaying(false);
    }
  };

  useEffect(() => {
    // Reset state every time the story changes
    setSelectedChoice(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setStarsAwarded(false);
    stopNarrative();

    // Auto-narrate slightly on story switch
    const timer = setTimeout(() => {
      speakNarrative(currentStory.narrativeText);
    }, 700);

    return () => {
      clearTimeout(timer);
      stopNarrative();
    };
  }, [currentStoryIndex]);

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
    const correct = choice === currentStory.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      soundEffects.playCorrect();
      if (!starsAwarded) {
        onAddStars(15); // Large reward for reading curriculum stories!
        setStarsAwarded(true);
        soundEffects.playStar();
      }
    } else {
      soundEffects.playError();
    }
  };

  const nextStory = () => {
    soundEffects.playBeep();
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Loop back or finish
      setCurrentStoryIndex(0);
    }
  };

  const prevStory = () => {
    soundEffects.playBeep();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  // Helper for clicking interactive pieces in Story 1
  const clickUnitBox = (key: 'thousand' | 'hundred' | 'ten' | 'unit', max: number) => {
    soundEffects.playPop();
    setStory1BoxClicked(prev => ({
      ...prev,
      [key]: prev[key] >= max ? 0 : prev[key] + 1
    }));
  };

  // Helper for toggle slices in Story 4
  const toggleCakeSlice = (idx: number) => {
    soundEffects.playPop();
    const updated = [...story4SlicesEaten];
    updated[idx] = !updated[idx];
    setStory4SlicesEaten(updated);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 text-right select-none" dir="rtl" id="storybook-container">
      
      {/* Upper Navigation Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-[30px] border-b-6 border-pink-700 shadow-xl text-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              stopNarrative();
              onBack();
            }}
            id="back-to-dashboard-btn"
            className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition-transform active:scale-95 focus:outline-none"
            title="رجوع للقائمة الرئيسية"
          >
            <ArrowRight className="w-6 h-6 transform rotate-0" />
          </button>
          <div className="text-right">
            <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-widest block">بخت الرضا تقدم</span>
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-1.5 leading-none">
              📖 قصص حسون المنهجية المصورة
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress tracker */}
          <span className="text-xs font-black bg-pink-700/50 px-3.5 py-1.5 rounded-full border border-pink-400">
            القصة {currentStoryIndex + 1} من {stories.length}
          </span>
          <div className="bg-yellow-400 text-pink-700 font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md border-2 border-white">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-600 animate-spin-slow" />
            <span>+١٥ نجوم</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN (Lg: 8 cols): The Active Illustrated Story Page & Interactive Screen */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[35px] p-5 md:p-7 shadow-xl border-4 border-pink-100 flex flex-col relative overflow-hidden">
            
            {/* Story title tag and geography marker */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-0.5">{currentStory.unitLabel}</span>
                <h2 className="text-xl md:text-2xl font-black text-pink-600 flex items-center gap-2">
                  <span>{currentStory.title}</span>
                  <span className="text-sm font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{currentStory.location}</span>
                </h2>
              </div>
              <div className="bg-pink-50 text-pink-650 px-4 py-1 rounded-full text-xs font-black border border-pink-100">
                البطل: {currentStory.hero}
              </div>
            </div>

            {/* Narrator parrot "Hassoun" soundboard row */}
            <div className="bg-gradient-to-l from-yellow-50 to-pink-50 rounded-2xl p-4 mb-4 flex items-center gap-4 border border-yellow-100 shadow-inner relative">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-4xl border-2 border-yellow-300 shadow-md transform -rotate-6 relative shrink-0">
                🦜
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[10px]">🟢</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-black text-[#5c53df] mb-1">حسون المربّي الذكي يقرأ لك القصة بصوته النقي:</div>
                <p className="text-gray-500 font-bold text-xs">اضغط على زر التحكم بالأسفل للاستماع بصوت حسون بلهجة سودانية دافئة ومفهومة!</p>
              </div>
              <div className="shrink-0">
                {textSpeechPlaying ? (
                  <button 
                    onClick={stopNarrative} 
                    className="p-3 bg-red-500 text-white rounded-2xl shadow-md hover:bg-red-650 active:translate-y-0.5 transition-all flex items-center gap-1.5 text-xs font-black"
                  >
                    <VolumeX className="w-4 h-4" /> إيقاف القراءة
                  </button>
                ) : (
                  <button 
                    onClick={() => speakNarrative(currentStory.narrativeText)}
                    className="p-3 bg-[#6C63FF] text-white rounded-2xl shadow-md hover:bg-[#5249cf] active:translate-y-0.5 transition-all flex items-center gap-1.5 text-xs font-black animate-bounce"
                  >
                    <Volume2 className="w-4 h-4" /> اقرأ بصوت حسون
                  </button>
                )}
              </div>
            </div>

            {/* Narrative text block styled like a graphic novel page */}
            <div className="bg-amber-50/40 rounded-3xl p-5 md:p-6 border-2 border-dashed border-yellow-200 mb-6 relative">
              <span className="absolute -top-3 right-6 bg-yellow-450 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">القصة والمنهج</span>
              <p className="text-gray-850 font-bold leading-relaxed text-sm md:text-base text-justify whitespace-pre-wrap select-text">
                {currentStory.narrativeText}
              </p>
            </div>

            {/* Interactive Visual Stage depending on which story is selected */}
            <div className="bg-gray-50 rounded-3xl p-4 border-2 border-gray-100 min-h-[220px] flex flex-col items-center justify-center relative mb-4">
              <span className="absolute top-2.5 left-3 text-[10px] bg-white text-gray-400 font-extrabold px-2 py-0.5 rounded-md border border-gray-150 shadow-sm uppercase tracking-wide">الرسم التفاعلي المساعد</span>
              
              {/* STORY 1 INTERACTIVE ELEMENT */}
              {currentStory.id === 1 && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="text-center">
                    <span className="text-xs font-black text-emerald-600 block mb-1">🌴 انقر على مجموعات التمر لمعاينتها:</span>
                    <p className="text-gray-400 text-[11px]">حسون قام برسم المجموعات التي جمعها الجد محجوب</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                    <div 
                      onClick={() => clickUnitBox('thousand', 3)}
                      className={`bg-white p-3 rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:border-emerald-500 ${story1BoxClicked.thousand > 0 ? 'bg-emerald-50 border-emerald-300' : 'border-gray-200'}`}
                    >
                      <div className="text-3xl mb-1 text-center">📦📦</div>
                      <div className="text-center font-black text-xs text-gray-700">كرتونة الألوف:</div>
                      <div className="text-center font-black text-base text-emerald-600">{story1BoxClicked.thousand === 0 ? 'اضغط لفتح ٢ كراتين' : '٢ كرتونة (٢٠٠٠)'}</div>
                    </div>

                    <div 
                      onClick={() => clickUnitBox('hundred', 5)}
                      className={`bg-white p-3 rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:border-emerald-500 ${story1BoxClicked.hundred > 0 ? 'bg-emerald-50 border-emerald-300' : 'border-gray-200'}`}
                    >
                      <div className="text-3xl mb-1 text-center">👜👜</div>
                      <div className="text-center font-black text-xs text-gray-700">صناديق المئة:</div>
                      <div className="text-center font-black text-base text-emerald-600">{story1BoxClicked.hundred === 0 ? 'اضغط لفتح ٤ صناديق' : '٤ صناديق (٤٠٠)'}</div>
                    </div>

                    <div 
                      onClick={() => clickUnitBox('ten', 7)}
                      className={`bg-white p-3 rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:border-emerald-500 ${story1BoxClicked.ten > 0 ? 'bg-emerald-50 border-emerald-300' : 'border-gray-200'}`}
                    >
                      <div className="text-3xl mb-1 text-center">🛍️🛍️</div>
                      <div className="text-center font-black text-xs text-gray-700">أكياس العشرة:</div>
                      <div className="text-center font-black text-base text-emerald-600">{story1BoxClicked.ten === 0 ? 'اضغط لفتح ٥ أكياس' : '٥ أكياس (٥٠)'}</div>
                    </div>

                    <div 
                      onClick={() => clickUnitBox('unit', 9)}
                      className={`bg-white p-3 rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:border-emerald-500 ${story1BoxClicked.unit > 0 ? 'bg-emerald-50 border-emerald-300' : 'border-gray-200'}`}
                    >
                      <div className="text-3xl mb-1 text-center">🌴🫘</div>
                      <div className="text-center font-black text-xs text-gray-700">تمرات منفردة:</div>
                      <div className="text-center font-black text-base text-emerald-600">{story1BoxClicked.unit === 0 ? 'اضغط لعد ٨ تمرات' : '٨ تمرات منفردة'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STORY 2 INTERACTIVE ELEMENT */}
              {currentStory.id === 2 && (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-xs font-black text-amber-550 block mb-1">🎈 حزم بالونات مروي الملونة:</span>
                    <p className="text-gray-400 text-[11px]">٧ حزم صوفية، وفي كل حزمة ٨ بالونات للأطفال</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                      const baseColor = [
                        'bg-red-400 border-red-500', 
                        'bg-blue-400 border-blue-500', 
                        'bg-green-400 border-green-500', 
                        'bg-purple-400 border-purple-500', 
                        'bg-yellow-400 border-yellow-500', 
                        'bg-orange-400 border-orange-500', 
                        'bg-pink-400 border-pink-500'
                      ][num-1];
                      return (
                        <div 
                          key={num}
                          onClick={() => {
                            soundEffects.playPop();
                            alert(`هذه الحزمة رقم ${num} وتحتوي على ٨ بالونات فرح!`);
                          }}
                          className={`px-4 py-3 rounded-2xl text-white font-black text-xs flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-all border-b-4 ${baseColor}`}
                        >
                          <span className="text-2xl animate-bounce">🎈</span>
                          <span>الحزمة {num}</span>
                          <span className="bg-white/35 px-2 py-0.5 rounded text-[10px] mt-1">٨ بالونات</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STORY 3 INTERACTIVE ELEMENT */}
              {currentStory.id === 3 && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="text-center">
                    <span className="text-xs font-black text-fuchsia-600 block mb-1">🐟 توزيع ٣٤ سمكة بلطي نيلية على جيران العم عباس الـ ٤ بالتساوي:</span>
                    <p className="text-gray-400 text-[11px]">وزع مع حسون ومثل التوزيع بالباقي!</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="bg-white p-3 rounded-2xl border border-fuchsia-100 shadow-sm flex flex-col items-center justify-between">
                        <span className="text-2xl">🧺</span>
                        <span className="font-black text-xs text-blue-600">سلة الجار {j}</span>
                        <div className="flex flex-wrap gap-0.5 justify-center mt-2">
                          {Array(8).fill(null).map((_, i) => (
                            <span key={i} className="text-[10px] select-none" title="سمكة بلطي">🐟</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold block mt-1 bg-fuchsia-50 px-2 py-0.5 rounded">٨ سمكات بلطي</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-250 p-2.5 rounded-2xl text-center w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">المجموع الكلي الموزع بالعدل (٤ × ٨) = ٣٢ سمكة</span>
                    <span className="bg-yellow-450 text-white font-black px-3.5 py-1 rounded-full text-xs">السمك المتبقي للعم عباس = ٢ سمكة!</span>
                  </div>
                </div>
              )}

              {/* STORY 4 INTERACTIVE ELEMENT */}
              {currentStory.id === 4 && (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="text-center mb-2">
                    <span className="text-xs font-black text-sky-600 block mb-1">🍕 كعكة اللقيمات الدائرية المقسمة لـ ٨ قطع بالتساوي:</span>
                    <p className="text-gray-450 text-[11px]">اضغط على قطع الكعكة لـ تلوينها أو إخفائها وحساب الكسر مباشرة!</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                    {/* SVG Circle Representing Cake */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {story4SlicesEaten.map((eaten, idx) => {
                          const angle = 45;
                          const startAngle = idx * angle;
                          const endAngle = (idx + 1) * angle;
                          const radStart = (startAngle * Math.PI) / 180;
                          const radEnd = (endAngle * Math.PI) / 180;
                          const x1 = 50 + 45 * Math.cos(radStart);
                          const y1 = 50 + 45 * Math.sin(radStart);
                          const x2 = 50 + 45 * Math.cos(radEnd);
                          const y2 = 50 + 45 * Math.sin(radEnd);
                          const pathStr = `M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`;
                          
                          return (
                            <path 
                              key={idx}
                              d={pathStr}
                              fill={eaten ? '#FFA726' : '#FFECB3'}
                              stroke="#D84315"
                              strokeWidth="1.5"
                              cursor="pointer"
                              className="transition-all hover:opacity-90"
                              onClick={() => toggleCakeSlice(idx)}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-md">
                          بسبوسة منى
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-sky-100 flex flex-col items-center justify-center min-w-[200px] shadow-sm">
                      <span className="text-xs font-black text-gray-500 mb-1">الأجزاء المأكولة بلونها الذهبي:</span>
                      <div className="flex items-center gap-1.5 justify-center mb-3">
                        <span className="text-3xl font-black text-yellow-600">
                          {story4SlicesEaten.filter(x => x).length}
                        </span>
                        <span className="text-gray-400 font-bold">من أصل</span>
                        <span className="text-3xl font-black text-gray-700">٨ أجزاء</span>
                      </div>
                      <div className="text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-xl font-bold w-full text-center border border-sky-100">
                        الكسر الرياضي الحالي: {story4SlicesEaten.filter(x => x).length} / ٨
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STORY 5 INTERACTIVE ELEMENT */}
              {currentStory.id === 5 && (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-xs font-black text-rose-650 block mb-1">⏰ تقدير الزمن لـ غليان الجبنة وتجهيز الفناجين:</span>
                    <p className="text-gray-400 text-[11px]">البدء الساعة ٤:١٥ والتحضير ٣٥ دقيقة. اسحب شريط الزمن المالي للتعديل:</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-center w-full max-w-md">
                    {/* Retro Analog Clock face SVG updated dynamically */}
                    <div className="relative w-36 h-36 bg-white rounded-full border-4 border-rose-500 shadow-md flex items-center justify-center">
                      <div className="absolute top-1 text-[10px] font-black text-gray-400">١٢</div>
                      <div className="absolute right-1.5 text-[10px] font-black text-gray-400">٣</div>
                      <div className="absolute bottom-1 text-[10px] font-black text-gray-400">٦</div>
                      <div className="absolute left-1.5 text-[10px] font-black text-gray-400">٩</div>
                      {/* Hours Hand fixed on 4 or near 5 */}
                      <div 
                        className="absolute h-10 w-1 bg-gray-800 roundedorigin-bottom"
                        style={{
                          transform: `rotate(${120 + (story5ClockSliderValue / 60) * 30}deg)`,
                          transformOrigin: 'bottom center',
                          bottom: '50%'
                        }}
                      />
                      {/* Minutes Hand dynamic based on slider */}
                      <div 
                        className="absolute h-14 w-0.5 bg-rose-600 rounded origin-bottom"
                        style={{
                          transform: `rotate(${story5ClockSliderValue * 6}deg)`,
                          transformOrigin: 'bottom center',
                          bottom: '50%'
                        }}
                      />
                      <div className="w-3 h-3 bg-rose-700 rounded-full z-10" />
                    </div>

                    <div className="flex-1 space-y-3 text-right w-full">
                      <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                        <span>وقت التحضير المضاف:</span>
                        <span className="text-rose-600 font-black text-sm">{story5ClockSliderValue} دقيقة</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        value={story5ClockSliderValue}
                        onChange={(e) => {
                          soundEffects.playPop();
                          setStory5ClockSliderValue(parseInt(e.target.value, 10));
                        }}
                        className="w-full accent-rose-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px] text-gray-450">
                        <span>٠ د</span>
                        <span>٣٠ د</span>
                        <span>٦٠ د</span>
                      </div>
                      
                      <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-2xl text-center">
                        <span className="text-xs font-black text-rose-700">الوقت المحدد على الساعة الكردفانية: </span>
                        <span className="text-sm font-extrabold text-blue-700 border-b-2 border-blue-300">٤:{story5ClockSliderValue.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Interactive choices grid */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-2xl flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-500 shrink-0" />
                <span className="text-xs font-black text-gray-700 select-none">
                  {currentStory.mathPrompt}
                </span>
              </div>

              <div id="choices-grid" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStory.choices.map((choice, index) => {
                  const isSelected = selectedChoice === choice;
                  const isChoiceCorrect = choice === currentStory.correctAnswer;
                  
                  let choiceStyle = "border-gray-200 hover:border-pink-300 hover:bg-pink-50/20";
                  let badge = null;

                  if (selectedChoice) {
                    if (isSelected) {
                      choiceStyle = isChoiceCorrect 
                        ? "bg-green-100 border-green-500 text-green-800" 
                        : "bg-red-100 border-red-500 text-red-800";
                      badge = isChoiceCorrect 
                        ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-650 shrink-0" />;
                    } else if (isChoiceCorrect) {
                      choiceStyle = "bg-green-50 border-green-300 text-green-700 opacity-90";
                    } else {
                      choiceStyle = "opacity-45 border-gray-150 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={index}
                      disabled={!!selectedChoice}
                      onClick={() => handleChoiceSelect(choice)}
                      className={`text-right p-4 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-between gap-3 active:translate-y-0.5 focus:outline-none ${choiceStyle}`}
                    >
                      <span>{choice}</span>
                      {badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Back / Next controls in book page */}
            <div className="flex items-center justify-between gap-4 border-t-2 border-gray-100 pt-5 mt-6">
              <button
                onClick={prevStory}
                disabled={currentStoryIndex === 0}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-black flex items-center gap-1.5 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 ml-1" /> القصة السابقة
              </button>

              <div className="flex gap-1">
                {stories.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEffects.playBeep();
                      setCurrentStoryIndex(idx);
                    }}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${idx === currentStoryIndex ? 'bg-pink-600 w-7' : 'bg-gray-200 hover:bg-gray-300'}`}
                  />
                ))}
              </div>

              <button
                onClick={nextStory}
                className="px-5 py-3 rounded-xl bg-pink-500 text-white text-sm font-black flex items-center gap-1.5 transition-all hover:bg-pink-600 shadow-md shadow-pink-200"
              >
                {currentStoryIndex === stories.length - 1 ? 'البداية من جديد 🔄' : (
                  <>القصة التالية <ChevronLeft className="w-4 h-4 mr-1" /></>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* LEFT COLUMN (Lg: 4 cols): Intelligent Companion Feedback Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6" id="storybook-companion">
          
          {/* Active Tutoring / Interactive Correction Assistant */}
          <div className="bg-white rounded-[35px] p-5 shadow-xl border-4 border-yellow-300 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                <div className="w-10 h-10 bg-yellow-450 text-white rounded-full flex items-center justify-center text-xl animate-bounce">
                  💡
                </div>
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-gray-800">مرشد بخت الرضا المصور</h3>
                  <p className="text-[10px] text-gray-400 font-bold">صحّح مفاهيمك الرياضية بالقصة والبيئة</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showExplanation ? (
                  <motion.div
                    key="explanation-yes"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    <div className={`p-4 rounded-2xl flex items-center gap-3 border ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {isCorrect ? (
                        <>
                          <Smile className="w-8 h-8 text-green-600 shrink-0" />
                          <div>
                            <div className="font-black text-sm">ممتاز وصحيح يا مبدع!</div>
                            <p className="text-[11px] font-semibold text-green-600">جوابك رائع، لقد حصدت نجوم المعرفة المنهجية!</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-8 h-8 text-red-650 shrink-0 animate-pulse" />
                          <div>
                            <div className="font-black text-sm">أوووبس! الإجابة غير دقيقة</div>
                            <p className="text-[11px] font-semibold text-red-500">لا تحزن يا ذكي، حسون يساعدك بالتوضيح الدقيق بالأسفل!</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                      <div className="text-pink-650 font-black text-xs flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-pink-500" /> شرح الأستاذ حسون للقصة:
                      </div>
                      <p className="text-gray-650 font-bold text-xs leading-relaxed text-justify">
                        {currentStory.explanation}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-3.5 rounded-2xl text-center space-y-1">
                      <span className="text-lg">🌴🌾🇸🇩</span>
                      <p className="text-gray-700 font-extrabold text-xs">
                        الرياضيات تحيط بك في كورتي ومروي والدندر والخرطوم والأبيض! استكشف جمال بلادنا في كل تمرين.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="explanation-no"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-6 space-y-4"
                  >
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-4xl shadow-inner border border-yellow-105 animate-pulse">
                      🤔
                    </div>
                    <div>
                      <h4 className="font-black text-gray-700 text-sm">هل حزرت الإجابة المناسبة للقصة؟</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        اقرأ قصة التلميذ السوداني الجميلة بتمعن، واستمع لصوت حسون، ثم اختر إحدى الإجابات لفتح لوحة الشرح والتوضيح من الأستاذ حسون مباشرة!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Small info box about the curriculum */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="bg-[#6C63FF]/5 rounded-2xl p-3 border border-[#6C63FF]/10 text-center">
                <span className="text-[10px] text-[#6C63FF] font-black uppercase tracking-wider block">ثقافة وهوية سودانية</span>
                <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                  تطبيقات وقصص مستوحاة من البيئة اليومية السودانية لترسيخ محبة العلم.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
