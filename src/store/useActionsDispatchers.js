import { useContext, useMemo, useCallback, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns/fp';
import { throttle } from 'lodash';
import { previewThrottleWait } from '../constants';
import { useMinTime, useLeftToTimeFunc } from '@michaelyin/timeline';

import JobShopDispatchContext from '../JobShopDispatchContext';
import {
  setIsDragging,
  createTask,
  updateTask,
  deleteTask,

  previewAssignProcedure,
  previewRemoveTask,
  cancelPreviewFromMachineLane,
  previewMoveTask,
  cancelPreviewRemove,

  changeJobColor,
} from './actionCreators';

const roundToMinute = milliseconds => Math.round(milliseconds / 60000) * 60000;

export const useSetIsDragging = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const setIsDraggingCallback = useMemo(
    () => isDragging => {
      const action = setIsDragging(isDragging);
      dispatch(action);
    },
    [dispatch]
  );
  return setIsDraggingCallback;
};

export const useMoveProcedureToMacheineLane = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const leftToTimeFunc = useLeftToTimeFunc();
  const minTime = useMinTime();
  const moveProcedureToMacheineLane = useMemo(
    () => (procedureId, posXOnMachineLane) => {
      const start = leftToTimeFunc(posXOnMachineLane);
      const millisecondsFromStart = differenceInMilliseconds(minTime)(start);
      const roundedMillisecondsFromStart = roundToMinute(millisecondsFromStart);
      dispatch(createTask({
        procedureId: procedureId,
        millisecondsFromStart: roundedMillisecondsFromStart,
      }));
    },
    [dispatch, leftToTimeFunc, minTime]
  );
  return moveProcedureToMacheineLane;
};

// need to find a way to not dispatch if millisecondsFromStart did not change
// so that the undo history does not get bloated
// maybe undo custom filter
export const useMoveTaskOnMacheineLane = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const leftToTimeFunc = useLeftToTimeFunc();
  const minTime = useMinTime();
  const moveProcedureToMacheineLane = useMemo(
    () => (procedureId, posXOnMachineLane) => {
      const start = leftToTimeFunc(posXOnMachineLane);
      const millisecondsFromStart = differenceInMilliseconds(minTime)(start);
      const roundedMillisecondsFromStart = roundToMinute(millisecondsFromStart);
      dispatch(updateTask(
        procedureId,
        {
          procedureId: procedureId,
          millisecondsFromStart: roundedMillisecondsFromStart,
        }
      ));
    },
    [dispatch, leftToTimeFunc, minTime]
  );
  return moveProcedureToMacheineLane;
};

export const useRemoveTask = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const removeTask = useMemo(
    () => (procedureId) => {
      dispatch(deleteTask(procedureId));
    },
    [dispatch]
  );
  return removeTask;
};

export const usePreviewAssignProcedure = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const leftToTimeFunc = useLeftToTimeFunc();
  const minTime = useMinTime();
  const previewAssignProcedureCallback = useMemo(
    () => (procedureId, posXOnMachineLane) => {
      const start = leftToTimeFunc(posXOnMachineLane);
      const millisecondsFromStart = differenceInMilliseconds(minTime)(start);
      const roundedMillisecondsFromStart = roundToMinute(millisecondsFromStart);
      dispatch(previewAssignProcedure(
        procedureId,
        roundedMillisecondsFromStart,
      ));
    },
    [dispatch, leftToTimeFunc, minTime]
  );

  const previewAssignProcedureThrottled = useCallback(
    throttle(
      (...args) => {
        previewAssignProcedureCallback(...args)
      },
      previewThrottleWait,
      { leading: true, trailing: false }
    ),
    [previewAssignProcedureCallback]
  );
  useEffect(() => {
    return () => {
      if (previewAssignProcedureThrottled.cancel) {
        previewAssignProcedureThrottled.cancel();
      }
    }
  }, [previewAssignProcedureCallback]);

  return previewAssignProcedureThrottled;
};

export const usePreviewMoveTask = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const leftToTimeFunc = useLeftToTimeFunc();
  const minTime = useMinTime();
  const previewMoveTaskCallback = useMemo(
    () => (procedureId, posXOnMachineLane) => {
      const start = leftToTimeFunc(posXOnMachineLane);
      const millisecondsFromStart = differenceInMilliseconds(minTime)(start);
      const roundedMillisecondsFromStart = roundToMinute(millisecondsFromStart);
      dispatch(previewMoveTask(
        procedureId,
        roundedMillisecondsFromStart,
      ));
    },
    [dispatch, leftToTimeFunc, minTime]
  );

  const previewMoveTaskThrottled = useCallback(
    throttle(
      (...args) => {
        previewMoveTaskCallback(...args)
      },
      previewThrottleWait,
      { leading: true, trailing: false }
    ),
    [previewMoveTaskCallback]
  );
  useEffect(() => {
    return () => {
      if (previewMoveTaskThrottled.cancel) {
        previewMoveTaskThrottled.cancel();
      }
    }
  }, [previewMoveTaskThrottled]);

  return previewMoveTaskThrottled;
};


export const usePreviewRemoveTask = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const previewRemoveTaskCallback = useMemo(
    () => (procedureId) => {
      dispatch(previewRemoveTask(
        procedureId,
      ));
    },
    [dispatch]
  );

  const previewRemoveTaskThrottled = useCallback(
    throttle(
      (...args) => {
        previewRemoveTaskCallback(...args)
      },
      previewThrottleWait,
      { leading: true, trailing: false }
    ),
    [previewRemoveTaskCallback]
  );
  useEffect(() => {
    return () => {
      if (previewRemoveTaskThrottled.cancel) {
        previewRemoveTaskThrottled.cancel();
      }
    }
  }, [previewRemoveTaskThrottled]);

  return previewRemoveTaskThrottled;
};

export const useCancelPreviewFromMachineLane = machineLaneId => {
  const dispatch = useContext(JobShopDispatchContext);
  const cancelPreviewFromMachineLaneCallback = useMemo(
    () => () => {
      dispatch(cancelPreviewFromMachineLane(
        machineLaneId
      ));
    },
    [dispatch, machineLaneId]
  );

  return cancelPreviewFromMachineLaneCallback;
};

export const useCancelPreviewRemove = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const cancelPreviewRemoveCallback = useMemo(
    () => () => {
      dispatch(cancelPreviewRemove());
    },
    [dispatch]
  );

  return cancelPreviewRemoveCallback;
};

export const useChangeJobColor = id => {
  const dispatch = useContext(JobShopDispatchContext);
  const changeJobColorCallback = useMemo(
    () => () => {
      dispatch(changeJobColor(id));
    },
    [dispatch, id]
  );

  return changeJobColorCallback;
};