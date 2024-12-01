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
		// bcrypt 方法定义
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
