/**
 * ============================================================
 *  Begging-Rights – ESP32 Door Latch Controller
 * ============================================================
 *  Hardware:
 *    - Servo (latch)        → GPIO 16
 *    - Buzzer               → GPIO 27
 *    - LED Red  (locked)    → GPIO 25
 *    - LED Blue (unlocked)  → GPIO 4
 *    - LED Yellow (idle)    → GPIO 26
 *
 *  Backend API:
 *    GET  /api/lock/state  → { shouldOpen: bool, status: string }
 *    POST /api/lock/ack    → acknowledge door was opened / re-locked
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "10000GB/s wifi";
const char* WIFI_PASSWORD = "12345123";

// Backend base URL (no trailing slash)
// Example: "http://192.168.1.100:5001"
const char* BACKEND_URL   = "https://begging-rights.onrender.com";

// How long to keep the door unlocked (milliseconds)
const unsigned long DOOR_OPEN_DURATION_MS = 10000;  // 10 seconds

// How often to poll the backend while door is locked (milliseconds)
const unsigned long POLL_INTERVAL_MS = 2000;  // 2 seconds
// ─────────────────────────────────────────────────────────────

// ─── Pin Definitions ─────────────────────────────────────────────
#define PIN_SERVO       16
#define PIN_BUZZER      27   // was 12 (strapping pin – flash voltage!)
#define PIN_LED_RED     25   // locked   – was 0 (strapping pin – boot mode)
#define PIN_LED_BLUE     4   // unlocked
#define PIN_LED_YELLOW  26   // idle     – was 2 (strapping pin)
// ─────────────────────────────────────────────────────────────

// ─── Servo Angles ─────────────────────────────────────────────
#define SERVO_LOCKED    0    // angle when latch is engaged
#define SERVO_UNLOCKED  90   // angle when latch is retracted
// ─────────────────────────────────────────────────────────────

// ─── Buzzer Tones ─────────────────────────────────────────────────────────────
// Uses tone()/noTone() – separate timer, no conflict with servo
#define BUZZER_FREQ_OPEN   2800  // Hz – high pitched open beep (louder on passive buzzers)
#define BUZZER_FREQ_CLOSE  1800  // Hz – lower close beep
// ─────────────────────────────────────────────────────────────

Servo latchServo;

// ─── Door state machine ───────────────────────────────────────
enum DoorState {
    STATE_IDLE,       // locked, polling backend
    STATE_OPENING,    // servo moving to open
    STATE_OPEN,       // door is unlocked, timer running
    STATE_CLOSING     // servo moving back to locked
};

DoorState doorState = STATE_IDLE;
unsigned long doorOpenedAt  = 0;
unsigned long lastPollTime  = 0;

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

void setLEDs(bool red, bool blue, bool yellow) {
    digitalWrite(PIN_LED_RED,    red    ? HIGH : LOW);
    digitalWrite(PIN_LED_BLUE,   blue   ? HIGH : LOW);
    digitalWrite(PIN_LED_YELLOW, yellow ? HIGH : LOW);
}

void buzzerTone(int frequency, int durationMs) {
    tone(PIN_BUZZER, frequency, durationMs);
    delay(durationMs);
    noTone(PIN_BUZZER);
}

/** Two short beeps – door unlocking */
void beepOpen() {
    buzzerTone(BUZZER_FREQ_OPEN, 150);
    delay(80);
    buzzerTone(BUZZER_FREQ_OPEN, 150);
}

/** One low beep – door locking */
void beepClose() {
    buzzerTone(BUZZER_FREQ_CLOSE, 300);
}

// ─────────────────────────────────────────────────────────────
//  WiFi
// ─────────────────────────────────────────────────────────────

void connectWiFi() {
    Serial.print("[WiFi] Connecting to ");
    Serial.println(WIFI_SSID);

    // Clear any previous association before trying
    WiFi.disconnect(true);
    delay(100);
    WiFi.mode(WIFI_STA);
    // Pass explicit NULL password for open/unsecured networks
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    // Blink yellow while connecting – up to 30 seconds
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 60) {
        digitalWrite(PIN_LED_YELLOW, HIGH);
        delay(250);
        digitalWrite(PIN_LED_YELLOW, LOW);
        delay(250);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print("[WiFi] Connected! IP: ");
        Serial.println(WiFi.localIP());
        setLEDs(true, false, false);  // red = locked (default state)
    } else {
        Serial.printf("\n[WiFi] FAILED (status=%d) – restarting in 5s...\n",
                      WiFi.status());
        delay(5000);
        ESP.restart();
    }
}

void ensureWiFi() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Lost connection – reconnecting...");
        connectWiFi();
    }
}

// ─────────────────────────────────────────────────────────────
//  Backend communication
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/lock/state
 * Returns true if the backend says the door should open.
 */
bool pollShouldOpen() {
    ensureWiFi();
    WiFiClientSecure client;
    client.setInsecure();  // skip cert verification (fine for private IoT)
    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/lock/state";

    http.begin(client, url);
    http.setTimeout(8000);
    int code = http.GET();

    if (code == HTTP_CODE_OK) {
        String body = http.getString();
        http.end();

        StaticJsonDocument<256> doc;
        DeserializationError err = deserializeJson(doc, body);
        if (err) {
            Serial.println("[HTTP] JSON parse error");
            return false;
        }

        bool shouldOpen = doc["shouldOpen"] | false;
        const char* status = doc["status"] | "unknown";
        Serial.printf("[Poll] status=%s  shouldOpen=%s\n", status, shouldOpen ? "true" : "false");
        return shouldOpen;

    } else {
        Serial.printf("[HTTP] GET /api/lock/state failed: %d\n", code);
        http.end();
        return false;
    }
}

