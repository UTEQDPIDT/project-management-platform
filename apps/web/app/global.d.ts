declare module '*.css';

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void;
			render: (
				container: HTMLElement,
				parameters: {
					sitekey: string;
					size: 'invisible';
					callback: (token: string) => void;
					'error-callback'?: () => void;
					'expired-callback'?: () => void;
				},
			) => number;
			execute: (widgetId: number) => void;
			reset: (widgetId: number) => void;
		};
	}
}

export {};
