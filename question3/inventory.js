async function placeOrder(orderId, items) {
    const connection = await db.getConnection(); // สมมติว่าใช้ Connection Pool
    try {
        // เริ่ม Transaction
        await connection.beginTransaction();

        for (const item of items) {
            // ใช้ Atomic Update (อัปเดตพร้อมเช็คเงื่อนไขใน Query เดียว)
            // และป้องกัน SQL Injection ด้วย Parameterized Query (?)
            const [result] = await connection.query(
                `UPDATE menu 
                 SET stock = stock - ? 
                 WHERE id = ? AND stock >= ?`,
                [item.qty, item.id, item.qty]
            );

            // หาก affectedRows === 0 แปลว่า 1. ไม่พบสินค้า หรือ 2. สต็อกไม่พอ
            if (result.affectedRows === 0) {
                throw new Error(`Insufficient stock for item id: ${item.id}`);
            }
        }

        // หากตัดสต็อกสำเร็จทั้งหมด จึงสร้าง Order
        await connection.query(
            `INSERT INTO orders (id, status) VALUES (?, 'confirmed')`, 
            [orderId]
        );

        // Commit ข้อมูลลง DB
        await connection.commit();

    } catch (error) {
        // หากเกิด Error ใดๆ ให้ Rollback กลับไปจุดเริ่มต้น (สต็อกคืนกลับมา)
        await connection.rollback();
        throw error;
    } finally {
        connection.releioase();
    }
}