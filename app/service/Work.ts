import { Service } from "egg";
import { nanoid } from "nanoid";
import { Types } from "mongoose";
import { WorkProps } from "../model/work";
import { IndexCondition } from "../controller/work";

const defaultIndexCondition: Required<IndexCondition> = {
	pageIndex: 0,
	pageSize: 10,
	select: "",
	populate: "",
	customSort: { createdAt: -1 },
	find: {},
};

export default class WorkService extends Service {
	async createEmptyWork(payload) {
		const { ctx } = this;
		const { username, _id } = ctx.state.user;

		// 拿到一个独一无二的 URL id
		const uuid = nanoid(6);
		const newEmptyWork: Partial<WorkProps> = {
			...payload,
			user: Types.ObjectId(_id),
			author: username,
			uuid,
		};
		return ctx.model.Work.create(newEmptyWork);
	}

	async getList(condition: IndexCondition) {
		const fcondition = { ...defaultIndexCondition, ...condition };
		const { pageIndex, pageSize, select, populate, customSort, find } = fcondition;
		const skip = pageIndex * pageSize;
		const res = await this.ctx.model.Work.find(find)
			.select(select)
			.populate(populate)
			.skip(skip)
			.limit(pageSize)
			.sort(customSort)
			.lean(); // lean 将查询结果转换为普通的 JavaScript 对象
		const count = await this.ctx.model.Work.find(find).count();
		return { count, list: res, pageSize, pageIndex };
	}

	async publish(id: number, isTemplate = false) {
		const { ctx } = this;
		const { H5BaseURL } = ctx.app.config;
		const payload: Partial<WorkProps> = {
			status: 2,
			latestPublishAt: new Date(),
			...(isTemplate && { isTemplate: true }),
		};
		const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true });
		return `${H5BaseURL}/p/${id}-${res?.uuid}`;
	}
}
