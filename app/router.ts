import { Application } from "egg";

export default (app: Application) => {
	const { controller, router } = app;

	router.redirect("/", "/examples");
	router.get("/examples", controller.example.index);
	router.get("/examples/getDogs", controller.example.getDogs);
	// user 路由
	router.post("/api/users/create", controller.user.createByEmail);
	router.get("/api/users/:id", controller.user.findById);
	router.post("/api/users/login", controller.user.loginByEmail);
};
