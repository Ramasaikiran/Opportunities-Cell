// Opens a native file picker using a plain DOM <input> appended directly to
// document.body — deliberately outside React's virtual DOM. If a re-render
// happens anywhere in the app while the OS file picker is open (e.g. a
// visibility/focus-triggered state update), React can unmount and recreate
// a JSX-owned <input>, silently discarding the pending native picker result
// before its `change` event ever fires. An input created and managed here
// can't be touched by React's reconciliation, so the result always lands.
export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.position = 'fixed'
    input.style.top = '-9999px'
    input.style.left = '-9999px'
    input.style.opacity = '0'
    document.body.appendChild(input)

    let settled = false
    const cleanup = () => {
      if (input.parentNode) input.parentNode.removeChild(input)
      window.removeEventListener('focus', onFocus)
    }
    const finish = (file: File | null) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(file)
    }

    input.addEventListener('change', () => {
      finish(input.files?.[0] ?? null)
    })

    // Fallback for cancel: many mobile browsers don't fire `change` when the
    // picker is dismissed without a selection. Detect the window regaining
    // focus (picker closed) and resolve null shortly after if nothing fired.
    function onFocus() {
      setTimeout(() => finish(input.files?.[0] ?? null), 500)
    }
    window.addEventListener('focus', onFocus)

    input.click()
  })
}
