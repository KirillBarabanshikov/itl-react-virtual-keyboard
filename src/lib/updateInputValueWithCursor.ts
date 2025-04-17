export function updateInputValueWithCursor(
  input: HTMLInputElement | HTMLTextAreaElement,
  updater: (
    value: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    value: string;
    cursorPosition: number;
  },
) {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const text = input.value;

  const { value, cursorPosition } = updater(text, start, end);

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    'value',
  )?.set;

  nativeInputValueSetter?.call(input, value);

  requestAnimationFrame(() => {
    input.selectionStart = input.selectionEnd = cursorPosition;
  });

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}
