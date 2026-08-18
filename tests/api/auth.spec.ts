import { test } from '@playwright/test';

test.describe('Auth Module API Tests', () => {

  test('TC01: Đăng ký tài khoản thành công (Happy Path)', async ({ request: _request }) => {
    // TODO: 1. Chuẩn bị payload đăng ký hợp lệ (email ngẫu nhiên, mật khẩu mạnh)
    // TODO: 2. Gửi request POST /auth/register
    // TODO: 3. Verify status code = 201 Created (hoặc 200 OK)
    // TODO: 4. Verify response body trả về thông tin user đã tạo
  });

  test('TC02: Đăng ký thất bại khi email đã tồn tại (Duplicate Error)', async ({ request: _request }) => {
    // TODO: 1. Gửi request POST /auth/register với email đã có trong DB
    // TODO: 2. Verify status code = 409 Conflict (hoặc 400 Bad Request)
    // TODO: 3. Verify error message chuẩn RFC 9457 / format lỗi hệ thống
  });

  test('TC03: Đăng nhập thành công và nhận Access Token (Happy Path)', async ({ request: _request }) => {
    // TODO: 1. Gửi request POST /auth/login với credentials hợp lệ
    // TODO: 2. Verify status code = 200 OK
    // TODO: 3. Verify response body chứa accessToken và token type
  });

  test('TC04: Đăng nhập thất bại với sai mật khẩu (Unauthorized)', async ({ request: _request }) => {
    // TODO: 1. Gửi request POST /auth/login với mật khẩu sai
    // TODO: 2. Verify status code = 401 Unauthorized
    // TODO: 3. Verify không rò rỉ thông tin nhạy cảm trong error message
  });

  test('TC05: Refresh Token cấp mới Access Token thành công', async ({ request: _request }) => {
    // TODO: 1. Đăng nhập để lấy Refresh Token
    // TODO: 2. Gửi request POST /auth/refresh-token
    // TODO: 3. Verify status code = 200 OK và nhận được new accessToken
  });

});
