#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("--- ACTIVe ---");
  Serial.println("Write T for results");
}

void loop() {

  if (Serial.available() > 0) {
    char comanda = Serial.read();

    if (comanda == 'T' || comanda == 't') {
      Serial.println("Reading....");
      
      float t = dht.readTemperature();
      float h = dht.readHumidity();

      if (isnan(t)) {
        Serial.println("Error! Can not read the sensor");
      } else {
        Serial.print("Temperature: ");
        Serial.print(t);
        Serial.println(" C");
        Serial.print("Humidity: ");
        Serial.print(h);
        Serial.println(" %");
      }
    }
  }
}