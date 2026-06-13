import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ActiveUnit } from './types';
import AbacusGame from './components/AbacusGame';
import MultiplicationGame from './components/MultiplicationGame';
import DivisionGame from './components/DivisionGame';
import FractionLab from './components/FractionLab';
import ClockGame from './components/ClockGame';
import GeometryGame from './components/GeometryGame';
import AiTutor from './components/AiTutor';
import ExamsGame from './components/ExamsGame';
import { soundEffects } from './utils/audio';
import { Trophy, Star, Sparkles, BookOpen, GraduationCap, ChevronLeft, Volume2 } from 'lucide-react';

export default function App() {
  const [activeUnit, setActiveUnit] = useState<ActiveUnit>('dashboard');
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('sudan_math_stars_g3');
    return saved ? parseInt(saved, 10) : 10; // start kids with 10 stars!
  });

  useEffect(() => {
    localStorage.setItem('sudan_math_stars_g3', stars.toString());
  }, [stars]);

  const addStars = (amount: number) => {
    setStars(prev => prev + amount);
  };

  const handleNavigate = (unit: ActiveUnit) => {
    soundEffects.playBeep();
    setActiveUnit(unit);
  };

  // Speaks dashboard welcome prompt in Sudanese teacher tone
  const speakWelcome = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        "مرحباً بك يا بطل الصف الثالث الابتدائي في كتاب الرياضيات التفاعلي الممتع! اختر مغامرة لنلعب ونتعلم معاً ونحصد النجوم الذهبية الرائعة!"
      );
      msg.lang = 'ar-SD';
      window.speechSynthesis.speak(msg);
    }
  };

  // Svg illustrations representing the book style cover (pencil, clock, abacus)
  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 text-right" dir="rtl">
      
      {/* Header Navigation Bar matching Artistic Flair */}
      <header className="h-24 bg-[#6C63FF] text-white flex items-center justify-between px-6 md:px-10 rounded-[40px] shadow-lg border-b-8 border-yellow-400" dir="rtl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
            <span className="text-2xl font-bold">📚</span>
          </div>
          <div>
            <span className="text-[10px] text-yellow-300 font-bold block leading-none">وزارة التربية والتعليم - تلميذ الصف ٣</span>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">مغامرات مدينة الرياضيات 🇸🇩</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white text-[#6C63FF] px-4 py-1.5 rounded-full border-2 border-yellow-400 shadow-md">
          <span className="font-black text-base md:text-xl">⭐ {stars}</span>
          <span className="text-xs font-bold text-[#6C63FF]">نجمـة</span>
        </div>
      </header>

      {/* Main split interactive panel: Left story character & Right Game Grid */}
      <main className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Character & Story */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-[40px] p-6 shadow-xl border-8 border-[#FF6584] flex-1 flex flex-col items-center justify-center text-center relative">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-400 rounded-2xl rotate-12 flex items-center justify-center text-3xl shadow-lg border-4 border-white">🌟</div>
            <div className="w-32 h-32 bg-gray-50 rounded-full mb-4 border-4 border-dashed border-[#6C63FF] flex items-center justify-center text-6xl shadow-inner">
              🦜
            </div>
            <h2 className="text-2xl font-black text-[#6C63FF] mb-2 italic">مرحباً يا بطل!</h2>
            <p className="text-gray-650 font-bold leading-relaxed text-sm">
              أنا رفيقك "حسون المساعد الذكي"! هل أنت مستعد للعب واكتشاف دروس الأرقام، وجداول الضرب، وباقي القسمة، والبيتزا للكسور وساعات الزمن في كتابنا الجميل؟
            </p>
            <button 
              onClick={speakWelcome}
              className="mt-6 bg-[#FF6584] text-white px-6 py-3 rounded-2xl text-base font-black shadow-[0_6px_0_#d14d68] hover:shadow-[0_4px_0_#d14d68] active:translate-y-1 active:shadow-none transition-all w-full flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5" /> استمع لترحيب حسون
            </button>

            <button 
              onClick={() => handleNavigate('tutor')}
              className="mt-3 bg-[#6C63FF] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-[0_6px_0_#5249cf] hover:shadow-[0_4px_0_#5249cf] active:translate-y-1 active:shadow-none transition-all w-full flex items-center justify-center gap-1"
            >
              💬 اسأل حسون بالذكاء الاصطناعي
            </button>

            <button 
              onClick={() => handleNavigate('exams')}
              className="mt-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3.5 rounded-2xl text-sm font-black shadow-[0_6px_0_#9a3412] hover:shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition-all w-full flex items-center justify-center gap-1.5 animate-pulse"
            >
              🏆 صالة الامتحانات والاختبارات الكبرى
            </button>
          </div>
        </div>

        {/* Right Panel: Game and Lesson card grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Abacus - Theme teal color */}
          <div 
            onClick={() => handleNavigate('abacus')}
            className="bg-[#4DB6AC] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">🧮</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة الأولى</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">مغامرة العداد والأعداد</h3>
              <p className="text-white/90 text-sm font-semibold select-none">قراءة الأعداد حتى ٩٩٩٩ وتمثيلها على العداد الخشبي وكتابتها بالكلمات</p>
            </div>
            <button className="bg-white text-[#4DB6AC] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              العب الآن 🎮
            </button>
          </div>

          {/* Card 2: Multiplication - Theme orange color */}
          <div 
            onClick={() => handleNavigate('multiplication')}
            className="bg-[#FFA726] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">🎈</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة الثانية</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">بالونات جدول الضرب</h3>
              <p className="text-white/90 text-sm font-semibold select-none">تحدي فرقعة بالونات الضرب في ٧ و ٨ و ٩ وقنابل الصفر والواحد!</p>
            </div>
            <button className="bg-white text-[#FFA726] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              فرقع البالونات 🎮
            </button>
          </div>

          {/* Card 3: Division - Theme purple color */}
          <div 
            onClick={() => handleNavigate('division')}
            className="bg-[#BA68C8] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">🍌</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة الثالثة</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">غابة القسمة العادلة</h3>
              <p className="text-white/90 text-sm font-semibold select-none">قسمة الفاكهة وحل مسائل القسمة بباق وبدون باق من الكتاب</p>
            </div>
            <button className="bg-white text-[#BA68C8] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              اقسم الموز بالعدل 🎮
            </button>
          </div>

          {/* Card 4: Fractions pizza - Theme blue color */}
          <div 
            onClick={() => handleNavigate('fractions')}
            className="bg-[#64B5F6] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">🍕</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة الرابعة</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">مختبر الكسور والبيتزا</h3>
              <p className="text-white/90 text-sm font-semibold select-none">تلوين أجزاء البيتزا، وتحديد البسط والمقام والكسور المتكافئة</p>
            </div>
            <button className="bg-white text-[#64B5F6] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              افتح مختبر الكسور 🎮
            </button>
          </div>

          {/* Card 5: Clock and Time - Theme coral/pink color */}
          <div 
            onClick={() => handleNavigate('clock')}
            className="bg-[#FF6584] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">⏰</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة الخامسة</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">دوران الساعة والزمن</h3>
              <p className="text-white/90 text-sm font-semibold select-none">تحريك شوكة الدقائق والساعات وقراءة الوقت بالعبارات الصحيحة</p>
            </div>
            <button className="bg-white text-[#FF6584] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              اضبط الساعات 🎮
            </button>
          </div>

          {/* Card 6: Geometry - Theme teal color */}
          <div 
            onClick={() => handleNavigate('geometry')}
            className="bg-[#4DB6AC] rounded-[40px] p-6 shadow-xl border-4 border-white flex flex-col justify-between group cursor-pointer hover:scale-[1.01] transition-transform text-white min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl">📐</div>
              <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full font-bold">الوحدة السادسة</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">أشكال الهندسة والخطوط</h3>
              <p className="text-white/90 text-sm font-semibold select-none">اكتشف المثلث، المستطيل، المربع وحل تحدي التعاريف والمطابقة</p>
            </div>
            <button className="bg-white text-[#4DB6AC] py-2 rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              ابدأ البناء الهندسي 🎮
            </button>
          </div>

        </div>
      </main>

      {/* Bottom Achievement Bar styled like the mock design */}
      <footer className="bg-[#343434] bg-opacity-95 rounded-[40px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t-8 border-yellow-400 shadow-inner text-white">
        <div className="text-yellow-400 font-black text-xl italic whitespace-nowrap">🏆 لوحة شرف فرسان الأرقام:</div>
        <div className="flex-1 flex flex-wrap gap-4 justify-center md:justify-start">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl">🥇</div>
            <div>
              <div className="text-xs font-bold text-gray-300">البطل فواز</div>
              <div className="text-lg font-black leading-none">12,500 ⭐</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 opacity-80">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-xl">🥈</div>
            <div>
              <div className="text-xs font-bold text-gray-300">البطلة مزن</div>
              <div className="text-lg font-black leading-none">10,400 ⭐</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 opacity-60">
            <div className="w-10 h-10 bg-orange-700 rounded-full flex items-center justify-center text-xl">🥉</div>
            <div>
              <div className="text-xs font-bold text-gray-300">البطل مرتضى</div>
              <div className="text-lg font-black leading-none">9,800 ⭐</div>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-gray-450 leading-relaxed text-center md:text-right">
          المركز القومي للمناهج والبحث التربوي - بخت الرضا © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );

  const renderActiveUnit = () => {
    switch (activeUnit) {
      case 'abacus':
        return <AbacusGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'multiplication':
        return <MultiplicationGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'division':
        return <DivisionGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'fractions':
        return <FractionLab onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'clock':
        return <ClockGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'geometry':
        return <GeometryGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'tutor':
        return <AiTutor onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      case 'exams':
        return <ExamsGame onBack={() => handleNavigate('dashboard')} onAddStars={addStars} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-35 select-none py-8 font-sans antialiased text-gray-800">
      <main className="container mx-auto px-4 max-w-6xl">
        {renderActiveUnit()}
      </main>
    </div>
  );
}
