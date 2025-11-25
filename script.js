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
