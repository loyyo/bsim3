import {FormEvent, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import AppTheme from './AppTheme';
import {createUserWithEmailAndPassword, getAuth, sendEmailVerification} from 'firebase/auth';
import {doc, getFirestore, setDoc} from 'firebase/firestore';
import {app} from '../firebase';

const auth = getAuth(app);
const db = getFirestore(app);

const Card = styled(MuiCard)(({theme}) => ({
	display: 'flex',
	flexDirection: 'column',
	alignSelf: 'center',
	width: '100%',
	padding: theme.spacing(4),
	gap: theme.spacing(2),
	margin: 'auto',
	boxShadow:
		'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
	[theme.breakpoints.up('sm')]: {
		width: '450px',
	},
	...theme.applyStyles('dark', {
		boxShadow:
			'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
	}),
}));

const SignUpContainer = styled(Stack)(({theme}) => ({
	height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
	minHeight: '100%',
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

export default function SignUp(props: { disableCustomTheme?: boolean }) {
	const [emailError, setEmailError] = useState(false);
	const [emailErrorMessage, setEmailErrorMessage] = useState('');
	const [passwordError, setPasswordError] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
	const [nameError, setNameError] = useState(false);
	const [nameErrorMessage, setNameErrorMessage] = useState('');
	const [gdprConsent, setGdprConsent] = useState(false);

	const validateInputs = () => {
		const email = document.getElementById('email') as HTMLInputElement;
		const password = document.getElementById('password') as HTMLInputElement;
		const name = document.getElementById('name') as HTMLInputElement;

		let isValid = true;

		if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
			setEmailError(true);
			setEmailErrorMessage('Please enter a valid email address.');
			isValid = false;
		} else {
			setEmailError(false);
			setEmailErrorMessage('');
		}

		if (!password.value || password.value.length < 6) {
			setPasswordError(true);
			setPasswordErrorMessage('Password must be at least 6 characters long.');
			isValid = false;
		} else {
			setPasswordError(false);
			setPasswordErrorMessage('');
		}

		if (!name.value || name.value.length < 1) {
			setNameError(true);
			setNameErrorMessage('Name is required.');
			isValid = false;
		} else {
			setNameError(false);
			setNameErrorMessage('');
		}

		if (!gdprConsent) {
			isValid = false;
			alert('You must consent to GDPR before proceeding.');
		}

		return isValid;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!validateInputs()) {
			return;
		}

		const data = new FormData(event.currentTarget);
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			await setDoc(doc(db, 'users', user.uid), {
				name,
				email,
				id: user.uid,
				createdAt: new Date().toISOString(),
				consent: gdprConsent,
				role: "user",
				description: "Empty description"
			});

			await sendEmailVerification(user);

			alert('User successfully created! Please verify your email.');
		} catch (error: any) {
			console.error('Error creating user:', error.message);
			alert(error.message);
		}
	};

	return (
		<AppTheme {...props}>
			<CssBaseline enableColorScheme/>
			<SignUpContainer direction="column" justifyContent="space-between">
				<Card variant="outlined">
					<Typography
						component="h1"
						variant="h4"
						sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
					>
						Sign up
					</Typography>
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{display: 'flex', flexDirection: 'column', gap: 2}}
					>
						<FormControl>
							<FormLabel htmlFor="name">Full name</FormLabel>
							<TextField
								autoComplete="name"
								name="name"
								required
								fullWidth
								id="name"
								placeholder="Jon Snow"
								error={nameError}
								helperText={nameErrorMessage}
								color={nameError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="email">Email</FormLabel>
							<TextField
								required
								fullWidth
								id="email"
								placeholder="your@email.com"
								name="email"
								autoComplete="email"
								variant="outlined"
								error={emailError}
								helperText={emailErrorMessage}
								color={passwordError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="password">Password</FormLabel>
							<TextField
								required
								fullWidth
								name="password"
								placeholder="••••••"
								type="password"
								id="password"
								autoComplete="new-password"
								variant="outlined"
								error={passwordError}
								helperText={passwordErrorMessage}
								color={passwordError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControlLabel
							control={
								<Checkbox
									value="gdpr-consent"
									color="primary"
									checked={gdprConsent}
									onChange={() => setGdprConsent(!gdprConsent)}
								/>
							}
							label="I consent to the storage and processing of my personal data."
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
						>
							Sign up
						</Button>
					</Box>
					<Divider>
						<Typography sx={{color: 'text.secondary'}}>or</Typography>
					</Divider>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<Typography sx={{textAlign: 'center'}}>
							Already have an account?{' '}
							<Link
								component={RouterLink}
								to="/sign-in"
								variant="body2"
								sx={{alignSelf: 'center'}}
							>
								Sign in
							</Link>
						</Typography>
					</Box>
				</Card>
			</SignUpContainer>
		</AppTheme>
	);
}
