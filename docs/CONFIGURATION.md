This document provides details on how to configure the application, manage environment variables, and use the VEDA UI configuration provider.

## Environment variables

The application uses `.env` and `.env.local` files to manage environment variables. Below is a breakdown of the variables used in the application:

### `.env` variables

These variables configure general API endpoints and settings that are safe to be exposed publicly. They are used to configure the application for production or public-facing environments and are committed to version control.

- **`NEXT_PUBLIC_API_STAC_ENDPOINT`**
    Defines the endpoint for accessing the STAC API

    Example:
    ```env
    NEXT_PUBLIC_API_STAC_ENDPOINT='https://openveda.cloud/api/stac'
    NEXT_PUBLIC_API_RASTER_ENDPOINT='https://openveda.cloud/api/raster'
    ```

### `.env variables`

These variables are specific to each developer’s local environment and often contain sensitive information like API keys or tokens. They should not be committed to version control. Instead, developers should copy the provided sample `.env.local.sample` file and rename it to `.env.local.`

### Analytics variables

Analytics is Google Tag Manager, loaded via `@next/third-parties`. All three variables are read in the browser and so must carry the `NEXT_PUBLIC_` prefix.

- **`NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`**
    The GTM container ID (`GTM-XXXXXXX`). **If unset, no analytics loads at all** — which is the intended state for local development and preview deploys.

- **`NEXT_PUBLIC_GOOGLE_TAG_AUTH`** / **`NEXT_PUBLIC_GOOGLE_TAG_PREVIEW`**
    Optional. Set these only to point the site at a non-production GTM environment; leave both unset to serve the container's live version.

    ```env
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID='GTM-XXXXXXX'
    NEXT_PUBLIC_GOOGLE_TAG_AUTH=''
    NEXT_PUBLIC_GOOGLE_TAG_PREVIEW=''
    ```

> The older `GOOGLE_TAG_MANAGER_ID` / `GOOGLE_TAG_AUTH` / `GOOGLE_TAG_PREVIEW` entries in `.env.local-sample` are inherited from the upstream template and are **not** read by any code. Without the `NEXT_PUBLIC_` prefix they never reach the browser.

### How analytics consent works

GTM is gated on the IEEE Osano cookie banner (loaded in `app/layout.tsx`) and will not load until the visitor accepts the **ANALYTICS** category. The wiring lives in two files:

- `app/lib/analytics.ts` — subscribes to Osano's consent events and emits Google Consent Mode signals.
- `app/components/analytics.tsx` — renders `<GoogleTagManager />` only while consent is granted.

Two behaviours are deliberate and worth knowing before you change them:

- **It fails closed.** If Osano is missing — blocked by an extension, or its script fails — consent is treated as denied and GTM never loads.
- **Withdrawal is handled by a Consent Mode signal, not by unloading.** A script cannot be un-executed, so when a visitor revokes consent mid-session the app pushes `analytics_storage: 'denied'`, which stops GA setting cookies or sending hits without forcing a page reload.

### Using environment variables in code

The `VedaUIProvider` is part of the `@teamimpact/veda-ui` library and is used to pass environment variables to VEDA-UI components. This is needed so that VEDA components relying on configurations like API endpoints and Mapbox tokens can access these values.

#### Where to place it

The `VedaUIProvider` should wrap your application at a high level, such as in the `RootLayout` or a similar layout component, so that all VEDA-UI components within the application have access to the provided configurations.

#### Example usage

Below is an example of how to configure the `VedaUIProvider` with environment variables:

```tsx
import { VedaUIProvider } from '@teamimpact/veda-ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <VedaUIProvider
      config={{
        envMapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '',
        envApiStacEndpoint: process.env.NEXT_PUBLIC_API_STAC_ENDPOINT ?? '',
        envApiRasterEndpoint: process.env.NEXT_PUBLIC_API_RASTER_ENDPOINT ?? '',
      }}
    >
      {children}
    </VedaUIProvider>
  );
}
```