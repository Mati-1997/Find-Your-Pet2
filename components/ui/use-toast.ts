"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastProps
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastProps>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, duration: 0 } : t)),
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, duration: 0 })),
      }
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }

      return {
        ...state,
        toasts: [],
      }
    }
  }
}

export function useToast() {
  const [state, setState] = useState<State>({ toasts: [] })

  const dispatch = useCallback((action: Action) => {
    setState((prevState) => reducer(prevState, action))
  }, [])

  const toast = useCallback(
    ({ ...props }: Omit<ToastProps, "id">) => {
      const id = genId()

      const update = (props: Partial<ToastProps>) =>
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        })

      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          duration: props.duration || 5000,
        },
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    [dispatch],
  )

  const dismiss = useCallback(
    (toastId?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
    },
    [dispatch],
  )

  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.duration === 0) {
        return
      }

      const timeout = setTimeout(() => {
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id })
      }, toast.duration)

      toastTimeouts.set(toast.id, timeout)
    })

    return () => {
      state.toasts.forEach((toast) => {
        const timeout = toastTimeouts.get(toast.id)
        if (timeout) {
          clearTimeout(timeout)
        }
      })
    }
  }, [state.toasts, dispatch])

  return {
    ...state,
    toast,
    dismiss,
  }
}

export type { ToastProps }
