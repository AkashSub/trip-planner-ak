"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, ChevronRight, Check, Trash2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { api } from "../utils/api"
import { useParams } from 'next/navigation'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  splitType: 'all' | 'custom'
  isSettled?: boolean
}

interface PaymentSummary {
  id: string
  from: string
  to: string
  amount: number
  isSettled: boolean
}

export default function ExpensesPage() {
  const { user } = useAuth()
  const [tripMembers, setTripMembers] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({})
  const [payments, setPayments] = useState<PaymentSummary[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [splitType, setSplitType] = useState<'all' | 'custom'>('all')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const trip = await api.getVarkalaTrip()
        console.log("Trip data:", trip)
        
        const members = trip.members ? trip.members.map((m: any) => m.name) : []
        if (trip.createdByUsername && !members.includes(trip.createdByUsername)) {
          members.push(trip.createdByUsername)
        }
        setTripMembers(members)
        setSelectedMembers(members) // Initialize with all members

        const expenses = await api.getTripExpenses()
        setExpenses(expenses)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user])

  const calculatePayments = () => {
    const balances: Record<string, number> = {}
    
    expenses.forEach(expense => {
      if (expense.isSettled) return
      
      const perPerson = expense.amount / expense.splitBetween.length
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount
      expense.splitBetween.forEach(person => {
        balances[person] = (balances[person] || 0) - perPerson
      })
    })

    const newPayments: PaymentSummary[] = []
    const currentUser = user?.name || ''

    Object.entries(balances).forEach(([person, balance]) => {
      if (person === currentUser && balance < 0) {
        Object.entries(balances).forEach(([otherPerson, otherBalance]) => {
          if (otherBalance > 0) {
            const paymentAmount = Math.min(Math.abs(balance), otherBalance)
            if (paymentAmount > 0) {
              newPayments.push({
                id: Math.random().toString(36).substr(2, 9),
                from: person,
                to: otherPerson,
                amount: paymentAmount,
                isSettled: false
              })
            }
          }
        })
      }
    })

    setPayments(newPayments)
    return newPayments
  }

  const markPaymentAsSettled = (paymentId: string) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, isSettled: true }
          : payment
      )
    )
  }

  const markExpenseAsSettled = async (expenseId: string) => {
    try {
      // Find the expense to be settled
      const expenseToSettle = expenses.find(exp => exp.id === expenseId);
      if (!expenseToSettle) return;
  
      // Update the backend
      await api.settleExpense({
        description: expenseToSettle.description,
        paidBy: expenseToSettle.paidBy,
        amount: expenseToSettle.amount
      });
  
      // Update local state
      setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.id === expenseId
            ? { ...expense, isSettled: true }
            : expense
        )
      );
    } catch (error) {
      console.error('Error marking expense as settled:', error);
      // Optionally show an error message to the user
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      // Find the expense to be deleted
      const expenseToDelete = expenses.find(exp => exp.id === expenseId);
      if (!expenseToDelete) return;
  
      // Update the backend
      await api.deleteExpense({
        description: expenseToDelete.description,
        paidBy: expenseToDelete.paidBy,
        amount: expenseToDelete.amount
      });
  
      // Update local state
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const addExpense = async () => {
    if (!user || !newExpense.category) return

    const splitBetween = splitType === 'all' ? tripMembers : selectedMembers

    const newExpenseItem = {
      ...newExpense,
      amount: Number(newExpense.amount),
      splitType,
      splitBetween,
      paidBy: newExpense.paidBy || user.name
    }

    try {
      const addedExpense = await api.createTripExpense(newExpenseItem)
      setExpenses(prev => [...prev, addedExpense])
      setNewExpense({})
      setSplitType('all')
      setSelectedMembers(tripMembers)
      setIsDialogOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) return <div>Please login to view expenses</div>
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const currentUser = user?.name || ''
  const userPaidExpenses = expenses.filter(expense => expense.paidBy === currentUser)
  const userOwedExpenses = expenses.filter(
    expense => 
      !expense.isSettled && // Not settled yet
      expense.paidBy.toLowerCase() !== currentUser.toLowerCase() && // Current user didn't pay
      expense.splitBetween.some(member => member.toLowerCase() === currentUser.toLowerCase()) // Current user is in split
  )
  
  const calculateNetBalances = () => {
    const balances: Record<string, number> = {};
  
    expenses.forEach((expense) => {
      if (expense.isSettled) return;
  
      const perPerson = expense.amount / expense.splitBetween.length;
      const isPaidByCurrentUser = expense.paidBy === currentUser;
  
      if (isPaidByCurrentUser) {
        // Current user paid - others owe them
        expense.splitBetween.forEach((member) => {
          if (member !== currentUser) {
            balances[member] = (balances[member] || 0) - perPerson;
          }
        });
      } else if (expense.splitBetween.includes(currentUser)) {
        // Someone else paid - current user owes their share
        balances[expense.paidBy] = (balances[expense.paidBy] || 0) + perPerson;
      }
    });
  
    // Calculate net amounts and filter out settled balances
    return Object.entries(balances)
      .filter(([_, balance]) => balance !== 0)
      .map(([member, balance]) => ({
        member,
        amount: balance,
      }));
  };
  
  // Calculate total owed and member balances
  const netBalances = calculateNetBalances();
  const totalOwed = netBalances.reduce(
    (sum, { amount }) => sum + (amount > 0 ? amount : 0),
    0
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="fixed top-0 left-0 right-0 bg-background z-10 py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center">Expenses</h1>
      </div>
      
      <div className="mt-20">
        <Tabs defaultValue="your-expenses" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-muted/50 h-12 w-[400px]">
              <TabsTrigger 
                value="your-expenses" 
                className="w-1/2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                Your Expenses
              </TabsTrigger>
              <TabsTrigger 
                value="all-expenses" 
                className="w-1/2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                All Expenses
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="your-expenses" className="animate-fade-in">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">Expenses Paid By You</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <div className="space-y-3">
                    {userPaidExpenses.map((expense) => (
                      <Card 
                        key={expense.id}
                        className="rounded-lg border bg-card/50 hover:bg-card/70 transition-colors duration-200"
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <p className="font-medium truncate">{expense.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {expense.category} • ₹{expense.amount.toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                Split between: {expense.splitBetween.join(", ")}
                              </p>
                            </div>
                            <div className="self-end md:self-center">
                              {!expense.isSettled ? (
                                <Button 
                                  variant="outline"
                                  className="rounded-full gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
                                  onClick={() => markExpenseAsSettled(expense.id)}
                                  size="sm"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Mark Received</span>
                                </Button>
                              ) : (
                                <span className="text-green-500 flex items-center gap-1.5">
                                  <Check className="h-4 w-4" />
                                  Received
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/90 text-primary-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg md:text-xl">Amounts You Owe</CardTitle>
  </CardHeader>
  <CardContent className="p-2 md:p-4">
    <p className="text-2xl md:text-3xl font-bold mb-4">₹{totalOwed.toFixed(2)}</p>
    <div className="space-y-2">
      {netBalances.map(({ member, amount }) => {
        if (amount < 0) return null; // Skip amounts owed to the user

        return (
          <div
            key={member}
            className="flex items-center justify-between p-3 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors duration-200"
          >
            <div className="space-y-0.5">
              <p className="truncate">{member}</p>
            </div>
            <p className="font-medium min-w-[80px] text-right">
              ₹{amount.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  </CardContent>
</Card>
            </div>
          </TabsContent>

          <TabsContent value="all-expenses" className="animate-fade-in">
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                <CardTitle className="text-lg md:text-xl">All Expenses</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full gap-1.5">
                      <Plus className="h-4 w-4" />
                      <span className="hidden md:inline">Add Expense</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Add New Expense</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newExpense.category}
                          onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Stay">Stay</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newExpense.description || ''}
                          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newExpense.amount || ''}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                          placeholder="Enter amount"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paidBy">Paid By</Label>
                        <Select
                          value={newExpense.paidBy}
                          onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payer" />
                          </SelectTrigger>
                          <SelectContent>
                            {tripMembers.map(member => (
                              <SelectItem key={member} value={member}>
                                {member}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Split Type</Label>
                        <Select
                          value={splitType}
                          onValueChange={(value: 'all' | 'custom') => {
                            setSplitType(value)
                            if (value === 'all') {
                              setSelectedMembers(tripMembers)
                            } else {
                              setSelectedMembers([])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select split type" />
                            </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Split Between All</SelectItem>
                            <SelectItem value="custom">Custom Split</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {splitType === 'custom' && (
                        <div className="space-y-2">
                          <Label>Split Between</Label>
                          <div className="space-y-2">
                            {tripMembers.map((member) => (
                              <div key={member} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`member-${member}`}
                                  checked={selectedMembers.includes(member)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMembers([...selectedMembers, member])
                                    } else {
                                      setSelectedMembers(selectedMembers.filter(m => m !== member))
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor={`member-${member}`}>{member}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full rounded-lg h-11" 
                        onClick={addExpense}
                        disabled={
                          !newExpense.category || 
                          !newExpense.description || 
                          !newExpense.amount || 
                          !newExpense.paidBy ||
                          (splitType === 'custom' && selectedMembers.length === 0)
                        }
                      >
                        Add Expense
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {expenses.map((expense) => (
  <Card 
    key={expense.id}
    className="rounded-lg border bg-card/50 hover:bg-card/70 transition-colors duration-200"
  >
    <CardContent className="p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <p className="font-medium truncate">{expense.description}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {expense.category} • Paid by {expense.paidBy}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            Split between: {expense.splitBetween.join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right min-w-[120px]">
            <p className="text-lg font-bold">₹{expense.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              ₹{(expense.amount / expense.splitBetween.length).toFixed(2)} per person
            </p>
          </div>
          {user.role == 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => deleteExpense(expense.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}