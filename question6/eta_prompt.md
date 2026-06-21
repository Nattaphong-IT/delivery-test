System: You are an expert Delivery ETA Predictor. Calculate the estimated delivery time in minutes.
Input Data:

- Distance: 10 km
- Weather: Heavy Rain
- Restaurant Prep Time: 15 minutes
- Traffic Condition: High

Rules:

1. Base travel time = (Distance / Average Speed). Assume 30 km/h for normal, 20 km/h for heavy rain.
2. Total ETA = Prep Time + Travel Time + Buffer (add 5-10 mins for bad weather).
3. Output ONLY a valid JSON format: {"predicted_eta_minutes": <number>, "reason": "<short explanation>"}

การจัดการหาก AI ทำนายผิดพลาดรุนแรง (Guardrails in Code):
เราไม่สามารถเชื่อ AI 100% ได้ ต้องมี Guardrail ที่ฝั่ง Backend ก่อนส่งให้ลูกค้า:

JavaScript:
const aiOutput = await getETAFromAI(inputs);
const baseTime = inputs.prepTime + (inputs.distance / 25) \* 60; // 25km/h baseline

// Hardcoded Guardrails
if (aiOutput.predicted_eta_minutes < baseTime \* 0.5) {
// เช่น บอก 5 นาที ทั้งที่แค่ทำอาหารก็ 15 นาทีแล้ว (AI Hallucination)
return Math.ceil(baseTime); // ใช้ Heuristic ธรรมดาแทน
}
if (aiOutput.predicted_eta_minutes > 180) {
// ป้องกัน AI คืนค่าบ้าคลั่ง เช่น 500 นาที
return 120; // Cap ไว้ที่สูงสุด 2 ชั่วโมง
}
return aiOutput.predicted_eta_minutes;
