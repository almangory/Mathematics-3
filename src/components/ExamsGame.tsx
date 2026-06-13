import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';
import { toArabicNumerals } from '../utils/mathHelpers';
import { ArrowLeft, BookOpen, Trophy, Star, ShieldQuestion, HelpCircle, Check, X, Award, CheckCircle2, RefreshCw } from 'lucide-react';

interface ExamsGameProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

// Extensive pool of textbook-accurate questions across the whole Grade 3 syllabus
const QUESTIONS_DATABASE: Record<string, Question[]> = {
  // --- Unit 1: Numbers & Addition/Subtraction ---
  'u1_l1': [ // Lesson 1: 4-digit numbers and reading
    {
      id: 'u1_l1_q1',
      text: 'ما هو التمثيل العددي لـ "ثلاثة آلاف وخمسمئة وثلاثة وثمانون" (٣ آلاف و ٥ مئات و ٨ عشرات و ٣ آحاد)؟',
      options: ['٣٥٨٣', '٣٨٥٣', '٥٣٨٣', '٣٥٣٨'],
      correctAnswer: '٣٥٨٣',
      explanation: 'الكتاب المدرسي صفحة ٧: ٣ آحاد، ٨ عشرات، ٥ مئات، ٣ آلاف تُكتب بالعمل الإملائي الترقيمي: ٣٥٨٣.'
    },
    {
      id: 'u1_l1_q2',
      text: 'كيف نقرأ العدد الكلي ١٥١٠ بالطريقة السودانية الجميلة؟',
      options: ['ألف وخمسمئة وعشرة', 'ألف ومئة وخمسون', 'عشرة وألف وخمس مئة', 'ألف وخمسمئة وخمسة'],
      correctAnswer: 'ألف وخمسمئة وعشرة',
      explanation: 'الكتاب المدرسي صفحة ٦: ١٥١٠ يُقرأ: ألف وخمسمئة وعشرة أو عشرة وخمسمئة وألف.'
    },
    {
      id: 'u1_l1_q3',
      text: 'ما هي خانة الرقم ٤ في العدد الكلي ٤٣٠٣؟',
      options: ['الألوف', 'المئات', 'العشرات', 'الآحاد'],
      correctAnswer: 'الألوف',
      explanation: 'الرقم ٤ يقع في خانة الآلاف (الألوف) وقيمته المنزلية ٤٠٠٠.'
    },
    {
      id: 'u1_l1_q4',
      text: 'إذا كان لدينا: ٧ آحاد، ٩ عشرات، ٤ مئات، ٢ آلاف. ما هو العدد الإجمالي؟',
      options: ['٢٤٩٧', '٢٩٤٧', '٧٩٤٢', '٢٤٧٩'],
      correctAnswer: '٢٤٩٧',
      explanation: 'الكتاب صفحة ٧: ٧ آحاد + ٩٠ عشرات + ٤٠٠ مئة + ٢٠٠٠ ألف = ٢٤٩٧.'
    }
  ],
  'u1_l2': [ // Lesson 2: Multiples
    {
      id: 'u1_l2_q1',
      text: 'أكمل النمط التالي لمضاعفات المئة: ٣٠٠، ٤٠٠، ٥٠٠، ٦٠٠، ...',
      options: ['٧٠٠', '٨٠٠', '٣٠٠', '١٠٠٠'],
      correctAnswer: '٧٠٠',
      explanation: 'مضاعفات المائة تزداد بمقدار ١٠٠ في كل خطوة.'
    },
    {
      id: 'u1_l2_q2',
      text: 'ما هي مضاعفات العشرة التي تقع مباشرة بعد الرقم ٤٠ في النمط: ١٠، ٢٠، ٣٠، ٤٠، ...؟',
      options: ['٥٠', '٦٠', '٤٥', '١٠٠'],
      correctAnswer: '٥٠',
      explanation: 'الكتاب المدرسي الصفحة ٩: مضاعفات العشرة تزداد بمقدار ١٠ في كل مرة؛ بعد ٤٠ يأتي ٥٠.'
    },
    {
      id: 'u1_l2_q3',
      text: 'ما هي تسمية النمط التالي في الرياضيات: ١٠٠٠، ٢٠٠٠، ٣٠٠٠، ٤٠٠٠، ...؟',
      options: ['مضاعفات الألف', 'مضاعفات المائة', 'مضاعفات العشرة', 'الأرقام الفردية'],
      correctAnswer: 'مضاعفات الألف',
      explanation: 'الكتاب المدرسي صفحة ١٠: مضاعفات الألف وهي تبدأ من ألف، ألفان، ثلاثة آلاف، أربعة آلاف وهكذا.'
    }
  ],
  'u1_l3': [ // Lesson 3: Addition
    {
      id: 'u1_l3_q1',
      text: 'جد ناتج جمع مسألة الكتاب الإلزامية: ٤١٢٦ + ١٨٧٢',
      options: ['٥٩٩٨', '٥٩٩٩', '٦٠٠٠', '٤٩٩٨'],
      correctAnswer: '٥٩٩٨',
      explanation: 'الكتاب المدرسي الصفحة ١٢: ٦+٢=٨، ٢+٧=٩، ١+٨=٩، ٤+١=٥. والناتج هو ٥٩٩٨.'
    },
    {
      id: 'u1_l3_q2',
      text: 'أوجد حاصل جمع ما يلي: ٢٥٤٧ + ١٥٣٥ بالترتيب وباقي الجمع الكلي:',
      options: ['٤٠٨٢', '٤٠٨٠', '٣٠٨٢', '٤١٨٢'],
      correctAnswer: '٤٠٨٢',
      explanation: 'الكتاب المدرسي صفحة ١٣: ٧+٥=١٢ (٢ باليد ١)، ٤+٣+١=٨، ٥+٥=١٠ (٠ باليد ١)، ٢+١+١=٤. الناتج ٤٠٨٢.'
    },
    {
      id: 'u1_l3_q3',
      text: 'في تمرين بخت الرضا: ٦٣٩٥ + ١٥٢٤ أوجد المجموع:',
      options: ['٧٩١٩', '٧٩١٥', '٨٩١٩', '٧٨١٩'],
      correctAnswer: '٧٩١٩',
      explanation: 'الكتاب المدرسي صفحة ١٢: ٥+٤=٩، ٩+٢=١١ (١ باليد ١)، ٣+٥+١=٩، ٦+١=٧. حاصل الجمع ٧٩١٩.'
    }
  ],
  'u1_l4': [ // Lesson 4: Subtraction
    {
      id: 'u1_l4_q1',
      text: 'أطرح الأعداد التالية في تحدي الطرح: ٥٦٢٨ - ١٣١٣',
      options: ['٤٣١٥', '٤٣١٢', '٤٢١٥', '٥٣١٥'],
      correctAnswer: '٤٣١٥',
      explanation: 'الكتاب المدرسي الصفحة ١٤: ٨-٣=٥، ٢-١=١، ٦-٣=٣، ٥-١=٤. والناتج هو ٤٣١٥.'
    },
    {
      id: 'u1_l4_q2',
      text: 'احسب قيمة الطرح للمسألة من تمرين بخت الرضا: ٤٧٥٣ - ٢٦٤٨',
      options: ['٢١٠٥', '٢١٠٠', '٢٢٠٥', '٢١١٥'],
      correctAnswer: '٢١٠٥',
      explanation: 'الكتاب المدرسي الصفحة ١٤: ٣-٨ لا يمكن (تستلف من ٥)، ١٣-٨=٥، ٤-٤=٠، ٧-٦=١، ٤-٢=٢. والناتج ٢١٠٥.'
    },
    {
      id: 'u1_l4_q3',
      text: 'ما هو ناتج عملية الطرح الآتية: ٩٠٠٠ - ٢٩٩٩؟',
      options: ['٦٠٠١', '٦٠١١', '٧٠٠١', '٥٠٠١'],
      correctAnswer: '٦٠٠١',
      explanation: 'الكتاب المدرسي الصفحة ١٥: عند الاستلاف من أول خانة، تصبح المسألة ٨٩٩١٠ مخصوماً منها ونحصل على ٦٠٠١.'
    }
  ],

  // --- Unit 2: Multiplication ---
  'u2_l1': [ // Lesson 1: Multiplication by 1 and 0
    {
      id: 'u2_l1_q1',
      text: 'قاعدة الضرب في صفر: ما هو ناتج ٨ × ٠؟',
      options: ['٠', '٨', '٨٠', '١'],
      correctAnswer: '٠',
      explanation: 'قاعدة الكتاب المدرسي صفحة ١٧: أي عدد نضربه في صفر، يكون الناتج دائماً صفراً!'
    },
    {
      id: 'u2_l1_q2',
      text: 'قاعدة الضرب في واحد: ما هو ناتج ٦ × ١؟',
      options: ['٦', '٠', '١', '٦٠'],
      correctAnswer: '٦',
      explanation: 'قاعدة الكتاب صفحة ١٧: أي عدد نضربه في واحد، يكون الناتج الكلي هو نفس العدد!'
    }
  ],
  'u2_l2': [ // Lesson 2: Table 7
    {
      id: 'u2_l2_q1',
      text: 'ما هو ناتج ٧ × ٦؟',
      options: ['٤٢', '٣٥', '٤٩', '٤٨'],
      correctAnswer: '٤٢',
      explanation: 'الكتاب المدرسي صفحة ١٩: ٧ × ٦ = ٤٢.'
    },
    {
      id: 'u2_l2_q2',
      text: 'إذا كان ثمن القلم الواحد ٦ جنيهات، فما هو ثمن ٧ أقلام من نفس النوع؟',
      options: ['٤٢ جنيهاً', '٣٦ جنيهاً', '٤٨ جنيهاً', '٤٠ جنيهاً'],
      correctAnswer: '٤٢ جنيهاً',
      explanation: 'الكتاب صفحة ٢١ (تمرين ٢ مسألة ٤): ثمن الأقلام = ٦ × ٧ = ٤٢ جنيهاً.'
    },
    {
      id: 'u2_l2_q3',
      text: 'ما هو ناتج ٧ × ٨؟',
      options: ['٥٦', '٦٤', '٤٨', '٤٩'],
      correctAnswer: '٥٦',
      explanation: 'جدول الضرب للسبعة صفحة ٢٠: ٧ × ٨ = ٥٦.'
    }
  ],
  'u2_l3': [ // Lesson 3: Table 8
    {
      id: 'u2_l3_q1',
      text: 'ما هو ناتج ٨ × ٨؟',
      options: ['٦٤', '٥٦', '٧٢', '٤٨'],
      correctAnswer: '٦٤',
      explanation: 'الكتاب المدرسي صفحة ٢٣: ٨ × ٨ = ٦٤.'
    },
    {
      id: 'u2_l3_q2',
      text: 'ثمن المسطرة الواحدة ٨ جنيهات، كم تدفع ملاذ لشراء ٣ مساطر؟',
      options: ['٢٤ جنيهاً', '١٦ جنيهاً', '٣٢ جنيهاً', '٢٨ جنيهاً'],
      correctAnswer: '٢٤ جنيهاً',
      explanation: 'الكتاب المدرسي صفحة ٢٤ (تمرين ٣ مسألة ٤): ثمن الشراء = ٨ جنيهات × ٣ مساطر = ٢٤ جنيهاً.'
    },
    {
      id: 'u2_l3_q3',
      text: 'ما هو ناتج ٨ × ٩؟',
      options: ['٧٢', '٨١', '٦٤', '٦٣'],
      correctAnswer: '٧٢',
      explanation: 'جدول الضرب للثمانية صفحة ٢٣: ٨ × ٩ = ٧٢.'
    }
  ],
  'u2_l4': [ // Lesson 4: Table 9
    {
      id: 'u2_l4_q1',
      text: 'ما هو ناتج ٩ × ٩؟',
      options: ['٨١', '٧٢', '٩٠', '٧٩'],
      correctAnswer: '٨١',
      explanation: 'جدول ضرب التسعة صفحة ٢٦: ٩ × ٩ = ٨١.'
    },
    {
      id: 'u2_l4_q2',
      text: 'علبة الحلوى بها ٩ قطع طازجة، كم قطعة حلوى في ٧ علب مماثلة؟',
      options: ['٦٣ قطعة', '٥٤ قطعة', '٧٢ قطعة', '٨١ قطعة'],
      correctAnswer: '٦٣ قطعة',
      explanation: 'الكتاب المدرسي صفحة ٢٧ (تمرين ٤ مسألة ٢): ٩ قطع × ٧ علب = ٦٣ قطعة حلوى.'
    }
  ],
  'u2_l5_6': [ // Lessons 5 & 6: Multiples of 10 & 100
    {
      id: 'u2_l5_q1',
      text: 'ما هي قاعدة حاصل ضرب أي عدد في ١٠ أو مضاعفات الـ ١٠؟',
      options: ['نضع الصفر يميناً ثم نضرب الأرقام المتبقية', 'نحذف الصفر', 'نضيف واحداً للعدد', 'نقسم على ١٠'],
      correctAnswer: 'نضع الصفر يميناً ثم نضرب الأرقام المتبقية',
      explanation: 'الكتاب المدرسي صفحة ٣٠: نضع الصفر يميناً، ثم نضرب باقي الأعداد للحصول على النتيجة بسهولة.'
    },
    {
      id: 'u2_l5_q2',
      text: 'ما قيمة عملية الضرب الآتية: ٢٥ × ١٠؟',
      options: ['٢٥٠', '٢٥', '٥٢٠', '٢٥٠٠'],
      correctAnswer: '٢٥٠',
      explanation: 'مسألة من الكتاب المدرسي صفحة ٣٠: ٢٥ × ١٠ = ٢٥٠.'
    },
    {
      id: 'u2_l6_q1',
      text: 'ما قيمة المسألة: ٣٥ × ١٠٠ مئة؟',
      options: ['٣٥٠٠', '٣٥٠', '٣٥٠٠٠', '٥٣٠٠'],
      correctAnswer: '٣٥٠٠',
      explanation: 'الكتاب المدرسي صفحة ٣٢: حاصل ضرب ٣٥ في ١٠٠ نضع صفرين يميناً ليصبح الناتج ٣٥٠٠.'
    }
  ],
  'u2_l7': [ // Lesson 7: Distribution & 2-digit multiplication
    {
      id: 'u2_l7_q1',
      text: 'باستخدام خاصية التوزيع، أوجد ناتج: ٢٤ × ٥',
      options: ['١٢٠', '١٠٠', '١٣٠', '١٤٠'],
      correctAnswer: '١٢٠',
      explanation: 'الكتاب المدرسي صفحة ٣٦: ٢٤ × ٥ = (٢٠ + ٤) × ٥ = (٢٠ × ٥) + (٤ × ٥) = ١٠٠ + ٢٠ = ١٢٠.'
    },
    {
      id: 'u2_l7_q2',
      text: 'ما هو ناتج عملية الضرب المباشرة: ٣٤ × ٢؟',
      options: ['٦٨', '٨٦', '٦٤', '٣٦'],
      correctAnswer: '٦٨',
      explanation: 'الكتاب المدرسي صفحة ٣٨: نضرب الآحاد ثم العشرات: ٤×٢=٨، ٣×٢=٦، الناتج الكلي ٦٨.'
    },
    {
      id: 'u2_l7_q3',
      text: 'اشترت زينب ٣ كتب مفيدة، سعر الكتاب الواحد ٤٥ جنيهاً، كم دفعت زينب للبائع؟',
      options: ['١٣٥ جنيهاً', '١٢٥ جنيهاً', '١٤٠ جنيهاً', '١٣٠ جنيهاً'],
      correctAnswer: '١٣٥ جنيهاً',
      explanation: 'مسألة الكتاب صفحة ٣٩ (مسألة ٢): ثمن الكتب = ٤٥ × ٣ = ١٣٥ جنيهاً.'
    }
  ],

  // --- Unit 3: Division ---
  'u3_l1': [ // Lesson 1: Division by 7
    {
      id: 'u3_l1_q1',
      text: 'جد حاصل القسمة بالتساوي بدون باق: ٤٩ ÷ ٧',
      options: ['٧', '٦', '٨', '٩'],
      correctAnswer: '٧',
      explanation: 'الكتاب المدرسي صفحة ٤٦: لأن ٧ × ٧ = ٤٩، فإن ٤٩ ÷ ٧ = ٧ بدون أي باق.'
    },
    {
      id: 'u3_l1_q2',
      text: 'اشترت زينب حبلاً طوله ٧ أمتار بمبلغ ٤٢ جنيهاً، فكم ثمن المتر الواحد من الحبل؟',
      options: ['٦ جنيهات', '٧ جنيهات', '٨ جنيهات', '٥ جنيهات'],
      correctAnswer: '٦ جنيهات',
      explanation: 'الكتاب المدرسي صفحة ٤٦ (مسألة ٤): ثمن المتر الواحد = ٤٢ جنيهاً ÷ ٧ أمتار = ٦ جنيهات.'
    },
    {
      id: 'u3_l1_q3',
      text: 'ما هو ناتج قسمة ٥٠ ÷ ٧ والباقي المرتبط بها؟',
      options: ['٧ والباقي ١', '٧ والباقي ٢', '٦ والباقي ٨', '٧ وبدون باق'],
      correctAnswer: '٧ والباقي ١',
      explanation: 'الكتاب المدرسي صفحة ٤٧: لأن ٧ × ٧ + ١ = ٥٠، فإن الناتج هو ٧ والباقي ١.'
    }
  ],
  'u3_l2': [ // Lesson 2: Division outside division table
    {
      id: 'u3_l2_q1',
      text: 'أقسم بالخطوات الطويلة من الكتاب المدرسي: ٩٥٢ ÷ ٧',
      options: ['١٣٦', '١٣٥', '١٤٦', '١٢٦'],
      correctAnswer: '١٣٦',
      explanation: 'الكتاب المدرسي صفحة ٤٩-٥٠: بقسمة المئات ثم العشرات ثم الآحاد، نصل للناتج ١٣٦ بدون باق.'
    },
    {
      id: 'u3_l2_q2',
      text: 'كم دجاجة يضعها صاحب مزرعة في كل قفص إذا وزّع ٢١٠ دجاجة على ٧ أقفاص بالتساوي؟',
      options: ['٣٠ دجاجة', '٤٠ دجاجة', '٣٥ دجاجة', '٢٥ دجاجة'],
      correctAnswer: '٣٠ دجاجة',
      explanation: 'الكتاب المدرسي صفحة ٥٦ (تحدي مسائل لفظية): عدد الدجاج بالقفص = ٢١٠ ÷ ٧ = ٣٠ دجاجة.'
    }
  ],
  'u3_l3': [ // Lesson 3: Division by 8 & 9
    {
      id: 'u3_l3_q1',
      text: 'ما هو ناتج ٥٦ ÷ ٨؟',
      options: ['٧', '٨', '٦', '٩'],
      correctAnswer: '٧',
      explanation: 'الكتاب المدرسي الصفحة ٥٩: لأن ٨ × ٧ = ٥٦، فإن ناتج القسمة هو ٧.'
    },
    {
      id: 'u3_l3_q2',
      text: 'قسم بائع أقمشة لفة قماش طولها ٧٢ متراً إلى ٨ قطع متساوية في الطول، كم طول القطعة الواحدة؟',
      options: ['٩ أمتار', '٨ أمتار', '٧ أمتار', '١٠ أمتار'],
      correctAnswer: '٩ أمتار',
      explanation: 'الكتاب المدرسي صفحة ٥٨ (مسألة ٤): طول القطعة = ٧٢ ÷ ٨ = ٩ أمتار.'
    },
    {
      id: 'u3_l3_q3',
      text: 'تحدي القسمة عريضة الأرقام: ما ناتج ٨١٠ ÷ ٩؟',
      options: ['٩٠', '٨٠', '١٠٠', '٩'],
      correctAnswer: '٩٠',
      explanation: 'الكتاب المدرسي صفحة ٦٧: عدد الأيام التي تكفي لإنفاق ٨١٠ جنيه بمعدل ٩ جنيهات يومياً = ٨١٠ ÷ ٩ = ٩٠ يوماً.'
    }
  ],

  // --- Unit 4: Fractions ---
  'u4_l1': [ // Fractions Introduction / Equivalent
    {
      id: 'u4_l1_q1',
      text: 'الكسر الذي بسطه ١ ومقامه ٥ يُقرأ ويُسمى في السودان بـ:',
      options: ['خُمْس', 'نِصْف', 'رُبْع', 'سُدْس'],
      correctAnswer: 'خُمْس',
      explanation: 'الكتاب المدرسي الصفحة ٧٥: الكسر ذو البسط ١ والمقام ٥ يسمى الخمس.'
    },
    {
      id: 'u4_l1_q2',
      text: 'في الكسر ٢/٣ (ثلثان)، ماذا يسمى الرقم ٣ الذي يقع تحت خط الكسر؟',
      options: ['المقام', 'البسط', 'المعامل', 'الكسر الكلي'],
      correctAnswer: 'المقام',
      explanation: 'الكتاب المدرسي صفحة ٧٧: الرقم تحت الخط يسمى مقام الكسر، بينما الرقم فوق الخط يسمى بسط الكسر.'
    },
    {
      id: 'u4_l1_q3',
      text: 'أي من الكسور التالية يكافئ الكسر نصف (١/٢) وفقاً للكشف في صفحة ٨٣؟',
      options: ['٢/٤', '٢/٦', '١/٣', '٣/٥'],
      correctAnswer: '٢/٤',
      explanation: 'الكتاب المدرسي الصفحة ٨٣: بضرب البسط والمقام في ٢، نجد أن الكسر ١/٢ يكافئ تماماً ٢/٤.'
    }
  ],
  'u4_l2': [ // Equivalent and Simplifying & Operations
    {
      id: 'u4_l2_q1',
      text: 'اكتب الكسر الكلي التالي في أبسط صورة ممكنة: ١٢/١٦',
      options: ['٣/٤', '٢/٣', '١/٢', '٥/٦'],
      correctAnswer: '٣/٤',
      explanation: 'الكتاب المدرسي صفحة ٨٧: بالقسمة المشتركة على العامل ٤: ١٢ ÷ ٤ = ٣، ١٦ ÷ ٤ = ٤. أبسط صورة هي ٣/٤.'
    },
    {
      id: 'u4_l2_q2',
      text: 'أوجد حاصل جمع الكسرين متساويي المقامات التاليين: ٣/٨ + ٢/٨',
      options: ['٥/٨', '٥/١٦', '١/٨', '٥/٥'],
      correctAnswer: '٥/٨',
      explanation: 'الكتاب المدرسي صفحة ٩٣: نجمع البسطين ونبقي المقام ثابتاً كما هو: ٣+٢=٥، إذاً المجموع ٥/٨.'
    },
    {
      id: 'u4_l2_q3',
      text: 'احسب باقي طرح الكسرين التاليين: ٥/٦ - ٣/٦',
      options: ['٢/٦', '٢/١٢', '٨/٦', '١/٣'],
      correctAnswer: '٢/٦',
      explanation: 'الكتاب المدرسي صفحة ٩٥: نطرح البسطين ونبقي المقام ثابتاً: ٥-٣=٢، إذاً الباقي هو ٢/٦ (والذي يكافئ ثلث ١/٣).'
    }
  ],

  // --- Units 5 & 6: Measurement & Geometry ---
  'u5_l1': [ // Measurement (Page 97)
    {
      id: 'u5_l1_q1',
      text: 'ما هي وحدات قياس الطول التقليدية السودانية التي تم تدريبكم عليها في صفحة ٩٧؟',
      options: ['الميل، الياردة، القدم، البوصة', 'الكيلوجرام، الجرام', 'الساعة، الدقيقة، الثانية', 'اللتر، المليليتر'],
      correctAnswer: 'الميل، الياردة، القدم، البوصة',
      explanation: 'الكتاب المدرسي صفحة ٩٧: تم دراسة الميل والياردة والقدم والبوصة بالإضافة للمتر والسنتيمتر.'
    },
    {
      id: 'u5_l1_q2',
      text: 'القدم الواحد يحتوي على كم بوصة تقريباً؟',
      options: ['١٢ بوصة', '١٠ بوصات', '٣٦ بوصة', '٣ بوصات'],
      correctAnswer: '١٢ بوصة',
      explanation: 'الكتاب المدرسي صفحة ٩٧: الشارة التحويلية توضح أن: القدم = ١٢ بوصة = ٣٠ سم.'
    },
    {
      id: 'u5_l1_q3',
      text: 'الساعة الكاملة تحتوي على كم دقيقة؟',
      options: ['٦٠ دقيقة', '٢٤ دقيقة', '١٢ دقيقة', '١٠٠ دقيقة'],
      correctAnswer: '٦٠ دقيقة',
      explanation: 'الكتاب المدرسي صفحة ١٠٠: اليوم = ٢٤ ساعة، الساعة = ٦٠ دقيقة، الدقيقة = ٦٠ ثانية.'
    },
    {
      id: 'u5_l1_q4',
      text: 'عندما يكتمل دوران الساعة وتصبح على "الثامنة والثلث"، كم يكون عدد الدقائق؟',
      options: ['٢٠ دقيقة', '١٥ دقيقة', '٣٠ دقيقة', '٤٠ دقيقة'],
      correctAnswer: '٢٠ دقيقة',
      explanation: 'الكتاب المدرسي صفحة ١٠٤: ثلث الساعة يعادل ٢٠ دقيقة. إذاً الساعة الثامنة والثلث تعني الثامنة و٢٠ دقيقة.'
    }
  ],
  'u6_l1': [ // Geometry (Page 107)
    {
      id: 'u6_l1_q1',
      text: 'ما هو الشكل الهندسي المغلق الذي يتكون من ٣ قطع مستقيمة (أضلاع)؟',
      options: ['المثلث', 'المربع', 'المستطيل', 'المستقيم'],
      correctAnswer: 'المثلث',
      explanation: 'الكتاب المدرسي الصفحة ١١١: الشكل المكون من ٣ قطع مستقيمة تسمى أضلاعاً يسمى المثلث.'
    },
    {
      id: 'u6_l1_q2',
      text: 'ما هي الخاصية المميزة والمحددة للمستطيل التي درسناها في صفحة ١١٢؟',
      options: ['كل ضلعين متقابلين متساويان', 'جميع أضلاعه الأربعة متساوية', 'له ثلاثة أضلاع فقط', 'ليس له أضلاع مستقيمة'],
      correctAnswer: 'كل ضلعين متقابلين متساويان',
      explanation: 'تعريف الكتاب المدرسي صفحة ١١٢: المستطيل شكل رباعي فيه كل ضلعين متقابلين متساويان.'
    },
    {
      id: 'u6_l1_q3',
      text: 'ما هو الشكل الهندسي الرباعي الذي تمتاز جميع أضلاعه الأربعة بأنها متساوية تماماً في الطول؟',
      options: ['المربع', 'المستطيل', 'المثلث', 'الدائرة'],
      correctAnswer: 'المربع',
      explanation: 'تعريف الكتاب المدرسي صفحة ١١٣: المربع شكل رباعي جميع أضلاعه الأربعة متساوية.'
    }
  ]
};

