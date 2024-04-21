import { Service } from "egg";
import { UserProps } from "../model/user";

export default class UserService extends Service {
	public async createByEmail(payload: UserProps) {
		const { ctx } = this;
		const { username, password } = payload;
		const hash = await ctx.genHash(password);
		const userCreatedData: Partial<UserProps> = {
			username,
			password: hash,
			email: username,
		};

		return ctx.model.User.create(userCreatedData);
	}

	async findById(id: string) {
		const { ctx } = this;
		return ctx.model.User.findById(id);
	}

	async findByUsername(username: string) {
		const { ctx } = this;
		return ctx.model.User.findOne({ username });
	}
}
