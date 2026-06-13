import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Volume2, BookOpen, Clock, HelpCircle, GraduationCap, Award, Lightbulb } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface AiTutorProps {
  onBack: () => void;
  onAddStars: (stars: number) => void;
}

interface SearchItem {
  id: string;
  unitName: string;
  lessonName: string;
  page: string;
  keywords: string[];
  explanation: string;
  example: string;
  exercise: string;
}

// Extensive syllabus-accurate textbook database for Sudan Grade 3 Math Curriculum
const TEXTBOOK_DATABASE: SearchItem[] = [
  {
    id: 'u1_l1',
    unitName: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والجمع والطرح',
    lessonName: 'قراءة الأعداد وكتابتها',
    page: 'الكتاب المدرسي ص ٦ - ٧',
    keywords: ['أرقام', 'عدد', 'أعداد', 'قرء', 'قراءة', 'خانة', 'آحاد', 'عشرات', 'مئات', 'ألوف', 'آلاف', 'سودان', 'الف', 'اف'],
    explanation: 'تعلّم تلميذ الصف الثالث كيف يقرأ ويكتب الأعداد الكلية حتى ٩٩٩٩ بروح ممتعة. يتكون العدد الإجمالي من أربع خانات أساسية بالترتيب تصاعدياً: خانة الآحاد (الأولى)، خانة العشرات (الثانية)، خانة المئات (الثالثة)، وخانة الألوف أو الآلاف (الرابعة).',
    example: 'مثال الكتاب (ص ٧): العدد ٣٥٨٣ يُمثل كالتالي:\n- ٣ آحاد (بقيمة ٣)\n- ٨ عشرات (بقيمة ٨٠)\n- ٥ مئات (بقيمة ٥٠٠)\n- ٣ آلاف (بقيمة ٣٠٠٠)\nويُقرأ بطريقتنا السودانية الجميلة: (ثلاثة آلاف وخمسمئة وثلاثة وثمانون).',
    exercise: 'تمرين كراسة بخت الرضا: اكتب بالكلمات العدد الكلي: ٢٤٩٧.\nالحل الصحيح: ألفان وأربعمئة وسبعة وتسعون.'
  },
  {
    id: 'u1_l2',
    unitName: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والجمع والطرح',
    lessonName: 'مضاعفات العشرة والمئة والألف',
    page: 'الكتاب المدرسي ص ٩ - ١٠',
    keywords: ['مضاعف', 'مضاعفات', 'عشرة', 'مية', 'مئة', 'مائة', 'ألف', 'ألوف', 'نمط', 'أنماط', 'الف', 'عشره', 'مائه'],
    explanation: 'مضاعفات الأعداد هي نواتج زيادة الأرقام بخطوات ثابتة منتظمة؛ تُمثّل أنماطاً رياضية تسهل الحساب السريع للأبطال.',
    example: 'أمثلة المضاعفات المعتمدة:\n- مضاعفات العشرة: ١٠، ٢٠، ٣٠، ٤٠، ٥٠، ٦٠...\n- مضاعفات المئة: ١٠٠، ٢٠٠، ٣٠٠، ٤٠٠، ٥٠٠...\n- مضاعفات الألف: ١٠٠٠، ٢٠٠٠، ٣٠٠٠، ٤٠٠٠...',
    exercise: 'مسألة الأنماط المدرسية: أكمل النمط: ٣٠٠، ٤٠٠، ٥٠٠، ٦٠٠، [....].\nالحل: الرقم المفقود هو ٧٠٠، لأن النمط يزداد بمقدار مائة في كل خطوة.'
  },
  {
    id: 'u1_l3',
    unitName: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والجمع والطرح',
    lessonName: 'الجمع ضمن العدد ٩٩٩٩',
    page: 'الكتاب المدرسي ص ١٢ - ١٣',
    keywords: ['جمع', 'زائد', 'أجمع', 'مجموع', 'باليد', 'إعادة تسمية', 'اجمع', 'اعاده'],
    explanation: 'لجمع عددين يتكون كل منهما من أربع خانات، نقوم بجمع الآحاد مع الآحاد، ثم العشرات مع العشرات، والمئات مع المئات، وأخيراً الألوف مع الألوف. إذا زاد مجموع خانة عن ٩، نقوم بعملية "إعادة التسمية" ونضع الباقي باليد في الخانة التالية مباشرة.',
    example: 'مثال جمع الكتاب (ص ١٢): ٤١٢٦ + ١٨٧٢\n- الآحاد: ٦ + ٢ = ٨\n- العشرات: ٢ + ٧ = ٩\n- المئات: ١ + ٨ = ٩\n- الألوف: ٤ + ١ = ٥\nالمجموع النهائي = ٥٩٩٨.',
    exercise: 'تمرين تلميذ بخت الرضا (ص ١٣): ٢٥٤٧ + ١٥٣٥\nالجمع بالخطوات: ٧+٥=١٢ (٢ باليد ١)، ثم العشرات ٤+٣+١=٨، المئات ٥+٥=١٠ (٠ باليد ١)، الألوف ٢+١+١=٤.\nالناتج النهائي الصحيح = ٤٠٨٢.'
  },
  {
    id: 'u1_l4',
    unitName: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والجمع والطرح',
    lessonName: 'الطرح ضمن العدد ٩٩٩٩',
    page: 'الكتاب المدرسي ص ١٤ - ١٥',
    keywords: ['طرح', 'ناقص', 'أطرح', 'فرق', 'باقي', 'استلاف', 'استلف', 'اطرح'],
    explanation: 'لطرح أعداد كبيرة، نقوم بالطرح بدءاً من الآحاد. وإذا كانت قيمة الرقم بالأعلى أصغر من الرقم بالأسفل، نطرق باب الخانة المجاورة على اليسار ونقوم بعملية "الاستلاف" فنأكل منها واحداً بعشرة لتهيئة الخانة بنجاح.',
    example: 'مثال الكتاب المعتمد (ص ١٤): ٤٧٥٣ - ٢٦٤٨\nلاحظ خانة الآحاد: ٣ - ٨ لا تكفي! نستلف من العشرات ٥ لتصبح ٤، وتصبح خانة الآحاد ١٣.\n- ١٣ - ٨ = ٥\n- العشرات: ٤ - ٤ = ٠\n- المئات: ٧ - ٦ = ١\n- الألوف: ٤ - ٢ = ٢\nالباقي الإجمالي = ٢١٠٥.',
    exercise: 'تحدي تمرين بخت الرضا: ٩٠٠٠ - ٢٩٩٩\nالحل مع الاستلاف المتسلسل من خانة الألوف: الناتج يساوي ٦٠٠١.'
  },
  {
    id: 'u2_l1',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'قاعدة الضرب في صفر والضرب في واحد',
    page: 'الكتاب المدرسي ص ١٧',
    keywords: ['ضرب', 'صفر', 'واحد', 'قانون', 'خاصية', 'قاعده', 'خاصيه'],
    explanation: 'الضرب هو تكرار للجمع. ويمتلك الصفر والواحد ميزات خاصة جداً في كتابنا:\n١. أي عدد نضربه في صفر تكون النتيجة دائماً صفراً (مثال: ٨ × ٠ = ٠).\n٢. أي عدد نضربه في الرقم واحد تكون النتيجة دائماً نفس العدد الكلي دون أي تغيير (مثال: ٦ × ١ = ٦).',
    example: 'مثال تكراري:\n- ٩ × ٠ = ٠\n- ١٠٠ × ٠ = ٠\n- ١٥ × ١ = ١٥\n- ١ × ٧ = ٧',
    exercise: 'جد ناتج ما يلي للتأكيد: عصفور لديه صفر حبة فكم حبة مع ٩ عصافير؟ الحل: ٩ × ٠ = ٠.'
  },
  {
    id: 'u2_l2',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'جدول ضرب السبعة (٧)',
    page: 'الكتاب المدرسي ص ١٩ - ٢١',
    keywords: ['ضرب', 'سبعة', '٧', 'جدول ٧', 'سبعه'],
    explanation: 'جدول السبعة يقوم على زيادة المقدار بمعدل ٧ خطوات تصاعدية في كل مرحلة:\n- ٧ × ١ = ٧\n- ٧ × ٢ = ١٤\n- ٧ × ٣ = ٢١\n- ٧ × ٤ = ٢٨\n- ٧ × ٥ = ٣٥\n- ٧ × ٦ = ٤٢\n- ٧ × ٧ = ٤٩\n- ٧ × ٨ = ٥٦\n- ٧ × ٩ = ٦٣\n- ٧ × ١٠ = ٧٠',
    example: 'مسألة لفظية من تمرين ٢ مسألة ٤: إذا كان ثمن القلم الواحد ٦ جنيهات، فما ثمن ٧ أقلام من نفس النوع؟\nالحل: ثمن الشراء الإجمالي = ٦ × ٧ = ٤٢ جنيهاً سودانياً.',
    exercise: 'تمرين الكتاب المدرسي: ٧ × ٨ = ٥٦.'
  },
  {
    id: 'u2_l3',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'جدول ضرب الثمانية (٨)',
    page: 'الكتاب المدرسي ص ٢٣ - ٢٤',
    keywords: ['ضرب', 'ثمانية', '٨', 'جدول ٨', 'ثمانيه'],
    explanation: 'جدول ضرب الثمانية يمتاز بزيادة ثنائية ومضاعفات للعدد ٤، وتزداد النتيجة بمقدار ٨ خطوات في كل ضربة ممتعة للأذكياء:\n- ٨ × ١ = ٨\n- ٨ × ٢ = ١٦\n- ٨ × ٣ = ٢٤\n- ٨ × ٤ = ٣٢\n- ٨ × ٥ = ٤٠\n- ٨ × ٦ = ٤٨\n- ٨ × ٧ = ٥٦\n- ٨ × ٨ = ٦٤\n- ٨ × ٩ = ٧٢\n- ٨ × ١٠ = ٨٠',
    example: 'مسألة لفظية صفحة ٢٤: ثمن المسطرة الواحدة ٨ جنيهات، كم تدفع ملاذ لشراء ٣ مساطر؟\nالحل بالتكاثر السريع: ٨ جنيهات × ٣ مساطر = ٢٤ جنيهاً.',
    exercise: 'تمرين التدريب المدرسي: ٨ × ٨ = ٦٤.'
  },
  {
    id: 'u2_l4',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'جدول ضرب التسعة (٩)',
    page: 'الكتاب المدرسي ص ٢٦ - ٢٨',
    keywords: ['ضرب', 'تسعة', '٩', 'جدول ٩', 'تسعه'],
    explanation: 'مضاعفات العدد تسعة تمتلك قاعدة سحرية! مجموع خانتي آحاد وعشرات ناتج الضرب يساوي دائماً ٩ (مثال: ناتج ٩ × ٥ = ٤٥، ومجموع ٥ + ٤ = ٩).\n- ٩ × ١ = ٩\n- ٩ × ٢ = ١٨\n- ٩ × ٣ = ٢٧\n- ٩ × ٤ = ٣٦\n- ٩ × ٥ = ٤٥\n- ٩ × ٦ = ٥٤\n- ٩ × ٧ = ٦٣\n- ٩ × ٨ = ٧٢\n- ٩ × ٩ = ٨١\n- ٩ × ١٠ = ٩٠',
    example: 'مسألة لفظية من تمرين ٤ مسألة ٢: علبة حلوى بها ٩ قطع طازجة، كم قطعة حلوى في ٧ علب مماثلة؟\nالحل: عدد القطع الإجمالي = ٩ × ٧ = ٦٣ قطعة حلوى لذيذة.',
    exercise: 'احسب حاصل الضرب: ٩ × ٩ = ٨١.'
  },
  {
    id: 'u2_l5_6',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'الضرب في ١٠ وفي ١٠٠ ومضاعفاتها',
    page: 'الكتاب المدرسي ص ٣٠ - ٣٢',
    keywords: ['ضرب', 'عشرة', 'مية', 'مئة', 'مائة', 'أصفار', 'يمين', 'اصفار', 'مائه', 'عشره'],
    explanation: 'قاعدة ذهبية لضرب الأعداد الكبيرة في مضاعفات العشرة أو المئة:\n١. نضع الأصفار الموجودة في جهة اليمين تماماً بالناتج.\n٢. نضرب الأرقام المتبقية الأخرى ببعضها ونكتب المكسب يسار الأصفار ليتشكل الحل.',
    example: 'أمثلة عملية:\n- ٢٥ × ١٠: نضع صفر الـ ١٠ على اليمين ثم نضرب ٢٥ × ١ = ٢٥، فيصبح الناتج ٢٥٠.\n- ٣٥ × ١٠٠: نضع صفرين على اليمين ثم نضرب ٣٥ × ١ = ٣٥، فيصبح الناتج ٣٥٠٠.',
    exercise: 'أوجد ناتج عملية الضرب المدرسية: ١٢ × ٣٠٠\nالحل: نضع الصفرين على اليمين، ثم نضرب ١٢ × ٣ = ٣٦. فيصبح الناتج الكلي ٣٦٠٠.'
  },
  {
    id: 'u2_l7',
    unitName: 'الوحدة الثانية: عمليات جدول الضرب للثالث',
    lessonName: 'خاصية التوزيع والضرب بطرق مختصرة',
    page: 'الكتاب المدرسي ص ٣٦ - ٣٨',
    keywords: ['ضرب', 'توزيع', 'خاصية التوزيع', 'مختصر', 'تفكيك', 'قوس', 'خاصيه', 'تفكيك'],
    explanation: 'خاصية التوزيع تعني تفكيك العدد العريض لخانتي آحاد وعشرات داخل قوسين، ثم ضرب الرقم الخارجي في كل خانة منهما على حدة وجمعهما سوياً.',
    example: 'مثال الكتاب (ص ٣٦): ٢٤ × ٥\nنقوم بتفكيك ٢٤ إلى (٢٠ + ٤). تصبح المسألة:\n(٢٠ + ٤) × ٥ = (٢٠ × ٥) + (٤ × ٥)\n= ١٠٠ + ٢٠\n= ١٢٠.',
    exercise: 'تمرين الامتحان: ٣٤ × ٢\nالحل: نضرب الآحاد أولاً ٤×٢=٨، ثم العشرات ٣×٢=٦. الناتج الكلي ٦٨.'
  },
  {
    id: 'u3_l1',
    unitName: 'الوحدة الثالثة: عمليات وقواعد القسمة',
    lessonName: 'القسمة على ٧ بباق وبدون باق',
    page: 'الكتاب المدرسي ص ٤٦ - ٤٧',
    keywords: ['قسمة', 'تقسيم', 'على ٧', 'موزع', 'باقي', 'الباقي', 'قسمه', 'سبعه'],
    explanation: 'القسمة هي عملية عكسية تماماً للضرب وتدل على التوزيع العادل بالتساوي. إذا كان لدينا عدد لا يقبل القسمة بالتساوي، فإن المقدار الزائد المتبقي يسمى "الباقي" ويجب أن يكون دائماً أصغر من المقسوم عليه.',
    example: 'أمثلة من الصفحة ٤٦:\n١. ٤٩ ÷ ٧ = ٧ بدون باق لأن ٧ × ٧ = ٤٩.\n٢. ٥٠ ÷ ٧ = ٧ والباقي ١، لأن ٧ × ٧ = ٤٩ وبقي واحدٌ لنصل لـ ٥٠.',
    exercise: 'مسألة الحبل اللفظية: اشترت زينب حبلاً طوله ٧ أمتار بمبلغ ٤٢ جنيهاً، فكم ثمن المتر الواحد؟\nالحل: ثمن المتر الواحد = ٤٢ ÷ ٧ = ٦ جنيهات.'
  },
  {
    id: 'u3_l2',
    unitName: 'الوحدة الثالثة: عمليات وقواعد القسمة',
    lessonName: 'قسمة الأعداد الكبيرة خارج جدول الضرب',
    page: 'الكتاب المدرسي ص ٤٩ - ٥٠',
    keywords: ['قسمة', 'قسمة مطولة', 'كبيرة', 'قسمة أعداد', 'توزيع عادل', 'قسمه', 'مطوله', 'كبيره'],
    explanation: 'لقسمة عدد كبير مكون من ٣ خانات مثل المئات والعشرات والآحاد، نقسم خانة المئات أولاً بالخطوات الطويلة، ثم العشرات مع إضافة أي باقٍ مستخلص، وأخيراً خانة الآحاد.',
    example: 'مثال الكتاب بالشرح المفصل (ص ٤٩): ٩٥٢ ÷ ٧\n- ٩ مئات تقسيم ٧ يعطي ١ مائة ويتبقى ٢ مئات (تذهب كـ ٢٠ عشرة للخانة التالية).\n- العشرات تصبح ٢٥ ÷ ٧ يعطي ٣ عشرات ويتبقى ٤ عشرات (تذهب كـ ٤٠ آحاد للخانة التالية).\n- الآحاد تصبح ٤٢ ÷ ٧ يعطي ٦.\nخارج القسمة النهائي هو ١٣٦.',
    exercise: 'مسألة الدجاج والقفص اللفظية: وزّع مزارع ٢١٠ دجاجات على ٧ أقفاص بالتساوي، كم دجاجة بالقفص؟\nالحل بالتوزيع السريع: ٢١٠ ÷ ٧ = ٣٠ دجاجة.'
  },
  {
    id: 'u3_l3',
    unitName: 'الوحدة الثالثة: عمليات وقواعد القسمة',
    lessonName: 'القسمة على ٨ وعلى ٩',
    page: 'الكتاب المدرسي ص ٥٨ - ٥٩',
    keywords: ['قسمة', 'على ٨', 'على ٩', 'تقسيم ٨', 'تقسيم ٩', 'بخت الرضا', 'قسمه', 'ثمانيه', 'تسعه'],
    explanation: 'القسمة على ٨ وعلى ٩ تلبي مسائل التوزيع لجدولي ضرب الثمانية والتسعة وتُستخدم لفض النزاعات والتوزيع العادل التام بخت الرضا.',
    example: 'نماذج القسمة المعتمدة:\n- ٥٦ ÷ ٨ = ٧ لأن ٨ × ٧ = ٥٦.\n- ٧٢ ÷ ٨ = ٩ لأن ٨ × ٩ = ٧٢.\n- ٨١ ÷ ٩ = ٩ لأن ٩ × ٩ = ٨١.',
    exercise: 'مسألة بائع الأقمشة اللفظية (ص ٥٨): قسم بائع لفة قماش طولها ٧٢ متراً لـ ٨ قطع متساوية، كم طول القطعة؟\nالحل: طول القطعة الواحدة = ٧٢ ÷ ٨ = ٩ أمتار.'
  },
  {
    id: 'u4_l1',
    unitName: 'الوحدة الرابعة: مختبر الكسور والتكافؤ',
    lessonName: 'مفهوم كسر الوحدة والبسط والمقام',
    page: 'الكتاب المدرسي ص ٧٥ - ٧٧',
    keywords: ['كسر', 'كسور', 'بسط', 'مقام', 'ثلث', 'نصف', 'خمس', 'ربع', 'سدس', 'جزء', 'ملون'],
    explanation: 'الكسر يعبر عن جزء أو أجزاء متساوية من الكل المتكامل. يتكون الكسر من ثلاثة عناصر رئيسية:\n١. البسط (الرقم بالأعلى): يعبر عن الأجزاء المستهدفة أو الملونة.\n٢. خط الكسر الأنيق.\n٣. المقام (الرقم بالأسفل): يعبر عن العدد الكلي لجميع الأجزاء المتساوية المقسمة في الشكل.',
    example: 'من الصفحة ٧٥:\n- الكسر المتشكل من بسط ١ ومقام ٥ يسمى (خُمْس) ويكتب ١/٥.\n- الكسر المتشكل من بسط ٢ ومقام ٣ يسمى (ثلثان) ويكتب ٢/٣.\n- الكسر المتشكل من بسط ٣ ومقام ٤ يسمى (ثلاثة أرباع) ويكتب ٣/٤.',
    exercise: 'حدد بسط ومقام الكسر ٥/٨؟\nالحل: البسط هو الرقم ٥ والمقام هو الرقم ٨.'
  },
  {
    id: 'u4_l2',
    unitName: 'الوحدة الرابعة: مختبر الكسور والتكافؤ',
    lessonName: 'الكسور المتكافئة وتبسيطها',
    page: 'الكتاب المدرسي ص ٨٣ - ٨٧',
    keywords: ['كسر', 'كسور', 'تكافؤ', 'متكافئة', 'تبسيط', 'أبسط صورة', 'عامل مشترك', 'متكافئه', 'ابسط', 'صوره'],
    explanation: '١. الكسور المتكافئة هي كسور مختلفة في الأرقام ولكنها تمثل نفس الكمية والمساحة تماماً. نحصل عليها بضرب أو قسمة بسط ومقام الكسر في نفس الرقم.\n٢. تبسيط الكسر يعني وضعه في أبسط صورة بقسمة بسطه ومقامه على أكبر عامل مشترك بينهما لتقليص حجم الأرقام.',
    example: 'من الصفحة ٨٣:\n- الكسر ١/٢ يكافئ تماماً ٢/٤، و٣/٦، و٤/٨.\n- تبسيط الكسر ١٢/١٦: نقسم البسط والمقام على العامل المشترك ٤:\n١٢ ÷ ٤ = ٣\n١٦ ÷ ٤ = ٤\nأبسط صورة مبسطة للكسر هي ٣/٤.',
    exercise: 'تمرين الكتاب: هل الكسران ٢/٦ و ١/٣ متكافئان؟\nالحل: نعم، بقسمة ٢/٦ بسطاً ومقاماً على ٢ نحصل على ١/٣. فهما كسران متكافئان.'
  },
  {
    id: 'u4_l3',
    unitName: 'الوحدة الرابعة: مختبر الكسور والتكافؤ',
    lessonName: 'جمع وطرح الكسور متساوية المقامات',
    page: 'الكتاب المدرسي ص ٩٣ - ٩٥',
    keywords: ['جمع الكسور', 'طرح الكسور', 'مقام مشترك', 'مقامات متساوية', 'جمع', 'طرح', 'كسور', 'متساويه'],
    explanation: 'عند جمع أو طرح الكسور ذات المقامات المتساوية (المتشابهة)، نقوم بجمع أو طرح البسطين في الأعلى فقط، بينما نترك المقام في الأسفل ثابتاً كما هو دون أي تغيير أو جمع.',
    example: 'أمثلة توضيحية من الصفحة ٩٣:\n- حاصل جمع ٣/٨ + ٢/٨: نجمع البسطين ٣+٢=٥ والمقام يبقى ٨، الناتج هو ٥/٨.\n- باقي طرح ٥/٦ - ٣/٦: نطرح البسطين ٥-٣=٢ والمقام يبقى ٦، الناتج هو ٢/٦ (والذي يبسط كـ ١/٣).',
    exercise: 'احسب المجموع التالي: ٤/١٠ + ٣/١٠. الحل الصحيح هو ٧/١٠.'
  },
  {
    id: 'u5_l1',
    unitName: 'الوحدة الخامسة: قياس الأطوال والوقت',
    lessonName: 'وحدات قياس الطول والزمن والتحويلات',
    page: 'الكتاب المدرسي ص ٩٧ - ١٠٤',
    keywords: ['طول', 'وحدة', 'قياس', 'ميل', 'ياردة', 'قدم', 'بوصة', 'بوصه', 'تحويل', 'ساعة', 'ساعه', 'دقيقة', 'دقيقه', 'ثانية', 'يوم', 'ثلث ساعة', 'ربع ساعة', 'وقت', 'زمن', 'ثانيه'],
    explanation: 'تعلّم أبطال الصف الثالث وحدات قياس هامة في حياتنا:\n١. وحدات الطول التقليدية: البوصة، القدم، الياردة، الميل. (القدم الواحد = ١٢ بوصة = ٣٠ سم تقريباً).\n٢. وحدات الطول المترية: السنتيمتر والمتر (١ متر = ١٠٠ سم).\n٣. وحدات الزمن والساعة: اليوم = ٢٤ ساعة، الساعة = ٦٠ دقيقة، الدقيقة = ٦٠ ثانية.',
    example: 'تحويلات الأوقات المدرجة ص ١٠٤:\n- نصف الساعة يعادل ٣٠ دقيقة.\n- ثلث الساعة يعادل ٢٠ دقيقة.\n- ربع الساعة يعادل ١٥ دقيقة.\n- الساعة الثامنة والثلث تعني الساعة ٨ و ٢٠ دقيقة.',
    exercise: 'مسألة الامتحان: حبل طوله ٣ أقدام فكم بوصة يساوي؟\nالحل: ٣ أقدام × ١٢ بوصة = ٣٦ بوصة.'
  },
  {
    id: 'u6_l1',
    unitName: 'الوحدة السادسة: الهندسة والأشكال المغلقة',
    lessonName: 'المثلث، المستطيل، والمربع والخطوط',
    page: 'الكتاب المدرسي ص ١٠٧ - ١١٣',
    keywords: ['هندسة', 'شكل', 'أشكال', 'مثلث', 'مستطيل', 'مربع', 'ضلع', 'أضلاع', 'رؤوس', 'قطعة مستقيمة', 'مغلق', 'هندسه', 'اشكال', 'اضلاع', 'قطعه'],
    explanation: 'الأشكال الهندسية المغلقة تتكون من قطع مستقيمة نطلق عليها اسم الأضلاع:\n١. المثلث: شكل هندسي مغلق يتكون من ٣ قطع مستقيمة (أضلاع) وله ٣ رؤوس وزوايا.\n٢. المستطيل: شكل هندسي رباعي (له ٤ أضلاع) ميزته أن كل ضلعين متقابلين متساويان في الطول.\n٣. المربع: شكل هندسي رباعي مغلق تمتاز جميع أضلاعه الأربعة بأنها متساوية تماماً في الطول.',
    example: 'مقارنات الأشكال الهندسية ص ١١٢-١١٣:\n- المربع أضلاعه متطابقة الطول (مثلاً: ٥ سم، ٥ سم، ٥ سم، ٥ سم).\n- المستطيل أضلاعه متقابلة (مثلاً الضلع الطولي ٦ سم والضلع الأفقي المقابل ٦ سم، والجانبي ٣ سم والمقابل ٣ سم).',
    exercise: 'ما اسم الشكل المغلق المكون من ٣ أضلاع؟ الحل الصحيح هو: المثلث.'
  }
];

