# 📅 ITMO Schedule Exporter

This Firefox extension allows students at **ITMO University** to fetch their personalized schedule and export it directly as a `.ics` file (iCalendar format), ready for import into any calendar application (Google Calendar, Apple Calendar, Outlook, etc.).

## 🚀 Features

- 🔐 Authenticates using your current login session at [my.itmo.ru](https://my.itmo.ru)
- 📡 Fetches your personal schedule from the official ITMO API
- 🗓 Converts the schedule into `.ics` calendar events
- 📥 Downloads the `.ics` file automatically with a single click
- 📆 Automatically covers 4 months from today

## 🧩 Installation (Temporary for Development)

1. Open **Firefox** and go to `about:debugging`.
2. Click **"This Firefox"** (or "Load Temporary Add-on").
3. Click **"Load Temporary Add-on"**, and select the `manifest.json` file from this project.

> ⚠️ **Important**: You must be logged in to [my.itmo.ru](https://my.itmo.ru) in the same browser for the extension to fetch your schedule.

---

## 🛠 Project Structure

```bash
itmo-schedule-exporter/
├── popup.html          # Extension's UI
├── popup.js            # Handles token fetch, API call, .ics conversion
├── background.js       # Extracts auth token from browser cookies
├── manifest.json       # Firefox extension manifest
├── icon.png            # Extension icon
└── README.md           # This file
