"use client"

import React from "react"
import { ANIMATION_DURATIONS } from "@/lib/constants/questionnaire"
import { useSpring, animated, SpringConfig, config } from "@react-spring/web"
import { useDrag, type DragState } from "@use-gesture/react"

interface DialogTransitionProps {
  children: React.ReactNode
  show: boolean
  afterLeave?: () => void
  /** The type of transition animation */
  type?: "fade" | "zoom" | "slide" | "spring"
  /** Custom transition duration in ms */
  duration?: number
  /** Custom transition timing function */
  timing?: string
  /** Whether to transition the overlay */
  withOverlay?: boolean
  /** Spring animation configuration */
  springConfig?: SpringConfig
  /** Enable drag to dismiss */
  enableDrag?: boolean
  /** Drag threshold for dismissal (in pixels) */
  dragThreshold?: number
  /** Callback when drag starts */
  onDragStart?: () => void
  /** Callback when drag ends */
  onDragEnd?: () => void
}

export function DialogTransition({
  children,
  show,
  afterLeave,
  type = "spring",
  duration = ANIMATION_DURATIONS.TRANSITION,
  timing = "cubic-bezier(0.4, 0, 0.2, 1)",
  withOverlay = true,
  springConfig = config.default,
  enableDrag = false,
  dragThreshold = 100,
  onDragStart,
  onDragEnd,
}: DialogTransitionProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const dragRef = React.useRef<HTMLDivElement>(null)

  // Spring animations
  const [props, api] = useSpring(() => ({
    opacity: 0,
    scale: 0.95,
    y: 0,
    config: springConfig,
  }))

  // Update animation when show changes
  React.useEffect(() => {
    if (show) {
      setIsMounted(true)
      api.start({
        opacity: 1,
        scale: 1,
        y: 0,
      })
    } else {
      api.start({
        opacity: 0,
        scale: type === "spring" ? 0.95 : 1,
        y: type === "spring" ? -20 : 0,
        onRest: () => {
          setIsMounted(false)
          afterLeave?.()
        },
      })
    }
  }, [show, type, api, afterLeave])

  // Gesture handling
  const bind = useDrag(
    ({ movement: [, movementY], down, tap, velocity: [, velocityY], direction: [, directionY] }: DragState) => {
      if (tap) return

      if (down) {
        api.start({ y: movementY, immediate: true })
        onDragStart?.()
      } else {
        onDragEnd?.()
        if (Math.abs(movementY) > dragThreshold || (Math.abs(velocityY) > 0.5 && directionY > 0)) {
          api.start({
            opacity: 0,
            y: movementY + 200 * directionY,
            onRest: afterLeave,
          })
        } else {
          api.start({ y: 0 })
        }
      }
    },
    {
      enabled: enableDrag && show,
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    }
  )

  if (!isMounted) return null

  // CSS transition styles for non-spring animations
  const transitionStyles: React.CSSProperties = {
    transition: `all ${duration}ms ${timing}`,
  }

  const overlayStyles: React.CSSProperties = withOverlay
    ? {
        opacity: show ? 1 : 0,
        ...transitionStyles,
      }
    : {}

  const contentStyles: React.CSSProperties | undefined = type !== "spring" ? {
    ...transitionStyles,
    ...(type === "fade" && {
      opacity: show ? 1 : 0,
    }),
    ...(type === "zoom" && {
      opacity: show ? 1 : 0,
      transform: show ? "scale(1)" : "scale(0.95)",
    }),
    ...(type === "slide" && {
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-1rem)",
    }),
  } : undefined

  const bindProps = enableDrag ? bind() : {}

  return (
    <div style={overlayStyles} className="pointer-events-none">
      {type === "spring" ? (
        <animated.div
          ref={dragRef}
          {...bindProps}
          style={props}
          className="pointer-events-auto"
        >
          {children}
        </animated.div>
      ) : (
        <div style={contentStyles} className="pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  )
}
