import {strictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundePage';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

const router = createBrowserRouter([
  {path:'/', element:<HomePage/>},
  {path:'/login', element:<LoginPage/>},
  {path:'/signup', element:<SignupPage/>},
  {path:'*', element:<NotFoundPage/>}
]);
createRoot(document.getElementById('root')).render(
  <strictMode>
    <RouterProvider router={router}/>
  </strictMode>
);