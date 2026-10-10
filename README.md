# EcoQuest — Made by Straw Hats

This version splits the website into separate linked pages while sharing one stylesheet and one JavaScript file.

## Files
- `index.html` — Home
- `report.html` — Waste photo reporting, virtual flowers, streak and appreciation reward
- `community.html` — Community waste reports
- `leaderboard.html` — Rankings
- `style.css` — Shared design
- `script.js` — Shared browser-side functionality

## Run in VS Code
1. Extract the ZIP.
2. Open the `ecoquest-multipage` folder in VS Code.
3. Install/use Live Server if available.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Navigate using the links in the header.

## Prototype limitations
This is a front-end demo. Reports and photos are stored in localStorage in the same browser and device; there is no real multi-user backend yet. The leaderboard includes sample competitors. The streak counts consecutive calendar days when a report is submitted. Use small, non-sensitive demo photos.

For a real AWS deployment, add authentication, an API, database, secure image storage, moderation, and server-side streak validation.

## Personalized greeting
On the Home page, enter a name in the personal greeting section and click **Save name**. The site shows `Hello, [name]!` in the shared navigation across all pages and uses that name on new community reports. The name is stored locally in the browser for this prototype.

## Biodegradable waste flow
Selecting **Food waste** or **Paper** in the report form sends the user to `biodegradable.html`, where they choose an action and upload a proof photo for +25 demo points. The selected category is a simple prototype rule, not automatic image recognition. Real photo-based detection needs an image-classification model/service and server-side validation.
