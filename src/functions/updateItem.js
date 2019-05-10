const defaultStateIdProps = "id";
export const updateItemWithIdProp = (actionIdProp, stateIdProp = defaultStateIdProps) => itemReducer => (state, action) => {
  const id = action[actionIdProp];
  let updatedState = [];
  let isUpdated = false;
  for (var i = 0; i < state.length; ++i) {
    const element = state[i];
    if (element[stateIdProp] === id) {
      const newElement = itemReducer(id)(element, action);
      if (newElement !== element) {
        isUpdated = true;
        updatedState.push(newElement);
      }
      else {
        updatedState.push(element);
      }
    }
    else {
      updatedState.push(element);
    }
  }
  return isUpdated ? updatedState : state;
};

const updateItem = itemReducer => (state, action) => {
  return updateItemWithIdProp("id", "id")(itemReducer)(state, action);
};

export const createOrUpdateItem = itemReducer => (state, action) => {
  const { id } = action;
  // update
  if (state.some(e => e.id === id)) {
    return updateItem(itemReducer)(state, action);
  }
  // create
  return [...state, itemReducer(id)(undefined, action)];
};

export const createOrUpdateItemWithIdProp = (actionIdProp, stateIdProp = defaultStateIdProps) => itemReducer => (state, action) => {
  const id = action[actionIdProp];
  // update
  if (state.some(e => e[stateIdProp] === id)) {
    return updateItemWithIdProp(actionIdProp, stateIdProp)(itemReducer)(state, action);
  }
  // create
  return [...state, itemReducer(id)(undefined, action)];
};
export default updateItem;
