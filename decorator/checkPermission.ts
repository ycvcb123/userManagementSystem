import { GlobalErrorTypes } from "../error/index";
import { Controller } from "egg";

export default function checkPermission(modelName: string, errorType: GlobalErrorTypes, userKey = "username") {
	return function (prototype, key: string, descriptor: PropertyDescriptor) {
		console.log("decorator prototype:", prototype);
		console.log("decorator key:", key);
		console.log(modelName);
		const originMethod = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			const that = this as Controller;
			// eslint-disable-next-line  @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { ctx } = that;
			const { id } = ctx.params;
			// const userId = ctx.state.user._id;
			const userStateKeyVal = ctx.state.user[userKey];

			const certianRecord = await ctx.model[modelName].findOne({ id });
			console.log("certianRecord:::", certianRecord);

			if (!certianRecord || certianRecord[userKey].toString() !== userStateKeyVal) {
				return ctx.helper.error({ ctx, errorType });
			}

			await originMethod.apply(this, args);
		};
	};
}
