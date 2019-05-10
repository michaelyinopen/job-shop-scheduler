export function getNextOfMax(array) {
  if (array.length === 0)
    return 1;
  return Math.max.apply(Math, array) + 1;
}

export default function getNextId(array, idProperty = "id") {
  return getNextOfMax(array.map(o => o[idProperty]));
}