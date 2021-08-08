const Mode = document.getElementById('mode')
const Body = document.querySelector('body')

var localDarkMode = localStorage.getItem('darkMode')
var darkMode = false

if (localDarkMode !== null) {
  darkMode = JSON.parse(localDarkMode)
  setCurrentTheme(darkMode)
}

Mode.addEventListener('click', (e) => {
  darkMode = !darkMode
  setCurrentTheme(darkMode)
  localStorage.setItem('darkMode', JSON.stringify(darkMode))
})

function setCurrentTheme(isDarkMode) {
  const theme = (isDarkMode === true) ? 'theme-dark' : 'theme-light'
  return Body.setAttribute('class', `${theme}`)
}
