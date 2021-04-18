/**
 * Author: Yahir Rendon 
 * Class: CS499
 * Project: Weather Dashboard Front-End
 *
 * JavaScript using JQuery and CanvasJS
 * Home scripts
 */


// color values for theme
var light ="#FBE8A6";
var medium = " #B4DFE5";
var dark = "#303C6C";
var bright = "#F4976C";
var third = "#D2FDFF";

// Custom color set for Pie Chart
CanvasJS.addColorSet("rubricShades",
[
"#e27d60",
"#afd275",          
"#41b3a3",
"#c38d9e",
"#e8a87c"               
]);

var allData;				// store complete dataset from JSON file
var avgTemp = 0;			// store average temperature for all data in JSON
var avgHumid = 0;			// store average humidity for all data in JSON
var avgLight = 0;			// store average light sensativity for all data in JSON
var lastTemp = 0;			// store last tempearature recorded in JSON
var lastHumid = 0;			// store last humidity recorded in JSON
var dateString = "";		// store last date recorded in JSON
var dataTempHumid = [];		// array for storing global temperature and humidity for current city
var dataTemp = [];			// array for storing global temperature data for current city
var dataHumidity = [];		// array for storing global humidity data for current city
var dataLight = [];			// array for storing global light sensativity data for current city
var dataLocation = "";		// the name of the JSON file that holds the location weahter data

// Count number of reading in blue, green, red, cyan, and other 
// categories per requirements used to populate Pie Chart
var numBlueCategory = 0; 
var numGreenCategory = 0;	
var numRedCategory = 0;
var numCyanCategory = 0;
var numOtherCategory = 0;


/**
 * On window load function
 */
window.onload = function () {
	var onIndexPage = $("#body_index");

	// update page elements as needed on load
	navigationBarToggle();

	if(onIndexPage.length) {
		updateLocationTag();
		// load JSON data asynchronously and on success
		// run onLoadJSON function
		$.getJSON(dataLocation + ".json", onLoadJSON);
	} 
	
	
	goToCity();
	

}

/**
 * Once JSON data loaded successfully run function
 * 
 * @param {Array Object} data 	stores parsed JSON data loaded
 */
function onLoadJSON(data)
{
	// assign data to global variable 
	allData = data;

	// start by only displaying last day of data 
	let startDate = new Date(allData[allData.length-1][3]);
	let endDate = new Date(allData[allData.length-1][3]);
	loadChartData(startDate, endDate);

	// run when updates to chart data are needed or search functions occur
	updateDataDates();
	searchSimpleButton();
	searchAllButton();
	
}

/**
 * Load and update data actively used in charts
 * 
 * @param {Date} startDate 		the first date of data to display
 * @param {Date} endDate 		the end date of data to display
 */
