import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ResourcesPage from './pages/resources/ResourcesPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/resources" />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
