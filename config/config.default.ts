import { EggAppConfig, PowerPartial, EggAppInfo } from "egg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// for config.{env}.ts
export type DefaultConfig = PowerPartial<EggAppConfig & BizConfig>;

// app special config scheme
export interface BizConfig {
	sourceUrl: string;
	news: {
		pageSize: number;
		serverUrl: string;
	};
}

export default (appInfo: EggAppInfo) => {
	const config = {} as PowerPartial<EggAppConfig> & BizConfig;

	// app special config
	config.sourceUrl = `https://github.com/eggjs/examples/tree/master/${appInfo.name}`;
	config.news = {
		pageSize: 30,
		serverUrl: "https://hacker-news.firebaseio.com/v0",
	};

	config.session = {
		bcrypt: false,
	};

	const giteeOauthConfig = {
		clientID: process.env.clientID,
		clientSecret: process.env.clientSecret,
		redirectURL: "http://127.0.0.1:7001/api/users/gitee/oauth/callback",
		authURL: "https://gitee.com/oauth/token?grant_type=authorization_code",
		giteeUserApi: "https://gitee.com/api/v5/user",
	};

	// override config from framework / plugin
	// use for cookie sign key, should change to you own and keep security
	config.keys = appInfo.name + "123456";

	config.view = {
		defaultViewEngine: "nunjucks",
		mapping: {
			".tpl": "nunjucks",
		},
	};

	config.siteFile = {
		"/favicon.ico": fs.readFileSync(path.join(appInfo.baseDir, "app/public/favicon.png")),
	};

	config.mongoose = {
		url: "mongodb://127.0.0.1:27017/userManagement",
	};

	config.security = {
		csrf: false,
	};

	config.cors = {
		allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
		origin: "http://127.0.0.1:8080",
	};

	config.bcrypt = {
		saltRounds: 10, // 加盐的轮次
	};

	config.redis = {
		client: {
			port: 6379,
			host: "127.0.0.1",
			password: "",
			db: 0, // 只有一个实例
		},
	};

	// config.jwt = {
	// 	secret: "5674373",
	// 	expires: "2h",
	// };

	// 所有业务的配置都在这
	const bizConfig = {
		// 使用我们自己写的jwt中间件写到这里，使用egg-jwt 就写到外面，原理是一样的，egg-jwt更完善一点
		jwt: {
			secret: "5674373",
			expires: "2h",
		},
		// 阿里云短信服务接入配置
		aliCloudConfig: {
			accessKeyId: process.env.accessKeyId,
			accessKeySecret: process.env.accessKeySecret,
			endpoint: `dysmsapi.aliyuncs.com`,
		},
		giteeOauthConfig,
	};

	return {
		...config,
		...bizConfig,
	};
};
