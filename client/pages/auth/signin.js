import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';
const signUp = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { doRequest, errors } = useRequest({
		url: '/api/users/sigin',
		methid: 'POST',
		body: { email, password },
		onSuccess = ()=>Router.push("/")
	});
	const onSubmit = async (event) => {
		event.preventDefault();
		doRequest();
	};
	return (
		<form onSubmit={onSubmit}>
			<h1>Sign In</h1>
			<div className="form-group">
				<label>Email Address</label>
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="form-control"
				/>
			</div>
			<div className="form-group">
				<label>Password</label>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					className="form-control"
				/>
			</div>
			<button className="btn btn-primary">Sign Up</button>
			{errors}
		</form>
	);
};

export default signUp;