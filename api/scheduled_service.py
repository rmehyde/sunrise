import time
from threading import Thread

class ScheduledService:

    def __init__(self, update_interval):
        self.active = True
        self.last_updated = None

        self.update()

        # start our update thread
        update_thread = Thread(target=self.schedule_update, args=(update_interval,))
        update_thread.daemon = True
        update_thread.start()

    def update(self):
        self.last_updated = time.time()

    def schedule_update(self, interval):
        offset = 1.0
        # wait until the next (two to guarantee positivity) cycle, minus an offset
        # to give ourselves time to refresh data
        time.sleep(interval*2 - (time.time() % interval + offset))
        starttime = time.time()
        while self.active:
            self.update()
            time.sleep(interval - (time.time() - starttime) % interval)

    def get_last_updated(self):
        return self.last_updated

    def shutdown(self):
        self.active = False