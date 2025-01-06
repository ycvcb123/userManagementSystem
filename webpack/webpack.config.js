const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const buildFileDest = path.resolve(__dirname, '../app/public');
const templateFileDest = path.resolve(__dirname, '../app/view');

module.exports = env => {
	console.log('env.production:', env.production);
	return {
		mode: 'production',
		context: path.resolve(__dirname, '../webpack'),
		entry: './index.js',
		output: {
			path: buildFileDest,
			filename: 'bundle.[hash].js',
			publicPath: env.production ? 'http://w-low-code.oss-cn-shenzhen.aliyuncs.com/h5-assets/' : '/public/'
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader'
					]
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: '[name].[hash].css'
			}),
			new HtmlWebpackPlugin({
				filename: 'page.tpl',
				template: path.resolve(__dirname, './template.html'),
			}),
			new FileManagerPlugin({
				events: {
					onEnd: {
						copy: [
							{
								source: path.join(buildFileDest, 'page.tpl'),
								destination: path.join(templateFileDest, 'page.tpl')
							}
						]
					}
				}
			})
		]
	};
};