// Normalize Arabic words to support flexible inputs
const normalizeArabic = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, ''); // strip diacritics
};

export default function AiTutor({ onBack, onAddStars }: AiTutorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeLesson, setActiveLesson] = useState<SearchItem | null>(null);

  // Suggested keywords in Sudanese style
  const suggestions = [
    { label: 'ضرب السبعة 🍎', query: 'ضرب السبعة' },
    { label: 'الكسور المتكافئة 🍕', query: 'الكسور المتكافئة' },
    { label: 'الجمع باليد ➕', query: 'جمع' },
    { label: 'المربع والمستطيل 📐', query: 'مربع ومستطيل' },
    { label: 'وحدة القدم والبوصة 📏', query: 'قدم وبوصة' },
    { label: 'القسمة على ٧ 🦜', query: 'قسمة' }
  ];

  // TTS speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop prior speech
      const formatted = text.replace(/[*#_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(formatted);
      utterance.lang = 'ar-SD';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Perform search locally
  const handleSearch = (customQuery?: string) => {
    const query = customQuery !== undefined ? customQuery : searchQuery;
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    soundEffects.playBeep();
    
    // Normalize terms
    const normalizedQuery = normalizeArabic(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

    // Score database entries
    const itemsScored = TEXTBOOK_DATABASE.map(item => {
      let score = 0;

      queryWords.forEach(word => {
        // High weights for lesson/unit names
        if (normalizeArabic(item.lessonName).includes(word)) score += 30;
        if (normalizeArabic(item.unitName).includes(word)) score += 15;
        
        // Moderate weights for exact keyword matches
        const matchesKeyword = item.keywords.some(kw => normalizeArabic(kw).includes(word));
        if (matchesKeyword) score += 20;

        // Lower weights for occurrence inside text content
        if (normalizeArabic(item.explanation).includes(word)) score += 5;
        if (normalizeArabic(item.example).includes(word)) score += 5;
        if (normalizeArabic(item.exercise).includes(word)) score += 5;
      });

      return { item, score };
    });

    // Filter items with score > 0 and sort descending
    const finalResults = itemsScored
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);

    setSearchResults(finalResults);
    setHasSearched(true);
    
    if (customQuery !== undefined) {
      setSearchQuery(customQuery);
    }

    if (finalResults.length > 0) {
      soundEffects.playCorrect();
      // Auto-open top item to make searching seamless and helpful
      setActiveLesson(finalResults[0]);
      onAddStars(2); // reward kids for searching/reading!
    } else {
      soundEffects.playError();
      setActiveLesson(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-400 flex flex-col min-h-[600px] text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-5 flex flex-col sm:flex-row items-center justify-between text-white shrink-0 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-sky-600/30 hover:bg-sky-600/50 p-2 px-4 rounded-full transition-all text-xs font-bold self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 ml-1" /> رجوع للمطالعة والمدينة
        </button>
        <h2 className="text-lg md:text-xl font-black flex items-center gap-1.5">
          📚 بحث الكتاب المدرسي الذكي مع حسون
        </h2>
        <div className="bg-sky-600 bg-opacity-30 py-1 px-3.5 rounded-full text-xs font-bold leading-none">
          الكتاب المعتمد للصف الثالث 🇸🇩
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        
        {/* Intro Info Component */}
        <div className="bg-sky-50 border-2 border-sky-100 rounded-[25px] p-4 flex gap-4 items-start shrink-0">
          <div className="text-4xl shrink-0 animate-bounce">🦜</div>
          <div>
            <h3 className="text-sm font-black text-sky-900 mb-1">حمّلنا لك كامل فصول كتاب الرياضيات المدرسي للصف الثالث!</h3>
            <p className="text-gray-600 text-[11px] leading-relaxed font-semibold">
              اكتب أي موضوع ترغب بمراجعته بالأسفل (مثل "جدول السبعة"، "الكسور"، "طرح"، "قدم")، وسيبحث لك البطل "حسون" في مستندات المنهج المصدري ليعطيك القوانين الرسمية، النماذج المطبقة، وتمارين بخت الرضا التفاعلية مع فرصة كسب نجوم ذهبية جديدة! ⭐
            </p>
          </div>
        </div>

        {/* Dynamic Textbook Local Search Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => handleSearch()}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white p-3 px-6 rounded-xl font-black text-xs md:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> ابحث بداخل الكتاب
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن: جدول ضرب الثمانية، الكسور المتكافئة، الطرح..."
              className="flex-1 p-3 px-4 border-2 border-slate-200 focus:border-sky-400 focus:outline-none bg-white rounded-xl text-xs md:text-sm font-black"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>

          {/* Interactive Suggestions tags */}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-gray-400 font-black ml-1">توصيات سريعة:</span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(sug.query)}
                className="p-1 px-3 bg-white hover:bg-sky-50 border border-slate-200 text-sky-800 text-[10px] font-black rounded-full shadow-sm transition-transform active:scale-95"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results layout split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[300px]">
          
          {/* Left panel / Results matches list (lg:col-span-4) */}
          <div className="lg:col-span-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 p-4 space-y-3 overflow-y-auto max-h-[420px]">
            <h4 className="text-xs font-black text-slate-500 pb-2 border-b border-dashed border-slate-200">
              🔍 الفصول والدروس المطابقة ({searchResults.length})
            </h4>

            <AnimatePresence mode="popLayout">
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      soundEffects.playBeep();
                      setActiveLesson(item);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                      activeLesson?.id === item.id 
                        ? 'bg-sky-100/70 border-sky-300 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-sky-200'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] bg-slate-100 text-slate-500 p-0.5 px-2 rounded-full font-bold">
                        {item.page}
                      </span>
                      <strong className="text-xs font-black text-sky-800">
                        {item.unitName.split(' ')[1]} {/* simplified name */}
                      </strong>
                    </div>
                    <h5 className="text-xs md:text-sm font-black text-slate-800">
                      {item.lessonName}
                    </h5>
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-10 space-y-4">
                  <div className="text-4xl text-slate-300">📔</div>
                  <p className="text-xs font-bold text-slate-400">
                    {hasSearched 
                      ? 'عذراً يا بطل! لم نعثر على هذه الكلمة بالتحديد.. حاول تعديل الكلمات أو البحث بكلمات أبسط.' 
                      : 'الكتاب جاهز! اكتب كلمة للبحث أو اضغط أحد الأزرار السريعة بالأعلى لتصفح المحتويات.'
                    }
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel / Detailed Explanation (lg:col-span-7) */}
          <div className="lg:col-span-7 border-4 border-dashed border-slate-200 rounded-3xl p-5 relative overflow-y-auto max-h-[420px] bg-white">
            <AnimatePresence mode="wait">
              {activeLesson ? (
                <motion.div
                  key={activeLesson.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 text-right font-sans"
                >
                  {/* Lesson Meta Header */}
                  <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-sky-650 font-black block">{activeLesson.unitName}</span>
                      <h3 className="text-base font-black text-sky-950 mt-1">{activeLesson.lessonName}</h3>
                    </div>
                    <span className="bg-sky-500 text-white rounded-xl text-[10px] p-2 px-3 font-extrabold shadow-sm shrink-0">
                      {activeLesson.page}
                    </span>
                  </div>

                  {/* Core Explanation section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-teal-800 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" /> القواعد والتمارين المنهجية:
                    </h4>
                    <p className="bg-slate-50 p-4 rounded-xl text-xs md:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-line border border-slate-100">
                      {activeLesson.explanation}
                    </p>
                  </div>

                  {/* Real-world Example section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-amber-800 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4" /> مثال نموذجي من الكتاب:
                    </h4>
                    <p className="bg-amber-50/50 p-4 rounded-xl text-xs md:text-sm text-slate-705 leading-relaxed font-semibold whitespace-pre-line border border-amber-100">
                      {activeLesson.example}
                    </p>
                  </div>

                  {/* Textbook exercise mock session */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-indigo-800 flex items-center gap-1">
                      <Award className="w-4 h-4" /> تمرين بخت الرضا المحلول:
                    </h4>
                    <p className="bg-indigo-50/50 p-4 rounded-xl text-xs md:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-line border border-indigo-100">
                      {activeLesson.exercise}
                    </p>
                  </div>

                  {/* Audio read aloud action */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-550">
                    <div className="text-[10px] text-slate-400 font-black">
                      ⭐ لقد ربحت نجمتين لقرائتك لدرس {activeLesson.lessonName}!
                    </div>
                    <button
                      onClick={() => speakText(`${activeLesson.lessonName}. ${activeLesson.explanation}. مثال من الكتاب: ${activeLesson.example}`)}
                      className="p-2 px-4 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-black rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <Volume2 className="w-4 h-4" /> استمع لمحاضرة حسون 🗣️
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                  <BookOpen className="w-16 h-16 text-slate-200 animate-pulse" />
                  <h3 className="text-sm font-black text-slate-400">يرجى تحديد درس أو فصل من القائمة لعرض تفاصيله</h3>
                  <p className="text-[10px] text-slate-350 max-w-xs font-bold leading-normal">
                    بمجرّد كتابة موضوع والبحث، ستظهر شروحات الكتاب والأقسام والمستندات المحلولة هنا بطريقة متكاملة وممتعة.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
