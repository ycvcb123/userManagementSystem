import { Application } from "egg";
import { Schema } from "mongoose";
// import * as AutoIncrementFactory from "mongoose-sequence";
const AutoIncrementFactory = require("mongoose-sequence"); // 给数据添加自增索引

export interface UserProps {
	username: string;
	password: string;
	email?: string;
	nickName?: string;
	picture?: string;
	phoneNumber?: string;
	createdAt: Date;
	updatedAt: Date;
	type: "email" | "cellphone";
}

function initUserModel(app: Application) {
	const AutoIncrement = AutoIncrementFactory(app.mongoose);
	const UserSchema = new Schema<UserProps>(
		{
			username: { type: String, unique: true, required: true },
			password: { type: String },
			email: { type: String },
			nickName: { type: String },
			picture: { type: String },
			phoneNumber: { type: String },
			type: { type: String, default: "email" },
		},
		{
			timestamps: true,
			// 做一个转化，删除一些不需要的返回的字段
			toJSON: {
				transform(_doc, ret) {
					delete ret.password;
					delete ret.__v;
				},
			},
		}
	);

	UserSchema.plugin(AutoIncrement, { inc_field: "id", id: "users_id_counter" }); // inc_field 自增的名称， id 特殊的id，避免和其它schema自增插件相混淆

	return app.mongoose.model<UserProps>("User", UserSchema);
}

export default initUserModel;
