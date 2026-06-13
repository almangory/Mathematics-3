import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, Check, Heart, Award, RefreshCw, Star } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GeometryGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface ShapeCard {
  id: string;
  name: string;
  desc: string;
  svg: React.ReactNode;
}

export default function GeometryGame({ onBack, onAddStars }: GeometryGameProps) {
  const [stars, setStars] = useState(0);
  const [activeStep, setActiveOp] = useState<'match' | 'definitions'>('match');

  // Match shape puzzle state
  const shapesList: ShapeCard[] = [
    { 
      id: 'point', 
      name: 'نقطة', 
      desc: 'أثر يتركه القلم على الورق الممثّل هنا بالحرف (أ)',
      svg: (
        <svg className="w-24 h-24 stroke-amber-955 fill-transparent" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="8" className="fill-rose-500 stroke-none" />
          <text x="50" y="32" className="fill-gray-700 font-bold text-lg text-center" textAnchor="middle">أ</text>
        </svg>
      )
    },
    { 
      id: 'segment', 
      name: 'قطعة مستقيمة', 
      desc: 'لها نقطة بداية ونقطة نهاية محددين (أ ب)',
      svg: (
        <svg className="w-24 h-24 stroke-rose-500 stroke-4 fill-none" viewBox="0 0 100 100">
          <line x1="20" y1="50" x2="80" y2="50" strokeLinecap="round" />
          <circle cx="20" cy="50" r="5" className="fill-amber-800" />
          <circle cx="80" cy="50" r="5" className="fill-amber-800" />
          <text x="20" y="38" className="fill-gray-700 font-bold text-sm" textAnchor="middle">أ</text>
          <text x="80" y="38" className="fill-gray-700 font-bold text-sm" textAnchor="middle">ب</text>
        </svg>
      )
    },
    { 
      id: 'triangle', 
      name: 'مثلث', 
      desc: 'شكل ذو ثلاثة أضلاع وثلاث قطع مستقيمة متصلة',
      svg: (
        <svg className="w-24 h-24 stroke-sky-500 stroke-4 fill-sky-100" viewBox="0 0 100 100">
          <polygon points="50,20 20,80 80,80" strokeLinejoin="round" />
          <text x="50" y="15" className="fill-gray-700 font-bold text-xs" textAnchor="middle">أ</text>
          <text x="14" y="86" className="fill-gray-700 font-bold text-xs" textAnchor="middle">ب</text>
          <text x="86" y="86" className="fill-gray-700 font-bold text-xs" textAnchor="middle">جـ</text>
        </svg>
      )
    },
    { 
      id: 'rectangle', 
      name: 'مستطيل', 
      desc: 'شكل رباعي فيه كل ضلعين متقابلين متساويين في الطول',
      svg: (
        <svg className="w-24 h-24 stroke-emerald-500 stroke-4 fill-emerald-100" viewBox="0 0 100 100">
          <rect x="15" y="30" width="70" height="40" rx="4" />
          <text x="12" y="27" className="fill-gray-700 font-bold text-xs">جـ</text>
          <text x="85" y="27" className="fill-gray-700 font-bold text-xs">د</text>
          <text x="12" y="85" className="fill-gray-700 font-bold text-xs">ب</text>
          <text x="85" y="85" className="fill-gray-700 font-bold text-xs">أ</text>
        </svg>
      )
    },
    { 
      id: 'square', 
      name: 'مربع', 
      desc: 'شكل رباعي جميع أضلاعه الأربعة متساوية تماماً في الطول',
      svg: (
        <svg className="w-24 h-24 stroke-amber-500 stroke-4 fill-amber-100" viewBox="0 0 100 100">
          <rect x="25" y="25" width="50" height="50" rx="4" />
          <text x="21" y="21" className="fill-gray-700 font-bold text-xs">م</text>
          <text x="78" y="21" className="fill-gray-700 font-bold text-xs">ن</text>
          <text x="21" y="83" className="fill-gray-700 font-bold text-xs">ل</text>
          <text x="78" y="83" className="fill-gray-700 font-bold text-xs">ك</text>
        </svg>
      )
    }
  ];

  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedMatchName, setSelectedMatchName] = useState<string | null>(null);
  const [completedMatches, setCompletedMatches] = useState<Record<string, string>>({}); // maps shape.id to matched name
  const [matchFeedback, setMatchFeedback] = useState('انقر على الرسم الهندسي، ثم انقر على الكلمة الصحيحة المطابقة له في اليسار لتكشف سره!');

  // Definitions Game State (Page 113, 114)
  const definitionsList = [
    { text: 'شكل رباعي فيه كل ضلعين متقابلين متساويان في الطول.', ans: 'مستطيل' },
    { text: 'شكل رباعي جميع أضلاعه الأربعة متساوية ولها نفس الطول.', ans: 'مربع' },
    { text: 'شكل ذو ثلاثة أضلاع وثلاث زوايا.', ans: 'مثلث' },
    { text: 'لا نهاية لأطرافها ولها طول محدد وتكتب أ ب.', ans: 'قطعة مستقيمة' }
  ];

  const [activeDefIdx, setActiveDefIdx] = useState(0);
  const [defFeedback, setDefFeedback] = useState('');
  const [isDefSuccess, setIsDefSuccess] = useState<boolean | null>(null);

  const handleShapeSelect = (shapeId: string) => {
    soundEffects.playBeep();
    if (completedMatches[shapeId]) return;
    setSelectedShape(shapeId);
    checkMatch(shapeId, selectedMatchName);
  };

  const handleNameSelect = (name: string) => {
    soundEffects.playBeep();
    // Check if name is already matched
    if (Object.values(completedMatches).includes(name)) return;
    setSelectedMatchName(name);
    checkMatch(selectedShape, name);
  };

  const checkMatch = (shapeId: string | null, name: string | null) => {
    if (!shapeId || !name) return;

    const shape = shapesList.find(s => s.id === shapeId);
    if (shape && shape.name === name) {
      soundEffects.playStar();
      setCompletedMatches(prev => ({ ...prev, [shapeId]: name }));
      setMatchFeedback(`رائع! تطابق صحيح: رسم الـ (${name}) يذكرنا بالصفحة ١١٢-١١٤ من الكتاب. ${shape.desc}!`);
      setSelectedShape(null);
      setSelectedMatchName(null);
      setStars(prev => prev + 1);
      onAddStars(2);
    } else {
      soundEffects.playError();
      setMatchFeedback(`للأسف، هذا الرسم لا يعبّر عن (${name}). حاول اختيار اسم هندسي آخر متطابق!`);
      setSelectedShape(null);
      setSelectedMatchName(null);
    }
  };

  const handleVerifyDefinition = (userAns: string) => {
    const q = definitionsList[activeDefIdx];
    if (userAns === q.ans) {
      soundEffects.playCorrect();
      setIsDefSuccess(true);
      setDefFeedback('إجابة نموذجية ممتازة! أنت تحفظ التعاريف الهندسية للوزارة بمهارة كبرى! ⭐');
      setStars(prev => prev + 1);
      onAddStars(5);
    } else {
      soundEffects.playError();
      setIsDefSuccess(false);
      setDefFeedback('إجابة غير صحيحة. اقرأ شروط الشكل وأضلاعه لتحدد نوعه الصحيح.');
    }
  };

  const nextDefinition = () => {
    soundEffects.playBeep();
    setIsDefSuccess(null);
    setDefFeedback('');
    setActiveDefIdx(prev => (prev + 1) % definitionsList.length);
  };

  const resetMatchGame = () => {
    soundEffects.playBeep();
    setCompletedMatches({});
    setSelectedShape(null);
    setSelectedMatchName(null);
    setMatchFeedback('انقر على الرسم الهندسي، ثم انقر على الكلمة الصحيحة المطابقة له في اليسار لتكشف سره!');
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
          📐 مهندس الأشكال الهندسية والخطوط
        </h2>
        <div className="flex items-center gap-2 bg-emerald-700 bg-opacity-30 px-4 py-1.5 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-bold">{stars} ⭐</span>
        </div>
      </div>

      <div className="p-6">
        {/* Sub games buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { soundEffects.playBeep(); setActiveOp('match'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              activeStep === 'match' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            🧩 بازل مطابقة الرسوم والأسماء
          </button>
          <button
            onClick={() => { soundEffects.playBeep(); setActiveOp('definitions'); }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
              activeStep === 'definitions' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            📜 تحدّي مميزات وتعاريف الهندسة
          </button>
        </div>

        {/* Storyboard guide */}
        <div className="bg-emerald-50 border-2 border-emerald-150 rounded-2xl p-4 flex items-start gap-3 mb-6 text-right text-sm">
          <span className="text-4xl animate-bounce">👷</span>
          <div className="flex-1">
            <h4 className="font-black text-emerald-800 mb-1">المهندس حسّون البناء:</h4>
            <p className="text-emerald-700 leading-relaxed">
              مرحباً بك يا صديقي الصغير المعمار! الرسوم الهندسية حولنا في كل مكان في الغابة والبيت. 
              هل يمكنك تمييز الأشكال الثنائية والخطوط والنقاط (مربع، مستطيل، مثلث) لنبني مدرستنا؟
            </p>
          </div>
        </div>

        {activeStep === 'match' ? (
          <div>
            <div className="text-center font-bold text-orange-800 mb-4 bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-sm">
              {matchFeedback}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start my-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {/* Left Column: Visual Svg Cards */}
              <div className="space-y-4">
                <h4 className="text-center font-bold text-gray-700 text-sm mb-2">أشكال هندسية مرسومة</h4>
                <div className="grid grid-cols-2 gap-4">
                  {shapesList.map((shape) => {
                    const isMatched = !!completedMatches[shape.id];
                    const isSelected = selectedShape === shape.id;

                    return (
                      <div
                        key={shape.id}
                        onClick={() => handleShapeSelect(shape.id)}
                        className={`p-4 bg-white rounded-2xl border-4 flex flex-col items-center justify-center cursor-pointer shadow transition-all transform hover:scale-105 ${
                          isMatched 
                            ? 'border-emerald-500 bg-emerald-50 opacity-60' 
                            : isSelected 
                            ? 'border-amber-400 bg-amber-50' 
                            : 'border-white hover:border-gray-300'
                        }`}
                      >
                        {shape.svg}
                        {isMatched && (
                          <div className="mt-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> تم المطابقة ({shape.name})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Name items to click */}
              <div className="space-y-4">
                <h4 className="text-center font-bold text-gray-700 text-sm mb-2">الكلمات والمصطلحات</h4>
                <div className="flex flex-col gap-3">
                  {['مربع', 'مستطيل', 'مثلث', 'قطعة مستقيمة', 'نقطة'].map((name) => {
                    const isMatched = Object.values(completedMatches).includes(name);
                    const isSelected = selectedMatchName === name;

                    return (
                      <button
                        key={name}
                        onClick={() => handleNameSelect(name)}
                        disabled={isMatched}
                        className={`w-full py-4 text-center rounded-2xl font-black text-lg border-2 shadow transition-all ${
                          isMatched 
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60 cursor-not-allowed' 
                            : isSelected 
                            ? 'bg-amber-400 border-amber-500 text-amber-950 font-extrabold' 
                            : 'bg-white border-sky-100 text-sky-850 hover:bg-sky-50'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                {Object.keys(completedMatches).length === shapesList.length && (
                  <div className="text-center pt-8">
                    <span className="text-4xl block mb-2 animate-bounce">🏆🎉</span>
                    <h5 className="font-black text-emerald-800 text-lg mb-4">تهانينا! لقد طابقت جميع الرسوم الهندسية بذكاء!</h5>
                    <button
                      onClick={resetMatchGame}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-full text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> إعادة اللعب من جديد
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Textbook Definitions challenge (Page 113, 114) */}
            <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-200 text-center max-w-lg mx-auto">
              <span className="text-sm font-bold text-sky-600 block mb-1">اقرأ الوصف بدقة ثم اضغط على الشكل المطابق:</span>
              <div className="bg-white border-2 border-sky-200 rounded-2xl p-6 font-extrabold text-lg text-sky-950 shadow-inner mb-6">
                💡 &quot;{definitionsList[activeDefIdx].text}&quot;
              </div>

              {/* Multiple Choice definitions buttons */}
              <div className="grid grid-cols-2 gap-4 my-4 max-w-md mx-auto">
                {['مربع', 'مستطيل', 'مثلث', 'قطعة مستقيمة'].map((ans) => (
                  <button
                    key={ans}
                    onClick={() => handleVerifyDefinition(ans)}
                    className="py-3 px-4 bg-white hover:bg-sky-50 border-2 border-sky-100 text-sky-850 hover:border-sky-300 font-extrabold rounded-xl transition-all shadow text-sm active:scale-95"
                  >
                    {ans} 📐
                  </button>
                ))}
              </div>

              {/* Feedback description results */}
              <div className="flex flex-col items-center gap-4 mt-6">
                {defFeedback && (
                  <div className={`p-4 rounded-xl text-right text-sm leading-relaxed border-2 ${
                    isDefSuccess === null ? 'bg-sky-50 border-sky-200 text-sky-800' : isDefSuccess ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'
                  }`}>
                    {defFeedback}
                  </div>
                )}

                {isDefSuccess && (
                  <button
                    onClick={nextDefinition}
                    className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold p-2 px-6 rounded-full shadow text-sm transition-transform active:scale-95"
                  >
                    التالي <RefreshCw className="w-3.5 h-3.5" />
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
