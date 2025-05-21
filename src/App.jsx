// import './App.css'
import Navbar from './Navbar'
import Detection from './pages/Detection'
import CameraPage from './pages/CameraPage'; // đúng path


function App() {
  let component
  switch (window.location.pathname) {
    case '/':
      component = <Detection />
      break
    case '/camera':
      component = <CameraPage />
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