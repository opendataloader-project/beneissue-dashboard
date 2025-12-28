import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  PublicMetrics,
  ExecutiveMetrics,
  OperationsMetrics,
} from '@/types/metrics';
import {
  mockPublicMetrics,
  mockExecutiveMetrics,
  mockOperationsMetrics,
} from '@/data/mock';

// Data mode: 'mock' for fixed demo data, 'live' for real DB data
export type DataMode = 'mock' | 'live';
export const dataModeAtom = atomWithStorage<DataMode>('beneissue-data-mode', 'mock');

// Date filter atoms
export const selectedMonthAtom = atom<string | null>(null);
export const dateRangeAtom = atom<{ start: string; end: string } | null>(null);

// Metrics data atoms (initialized with mock data)
export const publicMetricsAtom = atom<PublicMetrics>(mockPublicMetrics);
export const executiveMetricsAtom = atom<ExecutiveMetrics>(mockExecutiveMetrics);
export const operationsMetricsAtom = atom<OperationsMetrics>(mockOperationsMetrics);

// Loading states
export const isLoadingAtom = atom<boolean>(false);

// Error state
export const errorAtom = atom<string | null>(null);

// Derived atoms
export const currentMonthLabelAtom = atom((get) => {
  const selected = get(selectedMonthAtom);
  if (!selected) {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  }
  const [year, month] = selected.split('-');
  return `${year}년 ${parseInt(month)}월`;
});
