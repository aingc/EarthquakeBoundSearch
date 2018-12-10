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
		search: () => {
			//api call with search term
			//parse json, loop through and make an <a> tag foreach for top 10 results
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