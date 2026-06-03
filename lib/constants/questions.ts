import { v4 as uuidv4 } from "uuid"

// lib/constants/questions.ts

export interface Trait {
  id: string
  text: string
  type?: "trait"
}

export interface Question {
  id: string
  number?: number
  level?: string
  question: string
  options: string[]
  correct_option: number
  type?: "question"
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
    id: "a7b8c9d0-e1f2-1234-5678-abcde0123456",
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
    text: "יכולת הכלה",
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
    id: "a0b1c2d3-e4f5-4a5b-8c9d-0e1f2a3b4c5d",
    text: "חוש הומור",
    type: "trait",
  },
  {
    id: "a1b2c3d4-e5f6-bcde-f012-901234567891",
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
]

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
      "חשוך קמעא",
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
]

export const STEP3_QUESTIONS: Question[] = [
  {
    id: "2e8c8e6c-6a06-47a6-8e9e-1c6f0a1f9b01",
    number: 1,
    level: "Reading Comprehension",
    question:
      "Read the sentence: John is always late for work because he wakes up too __.",
    options: ["early", "fast", "late", "lazy"],
    correct_option: 2,
  },
  {
    id: "3fe2f3d9-3d5d-4e2b-8f59-7d5a2a7e9b02",
    number: 2,
    level: "Reading Comprehension",
    question:
      'Read the short text: "Sophie enjoys cooking Italian food. Her favorite dish is pasta, and she often invites friends over for dinner". What does Sophie like to do?',
    options: [
      "Eat at restaurants",
      "Invite strangers to her house",
      "Cook Italian food",
      "Order pizza",
    ],
    correct_option: 2,
  },
  {
    id: "a7f4b4e0-cf8e-4d6a-8f63-35b6a9b0e903",
    number: 3,
    level: "Reading Comprehension",
    question: "Read the sentence: He didn't go to school because he __ a cold.",
    options: ["have", "had", "has", "having"],
    correct_option: 1,
  },
  {
    id: "1b5a3c1e-22c1-4a2d-9b7b-9a7f7e9c4d04",
    number: 4,
    level: "Grammar",
    question: "Which sentence is correct?",
    options: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day.",
    ],
    correct_option: 1,
  },
  {
    id: "98a7b2f1-0a8c-4f61-8f80-2c9e6c7a1e05",
    number: 5,
    level: "Grammar",
    question: "Choose the correct word: I have two __.",
    options: ["child", "childs", "children", "childrens"],
    correct_option: 2,
  },
  {
    id: "4c2e9a67-8f3c-4e88-9c2a-1b0b4b9a6f06",
    number: 6,
    level: "Grammar",
    question: "Which question is correct?",
    options: [
      "Where you live?",
      "Where do you live?",
      "Where does you live?",
      "Where living you?",
    ],
    correct_option: 1,
  },
  {
    id: "5f9b3a24-6d3e-41d8-8f95-7e1a2c0b7a07",
    number: 7,
    level: "Vocabulary",
    question: 'What is the opposite of "expensive"?',
    options: ["Cheap", "Large", "Strong", "Fast"],
    correct_option: 0,
  },
  {
    id: "71c8f4d1-2e3b-4bfb-9f0e-0a7b3e2d5c08",
    number: 8,
    level: "Vocabulary",
    question:
      "Choose the word that best completes the sentence: The sun is very __ today.",
    options: ["cold", "rainy", "bright", "dark"],
    correct_option: 2,
  },
  {
    id: "c3e2a9b1-0b1a-487b-9c3d-5f7a6e2d9a09",
    number: 9,
    level: "Vocabulary",
    question: 'What does "hungry" mean?',
    options: ["Tired", "Angry", "Thirsty", "Wanting to eat"],
    correct_option: 3,
  },
  {
    id: "b2d7f1a3-7c4a-4b9c-8d2e-6f1e2a3c4b10",
    number: 10,
    level: "Verbs & Tenses",
    question:
      "Choose the correct past form of the verb: He __ a letter yesterday.",
    options: ["writes", "write", "wrote", "written"],
    correct_option: 2,
  },
  {
    id: "e7a1c2b3-4d5e-4f6a-9b8c-1a2d3e4f5a11",
    number: 11,
    level: "Verbs & Tenses",
    question: 'What is the present continuous form of "play"?',
    options: ["Plays", "Playing", "Is playing", "Play"],
    correct_option: 2,
  },
  {
    id: "0a9c8b7d-6e5f-4a3b-9c1d-2e3f4a5b6c12",
    number: 12,
    level: "Verbs & Tenses",
    question: "Choose the correct sentence:",
    options: [
      "We was happy.",
      "We were happy.",
      "We be happy.",
      "We are happy yesterday",
    ],
    correct_option: 1,
  },
  {
    id: "9f1e2d3c-4b5a-6c7d-8e9f-0a1b2c3d4e13",
    number: 13,
    level: "Functional Language",
    question: "You are in a restaurant. What do you say?",
    options: [
      "Can I have the menu, please?",
      "Where is the homework?",
      "Open your books.",
      "I’m watching TV.",
    ],
    correct_option: 0,
  },
  {
    id: "6a5b4c3d-2e1f-0a9b-8c7d-6e5f4a3b2c14",
    number: 14,
    level: "Functional Language",
    question: 'You are at the airport. What does this sign mean: "Departures"?',
    options: ["Luggage", "Arrivals", "Security", "Flights leaving"],
    correct_option: 3,
  },
  {
    id: "3d2c1b0a-9e8f-7d6c-5b4a-3c2d1e0f9a15",
    number: 15,
    level: "Functional Language",
    question: 'You see a sign: "Keep off the grass." What does it mean?',
    options: [
      "You can sit on the grass",
      "You must not walk on the grass",
      "You can pick flowers",
      "You should water the grass",
    ],
    correct_option: 1,
  },
]

export interface AnchorQuestion {
  id: string
  text: string
  type: "anchor"
}

