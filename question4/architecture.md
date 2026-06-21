1.Data Flow (Protocol): - Rider ไปยัง Server: ควรใช้ MQTT เพราะถูกออกแบบมาสำหรับอุปกรณ์ที่เคลื่อนที่ สัญญาณอินเทอร์เน็ตอาจไม่เสถียร มี Overhead ต่ำ ประหยัดแบตเตอรี่ และรองรับ QoS (Quality of Service)

Server ไปยัง Customer App: ควรใช้ WebSocket หรือ Server-Sent Events (SSE) เนื่องจากเบราว์เซอร์และแอปมือถือรองรับได้ดี และเป็นการเชื่อมต่อแบบคงที่ (Persistent Connection) สำหรับการดันข้อมูลพิกัดไปให้ลูกค้า

2.Storage Strategy (ป้องกัน Disk I/O เต็ม):

Current Location (พิกัดปัจจุบัน): เก็บใน In-memory Database (Redis) โดยใช้โครงสร้างแบบ Geohash หรือ Key-Value ธรรมดา อัปเดตทับค่าเดิม (Overwrite) เพราะลูกค้าสนใจแค่พิกัด ณ วินาทีนี้ ข้อมูลไม่จำเป็นต้องลง Disk ทุกๆ 2 วินาที

Historical Tracking (สำหรับตรวจสอบย้อนหลัง): ให้ Server นำข้อมูลพิกัดส่งเข้า Message Queue (เช่น Kafka) แล้วใช้ Worker ไปดึงข้อมูลมา Batch Insert ลง NoSQL (เช่น MongoDB หรือ Cassandra) ทุกๆ 30-60 วินาที เพื่อลดภาระการเขียนลง Disk รัวๆ
i
