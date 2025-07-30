import { v4 as uuidv4 } from "uuid";

// lib/constants/questions.ts

export interface Trait {
  id: string;
  text: string;
  type?: "trait";
}

export interface Question {
  id: string;
  number?: number;
  level?: string;
  question: string;
  options: string[];
  correct_option: number;
  type?: "question";
}

export const STEP1_QUESTIONS: Trait[] = [
  {
    id: "3ab40abc-83ce-43ed-a664-a660cda36347",
    text: "חשיבה יצירתית",
    type: "trait",
  },
  {
    id: "5848b9a0-0820-457c-8624-cc66f83cab5e",
    text: "יכולת הנהגה",
    type: "trait",
  },
  {
    id: "20005843-e78a-4f00-b781-2e1a92eb9e69",
    text: "סדר ודיוק",
    type: "trait",
  },
  {
    id: "f1a3b2c4-d5e6-7f89-0123-456789abcdef",
    text: "עבודה בצוות",
    type: "trait",
  },
  {
    id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    text: "קבלת החלטות",
    type: "trait",
  },
  {
    id: "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
    text: "למידה מהירה",
    type: "trait",
  },
  {
    id: "c3d4e5f6-a7b8-9012-3456-789abcdef012",
    text: "הובלת תהליכים",
    type: "trait",
  },
  {
    id: "d4e5f6a7-b8c9-0123-4567-89abcdef0123",
    text: "יכולת מכירה",
    type: "trait",
  },
  {
    id: "e5f6a7b8-c9d0-1234-5678-9abcdef01234",
    text: "ניהול אנשים",
    type: "trait",
  },
  {
    id: "f6a7b8c9-d0e1-2345-6789-abcdef012345",
    text: "ניהול פרויקטים",
    type: "trait",
  },
  {
    id: "a7b8c9d0-e1f2-3456-789a-bcdef0123456",
    text: "אוריינטציה שירותית",
    type: "trait",
  },
  {
    id: "b8c9d0e1-f2a3-4567-89ab-cdef01234567",
    text: "אוריינטציה טכנולוגית",
    type: "trait",
  },
  {
    id: "c9d0e1f2-a3b4-5678-9abc-def012345678",
    text: "יכולת שכנוע",
    type: "trait",
  },
  {
    id: "d0e1f2a3-b4c5-6789-abcd-ef0123456789",
    text: "כושר ביטוי",
    type: "trait",
  },
  { id: "e1f2a3b4-c5d6-789a-bcde-f01234567890", text: "כתיבה", type: "trait" },
  {
    id: "f2a3b4c5-d6e7-89ab-cdef-012345678901",
    text: "עמידה מול קהל",
    type: "trait",
  },
  {
    id: "a3b4c5d6-e7f8-9abc-def0-123456789012",
    text: "יכולת הקשבה",
    type: "trait",
  },
  { id: "b4c5d6e7-f8a9-abcd-ef01-234567890123", text: "אמפתיה", type: "trait" },
  {
    id: "c5d6e7f8-a9b0-bcde-f012-345678901234",
    text: "יחסי אנוש",
    type: "trait",
  },
  { id: "d6e7f8a9-b0c1-cdef-0123-456789012345", text: "עצמאות", type: "trait" },
  { id: "e7f8a9b0-c1d2-def0-1234-567890123456", text: "יוזמה", type: "trait" },
  {
    id: "f8a9b0c1-d2e3-ef01-2345-678901234567",
    text: "פתרון בעיות",
    type: "trait",
  },
  {
    id: "a9b0c1d2-e3f4-f012-3456-789012345678",
    text: "חשיבה אסטרטגית",
    type: "trait",
  },
  {
    id: "b0c1d2e3-f4a5-0123-4567-890123456789",
    text: "חשיבה ביקורתית",
    type: "trait",
  },
  {
    id: "c1d2e3f4-a5b6-1234-5678-901234567890",
    text: "יכולת ניתוח",
    type: "trait",
  },
  {
    id: "d2e3f4a5-b6c7-2345-6789-012345678901",
    text: "יכולת ארגון",
    type: "trait",
  },
  {
    id: "e3f4a5b6-c7d8-3456-789a-123456789012",
    text: "יכולת תכנון",
    type: "trait",
  },
  {
    id: "f4a5b6c7-d8e9-4567-89ab-234567890123",
    text: "יכולת ביצוע",
    type: "trait",
  },
  {
    id: "a5b6c7d8-e9f0-5678-9abc-345678901234",
    text: "יכולת עמידה בלחצים",
    type: "trait",
  },
  {
    id: "b6c7d8e9-f0a1-6789-abcd-456789012345",
    text: "יכולת עמידה בזמנים",
    type: "trait",
  },
  {
    id: "c7d8e9f0-a1b2-789a-bcde-567890123456",
    text: "יכולת התמודדות עם שינויים",
    type: "trait",
  },
  {
    id: "d8e9f0a1-b2c3-89ab-cdef-678901234567",
    text: "יכולת התמודדות עם כישלונות",
    type: "trait",
  },
  {
    id: "e9f0a1b2-c3d4-9abc-def0-789012345678",
    text: "יכולת התמודדות עם הצלחות",
    type: "trait",
  },
  {
    id: "f0a1b2c3-d4e5-abcd-ef01-890123456789",
    text: "יכולת התמודדות עם ביקורת",
    type: "trait",
  },
  {
    id: "a1b2c3d4-e5f6-bcde-f012-901234567890",
    text: "כאריזמה",
    type: "trait",
  },
  {
    id: "b2c3d4e5-f6a7-cdef-0123-012345678901",
    text: "מנהיגות",
    type: "trait",
  },
  {
    id: "c3d4e5f6-a7b8-def0-1234-123456789012",
    text: "לקיחת אחריות",
    type: "trait",
  },
  { id: "d4e5f6a7-b8c9-ef01-2345-234567890123", text: "אומץ", type: "trait" },
  { id: "e5f6a7b8-c9d0-f012-3456-345678901234", text: "נחישות", type: "trait" },
  { id: "f6a7b8c9-d0e1-0123-4567-456789012345", text: "משפחתי", type: "trait" },
  {
    id: "a7b8c9d0-e1f2-1234-5678-567890123456",
    text: "ידיים טובות",
    type: "trait",
  },
  {
    id: "b8c9d0e1-f2a3-2345-6789-678901234567",
    text: "טכנולוגי",
    type: "trait",
  },
  { id: "c9d0e1f2-a3b4-3456-789a-789012345678", text: "יעילות", type: "trait" },
  {
    id: "d0e1f2a3-b4c5-4567-89ab-890123456789",
    text: '"מתקתק" דברים',
    type: "trait",
  },
  {
    id: "e1f2a3b4-c5d6-5678-9abc-901234567890",
    text: "אינטליגנציה רגשית",
    type: "trait",
  },
  {
    id: "f2a3b4c5-d6e7-6789-abcd-012345678901",
    text: "אינטלקט מפותח",
    type: "trait",
  },
  { id: "a3b4c5d6-e7f8-789a-bcde-123456789012", text: "חברותי", type: "trait" },
  { id: "b4c5d6e7-f8a9-89ab-cdef-234567890123", text: "סקרנות", type: "trait" },
  {
    id: "c5d6e7f8-a9b0-9abc-def0-345678901234",
    text: "זריזות מחשבתית",
    type: "trait",
  },
  { id: "d6e7f8a9-b0c1-abcd-ef01-456789012345", text: "חמימות", type: "trait" },
  {
    id: "e7f8a9b0-c1d2-bcde-f012-567890123456",
    text: "יכולת הקשבה",
    type: "trait",
  },
  {
    id: "f8a9b0c1-d2e3-cdef-0123-678901234567",
    text: "כשרון אומנותי",
    type: "trait",
  },
  {
    id: "a9b0c1d2-e3f4-def0-1234-789012345678",
    text: "בטחון עצמי",
    type: "trait",
  },
  { id: "b0c1d2e3-f4a5-ef01-2345-890123456789", text: "צניעות", type: "trait" },
  {
    id: "c1d2e3f4-a5b6-f012-3456-901234567890",
    text: "מראה אסתטי",
    type: "trait",
  },
  {
    id: "d2e3f4a5-b6c7-0123-4567-012345678901",
    text: "אסרטיבי",
    type: "trait",
  },
  { id: "e3f4a5b6-c7d8-1234-5678-123456789012", text: "אמינות", type: "trait" },
  { id: "f4a5b6c7-d8e9-2345-6789-234567890123", text: "פתיחות", type: "trait" },
  { id: "a5b6c7d8-e9f0-3456-789a-345678901234", text: "נאמנות", type: "trait" },
  {
    id: "b6c7d8e9-f0a1-4567-89ab-456789012345",
    text: "מקוריות",
    type: "trait",
  },
  {
    id: "c7d8e9f0-a1b2-5678-9abc-567890123456",
    text: "אופטימיות",
    type: "trait",
  },
  {
    id: "d8e9f0a1-b2c3-6789-abcd-678901234567",
    text: "יצירתיות",
    type: "trait",
  },
  {
    id: "e9f0a1b2-c3d4-789a-bcde-789012345678",
    text: "אהבה לבעלי חיים",
    type: "trait",
  },
  {
    id: "f0a1b2c3-d4e5-89ab-cdef-890123456789",
    text: "חוש הומור",
    type: "trait",
  },
  {
    id: "a1b2c3d4-e5f6-9abc-def0-901234567890",
    text: "אופנתיות וסטייל",
    type: "trait",
  },
  {
    id: "b2c3d4e5-f6a7-abcd-ef01-012345678901",
    text: "רוחניות",
    type: "trait",
  },
  {
    id: "c3d4e5f6-a7b8-bcde-f012-123456789012",
    text: "שאפתנות",
    type: "trait",
  },
  {
    id: "d4e5f6a7-b8c9-cdef-0123-234567890123",
    text: "אותנטיות",
    type: "trait",
  },
  {
    id: "e5f6a7b8-c9d0-def0-1234-345678901234",
    text: "משיכה לטבע",
    type: "trait",
  },
  {
    id: "f6a7b8c9-d0e1-ef01-2345-456789012345",
    text: "הורות טובה",
    type: "trait",
  },
  {
    id: "a7b8c9d0-e1f2-f012-3456-567890123456",
    text: "כח פיזי",
    type: "trait",
  },
  {
    id: "b8c9d0e1-f2a3-0123-4567-678901234567",
    text: "חיבור לשפע",
    type: "trait",
  },
  {
    id: "c9d0e1f2-a3b4-1234-5678-789012345678",
    text: "ביצועיסט",
    type: "trait",
  },
  {
    id: "d0e1f2a3-b4c5-2345-6789-890123456789",
    text: "נמרצות אנרגטיות",
    type: "trait",
  },
  {
    id: "e1f2a3b4-c5d6-3456-789a-901234567890",
    text: "חשיבה אנליטית",
    type: "trait",
  },
  {
    id: "f2a3b4c5-d6e7-4567-89ab-012345678901",
    text: "ייצוגיות",
    type: "trait",
  },
  { id: "a3b4c5d6-e7f8-5678-9abc-123456789012", text: "חדות", type: "trait" },
  {
    id: "b4c5d6e7-f8a9-6789-abcd-234567890123",
    text: "חושניות",
    type: "trait",
  },
];

