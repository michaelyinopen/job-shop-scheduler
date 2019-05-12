import React, { useEffect } from 'react';
import { DropTarget } from 'react-dnd';
import Job from './Job';
import { useJobIds } from './store/useSelector';
import itemTypes from './dragDrop/itemTypes';
import dropResultTypes from './dragDrop/dropResultTypes';
import classNames from 'classnames/bind';
import {
  useRemoveTask,
  usePreviewRemoveTask,
  useCancelPreviewRemove
} from './store/useActionsDispatchers';

import jobShopStyles from '../css/JobShop.module.css';

const cx = classNames.bind(jobShopStyles);

const jobSetTarget = {
  drop(props, monitor) {
    const { removeTask } = props;
    const item = monitor.getItem();
    const procedureId = item.id;
    removeTask(procedureId);
    return { type: dropResultTypes.JOB_SET };
  },
  hover(props, monitor) {
    if (monitor.canDrop()) {
      const { previewRemoveTask } = props;
      const item = monitor.getItem();
      const procedureId = item.id;
      previewRemoveTask(procedureId);
    }
  }
};
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
  }
}
const JobSet = React.memo(({
  jobIds,
  previewRemoveTask,
  cancelPreviewRemove,
  connectDropTarget,
  canDrop,
  isOver,
}) => {
  useEffect(
    () => {
      if (canDrop && !isOver) {
        if (previewRemoveTask && previewRemoveTask.cancel) {
          previewRemoveTask.cancel();
        }
        cancelPreviewRemove();
      }
    },
    [canDrop && isOver]
  );
  return connectDropTarget(
    <ol className={cx("job-shop__job-set-list")}>
      {jobIds.map(jId => <li key={jId}><Job id={jId} /></li>)}
    </ol>
  );
});

const JobSetDropTarget = DropTarget([itemTypes.TASK], jobSetTarget, collect)(JobSet)

const JobSetContainer = () => {
  const jobIds = useJobIds();
  const removeTask = useRemoveTask();
  const previewRemoveTask = usePreviewRemoveTask();
  const cancelPreviewRemove = useCancelPreviewRemove();
  return (
    <JobSetDropTarget
      jobIds={jobIds}
      removeTask={removeTask}
      previewRemoveTask={previewRemoveTask}
      cancelPreviewRemove={cancelPreviewRemove}
    />
  );
};

export default JobSetContainer;