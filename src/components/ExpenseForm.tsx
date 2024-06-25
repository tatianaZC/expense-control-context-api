import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import type { DraftExpense, Value } from "../types";
import { categories } from "../data/categories";
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";

export default function ExpenseForm() {

  const [expense, setExpense] = useState<DraftExpense>({
    amount: 0,
    expenseName: '',
    category: '',
    date: new Date()
  })
  const [error, setError] = useState('')
  const [previousAmount, setPreviousAmount] = useState(0)
  const { dispatch, state, remainingBudget } = useBudget()

  useEffect(() => {
    if(state.updatingId) {
      const updatingExpense = state.expenses.filter( currentExpense => currentExpense.id === state.updatingId )[0]
      setExpense(updatingExpense)
      setPreviousAmount(updatingExpense.amount)
    }
  }, [state.updatingId])

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    const isAmountField = ['amount'].includes(name)

    setExpense({
      ...expense,
      [name] : isAmountField ? Number(value) : value
    }) 
  }

  const handleChangeDate = (value: Value) => {
    setExpense({
      ...expense,
      date: value
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if(Object.values(expense).includes('')) {
      setError('All fields are required')
      return
    }

    if((expense.amount - previousAmount) > remainingBudget) {
      setError('This expense is over budget')
      return
    }
    
    //add or update expense
    if(state.updatingId) {
      dispatch({ type: "update-expense", payload: {expense: {id: state.updatingId, ...expense}}})
    } else {
      dispatch({ type: "add-expense", payload: {expense}})
    }

    //restart state
    setExpense({
      amount: 0,
      expenseName: '',
      category: '',
      date: new Date()
    })
    setPreviousAmount(0)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
        {state.updatingId ? 'Update expense' : 'New expense' }
      </legend>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <div className="flex flex-col gap-2">
        <label
          htmlFor="expenseName"
          className="text-xl"
        >
          Expense name:
        </label>
        <input
          type="text"
          id="expenseName"
          placeholder="Write expense name"
          className="bg-slate-100 p-2"
          name="expenseName"
          value={expense.expenseName}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="amount"
          className="text-xl"
        >
          Quantity:
        </label>
        <input
          type="number"
          id="amount"
          placeholder="write the amount of the expense"
          className="bg-slate-100 p-2"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="category"
          className="text-xl"
        >
          Category:
        </label>
        <select
          id="category"
          className="bg-slate-100 p-2"
          name="category"
          value={expense.category}
          onChange={handleChange}
        >
          <option value=''>-- Select an option --</option>
          {categories.map( category => (
            <option 
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="amount"
          className="text-xl"
        >
          Date expense:
        </label>
        <DatePicker
          className="bg-slate-100 p-2 border-0"
          value={expense.date}
          onChange={handleChangeDate}
        />
      </div>

      <input
        type="submit"
        className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
        value={state.updatingId ? 'Update' : 'Save'}
      />
    </form>
  )
}
