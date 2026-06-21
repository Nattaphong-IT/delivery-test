CREATE TABLE cancellation_logs (
    id UUID PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    rider_id VARCHAR(50) NOT NULL,
    reason_id INT, -- เหตุผลที่อ้าง เช่น รถติด, ลูกค้าไม่รับสาย
    rider_lat DECIMAL(10, 7), -- พิกัดตอนกดยกเลิก
    rider_lng DECIMAL(10, 7),
    distance_to_restaurant_km DECIMAL(5, 2), -- ห่างจากร้านเท่าไหร่ตอนยกเลิก
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_suspected_fraud BOOLEAN DEFAULT FALSE
);