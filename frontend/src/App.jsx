import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/authSlice'
import { useEffect } from 'react'

function App() {

  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  if(isLoading){
    return (
      <div className='min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'>
            
          </div>
          <p className='text-purple-600 font-medium'>Loading CProtocol...</p>
        </div>
      </div>
    )
  }


  return (
    <>
      <Header />
      <Outlet />


      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  )
}

export default App
