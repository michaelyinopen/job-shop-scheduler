
import React, { useContext, useCallback } from 'react';
import { ActionCreators } from 'redux-undo';
import { Undo as UndoIcon, Redo as RedoIcon } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import ProductionDispatchContext from './ProductionDispatchContext';
import classNames from 'classnames/bind';
import productionStyles from '../css/Production.module.css';
import { useCanUndo, useCanRedo } from './store/useSelector';

const cx = classNames.bind(productionStyles);

const iconButtonStyle = { width: 36, height: 36, padding: 6 };

const Undo = () => {
  const dispatch = useContext(ProductionDispatchContext);
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
  const dispatch = useContext(ProductionDispatchContext);
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

const ProductionToolbar = () => {
  return (
    <div className={cx("production__toolbar")}>
      <Undo />
      <Redo />
    </div>
  );
};

export default ProductionToolbar;