# NexaStream app compatibility

This module keeps the modern API under `/api/*` and exposes the legacy routes expected by the NexaStream/Vivo-style Android app at the root of the API host.

## Legacy routes

- `POST /auth`
- `GET /player_api.php`
- `GET|POST /tb/a`
- `POST /update_pin`

## Environment variables

- `NEXA_AUTH_ENCODING`: `base64` by default. Also accepts `base64url`, `plain` or `raw`.
- `NEXA_AUTH_ALPHABET`: optional 64-character custom alphabet used to translate base64 payloads.
- `NEXA_TRIAL_DAYS`: trial duration for first device registration. Default: `15`.
- `NEXA_DEFAULT_DAYS`: fallback Xtream account expiration in days. Default: `365`.
- `NEXA_DEVICE_USER_EMAIL`: internal owner used for auto-created devices. Default: `devices@nexastream.local`.
- `NEXA_APP_PACKAGE`: expected Android package name. Default: `iptv.nexa.stream`.
- `NEXA_STREAM_USER_AGENT`: stream user agent returned to the app. Default: `Vivo Player`.
- `NEXA_DEMO_HOST`: fallback Xtream host used when no playlist is active.
- `NEXA_DEMO_USERNAME`: fallback username. Default: `demo`.
- `NEXA_DEMO_PASSWORD`: fallback password. Default: `demo`.
- `NEXA_DEMO_M3U`: fallback M3U URL stored in auth metadata.
- `NEXA_DEMO_STREAM`: optional playable demo stream URL used by the generated demo entries.

## Notes

The first `/auth` call registers the device by MAC/device id, generates a six-digit device key, and gives it a 15-day trial when no active license is attached. The panel routes remain under `/api/*`.
