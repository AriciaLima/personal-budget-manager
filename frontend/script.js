// API config for the weather widget in the header
const WEATHER_API_KEY = '2430311bcfbc4cbeb55145732252511'
const WEATHER_CITY = 'Porto Portugal'

// Cache all DOM elements we will use (so we don't keep calling getElementById)
const el = {
  time: document.getElementById('current-time'),
  date: document.getElementById('current-date'),
  themeToggle: document.getElementById('theme-toggle'),
  weatherCity: document.getElementById('weather-city'),
  weatherTemp: document.getElementById('weather-temp'),
  form: document.getElementById('expense-form'),
  type: document.getElementById('expense-type'),
  description: document.getElementById('expense-description'),
  amount: document.getElementById('expense-amount'),
  category: document.getElementById('expense-category'),
  list: document.getElementById('transaction-list'),
  filter: document.getElementById('filter-cat'),
  totalIncome: document.getElementById('total-income'),
  totalOutcome: document.getElementById('total-outcome'),
  balance: document.getElementById('balance')
}

// Format a number as currency (Portuguese format, 2 decimal places)
function formatCurrency(value) {
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Update clock and date in the header
function updateDateTime() {
  const now = new Date()

  // Time (HH:MM)
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  el.time.textContent = `${hours}:${minutes}`

  // Date in Portuguese locale
  el.date.textContent = now.toLocaleDateString('pt-PT')
}

// Initial call + interval for live clock
updateDateTime()
setInterval(updateDateTime, 1000)

// =====================
// Weather in header
// =====================

// Fetch current weather and update header
async function fetchWeather() {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
      WEATHER_CITY
    )}&aqi=no`

    const response = await fetch(url)
    const data = await response.json()

    // Use location name and current temperature in °C
    el.weatherCity.textContent = data.location.name
    el.weatherTemp.textContent = `${data.current.temp_c}°C`
  } catch {
    // In case of any error, show fallback values
    el.weatherCity.textContent = 'N/A'
    el.weatherTemp.textContent = '--°C'
  }
}

// Get weather once on load
fetchWeather()

// =====================
// Theme toggle (light/dark)
// =====================

// Apply theme to body and remember it in localStorage
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  // Change icon depending on the theme
  el.themeToggle.textContent = theme === 'light' ? '☀️' : '🌙'
}

// Toggle theme on button click
el.themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'light'
  const newTheme = current === 'light' ? 'dark' : 'light'
  applyTheme(newTheme)
})

// Apply saved theme (or default to light)
applyTheme(localStorage.getItem('theme') || 'light')

// =====================
// Expenses state
// =====================

// Main form reference
const expenseForm = el.form

// Array of all transactions (income/outcome)
let expenses = []

// If not null, we are editing an existing transaction with this id
let editingId = null

// Save expenses array to localStorage
function saveExpenses() {
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  } catch {
    // Silently ignore storage errors
  }
}

// Load expenses from localStorage and render them
function loadExpenses() {
  try {
    const stored = localStorage.getItem('expenses')
    if (stored) {
      expenses = JSON.parse(stored) || []
      expenses.forEach(addTransactionToList)
      updateSummary()
    }
  } catch {
    expenses = []
  }
}

// =====================
// Categories by type
// =====================

const typeSelect = el.type
const categorySelect = el.category

// Categories for income entries
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Other']

// Categories for outcome (expenses)
const outcomeCategories = [
  'Food',
  'Transport',
  'Health',
  'Entertainment',
  'Shopping',
  'Bills',
  'Education',
  'Travel',
  'Other'
]

// Reference to the filter <select>
const filterSelect = el.filter

// Build options for the filter dropdown: All, Income, Outcome, then each category
function buildFilterOptions() {
  // Use Set to avoid duplicate categories
  const allCats = Array.from(
    new Set([...incomeCategories, ...outcomeCategories])
  )

  filterSelect.innerHTML = ''
  const base = ['All', 'Income', 'Outcome', ...allCats]

  base.forEach(opt => {
    const option = document.createElement('option')
    option.value = opt
    option.textContent = opt
    filterSelect.appendChild(option)
  })
}

// Update category <select> based on selected type (income/outcome)
function updateCategories(type) {
  categorySelect.innerHTML = ''
  const list = type === 'income' ? incomeCategories : outcomeCategories

  list.forEach(cat => {
    const option = document.createElement('option')
    option.value = cat
    option.textContent = cat
    categorySelect.appendChild(option)
  })
}

// When type changes, reload categories accordingly
typeSelect.addEventListener('change', () => {
  updateCategories(typeSelect.value)
})

// =====================
// Rendering transactions
// =====================

// Create and append a transaction <li> to the list
function addTransactionToList(transaction) {
  const li = document.createElement('li')

  // Store type and category in data attributes (used for filtering)
  li.dataset.type = transaction.type
  li.dataset.category = transaction.category

  // Different class for income vs outcome (for styling)
  li.classList.add(
    transaction.type === 'income' ? 'income-item' : 'outcome-item'
  )

  const textSpan = document.createElement('span')
  textSpan.classList.add('transaction-text')

  // Main line: + or - sign, description and value
  const mainText = document.createElement('div')
  mainText.innerHTML = `<strong>${
    transaction.type === 'income' ? '+' : '-'
  }</strong> ${transaction.description} — ${formatCurrency(
    transaction.amount
  )} €`

  // Sub line: category and date
  const subText = document.createElement('div')
  subText.innerHTML = `<small>(${transaction.category}, ${transaction.date})</small>`

  textSpan.appendChild(mainText)
  textSpan.appendChild(subText)

  // Edit button
  const editBtn = document.createElement('button')
  editBtn.textContent = '✎'
  editBtn.classList.add('edit-btn')
  editBtn.addEventListener('click', () => {
    startEdit(transaction)
  })

  // Delete button
  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = '✕'
  deleteBtn.classList.add('delete-btn')
  deleteBtn.addEventListener('click', () => {
    // Remove from array
    expenses = expenses.filter(item => item.id !== transaction.id)
    // Remove from DOM
    li.remove()
    // Recalculate totals and persist
    updateSummary()
    saveExpenses()
    // Reapply filter to what's left
    applyCurrentFilter()
  })

  // Area for action buttons
  const actions = document.createElement('div')
  actions.classList.add('actions')
  actions.appendChild(editBtn)
  actions.appendChild(deleteBtn)

  // Assemble <li>
  li.appendChild(textSpan)
  li.appendChild(actions)

  // Add to the list in the UI
  el.list.appendChild(li)
}

// Rerender the whole transaction list from the expenses array
function renderTransactions() {
  el.list.innerHTML = ''
  expenses.forEach(addTransactionToList)
}

// Submit button inside the form (Add / Update)
const submitBtn = document.querySelector('#expense-form button[type="submit"]')

// Put transaction data into the form to start editing
function startEdit(transaction) {
  el.type.value = transaction.type
  updateCategories(transaction.type)
  el.description.value = transaction.description
  el.amount.value = transaction.amount
  el.category.value = transaction.category

  // Mark which transaction we are editing
  editingId = transaction.id

  // Change button text to "Update"
  submitBtn.textContent = 'Update'
}

// =====================
// Filtering
// =====================

// Show/hide <li> items based on current filter value
function applyCurrentFilter() {
  const selected = filterSelect.value
  const items = document.querySelectorAll('#transaction-list li')

  items.forEach(li => {
    const category = li.dataset.category
    const type = li.dataset.type
    let show = false

    if (!selected || selected === 'All') show = true
    else if (selected === 'Income') show = type === 'income'
    else if (selected === 'Outcome') show = type === 'outcome'
    else show = category === selected

    li.style.display = show ? 'flex' : 'none'
  })
}

// When filter dropdown changes, reapply filter
filterSelect.addEventListener('change', applyCurrentFilter)

// =====================
// Form submit (add/edit transaction)
// =====================

expenseForm.addEventListener('submit', event => {
  event.preventDefault()

  const type = el.type.value
  const description = el.description.value
  const amount = parseFloat(el.amount.value)
  const category = el.category.value

  if (editingId) {
    // Editing existing transaction
    const idx = expenses.findIndex(item => item.id === editingId)
    if (idx !== -1) {
      expenses[idx] = {
        ...expenses[idx],
        type,
        description,
        amount,
        category
      }
    }

    // Reset editing state
    editingId = null
    submitBtn.textContent = 'Add'

    // Rerender whole list because item data changed
    renderTransactions()
    updateSummary()
    saveExpenses()
    applyCurrentFilter()
  } else {
    // Creating new transaction
    const transaction = {
      id: Date.now(), // simple unique ID based on timestamp
      type,
      description,
      amount,
      category,
      date: new Date().toLocaleDateString('pt-PT')
    }

    // Add to array and UI
    expenses.push(transaction)
    addTransactionToList(transaction)
    updateSummary()
    saveExpenses()
    applyCurrentFilter()
  }

  // Clear form after submit
  expenseForm.reset()
  // Clear categories; will be rebuilt when type changes
  categorySelect.innerHTML = ''
})

// =====================
// Summary (totals)
// =====================

// Recalculate total income, total outcome and balance
function updateSummary() {
  let totalIncome = 0
  let totalOutcome = 0

  expenses.forEach(item => {
    if (item.type === 'income') totalIncome += item.amount
    else totalOutcome += item.amount
  })

  const balance = totalIncome - totalOutcome

  el.totalIncome.textContent = formatCurrency(totalIncome)
  el.totalOutcome.textContent = formatCurrency(totalOutcome)
  el.balance.textContent = formatCurrency(balance)
}

// =====================
// Initial bootstrapping
// =====================

// Initialize summary with zeros
updateSummary()

// Build filter dropdown options (All, Income, Outcome, categories)
buildFilterOptions()

// Load saved expenses from localStorage and render them
loadExpenses()

// Apply current filter to what was loaded (default: All)
applyCurrentFilter()
