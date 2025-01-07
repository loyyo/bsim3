import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router';

import SignIn from './SignIn';
import SignUp from './SignUp';
import Profile from './Profile';

// Mock authentication function
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken'); // Replace this with your actual authentication logic
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes for users who are not logged in */}
        <Route
          path="/sign-in"
          element={!isAuthenticated() ? <SignIn /> : <Navigate to="/profile" replace />}
        />
        <Route
          path="/sign-up"
          element={!isAuthenticated() ? <SignUp /> : <Navigate to="/profile" replace />}
        />

        {/* Routes for logged-in users */}
        <Route
          path="/profile"
          element={isAuthenticated() ? <Profile /> : <Navigate to="/sign-in" replace />}
        />

        {/* Catch-all for unauthorized access */}
        <Route
          path="*"
          element={!isAuthenticated() ? <Navigate to="/sign-in" replace /> : <Navigate to="/profile" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
