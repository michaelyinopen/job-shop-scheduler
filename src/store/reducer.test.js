import {
  setPreviewTaskIdsReducer,
  initialProceduresHistory
} from './reducer';

describe('setPreviewTaskIdsReducer', () => {
  test('empty', () => {
    const previousState = { previewTasks: [] };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState).toEqual({ previewTasks: [] });
  });

  test('one preview A', () => {
    const previousState = {
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]),
      previewTasks: [{ procedureId: 1 }]
    };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState).toEqual({
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]),
      previewTasks: [{ id: 4, procedureId: 1 }]
    });
  });

  test('one preview A', () => {
    const previousState = {
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]),
      previewTasks: [{ procedureId: 1 }]
    };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState).toEqual({
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]),
      previewTasks: [{ id: 4, procedureId: 1 }]
    });
  });

  test('one preview B', () => {
    const previousState = {
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 5 },
      ]),
      previewTasks: [{ procedureId: 2, millisecondsFromStart: 10 }]
    };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState).toEqual({
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 5 }
      ]),
      previewTasks: [{ id: 6, procedureId: 2, millisecondsFromStart: 10 }]
    });
  });

  test('multiple previews A', () => {
    const previousState = {
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]),
      previewTasks: [{ procedureId: 1 }, { procedureId: 2 }]
    };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState.procedures).toEqual(initialProceduresHistory([
      { id: 1 },
      { id: 2 },
      { id: 3 }
    ]));
    expect([...(resultState.previewTasks)].sort((a, b) => a.id - b.id)).toEqual([
      { id: 4, procedureId: 1 },
      { id: 5, procedureId: 2 }
    ]);
  });

  test('multiple previews B', () => {
    const previousState = {
      procedures: initialProceduresHistory([
        { id: 1 },
        { id: 2 },
        { id: 5 },
      ]),
      previewTasks: [{ procedureId: 5 }, { procedureId: 2, millisecondsFromStart: 10 }]
    };

    const resultState = setPreviewTaskIdsReducer(previousState);

    expect(resultState.procedures).toEqual(initialProceduresHistory([
      { id: 1 },
      { id: 2 },
      { id: 5 }
    ]));
    expect([...(resultState.previewTasks)].sort((a, b) => a.id - b.id)).toEqual([
      { id: 6, procedureId: 2, millisecondsFromStart: 10 },
      { id: 7, procedureId: 5 }
    ]);
  });
});