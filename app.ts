import { IBoot, Application } from "egg";
// import * as assert from "assert";
// import { createConnection } from "mongoose";
// import { join } from "path";

export default class AppBoot implements IBoot {
	private readonly app: Application;
	constructor(app: Application) {
		this.app = app;
	}

	/**
	 * 配置文件即将加载，这是最后动态修改配置的时机（configWillLoad）同步
	 */
	configWillLoad() {
		console.log("configWillLoad -> baseUrl:", this.app.config.baseUrl);
		console.log("configWillLoad -> enable middleware:", this.app.config.coreMiddleware); // coreMiddleware 内置中间件
	}

	// /**
	//  * 配置插件加载完成（configDidLoad）同步
	//  */
	// configDidLoad() {}

	// /**
	//  * 文件加载完成（didLoad）异步
	//  */
	// async didLoad() {}

	/**
	 * 插件启动完毕（willReady）异步
	 */
	// async willReady() {
	// 	console.log("willReady -> enable middleware:", this.app.config.coreMiddleware);
	// 	const dir = join(this.app.config.baseDir, "app/model");
	// 	this.app.loader.loadToApp(dir, "model", {
	// 		caseStyle: "upper",
	// 	});
	// }

	/**
	 * 应用已经启动完毕 （didReady）异步
	 */
	// async didReady() {
	// 	const ctx = await this.app.createAnonymousContext();
	// 	const res = await ctx.service.test.sayHi("winson");
	// 	console.log("did ready res", res);
	// 	console.log("final middlewares", this.app.middleware);
	// }

	// /**
	//  * http / https server 已启动 开始接受外部请求（serverDidReady）
	//  */
	// async serverDidReady() {}

	// /**
	//  * Do some thing before app close
	//  */
	// async beforeClose() {}
}
