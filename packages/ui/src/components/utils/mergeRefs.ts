import { MutableRefObject, Ref, RefCallback } from 'react'

export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  node => {
    refs.forEach(ref => {
      if (!ref) return
      if (typeof ref === 'function') ref(node)
      else (ref as MutableRefObject<T | null>).current = node
    })
  }
