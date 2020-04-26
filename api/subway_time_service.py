from scheduled_service import ScheduledService
import config

import requests
from gtfs_realtime_py.gtfs_realtime_pb2 import FeedMessage
import time
import logging

class SubwayTimeService(ScheduledService):
    def __init__(self, update_interval):
        self.logger = logging.getLogger("SubwayTimeService")
        self.api_key = config.MTA_API_KEY
        self.feed = FeedMessage()

        super().__init__(update_interval)

    def update(self):
        self.logger.info("updating feed")

        url = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace"
        headers = {'x-api-key': self.api_key}

        try:
            response = requests.get(url, headers=headers, allow_redirects=True)
            
            # not sure if I can just re-parse, but reassigning feed to be safe
            new_feed = FeedMessage()
            new_feed.ParseFromString(response.content)
            self.feed = new_feed
            self.last_updated = time.time()
        except Exception as e:
            print(e)
            self.logger.error(e)

    def get_stop_times(self, stop_id):
        trips_with_stop = [t for t in self.feed.entity if stop_id in list(map(lambda up: up.stop_id, t.trip_update.stop_time_update))]
        results = []
        for trip in trips_with_stop:
            for update in trip.trip_update.stop_time_update:
                if update.stop_id == stop_id:
                    results.append({'route_id': trip.trip_update.trip.route_id,
                                    'arrival_timestamp': update.arrival.time,
                                    'destination': trip.trip_update.stop_time_update[-1].stop_id})
        return sorted(results, key = lambda entry: entry['arrival_timestamp'])
