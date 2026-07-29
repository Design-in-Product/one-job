import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// ---- Quiet mode (Xian, 2026-07-29) ----------------------------------------
// "They linger too long and block stuff" — success/info toasts are chrome
// (Item 6: nothing between you and the card) and can be muted as a Settings
// preference. ERRORS ALWAYS SURFACE: a muted failure report would be the
// silent-success disease in a new costume (m-44), so quiet mode is not
// allowed to touch toast.error. Undo survives muting because it no longer
// lives only in the toast — the hold-menu and shake carry it (2026-07-29).
//
// Every call site imports { toast } from this file, so the gate lives here
// and no call site changes.

export const QUIET_MODE_KEY = "oneJobQuietMode"

export const isQuietMode = (): boolean => {
  try {
    return localStorage.getItem(QUIET_MODE_KEY) === "1"
  } catch {
    return false
  }
}

export const setQuietMode = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(QUIET_MODE_KEY, "1")
    else localStorage.removeItem(QUIET_MODE_KEY)
  } catch {
    /* storage unavailable — quiet mode simply won't persist */
  }
}

type AnyFn = (...args: never[]) => unknown
const quietable = <F extends AnyFn>(fn: F): F =>
  ((...args: never[]) => (isQuietMode() ? undefined : fn(...args))) as F

// Same callable-with-methods shape sonner exports; success/info/message
// gated, error (and everything unlisted) untouched.
const toast: typeof sonnerToast = Object.assign(
  quietable(sonnerToast.bind(null) as unknown as typeof sonnerToast),
  sonnerToast,
  {
    success: quietable(sonnerToast.success),
    info: quietable(sonnerToast.info),
    message: quietable(sonnerToast.message),
  }
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Top-center so toasts never cover the centered "+" (2026-07-25)
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
