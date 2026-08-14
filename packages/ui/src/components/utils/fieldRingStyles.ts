type FieldControlTag = 'input' | 'select' | 'textarea'

/**
 * Shared visual language for a field's wrapper `root`: the idle/focused
 * ring, the error/success ring, the disabled look, and the transition that
 * animates between them. Used by both `Field` (backing `TextField`/
 * `SearchField`) and `TextArea` so the two keep the exact same behavior —
 * see `neutralFieldColor` for the sibling text/icon color state machine.
 */

/**
 * The default (non-error, non-success) ring: an inset box-shadow ("border"
 * in look only, not in the box model) at 1px neutral-33, thickening to 2px
 * neutral-999 once the control is focused. `inset-ring` rather than a real
 * `border` because a real border's width is part of the box model, so
 * toggling it on focus (1px -> 2px) would shrink the content box and shift
 * everything inside; `inset-ring` is painted without taking space.
 *
 * Written out per tag as a complete, literal string — NOT assembled via
 * `${tag}` interpolation — for the same build-time scanning reason
 * documented on `neutralFieldColor`: a class token with a variable spliced
 * into the middle of it never matches anything at Tailwind's build time.
 */
const FIELD_DEFAULT_RING: Record<FieldControlTag, string> = {
  input: [
    'inset-ring inset-ring-neutral-33',
    'has-[input:focus]:inset-ring-2 has-[input:focus]:inset-ring-neutral-999'
  ].join(' '),
  select: [
    'inset-ring inset-ring-neutral-33',
    'has-[select:focus]:inset-ring-2 has-[select:focus]:inset-ring-neutral-999'
  ].join(' '),
  textarea: [
    'inset-ring inset-ring-neutral-33',
    'has-[textarea:focus]:inset-ring-2 has-[textarea:focus]:inset-ring-neutral-999'
  ].join(' ')
}

/**
 * @param tag - The underlying form control the ring's `has-[...]` focus
 * check is against — `'input'` for `Field`, `'textarea'` for `TextArea`.
 */
export const fieldDefaultRing = (tag: FieldControlTag) =>
  FIELD_DEFAULT_RING[tag]

// Error/success don't key off focus, so these are tag-independent and need
// no per-tag branch.
export const FIELD_ERROR_RING = 'inset-ring-2 inset-ring-red-67'
export const FIELD_SUCCESS_RING = 'inset-ring-2 inset-ring-green-67'

// Animates the ring (color and 1px->2px width, both painted via box-shadow)
// and the disabled background, without transitioning unrelated properties.
export const FIELD_ROOT_TRANSITION = 'transition-[background-color,box-shadow]'

// Disabled look: flat neutral-alpha/10 fill, no ring at all.
export const FIELD_DISABLED_ROOT = [
  'bg-neutral-alpha/10',
  'text-neutral-33',
  'cursor-default',
  'inset-ring-0'
]

// Disabled dimming for the control's own typed text and placeholder —
// identical for `<input>` and `<textarea>`, so this is tag-independent too.
export const FIELD_DISABLED_CONTROL =
  'cursor-default text-neutral-33 placeholder:text-neutral-33'
