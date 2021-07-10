import { useEffect, userEffect } from 'react';
import Router from 'next/Router';
import useRequest from '../../hooks/useRequest';

export default () => {
	const { doRequest } = useRequest({
		url: '/api/users/signout',
		method: 'post',
		body: {},
		onSuccess: () => Router.push('/'),
	});

	useEffect(() => {
		doRequest();
	}, []);

	return <div>Signing you Out....</div>;
};
