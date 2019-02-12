import { useState, useEffect } from 'react'
import { Observable } from 'rxjs'

export default function useObservable<T>(
  observable: Observable<T>,
  initialValue: T
) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const subscription = observable.subscribe((newValue: T) => {
      setValue(newValue)
    })
    return () => subscription.unsubscribe()
  }, [])

  return value
}
