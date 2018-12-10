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
		searchAndParse: () => {
			let searchTerm = encodeURIComponent(document.getElementById('searchTerm').value);
			App.user.searchLocation(searchTerm).then((locationData) => {
				App.user.parseLocations(locationData);
			});
		},
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
						lng: result.lng,
						title: `${result.name}, ${result.countryName}`
					};
					console.log(locationPayload);
					
					newLink = newLink + `<a href="javascript:App.map.center(${locationPayload.lat}, ${locationPayload.lng}, '${locationPayload.title}');">${locationPayload.title}</a><br>`;
					//newLink = newLink + '<a href="javascript:App.map.center(' + locationPayload + ');">' + locationPayload.title + '</a><br>';
				} else {
					newLink = newLink + `<a href="javascript:App.map.center(${locationPayload.lat}, ${locationPayload.lng}, '${locationPayload.title}');">${result.name}</a><br>`;
					//newLink = newLink + '<a href="javascript:App.map.center(' + locationPayload + ');">' + locationPayload.name + '</a><br>';
				}
				document.getElementById('searchResult').innerHTML = newLink;
			}
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
		},
		center: (newLat, newLng, title) => {
			let point = {
				lat: newLat,
				lng: newLng
			};
			let map = App.mapData.getMainMap();
			
			map.setCenter(point);
			App.mapData.deleteMarkers();
			map.setZoom(5);
			document.getElementById('currentView').innerHTML = `<b>Origin: </b> ${title}`;
			App.map.addMarker(point, title);
			
			let boundary = {
				north: newLat + 5,
				south: newLat - 5,
				east: newLng + 10,
				west: newLng - 10
			};
			App.map.searchRecentEarthquakes(boundary).then((earthquakePayload) => {
				App.map.getEarthquakeInfo(earthquakePayload);
			}).catch((err) => {
				alert(err.msg);
			});
		},
		searchRecentEarthquakes: (boundary) => {
			let req = `http://api.geonames.org/earthquakesJSON?north=${boundary.north}&south=${boundary.south}&east=${boundary.east}&west=${boundary.west}&username=caing`;
			let boundingBox = App.mapData.getBoundingBox();
			boundingBox.setBounds(boundary);
			boundingBox.setMap(App.mapData.getMainMap());
			
			return $.ajax({
				'type': 'GET',
				'url': req,
				'dataType': 'json'
			});
		},
		getEarthquakeInfo: (payload) => {
			if (payload === null || payload.earthquakes < 1) {
				alert('No recent earthquakes in this area');
			} else {
				let quakeInfo = payload.earthquakes;
				for (let i = 0; i < quakeInfo.length; i++) {
					let result = quakeInfo[i];
					let earthquakeInfo = {
						lat: result.lat,
						lng: result.lng,
						magnitude: result.magnitude,
						datetime: result.datetime,
						depth: result.depth
					};
					App.map.addEQMarker(earthquakeInfo);
				}
			}
		},
		addEQMarker: (earthquakeInfo) => {
			let markerDetail = `
				<div class="uk-card uk-card-default uk-card-small" name="markerDetail">
					<ul class="uk-list uk-list-divider">
						<li><b>Magnitude of Earthquake: </b> ${earthquakeInfo.magnitude}</li>
						<li><b>Latitude: ${earthquakeInfo.lat}</b></li>
						<li><b>Longitude: ${earthquakeInfo.lng}</b></li>
						<li><b>Depth: ${earthquakeInfo.depth}</b></li>
						<li>(Happened on ${earthquakeInfo.datetime})</li>
					</ul>
				</div>
			`;
			
			let detailWindow = new google.maps.InfoWindow({content: markerDetail});
			let newMarker = new google.maps.Marker({
				position: {lat: earthquakeInfo.lat, lng: earthquakeInfo.lng},
				map: App.mapData.getMainMap(),
				title: 'Happened on ' + earthquakeInfo.datetime
			});
			
			newMarker.addListener('click', () => {
				detailWindow.open(App.mapData.getMainMap(), newMarker);
			});
			App.mapData.pushMarkers(newMarker);
		},
		addMarker: (point, name) => {
			let newMarker = new google.maps.Marker({
				position: point,
				icon: {
					path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
					strokeColor: '#FFFF00',
					scale: 2
				},
				map: App.mapData.getMainMap(),
				title: name
			});
			App.mapData.pushMarkers(newMarker);
		}
	}
}