import { Controller } from "egg";

// 验证规则
const userCreateRules = {
	username: "email", // 这里是 { type: "email"} 的简写
	password: { type: "password", min: 8 },
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
};

export default class UserController extends Controller {
	async createByEmail() {
		// 注意ctx.request.body 和 ctx.body 的区别 一个是请求，一个用于返回
		const { ctx, service, app } = this;

		// ctx.validate(userCreateRules); // 1. 会直接获取request.body的结果
		const errors = app.validator.validate(userCreateRules, ctx.request.body); // 2. 一般用这种验证
		if (errors) {
			ctx.logger.warn("createByEmail validate errors:", errors);
			return ctx.helper.error({ ctx, errorType: "userValidateFail", error: errors }); // 不加return还会继续执行
		}

		const { username } = ctx.request.body;
		const user = await service.user.findByUsername(username);
		if (user) {
			return ctx.helper.error({ ctx, errorType: "createUserAlreadyExists" });
		}

		const resp = await service.user.createByEmail(ctx.request.body);
		ctx.helper.success({ ctx, res: resp });
	}

	validateUserInput() {
		const { ctx } = this;
		// ctx.validate(userCreateRules); // 1. 会直接获取request.body的结果
		const errors = ctx.app.validator.validate(userCreateRules, ctx.request.body); // 2. 一般用这种验证
		if (errors) {
			ctx.logger.warn("validateUserInput errors:", errors);
			return errors;
		}
	}

	async loginByEmail() {
		const { ctx, service } = this;
		const errors = this.validateUserInput();
		if (errors) {
			return ctx.helper.error({ ctx, errorType: "userValidateFail", error: errors }); // 不加return还会继续执行
		}
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

		// 处理返回字段的过滤要在schema中配置
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
		ctx.helper.success({ ctx, res: user.toJSON(), msg: "登录成功" }); // 这里的toJSON加不加无所谓了

		/**
		 * 1. cookie的验证
		 */
		// ctx.cookies.set("username", user.username, { encrypt: true });
		/**
		 * 2. session的验证
		 */
		// ctx.session.username = user.username;
	}

	async findById() {
		const { ctx, service } = this;
		// /user/:id
		const userData = await service.user.findById(ctx.params.id);
		ctx.helper.success({ ctx, res: userData });
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
	}

	async findByUsername(username: string) {
		const { ctx, service } = this;
		// /user/:id
		const userData = await service.user.findByUsername(username);
		ctx.helper.success({ ctx, res: userData });
	}
}
