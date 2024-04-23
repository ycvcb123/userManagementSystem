import { Application } from "egg";
// import axios, { AxiosInstance } from "axios";
import Dysmsapi from "@alicloud/dysmsapi20170525";
import * as $OpenApi from "@alicloud/openapi-client";
// const AXIOS = Symbol("Application#axios");
const ALCLIENT = Symbol("Application#ALClient");

export default {
	get ALClient(): Dysmsapi {
		const that = this as Application;
		console.log(that.config.aliCloudConfig);
		const { accessKeyId, accessKeySecret, endpoint } = that.config.aliCloudConfig;
		if (!this[ALCLIENT]) {
			const config = new $OpenApi.Config({
				accessKeyId,
				accessKeySecret,
			});
			config.endpoint = endpoint;
			this[ALCLIENT] = new Dysmsapi(config);
		}
		return this[ALCLIENT];
	},
};
