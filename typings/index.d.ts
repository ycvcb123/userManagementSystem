import "egg";
import { Connection, Model } from "mongoose";
// import { UserProps } from "../app/model/user";
declare module "egg" {
	//  这种每次都得手动添加，太费事
	// interface MongooseModels {
	// 	User: Model<UserProps>;
	// }
	interface MongooseModels extends IModel {
		[key: string]: Model<any>;
	}

	// 定义bcrypt的声明
	interface Context {
		genHash(plainText: string): Promise<string>;
		compare(plainText: string, hash: string): Promise<boolean>;
	}
	interface EggAppConfig {
		bcrypt: {
			saltRounds: number;
		};
		session: {
			bcrypt: boolean;
		};
		jwt: {
			secret: string; // 加密密钥
			match: string[]; // 这里匹配需要走json web token的路径
			expires: string | number | undefined; // 设置token过期时间
		};
		giteeOauthConfig: {
			clientID: string;
			clientSecret: string;
			redirectURL: string;
			authURL: string;
			giteeUserApi: string;
		};
	}

	interface Application {
		mongoose: Connection;
		model: MongooseModels;
		// 使用外部存储的定义
		sessionMap: {
			[key: string]: any;
		};
		sessionStore: any;
	}
}
