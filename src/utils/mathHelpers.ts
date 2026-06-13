// Convert numbers up to 9999 to Arabic text suitable for Sudanese Primary 3 textbook
// Example:
// 1510 => "ألف وخمسمئة وعشرة" or "عشرة وخمسمئة وألف"
// 4303 => "أربعة آلاف وثلاثمئة وثلاثة"
// 2001 => "ألفان وواحد"

export function numberToArabicWords(num: number): string {
  if (num === 0) return "صفر";
  
  const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  // tens for 10-90
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  // hundreds for 100-900
  const hundreds = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];
  // thousands for 1000-9000
  const thousands = ["", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"];

  let resultParts: string[] = [];

  const th = Math.floor(num / 1000);
  const h = Math.floor((num % 1000) / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;

  // Sudanese book supports two reading directions, e.g. "أربعة آلاف وثلاثمئة وثلاثة"
  // Let's implement the standard modern one which is Thousands -> Hundreds -> Units -> Tens
  
  if (th > 0) {
    resultParts.push(thousands[th]);
  }
  
  if (h > 0) {
    resultParts.push(hundreds[h]);
  }
  
  if (u === 0 && t > 0) {
    resultParts.push(tens[t]);
  } else if (u > 0 && t === 0) {
    resultParts.push(units[u]);
  } else if (u > 0 && t > 0) {
    if (t === 1) {
      if (u === 1) {
        resultParts.push("أحد عشر");
      } else if (u === 2) {
        resultParts.push("اثنا عشر");
      } else {
        resultParts.push(`${units[u]} عشر`);
      }
    } else {
      resultParts.push(`${units[u]} و${tens[t]}`);
    }
  }

  // Join parts with 'و'
  return resultParts.filter(p => p !== "").join(" و");
}

// Convert Western Arabic digits (0-9) to Eastern Arabic digits (٠-٩)
export function toArabicNumerals(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return "";
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

