WITH CurrentMonthOrders AS (
    -- คำนวณ AOV เฉพาะออเดอร์ที่สำเร็จในเดือนนี้
    SELECT 
        restaurant_id,
        AVG(total_amount) AS aov
    FROM orders
    WHERE status = 'delivered' 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY restaurant_id
),
RankedRestaurants AS (
    -- นำมา Join กับตารางร้าน และจัดอันดับ
    SELECT 
        r.id AS restaurant_id,
        r.name,
        r.category_id,
        COALESCE(cmo.aov, 0) AS aov, -- จัดการกรณีไม่มีออเดอร์ให้เป็น 0
        DENSE_RANK() OVER (
            PARTITION BY r.category_id 
            ORDER BY COALESCE(cmo.aov, 0) DESC
        ) as rank
    FROM restaurants r
    LEFT JOIN CurrentMonthOrders cmo ON r.id = cmo.restaurant_id
)
-- ดึงเฉพาะ Top 3 ของแต่ละ Category
SELECT *
FROM RankedRestaurants
WHERE rank <= 3;