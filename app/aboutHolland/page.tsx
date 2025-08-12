import Image from 'next/image';
import Link from 'next/link';

export default function AboutHollandPage() {
  const types = [
    { name: 'אומנותי', image: '/RIASEC/A.png' },
    { name: 'מחקרי', image: '/RIASEC/I.png' },
    { name: 'ביצועי', image: '/RIASEC/R.png' },
    { name: 'מנהלי', image: '/RIASEC/C.png' },
    { name: 'יוזם', image: '/RIASEC/E.png' },
    { name: 'חברתי', image: '/RIASEC/S.png' },
  ];

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl w-full space-y-8">
        <nav aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                דף הבית
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <span className="text-gray-700">שאלון הולנד</span>
            </li>
          </ol>
        </nav>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            שאלון הולנד להכוונה מקצועית
          </h1>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            מצאו את הכיוון המקצועי שלכם עם שאלון הולנד
          </h1>
        </div>

        <div className="mt-8 text-lg text-gray-700 space-y-6 text-right leading-relaxed">
          <p>
            מחפשים כיוון תעסוקתי? השאלון שלנו יעזור לכם למפות את תחומי העניין
            והנטיות המקצועיות שלכם. חשוב לזכור, זהו כלי להכוונה עצמית ואינו
            מהווה תחליף לייעוץ קריירה מקצועי.
          </p>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              מה זה בעצם שאלון הולנד (RIASEC)?
            </h2>
            <p className="mt-2">
              זהו שאלון ייחודי שממיין אנשים ל-6 טיפוסים על פי תחומי העניין
              והסביבה התעסוקתית המועדפת עליהם. יוצר השאלון, ג'ון הולנד, האמין
              שכאשר בוחרים מסלול לימודים או עבודה שתואם את הטיפוס שלנו, חווים
              יותר סיפוק והצלחה.
            </p>
          </div>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              גרסאות מותאמות ומהירות
            </h2>
            <p className="mt-2">
              כדי להקל עליכם, יצרנו שתי גרסאות של השאלון: גרסה מהירה של 30 שאלות
              וגרסה מורחבת של 60. שתי הגרסאות הן תרגום של{" "}
              <span className="font-semibold text-blue-600">
                השאלון האמריקאי המקוצר
              </span>
              , והותאמו ותוקפו באופן מלא לקהל הישראלי.
            </p>
          </div>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              למה דווקא שאלון הולנד?
            </h2>
            <p className="mt-2">
              למרות שישנן דרכים רבות למצוא כיוון מקצועי, שאלון הולנד הוא הכלי
              הוותיק, המוכח והנפוץ ביותר בעולם לאבחון נטיות תעסוקתיות. הוא נמצא
              בשימוש נרחב במכוני מיון והכוונה בזכות מהימנותו ופשטותו.
            </p>
          </div>
        </div>


        <div className="py-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            ששת הטיפוסים של הולנד
          </h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-8">
            {types.map((type) => (
              <div
                key={type.name}
                className="flex flex-col items-center space-y-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-24 h-24">
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {type.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/questionnaire"
            className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white outline-none ring-blue-300 transition duration-100 hover:bg-blue-700 focus-visible:ring active:bg-blue-800 md:text-base"
          >
            למילוי שאלון ההכוונה
          </Link>
        </div>
      </div>
    </div>
  )
}
