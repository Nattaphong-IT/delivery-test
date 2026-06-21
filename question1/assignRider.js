// Helper: Haversine formula (คืนค่าเป็นกิโลเมตร)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // รัศมีโลก (กิโลเมตร)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
}

function assignRider(order, riders) {
    const NOW = Date.now();
    const STALE_LIMIT_MS = 2 * 60 * 1000; // 2 นาที

    // 1. กรอง Stale Data ออก
    let availableRiders = riders.filter(r => (NOW - r.lastUpdated) <= STALE_LIMIT_MS);

    // 2. คำนวณระยะทาง
    availableRiders = availableRiders.map(rider => {
        const distance = getDistanceFromLatLonInKm(
            order.restaurantLat, order.restaurantLng,
            rider.lat, rider.lng
        );
        return { ...rider, distance };
    });

    // 3. กรองระยะทางเกิน 5 กม. (สำหรับการค้นหารอบแรก)
    let candidates = availableRiders.filter(r => r.distance <= 5.0);

    // 4. Edge Case: ไม่มี Rider ใน 5 กม.
    if (candidates.length === 0) {
        return handleEdgeCaseNoRider(order, availableRiders);
    }

    // 5. เรียงลำดับ (Distance & Tie-breaker)
    candidates.sort((a, b) => {
        const diff = Math.abs(a.distance - b.distance);
        if (diff <= 0.5) {
            // ถ้าระยะทางห่างกันไม่เกิน 500m ให้คน Rating สูงกว่าชนะ (Descending)
            return b.rating - a.rating;
        }
        // เรียงตามระยะทางจากน้อยไปมาก (Ascending)
        return a.distance - b.distance;
    });

    return candidates[0]; // คืนค่า Rider ที่เหมาะสมที่สุด
}

function handleEdgeCaseNoRider(order, allAvailableRiders) {
    // ขยายรัศมีเป็น 10 กม.
    let expandedCandidates = allAvailableRiders.filter(r => r.distance <= 10.0);
    if (expandedCandidates.length > 0) {
        // ... (Logic การเรียงลำดับเหมือนเดิม) เรียงตามระยะทาง
        expandedCandidates.sort((a, b) => a.distance - b.distance);
        // *หมายเหตุในระบบจริงควร trigger event เพื่อเพิ่มค่ารอบให้ Rider คนนี้ด้วย
        return { ...expandedCandidates[0], _isExpandedRadius: true, _bonusAdded: true };
    }
    return null; // ต้องเข้าคิวและรอ Retry ในอีก 30 วินาที
}