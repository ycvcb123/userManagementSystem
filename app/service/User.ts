import { Service } from "egg";
import { UserProps } from "../model/user";
import { sign } from "jsonwebtoken";
import * as $Dysmsapi from "@alicloud/dysmsapi20170525";

export default class UserService extends Service {
	public async createByEmail(payload: UserProps) {
		const { ctx } = this;
		const { username, password } = payload;
		const hash = await ctx.genHash(password);
		const userCreatedData: Partial<UserProps> = {
			username,
			password: hash,
			email: username,
		};

		return ctx.model.User.create(userCreatedData);
	}

	async findById(id: string) {
		const { ctx } = this;
		// ctx.model.xxx ts支持 （imodel里自动生成了，继承就好）
		// interface MongooseModels extends IModel {
		// 	[key: string]: Model<any>;
		// }
		return ctx.model.User.findById(id);
	}

	async findByUsername(username: string) {
		const { ctx } = this;
		return ctx.model.User.findOne({ username });
	}

	// 通过手机号登录获取json web token
	async loginByCellphone(phonenumber: string) {
		const { ctx, app } = this;
		const user = await this.findByUsername(phonenumber);
		// 检查用户是否存在
		if (user) {
			// 生成json web token
			const token = sign({ username: user.username }, app.config.jwt.secret, {
				expiresIn: app.config.jwt.expires,
			});
			return token;
		}

		// 新建用户
		const userCreatedData: Partial<UserProps> = {
			username: phonenumber,
			phoneNumber: phonenumber,
			nickName: `用户${phonenumber.slice(-4)}`,
			type: "cellphone",
		};

		const newUser = await ctx.model.User.create(userCreatedData);

		// 生成json web token
		const token = sign({ username: newUser.username }, app.config.jwt.secret, {
			expiresIn: app.config.jwt.expires,
		});

		return token;
	}

	async sendSMS({ phoneNumber = "", veriCode = "" }) {
		const { app } = this;
		const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
			signName: "enginecli",
			templateCode: "SMS_465715964",
			phoneNumbers: phoneNumber,
			templateParam: `{\"code\":\"${veriCode}\"}`,
		});

		return await app.ALClient.sendSms(sendSMSRequest);
	}
}
