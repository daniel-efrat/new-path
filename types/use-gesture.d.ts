declare module "@use-gesture/react" {
  import { RefObject } from "react"

  export interface DragState {
    movement: [number, number]
    offset: [number, number]
    down: boolean
    first: boolean
    last: boolean
    active: boolean
    tap: boolean
    memo: any
    velocity: [number, number]
    direction: [number, number]
    distance: [number, number]
    xy: [number, number]
    initial: [number, number]
    previous: [number, number]
    delta: [number, number]
    event: MouseEvent | TouchEvent
  }

  export interface DragConfig {
    enabled?: boolean
    filterTaps?: boolean
    bounds?: { top?: number; bottom?: number; left?: number; right?: number }
    rubberband?: boolean | [number, number]
    delay?: number
    swipeDistance?: number
    swipeVelocity?: number
    axis?: "x" | "y" | "both"
  }

  export type DragHandler = (state: DragState) => void

  export function useDrag(
    handler: DragHandler,
    config?: DragConfig
  ): (...args: any[]) => any
}
