import { useContext, useMemo } from 'react';
import ProductionStateContext from '../ProductionStateContext';
import { addMilliseconds } from 'date-fns/fp';
import { memoize } from 'lodash';
import { itemInitialState as timelineItemInitialState } from '@michaelyin/timeline';
import { proceduresSelector, previewTasksSelector } from './selectors';
import { originalTaskMode } from './reducer';

export const useJobIds = () => {
  const state = useContext(ProductionStateContext);
  const sortedJobIds = useMemo(
    () => state.jobs.map(j => j.id).sort((a, b) => a - b),
    [state.jobs]
  );
  return sortedJobIds;
};

export const useJob = id => {
  const state = useContext(ProductionStateContext);
  return state.jobs.find(j => j.id === id);
};

export const useProcedures = () => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  return procedures;
};

export const useProcedureIdsOfJob = jobId => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  const sortedProcedureIds = useMemo(
    () => procedures
      .filter(p => p.jobId === jobId)
      .map(p => p.id)
      .sort((a, b) => a - b),
    [procedures]
  );
  return sortedProcedureIds;
};

export const useProcedure = id => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  return procedures.find(p => p.id === id);
};

export const hasMillisecondsFromStart = p => Boolean(p.millisecondsFromStart || p.millisecondsFromStart === 0);
export const useTasks = () => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  const tasks = procedures.filter(hasMillisecondsFromStart);
  return tasks;
};

export const useTask = procedureId => {
  const tasks = useTasks();
  return tasks.find(p => p.id === procedureId);
};

export const useIsDragging = () => {
  const state = useContext(ProductionStateContext);
  return state.isDragging;
};

export const useCanUndo = () => {
  const state = useContext(ProductionStateContext);
  return state.procedures.past.length > 0;
};

export const useCanRedo = () => {
  const state = useContext(ProductionStateContext);
  return state.procedures.future.length > 0;
};

//#region previewTask
export const getPreviewAppliedProcedure = (id, procedures, previewTasks) => {
  const procedure = procedures.find(p => p.id === id);
  if (procedure) {
    const hasPreviewRemove = previewTasks.some(pt => pt.originalTaskMode === originalTaskMode.remove && pt.procedureId === id)
    if (hasPreviewRemove && hasMillisecondsFromStart(procedure)) {
      return {
        ...procedure,
        isPreviewRemove: true,
      }
    }
    const hasPreviewhide = previewTasks.some(pt => pt.originalTaskMode === originalTaskMode.hide && pt.procedureId === id)
    if (hasPreviewhide) {
      return {
        ...procedure,
        isPreviewHide: true,
      }
    }
    return procedure;
  }
  const previewTask = previewTasks.find(pt => pt.id === id);
  const procedureOfPreviewTask = procedures.find(p => p.id === previewTask.procedureId);
  if (!hasMillisecondsFromStart(previewTask)) {
    return;
  }
  return { // add the property isPreview, and isPreviewRemove
    ...procedureOfPreviewTask,
    id: previewTask.id,
    procedureId: procedureOfPreviewTask.id,
    millisecondsFromStart: previewTask.millisecondsFromStart,
    isPreview: true,
  }
};

const getPreviewAppliedProcedures = (procedures, previewTasks) => {
  const previewTasksWithStart = previewTasks.filter(p => hasMillisecondsFromStart(p));
  return [...procedures, ...previewTasksWithStart]
    .map(p => getPreviewAppliedProcedure(p.id, procedures, previewTasks));
}

export const usePreviewAppliedProcedures = () => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  const previewTasks = previewTasksSelector(state);
  const proceduresOfJob = useMemo(
    () => {
      return getPreviewAppliedProcedures(procedures, previewTasks)
    },
    [procedures, previewTasks]
  );
  return proceduresOfJob;
};

