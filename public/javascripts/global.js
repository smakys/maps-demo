const nFormatter = (num) => {
 if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
 }
 if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
 }
 return num;
}

function numFormat (num) {
  // var floaty = parseFloat(num.replace(/[^0-9\\.]+/g, ''));
  if (isNaN(num)) {
    return '---';
  }
  var divisions = 0;
  while (num > 999) {
    num = parseFloat((num / 1000).toFixed(1));
    divisions++;
  }
  if (num.toString().length > 4) {
    num = parseInt(num);
  }
  var divs = ['', 'K', 'M', 'B'];
  return '$' + num + divs[divisions];
}

/*
ZapMap.prototype.setHomeMarker = function (home, context) {
  if (typeof (context.homeMarkers.get(home.mlsNumber)) === 'undefined') {
    var marker = new window.google.maps.Marker({
      position: {lat: home.latitude, lng: home.longitude},
      map: context.googlemap,
      home: home,
      icon: { url: 'data:image/svg+xml;charset=UTF-8;base64,' + window.btoa(homeMarker(context.brandColor, home.listingPrice)) }
    });

    window.google.maps.event.addListener(marker, 'click', function () {
      // context.googlemap.panTo(marker.position); // currently removing the home detail info on bounds change which happens right after details display if we pan to center the clicked marker
      homes.showHomeInfo(this.home);
    });
    context.homeMarkers.set(home.mlsNumber, marker);
  }
};
 */

function homeMarker (color, price) {
  var homeMarker = `<svg xmlns="http://www.w3.org/2000/svg"
       width="60px" height="30px" viewBox="0 0 700 300" class="homeMarker">
      <rect x="1" y="1" width="700" height="225"
            fill="${color}" class="btn-svg" rx="30" stroke="white" stroke-width="5" />
      <polygon points="250,223 450,223 350,300" fill="${color}" />
      <text x="350" y="160" text-anchor="middle"
            font-family="Arial"
            font-size="150" fill="white" style="text-align:center;">${numFormat(price)}</text>
    </svg>`;
  return homeMarker;
}

function assessmentMarker (price) {
  var marker = `<svg xmlns="http://www.w3.org/2000/svg"
       width="50px" height="30px" viewBox="0 0 700 300">
      <rect x="1" y="1" width="700" height="225"
            fill="#666666" class="btn-svg" rx="30" stroke="white" stroke-width="5" />
      <text x="350" y="160" text-anchor="middle"
            font-family="Arial"
            font-size="150" fill="white" style="text-align:center;">${numFormat(price)}</text>
    </svg>`;
  return marker;
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
const addMarkers = (markers, animation = null) => {
  markers.forEach((marker) => {
    const coords = { lat: marker.lat, lng: marker.lon }

    const markerIcon = {
      scaledSize: new google.maps.Size(25, 25),
      url: 'https://cdn0.iconfinder.com/data/icons/command-buttons/512/Home-512.png'
    }

    new google.maps.Marker({
      position: coords,
      animation: google.maps.Animation[animation],
      //icon: '/images/icon.png',
      icon: {
        url: `data:image/svg+xml;charset=UTF-8;base64,${window.btoa(homeMarker('#30517F', marker.price))}`
      },
      map: map
    });
  });
}

const initMap = (opts = {}) => {
  const center = {lat: 37.7749, lng: -122.4194};
  
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: parseInt(opts.zoom, 10),
    gestureHandling: 'greedy',
    center: center
  });

  map.addListener('bounds_changed', debounce(() => {
    console.log('bounds_changed');
    
  }, 300));

  map.addListener('zoom_changed', () => {
    console.log('zoom_changed');
  });

  map.addListener('tilt_changed', () => {
    console.log('tilt_changed');
  });

  map.addListener('idle', () => {
    console.log('idle');
    console.log(map.getBounds());
    console.log(map.getBounds().getNorthEast().lat())
    console.log(map.getBounds().getNorthEast().lng())
    console.log(map.getBounds().getSouthWest().lat())
    console.log(map.getBounds().getSouthWest().lng())
  });

  setupMarkers(opts);
}

const setupSidebar = (opts = {}) => {
  return getListings(opts)
    .then((listings) => {
      console.log(listings)
      if (listings.length > 0) {
        addListings(listings);
      }
    });
}

const addListings = (listings) => {
  console.log(listings)
  let markup = listings.map((listing) => {
    return `<div class="listing">
        <img src="http://era.com${listing.preferredImageUrl}">
        <ul>
          <li>${listing.address}</li>
          <li>${listing.price}</li>
          <li>${listing.numBeds} BR ${listing.numFullBaths} BA</li>
        </ul>
      </div>`;
  });
  let html = markup.join('')
  document.querySelector('.content aside').insertAdjacentHTML('beforeend', html);
}

const setupMarkers = (opts = {}, animation) => {
  return getListings(opts)
    .then((listings) => {
      if (listings.length > 0) {
        addMarkers(listings, animation);
        document.dispatchEvent(new CustomEvent('markersDone'));
      }
    })
}

const getListings = (opts = {}) => {
  
  opts = Object.assign({ limit: 100 }, opts);
  //const polygon = encodeURIComponent(`POLYGON((-122.26490476074218 37.883368428768456,-122.57389523925781 37.66627219960809))`);
  
  const polygon = 'POLYGON((-122.51026153564453%2037.78124290642932%2C-122.47180938720703%2037.807558885337194%2C-122.40280151367188%2037.80593136481263%2C-122.38941192626953%2037.788840233834875%2C-122.40760803222656%2037.73455647806937%2C-122.50614166259766%2037.736457082238054%2C-122.51026153564453%2037.78124290642932))';
  const url = `//mls-listing.services.aur.ziprealty.com/mls-listings?polygon=${polygon}&allowMlsView=false&page=${opts.page}&resultsPerPage=${opts.limit}&responseView=card`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      return res.json();
    })
    .then((listings) => {
      return listings;
    });
}
