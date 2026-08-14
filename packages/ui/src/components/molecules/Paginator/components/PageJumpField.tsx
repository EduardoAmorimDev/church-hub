'use client'

import { KeyboardEvent, useState } from 'react'
import { Field } from '@church/ui/atoms/Field'
import { paginator } from '../Paginator.styles'
import { LabeledControl } from './LabeledControl'

type PageJumpFieldProps = {
  currentPage: number
  onJump: (page: number) => void
  totalPages: number
}

const parsePage = (text: string, totalPages: number) => {
  if (!/^\d+$/.test(text.trim())) return null

  const page = Number(text.trim())

  return page >= 1 && page <= totalPages ? page : null
}

export const PageJumpField = ({
  currentPage,
  onJump,
  totalPages
}: PageJumpFieldProps) => {
  const slots = paginator()
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return

    const target = parsePage(text, totalPages)

    if (target === null) {
      setInvalid(true)
      return
    }

    setText('')
    if (target !== currentPage) onJump(target)
  }

  return (
    <LabeledControl label="Ir para página:">
      {id => (
        <Field
          className={slots.jumpField()}
          id={id}
          inputMode="numeric"
          onChange={event => {
            setText(event.target.value)
            setInvalid(false)
          }}
          onKeyDown={handleKeyDown}
          size="small"
          state={invalid ? 'error' : 'default'}
          type="text"
          value={text}
        />
      )}
    </LabeledControl>
  )
}
