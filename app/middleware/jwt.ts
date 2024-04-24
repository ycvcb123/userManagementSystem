import { Context, EggAppConfig } from "egg";
import { verify } from "jsonwebtoken";

function getTokenValue(ctx: Context) {
	const { authorizatiion } = ctx.header;
	// 没有header或者authorization直接返回false
	if (!ctx.header || !authorizatiion) {
		return false;
	}
	if (typeof authorizatiion === "string") {
		const parts = authorizatiion.trim().split(" ");
		if (parts.length === 2) {
			const scheme = parts[0];
			if (/^Bearer$/i.test(scheme)) {
				return parts[1];
			}
			return false;
		}
		return false;
	}
	return false;
}

export default (options: EggAppConfig["jwt"]) => {
	return async (ctx: Context, next: () => Promise<any>) => {
		const { secret } = options;
		ctx.logger.info("requestPath:", ctx.request.path);
		// const isMatch = match.find((item) => ctx.request.path.includes(item)) || true;
		// if (!isMatch) {
		// 	await next();
		// } else {

		// }
		// 从 header 获取对应的 token
		const token = getTokenValue(ctx);
		ctx.logger.info("token:", token);
		if (!token) {
			return ctx.helper.error({ ctx, errorType: "loginValidateFail" });
		}
		// 密钥必须存在
		if (!secret) {
			throw new Error("Secret not provided");
		}

		try {
			const decoded = verify(token, secret);
			// ctx.logger.info("decoded:", decoded);
			ctx.state.user = decoded; // ctx 有个state 在中间件传递信息，把信息传递给模版 koa2 推荐的命名空间
			await next();
		} catch (e) {
			return ctx.helper.error({ ctx, errorType: "loginValidateFail" });
		}
	};
};
