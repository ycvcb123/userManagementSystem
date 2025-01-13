import { Context } from "egg";

export default function xframe(): any {
	return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
		ctx.set("X-Frame-Options", "ALLOW-FROM http://127.0.0.1:8080");
		await next();
	};
}
