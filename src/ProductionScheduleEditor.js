import React, { useReducer } from 'react';
//WithContext
import {
  TimelineDispatchContext,
  TimelineStateContext,
  TimelineGroupsStateContext,
  TimelineItemsStateContext,
} from '@michaelyin/timeline';

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
import {
  ControlledTimeline,
  TimelineContent,
  GroupAxis,
  ScheduleContainer,
  TimeAxis,
} from '@michaelyin/timeline';
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
      <ControlledTimeline
        itemComponent={ProductionTask}
        groupComponent={MachineLane}
      >
        <TimelineContent>
          <GroupAxis />
          <ScheduleContainer />
        </TimelineContent>
        <TimeAxis />
      </ControlledTimeline>
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