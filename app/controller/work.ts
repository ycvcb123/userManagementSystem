import { Controller } from "egg";
// verify
// import { sign } from "jsonwebtoken";
import inputValidate from "../../decorator/inputValidate";
import checkPermission from "../../decorator/checkPermission";

const workCreateRules = {
	title: "string",
};

export interface IndexCondition {
	pageIndex?: number;
	pageSize?: number;
	select?: string | string[]; // 选择哪些字段
	populate?: { path?: string; select?: string } | string; // 聚合功能
	customSort?: Record<string, any>;
	find?: Record<string, any>; // 查询条件
}

export const workErrorMessages = {
	workValidateFail: {
		errno: 102001,
		message: "输入信息验证失败",
	},
};

export default class WorkController extends Controller {
	// 创建作品
	@inputValidate(workCreateRules, "workValidateFail")
	async createWork() {
		const { ctx, service } = this;
		const workData = await service.work.createEmptyWork(ctx.request.body);
		ctx.helper.success({ ctx, res: workData });
	}

	// 作品列表
	@checkPermission("User", "workNoPermissonFail")
	async myList() {
		const { ctx } = this;
		const { pageIndex, pageSize, isTemplate, title } = ctx.query;
		const userId = ctx.state.user._id;

		const findConditon = {
			user: userId,
			...(title && { title: { $regex: title, $options: "i" } }),
			...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
		};

		const listCondition: IndexCondition = {
			select: "id author copiedCount coverImg desc title user isHot createdAt",
			populate: { path: "user", select: "username nickName picture" },
			find: findConditon,
			...(pageIndex && { pageIndex: parseInt(pageIndex) }),
			...(pageSize && { pageSize: parseInt(pageSize) }),
		};

		const res = await ctx.service.work.getList(listCondition);
		ctx.helper.success({ ctx, res });
	}

	// 查询模版列表
	async templateList() {
		const { ctx } = this;
		const { pageIndex, pageSize } = ctx.query;
		const listCondition: IndexCondition = {
			select: "id author copiedCount coverImg desc title user isHot createdAt",
			populate: { path: "user", select: "username nickName picture" },
			find: { isPublic: true, isTemplate: true },
			...(pageIndex && { pageIndex: parseInt(pageIndex) }),
			...(pageSize && { pageSize: parseInt(pageSize) }),
		};
		const res = await ctx.service.work.getList(listCondition);
		ctx.helper.success({ ctx, res });
	}

	// async checkPermission(id: number) {
	// 	const { ctx } = this;
	// 	const userId = ctx.state.user._id;
	// 	const certWork = await ctx.model.Work.findOne({ id });
	// 	if (!certWork) {
	// 		return false;
	// 	}

	// 	return certWork.user.toString() === userId;
	// }

	@checkPermission("User", "workNoPermissonFail")
	async update() {
		const { ctx } = this;
		const { id } = ctx.params;

		// const permission = await this.checkPermission(id);
		// if (!permission) {
		// 	return ctx.helper.error({ ctx, errorType: "workNoPermissonFail" });
		// }

		const payload = ctx.request.body;
		const res = await this.ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true }).lean();
		ctx.helper.success({ ctx, res });
	}

	@checkPermission("User", "workNoPermissonFail")
	async delete() {
		const { ctx } = this;
		const { id } = ctx.params;

		// const permission = await this.checkPermission(id);
		// if (!permission) {
		// 	return ctx.helper.error({ ctx, errorType: "workNoPermissonFail" });
		// }

		const res = await this.ctx.model.Work.findOneAndDelete({ id }).select("_id id title").lean();
		ctx.helper.success({ ctx, res });
	}

	@checkPermission("User", "workNoPermissonFail")
	async publish(isTemplate: boolean) {
		const { ctx } = this;
		const url = await this.service.work.publish(ctx.params.id, isTemplate);
		ctx.helper.success({ ctx, res: { url } });
	}

	async publishWork() {
		await this.publish(false);
	}
	async publishTemplate() {
		await this.publish(true);
	}
}
