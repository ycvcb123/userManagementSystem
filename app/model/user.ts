import { Application } from "egg";
import { Schema } from "mongoose";
// import * as AutoIncrementFactory from "mongoose-sequence"; // 给数据添加自增索引
const AutoIncrementFactory = require("mongoose-sequence");

export interface UserProps {
	username: string;
	password: string;
	email?: string;
	nickName?: string;
	picture?: string;
	phoneNumber?: string;
	createdAt: Date;
	updatedAt: Date;
}

function initUserModel(app: Application) {
	const AutoIncrement = AutoIncrementFactory(app.mongoose);
	const UserSchema = new Schema<UserProps>(
		{
			username: { type: String, unique: true, required: true },
			password: { type: String, required: true },
			email: { type: String },
			nickName: { type: String },
			picture: { type: String },
			phoneNumber: { type: String },
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

	UserSchema.plugin(AutoIncrement, { inc_field: "id", id: "users_id_counter" });

	return app.mongoose.model<UserProps>("User", UserSchema);
}

export default initUserModel;
