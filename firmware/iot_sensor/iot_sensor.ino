#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

const char* ssid = "Vlad's Iphone";
const char* password = "alupigus";
const char* serverUrl = "http://192.168.1.210:5000/api/data";

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  
  Serial.print("Conectare Wi-Fi...");
  int incercari = 0;
  while (WiFi.status() != WL_CONNECTED && incercari < 10) {
    delay(500);
    Serial.print(".");
    incercari++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConectat!");
  } else {
    Serial.println("\nWi-Fi esuat. Continui in mod Offline pentru demo.");
  }
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("Eroare la citirea senzorului!");
    return;
  }
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    String payload = "{\"temperature\":" + String(t) + ", \"humidity\":" + String(h) + "}";
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      Serial.println("Date trimise. Cod raspuns: " + String(httpResponseCode));
    } else {
      Serial.println("Eroare la trimiterea datelor.");
    }
    http.end();
  }
}
