import { AiInsightResult } from '@/types/ai-insights'
import { create } from 'zustand'

interface AiInsightsStore {
  // Data
  summaryData: AiInsightResult | null
  setSummaryData: (data: AiInsightResult | null) => void

  // Interaction
  activeCitationId: number | null // RefIndex (0, 1, 2...)
  setActiveCitationId: (id: number | null) => void

  // PDF Viewer Control
  // We will expose a way to trigger PDF actions
  triggerPdfView: (page: number, phrase?: string) => void
  setPdfTrigger: (fn: (page: number, phrase?: string) => void) => void
}

export const useAiInsightsStore = create<AiInsightsStore>((set) => ({
  summaryData: null,
  setSummaryData: (data) => set({ summaryData: data }),

  activeCitationId: null,
  setActiveCitationId: (id) => set({ activeCitationId: id }),

  // Default no-op
  triggerPdfView: () => console.warn('PDF Trigger not initialized'),
  setPdfTrigger: (fn) => set({ triggerPdfView: fn }),
}))
