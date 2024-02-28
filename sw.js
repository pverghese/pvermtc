const versionNo = "1.0.22";
var staticCacheName = "pwa";
timerHandles = {};

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(["index.html"]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data.msg === "init") {
    console.log(`Message init: ${JSON.stringify(event.data)}`);
    let station = event.data.station;
    let vehicleId = parseInt(event.data.vehicleId);
    let routeNo = event.data.routeNo;
    let vehicleNo = event.data.vehicleNo;
    getData(vehicleId, station, routeNo, vehicleNo);
  } else if (event.data.msg === "cancel") {
    console.log(`Message cancel: ${JSON.stringify(event.data)}`);
    Object.keys(timerHandles).map((k) => {
      console.log(`In SW: Cancelling timer for ${k} in ${JSON.stringify(timerHandles)}`)
      clearInterval(timerHandles[k].handle);
    })
    timerHandles = {}
  }
});

function getData(vehicleId, station, routeNo, vehicleNo) {
  handle = setInterval(() => {
    const channel = new BroadcastChannel("sw-message");
    html = updateNotificationDiv();
    channel.postMessage({ type: "update", "title": "Update", "message": html })

    getVehicleTripDetails(vehicleId).then((d) => {
      stationList = [];
      liveLoc = d['LiveLocation'][0]['nextstop'].split('(')[0].trim()
      d["RouteDetails"].map((j) => {
        stationList.push(j['stationname'].split('(')[0].trim());
      })
      timerHandles[`${vehicleId}|${station}`].stationIndex = stationList.indexOf(station);
      timerHandles[`${vehicleId}|${station}`].currIndex = stationList.indexOf(liveLoc);
      timerHandles[`${vehicleId}|${station}`].routeNo = routeNo;
      timerHandles[`${vehicleId}|${station}`].vehicleNo = vehicleNo;

      console.log(`${Date(Date.now())}  In SW: Live loc of ${routeNo}-${vehicleNo} - ${vehicleId}}: ${liveLoc}`)
      if (stationList.indexOf(liveLoc) >= stationList.indexOf(station)) {
        console.log(`Bus ${routeNo} - ${vehicleNo} will pass ${station} shortly`)
        channel.postMessage({ type: "alert", "title": "Bus Alert", "message": `Bus ${routeNo} - ${vehicleId} will pass ${station} station shortly.` })

        clearInterval(timerHandles[`${vehicleId}|${station}`].handle);
        delete timerHandles[`${vehicleId}|${station}`]
        //localStorage.setItem("timers", JSON.stringify(timers));

        console.log(`Bus ${routeNo}-${vehicleNo} has passed notification location ${station}`)
      }

      //document.getElementById("logs").innerHTML += `<div>${Date(Date.now())} In SW: Live loc of ${routeNo}-${vehicleNo}: ${liveLoc}</div>`
    })
  }, 30000)
  timerHandles[`${vehicleId}|${station}`] = { "handle": handle, "station": station, "vehicleId": vehicleId, "routeNo": routeNo, "vehicleNo": vehicleNo };
  console.log(`SW: timer handles: ${JSON.stringify(timerHandles)}`)
}

function updateNotificationDiv() {
  html = ``
  Object.keys(timerHandles).map((k) => {
    let station = k.split('|')[1];
    let vehicleId = k.split('|')[0];
    let routeNo = timerHandles[k].routeNo;
    let vehicleNo = timerHandles[k].vehicleNo;
    let curr = timerHandles[k].currIndex;
    let stationIndex = timerHandles[k].stationIndex;

    html += `<div>${routeNo} - ${vehicleNo}   Curr: ${curr} StationIndex: ${stationIndex}</div>`
  })
  return html;
}

