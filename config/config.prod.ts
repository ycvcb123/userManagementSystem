import { DefaultConfig } from "./config.default";

export default () => {
	const config: DefaultConfig = {};

	// 允许跨域的域名陪在这里
	config.security = {
		domainWhiteList: [],
	};

	// token过期时间
	config.jwt = {
		expires: "2 days",
	};

	config.mongoose = {
		url: "mongodb://user-mongo:27017/userManagement", // 换成网络名称 docker创建的网络
		options: {
			useUnifiedTopology: true, // 添加 useUnifiedTopology 选项
			user: "user", // process.env.MONGO_DB_USERNAME,
			pass: "pass", // process.env.MONGO_DB_PASSWORD,
		},
	};

	config.redis = {
		client: {
			port: 6379,
			host: "user-redis",
			password: process.env.REDIS_PASSWORD,
		},
	};

	//  本地url替换
	config.giteeOauthConfig = {
		redirectURL: "http://47.107.121.147/api/users/gitee/oauth/callback",
	};

	return config;
};
