export type Category = 'Supplies' | 'Electronics' | 'Books' | 'Snacks'

export type OrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Paid'
  | 'Refunded'
  | 'Cancelled'
  | 'Shipped'

export interface Product {
  id: number
  name: string
  category: Category
  price: number
  stock: number
}

export interface CartItem {
  productId: number
  name: string
  price: number
  qty: number
  stock: number
}

export interface Order {
  id: string
  customerName: string
  createdAt: string
  status: OrderStatus
  items: CartItem[]
  total: number
}

export interface Settings {
  displayName: string
  theme: 'sunset' | 'mint'
  currency: 'PHP' | 'USD'
  deviceId: string
}

export interface CheckoutForm {
  fullName: string
  email: string
  age: string
  postalCode: string
  cardNumber: string
  isStudent: boolean
  isMember: boolean
}