// Compile units list for convenient access
const UNIT_METADATA = [
  { id: 'u1', name: 'الوحدة الأولى: الأعداد والجمع والطرح', lessons: [
      { id: 'u1_l1', name: 'قراءة الأعداد حتى ٩٩٩٩ وتمثيلها' },
      { id: 'u1_l2', name: 'مضاعفات الواحد والعشرة والمئة والألف' },
      { id: 'u1_l3', name: 'الجمع ضمن العدد ٩٩٩٩' },
      { id: 'u1_l4', name: 'الطرح ضمن العدد ٩٩٩٩' }
    ]
  },
  { id: 'u2', name: 'الوحدة الثانية: عمليات جدول الضرب', lessons: [
      { id: 'u2_l1', name: 'الضرب في الصفر والواحد الصحيح' },
      { id: 'u2_l2', name: 'جدول الضرب للعدد ٧' },
      { id: 'u2_l3', name: 'جدول الضرب للعدد ٨' },
      { id: 'u2_l4', name: 'جدول الضرب للعدد ٩' },
      { id: 'u2_l5_6', name: 'الضرب في ١٠ وفي ١٠٠ والمضاعفات' },
      { id: 'u2_l7', name: 'خاصية التوزيع والضرب بطرق مختصرة' }
    ]
  },
  { id: 'u3', name: 'الوحدة الثالثة: غابة القسمة العادلة', lessons: [
      { id: 'u3_l1', name: 'القسمة على ٧ بباق وبدون باق' },
      { id: 'u3_l2', name: 'قسمة الأعداد الكبيرة خارج الجدول' },
      { id: 'u3_l3', name: 'القسمة على ٨ وعلى ٩ بخت الرضا' }
    ]
  },
  { id: 'u4', name: 'الوحدة الرابعة: مختبر الكسور والتكافؤ', lessons: [
      { id: 'u4_l1', name: 'كسور الوحدة والبسط والمقام' },
      { id: 'u4_l2', name: 'تبسيط الكسور وجمعها وطرحها' }
    ]
  },
  { id: 'u5', name: 'الوحدة الخامسة: أجهزة القياس والزمن', lessons: [
      { id: 'u5_l1', name: 'وحدات الطول وأجزاء الساعة' }
    ]
  },
  { id: 'u6', name: 'الوحدة السادسة: أشكال الهندسة والخطوط', lessons: [
      { id: 'u6_l1', name: 'المثلث، المستطيل، والمربع والخط المستقيم' }
    ]
  }
];

