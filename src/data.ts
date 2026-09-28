import type { Product } from './types'

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Graphing Notebook', category: 'Books', price: 85, stock: 12 },
  { id: 2, name: 'Engineering Pad', category: 'Books', price: 35, stock: 50 },
  { id: 3, name: 'USB 64GB', category: 'Electronics', price: 420, stock: 8 },
  { id: 4, name: 'Wireless Mouse', category: 'Electronics', price: 750, stock: 0 },
  { id: 5, name: 'Mechanical Pencil', category: 'Supplies', price: 55, stock: 30 },
  { id: 6, name: 'Highlighter Set', category: 'Supplies', price: 120, stock: 18 },
  { id: 7, name: 'Index Cards', category: 'Supplies', price: 60, stock: 20 },
  { id: 8, name: 'Coffee Sachet Pack', category: 'Snacks', price: 99, stock: 45 },
  { id: 9, name: 'Protein Bar', category: 'Snacks', price: 65, stock: 24 },
  { id: 10, name: 'Chocolate Wafers', category: 'Snacks', price: 45, stock: 40 },
  { id: 11, name: 'Blue Light Glasses', category: 'Electronics', price: 999, stock: 7 },
  { id: 12, name: 'Mini Desk Fan', category: 'Electronics', price: 510, stock: 11 },
  { id: 13, name: 'Sticky Notes Mega Pack', category: 'Supplies', price: 150, stock: 16 },
  { id: 14, name: 'Exam Reviewer Bundle', category: 'Books', price: 320, stock: 10 },
  { id: 15, name: 'Instant Noodles Box', category: 'Snacks', price: 270, stock: 14 },
  { id: 16, name: 'Ballpen Tri-Pack', category: 'Supplies', price: 75, stock: 26 },
  { id: 17, name: 'Pocket Calculator', category: 'Electronics', price: 375, stock: 9 },
  { id: 18, name: 'Binder Clips', category: 'Supplies', price: 95, stock: 25 },
  { id: 19, name: 'Noise Dampening Earplugs', category: 'Electronics', price: 215, stock: 13 },
  { id: 20, name: 'Study Energy Drink', category: 'Snacks', price: 89, stock: 32 },
  { id: 21, name: 'Flashcard Ring Set', category: 'Books', price: 140, stock: 21 },
  { id: 22, name: 'Laptop Sleeve 13in', category: 'Electronics', price: 680, stock: 5 },
  { id: 23, name: 'Correction Tape', category: 'Supplies', price: 48, stock: 27 },
  { id: 24, name: 'Crackers Value Box', category: 'Snacks', price: 115, stock: 19 },
  { id: 25, name: 'Mini Whiteboard', category: 'Books', price: 260, stock: 6 },
]

export const PROMO_RULES = {
  SAVE10: { type: 'percent' as const, value: 0.1, minSpend: 500 },
  FLAT50: { type: 'flat' as const, value: 50, minSpend: 200 },
}
