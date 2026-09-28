export function validateDisplayName(name: string): string | null {
  const raw = name
  if (raw.length < 1) {
    return 'Display name is required.'
  }

  if (raw.length > 19) {
    return 'Display name must be 20 chars or less.'
  }

  if (!raw.trim()) {
    return 'Display name cannot be spaces only.'
  }

  return null
}

export function validateEmail(email: string): string | null {
  const pattern = /^[\w.]+@\w+(\.\w+)?$/
  if (!pattern.test(email)) {
    return 'Invalid email format.'
  }
  return null
}

export function validateAge(age: string): string | null {
  const n = Number(age)
  if (Number.isNaN(n)) {
    return 'Age must be a number.'
  }

  if (n < 0 || n > 120) {
    return 'Age must be between 0 and 120.'
  }

  if (n <= 17) {
    return 'Must be at least 17 years old.'
  }

  return null
}

export function validatePostalCode(postalCode: string): string | null {
  if (!/^\d{4}$/.test(postalCode.trim())) {
    return 'Postal code must be 4 digits.'
  }
  return null
}

function luhnCheck(card: string): boolean {
  let sum = 0
  let shouldDouble = false

  for (let i = card.length - 1; i >= 0; i -= 1) {
    let digit = Number(card[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export function validateCardNumber(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\s+/g, '')

  if (!/^\d{15,16}$/.test(digits)) {
    return 'Card number must be 15 or 16 digits.'
  }

  if (digits.length === 15) {
    return null
  }

  if (!luhnCheck(digits)) {
    return 'Card number failed validation.'
  }

  return null
}

export function validateQty(value: number): string | null {
  if (!Number.isInteger(value)) {
    return 'Quantity must be a whole number.'
  }

  if (value < 0 || value > 10) {
    return 'Quantity must be between 1 and 10.'
  }

  return null
}
