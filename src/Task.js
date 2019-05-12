import React, { useMemo } from 'react';
import { DragSource } from 'react-dnd';
import { usePreviewAppliedTask, useJobColor } from './store/useSelector';
import { useSetIsDragging } from './store/useActionsDispatchers';
import itemTypes from './dragDrop/itemTypes';

import usePopperHandlers from './usePopperHandlers';
import { taskPopperWait } from './constants';
import CustomPopper from './CustomPopper';

import { Error as ErrorIcon, ExpandLess } from '@material-ui/icons';
import { Fab, IconButton } from '@material-ui/core';
import useTaskFeasible from './store/useTaskFeasible';

import classNames from 'classnames/bind';
import jobShopStyles from '../css/JobShop.module.css';

const cx = classNames.bind(jobShopStyles);

const taskSource = {
  beginDrag(props) {
    const { id, task, setIsDragging } = props;
    setIsDragging(true);
    return {
      type: itemTypes.TASK,
      id: id,
      machineId: task.machineId,
    }
  },
  endDrag(props, monitor) {
    const { setIsDragging } = props;
    setIsDragging(false);
  },
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
};

const Task = ({
  id,
  task,
  backgroundColor,
  foregroundColor,
  isPreview,
  isPreviewRemove,
  feasible,
  connectDragSource,
  isDragging,
  handlePopperOpen,
  handlePopperClose,
  popover
}) => {
  return connectDragSource(
    <div className={cx("job-shop__task-outer")}>
      <div
        className={cx(
          { "job-shop__task": true },
          { "job-shop__task--preview": isPreview },
          { "job-shop__task--preview-remove": isPreviewRemove }
        )}
        style={{
          backgroundColor: backgroundColor
        }}
        onMouseEnter={handlePopperOpen}
        onMouseLeave={handlePopperClose}
      >
        <div className={cx("job-shop__machine-label")}>M{task.machineId}</div>
        <div
          className={cx("job-shop__job-label")}
          style={{ color: foregroundColor }}
        >
          {task.jobId}
        </div>
        <div className={cx("job-shop__sequence-label")}>{task.sequence}</div>
        {!feasible ? (
          <div className={cx("job-shop__infeasible-label")} >
            <IconButton onClick={handlePopperOpen} style={{ padding: "3px" }}>
              <div className={cx("job-shop__infeasible-icon-wrapper")}>
                <ErrorIcon color="error" />
              </div>
            </IconButton>
          </div>
        ) : null}
        {isDragging ? null : popover}
        <div
          className={cx(
            { "job-shop__task-overlay-infeasible": !feasible },
            { "job-shop__task-overlay-infeasible--preview": isPreview },
            { "job-shop__task-overlay-infeasible--preview-remove": isPreviewRemove },
          )}
        />
      </div>
    </div >
  );
};

const TaskDragSource = DragSource(itemTypes.TASK, taskSource, collect)(Task);

const TaskContainer = ({
  id
}) => {
  const task = usePreviewAppliedTask(id);
  const { isPreview, isPreviewRemove } = task;
  const [backgroundColor, foregroundColor] = useJobColor(task.jobId);
  const setIsDragging = useSetIsDragging();
  const [feasible, violationMessages] = useTaskFeasible(id);
  const [
    anchorElement,
    open,
    handlePopperOpen,
    handlePopperClose,
    forcePopperClose
  ] = usePopperHandlers({ wait: taskPopperWait });

  //#region popper
  const popperContent = useMemo(
    () => (
      <div
        className={cx("job-shop__task-popper-content")}
      >
        {!feasible ? (
          <React.Fragment>
            <Fab onClick={forcePopperClose} size="small"><ExpandLess /></Fab>
            <span style={{ color: "red", fontWeight: "bold", fontSize: "28px", verticalAlign: "middle" }}>Conflicts</span>
            <ul className={cx("job-shop__conflicts-list")}>
              {violationMessages.map(m => <li>{m}</li>)}
            </ul>
            <hr />
          </React.Fragment>
        ) : null}
        Machine Id: {task.machineId}<br />
        Job Id: {task.jobId}<br />
        Sequence in job: {task.sequence}<br />
        Start: {`${Math.round(task.millisecondsFromStart / 60000)}min`}<br />
        End: {`${Math.round((task.millisecondsFromStart + task.processingMilliseconds) / 60000)}min`}
      </div>
    ),
    [
      feasible,
      violationMessages,
      forcePopperClose,
      task.machineId,
      task.jobId,
      task.sequence,
      task.millisecondsFromStart,
      task.processingMilliseconds,
    ]
  );
  const popperMemo = useMemo(
    () => (
      <CustomPopper
        open={open}
        anchorElement={anchorElement}
        handlePopperClose={handlePopperClose}
        canSelect={!feasible}
      >
        {popperContent}
      </CustomPopper>
    ),
    [anchorElement, open, handlePopperClose, feasible, popperContent]
  );
  //#endregion popper
  return (
    <TaskDragSource
      id={id}
      task={task}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
      isPreview={isPreview}
      isPreviewRemove={isPreviewRemove}
      feasible={feasible}
      setIsDragging={setIsDragging}
      handlePopperOpen={handlePopperOpen}
      handlePopperClose={handlePopperClose}
      popover={popperMemo}
    />
  );
};

export default TaskContainer;