import { create } from 'zustand';

const CURRENT_PROCESS_KEY = 'currentProcess';

const useCurrentProcessStore = create((set, get) => ({
  processId: null,
  processName: null,

  actions: {
    setProcess: (processId, name) => {
      set({ processId, processName: name });
      localStorage.setItem(CURRENT_PROCESS_KEY, JSON.stringify({ processId, processName: name }));
    },

    clearProcess: () => {
      set({ 
        processId: null, 
        processName: null
      });
      localStorage.removeItem(CURRENT_PROCESS_KEY);
    },
  },
}));

export const useCurrentProcess = () => {
  const state = useCurrentProcessStore();
  return {
    processId: state.processId,
    processName: state.processName,
  };
};

export const useCurrentProcessActions = () => useCurrentProcessStore((state) => state.actions);

export default useCurrentProcessStore;
