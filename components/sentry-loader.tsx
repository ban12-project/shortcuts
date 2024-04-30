import Script from 'next/script'
import { SDK_VERSION } from '@sentry/nextjs'

import { IN_BROWSER } from '#/lib/utils'

if (IN_BROWSER) {
  // @ts-ignore
  window.sentryOnLoad = function () {
    // @ts-ignore
    Sentry.init({
      dsn: 'https://f6154cad843071616a95017ace8238e7@o4507083088920576.ingest.us.sentry.io/4507083090362368',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      replaysOnErrorSampleRate: 1.0,

      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,

      // You can remove this option if you're not planning to use the Sentry Session Replay feature:
      integrations: [
        // @ts-ignore
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    })
  }
}

export default function SentryLoader() {
  return (
    <Script
      src={`https://browser.sentry-cdn.com/${SDK_VERSION}/bundle.replay.min.js`}
      crossOrigin="anonymous"
    />
  )
}
