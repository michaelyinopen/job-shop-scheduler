import React, { useRef, useEffect } from 'react';
import { DropTarget } from 'react-dnd';
import itemTypes from './dragDrop/itemTypes';
import dropResultTypes from './dragDrop/dropResultTypes';

import classNames from 'classnames/bind';
import productionStyles from './Production.module.css';
import useLeftAtBeginDrag from './store/useLeftAtBeginDrag';
import {
  useMoveProcedureToMacheineLane,
  useMoveTaskOnMacheineLane,
  usePreviewAssignProcedure,
  useCancelPreviewFromMachineLane,
  usePreviewMoveTask,
} from './store/useActionsDispatchers';
const cx = classNames.bind(productionStyles);

const machineLaneTarget = {
  canDrop(props, monitor) {
    const { id } = props;
    const itemType = monitor.getItemType();
    const item = monitor.getItem();
    return (itemType === itemTypes.PROCEDURE || itemType === itemTypes.TASK) &&
      (item && item.machineId === id);
  },
  drop(props, monitor) {
    const { id, machineLaneLeft, moveProcedureToMacheineLane, moveTaskOnMacheineLane } = props;
    const itemType = monitor.getItemType();
    const sourceClientOffsetX = monitor.getSourceClientOffset().x;
    const posXOnMachineLane = Math.max(sourceClientOffsetX - machineLaneLeft, 0);

    if (itemType === itemTypes.PROCEDURE) {
      const item = monitor.getItem();
      const procedureId = item.id;
      moveProcedureToMacheineLane(
        procedureId,
        posXOnMachineLane
      );
    }

    if (itemType === itemTypes.TASK) {
      const item = monitor.getItem();
      const procedureId = item.id;
      moveTaskOnMacheineLane(
        procedureId,
        posXOnMachineLane
      );
    }

    return {
      type: dropResultTypes.MACHINE_LANE,
      id,
      posXOnMachineLane
    };
  },
  hover(props, monitor) {
    if (monitor.canDrop()) {
      const {
        machineLaneLeft,
        previewAssignProcedure,
        previewMoveTask,
      } = props;
      const itemType = monitor.getItemType();
      const sourceClientOffsetX = monitor.getSourceClientOffset().x;
      const posXOnMachineLane = Math.max(sourceClientOffsetX - machineLaneLeft, 0);

      if (itemType === itemTypes.PROCEDURE) {
        const item = monitor.getItem();
        const procedureId = item.id;
        previewAssignProcedure(
          procedureId,
          posXOnMachineLane
        );
      }

      if (itemType === itemTypes.TASK) {
        const item = monitor.getItem();
        const procedureId = item.id;
        previewMoveTask(
          procedureId,
          posXOnMachineLane
        );
      }
    }
  },
};

const getIsMachineOfProcedure = (id, itemType, item) => {
  if (!itemType)
    return false;
  if (itemType === itemTypes.PROCEDURE || itemType === itemTypes.TASK) {
    return item.machineId === id;
  }
};

function collect(connect, monitor, props) {
  const { id } = props;
  const itemType = monitor.getItemType();
  const item = monitor.getItem();
  const isMachineOfProcedure = getIsMachineOfProcedure(id, itemType, item);

  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    isMachineOfProcedure
  }
};

const MachineLane = ({
  id,
  connectDropTarget,
  machineLaneRef,
  previewAssignProcedure,
  previewMoveTask,
  cancelPreviewFromMachineLane,
  canDrop,
  isOver,
  isMachineOfProcedure,
  children,
}) => {
  useEffect(
    () => {
      if (canDrop && !isOver) {
        if (previewAssignProcedure && previewAssignProcedure.cancel) {
          previewAssignProcedure.cancel();
        }
        if (previewMoveTask && previewMoveTask.cancel) {
          previewMoveTask.cancel();
        }
        cancelPreviewFromMachineLane();
      }
    },
    [canDrop && isOver]
  );
  return connectDropTarget(
    <div
      ref={machineLaneRef}
      className={cx({
        "production__machine-lane": true,
        "production__machine-lane--can-drop": isMachineOfProcedure && !isOver,
        "production__machine-lane--over-drop": isMachineOfProcedure && isOver,
      })}
    >
      {children}
    </div>
  );
};

const MachineLaneDropTarget = React.memo(DropTarget([itemTypes.PROCEDURE, itemTypes.TASK], machineLaneTarget, collect)(MachineLane));

const MachineLaneContainer = ({
  id,
  children
}) => {
  const machineLaneRef = useRef(null);
  const machineLaneLeft = useLeftAtBeginDrag(machineLaneRef);

  const moveProcedureToMacheineLane = useMoveProcedureToMacheineLane();
  const moveTaskOnMacheineLane = useMoveTaskOnMacheineLane();

  const previewAssignProcedure = usePreviewAssignProcedure();
  const previewMoveTask = usePreviewMoveTask();
  const cancelPreviewFromMachineLane = useCancelPreviewFromMachineLane(id);

  return (
    <MachineLaneDropTarget
      id={id}
      machineLaneRef={machineLaneRef}
      machineLaneLeft={machineLaneLeft}
      moveProcedureToMacheineLane={moveProcedureToMacheineLane}
      moveTaskOnMacheineLane={moveTaskOnMacheineLane}
      previewAssignProcedure={previewAssignProcedure}
      previewMoveTask={previewMoveTask}
      cancelPreviewFromMachineLane={cancelPreviewFromMachineLane}
    >
      {children}
    </MachineLaneDropTarget>
  )
};

export default MachineLaneContainer;