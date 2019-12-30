from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import time

options = Options()
options.headless = True

width = 1404
height = 1872

url = "http://127.0.0.1:5000/sunrise/app"

driver = webdriver.Firefox(options=options)
driver.set_window_size(width, height)
driver.get(url)

for x in range(5):

    image = driver.get_screenshot_as_file("/home/reese/Projects/sunrise/headless/first.png").rotate(90)


time.sleep(10)

driver.get_screenshot_as_file("/home/reese/Projects/sunrise/headless/second.png")


driver.quit()