import { Controller } from "egg";
// verify
import { sign } from "jsonwebtoken";
import inputValidate from "../../decorator/inputValidate";
import checkPermission from "../../decorator/checkPermission";

// 验证规则
const userCreateRules = {
	username: "email", // 这里是 { type: "email"} 的简写
	password: { type: "password", min: 8 },
};

const sendCodeRules = {
	phoneNumber: { type: "string", format: /^1[3-9]\d{9}$/, message: "手机号码格式错误" },
};

/**
 * 错误码管理
 * 统一格式：A-BB-CCC
 * A:错误级别，如1代表系统级错误，2代表服务级错误
 * B:项目或模块名称，一般公司不会超过99个项目，这里使用 01 代表用户模块。
 * C:具体错误编号，自增即可，一个项目999种错误应该够用
 * */
export const userErrorMessages = {
	userValidateFail: {
		errno: 101001, // 1系统级错误/01第一个模块/001第一类错误
		message: "用户信息验证失败",
	},
	createUserAlreadyExists: {
		errno: 101002,
		message: "该邮箱已被注册，请直接登录",
	},
	loginCheckFailInfo: {
		errno: 101003,
		message: "用户不存在或者密码校验错误",
	},
	loginValidateFail: {
		errno: 101004,
		message: "登录校验失败",
	},
	phoneValidateFail: {
		errno: 101005,
		message: "手机号输入错误",
	},
	phoneValidateFrequentlyFail: {
		errno: 101006,
		message: "请勿频繁获取短信验证码",
	},
	phoneValidateVeriCodeFail: {
		errno: 101007,
		message: "验证码错误",
	},
	// gitee授权错误
	giteeAuothFail: {
		errno: 101008,
		message: "gitee授权登录失败",
	},
	// 验证码发送失败
	sendVeriCodeError: {
		errno: 101009,
		message: "验证码发送失败",
	},
};

export default class UserController extends Controller {
	@inputValidate(userCreateRules, "userValidateFail")
	async createByEmail() {
		// 注意ctx.request.body 和 ctx.body 的区别 一个是请求，一个用于返回
		const { ctx, service } = this;

		/**
		 * 1. 会直接获取request.body的结果
		 * */
		// ctx.validate(userCreateRules);

		/**
		 * 2. 一般用这种验证
		 * */
		// const errors = ctx.app.validator.validate(userCreateRules, ctx.request.body);
		// if (errors) {
		// 	ctx.logger.warn("createByEmail validate errors:", errors);
		// 	return ctx.helper.error({ ctx, errorType: "userValidateFail", error: errors }); // 不加return还会继续执行
		// }

		/**
		 * 3. 改用装饰器 @inputValidate(userCreateRules, "userValidateFail")
		 * */

		const { username } = ctx.request.body;
		const user = await service.user.findByUsername(username);
		if (user) {
			return ctx.helper.error({ ctx, errorType: "createUserAlreadyExists" });
		}

		const resp = await service.user.createByEmail(ctx.request.body);
		ctx.helper.success({ ctx, res: resp });
	}

	validateUserInput(rule: any) {
		const { ctx } = this;
		// ctx.validate(userCreateRules); // 1. 会直接获取request.body的结果
		const errors = ctx.app.validator.validate(rule, ctx.request.body); // 2. 一般用这种验证
		if (errors) {
			ctx.logger.warn("validateUserInput errors:", errors);
			return errors;
		}
	}

