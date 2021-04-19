# Weather Station Project

Utilizing a RaspberryPi and a GrovePi Hat/sensors I wrote a Python script that stored temperature, humidity, light sensitivity, and timestamp data into a JSON file every 30 minutes. This data is then feed into a local web dashboard for visual display. The project using CanvasJS a Javascript library for creating charts and graphs, JQuery, and the GrovePi Python library.

#### Quick Dashboard
The quick dashboard section holds useful info from the dataset

![weather_station_quick_dash](https://user-images.githubusercontent.com/33650498/115182379-bfe22080-a08e-11eb-86e2-04b6e938e1dc.JPG)

#### Dashboard
The full dashboard allows users to dive deepr into the dataset using CanvasJS to create charts. The user can hover over each data point for details, zoom into sections of the chart, pan, and export the chart.

![weather_station_dash](https://user-images.githubusercontent.com/33650498/115182652-2d8e4c80-a08f-11eb-9f79-cc05df8c0edc.JPG)

#### Sorting
The dashboard uses drop down menus that allow the user to sort the data from low to high, high to low, reverse, and revert to the original. A quick sort algorithm is implemented to sort the data.

![weather_station_sorting](https://user-images.githubusercontent.com/33650498/115182802-7514d880-a08f-11eb-983e-3032900a17fa.JPG)

Relevant code snip example:
```JavaScript
/**
 * the partition function for the quick sort that loops through the left and right 
 * side of the array and swaps values as needed
 * 
 * @param {array object}  dataList	the dataset to be partitioned
 * @param {int} left  the left position of the array
 * @param {int} right the right position of the array
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
 * @param {array object} dataList the dataset being sorted
 * @param {int} left  the left position of the array
 * @param {int} right the right position of the array
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
```

#### Search
The ability to search the dataset for a specific temperature is also present. This uses a binary search algorithm to find the first instance of a matching weather value. Additionally, a linear search algorithm is used to return all instances of the matching temperature should the user desire. 

![weather_station_searchA](https://user-images.githubusercontent.com/33650498/115183071-f9fff200-a08f-11eb-87b6-2bda4b4ad4fa.JPG)

![weather_station_searchB](https://user-images.githubusercontent.com/33650498/115183077-fc624c00-a08f-11eb-8104-c76481b00c58.JPG)

Relevant code snip example:
```JavaScript
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
```
