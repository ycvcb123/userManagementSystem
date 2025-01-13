import { Controller } from "egg";
// verify
// import { sign } from "jsonwebtoken";
import inputValidate from "../../decorator/inputValidate";
import checkPermission from "../../decorator/checkPermission";
import { nanoid } from "nanoid";

const workCreateRules = {
	title: "string",
};

const channelCreateRules = {
	name: "string",
	workId: "number",
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
	// 创建渠道
	@inputValidate(channelCreateRules, "channelValidateFail")
	@checkPermission({ casl: "Channel", mongoose: "Work" }, "workNoPermissonFail", {
		value: { type: "body", valueKey: "workId" },
	})
	async createChannel() {
		const { ctx } = this;
		const { name, workId } = ctx.request.body;
		const newChannel = {
			name,
			id: nanoid(6),
		};
		const res = await ctx.model.Work.findOneAndUpdate({ id: workId }, { $push: { channels: newChannel } });
		if (res) {
			ctx.helper.success({ ctx, res: newChannel });
		} else {
			ctx.helper.error({ ctx, errorType: "channelOperateFail" });
		}
	}

	// 获取作品频道
	@checkPermission({ casl: "Channel", mongoose: "Work" }, "workNoPermissonFail")
	async getWorkChannel() {
		const { ctx } = this;
		const { id } = ctx.params;
		const certianWork = await ctx.model.Work.findOne({ id });
		if (certianWork) {
			const { channels } = certianWork;
			ctx.helper.success({ ctx, res: { count: (channels && channels.length) || 0, list: channels || [] } });
		} else {
			ctx.helper.error({ ctx, errorType: "channelOperateFail" });
		}
	}

	// 更新频道名称
	@checkPermission({ casl: "Channel", mongoose: "Work" }, "workNoPermissonFail", { key: "channels.id" })
	async updateChannelName() {
		const { ctx } = this;
		const { id } = ctx.params;
		const { name } = ctx.request.body;
		const res = await ctx.model.Work.findOneAndUpdate({ "channels.id": id }, { $set: { "channels.$.name": name } });
		if (res) {
			ctx.helper.success({ ctx, res: { name } });
		} else {
			ctx.helper.error({ ctx, errorType: "channelOperateFail" });
		}
	}

	// 删除频道
	@checkPermission({ casl: "Channel", mongoose: "Work" }, "workNoPermissonFail", { key: "channels.id" })
	async deleteChannel() {
		const { ctx } = this;
		const { id } = ctx.params;
		const work = await ctx.model.Work.findOneAndUpdate(
			{ "channels.id": id },
			{ $pull: { channels: { id } } }, // 删除channels中id符合的选项
			{ new: true } // 返回更新前的数据还是更新后的数据
		);
		if (work) {
			ctx.helper.success({ ctx, res: work });
		} else {
			ctx.helper.error({ ctx, errorType: "channelOperateFail" });
		}
	}

	// 创建作品
	@inputValidate(workCreateRules, "workValidateFail")
	@checkPermission("Work", "workNoPermissonFail")
	async createWork() {
		const { ctx, service } = this;
		const workData = await service.work.createEmptyWork(ctx.request.body);
		ctx.helper.success({ ctx, res: workData });
	}

	// 作品列表
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

	@checkPermission("Work", "workNoPermissonFail")
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

	@checkPermission("Work", "workNoPermissonFail")
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

	@checkPermission("Work", "workNoPermissonFail", { action: "publish" })
	async publish(isTemplate: boolean) {
		const { ctx } = this;
		const url = await this.service.work.publish(ctx.params.id, isTemplate);
		ctx.helper.success({ ctx, res: { url } });
	}

	@checkPermission("Work", "workNoPermissonFail")
	async myWork() {
		const { ctx } = this;
		const { id } = ctx.params;
		const res = await this.ctx.model.Work.findOne({ id }).lean();
		ctx.helper.success({ ctx, res });
	}

	async publishWork() {
		await this.publish(false);
	}
	async publishTemplate() {
		await this.publish(true);
	}
}
