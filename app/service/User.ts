import { Service } from "egg";
import { UserProps } from "../model/user";
import { sign } from "jsonwebtoken";
import * as $Dysmsapi from "@alicloud/dysmsapi20170525";

interface GiteeUserResp {
	id: number;
	login: string;
	name: string;
	avatar_url: string;
	email: string;
}

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
		return ctx.model.User.findById(id);
	}

	async findAll() {
		const { ctx } = this;
		return ctx.model.User.find();
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
			const token = sign({ username: user.username, _id: user._id }, app.config.jwt.secret, {
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
		const token = sign({ username: newUser.username, _id: newUser._id }, app.config.jwt.secret, {
			expiresIn: app.config.jwt.expires,
		});

		return token;
	}

	async sendSMS({ phoneNumber = "", veriCode = "" }) {
		const { app } = this;
		const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
			signName: "阿里云短信测试",
			templateCode: "SMS_154950909",
			phoneNumbers: phoneNumber,
			templateParam: `{\"code\":\"${veriCode}\"}`,
		});

		return await app.ALClient.sendSms(sendSMSRequest);
	}

	async getAccessToken(code: string) {
		const { ctx, app } = this;
		const { clientID, clientSecret, redirectURL, authURL } = app.config.giteeOauthConfig;
		console.log("giteeOauthConfig::", app.config.giteeOauthConfig);
		// 原始的获取token的请求 "https://gitee.com/oauth/token?grant_type=authorization_code&code={code}&client_id={client_id}&redirect_uri={redirect_uri}&client_secret={client_secret}"
		const { data } = await ctx.curl(authURL, {
			method: "POST",
			contentType: "json",
			dataType: "json",
			data: {
				code,
				client_id: clientID,
				client_secret: clientSecret,
				redirect_uri: redirectURL,
			},
		});

		app.logger.info("getAccessToken data: ", data);

		return data.access_token;
	}

	// get user data
	async getGiteeUserData(access_token: string) {
		const { ctx, app } = this;
		const { giteeUserApi } = app.config.giteeOauthConfig;
		const { data } = await ctx.curl<GiteeUserResp>(`${giteeUserApi}?access_token=${access_token}`, {
			dataType: "json",
		});
		return data;
	}

	async loginByGitee(code: string) {
		const { ctx, app } = this;
		const access_token = await this.getAccessToken(code);
		const user = await ctx.service.user.getGiteeUserData(access_token);
		// 查询用户信息是否存在
		const { id, avatar_url, name, email } = user;
		const idStr = id.toString();
		// 不同的平台id可能会相同，加个前缀 gitee + id
		const existUser = await this.findByUsername(`Gitee${idStr}`);

		if (existUser) {
			const token = sign({ username: existUser.username, _id: existUser._id }, app.config.jwt.secret, {
				expiresIn: app.config.jwt.expires,
			});
			return token;
		}

		// 新建用户
		const userCreatedData: Partial<UserProps> = {
			oauthID: idStr,
			oauthProvider: "gitee",
			username: `Gitee${idStr}`,
			picture: avatar_url,
			nickName: name,
			email,
			type: "oauth",
		};

		const newUser = await ctx.model.User.create(userCreatedData);

		// 生成json web token
		const token = sign({ username: newUser.username, _id: newUser._id }, app.config.jwt.secret, {
			expiresIn: app.config.jwt.expires,
		});

		return token;
	}
}
