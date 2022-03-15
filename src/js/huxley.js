const loading = document.getElementById('loading');
const loaded = document.getElementById('loaded');
const huxley = document.getElementById('huxley');
const huxleyContent = document.getElementById('huxley__content');

loading.style.display = 'block';
loaded.style.display = 'none';

var from = huxley.className.substring(0, 3);
var dest = huxley.className.slice(-3);
var headers = [];
var origins = [];
var destinations = [];
var htmlString = '';
var htmlArray = [];
var all = [];
var arrJSON = [];

switch (from) {
  case 'MCO':
    origins.push('MCO', 'MCV', 'MAN');
    break;
  case 'MAN':
    origins.push('MCO', 'MCV', 'MAN');
    break;
  case 'MCV':
    origins.push('MCO', 'MCV', 'MAN');
    break;
  default:
    origins.push(from);
}

//console.log('Origins: ', origins);

switch (dest) {
  case 'MCO':
    destinations.push('MCO', 'MCV', 'MAN');
    break;
  case 'MAN':
    destinations.push('MCO', 'MCV', 'MAN');
    break;
  case 'MCV':
    destinations.push('MCO', 'MCV', 'MAN');
    break;
  default:
    destinations.push(dest);
}

//console.log('Destinations: ', destinations);

if (origins.length > 1) {
  huxleyContent.className = '[ table col4 ] [ measure-short ]';
  headers.push('From', 'Sched.', 'Exp.', 'Platform');
} else if (destinations.length > 1) {
  huxleyContent.className = '[ table col4 ] [ measure-short ]';
  headers.push('Sched.', 'Exp.', 'Platform', 'To');
} else {
  huxleyContent.className = '[ table col3 ] [ measure-short ]';
  headers.push('Sched.', 'Exp.', 'Platform');
}
headers.forEach(function (header) {
  htmlString += `<div class="[ table__header ]">${header}</div>`;
});

function nextFunction() {
  if (arrJSON.length === 0) {
    htmlString = `<p>We cannot find any direct services departing within the next two hours. Please check back later.</p>`;
    huxleyContent.className = '[ alert__error ] [ measure-long ]';
  } else {
    arrJSON.sort(function (x, y) {
      let a = x.std.toUpperCase(),
        b = y.std.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    });
    arrJSON.forEach(function (service) {
      var std = service.std;
      var etd = service.etd;
      var platform;
      typeof service.platform === 'undefined'
        ? (platform = '')
        : service.platform === null
        ? (platform = '')
        : (platform = service.platform);

      if (origins.length > 1) {
        var location = crsSwap(service.crsfrom);
        var data = [location, std, etd, platform];
      } else if (destinations.length > 1) {
        var location = crsSwap(service.crsdest);
        var data = [std, etd, platform, location];
      } else {
        var data = [std, etd, platform];
      }

      data.forEach(function (value) {
        htmlString += `<div class="[ table__data ]">${value}</div>`;
      });
    });
  }
  document.getElementById('huxley__content').innerHTML += htmlString;
  loading.style.display = 'none';
  loaded.style.display = 'block';
}

function parseJSON(jsn) {
  var resp = JSON.parse(jsn);
  if (resp.trainServices && resp.trainServices.length > 0) {
    var crsFrom = resp.crs;
    var crsDest = resp.filtercrs;
    var services = resp.trainServices;
    services.forEach(function (service) {
      service['crsfrom'] = crsFrom;
      service['crsdest'] = crsDest;
      arrJSON.push(service);
    });
  }
}

for (var origin = 0; origin < origins.length; origin++) {
  for (var destination = 0; destination < destinations.length; destination++) {
    var p = new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var url =
        'https://ale-trail.azurewebsites.net/departures/' +
        origins[origin] +
        '/to/' +
        destinations[destination];
      xhr.addEventListener('load', function (xhr) {
        resolve(xhr);
      });
      xhr.addEventListener('error', function (b) {
        reject(this);
      });
      xhr.open('GET', url, true);
      xhr.send();
    });
    all.push(p);
  } // loop end
}

Promise.all(all).then((values) => {
  values.forEach(function (p) {
    parseJSON(p.target.responseText);
  });
  nextFunction();
});

function crsSwap(crs) {
  switch (crs) {
    case 'MCO':
      var location = 'Oxford Rd';
      break;
    case 'MAN':
      var location = 'Piccadilly';
      break;
    case 'MCV':
      var location = 'Victoria';
      break;
    default:
      var location = crs;
  }
  return location;
}
