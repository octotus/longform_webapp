import { create } from 'zustand';

interface FocusState {
  sessionActive: boolean;
  remainingSeconds: number;
  sessionCompleted: boolean;
  nudgeVisible: boolean;
  startSession: (durationMinutes: number) => void;
  endSession: () => void;
  tick: () => void;
  dismissNudge: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;

export const useFocusStore = create<FocusState>((set, get) => ({
  sessionActive: false,
  remainingSeconds: 0,
  sessionCompleted: false,
  nudgeVisible: false,

  startSession: (durationMinutes) => {
    if (timer) clearInterval(timer);
    const seconds = durationMinutes * 60;
    set({ sessionActive: true, remainingSeconds: seconds, sessionCompleted: false, nudgeVisible: false });
    document.documentElement.requestFullscreen?.().catch(() => {});
    navigator.wakeLock?.request('screen').catch(() => {});
    timer = setInterval(() => get().tick(), 1000);
  },

  endSession: () => {
    if (timer) { clearInterval(timer); timer = null; }
    document.exitFullscreen?.().catch(() => {});
    set({ sessionActive: false, remainingSeconds: 0 });
  },

  tick: () => {
    const { remainingSeconds } = get();
    if (remainingSeconds <= 1) {
      if (timer) { clearInterval(timer); timer = null; }
      document.exitFullscreen?.().catch(() => {});
      set({ sessionActive: false, remainingSeconds: 0, sessionCompleted: true, nudgeVisible: true });
    } else {
      set({ remainingSeconds: remainingSeconds - 1 });
    }
  },

  dismissNudge: () => set({ nudgeVisible: false }),
}));
