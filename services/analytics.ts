
import posthog from 'posthog-js';

let initialized = false;

export const initAnalytics = () => {
    const apiKey = localStorage.getItem('POSTHOG_KEY');
    const host = localStorage.getItem('POSTHOG_HOST') || 'https://app.posthog.com';

    if (apiKey && !initialized) {
        posthog.init(apiKey, {
            api_host: host,
            autocapture: false, // Disable autocapture for cleaner data in this demo
            loaded: (ph) => {
                initialized = true;
                console.log("PostHog Analytics Initialized");
            }
        });
    }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (initialized) {
        posthog.capture(eventName, properties);
    } else {
        console.log(`[Dev Analytics] Event: ${eventName}`, properties);
    }
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (initialized) {
        posthog.identify(userId, traits);
    }
};
