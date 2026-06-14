import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import TopPanel from './components/TopPanel';
import LandPage from './pages/LandPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
<<<<<<< HEAD
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
=======
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundePage';
>>>>>>> c6bee7975e4d515f06009fd5a01c03528d00b92c

const MainLayout = () => {
  return (
    <>
      <TopPanel />
<<<<<<< HEAD
      <Outlet /> 
=======
      <Outlet />
>>>>>>> c6bee7975e4d515f06009fd5a01c03528d00b92c
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          

          <Route element={<MainLayout />}>
            <Route path="/" element={<LandPage />} />
            <Route path="/discovery" element={<HomePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;