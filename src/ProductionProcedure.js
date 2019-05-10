import React, { useMemo } from 'react';
import { DragSource } from 'react-dnd';
import { useSetIsDragging } from './store/useActionsDispatchers';
import { useMillisecondsToLengthFunc } from '../timeline/store/lengthTime';
import itemTypes from './dragDrop/itemTypes';

import usePopperHandlers from './usePopperHandlers';
import CustomPopper from './CustomPopper';

import { useProcedure, useJobColor } from './store/useSelector';
import classNames from 'classnames/bind';
import productionStyles from './Production.module.css';

const cx = classNames.bind(productionStyles);

const productionProcedureSource = {
  beginDrag(props) {
    const { setIsDragging } = props;
    setIsDragging(true);
    return {
      type: itemTypes.PROCEDURE,
      id: props.id,
      machineId: props.procedure.machineId,
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

const ProductionProcedure = ({
  id,
  connectDragSource,
  isDragging,
  procedure,
  width,
  backgroundColor,
  foregroundColor,
  handlePopperOpen,
  handlePopperClose,
  popper,
}) => {
  const assignedTask = procedure.millisecondsFromStart || procedure.millisecondsFromStart === 0;
  return connectDragSource(
    <div
      className={cx(
        { "production__procedure": true },
        { "production__procedure--assigned": assignedTask },
        { "production__procedure--is-dragging": isDragging },
        { "production__procedure--preview-assigned": false }
      )}
      style={{
        width: `${width}px`,
        backgroundColor: backgroundColor
      }}
      onMouseEnter={handlePopperOpen}
      onMouseLeave={handlePopperClose}
    >
      <div className={cx("production__machine-label")}>M{procedure.machineId}</div>
      <div
        className={cx("production__job-label")}
        style={{ color: foregroundColor }}
      >
        {procedure.jobId}
      </div>
      <div className={cx("production__sequence-label")}>{procedure.sequence}</div>
      {!isDragging ? popper : null}
    </div>
  );
};

const ProductionProcedureDragSource = React.memo(DragSource(itemTypes.PROCEDURE, productionProcedureSource, collect)(ProductionProcedure));

const ProductionProcedureContainer = ({
  id
}) => {
  const setIsDragging = useSetIsDragging();
  const procedure = useProcedure(id);
  const [backgroundColor, foregroundColor] = useJobColor(procedure.jobId);
  const millisecondsToLengthFunc = useMillisecondsToLengthFunc();
  const width = millisecondsToLengthFunc(procedure.processingMilliseconds);
  const [
    anchorElement,
    open,
    handlePopperOpen,
    handlePopperClose
  ] = usePopperHandlers();

  //#region popper
  const popperContent = useMemo(
    () => (
      <div className={cx("production__procedure-popper-content")}>
        Machine Id: {procedure.machineId}<br />
        Job Id: {procedure.jobId}<br />
        Sequence in job: {procedure.sequence}<br />
        Time: {`${procedure.processingMilliseconds / 60000}min`}
      </div>
    ),
    [procedure.machineId, procedure.jobId, procedure.sequence, procedure.processingMilliseconds]
  );
  const popperMemo = useMemo(
    () => (
      <CustomPopper
        anchorElement={anchorElement}
        open={open}
        handlePopperClose={handlePopperClose}
      >
        {popperContent}
      </CustomPopper>
    ),
    [anchorElement, open, handlePopperClose, popperContent]
  );
  //#endregion popper
  return (
    <ProductionProcedureDragSource
      id={id}
      setIsDragging={setIsDragging}
      procedure={procedure}
      width={width}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
      handlePopperOpen={handlePopperOpen}
      handlePopperClose={handlePopperClose}
      popper={popperMemo}
    />
  );
};

export default ProductionProcedureContainer;