async function getVehicleTripDetails(vehicleid) {
  //const testData = '{"RouteDetails":[{"rowid":1,"tripid":29551944,"routeno":"267","routename":"HSG-SBS","busno":"KA57F3554","tripstatus":"Running","tripstatusid":"1","sourcestation":"Hesaraghatta","destinationstation":"Shivajinagara Bus Station","servicetype":"Non AC/Ordinary","webservicetype":"Non-AC","servicetypeid":72,"lastupdatedat":"21-02-2024 12:45:30","stationname":"Hesaraghatta","stationid":35751,"actual_arrivaltime":"12:37","etastatus":"12:37","etastatusmapview":"12:37","latitude":13.13784,"longitude":77.47944,"currentstop":"Ivarukandapura (Towards Shivakote)","laststop":"Indian Institute of Horticultural Research (Towards Ivarukandapura)","weblaststop":"Indian Institute of Horticultural Research","nextstop":"Muthkur Cross Shivakote (Towards Shivakote)","currlatitude":13.137649,"currlongitude":77.494476,"sch_arrivaltime":"12:40","sch_departuretime":"12:40","eta":"","actual_arrivaltime1":"12:37","actual_departudetime":"12:38","tripstarttime":"12:40","tripendtime":"14:20","routeid":13200,"vehicleid":22818,"responsecode":200,"lastreceiveddatetimeflag":1,"srno":637283158,"tripposition":1,"stopstatus":0,"stopstatus_distance":999,"lastetaupdated":null,"minstopstatus_distance":1.04},{"rowid":1,"tripid":29551944,"routeno":"267","routename":"HSG-SBS","busno":"KA57F3554","tripstatus":"Running","tripstatusid":"1","sourcestation":"Hesaraghatta","destinationstation":"Shivajinagara Bus Station","servicetype":"Non AC/Ordinary","webservicetype":"Non-AC","servicetypeid":72,"lastupdatedat":"21-02-2024 12:45:30","stationname":"Hesaraghatta TB Cross","stationid":25869,"actual_arrivaltime":"12:40","etastatus":"12:40","etastatusmapview":"12:40","latitude":13.13056,"longitude":77.48438,"currentstop":"Ivarukandapura (Towards Shivakote)","laststop":"Indian Institute of Horticultural Research (Towards Ivarukandapura)","weblaststop":"Indian Institute of Horticultural Research","nextstop":"Muthkur Cross Shivakote (Towards Shivakote)","currlatitude":13.137649,"currlongitude":77.494476,"sch_arrivaltime":"12:42","sch_departuretime":"12:42","eta":"","actual_arrivaltime1":"12:40","actual_departudetime":"12:41","tripstarttime":"12:40","tripendtime":"14:20","routeid":13200,"vehicleid":22818,"responsecode":200,"lastreceiveddatetimeflag":1,"srno":637283159,"tripposition":1,"stopstatus":0,"stopstatus_distance":999,"lastetaupdated":"2024-02-21T12:41:00","minstopstatus_distance":1.04},{"rowid":1,"tripid":29551944,"routeno":"267","routename":"HSG-SBS","busno":"KA57F3554","tripstatus":"Running","tripstatusid":"1","sourcestation":"Hesaraghatta","destinationstation":"Shivajinagara Bus Station","servicetype":"Non AC/Ordinary","webservicetype":"Non-AC","servicetypeid":72,"lastupdatedat":"21-02-2024 12:45:30","stationname":"Indian Institute of Horticultural Research","stationid":33033,"actual_arrivaltime":"12:44","etastatus":"12:44","etastatusmapview":"12:44","latitude":13.13544,"longitude":77.49095,"currentstop":"Ivarukandapura (Towards Shivakote)","laststop":"Indian Institute of Horticultural Research (Towards Ivarukandapura)","weblaststop":"Indian Institute of Horticultural Research","nextstop":"Muthkur Cross Shivakote (Towards Shivakote)","currlatitude":13.137649,"currlongitude":77.494476,"sch_arrivaltime":"12:44","sch_departuretime":"12:44","eta":"","actual_arrivaltime1":"12:44","actual_departudetime":"12:44","tripstarttime":"12:40","tripendtime":"14:20","routeid":13200,"vehicleid":22818,"responsecode":200,"lastreceiveddatetimeflag":1,"srno":637283160,"tripposition":1,"stopstatus":0,"stopstatus_distance":999,"lastetaupdated":"2024-02-21T12:44:00","minstopstatus_distance":1.04},{"rowid":1,"tripid":29551944,"routeno":"267","routename":"HSG-SBS","busno":"KA57F3554","tripstatus":"Running","tripstatusid":"1","sourcestation":"Hesaraghatta","destinationstation":"Shivajinagara Bus Station","servicetype":"Non AC/Ordinary","webservicetype":"Non-AC","servicetypeid":72,"lastupdatedat":"21-02-2024 12:45:30","stationname":"Ivarukandapura","stationid":26212,"actual_arrivaltime":"12:45","etastatus":"12:45","etastatusmapview":"12:45","latitude":13.13767,"longitude":77.49442,"currentstop":"Ivarukandapura (Towards Shivakote)","laststop":"Indian Institute of Horticultural Research (Towards Ivarukandapura)","weblaststop":"Indian Institute of Horticultural Research","nextstop":"Muthkur Cross Shivakote (Towards Shivakote)","currlatitude":13.137649,"currlongitude":77.494476,"sch_arrivaltime":"12:45","sch_departuretime":"12:45","eta":"12:46","actual_arrivaltime1":"12:45","actual_departudetime":null,"tripstarttime":"12:40","tripendtime":"14:20","routeid":13200,"vehicleid":22818,"responsecode":200,"lastreceiveddatetimeflag":1,"srno":637283161,"tripposition":2,"stopstatus":0,"stopstatus_distance":999,"lastetaupdated":"2024-02-21T12:46:00","minstopstatus_distance":1.04}],"LiveLocation":[{"latitude":13.137649,"longitude":77.494476,"location":"Ivarukandapura (Towards Shivakote)","lastrefreshon":"21-02-2024 12:45:30","nextstop":"Muthkur Cross Shivakote (Towards Shivakote)","previousstop":"Indian Institute of Horticultural Research (Towards Ivarukandapura)","vehicleid":22818,"vehiclenumber":"KA57F3554","routeno":"267","servicetypeid":72,"servicetype":"Non AC/Ordinary","heading":6,"responsecode":200,"trip_status":1,"lastreceiveddatetimeflag":1}],"Message":"Success","Issuccess":true,"exception":null,"RowCount":41,"responsecode":200}'
  const testData = ''
  if (testData) {
    return new Promise((resolve) => resolve(JSON.parse(testData)))
  }
  try {
    const res = await fetch("https://bmtcmobileapistaging.amnex.com/WebAPI/VehicleTripDetails_v2", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: vehicleid,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "lan": "en",
        "deviceType": "android",
        "deviceId": "0398cd37e29548dc",
        "authToken": "N/A"
      }
    });
    obj = await res.json()
    return obj
  } catch (error) {
    console.log("There was an error", error)
    return {}
  }

}
