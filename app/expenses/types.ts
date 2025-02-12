export interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  paidBy: string
  date: string
  participants: {
    userId: string
    amount: number
    status: 'pending' | 'paid' | 'received'
  }[]
}

export interface User {
  id: string
  name: string
}