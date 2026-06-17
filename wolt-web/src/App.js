import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext'; 

import TopPanel from './components/TopPanel';
import LandPage from './pages/LandPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantView from './pages/RestaurantView';
import AddRestaurantPage from './pages/AddRestaurantPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';


const MainLayout = () => {
  return (
    <>
      <TopPanel />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RestaurantProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route element={<MainLayout />}>
                <Route path="/" element={<LandPage />} />
                <Route path="/discovery" element={<HomePage />} />
                <Route path="/restaurant/:id" element={<RestaurantView />} />
                <Route path="/AddRestaurantPage" element={<AddRestaurantPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </RestaurantProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;