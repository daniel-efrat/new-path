import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionnaireStep from './QuestionnaireStep';
import { useQuestionnaireStore } from '../../lib/stores/questionnaireStore';
import { trackEvent } from '../../lib/analytics';

// Define the questions for our questionnaire
const QUESTIONS = [
  {
    id: 'interests',
    question: 'אילו תחומים או נושאים מעניינים אותך ביותר?',
    type: 'multiselect',
    options: [
      'טכנולוגיה ומחשבים',
      'עסקים וכלכלה',
      'בריאות ורפואה',
      'אמנות ועיצוב',
      'חינוך והוראה',
      'הנדסה ואדריכלות',
      'מדעי החברה והרוח'
    ]
  },
  {
    id: 'strengths',
    question: 'מהן 3 החוזקות העיקריות שלך?',
    type: 'multiselect',
    options: [
      'פתרון בעיות',
      'תקשורת',
      'יצירתיות',
      'מנהיגות',
      'כישורים טכניים',
      'חשיבה אנליטית',
      'עבודת צוות',
      'תשומת לב לפרטים'
    ],
    maxSelections: 3
  },
  {
    id: 'workStyle',
    question: 'איזו סביבת עבודה אתה מעדיף?',
    type: 'select',
    options: [
      'משרד',
      'עבודה מהבית',
      'היברידי',
      'עבודת שטח/חוץ',
      'לוח זמנים גמיש'
    ]
  },
  {
    id: 'salaryExpectation',
    question: 'מהי ציפיית השכר החודשית המינימלית שלך (בש"ח)?',
    type: 'select',
    options: [
      'עד 8,000 ש"ח',
      '8,000-12,000 ש"ח',
      '12,000-18,000 ש"ח',
      '18,000-25,000 ש"ח',
      'מעל 25,000 ש"ח'
    ]
  },
  {
    id: 'studyCommitment',
    question: 'כמה זמן אתה מוכן להשקיע בלימודים/הכשרה?',
    type: 'select',
    options: [
      'קורסים קצרים (עד 6 חודשים)',
      'תוכניות תעודה (6-12 חודשים)',
      'תואר אקדמי (שנתיים)',
      'תואר ראשון (3-4 שנים)',
      'תואר שני ומעלה (5+ שנים)'
    ]
  },
  {
    id: 'location',
    question: 'באילו אזורים בישראל תשקול ללמוד/לעבוד?',
    type: 'multiselect',
    options: [
      'תל אביב והמרכז',
      'ירושלים והסביבה',
      'חיפה והצפון',
      'באר שבע והדרום',
      'עבודה מרחוק בלבד'
    ]
  },
  {
    id: 'values',
    question: 'אילו מהערכים הבאים חשובים ביותר בבחירת הקריירה שלך?',
    type: 'multiselect',
    options: [
      'איזון בין עבודה לחיים',
      'פוטנציאל הכנסה גבוה',
      'ביטחון תעסוקתי',
      'השפעה חברתית',
      'צמיחה מקצועית',
      'חדשנות ויצירתיות',
      'עצמאות ואוטונומיה'
    ],
    maxSelections: 3
  }
];

export default function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gdprConsent, setGdprConsent] = useState(false);
  const router = useRouter();
  
  const { answers, setAnswer } = useQuestionnaireStore();
  
  // Track questionnaire start when component mounts
  useState(() => {
    trackEvent('quiz_start', {});
  });
  
  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all questions are answered
    const unansweredQuestions = QUESTIONS.filter(q => 
      !answers[q.id] || 
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
    );
    
    if (unansweredQuestions.length > 0) {
      setError('נא לענות על כל השאלות לפני ההגשה.');
      return;
    }
    
    if (!gdprConsent) {
      setError('עליך להסכים לתנאי עיבוד הנתונים כדי להמשיך.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Track completion event
      trackEvent('quiz_complete', {});
      
      // Submit the form data to our API
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit questionnaire');
      }
      
      // Redirect to results page
      router.push('/dashboard');
    } catch (err) {
      setError('There was a problem submitting your answers. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
        <p className="text-sm text-gray-500 mt-2">שאלה {currentStep + 1} מתוך {QUESTIONS.length}</p>
      </div>
      
      {/* Current question */}
      <QuestionnaireStep
        question={currentQuestion}
        value={answers[currentQuestion.id] || (currentQuestion.type === 'multiselect' ? [] : '')}
        onChange={(value: string | string[]) => setAnswer(currentQuestion.id, value)}
      />
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded ${
            currentStep === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          הקודם
        </button>
        
        {currentStep < QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            הבא
          </button>
        ) : (
          <div className="space-y-4">
            {/* GDPR consent checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="gdpr-consent"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="mt-1 mr-2"
              />
              <label htmlFor="gdpr-consent" className="text-sm">
                אני מסכים/ה לעיבוד המידע האישי שלי לצורך קבלת המלצות קריירה ושיתוף המידע שלי עם מכללות שותפות. אני מבין/ה שאוכל לבטל את הסכמתי בכל עת.
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'שולח...' : 'שלח תשובות'}
            </button>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mt-4">
          {error}
        </div>
      )}
    </form>
  );
}
