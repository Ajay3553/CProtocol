import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store.js'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ContactUs from './pages/ContactUs.jsx'
import Channels from './pages/Channels.jsx'
import Signup from './pages/userPages/Signup.jsx'
import Login from './pages/userPages/Login.jsx'
import VerifyEmail from './pages/userPages/VerifyEmail.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <Home />
        ),
      },
      {
        path: '/about',
        element: (
          <About />
        ),
      },
      {
        path: '/contact-us',
        element: (
          <ContactUs />
        )
      },
      {
        path: '/channels',
        element: (
          <Channels />
        )
      },
      {
        path: '/register',
        element: (
          <Signup />
        )
      },
      {
        path: '/login',
        element: (
          <Login />
        )
      },
      {
        path: 'verify-email',
        element: (
          <VerifyEmail />
        )
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
