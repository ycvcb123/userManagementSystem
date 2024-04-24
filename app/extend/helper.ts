import { Context } from "egg";
// import { userErrorMessages } from "../controller/user";
import { globalErrorMessage } from "../../error/index";

interface RespType {
	ctx: Context;
	res?: any;
	msg?: string;
}

// interface ErrorRespType {
// 	ctx: Context;
// 	errno: number;
// 	msg?: string;
// }

interface ErrorRespType {
	ctx: Context;
	errorType: keyof typeof globalErrorMessage;
	error?: any;
}

export default {
	success({ ctx, res, msg }: RespType) {
		ctx.body = {
			errno: 0,
			data: res ? res : null,
			message: msg ? msg : "请求成功",
		};
		ctx.status = 200;
	},
	error({ ctx, errorType, error }: ErrorRespType) {
		const { message, errno } = globalErrorMessage[errorType];
		ctx.body = {
			errno,
			message: message ? message : "请求失败",
			...(error && { error }),
		};
		ctx.status = 200;
	},
};
