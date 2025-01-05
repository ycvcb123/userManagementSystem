import { Application } from "egg";
import { ObjectId } from "mongoose";
const AutoIncrementFactory = require("mongoose-sequence"); // 给数据添加自增索引
import { Schema } from "mongoose";

interface ChannelProps {
	name: string;
	id: string;
}
export interface WorkProps {
	id?: number;
	uuid: string;
	title: string;
	desc: string;
	coverImg?: string;
	content?: { [key: string]: any };
	isTemplate?: boolean;
	isPublic?: boolean;
	isHot?: boolean;
	author: string;
	copiedCount: number;
	status?: 0 | 1 | 2;
	user: ObjectId;
	latestPublishAt?: Date;
	channels?: ChannelProps[];
}

function initWorkModel(app: Application) {
	const mongoose = app.mongoose;
	const AutoIncrement = AutoIncrementFactory(mongoose);
	const WorkSchema = new Schema<WorkProps>(
		{
			uuid: { type: String, unique: true },
			title: { type: String, required: true },
			desc: { type: String },
			coverImg: { type: String },
			content: { type: Object },
			isTemplate: { type: Boolean },
			isPublic: { type: Boolean },
			isHot: { type: Boolean },
			author: { type: String, required: true },
			copiedCount: { type: Number, default: 0 },
			status: { type: Number, default: 1 },
			user: { type: Schema.Types.ObjectId, ref: "User" },
			channels: { type: Array },
			latestPublishAt: { type: Date },
		},
		{ timestamps: true }
	);
	WorkSchema.plugin(AutoIncrement, { inc_field: "id", id: "works_id_counter" });
	return mongoose.model<WorkProps>("Work", WorkSchema);
}

export default initWorkModel;