export const STEP2_QUESTIONS: Question[] = [
  {
    id: "8f8a0f4a-1d5e-4e3a-9f1a-2a0a8d0e1f01",
    number: 1,
    level: "אוצר מילים והקשרים",
    question: 'מהי המילה הקרובה ביותר במשמעותה ל: "שקדן"?',
    options: ["עצלן", "שקט", "חרוץ", "חשדן"],
    correct_option: 2,
  },
  {
    id: "7a2b1f3e-5c4d-4b2a-8e1f-9c0d7a6b5e02",
    number: 2,
    level: "אוצר מילים והקשרים",
    question: 'מהי המילה ההפוכה במשמעותה ל: "גלוי"?',
    options: ["עמום", "נעול", "נסתר", "שמרן"],
    correct_option: 2,
  },
  {
    id: "f3c2a1b4-6d7e-4a5b-9c8d-0e1f2a3b4c03",
    number: 3,
    level: "אוצר מילים והקשרים",
    question: 'מה פירוש הביטוי "חרף נפשו"?',
    options: ["התקרר בחורף", "החליט להתאבד", "חשף את רגשותיו", "סיכן את חייו"],
    correct_option: 3,
  },
  {
    id: "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c04",
    number: 4,
    level: "אוצר מילים והקשרים",
    question: 'באיזה משפט המילה "קבוע" משמשת במשמעות שונה?',
    options: [
      "יש לו כאב קבוע בגב.",
      "הפגישה נקבעה לשעה 12.",
      "השיבוץ הקבוע שלי הוא ביום שלישי.",
      "הוא עובד בעבודה קבועה.",
    ],
    correct_option: 1,
  },
  {
    id: "0c9d8e7f-6a5b-4c3d-8e1f-2a3b4c5d6e05",
    number: 5,
    level: "אוצר מילים והקשרים",
    question: 'מהו החומר המרכזי שאיתו עובד איש מקצוע המכונה "נפח"?',
    options: ["חול", "מתכת", "עץ", "נייר"],
    correct_option: 1,
  },
  {
    id: "1d2c3b4a-5e6f-7a8b-9c0d-1e2f3a4b5c06",
    number: 6,
    level: "תחביר והשלמת משפטים",
    question: "השלימו את המשפט: אילו הייתי יודע על הבעיה, ______ לך.",
    options: ["הייתי עוזר", "אוכל לעזור", "אני עוזר", "אעזור"],
    correct_option: 0,
  },
  {
    id: "2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a07",
    number: 7,
    level: "תחביר והשלמת משפטים",
    question: "איזה משפט מנוסח נכון?",
    options: [
      "החתול אכלה את כל הגבינה.",
      "הם הלכו במהירות לבית הספר.",
      "לעגבניה קליפה שצבעה אדומה.",
      "הילד יושן היטב כל לילה.",
    ],
    correct_option: 1,
  },
  {
    id: "3f4e5d6c-7b8a-9f0e-1d2c-3b4a5f6e7d08",
    number: 8,
    level: "תחביר והשלמת משפטים",
    question:
      "בחר את האפשרות התחבירית הלא נכונה: כאשר הגשם ירד, הילדים ______.",
    options: [
      "החליטו לשכוח מטריה",
      "רצו הביתה",
      "שמחו לקפץ בשלוליות",
      "נרטבו לגמרי",
    ],
    correct_option: 0,
  },
  {
    id: "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c09",
    number: 9,
    level: "תחביר והשלמת משפטים",
    question: "באיזה משפט יש שימוש שגוי בלשון רבים?",
    options: [
      "קיבלתי שתים עשרה תגובות.",
      "יש לי שלוש חתולים.",
      "שוחחנו עם חמשת השכנים.",
      "פגשנו ארבע חברות חדשות.",
    ],
    correct_option: 1,
  },
  {
    id: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d10",
    number: 10,
    level: "תחביר והשלמת משפטים",
    question: "מהי האפשרות שבה מתקיים שם הפועל?",
    options: [
      "הוא שוחה הרבה.",
      "הוא אוהב לשחות.",
      "המציל הזהיר את השוחים במים העמוקים.",
      "הילד שחה ללא מצופים.",
    ],
    correct_option: 1,
  },
  {
    id: "6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e11",
    number: 11,
    level: "כתיב נכון",
    question: "מהו הכתיב הנכון?",
    options: ["הכביש מתפטל", "הכביש מתפתל", "הכביש מטפתל", "הכביש מטפטל"],
    correct_option: 1,
  },
  {
    id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f12",
    number: 12,
    level: "כתיב נכון",
    question: "מהו הכתיב הנכון?",
    options: ["כביש מתעכל", "המזון התעקל", "מערכת העיכול", "מערכת האיכול"],
    correct_option: 2,
  },
  {
    id: "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a13",
    number: 13,
    level: "כתיב נכון",
    question:
      "בכל סעיף מילים הקשורות זו לזו. באיזה סעיף כל המילים כתובות נכון?",
    options: [
      "אורך, רוכב, גובה",
      "ניחוח, ריח, מסריח",
      "תפוז, אשקולית, קלמנטינה",
      "פאר, הוד, אדר",
    ],
    correct_option: 1,
  },
  {
    id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b14",
    number: 14,
    level: "כתיב נכון",
    question: 'מה פירוש הביטוי- "עשה לילות כימים"?',
    options: [
      "עבד ללא הפסקה, גם ביום וגם בלילה.",
      "ישן הרבה שעות.",
      "התבלבל בין יום ולילה.",
      "נח ביום ועבד בלילה.",
    ],
    correct_option: 0,
  },
  {
    id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c15",
    number: 15,
    level: "כתיב נכון",
    question: "איזו מן האפשרויות כוללת שגיאת כתיב?",
    options: ["מדבר בכנות", "אנשים כנים", "אדם כנה", "אני כן"],
    correct_option: 2,
  },
  {
    id: "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d16",
    number: 16,
    level: "הבנת הנקרא",
    question: "מהו הזמן האהוב על דני ביום?",
    options: ["הערב", "שחר", "לפני הצהריים", "אחר הצהריים"],
    correct_option: 1,
  },
  {
    id: "2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e17",
    number: 17,
    level: "הבנת הנקרא",
    question: "מה עושה דני בזמן שהוא מחכה?",
    options: ["מדבר עם חברים", "מדיטציה", "מקשיב לציפורים", "כותב ביומן"],
    correct_option: 2,
  },
  {
    id: "3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f18",
    number: 18,
    level: "הבנת הנקרא",
    question: "מדוע דני אוהב את הרגעים האלה?",
    options: [
      "כי הוא רואה בהם זמן שקט ושלו",
      "כי הוא לא אוהב את העיר",
      "כי האוטובוס תמיד מדייק",
      "כי חשוך קמעא",
    ],
    correct_option: 0,
  },
  {
    id: "4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a19",
    number: 19,
    level: "הבנת הנקרא",
    question: 'מהי המילה "מצייצות"?',
    options: ["שם עצם", "שם פועל", "פועל", "תואר"],
    correct_option: 2,
  },
  {
    id: "5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b20",
    number: 20,
    level: "הבנת הנקרא",
    question: "איזה משפט לא מתאר את הקטע?",
    options: [
      "דני נוסע כל בוקר באוטובוס.",
      "דני מקשיב לציפורים.",
      "דני לא אוהב את העיר.",
      "דני נהנה מהשקט של הבוקר לפני שהעיר מתעוררת.",
    ],
    correct_option: 2,
  },
];

