import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import TopPanel from './components/TopPanel';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// 1. רכיב פריסה שמכיל את ה-TopPanel רק עבור העמודים שבתוכו
const MainLayout = () => {
  return (
    <>
      <TopPanel />
      <Outlet /> {/* כאן יתרנדרו עמודי הבנים כמו HomePage */}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
<<<<<<< HEAD
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
=======
          <Route path='*' element={<NotFoundPage />} />
>>>>>>> AAA-164-jwt-implementation
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;