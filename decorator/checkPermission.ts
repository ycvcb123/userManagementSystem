import { GlobalErrorTypes } from "../error/index";
import { Controller } from "egg";
import defineRoles from "../app/roles/roles";
import { subject } from "@casl/ability";
import { permittedFieldsOf } from "@casl/ability/extra";
import { difference, assign } from "lodash/fp"; // lodash/fp 中的 assign 不会修改原件

// 处理publish这种自定义动作
interface IOptions {
	// 自定义 action
	action?: string;
	// 查找记录时候的 key，默认为 id
	key?: string;
	// 查找记录时候 value 的 来源 默认为 ctx.params
	// 来源于对应的 URL 参数 或者 ctx.request.body, valueKey 数据来源的键值
	value?: { type: "params" | "body"; valueKey: string };
}

// 这个解决类似 channel 的映射问题
interface ModelMapping {
	mongoose: string; // Work
	casl: string; // Channel
}

// 定制化问题解决
// { id: ctx.params.id }
// { 'channels.id' : ctx.params.id }
// { 'channels.id' : ctx.request.body.workID }

// permittedFieldsOf 的必填项
const fieldsOptions = { fieldsFrom: (rule) => rule.fields || [] };

const caslMethodMapping: Record<string, string> = {
	GET: "read",
	POST: "create",
	PATCH: "update",
	DELETE: "delete",
};

// userKey = "username"

const defaultSearchOptions: IOptions = {
	key: "id",
	value: { type: "params", valueKey: "id" },
};

/**
 *
 * @param modelName  model 的名称，可以是普通的字符串，也可以是 casl 和 mongoose 的映射关系
 * @param errorType 返回的错误类型，来自 GlobalErrorTypes
 * @param options 特殊配置选项，可以自定义 action 以及查询条件，详见上面的 IOptions 选项
 * @return function
 */
export default function checkPermission(
	modelName: string | ModelMapping,
	errorType: GlobalErrorTypes,
	options?: IOptions
) {
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
			// const { id } = ctx.params;

			// // no CASL
			// const userStateKeyVal = ctx.state.user[userKey];
			// const certianRecord = await ctx.model[modelName].findOne({ id });
			// if (!certianRecord || certianRecord[userKey].toString() !== userStateKeyVal) {
			// 	return ctx.helper.error({ ctx, errorType });
			// }
			// // no CASL

			// CASL
			let permission = false;
			let keyPermission = true;
			const { method } = ctx.request;
			const searchOptions = assign(defaultSearchOptions, options || {});
			const { key, value } = searchOptions;
			const { type, valueKey } = value;

			// 构建一个 query
			const source = type === "params" ? ctx.params : ctx.request.body;
			const query = {
				[key]: source[valueKey],
			};

			// 构建 modelname
			const mongooseModelName = typeof modelName === "string" ? modelName : modelName.mongoose;
			const caslModelName = typeof modelName === "string" ? modelName : modelName.casl;

			// const action = caslMethodMapping[method];
			const action = options && options.action ? options.action : caslMethodMapping[method];
			const ability = defineRoles(ctx.state.user);
			// 查找对资源的读取规则
			const rule = ability.relevantRuleFor(action, caslModelName);
			if (rule && rule.conditions) {
				const certianRecord = await ctx.model[mongooseModelName].findOne(query).lean();
				// subject(modelName, certianRecord) =>  {_id: ObjectID, copiedCount: 0, status: 2, channels: Array(2), title: '这是一个测试work', …}
				permission = ability.can(action, subject(caslModelName, certianRecord));
			} else {
				permission = ability.can(action, caslModelName);
			}

			// 判断 rule 中是否有对应的受限字段
			if (rule && rule.fields) {
				const fields = permittedFieldsOf(ability, action, caslModelName, fieldsOptions);
				if (fields.length > 0) {
					// 获取当前 payload 的 keys 和 允许的 fields 做比较
					// fields 对 payloadKeys 的关系应该是全部包含的关系
					const payloadKeys = Object.keys(ctx.request.body);
					const diffKeys = difference(payloadKeys, fields); // 输出一个数组是fields没有包含的字段
					console.log("diffKeys", diffKeys);
					keyPermission = diffKeys.length === 0;
				}
			}

			if (!permission || !keyPermission) {
				return ctx.helper.error({ ctx, errorType });
			}
			// CASL

			await originMethod.apply(this, args);
		};
	};
}
