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
import {useAuth} from "./AuthContext.tsx";

const App: React.FC = () => {
	const {currentUser} = useAuth();
	return (
		<Router>
			<Routes>
				{/* Routes for users who are not logged in */}
				<Route
					path="/sign-in"
					element={!currentUser ? <SignIn/> : <Navigate to="/profile" replace/>}
				/>
				<Route
					path="/sign-up"
					element={!currentUser ? <SignUp/> : <Navigate to="/profile" replace/>}
				/>

				{/* Routes for logged-in users */}
				<Route
					path="/profile"
					element={currentUser ? <Profile/> : <Navigate to="/sign-in" replace/>}
				/>

				{/* Catch-all for unauthorized access */}
				<Route
					path="*"
					element={!currentUser ? <Navigate to="/sign-in" replace/> : <Navigate to="/profile" replace/>}
				/>
			</Routes>
		</Router>
	);
};

export default App;
