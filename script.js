const apiKey = '2430311bcfbc4cbeb55145732252511'
const city = 'Porto, Portugal'
const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
  city
)}&aqi=no` // Update date and time in header
function updateDateTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  document.getElementById('current-time').textContent = `${hours}:${minutes}`

  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  document.getElementById(
    'current-date'
  ).textContent = `${day}/${month}/${year}`
}

updateDateTime()
setInterval(updateDateTime, 1000)

// Fetch weather for header
function fetchWeather() {
  const apiKey = '2430311bcfbc4cbeb55145732252511'
  const city = 'Porto Portugal'
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById('weather-city').textContent = data.location.name
      document.getElementById(
        'weather-temp'
      ).textContent = `${data.current.temp_c}°C`
    })
    .catch(() => {
      document.getElementById('weather-city').textContent = 'N/A'
      document.getElementById('weather-temp').textContent = '--°C'
    })
}
fetchWeather()

// Theme toggle in header
const themeToggleBtn = document.getElementById('theme-toggle')

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙'
}

themeToggleBtn.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'light'
  const newTheme = current === 'light' ? 'dark' : 'light'
  applyTheme(newTheme)
})

applyTheme(localStorage.getItem('theme') || 'light')

// Form elements
const expenseForm = document.getElementById('expense-form')
let expenses = []

function saveExpenses() {
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  } catch {}
}

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

const typeSelect = document.getElementById('expense-type')
const categorySelect = document.getElementById('expense-category')

const incomeCategories = ['Salary', 'Investment', 'Gift', 'Other']
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

function buildFilterOptions() {
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

// Update category options based on type
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

typeSelect.addEventListener('change', () => {
  updateCategories(typeSelect.value)
})

// Add transaction to list
function addTransactionToList(transaction) {
  const li = document.createElement('li')

  li.dataset.type = transaction.type
  li.dataset.category = transaction.category

  li.classList.add(
    transaction.type === 'income' ? 'income-item' : 'outcome-item'
  )

  const textSpan = document.createElement('span')
  textSpan.classList.add('transaction-text')

  const mainText = document.createElement('div')
  mainText.innerHTML = `<strong>${
    transaction.type === 'income' ? '+' : '-'
  }</strong> ${transaction.description} — ${transaction.amount}€`

  const subText = document.createElement('div')
  subText.innerHTML = `<small>(${transaction.category}, ${transaction.date})</small>`

  textSpan.appendChild(mainText)
  textSpan.appendChild(subText)

  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = '✕'
  deleteBtn.classList.add('delete-btn')

  deleteBtn.addEventListener('click', () => {
    expenses = expenses.filter(item => item.id !== transaction.id)
    li.remove()
    updateSummary()
    saveExpenses()
    applyCurrentFilter()
  })

  li.appendChild(textSpan)
  li.appendChild(deleteBtn)

  document.getElementById('transaction-list').appendChild(li)
}

// Filter transactions
const filterSelect = document.getElementById('filter-cat')

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

filterSelect.addEventListener('change', applyCurrentFilter)

// Handle form submission
expenseForm.addEventListener('submit', event => {
  event.preventDefault()

  const type = document.getElementById('expense-type').value
  const description = document.getElementById('expense-description').value
  const amount = parseFloat(document.getElementById('expense-amount').value)
  const category = document.getElementById('expense-category').value

  const transaction = {
    id: Date.now(),
    type,
    description,
    amount,
    category,
    date: new Date().toLocaleDateString()
  }

  expenses.push(transaction)
  addTransactionToList(transaction)
  updateSummary()
  saveExpenses()
  applyCurrentFilter()

  expenseForm.reset()
  categorySelect.innerHTML = ''
})

// Update summary totals
function updateSummary() {
  let totalIncome = 0
  let totalOutcome = 0

  expenses.forEach(item => {
    if (item.type === 'income') totalIncome += item.amount
    else totalOutcome += item.amount
  })

  const balance = totalIncome - totalOutcome

  document.getElementById('total-income').textContent = totalIncome.toFixed(2)
  document.getElementById('total-outcome').textContent = totalOutcome.toFixed(2)
  document.getElementById('balance').textContent = balance.toFixed(2)
}

updateSummary()
buildFilterOptions()
loadExpenses()
applyCurrentFilter()