export default function ExamsGame({ onBack, onAddStars }: ExamsGameProps) {
  const [activeTab, setActiveTab] = useState<'selection' | 'quiz'>('selection');
  const [quizType, setQuizType] = useState<'lesson' | 'unit' | 'final'>('final');
  
  // Selection States
  const [selectedUnit, setSelectedUnit] = useState<string>('u1');
  const [selectedLesson, setSelectedUnitLesson] = useState<string>('u1_l1');

  // Quiz States
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [starsAwarded, setStarsAwarded] = useState<number>(0);

  // Sound cues helper
  const triggerBeep = () => {
    soundEffects.playBeep();
  };

  // Start selected quiz
  const startQuiz = (type: 'lesson' | 'unit' | 'final') => {
    triggerBeep();
    setQuizType(type);
    
    let pool: Question[] = [];
    
    if (type === 'lesson') {
      pool = QUESTIONS_DATABASE[selectedLesson] || [];
    } else if (type === 'unit') {
      // Collect all questions of this unit
      const unitLessons = UNIT_METADATA.find(it => it.id === selectedUnit)?.lessons || [];
      unitLessons.forEach(l => {
        pool.push(...(QUESTIONS_DATABASE[l.id] || []));
      });
    } else {
      // Final exam: pull from ALL database questions
      Object.values(QUESTIONS_DATABASE).forEach(questionsList => {
        pool.push(...questionsList);
      });
      // Shuffle and pick 10 questions to make it a great final test
      pool = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    }

    if (pool.length === 0) {
      alert('عذراً، هذا القسم قيد التطوير أو لا يحتوي على أسئلة بعد!');
      return;
    }

    // Shuffle options for each question to make it dynamic
    const formattedPool = pool.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));

    setCurrentQuestions(formattedPool);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizComplete(false);
    setStarsAwarded(0);
    setActiveTab('quiz');
  };

  // Handle choice selection
  const handleAnswerSelection = (option: string) => {
    if (isAnswered) return; // Prevent double answering
    setSelectedAnswer(option);
    setIsAnswered(true);

    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (option === currentQuestion.correctAnswer) {
      soundEffects.playCorrect();
      setQuizScore(prev => prev + 1);
    } else {
      soundEffects.playError();
    }
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    triggerBeep();
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz Complete Calculation
      const finalPercentage = (quizScore / currentQuestions.length) * 100;
      let stars = 5; // guaranteed participation stars
      if (finalPercentage === 100) stars = 30; // perfect score bonus!
      else if (finalPercentage >= 70) stars = 15;
      else if (finalPercentage >= 40) stars = 10;

      setStarsAwarded(stars);
      onAddStars(stars);
      soundEffects.playStar();
      setQuizComplete(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-400 text-right" dir="rtl">
      
      {/* Upper Navigation/Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4">
        <button 
          onClick={activeTab === 'quiz' ? () => setActiveTab('selection') : onBack}
          className="flex items-center gap-2 bg-black/10 hover:bg-black/20 p-2.5 px-5 rounded-full transition-all text-xs font-bold self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 ml-1" /> {activeTab === 'quiz' ? 'إلغاء الاختبار والرجوع' : 'رجوع لمدينة المنهج'}
        </button>
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
          🏆 صالة الاختبارات والامتحانات الكبرى
        </h2>
        <div className="bg-amber-600 bg-opacity-35 px-4 py-1.5 rounded-full font-bold text-sm">
          مستعد للتحدي والنجوم؟ ⭐
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SELECTION AND SETUP SCREEN */}
          {activeTab === 'selection' && (
            <motion.div 
              key="selection-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Introduction Greeting card */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-[30px] p-5 flex items-start gap-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-4xl shadow-md shrink-0">
                  🦉
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-900 mb-1">تحدي حسون وسلطان العلم! 🇸🇩</h3>
                  <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                    مرحباً بك يا بطل الخلايا والمسائل التفاعلية! صممنا لك هذه المنصة لاختبار همتك وصبرك وعلمك. يمكنك اختيار اختبار مخصص لكل درس فردي، أو اختبار شامل للوحدة كاملة من المنهج، أو خوض الاختبار النهائي الشامل لعامك الدراسي الثالث لتصبح فارس بخت الرضا الأول!
                  </p>
                </div>
              </div>

              {/* THREE CORE EXAM SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Panel 1: Lesson Quizzes (اختبار درس مخصص) */}
                <div className="bg-white rounded-3xl p-5 border-4 border-indigo-100 shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-3 text-lg font-bold">
                      📝
                    </div>
                    <h4 className="text-md font-black text-indigo-900 mb-2">١. اختبار الدروس الفردية</h4>
                    <p className="text-gray-500 text-xs mb-4 leading-normal font-semibold">
                      اختر أي وحدة دراسية بالأسفل، ثم حدد الدرس الذي ترغب في مراجعته بدقة فائقة للتأكد من حفظك للقوانين.
                    </p>
                    
                    {/* Unit Select */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-[11px] font-black text-indigo-700 mb-1">اختر الوحدة الدراسية:</label>
                        <select 
                          value={selectedUnit}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedUnit(val);
                            // Auto-set the first lesson of the new selected unit to prevent mismatch
                            const firstLesson = UNIT_METADATA.find(it => it.id === val)?.lessons[0]?.id || '';
                            setSelectedUnitLesson(firstLesson);
                          }}
                          className="w-full text-xs font-bold border-2 border-indigo-200 rounded-xl p-2 bg-indigo-50/50 text-indigo-900"
                        >
                          {UNIT_METADATA.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lesson Select */}
                      <div>
                        <label className="block text-[11px] font-black text-indigo-700 mb-1">اختر الدرس المستهدف:</label>
                        <select
                          value={selectedLesson}
                          onChange={(e) => setSelectedUnitLesson(e.target.value)}
                          className="w-full text-xs font-bold border-2 border-indigo-200 rounded-xl p-2 bg-indigo-50/50 text-indigo-900"
                        >
                          {(UNIT_METADATA.find(it => it.id === selectedUnit)?.lessons || []).map(lesson => (
                            <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => startQuiz('lesson')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-black shadow-[0_5px_0_#312e81] hover:shadow-[0_3px_0_#312e81] active:translate-y-1 active:shadow-none transition-all"
                  >
                    بدء اختبار الدرس 🚀
                  </button>
                </div>

                {/* Panel 2: Unit Quizzes (اختبار الوحدة الشامل) */}
                <div className="bg-white rounded-3xl p-5 border-4 border-emerald-100 shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-3 text-lg font-bold">
                      📑
                    </div>
                    <h4 className="text-md font-black text-emerald-900 mb-2">٢. اختبار الوحدة الكاملة</h4>
                    <p className="text-gray-500 text-xs mb-4 leading-normal font-semibold">
                      تحدّ نفسك عبر كافة الأقسام والمواضيع المدرجة داخل واحدة من الوحدات المنهجية الست الكبار دفعة واحدة!
                    </p>

                    <div className="mb-6">
                      <label className="block text-[11px] font-black text-emerald-700 mb-1">الوحدة المقررة للامتحان:</label>
                      <select 
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full text-xs font-bold border-2 border-emerald-200 rounded-xl p-2 bg-emerald-50/50 text-emerald-900"
                      >
                        {UNIT_METADATA.map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => startQuiz('unit')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black shadow-[0_5px_0_#065f46] hover:shadow-[0_3px_0_#065f46] active:translate-y-1 active:shadow-none transition-all"
                  >
                    بدء اختبار الوحدة 🚀
                  </button>
                </div>

                {/* Panel 3: Comprehensive Final Exam (الامتحان الشامل الأكبر) */}
                <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl p-5 border-4 border-white shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-12 -translate-y-12"></div>
                  <div>
                    <div className="w-10 h-10 bg-white text-yellow-650 rounded-2xl flex items-center justify-center mb-3 text-lg font-bold">
                      👑
                    </div>
                    <h4 className="text-md font-black mb-2">٣. الامتحان السنوي الشامل</h4>
                    <p className="text-yellow-50 text-xs mb-4 leading-normal font-semibold">
                      المنصة الكبرى لفرسان الصف الثالث! ١٠ أسئلة عشوائية منتقاة بعناية وبلا رجعة من كافة فصول الرياضيات (الكسور، العداد، القسمة، الضرب، الساعة، الهندسة).
                    </p>
                    <div className="bg-white/20 p-2.5 rounded-xl border border-white/20 text-center mb-4 text-[10px] font-extrabold leading-relaxed">
                      💡 النجوم بانتظارك: إجابة تامة تمنحك ٣٠ نجمة ذهبية إضافية!
                    </div>
                  </div>

                  <button 
                    onClick={() => startQuiz('final')}
                    className="w-full bg-white hover:bg-yellow-50 text-amber-800 py-3.5 rounded-2xl text-xs font-black shadow-[0_5px_0_#b45309] hover:shadow-[0_3px_0_#b45309] active:translate-y-1 active:shadow-none transition-all"
                  >
                    خوض الامتحان الشامل الممتع! 🎯
                  </button>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: ACTIVE QUIZ VIEW */}
          {activeTab === 'quiz' && !quizComplete && currentQuestions.length > 0 && (
            <motion.div 
              key="quiz-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Progress and Level indicator */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-150 rounded-2xl p-4">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-bold">نوع الاختبار:</span>
                  <p className="text-sm font-black text-gray-800">
                    {quizType === 'lesson' && `📝 اختبار درس مخصص`}
                    {quizType === 'unit' && `📑 اختبار وحدة مجمعة`}
                    {quizType === 'final' && `👑 الامتحان السنوي الشامل`}
                  </p>
                </div>
                <div className="text-center bg-yellow-400 text-yellow-950 px-4 py-1.5 rounded-full font-black text-xs md:text-sm">
                  السؤال {toArabicNumerals(currentQuestionIndex + 1)} من {toArabicNumerals(currentQuestions.length)}
                </div>
                <div className="text-left font-black text-sm text-amber-600">
                  مرات الصواب: {toArabicNumerals(quizScore)} / {toArabicNumerals(currentQuestions.length)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Central question card */}
              <div className="bg-sky-50 rounded-3xl p-6 border-4 border-sky-200 relative">
                {/* Character avatar */}
                <div className="absolute -top-10 left-6 w-20 h-20 bg-white rounded-full border-4 border-sky-300 flex items-center justify-center text-4xl shadow-md">
                  🦜
                </div>
                
                <span className="text-xs font-black text-sky-600 block mb-2">أجب بتركيز يا بطل:</span>
                <p className="text-base md:text-xl font-extrabold text-sky-950 leading-relaxed font-sans mb-1 md:w-5/6">
                  {currentQuestions[currentQuestionIndex].text}
                </p>
                <div className="h-0.5 bg-sky-200/50 my-3"></div>
                <div className="text-xs font-bold text-sky-700 italic">
                  💡 تلميح: فكّر أولاً في خطوات الحل قبل اختيار الخيار المناسب.
                </div>
              </div>

              {/* Multiple choice options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrectAnswerObj = option === currentQuestions[currentQuestionIndex].correctAnswer;
                  const isUserSelection = option === selectedAnswer;

                  // Dynamic styles matching verification
                  let buttonStyle = 'bg-white border-4 border-gray-100 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50/20';
                  
                  if (isAnswered) {
                    if (isCorrectAnswerObj) {
                      // Correct option turns green
                      buttonStyle = 'bg-emerald-50 border-4 border-emerald-500 text-emerald-800 shadow-emerald-100 shadow-md';
                    } else if (isUserSelection) {
                      // Selected wrong option turns red
                      buttonStyle = 'bg-rose-50 border-4 border-rose-500 text-rose-800 shadow-rose-100';
                    } else {
                      // Others become low contrast
                      buttonStyle = 'bg-gray-50 border-4 border-gray-100 text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerSelection(option)}
                      className={`rounded-2xl p-5 text-right text-sm md:text-base font-extrabold flex items-center justify-between transition-all select-none ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      
                      {/* Interactive checkmark state if resolved */}
                      {isAnswered && isCorrectAnswerObj && (
                        <span className="bg-emerald-500 text-white rounded-full p-1"><Check className="w-4 h-4" /></span>
                      )}
                      {isAnswered && isUserSelection && !isCorrectAnswerObj && (
                        <span className="bg-rose-500 text-white rounded-full p-1"><X className="w-4 h-4" /></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Overlay / Continuation Card */}
              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl p-5 border-2 ${
                    selectedAnswer === currentQuestions[currentQuestionIndex].correctAnswer
                      ? 'bg-emerald-100/70 border-emerald-300'
                      : 'bg-rose-100/70 border-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {selectedAnswer === currentQuestions[currentQuestionIndex].correctAnswer ? '🎉' : '💡'}
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-black text-sm ${
                        selectedAnswer === currentQuestions[currentQuestionIndex].correctAnswer
                          ? 'text-emerald-900'
                          : 'text-rose-900'
                      }`}>
                        {selectedAnswer === currentQuestions[currentQuestionIndex].correctAnswer 
                          ? 'أحسنت يا بطل! إجابة صحيحة هنيئاً لك النجوم!' 
                          : `الإجابة الصحيحة هي: ${currentQuestions[currentQuestionIndex].correctAnswer}`
                        }
                      </h5>
                      <p className="text-xs text-gray-700 mt-1 font-semibold leading-relaxed">
                        {currentQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-2xl font-black text-xs md:text-sm shadow-md hover:shadow-lg transition-transform transform active:scale-95 duration-100 flex items-center gap-1.5"
                    >
                      أحسنت القراءة، استمر للامام ➡️
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* TAB 3: QUIZ COMPLETE VIEW */}
          {quizComplete && (
            <motion.div 
              key="complete-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 space-y-6 max-w-xl mx-auto"
            >
              <div className="text-7xl animate-bounce">🏆</div>
              
              <h3 className="text-2xl md:text-3xl font-black text-gray-950">انتهى الامتحان بنجاح كبير!</h3>
              
              <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                أكملت اختبارك بنجاح منقطع النظير وراجعت فصول الرياضيات بخت الرضا. إليك النتيجة التي حققتها:
              </p>

              {/* Score Box */}
              <div className="bg-yellow-50 border-4 border-yellow-300 rounded-[30px] p-6 shadow-inner space-y-4">
                <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">علامتك النهائية:</div>
                <div className="text-5xl md:text-6xl font-black text-yellow-600">
                  {toArabicNumerals(quizScore)} / {toArabicNumerals(currentQuestions.length)}
                </div>
                <div className="text-xs font-bold text-yellow-800">
                  أثبتَّ أنك تلميذ مجتهد وذكي بالصف الثالث الابتدائي وتستحق بطلاً لفرسان النجوم!
                </div>
              </div>

              {/* Stars Earned */}
              <div className="bg-amber-500 text-white rounded-3xl p-4 flex items-center justify-between border-2 border-white shadow-md">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⭐</div>
                  <div className="text-right">
                    <span className="text-[10px] block text-amber-100 font-bold leading-none">مجموع النجوم الكلية الممنوحة:</span>
                    <strong className="text-lg font-black">{toArabicNumerals(starsAwarded)} نجمة لتلميذنا البطل!</strong>
                  </div>
                </div>
                <Award className="w-8 h-8 text-yellow-200" />
              </div>

              {/* Post choices buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => startQuiz(quizType)}
                  className="flex-1 bg-yellow-550 hover:bg-yellow-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> إعادة المحاولة من جديد
                </button>
                <button
                  onClick={() => setActiveTab('selection')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs py-3.5 rounded-2xl transition-all"
                >
                  الرجوع لقائمة الامتحانات
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
