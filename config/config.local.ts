import { DefaultConfig } from "./config.default";

export default () => {
	const config: DefaultConfig = {};
	config.baseUrl = "http://127.0.0.1:7001";
	config.news = {
		pageSize: 20,
	};
	return config;
};
