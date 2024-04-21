import { Application } from "egg";

export default (app: Application) => {
	const { controller, router } = app;

	router.redirect("/", "/examples");
	router.get("/examples", controller.example.index);
	router.get("/examples/getDogs", controller.example.getDogs);
};
