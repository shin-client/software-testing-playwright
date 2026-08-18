import { test } from '../../fixtures/api.fixture.js';

test.describe('Booking Module API Tests', () => {

  test('TC06: Đặt giữ chỗ xem phim thành công (Reserve Seats)', async ({ authRequest: _authRequest }) => {
    // TODO: 1. Chuẩn bị payload: showId, danh sách seatIds
    // TODO: 2. Gửi request POST /booking/reserve với authRequest (có Bearer Token)
    // TODO: 3. Verify status code = 200 OK / 201 Created
    // TODO: 4. Verify bookingId được tạo và trạng thái ghế chuyển sang PENDING / LOCKED
  });

  test('TC07: Trùng ghế - Giữ chỗ thất bại khi ghế đã có người giữ (Conflict / Lock)', async ({ authRequest: _authRequest }) => {
    // TODO: 1. Gọi API giữ ghế A1 thành công
    // TODO: 2. Gọi lại API giữ ghế A1 với user khác hoặc cùng user
    // TODO: 3. Verify status code = 409 Conflict
    // TODO: 4. Verify hệ thống Redlock ngăn chặn Race Condition thành công
  });

  test('TC08: Webhook thanh toán PayOS thành công chuyển trạng thái CONFIRMED', async ({ request: _request }) => {
    // TODO: 1. Giả lập payload webhook từ PayOS (orderCode, payment status, signature)
    // TODO: 2. Gửi request POST /booking/payos-webhook
    // TODO: 3. Verify status code = 200 OK
    // TODO: 4. Verify trạng thái booking trong hệ thống đã cập nhật sang CONFIRMED
  });

  test('TC09: Kiểm tra Rate Limiting (Spam request)', async ({ request: _request }) => {
    // TODO: 1. Gửi liên tiếp 100 requests trong 1 giây đến endpoint công khai
    // TODO: 2. Verify các request vượt ngưỡng nhận status code 429 Too Many Requests
  });

});