/**
 * POST /api/lock/ack
 * Tells the backend the door was opened and is now being re-locked.
 */
void ackOpen() {
    ensureWiFi();
    WiFiClientSecure client;
    client.setInsecure();  // skip cert verification
    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/lock/ack";

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(8000);
    int code = http.POST("{}");

    if (code == HTTP_CODE_OK) {
        Serial.println("[HTTP] ACK sent – door re-locked on backend.");
    } else {
        Serial.printf("[HTTP] POST /api/lock/ack failed: %d\n", code);
    }
    http.end();
}

// ─────────────────────────────────────────────────────────────
//  Door state machine actions
// ─────────────────────────────────────────────────────────────

void openDoor() {
    Serial.println("[Door] OPENING latch...");
    doorState = STATE_OPENING;
    setLEDs(false, false, true);          // yellow = transitioning

    // Re-attach, move, then detach to prevent jitter while door is open
    latchServo.attach(PIN_SERVO, 500, 2400);
    latchServo.write(SERVO_UNLOCKED);
    delay(700);                            // give servo time to reach position
    latchServo.detach();                  // stop PWM – eliminates jitter

    beepOpen();

    setLEDs(false, true, false);           // blue = unlocked
    doorOpenedAt = millis();
    doorState    = STATE_OPEN;
    Serial.printf("[Door] OPEN – will auto-close in %lu s\n", DOOR_OPEN_DURATION_MS / 1000);
}

void closeDoor() {
    Serial.println("[Door] CLOSING latch...");
    doorState = STATE_CLOSING;
    setLEDs(false, false, true);           // yellow = transitioning

    // Re-attach, move to locked, detach to hold position without jitter
    latchServo.attach(PIN_SERVO, 500, 2400);
    latchServo.write(SERVO_LOCKED);
    delay(700);                             // give servo time to reach position
    latchServo.detach();                   // stop PWM

    beepClose();
    ackOpen();                              // notify backend

    setLEDs(true, false, false);            // red = locked
    doorState = STATE_IDLE;
    Serial.println("[Door] LOCKED.");
}

// ─────────────────────────────────────────────────────────────
//  Backend wake-up (Render.com cold start)
// ─────────────────────────────────────────────────────────────

/**
 * Hits GET /health once on boot with a long timeout to absorb
 * Render.com cold-start delay (can take up to 30 seconds).
 * Yellow LED stays solid while waiting so you can see ESP is alive.
 */
void wakeUpBackend() {
    Serial.println("[Boot] Waking up backend (Render cold start may take ~30s)...");
    setLEDs(false, false, true);  // yellow = waking up

    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    String url = String(BACKEND_URL) + "/health";

    http.begin(client, url);
    http.setTimeout(35000);  // 35s – generous for Render cold start
    int code = http.GET();
    http.end();

    if (code == HTTP_CODE_OK) {
        Serial.println("[Boot] Backend is awake and healthy!");
    } else {
        Serial.printf("[Boot] Backend wake-up returned %d – continuing anyway.\n", code);
    }

    setLEDs(true, false, false);  // red = locked
}

// ─────────────────────────────────────────────────────────────
//  Arduino lifecycle
// ─────────────────────────────────────────────────────────────

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n=== Begging-Rights Door Latch ===");

    // ── LED pins
    pinMode(PIN_LED_RED,    OUTPUT);
    pinMode(PIN_LED_BLUE,   OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);

    // Start with all LEDs off
    setLEDs(false, false, false);

    // ── Buzzer – pinMode only, tone() needs no further setup
    pinMode(PIN_BUZZER, OUTPUT);
    noTone(PIN_BUZZER);  // ensure silent on boot

    // ── Servo – attach, lock position, then detach to prevent boot jitter
    ESP32PWM::allocateTimer(0);
    latchServo.setPeriodHertz(50);
    latchServo.attach(PIN_SERVO, 500, 2400);
    latchServo.write(SERVO_LOCKED);
    delay(700);
    latchServo.detach();  // hold locked position silently

    // ── WiFi
    connectWiFi();

    // ── Wake up Render backend (absorbs cold-start delay)
    wakeUpBackend();

    // ── Initial state: locked
    setLEDs(true, false, false);
    Serial.println("[Setup] Ready. Polling backend...");
}

void loop() {
    unsigned long now = millis();

    switch (doorState) {

        // ── IDLE: poll backend on interval ───────────────────
        case STATE_IDLE:
            if (now - lastPollTime >= POLL_INTERVAL_MS) {
                lastPollTime = now;

                // Quick yellow blink to show we're alive
                digitalWrite(PIN_LED_YELLOW, HIGH);
                delay(50);
                digitalWrite(PIN_LED_YELLOW, LOW);

                if (pollShouldOpen()) {
                    openDoor();
                }
            }
            break;

        // ── OPEN: wait for auto-close timer ──────────────────
        case STATE_OPEN:
            {
                unsigned long elapsed  = now - doorOpenedAt;

                if (elapsed >= DOOR_OPEN_DURATION_MS) {
                    closeDoor();
                }
            }
            break;

        // ── Transitional states (blocking in openDoor/closeDoor)
        case STATE_OPENING:
        case STATE_CLOSING:
            break;
    }
}
