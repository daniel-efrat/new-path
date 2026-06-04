import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import supabase from '@/lib/supabase'

export interface Step12Occupation {
  occupation_serial: number
  occupation_title: string
  occupation_description: string | null
}

interface Step12State {
  userId?: string
  selected: Step12Occupation[] // up to 5
  order: number[] // array of occupation_serial in preferred order (length 5 when set)
  selectionsBySerial: Record<number, number[]> // statement_serials selected (up to 2 per occupation)
  toggleSelect: (occ: Step12Occupation) => void
  isSelected: (serial: number) => boolean
  setOrder: (order: number[]) => void
  setSelectionsFor: (serial: number, statementSerials: number[]) => void
  reset: () => void
  ensureUser: (expectedUserId?: string) => Promise<void>
}

export const useStep12Store = create<Step12State>()(
  persist(
    (set, get) => ({
      userId: undefined,
      selected: [],
      order: [],
      selectionsBySerial: {},

      toggleSelect: (occ) => set((state) => {
        const exists = state.selected.find(o => o.occupation_serial === occ.occupation_serial)
        if (exists) {
          const nextSel = state.selected.filter(o => o.occupation_serial !== occ.occupation_serial)
          const nextOrder = state.order.filter(s => s !== occ.occupation_serial)
          const { [occ.occupation_serial]: _, ...rest } = state.selectionsBySerial
          return { selected: nextSel, order: nextOrder, selectionsBySerial: rest }
        }
        if (state.selected.length >= 5) return state
        return { selected: [...state.selected, occ] }
      }),

      isSelected: (serial) => !!get().selected.find(o => o.occupation_serial === serial),

      setOrder: (order) => set({ order }),

      setSelectionsFor: (serial, list) => set((state) => ({
        selectionsBySerial: { ...state.selectionsBySerial, [serial]: list.slice(0, 2) }
      })),

      reset: () => set({ selected: [], order: [], selectionsBySerial: {} }),

      ensureUser: async (expectedUserId) => {
        const userId = expectedUserId ?? (await supabase.auth.getUser()).data.user?.id
        if (get().userId !== userId) {
          set({
            userId,
            selected: [],
            order: [],
            selectionsBySerial: {},
          })
        }
      },
    }),
    {
      name: 'step12-store',
      version: 3,
      partialize: (state) => ({
        userId: state.userId,
        selected: state.selected,
        order: state.order,
        selectionsBySerial: state.selectionsBySerial,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<Step12State> | undefined;
        return {
          userId: state?.userId,
          selected: state?.selected ?? [],
          order: state?.order ?? [],
          selectionsBySerial: state?.selectionsBySerial ?? {},
        };
      },
    }
  )
)
