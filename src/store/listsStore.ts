import { create } from 'zustand'
import type { MarketingList, AudienceType, BankChannel, AudienceTypeFilter } from '@/types/listsType'

interface ListsStore {
  lists: MarketingList[];
  setLists: (lists: MarketingList[]) => void;
  addList: (list: MarketingList) => void;
  audienceTypes: AudienceType[];
  setAudienceTypes: (audienceTypes: AudienceType[]) => void;
  audienceTypeFilters: AudienceTypeFilter[];
  setAudienceTypeFilters: (audienceTypeFilters: AudienceTypeFilter[]) => void;
  bankChannels: BankChannel[];
  setBankChannels: (bankChannels: BankChannel[]) => void;
}

export const useListsStore = create<ListsStore>((set) => ({
  lists: [],
  setLists: (lists) => set({ lists }),
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  audienceTypes: [],
  setAudienceTypes: (audienceTypes) => set({ audienceTypes }),
  audienceTypeFilters: [],
  setAudienceTypeFilters: (audienceTypeFilters) => set({ audienceTypeFilters }),
  bankChannels: [],
  setBankChannels: (bankChannels) => set({ bankChannels }),
}))
