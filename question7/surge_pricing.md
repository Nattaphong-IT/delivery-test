Architecture Diagram Flow:

```
+-------------------+        +-------------------+
     |     Rider App     |        |   Customer App    |
     +--------+----------+        +---------+---------+
              |                             |
              | ส่ง Location                | ส่ง Location & Request
              +------------+   +------------+
                           |   |
                           v   v
                  +--------+---+--------+
                  |     API Gateway     |
                  +----------+----------+
                             |
                             | ส่งข้อมูล Demand (คนสั่ง) & Supply (Rider) แบบ Real-time
                             v
                  +----------+----------+
                  | Event Broker (Kafka)|
                  +----------+----------+
                             |
                             | ดูดข้อมูลไปวิเคราะห์
                             v
+----------------+  +--------+----------+
|   Weather DB   |->|  Surge AI Model   |
| (ฝนตก/จราจร)   |  | (คำนวณ Multiplier)|
+----------------+  +--------+----------+
                             |
                             | AI นำค่า Multiplier ของพื้นที่นั้น (Geohash) ไปอัปเดต
                             v
                  +----------+----------+
                  |     Redis Cache     |<-------------------+
                  +----------+----------+                    |
                                                             | Request ค่าส่ง
                  +----------+----------+                    | ดึงค่า Multiplier ทันที
                  |   Fare Calculation  |--------------------+ (ไม่ต้องรอ AI คำนวณใหม่)
                  |    (ระบบคำนวณราคา)    |
                  +----------+----------+
                             |
                             | นำ Base Fare * Surge Multiplier
                             v
                  +----------+----------+
                  |   Customer App      |
                  |  (เปิดหน้าสรุปตะกร้า)   |
                  |  โชว์ราคาที่คำนวณแล้ว   |
                  +---------------------+
```

Safety & Ethics (Hard-coded Guardrails):
การป้องกันไม่ให้ AI ทำค่าส่งพุ่งหลักพันจนโดนฟ้องร้อง ต้องครอบ Logic ที่ API ก่อนส่งราคาให้ลูกค้า:

function calculateFinalDeliveryFee(baseFee, aiSurgeMultiplier) {
const MAX_LEGAL_MULTIPLIER = 2.5; // กฎหมายหรือนโยบายบริษัทกำหนดห้ามเกิน 2.5 เท่า
const ABSOLUTE_MAX_FEE = 150; // ห้ามค่าส่งเกิน 150 บาทเด็ดขาด

    // 1. Cap ตัวคูณ
    let safeMultiplier = aiSurgeMultiplier;
    if (aiSurgeMultiplier > MAX_LEGAL_MULTIPLIER) {
        safeMultiplier = MAX_LEGAL_MULTIPLIER;
    }

    let finalFee = baseFee * safeMultiplier;

    // 2. Cap ราคาสุทธิ
    if (finalFee > ABSOLUTE_MAX_FEE) {
        finalFee = ABSOLUTE_MAX_FEE;
    }

    return finalFee;

}
