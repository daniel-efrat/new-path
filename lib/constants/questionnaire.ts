export const QUESTIONNAIRE_CONFIG = {
  MAX_TRAITS: 10,
  TOTAL_ANCHORS: 18,
  MIN_ANCHOR_VALUE: 0,
  MAX_ANCHOR_VALUE: 10,
} as const;

export const VALIDATION_MESSAGES = {
  TRAITS: {
    REQUIRED: "יש לבחור לפחות תכונה אחת",
    TOO_MANY: "ניתן לבחור עד 10 תכונות",
    NONE_SELECTED: "נא לבחור לפחות תכונה אחת המאפיינת אותך",
  },
  ANCHORS: {
    INCOMPLETE: "יש להשלים את כל שאלון עוגני הקריירה",
    INVALID_VALUE: "כל הערכים בשאלון צריכים להיות בין 0 ל-10",
    MISSING: "נא לענות על כל השאלות בשאלון",
  },
  GENERAL: {
    SAVE_ERROR: "שגיאה בשמירת הנתונים. נסה שנית.",
    LOAD_ERROR: "שגיאה בטעינת הנתונים. נסה שנית.",
    INVALID_FORM: "נא להשלים את כל השדות הנדרשים",
  },
} as const;

export type NavigationKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Tab";
export type SelectionKey = " " | "Enter" | "Escape";
export type HelpKey = "?";

export const KEYBOARD_SHORTCUTS = {
  NAVIGATION: {
    UP: "ArrowUp" as NavigationKey,
    DOWN: "ArrowDown" as NavigationKey,
    LEFT: "ArrowLeft" as NavigationKey,
    RIGHT: "ArrowRight" as NavigationKey,
    TAB: "Tab" as NavigationKey,
  },
  SELECTION: {
    SPACE: " " as SelectionKey,
    ENTER: "Enter" as SelectionKey,
    ESCAPE: "Escape" as SelectionKey,
  },
  HELP: {
    SHOW: "?" as HelpKey,
  },
} as const;

export const QUESTIONNAIRE_SECTIONS = {
  TRAITS: {
    TITLE: "תכונות אישיות",
    DESCRIPTION: "בחר/י עד 10 תכונות המתארות אותך",
    INSTRUCTION: "לחץ על החץ למעלה/למטה לניווט, SPACE לבחירה",
  },
  ANCHORS: {
    TITLE: 'שאלון "עוגני קריירה"',
    DESCRIPTION: "דרג/י את מידת ההסכמה שלך עם כל אחד מהמשפטים",
    INSTRUCTION: "השתמש במקשי מספרים 0-9 לקביעת ערך",
  },
} as const;

export const STORAGE_KEYS = {
  ANSWERS: "questionnaire-answers",
  PROGRESS: "questionnaire-progress",
  STEP: "questionnaire-current-step",
} as const;

export const ANIMATION_DURATIONS = {
  FADE: 300,
  SLIDE: 500,
  TRANSITION: 200,
} as const;
