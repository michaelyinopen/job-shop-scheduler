import { useState, useLayoutEffect } from 'react';
import { useIsDragging } from './useSelector';

const useLeftAtBeginDrag = elementRef => {
  const isDragging = useIsDragging();
  const [left, setLeft] = useState();
  useLayoutEffect(
    () => {
      const element = elementRef.current;
      if (!element) {
        return undefined;
      }
      const elementRect = element.getBoundingClientRect();
      const left = elementRect.left;
      setLeft(left);
    },
    [isDragging]
  );
  return left;
};

export default useLeftAtBeginDrag;