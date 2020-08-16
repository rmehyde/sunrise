
function loadStops() {
    const stopsReq = new XMLHttpRequest();
    const url = "/sunrise/app/assets/stops.txt";
    stopsReq.open("GET", url)
    stopsReq.send();
    stopsReq.onload = function(e) {
        const lines = stopsReq.responseText.split("\r\n");
        for (let i=1; i<lines.length; i++) {
            const line = lines[i].split(",");
            if (line.length != 0) {
                const stopId = line[0];
                const stopName = line[2];
                stopIdMap[stopId] = stopName; 
            }
        }
        const stopName = stopIdMap[stopId] + " (" + stopId.charAt(stopId.length - 1) + ")"
        const stopNameElt = document.querySelector(".transit-title");
        stopNameElt.innerHTML = stopName;
    }
}

function getEffectiveTimestamp() {
    const now = new Date();
    now.setSeconds(now.getSeconds() + timeOffsetSeconds);
    return now.getTime() / 1000;
}

function renderTime() {
    const datetimeElt = document.querySelector(".datetime");
    const dateElt = datetimeElt.querySelector(".date");
    const timeElt = datetimeElt.querySelector(".time");
    
    // get current time
    const epochSeconds = Math.round(getEffectiveTimestamp() / timeRoundingSeconds) * timeRoundingSeconds;
    const date = new Date(epochSeconds * 1000);
    const time = date.toLocaleTimeString("en-us", {hour: '2-digit', minute:'2-digit'});
   
    dateElt.innerHTML = date.toDateString();
    timeElt.innerHTML = time;
}

function roundedTimeDifference(fromTimestampSeconds, toTimestampSeconds) {
    const difference = toTimestampSeconds - fromTimestampSeconds;
    const roundedDifference = Math.round(difference / timeRoundingSeconds) * timeRoundingSeconds;
    const minutes = (roundedDifference >= 0) ? Math.floor(roundedDifference/60) : Math.ceil(roundedDifference/60);
    const seconds = roundedDifference % 60;
    return {minutes: minutes, seconds: seconds}
}

function addSubwayTime(containerElt, stopUpdate) {
    
    // const routeIdElt = document.createElement("div");
    const routeImageElt = document.createElement("img");
    routeImageElt.setAttribute('class', "route-icon-image");
    routeIconFile = `/sunrise/app/assets/route_icons/${stopUpdate.route_id}.svg`
    routeImageElt.setAttribute('src', routeIconFile);
    routeImageElt.innerHTML = stopUpdate.routeId;
    routeImageElt.setAttribute('class', "route-icon-image");
    // routeIdElt.appendChild(routeImageElt);

    const routeDestinationElt = document.createElement("div");
    routeDestinationElt.setAttribute('class', "route-destination");
    routeDestinationElt.innerHTML = stopIdMap[stopUpdate.destination];

    let arrivalTime = roundedTimeDifference(Math.round(getEffectiveTimestamp()), stopUpdate.arrival_timestamp);
    
    const arrivalMinutesElt = document.createElement("div");
    arrivalMinutesElt.setAttribute('class', "transit-time-min");
    arrivalMinutesElt.innerHTML = `${arrivalTime.minutes} min`

    const arrivalSecondsElt = document.createElement("div");
    arrivalSecondsElt.setAttribute('class', "transit-time-sec");
    if (arrivalTime.seconds != 0) {
        arrivalSecondsElt.innerHTML =  `${arrivalTime.seconds % 60} sec`;
    }

    containerElt.appendChild(routeImageElt);
    containerElt.appendChild(routeDestinationElt);
    containerElt.append(arrivalMinutesElt);
    containerElt.appendChild(arrivalSecondsElt);
}

function renderSubwayTimes() {
    const transitTimetableElt = document.querySelector(".transit-timetable");
    // remove all current
    while (transitTimetableElt.firstChild) {
        transitTimetableElt.removeChild(transitTimetableElt.firstChild);
    }

    // add new ones
    for (let i = 0; i < stopTimes.length; i++) {
        addSubwayTime(transitTimetableElt, stopTimes[i]);
    }
    
    // re render last updated - could do with update but wont hurt
    const transitFooterElt = document.querySelector(".transit-footer");
    const lastUpdatedElt = document.createElement("div");
    lastUpdatedElt.setAttribute('class', "transit-updated");
    lastUpdatedAgo = roundedTimeDifference(lastUpdatedTimestamp, Math.round(new Date().getTime()/1000))
    if (lastUpdatedAgo.minutes != 0) {
        updatedMinutesString = `${lastUpdatedAgo.minutes} minutes `
    } else {
        updatedMinutesString = ""
    }
    lastUpdatedElt.innerHTML = `Last Updated ${updatedMinutesString}${lastUpdatedAgo.seconds} seconds ago`
    while (transitFooterElt.firstChild) {
        transitFooterElt.removeChild(transitFooterElt.firstChild);
    }
    transitFooterElt.appendChild(lastUpdatedElt);
}

