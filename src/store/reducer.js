import { combineReducers } from 'redux';
import undoable from 'redux-undo';
import includeActionDistinct from '../functions/includeActionDistinct';
import reduceReducers from 'reduce-reducers';
import createReducer from '../functions/createReducer';
import { updateItemWithIdProp, createOrUpdateItemWithIdProp } from '../functions/updateItem';
import { getNextOfMax } from '../functions/getNextId';
import {
  setReferenceDate,
  createMachines,
  createJobs,
  createTask,
  updateTask,
  deleteTask,
  setTasks,

  setIsDragging,
  previewAssignProcedure,
  previewMoveTask,
  previewRemoveTask,
  cancelPreviewFromMachineLane,

  changeJobColor,

  undoableActionTypes,
} from './actionTypes';
import {
  bareTimelineReducer,
  initBareState as initTimelineBareState,
} from '@michaelyin/timeline';
import { proceduresSelector } from './selectors';
import getNewColor from './jobColor';

//#region Machines
const machineInitialState = id => ({
  id,
  title: undefined,
  description: undefined
});

const machine = id => createReducer(
  machineInitialState(id),
  {
    [createMachines]: (state, _action, machine) => ({
      ...state,
      title: machine.title,
      description: machine.description
    }),
  }
);

const machinesInitialState = [];
const machines = createReducer(
  machinesInitialState,
  {
    [createMachines]: (state, action) => {
      const { machines: machinesFromAction } = action;
      const newMachines = machinesFromAction.map(m => machine(m.id)(undefined, action, m));
      return [...state, ...newMachines];
    },
  }
);
//#endregion Machines

//#region Jobs
const jobInitialState = id => ({
  id,
  title: undefined,
  description: undefined
});

const job = id => createReducer(
  jobInitialState(id),
  {
    [createJobs]: (state, _action, job) => ({
      ...state,
      title: job.title,
      description: job.description
    }),
  }
);

const jobsInitialState = [];
const jobs = createReducer(
  jobsInitialState,
  {
    [createJobs]: (state, action) => {
      const { jobs: jobsFromAction } = action;
      const newJobs = jobsFromAction.map(j => job(j.id)(undefined, action, j));
      return [...state, ...newJobs];
    },
  }
);

const initJobs = jobsArg => {
  return jobsArg.map(j => ({
    ...jobInitialState(j.id),
    title: j.title,
    description: j.description,
  }));
};
//#endregion Jobs

//#region Procedures
const procedureInitialState = id => ({
  id,
  jobId: undefined,
  machineId: undefined,
  sequence: undefined,
  processingMilliseconds: undefined,
  millisecondsFromStart: null
});

const procedure = id => createReducer(
  procedureInitialState(id),
  {
    [createJobs]: (state, _action, procedure) => ({
      ...state,
      jobId: procedure.jobId,
      machineId: procedure.machineId,
      sequence: procedure.sequence,
      processingMilliseconds: procedure.processingMilliseconds
    }),
    [createTask]: (state, { task }) => ({
      ...state,
      millisecondsFromStart: task.millisecondsFromStart
    }),
    [updateTask]: (state, { task }) => {
      if (state.millisecondsFromStart === task.millisecondsFromStart) {
        return state;
      }
      return ({
        ...state,
        millisecondsFromStart: task.millisecondsFromStart
      });
    },
    [setTasks]: (state, _action, task) => {
      if (state.millisecondsFromStart === task.millisecondsFromStart) {
        return state;
      }
      return ({
        ...state,
        millisecondsFromStart: task.millisecondsFromStart
      });
    },
    [deleteTask]: (state, _action) => ({
      ...state,
      millisecondsFromStart: null
    }),
  }
);

