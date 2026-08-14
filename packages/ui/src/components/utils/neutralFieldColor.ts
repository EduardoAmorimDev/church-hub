type FieldControlTag = 'input' | 'textarea'
type FieldTextUtility = 'text' | 'placeholder:text'

/**
 * Shared neutral-67/33/100 color state machine for a field's own typed-in
 * text and its placeholder: neutral-67 by default, neutral-33 on
 * hover/press (but not while focused, filled, or disabled — those win over
 * the hover/press tone), neutral-100 once focused or filled (at least 1
 * character). Each branch also carries its own `transition-colors`/
 * `placeholder:transition-colors` so these color swaps animate instead of
 * snapping. Used by both `Field` (backing `TextField`/`SearchField`) and
 * `TextArea` so the two keep the exact same behavior.
 *
 * This does NOT apply to a field's icons (start/end adornment, lock,
 * visibility, the search glass, the clear button) — those intentionally
 * skip the hover/press dip and stay at neutral-67 while hovered/pressed;
 * see `neutralFieldIconColor` for their (simpler) state machine.
 *
 * Every combination is written out here as a complete, literal class list —
 * NOT assembled at runtime via `${tag}`/`${textUtility}` interpolation.
 * Tailwind's build-time scanner only ever generates CSS for classes that
 * appear as complete literal substrings in source; a class token with a
 * variable spliced into the middle of it (e.g.
 * `` `group-has-[${tag}:focus]:${textUtility}-neutral-100` ``) never matches
 * anything at build time, so no rule is ever emitted for it — the class
 * ends up in the DOM but has no effect. Keep every branch below fully
 * spelled out, even though it duplicates the selector fragment per tag.
 *
 * Disabled isn't handled here — each caller dims to neutral-33 through its
 * own disabled styling (an explicit `disabled` variant for the control's
 * text and placeholder), since both the hover/press and focused/filled
 * rules below already exclude a disabled control.
 */
const NEUTRAL_FIELD_COLOR: Record<
  FieldControlTag,
  Record<FieldTextUtility, string>
> = {
  input: {
    text: [
      'transition-colors',
      'text-neutral-67',
      '[.group:is(:hover,:active):not(:has(input:focus)):not(:has(input:not(:placeholder-shown))):not(:has(input:disabled))_&]:text-neutral-33',
      'group-has-[input:focus]:text-neutral-100',
      'group-has-[input:not(:placeholder-shown):not(:disabled)]:text-neutral-100'
    ].join(' '),
    'placeholder:text': [
      'placeholder:transition-colors',
      'placeholder:text-neutral-67',
      '[.group:is(:hover,:active):not(:has(input:focus)):not(:has(input:not(:placeholder-shown))):not(:has(input:disabled))_&]:placeholder:text-neutral-33',
      'group-has-[input:focus]:placeholder:text-neutral-100',
      'group-has-[input:not(:placeholder-shown):not(:disabled)]:placeholder:text-neutral-100'
    ].join(' ')
  },
  textarea: {
    text: [
      'transition-colors',
      'text-neutral-67',
      '[.group:is(:hover,:active):not(:has(textarea:focus)):not(:has(textarea:not(:placeholder-shown))):not(:has(textarea:disabled))_&]:text-neutral-33',
      'group-has-[textarea:focus]:text-neutral-100',
      'group-has-[textarea:not(:placeholder-shown):not(:disabled)]:text-neutral-100'
    ].join(' '),
    'placeholder:text': [
      'placeholder:transition-colors',
      'placeholder:text-neutral-67',
      '[.group:is(:hover,:active):not(:has(textarea:focus)):not(:has(textarea:not(:placeholder-shown))):not(:has(textarea:disabled))_&]:placeholder:text-neutral-33',
      'group-has-[textarea:focus]:placeholder:text-neutral-100',
      'group-has-[textarea:not(:placeholder-shown):not(:disabled)]:placeholder:text-neutral-100'
    ].join(' ')
  }
}

/**
 * @param tag - The underlying form control the `.group` wrapper is checked
 * against — `'input'` for `Field`, `'textarea'` for `TextArea`.
 * @param textUtility - The utility family to target: `'text'` for the
 * control's own typed text, `'placeholder:text'` for its `::placeholder`.
 */
export const neutralFieldColor = (
  tag: FieldControlTag,
  textUtility: FieldTextUtility = 'text'
) => NEUTRAL_FIELD_COLOR[tag][textUtility]

/**
 * neutral-67/100 color state machine for a field's icons (start/end
 * adornment, lock, visibility toggle, the search glass, the clear button):
 * neutral-67 by default, neutral-100 once focused or filled (at least 1
 * character) — no hover/press step. Icons deliberately stay at neutral-67
 * while the field is hovered/pressed; only the typed text and placeholder
 * dip to neutral-33 for that state (see `neutralFieldColor`).
 *
 * Disabled isn't handled here — it's covered separately by `Icon`'s own
 * `color="neutral"` variant (`data-[disabled=true]:text-neutral-33`).
 *
 * Written out as complete, literal class lists for the same build-time
 * scanning reason documented on `neutralFieldColor` above.
 */
const NEUTRAL_FIELD_ICON_COLOR: Record<FieldControlTag, string> = {
  input: [
    'transition-colors',
    'text-neutral-67',
    'group-has-[input:focus]:text-neutral-100',
    'group-has-[input:not(:placeholder-shown):not(:disabled)]:text-neutral-100'
  ].join(' '),
  textarea: [
    'transition-colors',
    'text-neutral-67',
    'group-has-[textarea:focus]:text-neutral-100',
    'group-has-[textarea:not(:placeholder-shown):not(:disabled)]:text-neutral-100'
  ].join(' ')
}

/**
 * @param tag - The underlying form control the `.group` wrapper is checked
 * against — `'input'` for `Field`, `'textarea'` for `TextArea`.
 */
export const neutralFieldIconColor = (tag: FieldControlTag) =>
  NEUTRAL_FIELD_ICON_COLOR[tag]
