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

	//  本地url替换
	config.giteeOauthConfig = {
		redirectURL: "http://47.107.121.147/api/users/gitee/oauth/callback",
	};

	return config;
};