const proceduresInitialState = [];
const procedures = createReducer(
  proceduresInitialState,
  {
    [createJobs]: (state, action) => {
      const { jobs: jobsFromAction } = action;
      const newProcedures = jobsFromAction
        .map(j => j.procedures)
        .reduce((acc, cur) => acc.concat(cur), [])
        .map(p => procedure(p.id)(undefined, action, p));
      return [...state, ...newProcedures];
    },
    [createTask]: updateItemWithIdProp("procedureId")(procedure),
    [updateTask]: updateItemWithIdProp("procedureId")(procedure),
    [setTasks]: (state, action) => {
      const { tasks: tasksFromAction } = action;
      const newProcedures = state.map(previous => {
        const taskFromAction = tasksFromAction.find(i => i.id === previous.id);
        if (taskFromAction) {
          return procedure(previous.id)(previous, action, taskFromAction);
        }
        return previous;
      });
      return newProcedures;
    },
    [deleteTask]: updateItemWithIdProp("procedureId")(procedure)
  }
);

const initProcedures = jobsArg => {
  return jobsArg
    .map(j => j.procedures)
    .reduce((acc, cur) => acc.concat(cur), [])
    .map(p => ({
      ...procedureInitialState(p.id),
      jobId: p.jobId,
      machineId: p.machineId,
      sequence: p.sequence,
      processingMilliseconds: p.processingMilliseconds,
    }));
}
//#endregion Procedures

//#region Preview
// hide is displayed, separation of hide and remove includes feasibility check (not limited to)
// maybe useful if timeline supports hidden item (not collapse height, but will not have two layers when moving)
export const originalTaskMode = {
  remove: "REMOVE",
  hide: "HIDE",
};

const previewTaskInitialState = procedureId => ({
  id: undefined,
  procedureId,
  millisecondsFromStart: undefined,
  originalTaskMode: null, // originalTaskMode.remove, originalTaskMode.hide
});

const previewTask = procedureId => createReducer(
  previewTaskInitialState(procedureId),
  {
    [previewAssignProcedure]: (state, { millisecondsFromStart }) => {
      if (state.millisecondsFromStart === millisecondsFromStart
        && state.originalTaskMode === originalTaskMode.remove) {
        return state;
      }
      return {
        ...state,
        millisecondsFromStart,
        originalTaskMode: originalTaskMode.remove,
      };
    },
    [previewMoveTask]: (state, { millisecondsFromStart }) => {
      if (state.millisecondsFromStart === millisecondsFromStart
        && state.originalTaskMode === originalTaskMode.hide) {
        return state;
      }
      return {
        ...state,
        millisecondsFromStart,
        originalTaskMode: originalTaskMode.hide,
      };
    },
    [previewRemoveTask]: (state, _action) => {
      if (state.originalTaskMode === originalTaskMode.remove) {
        return state;
      }
      return {
        ...state,
        originalTaskMode: originalTaskMode.remove,
      };
    },
  }
);

// simple case only need singel previewTask, and do not need array
// but use array for advanced preview
const previewTasksInitialState = [];
const previewTasks = createReducer(
  previewTasksInitialState,
  {
    [previewAssignProcedure]: createOrUpdateItemWithIdProp("procedureId", "procedureId")(previewTask),
    [previewMoveTask]: createOrUpdateItemWithIdProp("procedureId", "procedureId")(previewTask),
    [previewRemoveTask]: createOrUpdateItemWithIdProp("procedureId", "procedureId")(previewTask),
    [setIsDragging]: (state, { isDragging }) => {
      return isDragging ? state : previewTasksInitialState;
    },
    [cancelPreviewFromMachineLane]: (_state, _action) => {
      return previewTasksInitialState;
    }
  }
);

// state.previewTasks and proceduresSelector(state) must be correct
export const setPreviewTaskIdsReducer = state => {
  if (state.previewTasks.length === 0) {
    return state;
  }
  const sortedPreviewTasks = [...state.previewTasks].sort((a, b) => a.procedureId - b.procedureId);
  const procedureIds = proceduresSelector(state).map(p => p.id);
  let previewTasksWithNewId = [];
  let hasUpdate = false;
  for (var i = 0; i < sortedPreviewTasks.length; ++i) {
    const previousPreviewTask = sortedPreviewTasks[i];
    const newId = getNextOfMax([
      ...procedureIds,
      ...previewTasksWithNewId.map(pt => pt.id)
    ]);
    if (previousPreviewTask.id !== newId) {
      hasUpdate = true;
      const newPreviewTask = {
        ...previousPreviewTask,
        id: newId
      };
      previewTasksWithNewId.push(newPreviewTask);
    }
    else {
      previewTasksWithNewId.push(previousPreviewTask);
    }
  }

  if (hasUpdate) {
    return {
      ...state,
      previewTasks: previewTasksWithNewId
    }
  }
  else {
    return state;
  }
};
//#endregion Preview

