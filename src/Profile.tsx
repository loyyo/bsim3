import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import {styled} from '@mui/material/styles';
import AppTheme from './AppTheme';
import {useAuth} from './AuthContext';
import {collection, deleteDoc, doc, getDoc, getDocs, getFirestore, updateDoc} from 'firebase/firestore';
import {MenuItem} from "@mui/material";
import {useNavigate} from "react-router";
import {deleteUser, getAuth} from "firebase/auth";
import {app} from '../firebase';

const db = getFirestore(app);
const auth = getAuth(app);

type User = {
	id: string;
	name?: string;
	email?: string;
	description?: string;
	role?: string;
};

const Card = styled(MuiCard)(({theme}) => ({
	display: 'flex',
	flexDirection: 'column',
	alignSelf: 'center',
	width: '100%',
	padding: theme.spacing(4),
	gap: theme.spacing(2),
	margin: 'auto',
	[theme.breakpoints.up('sm')]: {
		maxWidth: '450px',
	},
	boxShadow:
		'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
	...theme.applyStyles('dark', {
		boxShadow:
			'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
	}),
	maxHeight: '100%',
}));

const ScrollableBox = styled(Box)(({theme}) => ({
	overflowY: 'auto',
	maxHeight: '100%',
	paddingRight: theme.spacing(1),
}));

const ProfileContainer = styled(Box)(({theme}) => ({
	height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
	minHeight: '100%',
	display: 'flex',
	flexDirection: 'row',
	gap: theme.spacing(4),
	padding: theme.spacing(2),
	[theme.breakpoints.up('sm')]: {
		padding: theme.spacing(4),
	},
	'&::before': {
		content: '""',
		display: 'block',
		position: 'absolute',
		zIndex: -1,
		inset: 0,
		backgroundImage:
			'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
		backgroundRepeat: 'no-repeat',
		...theme.applyStyles('dark', {
			backgroundImage:
				'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
		}),
	},
}));

export default function Profile(props: { disableCustomTheme?: boolean }) {
	const {currentUser, logOut} = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [role, setRole] = useState<string>('user');
	const [users, setUsers] = useState<User[]>([]);
	const [editValues, setEditValues] = useState<Record<string, User>>({});
	const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			if (currentUser) {
				const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
				if (userDoc.exists()) {
					const userData = userDoc.data() as User;
					setName(userData.name || '');
					setDescription(userData.description || '');
					setRole(userData.role || 'user');
				}
			}
		};

		fetchUserData();
	}, [currentUser]);

	useEffect(() => {
		const fetchUsers = async () => {
			if (role === 'moderator' || role === 'administrator') {
				const querySnapshot = await getDocs(collection(db, 'users'));
				const userList: User[] = querySnapshot.docs.map((doc) => ({
					...(doc.data() as User),
				}));
				setUsers(userList);
				const editData = userList.reduce((acc, user) => {
					acc[user.id] = {...user};
					return acc;
				}, {} as Record<string, User>);
				setEditValues(editData);
			}
		};

		fetchUsers();
	}, [role]);

	const handleUpdateUser = async (userId: string, profileData?: Partial<User>) => {
		const updatedData = profileData ?? editValues[userId];
		try {
			await updateDoc(doc(db, 'users', userId), updatedData);
			alert('User updated successfully!');
			setUsers((prevUsers) =>
				prevUsers.map((user) => (user.id === userId ? {...user, ...updatedData} : user))
			);
			if (profileData) {
				navigate(0);
			}
		} catch (error) {
			console.error('Error updating user:', error);
			alert('Failed to update user.');
		}
	};


	const handleDeleteUser = async () => {
		if (deleteUserId) {
			try {
				if (deleteUserId === currentUser?.uid) {
					const userDoc = await getDoc(doc(db, 'users', deleteUserId));
					if (userDoc.exists()) {
						const authUser = auth.currentUser;
						if (authUser) {
							await deleteUser(authUser);
						}
					}
				}
				await deleteDoc(doc(db, 'users', deleteUserId));
				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId));
				setDeleteUserId(null);
				alert('User deleted successfully!');
			} catch (error) {
				console.error('Error deleting user:', error);
				alert('Failed to delete user.');
			}
		}
	};

	const handleEditChange = (userId: string, field: keyof User, value: string) => {
		setEditValues((prev) => ({
			...prev,
			[userId]: {
				...prev[userId],
				[field]: value,
			},
		}));
	};

	return (
		<AppTheme {...props}>
			<CssBaseline enableColorScheme/>
			<ProfileContainer>
				<Card variant="outlined">
					<Typography component="h1" variant="h4" sx={{fontSize: 'clamp(1.15rem, 1.15vw, 1.15rem)'}}>
						Welcome, {currentUser?.email || 'User'}
					</Typography>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<Typography variant="body1">Role: {role}</Typography>
						<TextField
							label="Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
						/>
						<TextField
							label="Description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							fullWidth
						/>
						<Button variant="contained" color="primary"
										onClick={() => handleUpdateUser(currentUser?.uid || '', {name, description})} fullWidth>
							Update Profile
						</Button>
						<Button variant="contained" color="secondary" onClick={logOut} fullWidth>
							Log Out
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={() => setDeleteUserId(currentUser?.uid || '')}
							fullWidth
						>
							Delete Account
						</Button>
					</Box>
				</Card>
				{role === 'moderator' || role === 'administrator' ? (
					<Card variant="outlined">
						<Typography component="h2" variant="h5" sx={{mb: 1}}>
							User Management
						</Typography>
						<ScrollableBox>
							{users.filter((user) => user.role !== 'administrator').map((user) => (
								<Box key={user.id} sx={{mb: 2, mr: 2}}>
									<Divider sx={{mb: 1}}/>
									<Typography variant="body1">Email: {user.email}</Typography>
									{role === 'moderator' && (
										<>
											<Typography variant="body1">User: {user.name || 'N/A'}</Typography>
											<Typography variant="body1">Role: {user.role || 'user'}</Typography>
											<Typography variant="body1">Description: {user.description || 'N/A'}</Typography>
										</>
									)}
									{role === 'administrator' && (
										<Box sx={{mt: 2}}>
											<TextField
												label="Name"
												value={editValues[user.id]?.name || ''}
												onChange={(e) => handleEditChange(user.id, 'name', e.target.value)}
												fullWidth
												sx={{mb: 1.5}}
											/>
											<TextField
												label="Description"
												value={editValues[user.id]?.description || ''}
												onChange={(e) => handleEditChange(user.id, 'description', e.target.value)}
												fullWidth
												sx={{mb: 1.5}}
											/>
											<TextField
												select
												label="Role"
												value={editValues[user.id]?.role || 'user'}
												onChange={(e) => handleEditChange(user.id, 'role', e.target.value)}
												fullWidth
												sx={{mb: 1}}
											>
												<MenuItem value="moderator">Moderator</MenuItem>
												<MenuItem value="user">User</MenuItem>
											</TextField>
											<Button
												variant="contained"
												color="primary"
												onClick={() => handleUpdateUser(user.id)}
												fullWidth
												sx={{mt: 1}}
											>
												Edit User
											</Button>
										</Box>
									)}
								</Box>
							))}
						</ScrollableBox>
					</Card>
				) : null}
			</ProfileContainer>

			<Dialog open={!!deleteUserId} onClose={() => setDeleteUserId(null)}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>Are you sure you want to delete this user? This action cannot be
						undone.</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteUserId(null)} color="primary">
						Cancel
					</Button>
					<Button onClick={handleDeleteUser} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</AppTheme>
	);
}
