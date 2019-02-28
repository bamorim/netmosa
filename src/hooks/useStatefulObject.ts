import { useState, useEffect } from 'react'

export default function useStatefulObject<T>(
  init: () => T,
  cleanup: (val: T) => void,
  inputs?: ReadonlyArray<any> // tslint:disable-line:no-any
) {
  const [value, setValue] = useState<T | undefined>(undefined)

  useEffect(() => {
    const inited = init()
    setValue(inited)
    return () => cleanup(inited)
  }, inputs)

  return value
}
