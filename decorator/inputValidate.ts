import { GlobalErrorTypes } from "../error/index";
import { Controller } from "egg";
// 创建工厂函数 传入 rules 和 errorType
export default function validateInput(rules: any, errorType: GlobalErrorTypes) {
	//  TypedPropertyDescriptor<(args: any) => void>
	return function (prototype, key: string, descriptor: PropertyDescriptor) {
		console.log("decorator prototype:", prototype);
		console.log("decorator key:", key);
		const originMethod = descriptor.value;
		descriptor.value = function (...args: any[]) {
			const that = this as Controller;
			// eslint-disable-next-line  @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { ctx, app } = that;
			const errors = app.validator.validate(rules, ctx.request.body);
			if (errors) {
				return ctx.helper.error({ ctx, errorType, error: errors });
			}

			return originMethod?.apply(that, args);
		};
	};
}
