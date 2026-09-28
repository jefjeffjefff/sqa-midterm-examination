import { PROMO_RULES } from '../data'
import type { CartItem } from '../types'

export interface PriceInput {
  items: CartItem[]
  promoCode: string
  isStudent: boolean
  isMember: boolean
}

export interface PriceBreakdown {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const subtotal = input.items.reduce((acc, item) => acc + item.price * item.qty, 0)

  let discount = 0

  if (input.isStudent) {
    discount += subtotal * 0.1
  }

  if (input.isMember) {
    discount += subtotal * 0.15
  }

  const promo = PROMO_RULES[input.promoCode as keyof typeof PROMO_RULES]
  if (promo && subtotal > promo.minSpend) {
    if (promo.type === 'percent') {
      discount += subtotal * promo.value
    } else {
      discount += promo.value
    }
  }

  const discounted = Math.max(0, subtotal - discount)

  const tax = input.items.reduce((acc, item) => {
    const line = item.price * item.qty
    return acc + Math.round(line * 0.08)
  }, 0)

  const shipping = discounted > 1000 ? 0 : 99
  const total = discounted + tax + shipping

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  }
}
