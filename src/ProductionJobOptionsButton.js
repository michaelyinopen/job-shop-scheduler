import React, { useMemo } from 'react';
import { useJobColor } from './store/useSelector';
import usePopperHandlers from './usePopperHandlers';
import CustomPopper from './CustomPopper';
import { MoreHoriz, Autorenew } from '@material-ui/icons';
import { Tooltip, IconButton } from '@material-ui/core';
import ProductionJobButton from './ProductionJobButton';
import { useChangeJobColor } from './store/useActionsDispatchers';

import classNames from 'classnames/bind';
import productionStyles from '../css/Production.module.css';

const cx = classNames.bind(productionStyles);

const ColorOption = ({
  backgroundColor,
  foregroundColor,
  changeJobColor
}) => {
  return (
    <React.Fragment>
      <h4 >
        Color
          </h4>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <div
          className={cx("production__job-options-color-box")}
          style={{ backgroundColor: backgroundColor, color: foregroundColor, fontFamily: "monospace, monospace" }}
        >
          background: {backgroundColor}<br />
          foreground: {foregroundColor}
        </div>
        <Tooltip title="Change color">
          <IconButton
            onClick={changeJobColor}
            style={{ padding: 5, width: "34px", height: "34px", boxSizing: "border-box;" }}
          >
            <Autorenew />
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  );
};

const ProductionJobOptionsButton = ({
  id
}) => {
  const [backgroundColor, foregroundColor] = useJobColor(id);
  const changeJobColor = useChangeJobColor(id);
  const [
    anchorElement,
    open,
    handlePopperOpen,
    handlePopperClose
  ] = usePopperHandlers();

  //#region icon
  const iconMemo = useMemo(() => <MoreHoriz />, []);
  const title = "Job options"
  //#endregion icon

  //#region popper
  const colorOptionMemo = useMemo(
    () => (
      <ColorOption
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        changeJobColor={changeJobColor}
      />
    ),
    [backgroundColor, foregroundColor, changeJobColor]
  );

  const popperContent = useMemo(
    () => {
      return (
        <article className={cx("production__job-options-popper-content")}>
          <h3>
            Job
            <span
              className={cx("production__job-options-header-color-box")}
              style={{ backgroundColor: backgroundColor, color: foregroundColor }}
            >
              {id}
            </span>
            Options
          </h3>
          {colorOptionMemo}
        </article>
      );
    },
    [colorOptionMemo]
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

export default ProductionJobOptionsButton;