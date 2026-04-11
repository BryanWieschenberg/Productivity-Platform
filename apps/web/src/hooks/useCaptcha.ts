import { useEffect, useCallback } from "react";

import { config } from "@/config";

const CAPTCHA_URL = "https://www.google.com/recaptcha/api.js?render=";
let scriptLoaded = false;

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

function loadScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${CAPTCHA_URL}${config.recaptchaSiteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            scriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
        document.head.appendChild(script);
    });
}

export function useCaptcha() {
    useEffect(() => {
        loadScript().catch((err) => console.error(err));
    }, []);

    const execute = useCallback(async (action: string): Promise<string> => {
        if (!config.isProd) return "dev-bypass";

        await loadScript();
        return new Promise((resolve, reject) => {
            window.grecaptcha.ready(async () => {
                try {
                    const token = await window.grecaptcha.execute(config.recaptchaSiteKey, {
                        action,
                    });
                    resolve(token);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }, []);

    return { execute };
}
