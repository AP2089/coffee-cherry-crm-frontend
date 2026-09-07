import type { PaginatedList } from './api'

export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
  _id: string
  name: string
  email: string
  message: string
  status: ContactMessageStatus
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  coffeeId: string
  slug: string
  name: string
  weight: 250 | 500 | 1000
  quantity: number
  price: number
}

export interface OrderCustomer {
  name: string
  phone: string
  email: string
  city: string
  address: string
  comment?: string
}

export interface Order {
  _id: string
  items: OrderItem[]
  customer: OrderCustomer
  totalPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export type ContactList = PaginatedList<ContactMessage>
export type OrderList = PaginatedList<Order>
