
import React, { useContext, useCallback } from 'react';
import { ActionCreators } from 'redux-undo';
import { Undo as UndoIcon, Redo as RedoIcon } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import JobShopDispatchContext from './JobShopDispatchContext';
import { useCanUndo, useCanRedo } from './store/useSelector';

import classNames from 'classnames/bind';
import jobShopStyles from '../css/JobShop.module.css';

const cx = classNames.bind(jobShopStyles);
const iconButtonStyle = { width: 36, height: 36, padding: 6 };

const Undo = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const undoCallback = useCallback(() => dispatch(ActionCreators.undo()), [dispatch]);
  const canUndo = useCanUndo();
  return (
    <IconButton
      style={iconButtonStyle}
      disabled={!canUndo}
      onClick={undoCallback}
    >
      <UndoIcon />
    </IconButton>
  )
};

const Redo = () => {
  const dispatch = useContext(JobShopDispatchContext);
  const redoCallback = useCallback(() => dispatch(ActionCreators.redo()), [dispatch]);
  const canRedo = useCanRedo();
  return (
    <IconButton
      style={iconButtonStyle}
      disabled={!canRedo}
      onClick={redoCallback}
    >
      <RedoIcon />
    </IconButton>
  )
};

const Toolbar = () => {
  return (
    <div className={cx("job-shop__toolbar")}>
      <Undo />
      <Redo />
    </div>
  );
};

export default Toolbar;