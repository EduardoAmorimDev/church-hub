import { createContext } from 'react'
import { ListDensity } from './List.types'

// why: a ListSection hands the List's density to its own items without the
// List having to rebuild each section's children.
export const ListDensityContext = createContext<ListDensity>('default')