export const usePreviewAppliedTask = id => {
  const state = useContext(ProductionStateContext);
  const procedures = proceduresSelector(state);
  const previewTasks = previewTasksSelector(state);
  const result = useMemo(
    () => {
      const procedure = getPreviewAppliedProcedure(id, procedures, previewTasks);
      if (hasMillisecondsFromStart(procedure)) {
        return procedure;
      }
    },
    [id, procedures, previewTasks]
  );
  return result;
};

// exclude remove
export const usePreviewAppliedEffectiveTask = id => {
  const previewAppliedTask = usePreviewAppliedTask(id);
  const result = useMemo(
    () => {
      if (previewAppliedTask.isPreview) {
        return {
          ...previewAppliedTask,
          id: previewAppliedTask.procedureId
        };
      };
      return previewAppliedTask;
    },
    [previewAppliedTask]
  )
  return result;
};

// exclude remove
export const usePreviewAppliedEffectiveTasks = () => {
  const previewAppliedProcedures = usePreviewAppliedProcedures();
  const result = useMemo(
    () => {
      return previewAppliedProcedures
        .filter(p => hasMillisecondsFromStart(p) && !p.isPreviewHide && !p.isPreviewRemove)
        .map(p => {
          if (p.isPreview) {
            return {
              ...p,
              id: p.procedureId
            }
          }
          return p;
        });
    },
    [previewAppliedProcedures]
  )
  return result;
};

export const usePreviewAppliedEffectiveProceduresOfJob = jobId => {
  const previewAppliedProcedures = usePreviewAppliedProcedures();
  const result = useMemo(
    () => {
      return previewAppliedProcedures
        .filter(p => !p.isPreviewHide)
        .filter(p => p.jobId === jobId)
        .map(p => {
          if (p.isPreview) {
            return {
              ...p,
              id: p.procedureId
            }
          }
          if (p.isPreviewRemove) {
            return {
              ...p,
              millisecondsFromStart: null
            }
          }
          return p;
        });
    },
    [previewAppliedProcedures]
  )
  return result;
};
//#endregion previewTask

//#region useTimelineItems
// memoization of timelineItems to use the same instance if procedure is unchanged
const convertToTimelineItem = (p, referenceDate) => {
  if (hasMillisecondsFromStart(p)) {
    const groupId = p.machineId;
    const start = addMilliseconds(p.millisecondsFromStart)(referenceDate);
    const end = addMilliseconds(p.processingMilliseconds)(start);
    return {
      ...timelineItemInitialState(p.id),
      groupId,
      start,
      end,
    }
  }
  return timelineItemInitialState(p.id)
};

export const useTimelineItems = (procedures, referenceDate) => {
  const memoizeConvertToTimelineItem = useMemo(
    () => {
      const m = memoize(convertToTimelineItem);
      m.cache = new WeakMap();
      return m;
    },
    [referenceDate]// if reference Date changed, the memoizeFunction is recreated
  );
  const timelineItems = useMemo(
    () => procedures.map(p => memoizeConvertToTimelineItem(p, referenceDate)),
    [procedures, referenceDate]
  )
  return timelineItems
};

export const usePreviewAppliedTimelineItems = (procedures, previewTasks, referenceDate) => {
  const memoizeConvertToTimelineItem = useMemo(
    () => {
      const m = memoize(convertToTimelineItem);
      m.cache = new WeakMap();
      return m;
    },
    [referenceDate]// if reference Date changed, the memoizeFunction is recreated
  );
  const timelineItems = useMemo(
    () => {
      const timelineProcedures = getPreviewAppliedProcedures(procedures, previewTasks)
        .filter(p => hasMillisecondsFromStart(p));
      return timelineProcedures.map(p => memoizeConvertToTimelineItem(p, referenceDate));
    },
    [procedures, previewTasks, referenceDate]
  )
  return timelineItems;
};
//#endregion useTimelineItem

// returns [backgroundColor, textColor]
export const useJobColor = id => {
  const state = useContext(ProductionStateContext);
  const jobColor = state.jobColors.find(jc => jc.id === id);
  if (jobColor) {
    return [jobColor.color, jobColor.textColor];
  }
}