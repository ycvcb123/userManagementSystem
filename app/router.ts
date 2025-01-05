import { Application } from "egg";

export default (app: Application) => {
	const { controller, router } = app;

	// 1. 用我们自己的中间件
	const jwt = app.middleware.jwt({
		secret: app.config.jwt.secret,
		match: [],
		expires: "2h",
	});

	router.redirect("/", "/examples");
	router.get("/examples", controller.example.index);
	router.get("/examples/ping", controller.example.ping);
	router.get("/examples/getDogs", controller.example.getDogs);
	// user 路由
	router.post("/api/users/create", controller.user.createByEmail);
	router.get("/api/users/:id", jwt, controller.user.findById);
	// loginByEmail
	router.post("/api/users/login", controller.user.loginByEmail);
	router.post("/api/users/genVeriCode", controller.user.sendVeriCode);
	router.post("/api/users/loginByCellphone", controller.user.loginByCellphone);

	router.get("/api/users/passport/gitee", controller.user.oauth);

	router.get("/api/users/gitee/oauth/callback", controller.user.oauthByGitee);

	router.get("/api/users/userInfo", jwt, controller.user.show);

	// works
	router.post("/api/works", jwt, controller.work.createWork);
	router.get("/api/works", jwt, controller.work.myList);
	router.get("/api/templates", controller.work.templateList);
	router.patch("/api/works/:id", jwt, controller.work.update);
	router.delete("/api/works/:id", jwt, controller.work.delete);
	router.post("/api/works/publish/:id", jwt, controller.work.publishWork);
	router.post("/api/works/publish-template/:id", jwt, controller.work.publishTemplate);
};
