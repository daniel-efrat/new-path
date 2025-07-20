export const EASINGS = {
  // Material Design easing curves
  STANDARD: "cubic-bezier(0.4, 0, 0.2, 1)", // Standard
  DECELERATE: "cubic-bezier(0.0, 0, 0.2, 1)", // Deceleration
  ACCELERATE: "cubic-bezier(0.4, 0, 1, 1)", // Acceleration
  SHARP: "cubic-bezier(0.4, 0, 0.6, 1)", // Sharp
  
  // Custom easing curves
  SPRING: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Spring bounce
  BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Elastic bounce
  SMOOTH: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Smooth
  SNAPPY: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Quick response
} as const

export const DURATIONS = {
  INSTANT: 50,
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  SLOWER: 450,
} as const

export const DELAYS = {
  NONE: 0,
  SHORT: 50,
  MEDIUM: 100,
  LONG: 200,
} as const

export const TRANSITIONS = {
  FADE: {
    entering: { opacity: 1 },
    exiting: { opacity: 0 },
  },
  SCALE: {
    entering: { transform: "scale(1)", opacity: 1 },
    exiting: { transform: "scale(0.95)", opacity: 0 },
  },
  SLIDE_UP: {
    entering: { transform: "translateY(0)", opacity: 1 },
    exiting: { transform: "translateY(10%)", opacity: 0 },
  },
  SLIDE_DOWN: {
    entering: { transform: "translateY(0)", opacity: 1 },
    exiting: { transform: "translateY(-10%)", opacity: 0 },
  },
  SPRING_SCALE: {
    entering: { transform: "scale(1)", opacity: 1 },
    exiting: { transform: "scale(0.9)", opacity: 0 },
    config: {
      tension: 300,
      friction: 20,
      mass: 1,
    },
  },
} as const

export const SPRING_CONFIGS = {
  GENTLE: {
    tension: 170,
    friction: 26,
    mass: 1,
  },
  BOUNCY: {
    tension: 300,
    friction: 10,
    mass: 1,
  },
  SLOW: {
    tension: 100,
    friction: 30,
    mass: 1,
  },
  STIFF: {
    tension: 400,
    friction: 30,
    mass: 1,
  },
  MOLASSES: {
    tension: 100,
    friction: 60,
    mass: 1,
  },
} as const

export type EasingType = keyof typeof EASINGS
export type DurationType = keyof typeof DURATIONS
export type DelayType = keyof typeof DELAYS
export type TransitionType = keyof typeof TRANSITIONS
export type SpringConfigType = keyof typeof SPRING_CONFIGS

export interface AnimationConfig {
  easing?: EasingType
  duration?: DurationType
  delay?: DelayType
  transition?: TransitionType
  springConfig?: SpringConfigType
}

export const DEFAULT_ANIMATION: AnimationConfig = {
  easing: "STANDARD",
  duration: "NORMAL",
  delay: "NONE",
  transition: "FADE",
  springConfig: "GENTLE",
}
