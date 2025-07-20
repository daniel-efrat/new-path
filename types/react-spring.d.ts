declare module "@react-spring/web" {
  import { ComponentProps, CSSProperties } from "react"

  export interface SpringValue<T = any> {
    get(): T
    set(value: T): void
    start(value: T): Promise<void>
    stop(): void
  }

  export interface SpringConfig {
    mass?: number
    tension?: number
    friction?: number
    velocity?: number
    duration?: number
    easing?(t: number): number
  }

  export interface AnimatedStyle {
    transform?: string
    opacity?: number | string
    [key: string]: any
  }

  export interface SpringUpdateFn<T = any> {
    (params: T): T | Promise<T>
  }

  export interface SpringProps<T = any> {
    from?: T
    to?: T | SpringUpdateFn<T>
    delay?: number
    immediate?: boolean
    config?: SpringConfig
    reset?: boolean
    reverse?: boolean
    cancel?: boolean
    pause?: boolean
    loop?: boolean | { reverse: boolean }
    onStart?: () => void
    onRest?: () => void
    onResolve?: () => void
  }

  export interface SpringApi {
    start(props?: object): Promise<void>
    stop(key?: string): void
    pause(key?: string): void
    resume(key?: string): void
    set(values: object): void
  }

  export function useSpring<T extends object>(
    props: SpringProps<T> | (() => SpringProps<T>)
  ): [T, SpringApi]

  type AnimatedComponent<T extends keyof JSX.IntrinsicElements> = React.ForwardRefExoticComponent<
    ComponentProps<T> & { style?: AnimatedStyle }
  >

  export const animated: {
    [Tag in keyof JSX.IntrinsicElements]: AnimatedComponent<Tag>
  }

  export const config: {
    default: SpringConfig
    gentle: SpringConfig
    wobbly: SpringConfig
    stiff: SpringConfig
    slow: SpringConfig
    molasses: SpringConfig
  }
}
