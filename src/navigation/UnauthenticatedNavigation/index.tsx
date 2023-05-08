import { Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/Auth/LoginPage';
import InfoPage from '../../pages/AllUsers/InfoPage';
import RegisterPage from '../../pages/Auth/RegisterPage';

const UnauthenticatedNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<InfoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage/>} />
    </Routes>
  )
}

export default UnauthenticatedNavigation;