import type {
  AbilityKey,
  AverageSalary,
  PersonalityKey,
  TrainingPlace,
} from "@/lib/diagnostic/types";
import type { RiasecCode } from "@/lib/guidance/types";

export interface OccupationFact {
  id: string;
  title: string;
  description: string;
  avodataUrl: string;
  domainSerials: number[];
  riasecCodes: RiasecCode[];
  abilityWeights: Partial<Record<AbilityKey, number>>;
  personalityWeights: Partial<Record<PersonalityKey, number>>;
  priorityKeywords: string[];
  requiredTraining: string[];
  trainingPlaces: TrainingPlace[];
  averageSalary: AverageSalary;
}

const LABOR_MARKET_SOURCE = "משרד העבודה";
const AVODATA_YEAR = 2022;

export const OCCUPATION_FACTS: OccupationFact[] = [
  {
    id: "software-developer",
    title: "מפתח/ת תוכנה",
    description:
      "פיתוח מערכות, אתרים או מוצרים דיגיטליים באמצעות שפות תכנות, כלי פיתוח ועבודת צוות טכנולוגית.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2512/226",
    domainSerials: [4, 30, 40],
    riasecCodes: ["I", "C", "R"],
    abilityWeights: {
      logic: 0.24,
      math: 0.16,
      computer: 0.24,
      attention: 0.12,
      workingMemory: 0.08,
      english: 0.08,
      visual: 0.08,
    },
    personalityWeights: {
      curiosity: 0.28,
      organization: 0.22,
      initiative: 0.2,
      resilience: 0.18,
      social: 0.12,
    },
    priorityKeywords: ["למידה", "חדשנות", "דיוק", "מקצועיות", "פתרון בעיות"],
    requiredTraining: [
      "תואר במדעי המחשב / הנדסת תוכנה או מסלול הנדסאי תוכנה",
      "אפשרות למסלולי Bootcamp או קורסי פיתוח מעשיים כתלות ברקע",
      "בניית תיק עבודות ופרויקטים ב-GitHub",
    ],
    trainingPlaces: [
      { name: "אוניברסיטאות ומכללות אקדמיות", type: "תואר אקדמי" },
      { name: "מכללות טכנולוגיות בפיקוח מה\"ט", type: "הנדסאי תוכנה" },
      { name: "Bootcamps וקורסי פיתוח מוכווני תעסוקה", type: "הכשרה מקצועית" },
    ],
    averageSalary: {
      monthlyGross: 36211,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום פיתוח תוכנה.",
    },
  },
  {
    id: "data-analyst",
    title: "דאטה אנליסט/ית",
    description:
      "איסוף, ניקוי, ניתוח והצגה של נתונים כדי לתמוך בקבלת החלטות עסקיות או ארגוניות.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2511/236",
    domainSerials: [4, 5, 9, 40],
    riasecCodes: ["I", "C", "E"],
    abilityWeights: {
      logic: 0.22,
      math: 0.22,
      computer: 0.2,
      attention: 0.14,
      filtering: 0.08,
      english: 0.07,
      hebrew: 0.07,
    },
    personalityWeights: {
      curiosity: 0.26,
      organization: 0.24,
      resilience: 0.16,
      initiative: 0.16,
      social: 0.1,
      empathy: 0.08,
    },
    priorityKeywords: ["דיוק", "למידה", "חוכמה", "מקצועיות", "עניין"],
    requiredTraining: [
      "תואר או קורס מעשי בנתונים, סטטיסטיקה, מערכות מידע או כלכלה",
      "שליטה ב-SQL, אקסל מתקדם וכלי BI",
      "היכרות עם Python או כלי ניתוח נתונים היא יתרון",
    ],
    trainingPlaces: [
      { name: "אוניברסיטאות ומכללות", type: "תואר / לימודי תעודה" },
      { name: "קורסי BI ו-Data Analysis", type: "הכשרה מקצועית" },
      { name: "קורסים מקוונים מונחי פרויקט", type: "השלמת תיק עבודות" },
    ],
    averageSalary: {
      monthlyGross: 26540,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום ניתוח מערכות.",
    },
  },
  {
    id: "qa-analyst",
    title: "בודק/ת תוכנה QA",
    description:
      "בדיקת מערכות תוכנה, זיהוי תקלות, כתיבת תרחישי בדיקה ושיפור איכות מוצר דיגיטלי לפני שחרור.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2519/232",
    domainSerials: [4, 40],
    riasecCodes: ["C", "I", "R"],
    abilityWeights: {
      attention: 0.22,
      filtering: 0.18,
      computer: 0.2,
      logic: 0.16,
      workingMemory: 0.1,
      hebrew: 0.07,
      english: 0.07,
    },
    personalityWeights: {
      organization: 0.28,
      resilience: 0.22,
      curiosity: 0.18,
      initiative: 0.16,
      social: 0.1,
      empathy: 0.06,
    },
    priorityKeywords: ["דיוק", "יסודיות", "דקדקנות", "איכות", "מקצועיות"],
    requiredTraining: [
      "קורס QA ידני או אוטומציה",
      "היכרות עם מתודולוגיות בדיקה, SQL וכלי ניהול באגים",
      "לאוטומציה: בסיס בתכנות ובבדיקות API",
    ],
    trainingPlaces: [
      { name: "מכללות טכנולוגיות וקורסי QA", type: "הכשרה מקצועית" },
      { name: "קורסי אוטומציה ובדיקות API", type: "הכשרה מתקדמת" },
    ],
    averageSalary: {
      monthlyGross: 21917,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום הבטחת איכות, ניתוח ובדיקת תוכנה.",
    },
  },
  {
    id: "it-project-manager",
    title: "מנהל/ת פרויקטים טכנולוגיים",
    description:
      "חיבור בין צרכים עסקיים, צוותים טכנולוגיים, לוחות זמנים ומשאבים כדי להוביל פרויקטי תוכנה או מערכות מידע.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2511/949",
    domainSerials: [4, 7, 34, 40],
    riasecCodes: ["E", "I", "C"],
    abilityWeights: {
      logic: 0.18,
      computer: 0.16,
      hebrew: 0.16,
      english: 0.12,
      attention: 0.12,
      filtering: 0.1,
      math: 0.08,
      workingMemory: 0.08,
    },
    personalityWeights: {
      initiative: 0.26,
      organization: 0.24,
      social: 0.2,
      resilience: 0.18,
      empathy: 0.08,
      curiosity: 0.04,
    },
    priorityKeywords: ["הובלה", "יוזמה", "תקשורתיות", "מקצועיות", "הישגיות"],
    requiredTraining: [
      "רקע במערכות מידע, תעשייה וניהול או ניהול פרויקטים",
      "היכרות עם Agile/Scrum וכלי ניהול משימות",
      "ניסיון עבודה בסביבה טכנולוגית הוא יתרון משמעותי",
    ],
    trainingPlaces: [
      { name: "תואר במערכות מידע / תעשייה וניהול", type: "תואר אקדמי" },
      { name: "קורסי ניהול פרויקטים ו-Agile", type: "הכשרה מקצועית" },
    ],
    averageSalary: {
      monthlyGross: 26540,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום ניתוח מערכות.",
    },
  },
  {
    id: "economist",
    title: "כלכלן/ית",
    description:
      "ניתוח מגמות, נתונים ושווקים כדי לסייע לארגונים לקבל החלטות פיננסיות, עסקיות או מדיניות.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2631/258",
    domainSerials: [5, 7, 9],
    riasecCodes: ["I", "E", "C"],
    abilityWeights: {
      math: 0.26,
      logic: 0.22,
      hebrew: 0.14,
      english: 0.1,
      attention: 0.1,
      filtering: 0.08,
      computer: 0.06,
      workingMemory: 0.04,
    },
    personalityWeights: {
      curiosity: 0.24,
      organization: 0.22,
      initiative: 0.18,
      resilience: 0.16,
      social: 0.12,
      empathy: 0.08,
    },
    priorityKeywords: ["חוכמה", "דיוק", "מקצועיות", "הישגיות", "למידה"],
    requiredTraining: [
      "תואר ראשון בכלכלה או תחום פיננסי קרוב",
      "שליטה באקסל, סטטיסטיקה בסיסית וכלי ניתוח נתונים",
      "לתפקידים מתקדמים: תואר שני או התמחות פיננסית",
    ],
    trainingPlaces: [
      { name: "אוניברסיטאות ומכללות אקדמיות", type: "תואר בכלכלה" },
      { name: "קורסי אקסל, BI וניתוח פיננסי", type: "הכשרה משלימה" },
    ],
    averageSalary: {
      monthlyGross: 22186,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום כלכלה.",
    },
  },
  {
    id: "graphic-designer",
    title: "מעצב/ת גרפי/ת",
    description:
      "פיתוח שפה חזותית, עיצוב דיגיטלי ופרינט, בניית מסרים חזותיים ועבודה עם לקוחות או צוותי מוצר/שיווק.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2166/133",
    domainSerials: [13, 14, 16, 29, 30],
    riasecCodes: ["A", "C", "I"],
    abilityWeights: {
      visual: 0.26,
      computer: 0.16,
      hebrew: 0.14,
      attention: 0.12,
      filtering: 0.08,
      logic: 0.08,
      english: 0.08,
      workingMemory: 0.08,
    },
    personalityWeights: {
      curiosity: 0.26,
      organization: 0.18,
      initiative: 0.16,
      social: 0.14,
      empathy: 0.14,
      resilience: 0.12,
    },
    priorityKeywords: ["יצירתיות", "אסתטיקה", "יופי", "מקוריות", "ייחודיות"],
    requiredTraining: [
      "לימודי עיצוב גרפי, תקשורת חזותית או UX/UI",
      "שליטה בכלי עיצוב דיגיטליים",
      "בניית תיק עבודות היא תנאי מרכזי להשתלבות",
    ],
    trainingPlaces: [
      { name: "מכללות לעיצוב ותקשורת חזותית", type: "תואר / תעודה" },
      { name: "קורסי UX/UI ועיצוב דיגיטלי", type: "הכשרה מקצועית" },
    ],
    averageSalary: {
      monthlyGross: 14109,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום עיצוב גרפי ועיצוב מולטימדיה.",
    },
  },
  {
    id: "education-instruction",
    title: "הוראה, הדרכה ופיתוח למידה",
    description:
      "העברת ידע, ליווי תהליכי למידה, הנחיית קבוצות ופיתוח תכנים חינוכיים או ארגוניים.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2351",
    domainSerials: [1, 22, 32],
    riasecCodes: ["S", "A", "E"],
    abilityWeights: {
      hebrew: 0.24,
      english: 0.1,
      attention: 0.12,
      filtering: 0.1,
      workingMemory: 0.1,
      logic: 0.08,
      visual: 0.08,
      computer: 0.08,
    },
    personalityWeights: {
      empathy: 0.26,
      social: 0.24,
      resilience: 0.18,
      initiative: 0.14,
      organization: 0.12,
      curiosity: 0.06,
    },
    priorityKeywords: ["למידה", "נתינה", "הקשבה", "משמעותיות", "תקשורתיות"],
    requiredTraining: [
      "תואר בחינוך / תעודת הוראה או הכשרת מדריכים",
      "להדרכה ארגונית: ניסיון בהנחיית קבוצות ופיתוח למידה",
      "לעיתים נדרשת התמחות בתחום תוכן מסוים",
    ],
    trainingPlaces: [
      { name: "מכללות אקדמיות לחינוך", type: "תואר ותעודת הוראה" },
      { name: "אוניברסיטאות ומכללות", type: "תואר בחינוך" },
      { name: "קורסי הנחיית קבוצות ופיתוח הדרכה", type: "הכשרה מקצועית" },
    ],
    averageSalary: {
      monthlyGross: 17673,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום מומחיות בשיטות הוראה.",
    },
  },
  {
    id: "social-worker",
    title: "עובד/ת סוציאלי/ת",
    description:
      "ליווי יחידים, משפחות וקהילות בהתמודדות עם אתגרים רגשיים, חברתיים ומערכתיים.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2635/279",
    domainSerials: [2, 3, 22, 33],
    riasecCodes: ["S", "A", "I"],
    abilityWeights: {
      hebrew: 0.2,
      attention: 0.14,
      filtering: 0.1,
      workingMemory: 0.1,
      logic: 0.1,
      english: 0.08,
      computer: 0.06,
      visual: 0.04,
    },
    personalityWeights: {
      empathy: 0.3,
      resilience: 0.22,
      social: 0.2,
      organization: 0.1,
      initiative: 0.1,
      curiosity: 0.08,
    },
    priorityKeywords: ["נתינה", "הקשבה", "רגישות", "צדק", "משמעותיות"],
    requiredTraining: [
      "תואר ראשון בעבודה סוציאלית",
      "רישום בפנקס העובדים הסוציאליים בהתאם לדרישות החוק",
      "התמחויות טיפוליות או קהילתיות לפי מסלול הקריירה",
    ],
    trainingPlaces: [
      { name: "אוניברסיטאות ומכללות אקדמיות", type: "תואר בעבודה סוציאלית" },
      { name: "הכשרות המשך טיפוליות/קהילתיות", type: "התמחות מקצועית" },
    ],
    averageSalary: {
      monthlyGross: 11673,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום עבודה סוציאלית וייעוץ בתחומי חברה ורווחה.",
    },
  },
  {
    id: "hr-coordinator",
    title: "רכז/ת משאבי אנוש וגיוס",
    description:
      "ליווי מועמדים ועובדים, ניהול תהליכי גיוס, תיעוד מידע ארגוני ותמיכה במנהלים ובצוותים.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/4416",
    domainSerials: [7, 8, 34, 35],
    riasecCodes: ["S", "E", "C"],
    abilityWeights: {
      hebrew: 0.2,
      english: 0.1,
      attention: 0.16,
      filtering: 0.12,
      computer: 0.12,
      logic: 0.08,
      workingMemory: 0.08,
      visual: 0.04,
    },
    personalityWeights: {
      empathy: 0.24,
      social: 0.24,
      organization: 0.18,
      resilience: 0.14,
      initiative: 0.12,
      curiosity: 0.08,
    },
    priorityKeywords: ["תקשורתיות", "הקשבה", "אמינות", "הוגנות", "סדר"],
    requiredTraining: [
      "תואר במדעי ההתנהגות, משאבי אנוש או תחום קרוב",
      "קורסי גיוס, דיני עבודה ומערכות HR",
      "ניסיון בשירות, אדמיניסטרציה או תיאום תהליכים הוא יתרון",
    ],
    trainingPlaces: [
      { name: "אוניברסיטאות ומכללות", type: "תואר במדעי ההתנהגות / HR" },
      { name: "קורסי גיוס ומשאבי אנוש", type: "הכשרה מקצועית" },
    ],
    averageSalary: {
      monthlyGross: null,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "יש להשלים שכר תחום מעודכן באינטגרציית הנתונים.",
    },
  },
  {
    id: "frontend-developer",
    title: "מפתח/ת Frontend",
    description:
      "בניית ממשקי משתמש אינטראקטיביים, חיבור בין עיצוב לטכנולוגיה ושיפור חוויית שימוש במוצרים דיגיטליים.",
    avodataUrl: "https://avodata.labor.gov.il/isco_group/2512/924",
    domainSerials: [4, 14, 30, 40],
    riasecCodes: ["I", "A", "C"],
    abilityWeights: {
      computer: 0.22,
      visual: 0.16,
      logic: 0.18,
      attention: 0.12,
      english: 0.1,
      hebrew: 0.08,
      filtering: 0.08,
      workingMemory: 0.06,
    },
    personalityWeights: {
      curiosity: 0.24,
      organization: 0.18,
      initiative: 0.18,
      empathy: 0.16,
      social: 0.14,
      resilience: 0.1,
    },
    priorityKeywords: ["יצירתיות", "חדשנות", "אסתטיקה", "למידה", "מקצועיות"],
    requiredTraining: [
      "קורס פיתוח Frontend או תואר/הנדסאי תוכנה",
      "שליטה ב-HTML, CSS, JavaScript ו-React",
      "תיק עבודות עם ממשקים אמיתיים",
    ],
    trainingPlaces: [
      { name: "קורסי Frontend ו-Fullstack", type: "הכשרה מקצועית" },
      { name: "מכללות טכנולוגיות", type: "הנדסאי תוכנה" },
      { name: "אוניברסיטאות ומכללות", type: "תואר במדעי המחשב" },
    ],
    averageSalary: {
      monthlyGross: 36211,
      source: LABOR_MARKET_SOURCE,
      sourceYear: AVODATA_YEAR,
      note: "שכר ממוצע בתחום פיתוח תוכנה.",
    },
  },
];
