import React, { useMemo } from 'react';
import { useJobStatus } from './store/useTaskFeasible';
import usePopperHandlers from './usePopperHandlers';
import CustomPopper from './CustomPopper';
import { DoneOutline, TurnedInNot, TurnedIn, Error } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import ProductionJobButton from './ProductionJobButton';

import classNames from 'classnames/bind';
import productionStyles from '../css/Production.module.css';

const cx = classNames.bind(productionStyles);

const ProductionProcedureConflicts = ({
  violationMessages,
  isLast
}) => {
  return (
    <ul
      className={cx(
        "production__conflicts-list",
        "production__conflicts-list--grow",
        { "production__conflicts-list--with-separator": !isLast },
      )}
    >
      {violationMessages.map((m, index) => <li key={index}>{m}</li>)}
    </ul>
  );
};

const ProductionProcedureStatus = ({
  procedureStatus,
  isLast
}) => {
  const [icon, title] = !procedureStatus.assigned ? [<TurnedInNot style={{ color: "lightgrey" }} />, "Unassigned"]
    : !procedureStatus.feasible ? [<Error color="error" />, "Has conflicts"]
      : [<TurnedIn style={{ color: "springgreen" }} />, "Assigned"];
  const iconWithTooltip = <Tooltip title={title} placement="right-end">{icon}</Tooltip>;

  return (
    <li key={procedureStatus.sequence}>
      <div className={cx("production__job-status-popper-element")}>
        <div className={cx("production__sequence-label")} style={{ margin: 0 }}>{procedureStatus.sequence}</div>
        {iconWithTooltip}
        {procedureStatus.assigned && !procedureStatus.feasible ?
          <ProductionProcedureConflicts
            violationMessages={procedureStatus.violationMessages}
            isLast={isLast}
          />
          : null
        }
      </div>
    </li>
  );
};

const ProductionJobStatusButton = ({
  id
}) => {
  const [feasible, allAssigned, procedureStatuses] = useJobStatus(id);
  const [
    anchorElement,
    open,
    handlePopperOpen,
    handlePopperClose
  ] = usePopperHandlers();

  //#region icon
  const [iconMemo, title] = useMemo(
    () => {
      return !feasible ? [<Error color="error" />, "Has conflicts"]
        : allAssigned ? [<DoneOutline style={{ color: "springgreen" }} />, "All assigned"]
          : [<TurnedInNot style={{ color: "lightgrey" }} />, "Not all assigned"];
    },
    [feasible, allAssigned]
  );
  //#endregion icon

  //#region popper
  const popperContent = useMemo(
    () => {
      return (
        <ol className={cx("production__job-status-popper-list")}>
          {procedureStatuses.map((ps, index) => (
            <ProductionProcedureStatus
              key={ps.sequence}
              procedureStatus={ps}
              isLast={index === procedureStatuses.length - 1}
            />
          ))}
        </ol>
      );
    },
    [feasible, allAssigned, procedureStatuses]
  );

  const popperMemo = useMemo(
    () => (
      <CustomPopper
        open={open}
        anchorElement={anchorElement}
        handlePopperClose={handlePopperClose}
        canSelect
      >
        {popperContent}
      </CustomPopper>
    ),
    [anchorElement, open, handlePopperClose, popperContent]
  );
  //#endregion popper

  return (
    <ProductionJobButton
      open={open}
      handlePopperOpen={handlePopperOpen}
      handlePopperClose={handlePopperClose}
      icon={iconMemo}
      title={title}
      popper={popperMemo}
    />
  )
};

export default ProductionJobStatusButton;