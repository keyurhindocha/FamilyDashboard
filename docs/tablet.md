# Tablet and kiosk

Any Android tablet works if it can run an up-to-date **Android System WebView**. Tested on a Lenovo Tab M10 HD (TB-X505F).

## Prepare the tablet

1. Factory reset it if it's an old hand-me-down, and sign in to a Google account (for the Play Store).
2. Update **Android System WebView**: open `https://play.google.com/store/apps/details?id=com.google.android.webview` in Chrome on the tablet and tap Update. Install the plain version, not Dev, Beta or Canary. An old WebView is the most common reason for a blank board.
3. If the tablet has a battery-protection mode (Lenovo: *Battery → Battery protection*), turn it on, because it will be plugged in all the time.
4. Settings → Apps → **Fully Kiosk Browser** → Battery → **Unrestricted**.

## Fully Kiosk Browser (free)

Install **Fully Kiosk Browser** from the Play Store, then open its settings (swipe in from the left edge):

| Setting | Value |
|---|---|
| Web Content Settings → **Start URL** | your board page address (see [setup step 4](setup.md#4-host-the-board-page)) |
| Device Management → **Keep Screen On** | on |
| Device Management → **Launch on Boot** | on |
| Toolbars & Appearance → action bar, status bar, navigation bar | all off |
| Web Auto Reload → **on network reconnect** and **after page error** | on |
| Web Zoom and Scaling → **Enable Zoom** | off |

Leave the screensaver off: the board has its own dimmed night mode from 23:00 to 06:30. It also reloads itself at 4am every night.

Restart the tablet. Fully Kiosk should open by itself with the board full screen.

## Mounting

For a kitchen unit without drilling, look for an adhesive VESA-style tablet mount or a magnetic mount with a stick-on plate. Use a long right-angle charging cable (3 m) and route it along the unit edge.
