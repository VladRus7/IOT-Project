#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include "DHT.h"

const char* ssid = "DIGIFIBRA-CEZF";
const char* password = "FbP4zGG7DUeD";
const char* serverUrl = "http://192.168.1.133:5000/api/data";

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
WebServer server(80); 

unsigned long lastTimeSent = 0;
const unsigned long interval5Min = 300000;

void handleTriggerRead() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    server.send(500, "application/json", "{\"error\":\"Sensor failure\"}");
    return;
  }
  

  String jsonResponse = "{\"temperature\":" + String(t) + ", \"humidity\":" + String(h) + "}";
  server.send(200, "application/json", jsonResponse);
  
  
  sendDataToCloud(t, h);
}

void sendDataToCloud(float t, float h) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    String payload = "{\"sensorId\":\"NODE-01\", \"temperature\":" + String(t) + ", \"humidity\":" + String(h) + "}";
    http.POST(payload);
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  Serial.print("Conectare Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectat! IP ESP32: " + WiFi.localIP().toString());
  

  server.on("/read", handleTriggerRead);
  server.begin();
}

void loop() {
  server.handleClient(); 

  unsigned long currentTime = millis();
  if (currentTime - lastTimeSent >= interval5Min) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      sendDataToCloud(t, h);
    }
    lastTimeSent = currentTime;
  }
}