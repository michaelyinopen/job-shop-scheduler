import React, { useEffect } from 'react';
import { DropTarget } from 'react-dnd';
import ProductionJob from './ProductionJob';
import { useJobIds } from './store/useSelector';
import itemTypes from './dragDrop/itemTypes';
import dropResultTypes from './dragDrop/dropResultTypes';
import classNames from 'classnames/bind';
import productionStyles from '../css/Production.module.css';
import {
  useRemoveTask,
  usePreviewRemoveTask,
  useCancelPreviewRemove
} from './store/useActionsDispatchers';

const cx = classNames.bind(productionStyles);

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
const ProductionJobSet = React.memo(({
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
    <ol className={cx("production__job-set-list")}>
      {jobIds.map(jId => <li key={jId}><ProductionJob id={jId} /></li>)}
    </ol>
  );
});

const ProductionJobSetDropTarget = DropTarget([itemTypes.TASK], jobSetTarget, collect)(ProductionJobSet)

const ProductionJobSetContainer = () => {
  const jobIds = useJobIds();
  const removeTask = useRemoveTask();
  const previewRemoveTask = usePreviewRemoveTask();
  const cancelPreviewRemove = useCancelPreviewRemove();
  return (
    <ProductionJobSetDropTarget
      jobIds={jobIds}
      removeTask={removeTask}
      previewRemoveTask={previewRemoveTask}
      cancelPreviewRemove={cancelPreviewRemove}
    />
  );
};

export default ProductionJobSetContainer;