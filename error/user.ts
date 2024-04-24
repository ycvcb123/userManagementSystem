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
