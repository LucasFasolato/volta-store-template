'use client'

import * as React from "react"

import { cn } from "@/lib/utils"
import { formatPriceTypingValue, parsePriceTypingValue } from "@/lib/utils/price-input"

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return
  if (typeof ref === 'function') ref(value)
  else ref.current = value
}

function Input({ className, type, name, onChange, onBlur, ref, ...props }: React.ComponentProps<"input">) {
  const internalRef = React.useRef<HTMLInputElement | null>(null)
  const isPriceField = type === 'number' && (name === 'price' || name === 'compare_price')

  React.useEffect(() => {
    if (!isPriceField || !internalRef.current) return
    const node = internalRef.current
    if (node.value) node.value = formatPriceTypingValue(node.value)
  }, [isPriceField])

  function handlePriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPriceTypingValue(event.currentTarget.value)
    event.currentTarget.value = formatted

    if (!onChange) return
    const numericValue = formatted ? parsePriceTypingValue(formatted) : ''
    onChange({ target: { name, value: numericValue } } as unknown as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <input
      ref={(node) => {
        internalRef.current = node
        assignRef(ref, node)
      }}
      type={isPriceField ? 'text' : type}
      name={name}
      inputMode={isPriceField ? 'decimal' : props.inputMode}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
      onChange={isPriceField ? handlePriceChange : onChange}
      onBlur={onBlur}
    />
  )
}

export { Input }
