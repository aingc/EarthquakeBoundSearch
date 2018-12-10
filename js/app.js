var App = {
	mapData: (() => {
		var mainMap;
		var markers = [];
		var boundingBox;
		
		return {
			setMainMap: (val) => {
				mainMap = val;
			},
			getMainMap: () => {
				return mainMap;
			},
			setMarkers: (gmap) => {
				for (let i = 0; i < markers.length; i++) {
					markers[i].setMap(gmap);
				}
			},
			deleteMarkers: () => {
				App.mapData.setMarkers(null);
				markers = [];
			},
			pushMarkers: (e) => {
				markers.push(e);
			},
			getMarkers: () => {
				return markers;
			},
			setBoundingBox: (val) => {
				boundingBox = val;
			},
			getBoundingBox: () => {
				return boundingBox;
			}
		}
	})(),
	user: {
		searchLocation: (value) => {
			//api call with search term
			//parse json, loop through and make an <a> tag foreach for top 10 results
			var req = `http://api.geonames.org/searchJSON?q=${value}&maxRows=15&username=caing`;			
			
			return $.ajax({
				'type': 'GET',
				'url': req,
				'dataType': 'json',
			});
		},
		parseLocations: (locations) => {
			let newLink = '';
			let geos = locations.geonames;
			let locationPayload;
			for (let i = 0; i < geos.length; i++) {
				let result = geos[i];
				
				if (result.countryName !== null && result.name !== result.countryName) {
					locationPayload = {
						name: result.name,
						countryName: result.countryName,
						lat: result.lat,
						lng: result.lng
					};
					newLink = newLink + `<a href="javascript:App.user.reCenter(${locationPayload});">${result.name}, ${result.countryName}</a><br>`;
				} else {
					newLink = newLink + `<a href="javascript:App.user.reCenter(${locationPayload});">${result.name}</a><br>`;
				}
				document.getElementById('searchResult').innerHTML = newLink;
			}
		},
		reCenter: (locPayload) => {
			
		}
	},
	
	map: {
		init: () => {
			let pioneerSquare = {lat: 45.51886, lng: -122.67932};
			let newMap = new google.maps.Map(document.getElementById('map'), {
				zoom: 13,
				center: pioneerSquare
			});
			let newBoundingBox = new google.maps.Rectangle({
				strokeColor: '#3333ff',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#3333ff',
				fillOpacity: 0.35,
				map: null,
				bounds: {
					north: 0,
					south: 0,
					east: 0,
					west: 0
				}
			});
			App.mapData.setMainMap(newMap);
			App.mapData.setBoundingBox(newBoundingBox);
		}
	}
}