export const STEP3_QUESTIONS: Question[] = [
  {
    id: "12345678-1234-5678-9abc-123456789001",
    number: 1,
    level: "Beginner",
    question: "What is the plural of 'child'?",
    options: ["Childs", "Children", "Childes", "Child"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789002",
    number: 2,
    level: "Beginner",
    question: "Choose the correct verb form: 'She ___ to the store.'",
    options: ["Go", "Goes", "Gone", "Going"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789003",
    number: 3,
    level: "Beginner",
    question: "Which of these is a pronoun?",
    options: ["Run", "Happy", "He", "Quickly"],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789004",
    number: 4,
    level: "Beginner",
    question: "What is the past tense of 'eat'?",
    options: ["Eated", "Ate", "Eaten", "Eat"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789005",
    number: 5,
    level: "Beginner",
    question: "Which of the following is a preposition?",
    options: ["Run", "Quickly", "Under", "Beautiful"],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789006",
    number: 6,
    level: "Beginner",
    question: "Select the correct sentence structure.",
    options: [
      "She is a doctor good.",
      "She a good doctor is.",
      "She is a good doctor.",
      "A good doctor she is.",
    ],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789007",
    number: 7,
    level: "Beginner",
    question: "What does 'it's' stand for?",
    options: ["It is", "It was", "It has", "Possessive form of it"],
    correct_option: 0,
  },
  {
    id: "12345678-1234-5678-9abc-123456789008",
    number: 8,
    level: "Beginner",
    question: "Which word is an adjective?",
    options: ["Sing", "Song", "Beautifully", "Beautiful"],
    correct_option: 3,
  },
  {
    id: "12345678-1234-5678-9abc-123456789009",
    number: 9,
    level: "Beginner",
    question: "Choose the correct form: 'They ___ watching TV.'",
    options: ["is", "am", "are", "be"],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789010",
    number: 10,
    level: "Beginner",
    question: "What is the comparative form of 'good'?",
    options: ["Gooder", "More good", "Better", "Best"],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789011",
    number: 11,
    level: "Beginner",
    question: "Which sentence uses punctuation correctly?",
    options: [
      "Lets eat grandma.",
      "Let's eat, grandma.",
      "Lets eat, grandma.",
      "Let's eat grandma.",
    ],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789012",
    number: 12,
    level: "Beginner",
    question: "Identify the noun in the sentence: 'The cat slept peacefully.'",
    options: ["The", "cat", "slept", "peacefully"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789013",
    number: 13,
    level: "Beginner",
    question: "What is the opposite of 'happy'?",
    options: ["Angry", "Sad", "Excited", "Tired"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789014",
    number: 14,
    level: "Beginner",
    question: "Which of these is a conjunction?",
    options: ["And", "On", "Jump", "Quick"],
    correct_option: 0,
  },
  {
    id: "12345678-1234-5678-9abc-123456789015",
    number: 15,
    level: "Beginner",
    question: "Choose the correct spelling.",
    options: ["Neccessary", "Necesary", "Necessary", "Necessery"],
    correct_option: 2,
  },
  {
    id: "12345678-1234-5678-9abc-123456789016",
    number: 16,
    level: "Beginner",
    question: "What type of word is 'quickly'?",
    options: ["Adjective", "Verb", "Noun", "Adverb"],
    correct_option: 3,
  },
  {
    id: "12345678-1234-5678-9abc-123456789017",
    number: 17,
    level: "Beginner",
    question: "Which sentence is in the passive voice?",
    options: [
      "The dog chased the ball.",
      "The ball was chased by the dog.",
      "The dog is chasing the ball.",
      "The ball is being chased by the dog.",
    ],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789018",
    number: 18,
    level: "Beginner",
    question: "What is the superlative form of 'big'?",
    options: ["Bigger", "Biggest", "More big", "Most big"],
    correct_option: 1,
  },
  {
    id: "12345678-1234-5678-9abc-123456789019",
    number: 19,
    level: "Beginner",
    question: "Fill in the blank: 'She has been waiting ___ a long time.'",
    options: ["for", "since", "at", "in"],
    correct_option: 0,
  },
  {
    id: "12345678-1234-5678-9abc-123456789020",
    number: 20,
    level: "Beginner",
    question: "Which of the following is a modal verb?",
    options: ["Can", "Eat", "Play", "Walk"],
    correct_option: 0,
  },
];

export interface AnchorQuestion {
  id: string;
  text: string;
  type: "anchor";
}

export const STEP4_QUESTIONS: AnchorQuestion[] = [
  {
    id: "12345678-1234-5678-9abc-124456789001",
    text: "אני פורח כשיש לי אתגר קשה במיוחד ועלי האחריות לפצח ולפתור אותו.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789002",
    text: "השאיפה שלי היא להקדיש זמן וקודם כל להפוך למומחה בתחום מסויים ולהעמיק בו באופן מתמיד גם אם זה על חשבון ניהול וקידום.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789003",
    text: "אני לא רוצה שהעבודה תשתלט על חיי- אני שואף לאיזון אמיתי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789004",
    text: "לפני כמה אני מרוויח, קודם כל חשוב לי שתהיה לי שליטה על מה, איך ומתי אני עושה את העבודה שלי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789005",
    text: "גם אם אצטרך לוותר על ניהול או עבודה יצירתית, אתן עדיפות לרוגע ו-ודאות לטווח הארוך.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789006",
    text: "מרגש אותי הרעיון של להקים משהו מאפס ולראות אותו גדל.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789007",
    text: "אני מעדיף לעבוד לבד או בצוות כשניתן לי מרחב ויכולת לקבוע לעצמי את סדרי העבודה.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789008",
    text: "לפני שכר או קידום אבדוק אם בעבודה שלי יש לעשייה שלי משמעות ערכית.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789009",
    text: "מרתק אותי להתבונן על מערכות שלמות מלמעלה ולפעול לשפר אותן.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789010",
    text: "חשוב לי להתחרות גם בעצמי וגם באחרים- ולנצח כל אתגר.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789011",
    text: "חשוב לי לבנות שם של מומחה ולהיות האדם שפונים אליו כשיש בעיה מקצועית בתחום מסויים.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789012",
    text: "אני מלא ברעיונות וחושב על דרכים להפוך אותם לממשיים.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789013",
    text: "חשוב לי שהעבודה שלי תתרום לחיים על הפלנטה, תועיל לחברה, לאנשים, לסביבה, לטבע וכו'.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789014",
    text: "אני אוהב לקחת אחריות כוללת, גם אם איני מומחה בכל נושא ספציפי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789015",
    text: "אני אבחר מקום עבודה לפני שאר השיקולים- קודם כל לפי עד כמה הוא מתאים לצרכים האישיים והמשפחתיים שלי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789016",
    text: "אני שואף להגיע לתפקידי ניהול בכירים ולהוביל צוותים.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789017",
    text: "אני רוצה ליזום, לקבוע את החוקים, לנהל פרוייקט באופן עצמאי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789018",
    text: "אני מעדיף לעבוד במקום קבוע וברור, גם אם השכר אינו גבוה במיוחד.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789019",
    text: "אני פחות אוהב שמכתיבים לי- אני מרגיש שאני חייב חופש כדי לעבוד טוב יותר ולהיות במיטבי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789020",
    text: "דבר ראשון לפני מה אני עושה, חשוב לי לדעת שיש גיבוי, ביטוחים, חוזה מסודר ויציבות לאורך זמן.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789021",
    text: "אני משתעמם מהר ממשימות שגרתיות או קלות מדי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789022",
    text: "חשוב לי להיות ממוקד בתחום אחד, להעשיר את עצמי בתחום ולהגיע בו לשליטה מקצועית מלאה.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789023",
    text: "אני חייב לחוש תחושת שליחות ומשמעות בעשייה שלי.",
    type: "anchor",
  },
  {
    id: "12345678-1234-5678-9abc-124456789024",
    text: "עבודה שמונעת ממני לטפח את חיי הפרט או המשפחה או התחביבים שלי מבחינת הזמן והאנרגיה שאני צריך לכך - לא מתאימה לי.",
    type: "anchor",
  },
];
export interface LogicalQuestion {
  id: string;
  number: number;
  level: string;
  question: string;
  options: string[];
  correct_option: number; // zero-based index
}

export interface ShapeQuestion {
  id: string;
  number: number;
  level: string;
  question: string; // Path to main pattern image
  options: string[]; // Paths to option images
  correct_option: number;
  type: "shape";
}

export const STEP5_QUESTIONS: LogicalQuestion[] = [
  {
    id: "7a1be7a4-2f08-4a5b-9d16-9f2c9b8d0101",
    number: 1,
    level: "לוגיקה – היסקים וקיום",
    question: "נתון: כל הדוכיפתים סגולים. יש דוכיפתים עם כובע. מה בהכרח נכון?",
    options: [
      "כל בעלי הכובע הם דוכיפתים",
      "יש דוכיפתים עם כובע שאינם סגולים",
      "יש בעלי כובע סגולים",
      "כל הסגולים הם דוכיפתים",
    ],
    correct_option: 2,
  },
  {
    id: "2b3c9f95-5d36-4c86-b2a5-3d1e7a4b0202",
    number: 2,
    level: "לוגיקה – כלליות מול קיום",
    question: "נתון: כל הארנבים קוראים שירה. מה לא ניתן להסיק?",
    options: [
      "אם יצור הוא ארנב – הוא קורא שירה",
      "ייתכן שאין ארנבים",
      "יש יצורים שקוראים שירה",
      "אם יצור לא קורא שירה – הוא לא ארנב",
    ],
    correct_option: 2,
  },
  {
    id: "3c4d0ea6-6e47-4d97-c3b6-4e2f8b5c0303",
    number: 3,
    level: "לוגיקה – שרשרת היסקים",
    question:
      "נתון: כל הנגרים חרוצים. כל החרוצים משכימים קום. מה המסקנה הנכונה?",
    options: [
      "כל המשכימים קום הם נגרים",
      "כל הנגרים משכימים קום",
      "חלק מהנגרים אינם משכימים קום",
      "יש נגרים שאינם חרוצים",
    ],
    correct_option: 1,
  },
  {
    id: "4d5e1fb7-7f58-4ea8-9d77-5f3a9c6d0404",
    number: 4,
    level: "לוגיקה – חיתוך ואיחוד",
    question:
      "נתון: יש מדענים שאוהבים גלידה. יש מדענים שאוהבים עוגה. מה ניתן להסיק?",
    options: [
      "יש מדענים שאוהבים גם גלידה וגם עוגה",
      "כל המדענים אוהבים גלידה או עוגה",
      "יש לפחות שני מדענים שונים",
      "לא ניתן להסיק שאותו אדם אוהב את שניהם",
    ],
    correct_option: 3,
  },
  {
    id: "5e6f20c8-8a69-4fb9-8e88-6a4bad7e0505",
    number: 5,
    level: "לוגיקה – תנאי הכרחי/מספיק וביקונדיציה",
    question:
      "נתון: אם ורק אם עובד מגיע בזמן – הוא מקבל בונוס. איזו טענה נובעת בהכרח?",
    options: [
      "אם עובד מקבל בונוס – הוא הגיע בזמן",
      "אם עובד לא מקבל בונוס – ייתכן שהגיע בזמן",
      "אם עובד הגיע בזמן – ייתכן שלא יקבל בונוס",
      "אין קשר בין הגעה בזמן לבונוס",
    ],
    correct_option: 0,
  },
  {
    id: "6f7021d9-9b7a-41ca-9f99-7b5cbe8f0606",
    number: 6,
    level: "לוגיקה – שלילה",
    question: "מהי השלילה של הטענה 'כל החתולים שקטים'?",
    options: [
      "אין חתולים שקטים",
      "יש חתולים שאינם שקטים",
      "יש חתול שקט",
      "כל החתולים אינם שקטים",
    ],
    correct_option: 1,
  },
  {
    id: "708132ea-ab8b-42db-8aa0-8c6dcf900707",
    number: 7,
    level: "לוגיקה – 'רק אם' (תנאי הכרחי)",
    question:
      "כיבוי מערכת האזעקה מתרחש רק אם הוזן קוד מנהל. מה נכון לגבי היחס הלוגי?",
    options: [
      "הזנת קוד מנהל היא תנאי מספיק לכיבוי",
      "הזנת קוד מנהל היא תנאי הכרחי לכיבוי",
      "הכיבוי הוא תנאי הכרחי להזנת קוד",
      "אין קשר לוגי בין האירועים",
    ],
    correct_option: 1,
  },
  {
    id: "819243fb-bc9c-43ec-8bb1-9d7edf010808",
    number: 8,
    level: "לוגיקה – שלילה וקבוצות",
    question:
      "נתון: אין פילים מעופפים. יש יצורים מעופפים שהם מוזיקאים. מה נכון?",
    options: [
      "יש פילים שהם מוזיקאים",
      "אין מוזיקאים שהם פילים",
      "כל המעופפים אינם פילים",
      "אין להסיק דבר על פילים ומוזיקאים",
    ],
    correct_option: 2,
  },
  {
    id: "92a3540c-cdad-44fd-9cc2-ad8fef120909",
    number: 9,
    level: "לוגיקה – היסק מתוך כלל וקיום",
    question:
      "נתון: כל החניכים לובשים חולצה כחולה. יש חניכים עם כובע אדום. מה בהכרח נכון?",
    options: [
      "כל בעלי הכובע האדום לובשים כחול",
      "יש מי שלובש כחול וכובע אדום",
      "כל לובשי הכחול חובשים כובע אדום",
      "אין חניכים בלי כובע אדום",
    ],
    correct_option: 1,
  },
  {
    id: "a3b4651d-debe-450e-8dd3-be9010230a0a",
    number: 10,
    level: "לוגיקה – היתכנות מול הכרח",
    question:
      "נתון: כל השחיינים ספורטאים. חלק מהספורטאים מוזיקאים. מה בהכרח נכון?",
    options: [
      "יש שחיינים מוזיקאים",
      "כל המוזיקאים שחיינים",
      "ייתכן שאין שחיינים מוזיקאים",
      "כל הספורטאים שחיינים",
    ],
    correct_option: 2,
  },
  {
    id: "b4c5762e-efcf-461f-9ee4-cfa120340b0b",
    number: 11,
    level: "לוגיקה – קונטרפוזיטיב",
    question:
      "נתון: אם עץ הוא תפוח אז הוא נשיר. אם עץ אינו נשיר – הוא אינו תפוח. מה מתואר כאן?",
    options: [
      "היפוך לא לגיטימי",
      "סתירה פנימית",
      "טענה וצורת הנגד-מסקנה שלה",
      "טענות בלתי תלויות",
    ],
    correct_option: 2,
  },
  {
    id: "c5d6873f-f0d0-4720-8ff5-d0b231450c0c",
    number: 12,
    level: "לוגיקה – תנאי מספיק",
    question: 'נתון: "סטודנט יקבל גישה למעבדה אם עבר את ההדרכה". מה נכון?',
    options: [
      '"עבר הדרכה" הוא תנאי מספיק ל"גישה למעבדה"',
      '"עבר הדרכה" הוא תנאי הכרחי בלבד',
      '"גישה למעבדה" גוררת "עבר הדרכה"',
      "אין קשר",
    ],
    correct_option: 0,
  },
  {
    id: "d6e79840-01e1-4831-9006-e1c342560d0d",
    number: 13,
    level: "לוגיקה – שלילת קיום",
    question: "מהי השלילה של הטענה: יש מתכנתים שאינם אוהבים בדיקות יחידה?",
    options: [
      "אין מתכנתים כלל",
      "כל המתכנתים אוהבים בדיקות יחידה",
      "יש מתכנתים שאוהבים בדיקות יחידה",
      "רוב המתכנתים אוהבים בדיקות יחידה",
    ],
    correct_option: 1,
  },
  {
    id: "e7f8a951-12f2-4942-8117-f2d453670e0e",
    number: 14,
    level: "לוגיקה – שלילה וחיתוך",
    question: "נתון: אין סופרים שהם טבחים. יש טבחים שהם משוררים. מה נכון?",
    options: [
      "אין משוררים שהם סופרים",
      "אין טבחים שהם סופרים",
      "יש סופרים שהם משוררים",
      "כל המשוררים הם טבחים",
    ],
    correct_option: 1,
  },
  {
    id: "f809ba62-23f3-4a53-9228-03e564780f0f",
    number: 15,
    level: "לוגיקה – קונטרפוזיציה",
    question: "נתון: כל המנהלים קרי-רוח. איזו טענה חייבת להיות נכונה?",
    options: [
      "יש מנהלים",
      "אם מישהו אינו קר-רוח – הוא אינו מנהל",
      "כל הקרי-רוח הם מנהלים",
      "חלק מהמנהלים אינם קרי-רוח",
    ],
    correct_option: 1,
  },
  {
    id: "081acb73-34f4-4b64-9339-14f675890010",
    number: 16,
    level: "לוגיקה – 'אם ורק אם'",
    question: "איזו הצמדה שקולה לטענה 'אם ורק אם X אז Y'?",
    options: [
      '"אם X אז Y" ו"אם Y אז X"',
      '"רק אם X אז Y" בלבד',
      '"רק אם Y אז X" בלבד',
      '"אם לא X אז לא Y" בלבד',
    ],
    correct_option: 0,
  },
  {
    id: "192bdc84-45f5-4c75-a44a-25f7869a0111",
    number: 17,
    level: "לוגיקה – 'רק אם' (הכרחי)",
    question:
      "נתון: רק אם שרון עברה את הראיון – היא תוזמן לחתימת חוזה. מה נכון?",
    options: [
      "הזמנה לחוזה היא תנאי הכרחי למעבר הראיון",
      "מעבר ראיון הוא תנאי הכרחי להזמנה לחוזה",
      "מעבר ראיון הוא תנאי מספיק להזמנה לחוזה",
      "אין יחסי תנאי בין המשפטים",
    ],
    correct_option: 1,
  },
  {
    id: "2a3ced95-56f6-4d86-b55b-36f897ab0122",
    number: 18,
    level: "לוגיקה – יחס בין קבוצות",
    question:
      "נתון: כל הטבלאות עשויות עץ. יש רהיטים שאינם עשויי עץ. מה ניתן להסיק?",
    options: [
      "יש טבלאות שאינן רהיטים",
      "יש רהיטים שאינם טבלאות",
      "כל הרהיטים הן טבלאות",
      "אין רהיטים כלל",
    ],
    correct_option: 1,
  },
  {
    id: "3b4dfea6-67f7-4e97-c66c-47f9a1bc0133",
    number: 19,
    level: "לוגיקה – מסקנה שאינה מתחייבת",
    question:
      "נתון: כל החוקרים קוראים מאמרים. חלק מקוראי המאמרים הם סטודנטים. איזו מסקנה אינה מתחייבת?",
    options: [
      "ייתכן שחוקרים מסוימים הם סטודנטים",
      "כל החוקרים הם קוראי מאמרים",
      "כל הסטודנטים הם חוקרים",
      "ייתכן שיש סטודנטים שאינם חוקרים",
    ],
    correct_option: 2,
  },
  {
    id: "4c5e10b7-78f8-4fa8-d77d-58f0b2cd0144",
    number: 20,
    level: "לוגיקה – היסק חלקי",
    question:
      "נתון: אין מתעמלים שהם ישנוניים. כל הישנוניים מאחרים לשיעור. מה בהכרח נכון?",
    options: [
      "אין מתעמלים שמאחרים לשיעור",
      "כל המאחרים לשיעור הם מתעמלים",
      "יש מתעמלים שאינם מאחרים",
      "אי-אפשר להסיק דבר על איחורים של מתעמלים",
    ],
    correct_option: 3,
  },
];

export const STEP6_QUESTIONS: ShapeQuestion[] = [
  {
    id: "step6_shape_question_1",
    number: 1,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/1.png",
    options: [
      "/shapes/1.1.png",
      "/shapes/1.2.png",
      "/shapes/1.3.png",
      "/shapes/1.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "step6_shape_question_2",
    number: 2,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/2.png",
    options: [
      "/shapes/2.1.png",
      "/shapes/2.2.png",
      "/shapes/2.3.png",
      "/shapes/2.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "step6_shape_question_3",
    number: 3,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/3.png",
    options: [
      "/shapes/3.1.png",
      "/shapes/3.2.png",
      "/shapes/3.3.png",
      "/shapes/3.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
];

export const ALL_QUESTIONS: (Trait | Question | AnchorQuestion)[] = [
  ...STEP1_QUESTIONS,
  ...STEP2_QUESTIONS,
  ...STEP3_QUESTIONS,
  ...STEP4_QUESTIONS,
];

function isTrait(
  question: Trait | Question | AnchorQuestion
): question is Trait {
  return "text" in question && (question as any).type === "trait";
}

function isAnchorQuestion(
  question: Trait | Question | AnchorQuestion
): question is AnchorQuestion {
  return "text" in question && (question as any).type === "anchor";
}

function isQuestion(
  question: Trait | Question | AnchorQuestion
): question is Question {
  return "question" in question;
}

export const getQuestionText = (id: string): string | undefined => {
  const question = ALL_QUESTIONS.find((q) => q.id === id);
  if (!question) {
    return undefined;
  }

  if (isTrait(question) || isAnchorQuestion(question)) {
    return question.text;
  } else {
    return question.question;
  }
};