//#region jobColors
const jobColorInitialState = id => ({
  id,
  color: undefined,
  textColor: undefined,
});

const jobColor = id => createReducer(
  jobColorInitialState(id),
  {
    [createJobs]: (state, _action, jobColor) => ({
      ...state,
      color: jobColor.color,
      textColor: jobColor.textColor,
    }),
    [changeJobColor]: (state, _action, jobColor) => ({
      ...state,
      color: jobColor.color,
      textColor: jobColor.textColor,
    }),
  }
);

const jobColorsInitialState = [];
const jobColors = createReducer(
  jobColorsInitialState,
  {
    [createJobs]: (state, action) => {
      const { jobs: jobsFromAction } = action;
      let newJobColors = [];
      for (var i = 0; i < jobsFromAction.length; ++i) {
        const id = jobsFromAction[i].id;
        const excludeColors = [...state, ...newJobColors].map(jc => jc.color);
        const [color, textColor] = getNewColor(excludeColors);
        newJobColors.push(jobColor(id)(undefined, action, { color, textColor }));
      }
      return [...state, ...newJobColors];
    },
    [changeJobColor]: (state, action) => {
      const { id } = action;
      const excludeColors = state.map(jc => jc.color);
      return state.map(jc => {
        if (jc.id === id) {
          const currentColor = jc.color;
          const [color, textColor] = getNewColor(excludeColors, currentColor);
          return jobColor(id)(jc, action, { color, textColor })
        }
        return jc;
      });
    },
  }
);

const initJobColors = jobs => {
  let newJobColors = [];
  for (var i = 0; i < jobs.length; ++i) {
    const id = jobs[i].id;
    const excludeColors = [...newJobColors].map(jc => jc.color);
    const [color, textColor] = getNewColor(excludeColors);
    newJobColors.push(({
      id,
      color,
      textColor,
    }));
  }
  return [...newJobColors];
}
//#endregion jobColors

const referenceDateInitialState = new Date(0);
const referenceDate = createReducer(
  referenceDateInitialState,
  {
    [setReferenceDate]: (state, { date }) => date
  }
);

const isDraggingInitialState = false;
const isDragging = createReducer(
  isDraggingInitialState,
  {
    [setIsDragging]: (_state, { isDragging }) => isDragging,
  }
);

export const initialProceduresHistory = proceduresPresent => ({
  past: [],
  present: proceduresPresent,
  future: []
});

const reducer = combineReducers({
  machines,
  jobs,
  procedures: undoable(
    procedures,
    {
      filter: includeActionDistinct(undoableActionTypes),
      initialHistory: initialProceduresHistory(procedureInitialState),
    }
  ),
  referenceDate,
  timelineState: bareTimelineReducer,
  isDragging,
  previewTasks,
  jobColors,
});

export const init = ({
  machines: machinesArg = machinesInitialState,
  jobs: jobsArg = jobsInitialState,
  referenceDate: referenceDateArg = referenceDateInitialState,
  timeOptions,
}) => {
  const mappedJobs = initJobs(jobsArg);
  const mappedProcedures = initProcedures(jobsArg);
  const mappedProceduresHistory = initialProceduresHistory(mappedProcedures);

  return ({
    machines: [...machinesArg],
    jobs: mappedJobs,
    procedures: mappedProceduresHistory,
    referenceDate: new Date(referenceDateArg),
    timelineState: initTimelineBareState(timeOptions),
    isDragging: isDraggingInitialState,
    previewTasks: previewTasksInitialState,
    jobColors: initJobColors(jobsArg)
  })
}

const reducerWithPreviewTasksLogic = reduceReducers(
  null,
  reducer,
  setPreviewTaskIdsReducer
);
export default reducerWithPreviewTasksLogic;