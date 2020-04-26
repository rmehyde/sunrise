# Sunrise
Sunrise is a webapp that displays real-time MTA train times and the weather

![Screenshot](https://github.com/rmehyde/sunrise/blob/master/sunrise_screenshot.png)

## Status
The app only currently pulls the ACE subway time feed from the MTA. Weather location is a hard-coded configuration. If you're interested in using the app for a local project, any tweaks you need should be easy. But the project is a ways off from being friendly to users not looking to run in a one-off local environment.

## Config & Keys
You will need to supply API Keys for the [DarkSky Weather API](https://darksky.net/) and [MTA Subway Real-Time Feed](https://datamine.mta.info/feed-documentation). Simply copy and rename the `config_template.py` file to `config.py`, and fill in the appropriate values.

## Running

To debug run:
```
cd api
export FLASK_APP=sunrise_api.py
flask run
```

## Using the App

The page offers the following configuration options as query parameters:

- stopId: the subway stop to show information for, listed in `app/assets/stops.txt`
- renderInterval: how often in seconds the page refreshes locally, updating the current time and recomputing subway arrivals from the new time basis
- updateInterval: how often in seconds the page polls the API to update the subway arrival timestamps and weather information
- timeRound: time in seconds to round all times to
- timeOffset: time in seconds to offset all times (e.g. make everything slightly ahead)

For example:
```
http://127.0.0.1:5000/sunrise/app?stopId=A44N&updateInterval=15&renderInterval=5&timeRound=30&timeOffset=10
```