function loadChartData(startDate, endDate) 
{
	// set hours on start and end date to capature 
	// full range of times within data
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);
	let firstDataDate = new Date(allData[0][3]);
	let lastDataDate = new Date(allData[allData.length-1][3]);

	// date verification within data
	if(endDate.getTime() < firstDataDate.getTime() ||
		startDate.getTime() > lastDataDate.getTime()) {
		alert("No Data for selected date(s)");

	} else {
		// clear array and variables
		dataTempHumid = [];
		dataTemp = [];
		dataHumidity = [];
		dataLight = [];
		avgTemp = 0;
		avgHumid = 0;
		avgLight = 0;

		$.each(allData, function (key, value) {
			// get individual data points from array
			let temperature = parseFloat(value[0]);
			let humidity = parseFloat(value[1]);
			let light = parseInt(value[2]);
			let dataDate = new Date(value[3]);

			// only updata arrays with data within requested date span
			if(dataDate.getTime() >= startDate.getTime() &&
				dataDate.getTime() <= endDate.getTime()) 
			{
				dataTempHumid.push({x: humidity, y: temperature});
				dataTemp.push({x: new Date(dataDate), y: temperature});
				dataHumidity.push({x: new Date(dataDate), y: humidity});
				dataLight.push({x: new Date(dataDate), y: light});
				

				// running total for averages
				avgTemp += temperature;
				avgHumid += humidity;
				avgLight += light;

				// Increment category types for values in specified zones
				if(temperature > 95) {
					numRedCategory++;
				} else if (humidity > 80) {
					numCyanCategory++;
				} else if(temperature > 60 && temperature < 85 && humidity < 80) {
					numGreenCategory++;
				}
				else if(temperature > 85 && temperature < 95 && humidity < 80) {
					numBlueCategory++;
				} else {
					numOtherCategory++;
				}
			}
		});
		
		// create charts
		createTempHumidChart(dataTempHumid);
		createTemperatureChart(dataTemp);
		createHumidityChart(dataHumidity);
		createCategoryChart(numBlueCategory, numRedCategory, numGreenCategory, numCyanCategory, numOtherCategory);
		createLightChart(dataLight);

		// calculate averages
		avgTemp = avgTemp / (dataTemp.length);;
		avgTemp = Math.round(avgTemp * 10) / 10;
		avgHumid = avgHumid / (dataHumidity.length);
		avgHumid = Math.round(avgHumid * 10) / 10;
		avgLight = avgLight / (dataLight.length);
		avgLight = Math.round(avgLight * 10) / 10;

		
		// update average reading elements
		$("#avgTemp").text(avgTemp + "° F");
		$("#avgHumid").text(avgHumid + "%");
		$("#avgLight").text(avgLight);

		// update last reading elements
		let dateString = allData[allData.length-1][3];
		let m = dateString.substring(5, 7);
		let d = dateString.substring(8, 10);
		let y = dateString.substring(0, 4);
		let hr = parseInt(dateString.substring(11, 13));
		let tm = dateString.substring(14, 16);
		let end = " AM";
		if(hr > 12) {
			hr -=12;
			end = " PM";
			
		}
		let updatedDate = m + "/" + d + "/" + y + " at " + hr + ":" + tm + end;	
		$("#lastUpdate").text(updatedDate);

		// update quick read header with date/date span being displayed
		let endDateCopy = new Date(endDate);
		endDateCopy.setHours(0, 0, 0, 0);
		let dateTitleString 
		if(startDate.getTime() === endDateCopy.getTime()) {
			dateTitleString = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear();
		} else {
			dateTitleString = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + " - " +
							  (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
		}
		$("#title_quickRead").text("Quick Readings for " + dateTitleString);

		// update quick read area with most recent temp and humid data
		let lastTemp = allData[allData.length-1][0];
		let lastHumid = allData[allData.length-1][1];
		$("#lastTemp").text(lastTemp + "° F");
		$("#lastHumid").text(lastHumid + "%");
	}
}

/**
 * update the location in local storage based on user selection
 * and update the dataset being feed into the charts
 */
