import { userErrorMessages } from "./user";
import { workErrorMessage } from "./work";
import { utilsErrorMessages } from "./utils";

export type GlobalErrorTypes = keyof (typeof userErrorMessages & typeof workErrorMessage & typeof utilsErrorMessages);

export const globalErrorMessage = {
	...userErrorMessages,
	...workErrorMessage,
	...utilsErrorMessages,
};
