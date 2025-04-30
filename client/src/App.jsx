import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Header from './components/ui/Header'
import Home from './pages/Home'
import SignUp from './authentication/SignUp'
import Dashboard from './pages/Dashboard'
import CreateCourse from './pages/CreateCourse'
import CourseDetail from './pages/CourseDetail'

function App() {

  return (
  
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/sign-up' element={<SignUp/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/create-course' element={<CreateCourse/>}/>
      <Route path='/course/:courseId' element={<CourseDetail/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