	@inputValidate(userCreateRules, "userValidateFail")
	async loginByEmail() {
		const { ctx, service } = this;

		/**
		 * 统一切换成 装饰器的方式了，不用下面这种写法
		 * */
		// const errors = this.validateUserInput(userCreateRules);
		// if (errors) {
		// 	return ctx.helper.error({ ctx, errorType: "userValidateFail", error: errors });
		// }
		// 根据username取得用户信息
		const { username, password } = ctx.request.body;
		const user = await service.user.findByUsername(username);
		if (!user) {
			return ctx.helper.error({ ctx, errorType: "loginCheckFailInfo" });
		}

		// bcrypt 自行比较
		const verifyPwd = await ctx.compare(password, user.password);

		// 验证密码是否成功
		if (!verifyPwd) {
			return ctx.helper.error({ ctx, errorType: "loginCheckFailInfo" });
		}

		/**
		 * 0. 正常的验证登录
		 * */
		// delete user.password; const user: (UserProps & Document<any, any, UserProps>) | null; Docment 不是一个普通的对象不能直接删除
		// 第一种方式（很麻烦）
		// const userObj = user.toJSON(); 转成一个普通对象
		// delete userObj.password;
		// 第二种方式在model里处理（一劳永逸）
		// 做一个转化，删除一些不需要的返回的字段
		// toJSON: {
		// 	transform(_doc, ret) {
		// 		delete ret.password;
		// 		delete ret.__v;
		// 	},
		// },
		// ctx.helper.success({ ctx, res: user.toJSON(), msg: "登录成功" }); // 这里的toJSON加不加无所谓了

		/**
		 * 1. cookie的验证
		 */
		// ctx.cookies.set("username", user.username);
		// ctx.cookies.set("username", user.username, { encrypt: true });
		/**
		 * 2. session的验证
		 */
		// ctx.session.username = user.username;
		/**
		 * 3. json web token 的验证
		 * registered claims 注册相关信息
		 * public claims 公共信息： should be unique like email, address or phone_number
		 */
		const { app } = this;
		const token = sign({ username: user.username, _id: user._id }, app.config.jwt.secret, {
			expiresIn: app.config.jwt.expires,
		});

		ctx.helper.success({ ctx, res: { token }, msg: "登录成功" });
	}

	@checkPermission("User", "workNoPermissonFail", "_id")
	async findById() {
		/**
		 * 0. 正常根据user的id进行查找
		 * */
		// const { ctx, service } = this;
		// // /user/:id
		// const userData = await service.user.findById(ctx.params.id);
		// ctx.helper.success({ ctx, res: userData });
		/**
		 * 1. cookie 的验证
		 * */
		// const { ctx } = this;
		// const userData = ctx.cookies.get("username"); // { encrypt: true }
		// ctx.helper.success({ ctx, res: userData });
		/**
		 * 2. session的验证
		 */
		// const { ctx } = this;
		// const userData = ctx.session.username; // { encrypt: true }
		// if (!userData) {
		// 	return ctx.helper.error({ ctx, errorType: "loginValidateFail" });
		// }
		// ctx.helper.success({ ctx, res: userData });
		/**
		 * 3. json web token 的验证
		 * jwt Header 格式
		 * authorization: Bearer tokenxxx
		 */
		// const { ctx, app } = this;
		// const token = this.getTokenValue();
		// if (!token) {
		// 	return ctx.helper.error({ ctx, errorType: "loginValidateFail" });
		// }
		// try {
		// 	const decoded = verify(token, app.config.jwt.secret);
		// 	ctx.helper.success({ ctx, res: decoded });
		// } catch (err) {
		// 	return ctx.helper.error({ ctx, errorType: "loginValidateFail", error: err });
		// }

		/**
		 * 4. 使用中间件直接取值
		 * */
		const { ctx } = this;
		ctx.logger.info("ctx.state.user:", ctx.state.user);
		const userData = await ctx.service.user.findByUsername(ctx.state.user.username);
		ctx.helper.success({ ctx, res: userData });
	}

	async show() {
		const { ctx } = this;
		ctx.logger.info("ctx.state.user:", ctx.state.user);
		const userData = await ctx.service.user.findByUsername(ctx.state.user.username);
		ctx.helper.success({ ctx, res: userData });
	}

