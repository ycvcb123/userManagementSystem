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
	router.get("/examples/getDogs", controller.example.getDogs);
	// user 路由
	router.post("/api/users/create", controller.user.createByEmail);
	router.get("/api/users/:id", jwt, controller.user.findById);
	router.post("/api/users/login", controller.user.loginByEmail);
	router.post("/api/users/genVeriCode", controller.user.sendVeriCode);
	router.post("/api/users/loginByCellphone", controller.user.loginByCellphone);
};
