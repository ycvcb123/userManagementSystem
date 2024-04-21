import { Controller } from "egg";

export default class ExampleController extends Controller {
	public async index() {
		const { ctx, service } = this;
		const resp = await service.example.show();
		ctx.helper.success({
			ctx,
			res: {
				resp,
			},
		});
	}

	async getDogs() {
		const { ctx, service } = this;
		const resp = await service.example.show();
		await ctx.render("example.tpl", { url: resp.message });
	}
}
