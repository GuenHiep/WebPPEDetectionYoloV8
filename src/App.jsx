// import './App.css'
import Navbar from './Navbar'
import Detection from './pages/Detection'


function App() {
  let component
  switch (window.location.pathname) {
    case '/':
      component = <h1>Home</h1>
      break
    case '/detection':
      component = <Detection />
      break
    default:
      component = <h1>404 Not Found</h1>
      break
  }
  return (
    <div>
      <Navbar />
      {component}
    </div>
  )
}

export default App