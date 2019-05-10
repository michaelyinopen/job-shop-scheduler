// for redux-undo Filtering Actions
const includeActionDistinct = includedActionTypeArray => (action, currentState, previousHistory) => {
  if (currentState === previousHistory) {
    return false;
  }
  return includedActionTypeArray.includes(action.type); // only add to history if action is SOME_ACTION
}

export default includeActionDistinct;