function updateSubwayTimes() {
    const stopTimesReq = new XMLHttpRequest();
    const url = "/sunrise/api/subwaytimes?stop_id=" + stopId;
    stopTimesReq.open("GET", url);
    stopTimesReq.send();
    stopTimesReq.onload = function(e) {
        console.log("got response from api")
        // console.log(stopTimesReq);
        data = JSON.parse(stopTimesReq.responseText);
        console.log(data);
        stopTimes = data.stopTimes;
        lastUpdatedTimestamp = data.lastUpdated;
        // console.log(stopTimes);
        renderSubwayTimes();
    }
}

function updateSvgFromFile(path, targetElement) {
    return fetch(path)
        .then(res => res.text())
        .then(data => {
            const parser = new DOMParser();
            return parser.parseFromString(data, 'image/svg+xml').querySelector('svg');
        })
        .then(newSvgElt => {
            // remove current svg contents
            while (targetElement.firstChild) {
                targetElement.removeChild(targetElement.firstChild);
            }
            // append new svg contents
            for (let i = 0; i < newSvgElt.children.length; i++) {
              targetElement.appendChild(newSvgElt.children[i])
            }
        })
}


function renderWeather() {
    console.log("rendering weather")
    if (weather == null) {
        console.log("weather is null")
        return;
    }
    const weatherIconElt = document.querySelector('.weather-icon')
    if (weatherIconElt.getAttribute("id") != weather.icon) {
        updateSvgFromFile(`/sunrise/app/assets/weather_icons/${weather.icon}.svg`, weatherIconElt);
        weatherIconElt.setAttribute("id", weather.icon);
    }




    const weatherSummaryElt = document.querySelector('.weather-summary')
    weatherSummaryElt.innerHTML = weather.summary

    const currentTempElt = document.querySelector('.weather-current-temp-value')
    currentTempElt.innerHTML = `${Math.round(weather.temperature)}`

    const windCurrentElt = document.querySelector('.weather-wind-current')
    windCurrentElt.innerHTML = `${Math.round(weather.windSpeed)} MPH`

    const windGustElt = document.querySelector('.weather-wind-gust')
    windGustElt.innerHTML = `(${Math.round(weather.windGustSpeed)} MPH Gusts)`

    const humidityElt = document.querySelector('.weather-humidity')
    humidityElt.innerHTML = `${Math.round(weather.humidity * 100)}% Humidity`

    const highLowElt = document.querySelector('.weather-hi-lo')
    highLowElt.innerHTML = `${Math.round(weather.temperatureHigh)}°F | ${Math.round(weather.temperatureLow)}°F`

    const precipitationElt = document.querySelector('.weather-precipitation')
    precipitationElt.innerHTML = `${Math.round(weather.precipitationProbability * 100)}% chance of ${weather.precipitationType} today`

    const feelsLikeElt = document.querySelector('.weather-feelslike')
    feelsLikeElt.innerHTML = `Currently Feels Like ${Math.round(weather.feelsLike)}°F`

}

function updateWeather() {
    const weatherReq = new XMLHttpRequest();
    const url = "/sunrise/api/weather";
    weatherReq.open("GET", url);
    weatherReq.send();
    weatherReq.onload = function(e) {
        console.log(weatherReq.responseText);
        data = JSON.parse(weatherReq.responseText);
        weather = data.weather;
        renderWeather();
    }
}

function parseConfigs() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("stopId")) {
        stopId = urlParams.get("stopId");
    }
    if (urlParams.has("renderInterval")) {
        renderIntervalSec = parseInt(urlParams.get("renderInterval"));
    }
    if (urlParams.has("updateInterval")) {
        updateIntervalSec = parseInt(urlParams.get("updateInterval"));
    }
    if (urlParams.has("timeRound")) {
        timeRoundingSeconds = parseInt(urlParams.get("timeRound"));
    }
    if (urlParams.has("timeOffset")) {
        timeOffsetSeconds = parseInt(urlParams.get("timeOffset"));
    }
}

// configs and globals
let renderIntervalSec = 30;
let updateIntervalSec = 30;
let timeRoundingSeconds = 5;
let timeOffsetSeconds = 0;
let stopId = "A44N";

let stopIdMap = {};
let stopTimes = [];
let weather = null;
let lastUpdatedTimestamp = 0;

// init
parseConfigs();
loadStops();
renderTime();
updateSubwayTimes();
updateWeather();

console.log(`render interval sec: ${renderIntervalSec}`);
console.log(`update interval sec: ${updateIntervalSec}`);

/*      SCHEDULING      */

// busy loop until we get a fresh second
while(new Date().getMilliseconds() != 0) {}

function scheduleRender() {
    const delay = ((renderIntervalSec - new Date().getSeconds() % renderIntervalSec)) * 1000;
    setTimeout(() => window.setInterval(renderTime, renderIntervalSec*1000), delay);
    setTimeout(() => window.setInterval(renderSubwayTimes, renderIntervalSec*1000), delay);
}

function scheduleUpdate() {
    const delay = ((updateIntervalSec - new Date().getSeconds() % updateIntervalSec)) * 1000;
    setTimeout(() => window.setInterval(updateSubwayTimes, updateIntervalSec*1000), delay);
    setTimeout(() => window.setInterval(updateWeather, updateIntervalSec*1000), delay);
}

scheduleRender();
scheduleUpdate();