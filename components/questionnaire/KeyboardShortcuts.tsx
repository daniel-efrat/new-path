"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

export default function KeyboardShortcuts() {
  const [isVisible, setIsVisible] = useState(false)

  const shortcuts = [
    { key: "↑/↓", description: "ניווט בין התכונות" },
    { key: "Space", description: "בחירה/ביטול של תכונה" },
    { key: "0-9", description: "קביעת ערך בשאלון" },
    { key: "Tab", description: "מעבר בין האפשרויות" },
    { key: "Enter", description: "אישור בחירה" },
    { key: "Esc", description: "סגירת חלונית זו" },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false)
      }
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsVisible(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 gap-2"
        onClick={() => setIsVisible(true)}
        title="הצג קיצורי מקלדת (Ctrl+?)"
      >
        <Keyboard className="h-4 w-4" />
        <span>קיצורי מקלדת</span>
      </Button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="קיצורי מקלדת"
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsVisible(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">קיצורי מקלדת</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            aria-label="סגור"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <span className="text-sm text-muted-foreground ">
                {description}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">{key}</kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-center text-gray-500">
          ניתן ללחוץ על Ctrl+? בכל עת להצגת קיצורי המקלדת
        </div>
      </div>
    </div>
  )
}