export const STEP4_QUESTIONS: AnchorQuestion[] = [
  {
    id: "12345678-1234-5678-9abc-124456789001",
    text: "אני פורח כשיש לי אתגר קשה ועלי האחריות לפצח ולפתור אותו.",
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
    text: "חשוב לי להתחרות גם בעצמי וגם באחרים - ולנצח כל אתגר.",
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
    text: "אני אבחר מקום עבודה לפני שאר השיקולים - קודם כל לפי עד כמה הוא מתאים לצרכים האישיים והמשפחתיים שלי.",
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
]

export interface LogicalQuestion {
  id: string
  number: number
  level: string
  question: string
  options: string[]
  correct_option: number // zero-based index
}

export interface ShapeQuestion {
  id: string
  number: number
  level: string
  question: string // Path to main pattern image
  options: string[] // Paths to option images
  correct_option: number
  type: "shape"
}
export const STEP5_QUESTIONS: LogicalQuestion[] = [
  {
    id: "e0a3a7d2-5f0e-47c4-9c3b-5f6a9c5a1001",
    number: 1,
    level: "לוגיקה – היקש",
    question: "רקס הוא כלב. כל הכלבים נובחים כרגע. האם רקס נובח?",
    options: ["כן", "לא", "תלוי", "אין מידע"],
    correct_option: 0,
  },
  {
    id: "8b1f6d5e-9a22-4f0c-8727-5c2a6de81002",
    number: 2,
    level: "לוגיקה – היקש",
    question: "אם כל הדגים שוחים, ולווייתן לא שוחה – האם הוא דג?",
    options: ["כן", "לא", "אולי", "אי אפשר לדעת"],
    correct_option: 1,
  },
  {
    id: "5c2a4e6d-1b3f-4c8a-8f55-cb7e6a9d1003",
    number: 3,
    level: "לוגיקה – יחסי סדר",
    question: "אייל גבוה יותר מדני, ודני גבוה יותר מיואב. מי הכי נמוך?",
    options: ["אייל", "דני", "יואב", "אי אפשר לדעת"],
    correct_option: 2,
  },
  {
    id: "ad77f6f4-2af4-4d93-9f1b-8b6c8f5e1004",
    number: 4,
    level: "לוגיקה – סדר/השוואת שברים",
    question: "סדר את המספרים מהקטן לגדול (משמאל לימין): 1/2, 2/3, 3/4",
    options: [
      "1/2, 2/3, 3/4",
      "3/4, 2/3, 1/2",
      "1/2, 3/4, 2/3",
      "2/3, 1/2, 3/4",
    ],
    correct_option: 0,
  },
  {
    id: "b3a1df8e-7ef3-4e5c-9e7d-9c2a1f5b1005",
    number: 5,
    level: "לוגיקה – יוצא דופן (מילים)",
    question: "איזו מילה שונה מהשאר?",
    options: ["עיפרון", "עט", "מחק", "מחשבון"],
    correct_option: 3,
  },
  {
    id: "f1a4c8d9-3b6e-43d1-9c80-7e9b2a4f1006",
    number: 6,
    level: "לוגיקה – כיוונים במרחב",
    question: "אדם נוסע צפונה ואז פונה ימינה. לאן הוא פונה עכשיו?",
    options: ["מזרח", "דרום", "מערב", "צפון"],
    correct_option: 0,
  },
  {
    id: "9c77a2b4-1f6e-4a3f-8e0b-3d2c5a6b1007",
    number: 7,
    level: "לוגיקה – צורות",
    question: "איזו צורה תבוא אחרי ▴ □ ▾ ○ ▴ □ ...?",
    options: ["▴", "□", "▾", "○"],
    correct_option: 2,
  },
  {
    id: "0f2b6a9d-4e7c-4a50-9b23-1c8d5e7f1008",
    number: 8,
    level: "לוגיקה – דפוס מספרי",
    question: "אם 2=4, 3=9, 4=16 – אז 5=?",
    options: ["10", "20", "25", "30"],
    correct_option: 2,
  },
  {
    id: "7b6e2a1c-3d4f-4f6b-8a90-1e2f3a4b1009",
    number: 9,
    level: "לוגיקה – היסק (Modus Ponens)",
    question:
      'בחר את ההשלמה ההגיונית: "אם יורד גשם, אני לוקח מטרייה. יורד גשם. לכן _____."',
    options: [
      "אני לא לוקח מטרייה",
      "אני לוקח מטרייה",
      "אין קשר",
      "אני נשאר בבית",
    ],
    correct_option: 1,
  },
  {
    id: "2a9c5e7f-8b1d-4c3e-9a2f-5d7e1b3c1010",
    number: 10,
    level: "לוגיקה – יוצא דופן (צורות)",
    question: "מהו יוצא הדופן:",
    options: ["משולש", "טרפז", "מקבילית", "מלבן"],
    correct_option: 0,
  },
  {
    id: "6e1a9d5b-7c3f-4b2e-8a6f-0d1c2f3e1011",
    number: 11,
    level: "לוגיקה – יחסי סדר/זמן",
    question:
      "שלושה חברים עברו דירה: איתי, רוני וליאן. איתי עבר לפני רוני, ורוני אחרי ליאן. מי עבר ראשון?",
    options: ["איתי", "ליאן", "רוני", "לא ניתן לדעת"],
    correct_option: 3,
  },
  {
    id: "3f9e1a2c-5b6d-4e7f-8a9c-1d2e3f4a1012",
    number: 12,
    level: "לוגיקה – דפוס מספרי",
    question: "השלם את הדפוס: 2, 4, 3, 6, 4, 8, __?",
    options: ["5", "6", "10", "12"],
    correct_option: 0,
  },
  {
    id: "a7b1c2d3-4e5f-6789-abcd-ef0123451013",
    number: 13,
    level: "לוגיקה – אוצר מילים (הפכים)",
    question: 'מהו ההיפך מהמילה "רשמי"?',
    options: ["אישי", "מדויק", "מובן", "ממסדי"],
    correct_option: 0,
  },
  {
    id: "bc1d2e3f-4051-4a76-9c82-76f3b2a11014",
    number: 14,
    level: "לוגיקה – אוצר מילים (דמיון סמנטי)",
    question: "אילו שתי מילים דומות במשמעות?",
    options: ["רחוק – קרוב", "עליז – שמח", "צר – ארוך", "קצר – גבוה"],
    correct_option: 1,
  },
  {
    id: "4a1b7c9d-2e3f-4a5b-8c6d-7e8f9a0b1015",
    number: 15,
    level: "לוגיקה – סילוגיזם",
    question: "'כל הפרחים הם צמחים. כל הצמחים זקוקים לשמש.' מה נכון?",
    options: [
      "כל הצמחים הם פרחים",
      "כל הפרחים זקוקים לשמש",
      "כל השמשות זקוקות לצמחים",
      "פרחים אינם זקוקים לשמש",
    ],
    correct_option: 1,
  },
  {
    id: "d5e7f9a1-2b3c-4d5e-8f9a-0b1c2d3e1016",
    number: 16,
    level: "לוגיקה – אוצר מילים (נרדפות)",
    question: "אילו שתי מילים נרדפות?",
    options: ["סביל – פעיל", "ענוג – עדין", "עדין – יפה", "פעיל – מהיר"],
    correct_option: 1,
  },
  {
    id: "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d1017",
    number: 17,
    level: "לוגיקה – צורות",
    question: "איזו צורה תבוא אחרי 🔴🔵🔴🔵🔴?",
    options: ["🔵", "🔴", "🟡", "⬛️"],
    correct_option: 0,
  },
  {
    id: "11aa22bb-33cc-44dd-88ee-99ff00aa1018",
    number: 18,
    level: "לוגיקה – היסק",
    question: "אם כל יום שני יורד גשם, והיום ירד גשם – מה ניתן להסיק?",
    options: [
      "היום יום שני",
      "כל יום גשום הוא שני",
      "אי אפשר לדעת",
      "היום לא שני",
    ],
    correct_option: 2,
  },
  {
    id: "22334455-6677-4888-9999-aabbccdd1019",
    number: 19,
    level: "לוגיקה – סדרה מספרית",
    question: "מהו המספר הבא בסדרה: 2, 3, 5, 8, 12, ___?",
    options: ["16", "17", "18", "20"],
    correct_option: 1,
  },
  {
    id: "33445566-7788-4999-aaaa-bbccddee1020",
    number: 20,
    level: "לוגיקה – סדרת אותיות",
    question: "השלם את הסדרה: א, ג, ד, ו, ___",
    options: ["ח", "ט", "ז", "י"],
    correct_option: 2,
  },
]

export const STEP6_QUESTIONS: Question[] = [
  {
    id: "c6de2c6c-5a5c-4a8b-9d22-5b2d9a4a1101",
    number: 1,
    level: "אחוזים",
    question: "כמה זה 25% מתוך 80?",
    options: ["10", "15", "20", "25"],
    correct_option: 2,
  },
  {
    id: "b7e4b8f2-9d9e-41b5-8e32-9d2b8f3e1102",
    number: 2,
    level: "סדרות מספריות",
    question: "מה המספר הבא ברצף: 2, 6, 18, 54, ___?",
    options: ["108", "162", "72", "68"],
    correct_option: 1,
  },
  {
    id: "9c3f3db4-7e21-4e17-9db3-27a0e59f1103",
    number: 3,
    level: "חשבון יומיומי",
    question: "חמישית מהכיתה הם בנים. אם יש 30 תלמידים בכיתה, כמה בנות יש?",
    options: ["24", "6", "23", "25"],
    correct_option: 0,
  },
  {
    id: "a5b6c7d8-90e1-4f23-b456-7890abc41104",
    number: 4,
    level: "שברים",
    question: "מהו השבר הפשוט ביותר של 18/24?",
    options: ["4/3", "3/4", "1/2", "4/6"],
    correct_option: 1,
  },
  {
    id: "2a8d2c0a-0c7d-4b8a-9f4b-3b0b5f0f1105",
    number: 5,
    level: "חזקות ופעולות",
    question: "מהי תוצאת הביטוי: 5 בחזקת 2 + 3 = ____",
    options: ["22", "20", "18", "28"],
    correct_option: 3,
  },
  {
    id: "d2a4e0a9-6a22-4b3e-9b6e-3f3f2c1a1106",
    number: 6,
    level: "חשבון יומיומי",
    question: 'יוסי קנה 6 עטים ב־12 ש"ח. כמה יעלה עט אחד?',
    options: ["2", "3", "4", "6"],
    correct_option: 0,
  },
  {
    id: "f4b1c2d3-e4f5-4678-9abc-def012341107",
    number: 7,
    level: "סטטיסטיקה בסיסית",
    question: "מהו הממוצע של המספרים: 4, 8, 12, 16?",
    options: ["8", "10", "12", "14"],
    correct_option: 1,
  },
  {
    id: "7f3e2d1c-0b9a-4a8e-9f7d-6c5b4a3a1108",
    number: 8,
    level: "אלגברה בסיסית",
    question: "אם פי 3 ממספר כלשהו הוא 18 – מהו המספר?",
    options: ["5", "6", "9", "12"],
    correct_option: 1,
  },
  {
    id: "0b1c2d3e-4f56-4789-a0b1-c2d3e4f51109",
    number: 9,
    level: "אחוזים",
    question: "כמה זה 10% מתוך 350?",
    options: ["30", "35", "40", "45"],
    correct_option: 1,
  },
  {
    id: "1a2b3c4d-5e6f-4789-a1b2-c3d4e5f61110",
    number: 10,
    level: "אחוזים – הנחות",
    question:
      'חנות מציעה הנחה של 20% על מוצר שעולה 200 ש"ח. כמה יש לשלם לאחר ההנחה?',
    options: ["160", "180", "190", "150"],
    correct_option: 0,
  },
  {
    id: "21b34567-89ab-4cde-a123-b456789c1111",
    number: 11,
    level: "יחידות זמן",
    question: "כמה שניות יש ב־2.5 דקות?",
    options: ["150", "120", "160", "180"],
    correct_option: 0,
  },
  {
    id: "31c45678-9abc-4def-b234-c56789ad1112",
    number: 12,
    level: "לוח שנה",
    question: "אם היום יום שלישי, מה יהיה היום בעוד 12 ימים?",
    options: ["שישי", "ראשון", "רביעי", "שבת"],
    correct_option: 1,
  },
  {
    id: "41d56789-abcd-4ef0-c345-d6789abe1113",
    number: 13,
    level: "חשבון יומיומי",
    question: 'שוקולד עולה 4.5 ש"ח. כמה עולים 3 שוקולדים?',
    options: ["13.5", "14", "12", "15"],
    correct_option: 0,
  },
  {
    id: "51e6789a-bcde-40f1-d456-e789abcf1114",
    number: 14,
    level: "גאומטריה – שטח",
    question: 'מהו שטח מלבן שאורכו 8 ס"מ ורוחבו 3 ס"מ?',
    options: ["11", "24", "18", "20"],
    correct_option: 1,
  },
  {
    id: "61f789ab-cdef-4012-e567-f89abcde1115",
    number: 15,
    level: "אלגברה בסיסית",
    question: "אם X + 4 = 10, מה ערך X?",
    options: ["4", "5", "6", "7"],
    correct_option: 2,
  },
  {
    id: "71a89abc-def0-4123-f678-0abcdeff1116",
    number: 16,
    level: "תורת המספרים",
    question: "איזה מהמספרים הוא מספר ראשוני?",
    options: ["9", "11", "12", "15"],
    correct_option: 1,
  },
  {
    id: "81b9abcd-ef01-4234-0678-1bcdef001117",
    number: 17,
    level: "אחוזים",
    question: 'אם מחיר חולצה עלה מ־40 ש"ח ל־50 ש"ח, באיזה אחוז המחיר עלה?',
    options: ["10%", "20%", "25%", "50%"],
    correct_option: 2,
  },
  {
    id: "91c0bcde-f012-4345-1789-2cdef0111118",
    number: 18,
    level: "יחסים",
    question: "בגן יש פי 2 יותר בנים מבנות. אם יש 18 ילדים, כמה בנות יש?",
    options: ["6", "9", "12", "3"],
    correct_option: 0,
  },
  {
    id: "a1d1cdef-0123-4456-2890-3def01221119",
    number: 19,
    level: "חשבון יומיומי",
    question: "מיכל מכיל 4.5 ליטר מים. כמה ליטר יהיו ב־4 מיכלים?",
    options: ["13.5", "12", "18", "16"],
    correct_option: 2,
  },
  {
    id: "b1e2def0-1234-4567-3901-4ef012331120",
    number: 20,
    level: "אחוזים",
    question: "מתוך 90 סוכריות שהיו לה, אכלה הילדה 40%. כמה נשארו לה?",
    options: ["34", "64", "36", "54"],
    correct_option: 3,
  },
]

export const STEP7_QUESTIONS: ShapeQuestion[] = [
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c51",
    number: 1,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/1.png",
    options: [
      "/shapes/1.1.png",
      "/shapes/1.2.png",
      "/shapes/1.3.png",
      "/shapes/1.4.png",
    ],
    correct_option: 3, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c52",
    number: 2,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/2.png",
    options: [
      "/shapes/2.1.png",
      "/shapes/2.2.png",
      "/shapes/2.3.png",
      "/shapes/2.4.png",
    ],
    correct_option: 1, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c53",
    number: 3,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/3.png",
    options: [
      "/shapes/3.1.png",
      "/shapes/3.2.png",
      "/shapes/3.3.png",
      "/shapes/3.4.png",
    ],
    correct_option: 3, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c54",
    number: 4,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/4.png",
    options: [
      "/shapes/4.1.png",
      "/shapes/4.2.png",
      "/shapes/4.3.png",
      "/shapes/4.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c55",
    number: 5,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/5.png",
    options: [
      "/shapes/5.1.png",
      "/shapes/5.2.png",
      "/shapes/5.3.png",
      "/shapes/5.4.png",
    ],
    correct_option: 1, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c56",
    number: 6,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/6.png",
    options: [
      "/shapes/6.1.png",
      "/shapes/6.2.png",
      "/shapes/6.3.png",
      "/shapes/6.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c57",
    number: 7,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/7.png",
    options: [
      "/shapes/7.1.png",
      "/shapes/7.2.png",
      "/shapes/7.3.png",
      "/shapes/7.4.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c58",
    number: 8,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/8.png",
    options: [
      "/shapes/8.1.png",
      "/shapes/8.2.png",
      "/shapes/8.3.png",
      "/shapes/8.4.png",
    ],
    correct_option: 2, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c59",
    number: 9,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/9.png",
    options: [
      "/shapes/9.1.png",
      "/shapes/9.2.png",
      "/shapes/9.3.png",
      "/shapes/9.4.png",
      "/shapes/9.5.png",
    ],
    correct_option: 0,
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c60",
    number: 10,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/10.png",
    options: [
      "/shapes/10.1.png",
      "/shapes/10.2.png",
      "/shapes/10.3.png",
      "/shapes/10.4.png",
      "/shapes/10.5.png",
    ],
    correct_option: 1, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c61",
    number: 11,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/11.png",
    options: [
      "/shapes/11.1.png",
      "/shapes/11.2.png",
      "/shapes/11.3.png",
      "/shapes/11.4.png",
      "/shapes/11.5.png",
    ],
    correct_option: 2,
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c62",
    number: 12,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/12.png",
    options: [
      "/shapes/12.1.png",
      "/shapes/12.2.png",
      "/shapes/12.3.png",
      "/shapes/12.4.png",
      "/shapes/12.5.png",
    ],
    correct_option: 0,
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c63",
    number: 13,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/13.png",
    options: [
      "/shapes/13.1.png",
      "/shapes/13.2.png",
      "/shapes/13.3.png",
      "/shapes/13.4.png",
      "/shapes/13.5.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
  {
    id: "6a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c64",
    number: 14,
    level: "זיהוי דפוסים – צורות גיאומטריות",
    question: "/shapes/14.png",
    options: [
      "/shapes/14.1.png",
      "/shapes/14.2.png",
      "/shapes/14.3.png",
      "/shapes/14.4.png",
      "/shapes/14.5.png",
    ],
    correct_option: 0, // Adjust based on correct answer
    type: "shape",
  },
]

export const STEP8_QUESTIONS: Question[] = [
  {
    id: "b3f5a4c7-8e1a-4b2c-9b7e-0b1a5c2d3e01",
    number: 1,
    level: "קלות",
    question: "מה תעשה כדי לשמור קובץ במסמך Word?",
    options: [
      "תלחץ על Ctrl + C",
      "תלחץ על Ctrl + V",
      "תלחץ על Ctrl + S",
      "תלחץ על Alt + F4",
    ],
    correct_option: 2,
  },
  {
    id: "c7a1e2f3-4b5c-6d7e-8f90-1a2b3c4d5e02",
    number: 2,
    level: "קלות",
    question: "מהו הסמל שמייצג את דפדפן Google Chrome?",
    options: [
      "פיירפוקס",
      "עין כחולה",
      "כדור בצבעי אדום-צהוב-ירוק עם עיגול כחול באמצע",
      "מכתב עם חץ",
    ],
    correct_option: 2,
  },
  {
    id: "d1e2f3a4-b5c6-4d7e-8f90-a1b2c3d4e503",
    number: 3,
    level: "קלות",
    question: "מהי תוכנת גיליון נתונים?",
    options: ["Word", "Excel", "PowerPoint", "Chrome"],
    correct_option: 1,
  },
  {
    id: "e4f5a6b7-c8d9-4e01-9f12-a3b4c5d6e704",
    number: 4,
    level: "קלות",
    question: "מה קובץ עם סיומת .jpg מכיל לרוב?",
    options: ["טקסט", "גיליון נתונים", "תמונה", "מוזיקה"],
    correct_option: 2,
  },
  {
    id: "f6a7b8c9-d0e1-42f3-9a45-b6c7d8e9f005",
    number: 5,
    level: "קלות",
    question: "איזו פעולה מתבצעת על ידי הקלקה כפולה (Double Click)?",
    options: ["סגירת חלון", "פתיחת קובץ", "מחיקת קובץ", "שליחת אימייל"],
    correct_option: 1,
  },
  {
    id: "a7b8c9d0-e1f2-43a4-9b56-c7d8e9f0a106",
    number: 6,
    level: "קלות",
    question: "מה תעשה כדי להעתיק טקסט?",
    options: ["Ctrl + P", "Ctrl + V", "Ctrl + C", "Ctrl + Z"],
    correct_option: 2,
  },
  {
    id: "b8c9d0e1-f2a3-44b5-9c67-d8e9f0a1b207",
    number: 7,
    level: "בינוניות",
    question: "איזו יחידת מידה מודדת נפח של אחסון במחשב?",
    options: ["וואט", "ג׳יגה-בייט", "הרץ", "אינצ׳ים"],
    correct_option: 1,
  },
  {
    id: "c9d0e1f2-a3b4-45c6-9d78-e9f0a1b2c308",
    number: 8,
    level: "בינוניות",
    question: "מה תפקידה של תוכנת אנטי-וירוס?",
    options: [
      "לנהל מסמכים",
      "להגן על המחשב מפני תוכנות מזיקות",
      "למנוע מחיקת קבצים",
      "לערוך סרטונים",
    ],
    correct_option: 1,
  },
  {
    id: "d0e1f2a3-b4c5-46d7-9e89-f0a1b2c3d409",
    number: 9,
    level: "בינוניות",
    question: "מה המשמעות של הסמל <Trash2 /> (פח אשפה) בשולחן העבודה?",
    options: [
      "תיקיית מסמכים",
      "מקום לשמירת קבצים זמניים",
      "סל מחזור – קבצים שנמחקו",
      "סימון אתרים לא רצויים",
    ],
    correct_option: 2,
  },
  {
    id: "e1f2a3b4-c5d6-47e8-9f90-0a1b2c3d4e10",
    number: 10,
    level: "בינוניות",
    question: "איך אפשר לבדוק אם יש חיבור לאינטרנט?",
    options: [
      "לבדוק אייקון של סוללה",
      "לבדוק סמל רמקול",
      "לבדוק סמל רשת / Wi-Fi",
      "לבדוק מיקום גיאוגרפי",
    ],
    correct_option: 2,
  },
  {
    id: "f2a3b4c5-d6e7-48f9-901a-1b2c3d4e5f11",
    number: 11,
    level: "בינוניות",
    question: "מהו ה-Cloud (ענן)?",
    options: [
      "דיסק קשיח בתוך המחשב",
      "כונן USB",
      "אחסון קבצים באינטרנט",
      "תיקייה פנימית",
    ],
    correct_option: 2,
  },
  {
    id: "a3b4c5d6-e7f8-490a-912b-2c3d4e5f6a12",
    number: 12,
    level: "בינוניות",
    question: "באיזו תוכנה נשתמש להכין מצגת?",
    options: ["Excel", "PowerPoint", "Outlook", "Notepad"],
    correct_option: 1,
  },
  {
    id: "b4c5d6e7-f8a9-4a1b-923c-3d4e5f6a7b13",
    number: 13,
    level: "בינוניות",
    question: "מהי מטרת סיסמה חזקה?",
    options: [
      "לקצר את תהליך הכניסה",
      "לאפשר לכל אחד להיכנס",
      "להגן על המידע האישי",
      "לחסוך מקום בזיכרון",
    ],
    correct_option: 2,
  },
  {
    id: "c5d6e7f8-a9b0-4b2c-934d-4e5f6a7b8c14",
    number: 14,
    level: "בינוניות",
    question: "באיזו תוכנה נשתמש לקרוא קובץ PDF?",
    options: [
      "Word",
      "Excel",
      "Adobe Acrobat Reader",
      "Chrome (לא בהכרח מותקן)",
    ],
    correct_option: 2,
  },
  {
    id: "d6e7f8a9-b0c1-4c3d-945e-5f6a7b8c9d15",
    number: 15,
    level: "קשות",
    question: "איזו תוכנה מתאימה לעריכת תמונות?",
    options: ["Excel", "Photoshop", "PowerPoint", "Word"],
    correct_option: 1,
  },
  {
    id: "e7f8a9b0-c1d2-4d4e-956f-6a7b8c9d0e16",
    number: 16,
    level: "קשות",
    question: "מה הסיכון העיקרי בלחיצה על קישור ממקור לא ידוע?",
    options: [
      "שהמחשב יתחמם",
      "שהמסך ייכבה",
      "שזה יבוא על חשבון הקובץ הקודם שהיה פתוח אצלך",
      "שתידבק בתוכנה זדונית / וירוס",
    ],
    correct_option: 3,
  },
  {
    id: "f8a9b0c1-d2e3-4e5f-9670-7b8c9d0e1f17",
    number: 17,
    level: "קשות",
    question: "מה עושים כאשר רוצים לשמור גרסה חדשה של קובץ עם שם אחר?",
    options: [
      'בוחרים "שמור"',
      "סוגרים את הקובץ",
      'בוחרים "שמור בשם"',
      "עושים העתק-הדבק",
    ],
    correct_option: 2,
  },
  {
    id: "a9b0c1d2-e3f4-4051-9781-8c9d0e1f2a18",
    number: 18,
    level: "קשות",
    question: "איך אפשר לצלם את המסך?",
    options: ["לחיצה על F5", "Ctrl + Z", "מקש Print Screen", "Alt + F4"],
    correct_option: 2,
  },
  {
    id: "b0c1d2e3-f4a5-4152-9892-9d0e1f2a3b19",
    number: 19,
    level: "קשות",
    question: "מה זה PHISHING?",
    options: [
      "תוכנת גרפיקה ידועה",
      "ניסיון הונאה באינטרנט",
      "אנטי וירוס מתקדם",
      "גיבוי קבצים אוטומטי",
    ],
    correct_option: 1,
  },
  {
    id: "c1d2e3f4-a5b6-4263-99a3-0e1f2a3b4c20",
    number: 20,
    level: "קשות",
    question: "מהי המטרה העיקרית של גיבוי נתונים?",
    options: [
      "למחוק קבצים ישנים",
      "לשמור עותק של המידע למקרה של אובדן",
      "לפנות מקום בדיסק הקשיח",
      "לשפר את מהירות המחשב",
    ],
    correct_option: 1,
  },
]

export interface AttentionMemoryQuestion extends Question {
  category: "קשב" | "סינון מידע" | "זיכרון עבודה"
  stimulus?: string
  stimulusSeconds?: number
}

export const STEP9_QUESTIONS: AttentionMemoryQuestion[] = [
  {
    id: "90110000-0000-4000-8000-000000000001",
    number: 1,
    level: "קשב חזותי",
    category: "קשב",
    question: "כמה פעמים מופיעה האות ק ברצף האותיות?",
    stimulus: "ר ק ב מ ק ת כ ק ש ד ק",
    options: ["3", "4", "5", "6"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000002",
    number: 2,
    level: "סינון מידע",
    category: "סינון מידע",
    question: "איזו רשימה כוללת רק את המספרים הזוגיים הגדולים מ-50?",
    stimulus: "42, 64, 71, 88, 53, 60",
    options: ["64, 88, 60", "42, 64, 88, 60", "64, 71, 88", "88, 53, 60"],
    correct_option: 0,
  },
  {
    id: "90110000-0000-4000-8000-000000000003",
    number: 3,
    level: "זיכרון עבודה",
    category: "זיכרון עבודה",
    question: "מה היה הרצף בסדר הפוך?",
    stimulus: "7 - 2 - 9 - 4",
    stimulusSeconds: 5,
    options: ["4 - 9 - 2 - 7", "7 - 2 - 9 - 4", "4 - 2 - 9 - 7", "9 - 4 - 7 - 2"],
    correct_option: 0,
  },
  {
    id: "90110000-0000-4000-8000-000000000004",
    number: 4,
    level: "קשב מתמשך",
    category: "קשב",
    question: "איזה סימן מופיע הכי הרבה ברצף?",
    stimulus: "▲ ● ▲ ■ ▲ ● ■ ▲",
    options: ["▲", "●", "■", "כולם מופיעים אותו מספר פעמים"],
    correct_option: 0,
  },
  {
    id: "90110000-0000-4000-8000-000000000005",
    number: 5,
    level: "סינון מסיחים",
    category: "סינון מידע",
    question: "התעלם/י מהמילים. כמה מספרים מופיעים ברצף?",
    stimulus: "כחול 8 ירוק 3 אדום 9 צהוב",
    options: ["2", "3", "4", "5"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000006",
    number: 6,
    level: "זיכרון חזותי",
    category: "זיכרון עבודה",
    question: "מה הופיע שני ברצף?",
    stimulus: "עיגול, ריבוע, משולש, כוכב",
    stimulusSeconds: 5,
    options: ["עיגול", "ריבוע", "משולש", "כוכב"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000007",
    number: 7,
    level: "קשב לפרטים",
    category: "קשב",
    question: "מה שונה ברצף?",
    stimulus: "ABCD, ABCD, ABDC, ABCD",
    options: ["ABCD הראשון", "ABCD השני", "ABDC", "ABCD האחרון"],
    correct_option: 2,
  },
  {
    id: "90110000-0000-4000-8000-000000000008",
    number: 8,
    level: "סינון לפי כלל",
    category: "סינון מידע",
    question: "בחר/י את הפריט שמתחיל באות מ ומכיל 4 אותיות.",
    stimulus: "מחשב, מדף, כיסא, מחברת",
    options: ["מחשב", "מדף", "כיסא", "מחברת"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000009",
    number: 9,
    level: "זיכרון עבודה",
    category: "זיכרון עבודה",
    question: "מה היה המספר השלישי ברצף?",
    stimulus: "3, 6, 2, 8, 1",
    stimulusSeconds: 5,
    options: ["3", "6", "2", "8"],
    correct_option: 2,
  },
  {
    id: "90110000-0000-4000-8000-000000000010",
    number: 10,
    level: "קשב מספרי",
    category: "קשב",
    question: "כמה מספרים אי-זוגיים מופיעים ברצף?",
    stimulus: "12, 7, 9, 24, 31, 40",
    options: ["2", "3", "4", "5"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000011",
    number: 11,
    level: "סינון וחישוב",
    category: "סינון מידע",
    question: "התעלם/י מכל מספר קטן מ-5. מה סכום המספרים שנשארו?",
    stimulus: "2, 8, 4, 6, 1",
    options: ["10", "12", "14", "16"],
    correct_option: 2,
  },
  {
    id: "90110000-0000-4000-8000-000000000012",
    number: 12,
    level: "זיכרון מילולי",
    category: "זיכרון עבודה",
    question: "איזו מילה לא הופיעה ברצף?",
    stimulus: "חלון, דרך, אור, ספר",
    stimulusSeconds: 6,
    options: ["אור", "דרך", "זמן", "ספר"],
    correct_option: 2,
  },
  {
    id: "90110000-0000-4000-8000-000000000013",
    number: 13,
    level: "קשב חזותי",
    category: "קשב",
    question: "כמה פעמים מופיע הרצף 13?",
    stimulus: "131, 213, 134, 513, 31",
    options: ["2", "3", "4", "5"],
    correct_option: 2,
  },
  {
    id: "90110000-0000-4000-8000-000000000014",
    number: 14,
    level: "עיכוב תגובה",
    category: "סינון מידע",
    question: "אם המילה היא שם של צבע, בחר/י כן. אם לא, בחר/י לא.",
    stimulus: "שולחן",
    options: ["כן", "לא", "לא ניתן לדעת", "רק אם המילה צבועה"],
    correct_option: 1,
  },
  {
    id: "90110000-0000-4000-8000-000000000015",
    number: 15,
    level: "זיכרון וסדר",
    category: "זיכרון עבודה",
    question: "מה הגיע אחרי המילה עבודה?",
    stimulus: "בוקר > עבודה > שיחה > סיכום",
    stimulusSeconds: 5,
    options: ["בוקר", "שיחה", "סיכום", "עבודה"],
    correct_option: 1,
  },
]

export type PersonalityDimension =
  | "organization"
  | "social"
  | "resilience"
  | "curiosity"
  | "empathy"
  | "initiative"

export interface PersonalityQuestion {
  id: string
  number: number
  statement: string
  category: PersonalityDimension
  categoryLabel: string
  reverse?: boolean
  options: string[]
  type: "personality"
}

export const PERSONALITY_SCALE_OPTIONS = [
  "בכלל לא מתאים לי",
  "מעט מתאים לי",
  "במידה בינונית",
  "מתאים לי",
  "מתאים לי מאוד",
]

export const STEP10_QUESTIONS: PersonalityQuestion[] = [
  {
    id: "10120000-0000-4000-8000-000000000001",
    number: 1,
    statement: "אני מעדיף/ה לתכנן מראש לפני שאני מתחיל/ה משימה.",
    category: "organization",
    categoryLabel: "סדר והתמדה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000002",
    number: 2,
    statement: "קל לי לשמור על סדר גם כשיש הרבה דברים פתוחים.",
    category: "organization",
    categoryLabel: "סדר והתמדה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000003",
    number: 3,
    statement: "אני מסיים/ת משימות גם כשהן פחות מעניינות אותי.",
    category: "organization",
    categoryLabel: "סדר והתמדה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000004",
    number: 4,
    statement: "אני נוטה לדחות משימות עד הרגע האחרון.",
    category: "organization",
    categoryLabel: "סדר והתמדה",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000005",
    number: 5,
    statement: "אני נהנה/ית לעבוד עם אנשים חדשים.",
    category: "social",
    categoryLabel: "חברתיות ועבודת צוות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000006",
    number: 6,
    statement: "קל לי לפתוח שיחה גם בסביבה לא מוכרת.",
    category: "social",
    categoryLabel: "חברתיות ועבודת צוות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000007",
    number: 7,
    statement: "עבודה בצוות נותנת לי אנרגיה.",
    category: "social",
    categoryLabel: "חברתיות ועבודת צוות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000008",
    number: 8,
    statement: "אני מעדיף/ה לעבוד לבד רוב הזמן.",
    category: "social",
    categoryLabel: "חברתיות ועבודת צוות",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000009",
    number: 9,
    statement: "אני נשאר/ת רגוע/ה יחסית גם תחת לחץ.",
    category: "resilience",
    categoryLabel: "יציבות וגמישות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000010",
    number: 10,
    statement: "ביקורת עוזרת לי להשתפר, גם אם לא נעים לשמוע אותה.",
    category: "resilience",
    categoryLabel: "יציבות וגמישות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000011",
    number: 11,
    statement: "כשיש שינוי בתוכנית, אני מצליח/ה להתאים את עצמי.",
    category: "resilience",
    categoryLabel: "יציבות וגמישות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000012",
    number: 12,
    statement: "עומס או אי-ודאות משבשים אותי במהירות.",
    category: "resilience",
    categoryLabel: "יציבות וגמישות",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000013",
    number: 13,
    statement: "אני אוהב/ת ללמוד תחומים חדשים.",
    category: "curiosity",
    categoryLabel: "למידה וחדשנות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000014",
    number: 14,
    statement: "רעיונות לא שגרתיים מסקרנים אותי.",
    category: "curiosity",
    categoryLabel: "למידה וחדשנות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000015",
    number: 15,
    statement: "אני נהנה/ית למצוא דרך חדשה לפתור בעיה.",
    category: "curiosity",
    categoryLabel: "למידה וחדשנות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000016",
    number: 16,
    statement: "אני מעדיף/ה להיצמד לשיטות מוכרות בלבד.",
    category: "curiosity",
    categoryLabel: "למידה וחדשנות",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000017",
    number: 17,
    statement: "חשוב לי להבין איך ההחלטות שלי משפיעות על אחרים.",
    category: "empathy",
    categoryLabel: "אמפתיה ושיתוף פעולה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000018",
    number: 18,
    statement: "אני מקשיב/ה היטב גם כשאני לא מסכים/ה.",
    category: "empathy",
    categoryLabel: "אמפתיה ושיתוף פעולה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000019",
    number: 19,
    statement: "קל לי לזהות כשמישהו סביבי צריך עזרה.",
    category: "empathy",
    categoryLabel: "אמפתיה ושיתוף פעולה",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000020",
    number: 20,
    statement: "בתחרות, פחות חשוב לי איך אחרים מרגישים.",
    category: "empathy",
    categoryLabel: "אמפתיה ושיתוף פעולה",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000021",
    number: 21,
    statement: "אני נוטה לקחת יוזמה בלי שמבקשים ממני.",
    category: "initiative",
    categoryLabel: "יוזמה ועצמאות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000022",
    number: 22,
    statement: "כשאני מזהה בעיה, אני מחפש/ת פתרון ולא מחכה להנחיות.",
    category: "initiative",
    categoryLabel: "יוזמה ועצמאות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000023",
    number: 23,
    statement: "אני מרגיש/ה נוח לקבל החלטות עצמאיות.",
    category: "initiative",
    categoryLabel: "יוזמה ועצמאות",
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
  {
    id: "10120000-0000-4000-8000-000000000024",
    number: 24,
    statement: "אני מתקשה לפעול בלי הנחיות ברורות.",
    category: "initiative",
    categoryLabel: "יוזמה ועצמאות",
    reverse: true,
    options: PERSONALITY_SCALE_OPTIONS,
    type: "personality",
  },
]

export interface HollandQuestion {
  id: string
  text: string
  riasecType: keyof typeof RIASEC_MAP
  type: "holland"
}

export const STEP11_QUESTIONS: HollandQuestion[] = [
  {
    id: "2066a9cb-ff43-482e-99bd-a549294d8a84",
    text: "אני מעדיף לבצע משימות מפורטות הכוללות הנחיות ברורות",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "ee0434da-6b9f-4663-b57d-67968a0fe202",
    text: "אני נמשך להרפתקאות וללקיחת סיכונים",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "83301d70-fb6c-40fd-8e12-233ea81bfb60",
    text: "אני רוצה שהעבודה שלי תוביל לתוצר מוחשי",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "01fbc0d9-6b05-45d6-84d7-e71f2cbdab30",
    text: "אני נהנה לעמוד מול קהל",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "07e3031f-502c-4ec4-8f3f-4626252b8f13",
    text: "אני מוכן להתאים את עצמי למגבלות המסגרת, גם כאשר איני מסכים איתן",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "8338e4e2-2e04-4a08-8321-7a56f73fe386",
    text: "אעדיף משימות המחייבות חשיבה מעמיקה",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "d20732c9-1ba9-43e9-810b-60d6002771b2",
    text: "אני רוצה לקחת חלק באינטראקציות בין־אישיות רבות במהלך היום",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "f3e8fe2a-c9ca-46dd-b163-747a34caf091",
    text: "אני נהנה לנהל משא ומתן עם אחרים",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "7ea2db30-acf8-4f48-b3f2-fd15d6d9d7f5",
    text: "אני מוכן להתשקיע מעצמי למען הצלחתם של אחרים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "b0cad086-8273-444c-bb63-9c2dbda98906",
    text: "מתאים לי מקצוע שבו נדרש ליצור קשר בקלות עם אנשים חדשים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "4f8d6977-7ca1-49d5-ac43-98737e3c392b",
    text: "אני חש סיפוק מכתיבה ומיצירת תכנים חדשים",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "2a4fc0f0-cb23-40bd-a2ad-4a6c2a315746",
    text: "אני מעדיף לעסוק בתחום הכולל חידושים טכנולוגיים רבים",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "0220b17b-1336-4124-84b8-e55585a7de2a",
    text: "אני נוטה לתפוס מקום בולט בסביבה חדשה",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "e134b480-7a2a-41c6-a31b-557e20307759",
    text: "אני מעדיף לפעול לפי סדר פעולות קבוע ושיטתי",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "3b089b5a-0ee6-4d8a-958e-d9345dff4262",
    text: "אני מתעניין בתחומי האומנות",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "c1c6db23-a6d4-4939-abba-360806459241",
    text: "אני מעדיף מקצוע שבו עובדים לפי נהלים ותקנים ברורים",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "4c310cbc-3352-4aad-8498-83a6c0bc0059",
    text: "אני שואף לעסוק בתחומי המדע והמחקר",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "f3d5a96f-0952-4d66-9eaa-9119a104bbfb",
    text: "אני מעדיף לעבוד בסביבה משרדית, בעיקר מול מחשב",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "03cdfbfb-91ce-460e-8579-875babe969d1",
    text: "אשמח להשתמש בדמיון וביצירתיות במשימותיי",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "f98f9fd8-1f81-404f-acc3-e6f7af76c977",
    text: "אשמח לשנות דברים במסגרות שבהן אני פועל",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "4dce10a5-2e26-4d28-9823-1c1a79ee6bb5",
    text: "אני מעדיף עבודה שדורשת ממני לפעול באסרטיביות",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "0b53aa20-309d-49ee-8385-0866cf6336f1",
    text: "אעדיף להיות עצמאי ולא לעבוד כשכיר",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "88c613bc-62c9-42f8-a161-54bbfafb11c2",
    text: "אני נהנה להביע את עצמי דרך אומנות",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "9a25c65e-118c-43bc-9107-d711caff02c6",
    text: "אני מעדיף לפעול כחלק מצוות",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "990826b3-105d-43a2-a042-443f91ccdd2d",
    text: "אני משקיע מאמץ בהקשבה לדעות שונות, גם כאשר הן מנוגדות לשלי",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "a64b164b-140b-463d-bcfb-8718bfb06faa",
    text: "אני מתחבר לעשייה חינוכית או טיפולית",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "99f4f69b-eba6-4fe3-a3e3-0d24d24f696d",
    text: "אני מעדיף מקצוע שנדרשת בו סקרנות רבה כדי להצליח",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "1bbf8936-136d-468e-bb1f-9c7826f3ba16",
    text: "אני רוצה לעסוק בעשייה מגוונת הכוללת שינויים רבים",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "6d1c4fec-0d96-4202-ac41-9c9263b208de",
    text: "אני אוהב להבין כיצד מכשירים ומערכות טכנולוגיות פועלים",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "935f970b-9424-482d-bb49-f534ff1ec16c",
    text: "אני נהנה להשתמש בכישוריי הבין־אישיים במסגרת העבודה",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "dd0e1c5a-1ba9-41af-89b4-a5213cc0eae8",
    text: "אני רוצה לעסוק במקצוע שמאפשר עצמאות רבה",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "d2fdf037-1ef1-4720-b980-1ff14eb0dfc9",
    text: "הייתי רוצה לעסוק במקצוע המבוסס על חשיבה שיטתית ורציונלית",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "514f6989-a1fd-49c6-b068-118ad2880ae2",
    text: "אני אדם מאופק השומר על קור רוח לאורך זמן",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "150a7535-9765-47c3-98b8-c9b81e74a3c3",
    text: "אני נהנה לבצע משימות חישוביות ומתמטיות",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "6373df54-daef-426c-a2d5-66c6ea44e989",
    text: "אני נמשך לעולמות המכירות והשיווק",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "2a063f97-9c6e-426d-be95-6e7fcaf2af0e",
    text: "אני רוצה לשלב את תפיסת עולמי ורגשותיי בעשייה שלי",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "3b9383ab-f945-422d-89f1-51dea6d449db",
    text: "אני נוטה לחשוב מחוץ לקופסה ולפעול באופן יצירתי",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "93b1ad02-8879-46ec-9ae7-c53e3e33ea1a",
    text: "נוח לי להתמודד עם משימות עמומות שאין להן הגדרה ברורה",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "6fab8095-52bc-45ff-9e35-88e0ce9a9de6",
    text: "מתאים לי מקצוע שמחייב סבלנות ואדיבות כלפי אחרים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "8d8da6f8-cf7c-4ead-bb21-a3230aeca487",
    text: "אני רוצה לעבוד במרחב שקט ונטול הסחות דעת",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "e18a366f-65e3-4dd3-adf8-aced82a94c55",
    text: "הייתי רוצה לעסוק במקצוע שבו נדרש לשכנע אנשים אחרים",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "dffd5d00-5a36-4c07-88b5-9769f6f503e8",
    text: "אני רוצה לעסוק במקצוע הדורש חשיבה מקורית וייחודית",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "c283f05d-8f49-4b16-a9f1-9bdffa2ec835",
    text: "אני נהנה מעבודה פיזית ומפעולה עם הידיים",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "bc5d4a14-0860-4898-a207-c213e59f93e5",
    text: "אני מעדיף לבצע משימות ביעילות, בלי להשקיע זמן רב מדי בחשיבה ובתכנון",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "301d2dfb-1c2e-45c2-a5d3-12710cc8a3a7",
    text: "אשמח לפעול בסביבה חברתית",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "862a13a6-7344-4e26-bc34-bb4e09f5f7e4",
    text: "אני רוצה להתנהל בסביבה מסודרת ומאורגנת",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "f05b61f0-4ec6-4001-a1a8-17fd03d1bb1e",
    text: "אני חש סיפוק ממתן שירות לאחרים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "be47f064-180d-438f-bc0a-121160c0bf4f",
    text: "אני נהנה לחקור לעומק תחומים חדשים",
    riasecType: "I",
    type: "holland",
  },
  {
    id: "ceb3b763-a370-4cab-9a00-e65897ff34a5",
    text: "אני רוצה לפעול בסביבה יצירתית וגמישה",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "2dac7099-fd3d-445e-8e53-948d1861df7c",
    text: "אני נהנה להסביר תכנים ולהעביר ידע לאחרים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "010f00ca-a465-4712-95a4-ea5aa2b78b9c",
    text: "מתאימה לי עבודה הדורשת זהירות רבה ומיעוט טעויות",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "eac7042f-83ff-4dfd-8f8a-403205febc4a",
    text: "אני נהנה מעיסוק ממושך במכונות ובחפצים",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "5bd1a9e6-618f-4796-9afd-3e58d33ffb0d",
    text: "אשמח להישאר באותו ארגון ובאותה משרה לאורך זמן",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "3276b700-5eab-459a-ada1-ec697b9ef66c",
    text: "אשמח לעבוד בשיתוף פעולה עם אחרים",
    riasecType: "S",
    type: "holland",
  },
  {
    id: "c87317fa-f144-494f-91ee-e801535574d7",
    text: "אני רוצה ליזום מהלכים ולהשפיע",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "69198036-d152-4a07-b25c-abd9454a420a",
    text: "אני שואף להוביל ולנהל אחרים",
    riasecType: "E",
    type: "holland",
  },
  {
    id: "50f57600-bce1-4a4d-a7f9-41d912180eee",
    text: "אני נהנה מלימוד שפות חדשות",
    riasecType: "A",
    type: "holland",
  },
  {
    id: "a4b88c21-2a8c-4762-8568-9ac3775ceff8",
    text: "אני נוטה לפעול בהתאם לנורמות המקובלות בארגון",
    riasecType: "C",
    type: "holland",
  },
  {
    id: "01cf9f15-77bf-42ab-a679-ce54d85395fb",
    text: "אשמח להביא לידי ביטוי את כישוריי הטכניים",
    riasecType: "R",
    type: "holland",
  },
  {
    id: "34dae83a-a0d3-4721-b30c-67a1e893f7bd",
    text: "מתאים לי לעסוק במקצוע הדורש הקפדה על פרטים קטנים",
    riasecType: "C",
    type: "holland",
  },
]

type CatalogQuestion =
  | Trait
  | Question
  | AnchorQuestion
  | PersonalityQuestion
  | HollandQuestion

export const ALL_QUESTIONS: CatalogQuestion[] = [
  ...STEP1_QUESTIONS,
  ...STEP2_QUESTIONS,
  ...STEP3_QUESTIONS,
  ...STEP4_QUESTIONS,
  ...STEP5_QUESTIONS,
  ...STEP6_QUESTIONS,
  ...STEP7_QUESTIONS,
  ...STEP8_QUESTIONS,
  ...STEP9_QUESTIONS,
  ...STEP10_QUESTIONS,
  ...STEP11_QUESTIONS,
]

function isTrait(question: CatalogQuestion): question is Trait {
  return "text" in question && (question as any).type === "trait"
}

function isAnchorQuestion(question: CatalogQuestion): question is AnchorQuestion {
  return "text" in question && (question as any).type === "anchor"
}

function isHollandQuestion(question: CatalogQuestion): question is HollandQuestion {
  return "text" in question && (question as any).type === "holland"
}

function isPersonalityQuestion(
  question: CatalogQuestion
): question is PersonalityQuestion {
  return "statement" in question && question.type === "personality"
}

function isQuestion(question: CatalogQuestion): question is Question {
  return "question" in question
}

export const getQuestionText = (id: string): string | undefined => {
  const question = ALL_QUESTIONS.find((q) => q.id === id)
  if (!question) {
    return undefined
  }

  if (
    isTrait(question) ||
    isAnchorQuestion(question) ||
    isHollandQuestion(question)
  ) {
    return question.text
  }

  if (isPersonalityQuestion(question)) {
    return question.statement
  }

  return question.question
}

export const RIASEC_MAP = {
  R: {
    code: "R",
    name: "ביצועי",
    description:
      "מעשי, פרקטי, אוהב פעילויות שתוצאותיהן מיידיות, שכוללות פעילות פיזית. אוהב סדר, פעילויות מוגדרות, מוחשיות וברורות. בעל כושר ויכולת טכנית, יכולת מתמטית, יכולת מוטורית וקואורדינציה. פחות אוהב עבודה עם ניירת ופחות זקוק לקשר עם אנשים אחרים או מעורבות רגשית. זקוק לכללים ולקריטריונים ברורים להערכת מעשיו.",
    image: "/RIASEC/R.png",
  },
  I: {
    code: "I",
    name: "חקרני",
    description:
      "מעדיף פעילויות שדורשות חשיבה, חקירה ובחינה שיטתית ואנליטית של תופעות. אוהב לעבוד כאינדבידואל ופחות אוהב פעילות חברתיות. אוהב דיוק והסתכלות על פרטים, בחינה של עובדות ופתרון בעיות. פחות מתחבר לפעילות פיזית.",
    image: "/RIASEC/I.png",
  },
  A: {
    code: "A",
    name: "אומנותי",
    description:
      "אוהב פעילות מעורפלת, לא שיטתית. יצירתי ומקורי בחשיבה ובקשר עם העולם. אוהב עיסוק בחומרים ובמלל. מבטא את עצמו דרך יצירה ואומנות. אינו אוהב כללים ונורמות. אוהב חופש פעולה. יש לו ראייה סובייקטיבית, מורכבת ומקורית של תופעות. מתחבר לאנשים דרך רגש, דימיון, אומנות ואסתטיקה. אינו אוהב סטנדרטיזציה.",
    image: "/RIASEC/A.png",
  },
  S: {
    code: "S",
    name: "חברתי",
    description:
      "אוהב לעבוד עם אנשים, פחות אוהב לעבוד עם מכונות וחומרים. אוהב ומוכשר ביצירת קשרים חברתיים ובין אישיים. אוהב לסייע לאנשים ללמוד ולהתפתח, לעזור לאנשים לפתור בעיות אישיות. אוהב ללמד ולייעץ לאנשים אחרים. שם דגש על רגש, פחות מתחבר לפעילויות שיטתיות ורציונליות. אמפתי ורגיש לצרכים של אחרים, מבין סיטואציות חברתיות.",
    image: "/RIASEC/S.png",
  },
  E: {
    code: "E",
    name: "יזמי",
    description:
      "אוהב עשייה, ביצוע והשגת מטרות. אוהב לפעול ולהוביל תהליכים ואנשים. בעל יכולת השפעה על אנשים ושכנוע. אוהב לעבוד עם אנשים שהוא מוביל, לקבל החלטות. לא אוהב להיות מובל. יכולת בינאישית טובה. אוהב לקחת סיכונים לצורך רווח והשגת מטרות. מחפש גיוון.",
    image: "/RIASEC/E.png",
  },
  C: {
    code: "C",
    name: "מִנהלי",
    description:
      "אוהב סדר, נהלים ומסגרת. אוהב רוטינות וכללים ואוהב שפועלים לאורם. אוהב היררכיה ובהירות. שם לב לפרטים, מדויק ושיטתי. אוהב לתכנן ולפעול על פי התכנון. מעדיף תהליכים ברורים ומוגדרים. לא מתחבר לעמימות ולחריגה מן הנורמה.",
    image: "/RIASEC/C.png",
  },
} as const
