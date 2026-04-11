type Config = {
    isProd: boolean;
    apiUrl: string;
    recaptchaSiteKey: string;
};

function required(key: string, value: string | undefined): string {
    if (!value) throw new Error(`Missing required env variable: ${key}`);
    return value;
}

export const config: Config = {
    isProd: import.meta.env.PROD,
    apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
    recaptchaSiteKey: required("VITE_RECAPTCHA_SITE_KEY", import.meta.env.VITE_RECAPTCHA_SITE_KEY),
};