function updateLocationTag() {
	if (localStorage.getItem("location") === null) {
		localStorage.setItem("location", 1);
		localStorage.setItem("locationMap", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2630.4073589444906!2d-122.50228258414916!3d48.75501661593345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485a3a8ec9ac147%3A0xe89887a8e2b60f77!2s2600%20N%20Harbor%20Loop%20Dr%2C%20Bellingham%2C%20WA%2098225!5e0!3m2!1sen!2sus!4v1608688949669!5m2!1sen!2sus");

	}
	$('#mapSource').attr('src', localStorage.getItem("locationMap"))
	let c = parseInt(localStorage.getItem("location"));
	switch (c) {
		case 1:
			$(".name").text("Bellingham, WA");
			dataLocation = "weatherData_BellinghamWa";
			// $('#mapSource').attr('src', localStorage.getItem("locationMap"))
			break;
		case 2:
			$(".name").text("Dallas, TX");
			dataLocation = "weatherData_DallasTx";
			// $('#mapSource').attr('src', localStorage.getItem("locationMap"))
			break;
			case 3:
			$(".name").text("New York, NY");
			dataLocation = "weatherData_NewYorkNy";
			// $('#mapSource').attr('src', localStorage.getItem("locationMap"))
			break;
		default:
			break;
	}
}

/**
 * toggle the display of the navigation options based
 * on user clicking the menu button
 */
function navigationBarToggle() {
	// on menuButton click check if navigation menu is hidden
	// or not and do the opposite 
	$("#menuButton").click(function () {
		if ($('.about').css('display') == 'none') {
			$(".cities").css({ display: "inline" }).show();
			$(".about").css({ display: "inline" }).show();
		} else {
			$(".cities").css({ display: "none" }).hide();
			$(".about").css({ display: "none" }).hide();
		}
	}
	)
}

/**
 * Runs when the user clicks the button to update data being displayed
 * in the charts. 
 */
function updateDataDates() {
	$("#getDatesBtn").click(function () {
		// collect dates from input fields
        let dateStartString = $("#startDateInput").val();
		let dateEndString = $("#endDateInput").val();

		// date input string validation
		let sMonth = parseInt(dateStartString.substring(0, 2));
		let sDay = parseInt(dateStartString.substring(3, 5));
		let sYear = parseInt(dateStartString.substring(6, 10));
		let eMonth = parseInt(dateEndString.substring(0, 2));
		let eDay = parseInt(dateEndString.substring(3, 5));
		let eYear = parseInt(dateEndString.substring(6, 10));
		
		// ensure dates are formated properly
		if(dateStartString.length == 10 &&  dateEndString.length == 10 &&
			dateStartString.charAt(2) == "/" && dateStartString.charAt(5) == "/" && 
			dateEndString.charAt(2) == "/" && dateEndString.charAt(5) == "/" &&
			!isNaN(sMonth) && !isNaN(sDay) && !isNaN(sYear) &&
			!isNaN(eMonth) && !isNaN(eDay) && !isNaN(eYear)) {

			// update charts if date or date span is valid
			let startDate = new Date(dateStartString);
        	let endDate = new Date(dateEndString);
        	$("#userSelectionTemp")[0].selectedIndex = 0;
			$("#userSelectionHumid")[0].selectedIndex = 0;
        	loadChartData(startDate, endDate);
		} else {
			alert("Error in date format. Please ensure dates are:\nMM/DD/YY");
		}
		
    });
}

/**
 * Runs when user clicks the button to check if a temperature is within the data set
 * use binary search alogorithm to find an instance of the temperature not all intances
 */
function searchSimpleButton() {

	$("#getTempSearchValue").click(function() {
		let x = parseInt($("#userTempValue").val());

		if(!isNaN(x)) {
			// create deep clone of dataset and run deep quicksort function
			let tData = JSON.parse(JSON.stringify(allData));  
			let tDataList = quicksortDeep(tData, 0, tData.length - 1);
			
			// run binary search function and if elemetn found inform user when
			let userSearch = binarySearch(tDataList, x, 0, tDataList.length - 1)
			if (userSearch) {
				var dateString = new Date(userSearch[1][3]);
				var m = dateString.getMonth() + 1;
				var d = dateString.getDate();
				var y = dateString.getFullYear();
				var t = parseFloat(userSearch[1][0]);
				var showDataString = "\n\nPlease note:\nthere may be additional occurences of this temperature"
				alert("Temperature of " + t + "°F \nrecorded on: " + m + "/" + d + "/" + y + showDataString)
					
			} else {
				alert("Temperature of " + x + "°F \nNOT FOUND");
			}
		} else {
			alert("Please enter a valid whole number");
		}
	});
}

/**
 * Runs when user clicks the button to check if a temperature is within the data set
 * use binary search alogorithm to find an instance of the temperature not all intances
 */
function searchAllButton() {

	$("#getTempSearchValueAll").click(function() {
		let x = parseInt($("#userTempValueAll").val());

		if(!isNaN(x)) {
			// create deep clone of dataset and run deep quicksort function
			let tData = JSON.parse(JSON.stringify(allData));  
			let tDataList = linearSearch(tData, x);
			let dataListString = "";

			console.log(tDataList[0][0]);
			if(tDataList.length > 0) {
				for(let i = 0; i < tDataList.length; i++) {
					let dateString = new Date(tDataList[i][3]);
					let m = dateString.getMonth() + 1;
					let d = dateString.getDate();
					let y = dateString.getFullYear();
					let t = parseFloat(tDataList[i][0]);
					let hh = dateString.getHours();
					dataListString += (t + "°F recorded on: " + m + "/" + d + "/" + y + "\n");
					
				}
			} else {
				dataListString = "No data found";
			}
			alert(dataListString);
			
		} else {
			alert("Please enter a valid whole number");
		}
	});
}

/**
 * 
 * @param {Array Object} dataList 			sorted data array to be searched
 * @param {int} x							the value being searched for 
 * @param {int} start 						the start of the data array index
 * @param {int} end 							the size of the data array index
 */
function binarySearch(dataList, x, start, end) {

  // Base Condition
  if (start > end) return false;

  // Find the middle index
  let mid = Math.floor((start + end) / 2);

  if (Math.floor(dataList[mid][0]) === x) { 	
	  return [true, dataList[mid]];
  }

  // If element at mid is greater than x,
  // search in the left half of mid
  if (Math.floor(dataList[mid][0]) > x) {
	return binarySearch(dataList, x, start, mid - 1);
  } else {

    // If element at mid is smaller than x,
    // search in the right half of mid
	return binarySearch(dataList, x, mid + 1, end);
  }
}

/**
 * Algorithm for searching through full dataset and returning
 * new array with the objectst that match search conditon
 * 
 * @param {Array Object} dataList		the dataset being searched through
 * @param {int}	x						the value being searched for
 */
function linearSearch(dataList, x) {
	let newArray = [];
	
	for(let i = 0; i < dataList.length; i++) {
		let currentX = Math.floor(parseFloat(dataList[i][0]));
		if(x == currentX) {
			newArray.push(dataList[i]);
		}
	}
	return newArray;
}

/**
 * algorithm for reversing the order of a 2D array
 * the first value remains in asccending order
 * the second value is reversed
 * 
 * @param {Array object} dataList		the array to reverse 
 */
function reverseData(dataList) {
	// create empty array
	let newArray = [];

	// loop through array in reverse and update new array
	for (var i = dataList.length - 1; i >= 0; i--) {
		newArray.push({ x: (dataList.length - 1) - i, y: dataList[i].y });
	}
	
	// return the new array that has been reversed
	return newArray;

}

/**
 * The partition for the quicksortDeep algorithm
 * 
 * @param {Array Object} dataList 	the data array 
 * @param {int} left 				the right position of the array
 * @param {int} right 				the right position of the array
 */
function partitionDeep(dataList, left, right) {
	let temp = 0; // for swaping
	let pivot = dataList[Math.floor((right + left) / 2)][0], //middle element
		i = left, //left pointer
		j = right; //right pointer

	while (i <= j) {
		while (dataList[i][0] < pivot) {
			i++;
		}
		while (dataList[j][0] > pivot) {
			j--;
		}
		if (i <= j) {
			//swap values
			temp = dataList[i];
			dataList[i] = dataList[j];
			dataList[j] = temp;
			i++;
			j--;
		}
	}
	return i;
}

/**
 * The quicksort alogrithm that swaps entire array objects while
 * performing the search
 * 
 * @param {Array Object} dataList 	the data array 
 * @param {int} left 				the left position of the array
 * @param {int} right 				the right position of the array
 */
function quicksortDeep(dataList, left, right) {
	let index;
	if (dataList.length > 1) {
		index = partitionDeep(dataList, left, right); //index returned from the partition
		if (left < index - 1) { //more elements on the left side of the pivot
			quicksortDeep(dataList, left, index - 1);
		}
		if (index < right) { //more elements on the right side of the pivot
			quicksortDeep(dataList, index, right);
		}
	}
	return dataList;
}

/**
 * the partition function for the quick sort that loops through the left and right 
 * side of the array and swaps values as needed
 * 
 * @param {array object} dataList	the dataset to be partitioned
 * @param {int} left				the left position of the array
 * @param {int} right 				the right position of the array
 */
function partition(dataList, left, right) {
	let temp = 0;
	let pivot = dataList[Math.floor((right + left) / 2)].y, //middle element
		i = left, //left pointer
		j = right; //right pointer

	while (i <= j) {
		while (dataList[i].y < pivot) {
			i++;
		}
		while (dataList[j].y > pivot) {
			j--;
		}
		if (i <= j) {
			//swap values
			temp = dataList[i].y;
			dataList[i].y = dataList[j].y;
			dataList[j].y = temp;

			i++;
			j--;
		}
	}
	return i;
}

/**
 * recursive quicksort function for sorting data
 * 
 * @param {array object} dataList 	the dataset being sorted
 * @param {int} left 				the left position of the array
 * @param {int} right 				the right position of the array
 */
function quicksort(dataList, left, right) {
	let index;
	if (dataList.length > 1) {
		index = partition(dataList, left, right); //index returned from partition
		if (left < index - 1) { //more elements on the left side of the pivot
			quicksort(dataList, left, index - 1);
		}
		if (index < right) { //more elements on the right side of the pivot
			quicksort(dataList, index, right);
		}
	}
	return dataList;
}

/**
 * An algorthim for reindexing the x value within a key value  
 * pair array object from low to high
 * 
 * @param {Array Object} dataList 	the dataset being sorted
 */
function reindexData(dataList) {
	// create empty array
	var newArray = [];

	// loop through array in reverse and update new array
	for (var i = 0; i < dataList.length; i++) {
		newArray.push({ x: i, y: dataList[i].y});
	}
	
	// return the new array that has been reversed
	return newArray;
}

/**
 * based on user city selection update local storage with selection
 * and reopen page to update data and elements. 
 */
function goToCity() {
	// update local storage based on selected user city
	// Bellingham, WA
	$(".city_a, #city_a").click(function () {
		localStorage.setItem("location", 1);
		localStorage.setItem("locationMap", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2630.4073589444906!2d-122.50228258414916!3d48.75501661593345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485a3a8ec9ac147%3A0xe89887a8e2b60f77!2s2600%20N%20Harbor%20Loop%20Dr%2C%20Bellingham%2C%20WA%2098225!5e0!3m2!1sen!2sus!4v1608688949669!5m2!1sen!2sus");
		window.location.href = "index.html";
	})

	// Dallas, Texas
	$(".city_b, #city_b").click(function () {
		console.log("Dallas, TX");
		localStorage.setItem("location", 2);
		localStorage.setItem("locationMap", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d838.6061160339656!2d-96.79586569423745!3d32.781002798748084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDQ2JzUxLjYiTiA5NsKwNDcnNDMuMSJX!5e0!3m2!1sen!2sus!4v1616572057582!5m2!1sen!2sus");
		window.location.href = "index.html";
	})

	// New York, NY
	$(".city_c, #city_c").click(function () {
		console.log("New York, NY");
		localStorage.setItem("location", 3);
		localStorage.setItem("locationMap", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.1622023779264!2d-73.9719318843005!3d40.78044807932456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ2JzQ5LjYiTiA3M8KwNTgnMTEuMSJX!5e0!3m2!1sen!2sus!4v1616571959906!5m2!1sen!2sus");
		window.location.href = "index.html";
	})
	$("#userSelectionTemp")[0].selectedIndex = 0;
	$("#userSelectionHumid")[0].selectedIndex = 0;
}

/**
 * Create chart for temperature and humidty data
 * 
 * @param {Array Object} dataH 		the data the populates the chart
 */
function createTempHumidChart(dataTH) {
	var optionsTempHum = {
		backgroundColor: light,
		exportEnabled: true,
		animationEnabled: true,
		zoomEnabled: true,
		title:{
			fontFamily:"Montserrat",
			fontColor: "#000",
			fontStyle: "normal",
			text:"Temperature and Humidity"
		},

		axisX:{
			fontFamily:"Montserrat",
			titleFontColor: dark,
			labelFontColor: "#000",
			lineColor: bright,
			tickColor: bright,
			title: "Temperature (F)"
		},
		axisY:{
			fontFamily:"Montserrat",
			titleFontColor: dark,
			labelFontColor: "#000",
			gridColor: bright,
			lineColor: bright,
			tickColor: bright,
			title: "Humidity (%)"
		},
		toolTip: {
			fontColor: dark,
		},
		data: [{
			type: "scatter",
			color: dark,
			dataPoints : dataTH
		}]
	};
	(new CanvasJS.Chart("containerTempHumid", optionsTempHum)).render();
}

/**
 * Create the chart for temerature data set
 * 
 * @param {Array object} dataT 	the data the populates the chart
 */
function createTemperatureChart(dataT) {
	var optionsTemp = {
		backgroundColor: light,
		exportEnabled: true,
		animationEnabled: true,
		zoomEnabled: true,
		title: {
			fontFamily: "Montserrat",
			fontWeight: "normal",
			text: "Temperature",
		},
		axisX: {
			titleFontColor: dark,
			labelFontColor: "#000",
			lineColor: bright,
			tickColor: bright,
			title: "Time"
		},
		axisY: {
			titleFontColor: dark,
			labelFontColor: "#000",
			gridColor: bright,
			lineColor: bright,
			tickColor: bright,
			suffix: "°",
			title: "Temperature (F)"
		},
		toolTip: {
			fontColor: dark,
		},
		data: [
			{
				type: "area", 
				color: medium,
				xValueFormatString: "hh:mm:ss tt",
				dataPoints: dataT
			}
		]
	};
	(new CanvasJS.Chart("containerTemp", optionsTemp)).render();

	/**
	 * On dropdown menu selection change update the way
	 * temperature data is displayed
	 * 
	 * @param: function		the function for updating data and display elements
	 */
	$(".dropDownTemp").change(function () {
		// get dropdown menu and selection from document
		var ddt = document.getElementById("userSelectionTemp");
		var selected = parseInt(ddt.options[ddt.selectedIndex].value);

		// clear dataPoints in the chart
		optionsTemp.data[0].dataPoints = [];

		// based on usere selection display original, reverse, or sorted data
		switch (selected) {
			// Original dataset as collected in JSON file for temperature
			case 1:
				optionsTemp.data[0].dataPoints = dataT;
				optionsTemp.data[0].xValueFormatString = "hh:mm:ss tt";
				optionsTemp.axisX.title = "Time";
				break;
			
			// Reverse the dataset for temperature 
			case 2:	
				var tData = JSON.parse(JSON.stringify(dataT)); // create deep clone
				var revData = reverseData(tData);
				optionsTemp.data[0].dataPoints = revData;
				optionsTemp.data[0].xValueFormatString = "";
				optionsTemp.axisX.title = "Readings Reversed";
				break;

			// Quicksort run on temperature dataset low - high
			case 3:
				var tData = JSON.parse(JSON.stringify(dataT)); // create deep clone 
				var sortData = quicksort(tData, 0, tData.length - 1);
				optionsTemp.data[0].dataPoints = reindexData(sortData);
				optionsTemp.data[0].xValueFormatString = "";
				optionsTemp.axisX.title = "Sorted by Temperature Value L to H";
				break;
			
			// Quicksort run on temperature dataset high - low
			case 4:
				var tData = JSON.parse(JSON.stringify(dataT)); // create deep clone 
				var sortData = quicksort(tData, 0, tData.length - 1);
				optionsTemp.data[0].dataPoints = reverseData(sortData);
				optionsTemp.data[0].xValueFormatString = "";
				optionsTemp.axisX.title = "Sorted by Temperature Value H to L";
				break;
			default:
		}
		// re-redner chart with updated options
		(new CanvasJS.Chart("containerTemp", optionsTemp)).render();
	});
}

/**
 * Create the chart for humidity data
 * 
 * @param {Array Object} dataH 	the data the populates the chart
 */
function createHumidityChart(dataH) {
	var optionsHumidity = {
		backgroundColor: light,
		exportEnabled: true,
		animationEnabled: true,
		zoomEnabled: true,
		title: {
			fontFamily: "Montserrat",
			fontWeight: "normal",
			text: "Humidity",
		},
		axisX: {
			titleFontColor: dark,
			labelFontColor: "#000",
			lineColor: bright,
			tickColor: bright,
			title: "Time"
		},
		axisY: {
			titleFontColor: dark,
			labelFontColor: "#000",
			gridColor: bright,
			lineColor: bright,
			tickColor: bright,
			suffix: "%",
			title: "Humidity"
		},
		toolTip: {
			fontColor: dark,
		},
		data: [
			{
				type: "area", 
				color: medium,
				xValueFormatString: "hh:mm:ss tt",
				dataPoints: dataH
			}
		]
	};
	(new CanvasJS.Chart("containerHumid", optionsHumidity)).render();

	/**
		 * On dropdown menu selection change update the way
		 * temperature data is displayed
		 * 
		 * @param: function		the function for updating data and display elements
		 */
		$(".dropDownHumid").change(function () {
			// get dropdown menu and selection from document
			var ddt = document.getElementById("userSelectionHumid");
			var selected = parseInt(ddt.options[ddt.selectedIndex].value);
			console.log(selected);
			// clear dataPoints in the chart
			optionsHumidity.data[0].dataPoints = [];

			// based on usere selection display original, reverse, or sorted data
			switch (selected) {
				// Original dataset as collected in JSON file for temperature
				case 1:
					optionsHumidity.data[0].dataPoints = dataH;
					optionsHumidity.data[0].xValueFormatString = "hh:mm:ss tt";
					optionsHumidity.axisX.title = "Time";
					break;
				
				// Reverse the dataset for temperature 
				case 2:	
					var tData = JSON.parse(JSON.stringify(dataH)); // create deep clone
					var revData = reverseData(tData);
					optionsHumidity.data[0].dataPoints = revData;
					optionsHumidity.data[0].xValueFormatString = "";
					optionsHumidity.axisX.title = "Readings Reversed";
					break;

				// Quicksort run on temperature dataset low - high
				case 3:
					var tData = JSON.parse(JSON.stringify(dataH)); // create deep clone 
					var sortData = quicksort(tData, 0, tData.length - 1);
					optionsHumidity.data[0].dataPoints = reindexData(sortData);
					optionsHumidity.data[0].xValueFormatString = "";
					optionsHumidity.axisX.title = "Sorted by Humidty Value L to H";
					break;
				
				// Quicksort run on temperature dataset high - low
				case 4:
					var tData = JSON.parse(JSON.stringify(dataH)); // create deep clone 
					var sortData = quicksort(tData, 0, tData.length - 1);
					optionsHumidity.data[0].dataPoints = reverseData(sortData);
					optionsHumidity.data[0].xValueFormatString = "";
					optionsHumidity.axisX.title = "Sorted by Humidity Value H to L";
					break;
				default:
			}
			// re-redner chart with updated options
			(new CanvasJS.Chart("containerHumid", optionsHumidity)).render();
		});
}

/**
 * Create the chart for category values (Pie chart)
 * 
 * @param {int} blueCat 		the number of blue category datapoints
 * @param {int} redCat 			the number of red category datapoints
 * @param {int} greenCat 		the number of green category datapoints
 * @param {int} cyanCat 		the number of cyan category datapoints
 * @param {int} otherCat 		the number of other category datapoints
 */
function createCategoryChart(blueCat, redCat, greenCat, cyanCat, otherCat) {
	// Pie Chart for number of readings within each category
	var optionsGroup = {
		colorSet:"rubricShades",
		backgroundColor: light,
		title:{
			fontFamily:"Montserrat",
			fontColor: "#000",
			fontStyle: "normal",
			text: "Weather by Category"
		},
		legend: {
			fontColor: dark,
			maxWidth: 500,
			itemWidth: 240
		},
		data: [
		{
			type: "pie",
			showInLegend: true,

			toolTipContent: "{label} - #percent %",
			legendText: "{label}",
			dataPoints: [
			{ y: blueCat, indexLabel: "High Temp", label: "Temp > 85F and < 95F, and Humidity < 80%" },
			{ y: redCat, indexLabel: "Very High Temp", label: "Temp > 95F" },
			{ y: greenCat, indexLabel: "Mid-High Temp", label: "Temp > 60F and < 85F, and Humidity < 80%" },
			{ y: cyanCat, indexLabel: "High Humidity", label: "Humidity > 80%"},
			{ y: otherCat, indexLabel: "Other", label: "Other"}

			]
		}
		]
	};
	(new CanvasJS.Chart("containerCategory", optionsGroup)).render();
}

/**
 * Createt he chart for the light sensativity data
 * 
 * @param {Array Object} dataL 		the data the populates the chart
 */
function createLightChart(dataL) {
	var optionsLight = {
		backgroundColor: light,
		exportEnabled: true,
		animationEnabled: true,
		zoomEnabled: true,
		title: {
			fontFamily: "Montserrat",
			fontWeight: "normal",
			text: "Light Sensativity",
		},
		axisX: {
			titleFontColor: dark,
			labelFontColor: dark,
			lineColor: bright,
			tickColor: bright,
			title: "Time"
		},
		axisY: {
			titleFontColor: dark,
			labelFontColor: dark,
			gridColor: bright,
			lineColor: bright,
			tickColor: bright,
			title: "Light Value"
		},
		toolTip: {
			fontColor: dark,
		},
		data: [
			{
				type: "area", 
				color: medium,
				xValueFormatString: "hh:mm:ss tt",
				dataPoints: dataL
			}
		]
	};
	(new CanvasJS.Chart("containerLight", optionsLight)).render();
}