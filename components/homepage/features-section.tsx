import { Card, CardContent } from "../../components/ui/card";
import Image from "next/image";

export function FeaturesSection() {
  const features = [
    {
      icon: "/icons/checkmark.png",
      title: "הערכה מקיפה",
      description: "7 שאלות חכמות שחושפות את הפוטנציאל שלך",
      color: "text-emerald-600",
    },
    {
      icon: "/icons/group.png",
      title: "מותאם לישראלים",
      description: "פותח במיוחד עבור צעירים בישראל",
      color: "text-indigo-600",
    },
    {
      icon: "/icons/growth.png",
      title: "נתונים עדכניים",
      description: "מידע רלוונטי על שוק העבודה הישראלי",
      color: "text-rose-600",
    },
    {
      icon: "/icons/medal.png",
      title: "מכללות מובילות",
      description: "שותפות עם המוסדות הטובים ביותר בארץ",
      color: "text-amber-600",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            למה לבחור בנו?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            פלטפורמה מתקדמת שמשלבת טכנולוגיה עם הבנה עמוקה של השוק הישראלי
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto ${feature.color}`}
                >
                  <Image
                    src={feature.icon}
                    alt={`${feature.title} icon`}
                    width={84}
                    height={84}
                  />
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
