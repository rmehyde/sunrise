from api.scheduled_service import ScheduledService
from api import config

import requests
import time
import logging

class WeatherService(ScheduledService):
    def __init__(self, update_interval):
        self.logger = logging.getLogger("WeatherService")
        self.lat = config.LOCATION_LAT
        self.lon = config.LOCATION_LON
        self.api_key = config.DARKSKY_API_KEY
        self.data = None
        super().__init__(update_interval)


    def update(self):
        url = f"https://api.darksky.net/forecast/{self.api_key}/{self.lat},{self.lon}"
        response = requests.get(url)
        if response.status_code != 200:
            logger.error("Received response code %d", response.status_code)
        else:
            self.data = response.json()
            self.last_updated = time.time()

    def get_weather(self):
        today = self.data['daily']['data'][0]
        now = self.data['currently']
        weather = {
            'icon': now['icon'],
            'summary': now['summary'],
            'temperature': now['temperature'],
            'temperatureHigh': today['temperatureHigh'],
            'temperatureLow': today['temperatureLow'],
            'windSpeed': today['windSpeed'],
            'windGustSpeed': today['windGust'],
            'humidity': today['humidity'],
            'feelsLike': now['apparentTemperature'],
            'precipitationProbability': today['precipProbability'],
            'precipitationType': today['precipType']
        }
        return weather