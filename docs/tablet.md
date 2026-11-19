# Tablet and kiosk

## Our iPad: iPad 4th generation (MD510C/A), iOS 10.3.3

iOS 10.3.3 is the last update this iPad will ever get, so the board page is written for Safari 10 (no modern JavaScript, a fallback for flexbox spacing, and a 1280×960 layout that fills the 4:3 screen).

**Set it up once:**

1. **Do Not Disturb:** Settings → Do Not Disturb → **Manual** on, so notifications don't pop up over the board.
2. **Never sleep:** Settings → Display & Brightness → **Auto-Lock → Never**. Leave Auto-Brightness on so it dims with the kitchen lights.
3. **Open the board in Safari.** If the page asks for the board link, paste it there, or open `…/web/?link=` followed by your board link once.
4. **Add to Home Screen:** Share → **Add to Home Screen**. It opens full screen with no Safari bars. A Home Screen app keeps its own storage, separate from Safari, so add it from the address that already has `?link=…` in it, or paste the link again inside it.
5. **Lock it to the board:** Settings → General → Accessibility → **Guided Access** on, and set a passcode. Open the board, **triple-click the Home button**, then tap Start. Triple-click and enter the passcode to get out.
6. **Power:** keep it plugged in. A 2012 battery that's charged all the time can swell, so if the screen ever lifts at the edges, unplug it and replace the battery.

**Not tested yet on the real iPad:** whether Safari 10 trusts the security certificates of every site the board loads (Google, Google Fonts, jsDelivr). If a section or the artwork is missing only on the iPad, that's the first thing to check.

## Android tablet

Any Android tablet works if it can run an up-to-date **Android System WebView**. Tested on a Lenovo Tab M10 HD (TB-X505F).

### Prepare the tablet

1. Factory reset it if it's an old hand-me-down, and sign in to a Google account (for the Play Store).
2. Update **Android System WebView**: open `https://play.google.com/store/apps/details?id=com.google.android.webview` in Chrome on the tablet and tap Update. Install the plain version, not Dev, Beta or Canary. An old WebView is the most common reason for a blank board.
3. If the tablet has a battery-protection mode (Lenovo: *Battery → Battery protection*), turn it on, because it will be plugged in all the time.
4. Settings → Apps → **Fully Kiosk Browser** → Battery → **Unrestricted**.

### Fully Kiosk Browser (free)

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

### Mounting

For a kitchen unit without drilling, look for an adhesive VESA-style tablet mount or a magnetic mount with a stick-on plate. Use a long right-angle charging cable (3 m) and route it along the unit edge.
