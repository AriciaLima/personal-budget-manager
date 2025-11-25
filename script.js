// Get the current system date and time
function updateDateTime() {
  const now = new Date()

  // Hour
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  document.getElementById('current-time').textContent = `${hours}:${minutes}`

  // Date
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  document.getElementById(
    'current-date'
  ).textContent = `${day}/${month}/${year}`
}

//Updates immediately in HTML and then every second
updateDateTime()
setInterval(updateDateTime, 1000)

// Theme toggle
const themeToggleBtn = document.getElementById('theme-toggle')

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}
themeToggleBtn.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'light'
  const newTheme = current === 'light' ? 'dark' : 'light'
  applyTheme(newTheme)
})
applyTheme(localStorage.getItem('theme') || 'light')

//Weather API
function fetchWeather() {
  const apiKey = '2430311bcfbc4cbeb55145732252511'
  const city = 'Porto Portugal'
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const temp = data.current.temp_c
      const name = data.location.name

      document.getElementById('weather-city').textContent = name
      document.getElementById('weather-temp').textContent = `${temp}°C`
    })
    .catch(() => {
      document.getElementById('weather-city').textContent = 'N/A'
      document.getElementById('weather-temp').textContent = '--°C'
    })
}
fetchWeather()

//Outcome and income
const expenseForm = document.getElementById('expense-form')
let expenses = []
// =================================

// Outcome and income
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

// FUNCTION THAT ADDS TO LIST
function addTransactionToList(transaction) {
  const li = document.createElement('li')

  if (transaction.type === 'income') {
    li.classList.add('income-item')
  } else {
    li.classList.add('outcome-item')
  }

  li.textContent = `[${transaction.type}] ${transaction.description} — ${transaction.amount}€ (${transaction.category}, ${transaction.date})`

  document.getElementById('transaction-list').appendChild(li)
}

// SUBMIT FORM
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const type = document.getElementById('expense-type').value
  const description = document.getElementById('expense-description').value
  const amount = parseFloat(document.getElementById('expense-amount').value)
  const category = document.getElementById('expense-category').value

  const expense = {
    id: Date.now(),
    type,
    description,
    amount,
    category,
    date: new Date().toLocaleDateString()
  }

  expenses.push(expense)
  addTransactionToList(expense)
  updateSummary()

  expenseForm.reset()
  categorySelect.innerHTML = ''
})

//Summary
function updateSummary() {
  let totalIncome = 0
  let totalOutcome = 0

  expenses.forEach(item => {
    if (item.type === 'income') {
      totalIncome += item.amount
    } else {
      totalOutcome += item.amount
    }
  })

  const balance = totalIncome - totalOutcome

  document.getElementById('total-income').textContent = totalIncome.toFixed(2)
  document.getElementById('total-outcome').textContent = totalOutcome.toFixed(2)
  document.getElementById('balance').textContent = balance.toFixed(2)
}
updateSummary()
