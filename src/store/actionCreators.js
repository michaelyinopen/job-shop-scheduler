import * as fromActionTypes from './actionTypes';

export const setReferenceDate = date => ({
  type: fromActionTypes.setReferenceDate,
  date
});

export const createMachines = machines => ({
  type: fromActionTypes.createMachines,
  machines
});

export const createJobs = jobs => ({
  type: fromActionTypes.createJobs,
  jobs
});

export const createTask = task => ({
  type: fromActionTypes.createTask,
  procedureId: task.procedureId,
  task
});

export const updateTask = (procedureId, task) => ({
  type: fromActionTypes.updateTask,
  procedureId,
  task
});

export const setTasks = tasks => ({
  type: fromActionTypes.setTasks,
  tasks
});

export const deleteTask = procedureId => ({
  type: fromActionTypes.deleteTask,
  procedureId
});

export const setIsDragging = isDragging => ({
  type: fromActionTypes.setIsDragging,
  isDragging
});

export const previewAssignProcedure = (procedureId, millisecondsFromStart) => ({
  type: fromActionTypes.previewAssignProcedure,
  procedureId,
  millisecondsFromStart
});

export const previewMoveTask = (procedureId, millisecondsFromStart) => ({
  type: fromActionTypes.previewMoveTask,
  procedureId,
  millisecondsFromStart
});

export const previewRemoveTask = procedureId => ({
  type: fromActionTypes.previewRemoveTask,
  procedureId
});

export const cancelPreviewFromMachineLane = machineLaneId => ({
  type: fromActionTypes.cancelPreviewFromMachineLane,
  machineLaneId
});

export const cancelPreviewRemove = () => ({
  type: fromActionTypes.cancelPreviewRemove
});

export const changeJobColor = id => ({
  type: fromActionTypes.changeJobColor,
  id
});