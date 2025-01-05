import { Controller } from "egg";
import { nanoid } from "nanoid";
import { join, extname } from "path";
import * as sendToWormhole from "stream-wormhole";
import { createWriteStream } from "fs";
import Busboy from "busboy";
import { FileStream } from "../../typings/app";

export default class UtilsController extends Controller {
	async uploadToOSS() {
		const { ctx } = this;
		const stream = await ctx.getFileStream();
		const savedOSSPath = join("low-code-upload", nanoid(6) + extname(stream.filename));
		try {
			const result = await ctx.oss.put(savedOSSPath, stream);
			const { name, url } = result;
			ctx.helper.success({ ctx, res: { name, url } });
		} catch (e) {
			await sendToWormhole(stream);
			ctx.helper.error({ ctx, errorType: "imageUploadFail" });
		}
	}

	uploadFileUseBusBoy() {
		const { ctx, app } = this;
		return new Promise<string[]>((resolve) => {
			const busboy = new Busboy({ headers: ctx.req.headers as any });
			const results: string[] = [];
			busboy.on("file", (fieldname, file, filename) => {
				app.logger.info("file->", fieldname, file, filename);
				const uid = nanoid(6);
				const savedFilePath = join(app.config.baseDir, "uploads", uid + extname(filename));
				file.pipe(createWriteStream(savedFilePath));
				file.on("end", () => {
					results.push(savedFilePath);
				});
			});
			busboy.on("field", (fieldname, val) => {
				app.logger.info("field->", fieldname, val);
				// results.push(val);
			});
			busboy.on("finish", () => {
				app.logger.info("finished");
				resolve(results);
			});
			ctx.req.pipe(busboy);
		});
	}

	async testBusBoy() {
		const { ctx } = this;
		const results = await this.uploadFileUseBusBoy();
		ctx.helper.success({ ctx, res: results });
	}

	async uploadMutipleFiles() {
		const { ctx, app } = this;
		const { fileSize } = app.config.multipart;
		const parts = ctx.multipart({ limits: { fileSize: fileSize as number } }); // 基与co-busboy
		// { urls: [xxx, xxx ]}
		const urls: string[] = [];
		let part: FileStream | string[];
		while ((part = await parts())) {
			if (Array.isArray(part)) {
				app.logger.info(part); // 有可能是text类型，没有什么处理的意义
			} else {
				try {
					const savedOSSPath = join("low-code-upload", nanoid(6) + extname(part.filename));
					const result = await ctx.oss.put(savedOSSPath, part);
					const { url } = result;
					urls.push(url);
					if (part.truncated) {
						await ctx.oss.delete(savedOSSPath);
						return ctx.helper.error({
							ctx,
							errorType: "imageUploadFileSizeError",
							error: `Reach fileSize limit ${fileSize} bytes`,
						});
					}
				} catch (e) {
					await sendToWormhole(part);
					ctx.helper.error({ ctx, errorType: "imageUploadFail" });
				}
			}
		}
		ctx.helper.success({ ctx, res: { urls } });
	}
}
