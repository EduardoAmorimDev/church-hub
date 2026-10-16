import { formatPhone } from './format'

describe('formatPhone — C9', () => {
  it.each([
    ['11900000000', '(11) 9 0000-0000'],
    ['(11) 90000-0000', '(11) 9 0000-0000'],
    ['1190000000', '1190000000'],
    ['5511900000000', '5511900000000'],
    ['', '']
  ])('formatPhone(%p) → %p', (input, expected) => {
    expect(formatPhone(input)).toBe(expected)
  })
})
