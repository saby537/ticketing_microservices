import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const NewTicket = ({ currentUser }) => {
	const [title, setTitle] = useState('');
	const [price, sePrice] = useState('');
	const { doRequest, errors } = useRequest({
		url: '/api/tickets',
		method: 'post',
		body: {
			title,
			price,
		},
		onSuccess: () => Router.push('/'),
	});
	const onBlurHandler = () => {
		const val = parseFloat(price);
		if (isNaN(val)) {
			return;
		}
		setPrice(val.toFixed(2));
	};

	const onSubmitHandler = (event) => {
		event.preventDefault();
		doRequest();
	};
	return (
		<div>
			<h1> Create a new Ticket </h1>
			<form onSubmit={onSubmitHandler}>
				<div className="form-group">
					<label>Title</label>
					<input
						className="form-control"
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<label>Title</label>
					<input
						className="form-control"
						onBlur={onBlurHandler}
						onChange={(e) => setPrice(e.target.value)}
					/>
				</div>
				{errors}
				<div className="btn btn-primary">Submit</div>
			</form>
		</div>
	);
};

export default NewTicket;
