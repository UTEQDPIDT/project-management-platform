const RECAPTCHA_SCRIPT_SRC =
  'https://www.google.com/recaptcha/api.js?render=explicit';
const EXECUTE_TIMEOUT_MS = 15000;

let scriptLoadPromise: Promise<void> | null = null;
let widgetId: number | null = null;
let pendingResolve: ((token: string) => void) | null = null;
let pendingReject: ((error: Error) => void) | null = null;

function getSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  }
  return siteKey;
}

function ensureScriptLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA must run in browser'));
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-recaptcha="invisible-v2"]',
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Failed to load reCAPTCHA script')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.src = RECAPTCHA_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.recaptcha = 'invisible-v2';
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load reCAPTCHA script'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

async function ensureWidget(): Promise<number> {
  const siteKey = getSiteKey();
  await ensureScriptLoaded();

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA is not available');
  }

  await new Promise<void>((resolve) => window.grecaptcha?.ready(() => resolve()));

  if (widgetId !== null) {
    return widgetId;
  }

  let container = document.getElementById('recaptcha-invisible-v2-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'recaptcha-invisible-v2-container';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
  }

  widgetId = window.grecaptcha.render(container, {
    sitekey: siteKey,
    size: 'invisible',
    callback: (token: string) => {
      pendingResolve?.(token);
      pendingResolve = null;
      pendingReject = null;
      if (widgetId !== null) {
        window.grecaptcha?.reset(widgetId);
      }
    },
    'error-callback': () => {
      pendingReject?.(new Error('reCAPTCHA verification failed'));
      pendingResolve = null;
      pendingReject = null;
      if (widgetId !== null) {
        window.grecaptcha?.reset(widgetId);
      }
    },
    'expired-callback': () => {
      pendingReject?.(new Error('reCAPTCHA token expired'));
      pendingResolve = null;
      pendingReject = null;
      if (widgetId !== null) {
        window.grecaptcha?.reset(widgetId);
      }
    },
  });

  return widgetId;
}

export async function getRecaptchaToken(): Promise<string> {
  const id = await ensureWidget();

  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) {
    throw new Error('reCAPTCHA is not available');
  }

  if (pendingResolve || pendingReject) {
    throw new Error('A reCAPTCHA challenge is already in progress');
  }

  return await new Promise<string>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      pendingResolve = null;
      pendingReject = null;
      reject(new Error('reCAPTCHA timeout'));
      if (widgetId !== null) {
        window.grecaptcha?.reset(widgetId);
      }
    }, EXECUTE_TIMEOUT_MS);

    pendingResolve = (token: string) => {
      window.clearTimeout(timeoutId);
      resolve(token);
    };

    pendingReject = (error: Error) => {
      window.clearTimeout(timeoutId);
      reject(error);
    };

    grecaptcha.execute(id);
  });
}
