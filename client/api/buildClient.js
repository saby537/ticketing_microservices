import axios from 'axios';

const buildClient = ({ req }) => {
	if (typeof window === 'undefined') {
		// we are on server
		return axios.create({
			baseUrl: 'http://SERVICE_NAME.NAMESPACE.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		// we are on browser
		return axios.create({
			baseUrl: '/',
		});
	}
};

export default buildClient;
