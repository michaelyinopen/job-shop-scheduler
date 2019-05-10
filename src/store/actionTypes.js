export const setReferenceDate = "SET_REFERENCE_DATE";

export const createMachines = "CREATE_MACHINES";
export const createJobs = "CREATE_JOBS"; // including precedures

export const createTask = "CREATE_TASK"; // assigned procedure
export const updateTask = "UPDATE_TASK"; // assigned procedure
export const setTasks = "SET_TASKS";
export const deleteTask = "DELETE_TASK"; // assigned procedure

export const setIsDragging = "SET_IS_DRAGGING";

export const previewAssignProcedure = "PREVIEW_ASSIGN_PROCEDURE";
export const previewMoveTask = "PREVIEW_MOVE_TASK";
export const previewRemoveTask = "PREVIEW_REMOVE_TASK";

export const cancelPreviewFromMachineLane = "CANCEL_PREVIEW_FRO_MACHINE_LANE";
export const cancelPreviewRemove = "CANCEL_PREVIEW_REMOVE";

export const changeJobColor = "CHANGE_JOB_COLOR";

export const undoableActionTypes = [
  createTask,
  updateTask,
  setTasks,
  deleteTask
];
