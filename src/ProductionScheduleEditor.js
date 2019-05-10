import React, { useReducer } from 'react';
//WithContext
import TimelineDispatchContext from '../timeline/TimelineDispatchContext';
import TimelineStateContext from '../timeline/TimelineStateContext';
import TimelineGroupsStateContext from '../timeline/TimelineGroupsStateContext';
import TimelineItemsStateContext from '../timeline/TimelineItemsStateContext';

import productionReducer, { init as productionInit } from './store/reducer';
import {
  timelineStateSelector,
  timelineGroupsSelector,
  proceduresSelector,
  referenceDateSelector,
  previewTasksSelector,
} from './store/selectors';
import { usePreviewAppliedTimelineItems } from './store/useSelector';
import ProductionDispatchContext from './ProductionDispatchContext';
import ProductionStateContext from './ProductionStateContext';
//Presentation
import ControlledTimeContainer from '../timeline/ControlledTimeContainer';
import TimelineContent from '../timeline/TimelineContent';
import GroupAxis from '../timeline/GroupAxis';
import ScheduleContainer from '../timeline/ScheduleContainer';
import TimeAxis from '../timeline/TimeAxis';
import ProductionTask from './ProductionTask';
import MachineLane from './MachineLane';

import ProductionJobSet from './ProductionJobSet';

import ProductionToolbar from './ProductionToolbar';

const ProductionScheuldeEditor = React.memo(() => {
  return (
    <React.Fragment>
      <ProductionToolbar />
      <ProductionJobSet />
      <br />
      <ControlledTimeContainer
        itemComponent={ProductionTask}
        groupComponent={MachineLane}
      >
        <TimelineContent>
          <GroupAxis />
          <ScheduleContainer />
        </TimelineContent>
        <TimeAxis />
      </ControlledTimeContainer>
    </React.Fragment>
  );
});

const withContext = WrappedComponent => ({
  machines,
  jobs,
  referenceDate,
  timeOptions,
}) => {
  const [state, dispatch] = useReducer(
    productionReducer,
    {
      machines,
      jobs,
      referenceDate,
      timeOptions
    },
    productionInit
  );
  const timelineState = timelineStateSelector(state);
  const timelineGroups = timelineGroupsSelector(state);
  const procedures = proceduresSelector(state);
  const previewTasks = previewTasksSelector(state);
  const referenceDateFromState = referenceDateSelector(state);
  const timelineItemsWithPreview = usePreviewAppliedTimelineItems(procedures, previewTasks, referenceDateFromState);

  return (
    <ProductionDispatchContext.Provider value={dispatch}>
      <ProductionStateContext.Provider value={state}>
        <TimelineDispatchContext.Provider value={dispatch}>
          <TimelineStateContext.Provider value={timelineState}>
            <TimelineGroupsStateContext.Provider value={timelineGroups}>
              <TimelineItemsStateContext.Provider value={timelineItemsWithPreview}>
                <WrappedComponent />
              </TimelineItemsStateContext.Provider>
            </TimelineGroupsStateContext.Provider>
          </TimelineStateContext.Provider>
        </TimelineDispatchContext.Provider>
      </ProductionStateContext.Provider>
    </ProductionDispatchContext.Provider>
  );
};


export default withContext(ProductionScheuldeEditor);