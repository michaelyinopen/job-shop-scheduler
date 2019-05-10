
export const proceduresSelector = state => {
  return state.procedures.present;
};

export const previewTasksSelector = state => {
  return state.previewTasks;
};

export const referenceDateSelector = state => {
  return state.referenceDate;
};

export const timelineStateSelector = state => {
  return state.timelineState;
};

export const timelineGroupsSelector = state => {
  return state.machines;
};