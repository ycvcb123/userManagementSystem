import { Controller } from "egg";
import { version as appVersion } from "../../package.json";

export default class ExampleController extends Controller {
	public async index() {
		const { ctx, service } = this;
		const resp = await service.user.findAll();
		ctx.helper.success({
			ctx,
			res: {
				resp,
			},
		});
	}

	public async linkRedis() {
		const { ctx, app } = this;
		const { status } = ctx.app.redis;
		// 拿到mongo的版本
		// @ts-ignore
		const { version } = await ctx.app.mongoose.connection.db.command({ buildInfo: 1 });
		ctx.helper.success({
			ctx,
			res: {
				dbVersion: version,
				redisStatus: status,
				appVersion,
				env: process.env.PING_ENV,
				config: app.config.baseUrl,
				hello: "hello",
			},
		});
	}

	async getDogs() {
		const { ctx, service } = this;
		const resp = await service.example.show();
		await ctx.render("example.tpl", { url: resp.message });
	}
}