	// 已经迁移至middleware
	// getTokenValue() {
	// 	const { ctx } = this;
	// 	const { authorization } = ctx.header;
	// 	// 没有header或者authorization直接返回false
	// 	if (!ctx.header || !authorization) {
	// 		return false;
	// 	}
	// 	if (typeof authorization === "string") {
	// 		const parts = authorization.trim().split(" ");
	// 		if (parts.length === 2) {
	// 			const scheme = parts[0];
	// 			if (/^Bearer$/i.test(scheme)) {
	// 				return parts[1];
	// 			}
	// 			return false;
	// 		}
	// 		return false;
	// 	}
	// 	return false;
	// }

	async findByUsername(username: string) {
		const { ctx, service } = this;
		// /user/:id
		const userData = await service.user.findByUsername(username);
		ctx.helper.success({ ctx, res: userData });
	}

	// 通过手机号发送验证码
	@inputValidate(sendCodeRules, "phoneValidateFail")
	async sendVeriCode() {
		const { ctx, app } = this;
		const { phoneNumber } = ctx.request.body;

		/**
		 * 统一切换成装饰器校验了
		 */
		// const errors = this.validateUserInput(sendCodeRules);
		// if (errors) {
		// 	return ctx.helper.error({ ctx, errorType: "phoneValidateFail", error: errors });
		// }

		// 从redis中取数据 phoneVeriCode-13456453234
		const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);

		if (preVeriCode) {
			return ctx.helper.error({ ctx, errorType: "phoneValidateFrequentlyFail" });
		}

		/**
		 *  生成一个4位的随机数
		 * [0 - 1) * 9000 + 1000 = [0 - 9000) + 1000 = [1000 - 10000)
		 * */
		const veriCode = Math.floor(Math.random() * 9000 + 1000).toString();
		await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, "ex", 60); // ex:60 设置过期时间是60s

		if (app.config.env === "prod") {
			// 向用户发送短信
			try {
				const res = await ctx.service.user.sendSMS({ phoneNumber, veriCode });
				if (res.body.code !== "OK") {
					return ctx.helper.error({ ctx, errorType: "sendVeriCodeError" });
				}
			} catch (err) {
				return ctx.helper.error({ ctx, errorType: "sendVeriCodeError", error: err });
			}
		}

		// 生产环境验证码通过短信发送就不返回了
		ctx.helper.success({ ctx, res: app.config.env === "prod" ? "" : { veriCode }, msg: "验证码发送成功" });
	}

	// 通过手机号验证码登录
	@inputValidate(sendCodeRules, "phoneValidateFail")
	async loginByCellphone() {
		const { ctx, app } = this;
		const { phoneNumber, veriCode } = ctx.request.body;
		// // 先校验下手机号是否合法
		// const error = this.validateUserInput(sendCodeRules);
		// if (error) {
		// 	return ctx.helper.error({ ctx, errorType: "phoneValidateFail", error });
		// }

		// 然后根据手机号从redis中拿到对应的验证码，和当前传入的验证码做比较
		const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);

		if (preVeriCode !== veriCode) {
			return ctx.helper.error({ ctx, errorType: "phoneValidateVeriCodeFail" });
		}

		// 如果手机号和验证码的校验通过了，就生成token返回给用户
		const token = await ctx.service.user.loginByCellphone(phoneNumber);

		return ctx.helper.success({ ctx, res: token });
	}

	// Oauth2
	async oauth() {
		const { app, ctx } = this;
		const { clientID, redirectURL } = app.config.giteeOauthConfig;
		ctx.redirect(
			`https://gitee.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURL}&response_type=code`
		);
	}

	// oauth by gitee
	async oauthByGitee() {
		const { ctx } = this;
		const { code } = ctx.request.query;
		try {
			// const resp = await ctx.service.user.getAccessToken(code);
			const token = await ctx.service.user.loginByGitee(code);
			if (token) {
				// 前后端一起的情况
				// ctx.helper.success({ ctx, res: { token } });
				// 前后端分离的情况（用postmessage做传递）
				await ctx.render("oauth-success.tpl", { token });
			} else {
				return ctx.helper.error({ ctx, errorType: "giteeAuothFail" });
			}
		} catch (err) {
			return ctx.helper.error({ ctx, errorType: "giteeAuothFail", error: err });
		}
	}
}
