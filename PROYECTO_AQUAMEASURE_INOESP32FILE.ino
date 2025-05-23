#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define TRIG_PIN 25//DECLARACION DE PINES
#define ECHO_PIN 21
#define DHT_PIN 4
#define DHT_TYPE DHT11

const char* ssid = "";//CREDENCIALES WIFI
const char* password = "";

DHT dht(DHT_PIN, DHT_TYPE);

float alturaTinaco = 114.0; //PARAMETROS DEL TINACO
float capacidadLitros = 750.0;//PARA CALCULOS POSTERIORES

unsigned long previousMillis = 0;//INTERVALO DE ENVIO
const long interval = 30000; // Y LECTURA DE DATOS

//LINK DE INSERCION DE DATOS EN EL API
const char* serverURL = "";

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT); // CONFIGURACIÓN DE PINES
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password); //CONEXION A WIFI
  Serial.print("Conectando a WiFi");//DE LA ESP-32

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\n✅ Conectado a WiFi!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  dht.begin();
  Serial.println("✅ Dispositivo funcionando correctamente.");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    enviarDatosAServidor();
  }

  delay(1000);
}

void enviarDatosAServidor() {
  float temperatura = dht.readTemperature();
  float distancia = medirDistancia();
  float nivelAgua = alturaTinaco - distancia;
  float cantidadAgua = (nivelAgua / alturaTinaco) * capacidadLitros;
  float porcentajeLlenado = (nivelAgua / alturaTinaco) * 100;

  StaticJsonDocument<256> json;
  json["temp"] = temperatura;
  json["dist"] = distancia;
  json["nivelAgua"] = nivelAgua;
  json["cantidadAgua"] = cantidadAgua;
  json["porcentajeLlenado"] = porcentajeLlenado;

  String jsonStr;
  serializeJson(json, jsonStr);

  Serial.println("📤 Enviando datos al servidor...");
  Serial.println("📦 JSON:");
  Serial.println(jsonStr);

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonStr);

  if (httpResponseCode > 0) {
    Serial.println("✅ Datos enviados correctamente.");
    Serial.println("📨 Respuesta del servidor:");
    Serial.println(http.getString());
  } else {
    Serial.print("❌ Error HTTP: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  float duracion = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duracion == 0) {
    Serial.println("❌ No se detectó eco.");
    return alturaTinaco; // valor por defecto
  }

  float distancia = (duracion * 0.0343) / 2;
  Serial.print("✅ Distancia medida: ");
  Serial.print(distancia);
  Serial.println(" cm");
  return distancia;
}
