import { useState, useCallback, useEffect } from "react"
import { useSpring, SpringConfig } from "@react-spring/web"
import {
  EASINGS,
  DURATIONS,
  DELAYS,
  TRANSITIONS,
  SPRING_CONFIGS,
  type AnimationConfig,
  type TransitionType,
  type SpringConfigType,
  type EasingType,
  type DurationType,
  type DelayType,
  DEFAULT_ANIMATION,
} from "@/lib/config/animations"

interface TransitionState {
  transform?: string
  opacity?: number
}

interface TransitionConfig {
  entering: TransitionState
  exiting: TransitionState
  config?: SpringConfig
}

interface UseAnimationProps extends Partial<AnimationConfig> {
  /** Whether the animation is active */
  isActive?: boolean
  /** Callback when animation enters */
  onEnter?: () => void
  /** Callback when animation exits */
  onExit?: () => void
  /** Callback when animation completes */
  onComplete?: () => void
  /** Custom styles to merge with transition styles */
  customStyles?: Record<string, any>
}

export function useAnimation({
  isActive = false,
  easing = DEFAULT_ANIMATION.easing!,
  duration = DEFAULT_ANIMATION.duration!,
  delay = DEFAULT_ANIMATION.delay!,
  transition = DEFAULT_ANIMATION.transition!,
  springConfig = DEFAULT_ANIMATION.springConfig!,
  onEnter,
  onExit,
  onComplete,
  customStyles = {},
}: UseAnimationProps = {}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Get transition styles
  const transitionStyles = TRANSITIONS[transition as TransitionType] as TransitionConfig

  // Spring animation setup
  const [springStyles, api] = useSpring(() => ({
    ...transitionStyles.exiting,
    config: {
      ...(transitionStyles.config || SPRING_CONFIGS[springConfig as SpringConfigType]),
    },
  }))

  // CSS transition string
  const cssTransition = `all ${DURATIONS[duration as DurationType]}ms ${
    EASINGS[easing as EasingType]
  } ${DELAYS[delay as DelayType]}ms`

  // Handle spring animations
  const animateSpring = useCallback(
    (isEntering: boolean) => {
      setIsAnimating(true)
      api.start({
        ...(isEntering ? transitionStyles.entering : transitionStyles.exiting),
        config: {
          ...(transitionStyles.config || SPRING_CONFIGS[springConfig as SpringConfigType]),
        },
        onRest: () => {
          setIsAnimating(false)
          if (isEntering) {
            onEnter?.()
          } else {
            onExit?.()
          }
          onComplete?.()
        },
      })
    },
    [api, transitionStyles, springConfig, onEnter, onExit, onComplete]
  )

  // Handle CSS transitions
  const getCSSStyles = useCallback(
    (isEntering: boolean): React.CSSProperties => ({
      transition: cssTransition,
      ...customStyles,
      ...(isEntering ? transitionStyles.entering : transitionStyles.exiting),
    }),
    [cssTransition, customStyles, transitionStyles]
  )

  // Handle animation state changes
  useEffect(() => {
    if (isActive && !isMounted) {
      setIsMounted(true)
      animateSpring(true)
    } else if (!isActive && isMounted) {
      animateSpring(false)
      setIsMounted(false)
    }
  }, [isActive, isMounted, animateSpring])

  return {
    isAnimating,
    isMounted,
    springStyles,
    cssStyles: getCSSStyles(isActive),
    animateSpring,
  }
}

// Helper to create consistent animation props
export function createAnimationProps(
  config: Partial<AnimationConfig> = {}
): Required<AnimationConfig> {
  return {
    easing: config.easing || DEFAULT_ANIMATION.easing!,
    duration: config.duration || DEFAULT_ANIMATION.duration!,
    delay: config.delay || DEFAULT_ANIMATION.delay!,
    transition: config.transition || DEFAULT_ANIMATION.transition!,
    springConfig: config.springConfig || DEFAULT_ANIMATION.springConfig!,
  }
}
