import { userErrorMessages } from "./user";
import { workErrorMessage } from "./work";

export type GlobalErrorTypes = keyof (typeof userErrorMessages & typeof workErrorMessage);

export const globalErrorMessage = {
	...userErrorMessages,
	...workErrorMessage,
};
