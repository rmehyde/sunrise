from os import path
import json
import logging
from flask import Flask, request, send_from_directory, send_file
from api.subway_time_service import SubwayTimeService
from api.weather_service import WeatherService

STOP_ID = "A44N"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mta-api")

app = Flask(__name__)

subway_service = SubwayTimeService(15)

weather_service = WeatherService(300)

@app.route("/sunrise/app/<path:path>")
def serve_app_directory(path):
    return send_from_directory("app", path)

@app.route("/sunrise/app")
def serve_index_page():
    return send_file("app/index.html")

@app.route("/sunrise/api/subwaytimes", methods=['GET'])
def get_subway_times():
    stop_id = request.args.get('stop_id')
    stop_times = subway_service.get_stop_times(stop_id)
    last_updated = subway_service.get_last_updated()
    logging.debug(last_updated)
    logging.debug(stop_times)
    return json.dumps({'lastUpdated': last_updated, 'stopTimes': stop_times})

@app.route("/sunrise/api/weather", methods=['GET'])
def get_weather():
    weather = weather_service.get_weather()
    last_updated = weather_service.get_last_updated()
    return json.dumps({'lastUpdated': last_updated, 'weather': weather})