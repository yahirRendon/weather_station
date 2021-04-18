#!/usr/bin/env python

'''
Author: Yahir Rendon 
Class: CS499
Project: Weather Station Artifact

Base code provided by GrovePi and modified for weather station
'''

import grovepi
import math
import random
import time
import json
import datetime
from grove_rgb_lcd import *

# Connect the Grove LEDs to digital ports and pinMode
green_led = 4
grovepi.pinMode(green_led, "OUTPUT")
blue_led = 3
grovepi.pinMode(blue_led, "OUTPUT")
red_led = 2
grovepi.pinMode(red_led, "OUTPUT")

# Connect the Grove Light Sensor to analog port A0
#SIG, NC, VCC, GND
light_sensor = 0
grovepi.pinMode(light_sensor, "INPUT")

# Set the light sensor to be triggered when exceeding threshold resistance
light_threshold = 20

# Connect the Grove Temperature & Humidity Sensor Pro to digital port D8
# SIG,NC,VCC,GND
dht_sensor = 8  # The Sensor goes on digital port 8.

# temp_humidity_sensor_type with blue sensor from Grove Base kit
dht_blue = 0    # The Blue colored sensor is set to 0.

# name of output file for storing temp and humidity data
outfile = 'weatherData_BellinghamWa.json'

''' 
Custom function for updating json file
data:array    - temp, humidity, light, timestamp values
'''
def write_json(data):
  with open(outfile, 'w') as f:
    json.dump(data, f, indent=4)
        
# Main program loop
while True: 
  try:
    print("\nWetSpec v1.0")
    
    # Get the light sensativity value from the light sensor
    light_value = grovepi.analogRead(light_sensor)
    
    '''
    Per requirments only collect data during daytime conditions
    '''    
    if light_value > light_threshold:
    
      # Get the temperature and humidity data and set to temp and humidity variables
      # The first parameter is the port, the second parameter is the type of sensor.
      [temp,humidity] = grovepi.dht(dht_sensor,dht_blue)
       
      # Confirm temp and humidity values are not NaN
      if math.isnan(temp) == False and math.isnan(humidity) == False:

        # Convert temp from Celcius to Fahrenheit
        temp = ((temp / 5.0) * 9.0) + 32
  
        # Turn off all prior LEDs
        grovepi.digitalWrite(green_led, 0)
        grovepi.digitalWrite(blue_led, 0)
        grovepi.digitalWrite(red_led, 0)
                 
        # Turn on light indicators per category ranges
        if temp > 95:
          # Turn on red LED
          grovepi.digitalWrite(red_led, 1)
        
        elif humidity > 80:
          # Cyan category
          grovepi.digitalWrite(green_led, 1)
          grovepi.digitalWrite(blue_led, 1)
        
        elif temp > 60 and temp < 85 and humidity < 80:
          # Green category
          grovepi.digitalWrite(green_led, 1)
    
        elif temp > 85 and temp < 95 and humidity < 80:
          # Blue category
          grovepi.digitalWrite(blue_led, 1)
    
        # Convert temp, humidity, light, datetime values to string to 
        # print to lcd display and for JSON file
        tempString = str(temp)
        humidityString = str(humidity)
        lightString = str(light_value)
        currentDateTime = str(datetime.datetime.now())
        
        # Load json file
        with open(outfile) as json_file:
          data = json.load(json_file)
          current_data = [tempString, humidityString, lightString, currentDateTime]
          temp = data.append(current_data)
        
        # Update json file
        write_json(data)
      
        # Create display text for logging updates to console
        display_text = "Temp: {tVal}F\nHumidity: {hVal}%\nLight: {lVal}F\nStamp: {sVal}%".format(tVal = tempString, hVal = humidityString, lVal = lightString, sVal = currentDateTime)

        # Print to terminal json file updated
        print("weatherdata.json updated:")
        print(display_text)
      
        # Update LCD display with last reading
        setText("Weahter Station\nT: " + tempString + "   H:" + humidityString)

    # Read sensor every 1800 seconds or every 30 minutes
    time.sleep(1800.0)

  except IOError:
    print("Error")