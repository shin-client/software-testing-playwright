# Đồ Án Môn Học: Kiểm Thử Phần Mềm (Software Testing)

## Đề Tài: Tự Động Hóa Kiểm Thử (Automation Testing) Với Playwright

> **Trường:** Cao Đẳng Kỹ Thuật Cao Thắng  
> **Khoa:** Công Nghệ Thông Tin  
> **Môn:** Kiểm thử phần mềm  
> **Giảng viên hướng dẫn:** Thầy Nguyễn Hoàng Việt  
> **Công nghệ nghiên cứu chính:** Playwright Test Framework (Microsoft)  
> **Kiến trúc thực thi:** Dual-Engine (API Automation Testing + Web UI Automation Testing)  
> **Đối chiếu & So sánh:** Selenium WebDriver, Cypress, TestComplete (SmartBear)

---

## 1. Tổng Quan Kiến Trúc Khung Kiểm Thử (Architecture Overview)

Dự án áp dụng mô hình **Dual-Engine SDET Framework** được thiết kế theo nguyên tắc **20/80 Pareto Protocol**, tập trung vào các luồng nghiệp vụ phức tạp, kiểm thử đồng thời và kiểm định giao diện thực chiến:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PLAYWRIGHT TEST RUNNER (Node.js/Bun)                  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│          API AUTOMATION ENGINE       │        WEB UI AUTOMATION ENGINE      │
│  (APIRequestContext - Zero Browser)  │   (Chrome DevTools Protocol - CDP)   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Auth Lifecycle & Token Rotation    │ • Page Object Model (POM & COM)      │
│ • High-Contention Concurrency Test   │ • Network Interception (page.route)  │
│ • Idempotency & Pessimistic Locking  │ • Trace Viewer Post-Mortem Analysis  │
│ • RFC 9457 & Rate Limiting (429)     │ • Visual Regression & Dynamic Masking│
├──────────────────────────────────────┴──────────────────────────────────────┤
│                     REPORTING, CI/CD & ARTIFACT PIPELINE                    │
│      • Playwright HTML Report  • Trace Viewer  • GitHub Actions CI/CD       │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Tầng API Automation (Primary Engine):** Kiểm thử trực tiếp backend `ticket-booking` (`http://localhost:3000`) thông qua `APIRequestContext`. Tốc độ thực thi siêu tốc ($0\%$ RAM overhead cho browser), hỗ trợ kiểm thử bão request đồng thời kiểm chứng khóa phân tán **Redis Redlock**.
- **Tầng Web UI Automation (E-Commerce Engine):** Kiểm thử giao diện trên hệ thống thương mại điện tử **SauceDemo Swag Labs** (`https://www.saucedemo.com`) với kiến trúc Page Object Model (POM), Network Mocking tầng CDP và Visual Regression Testing.

---

## 2. Cấu Trúc Thư Mục Chuẩn SDET (Project Structure)

```text
software-testing-playwright/
├── .github/workflows/         # CI/CD pipeline tự động chạy test trên GitHub Actions
│   └── test.yml
├── docs/                      # Tài liệu nghiên cứu, đặc tả WBS & quản trị dự án
│   └── wbs/                   # SSOT Master WBS & Các tài liệu đặc tả WBS
│       ├── Team_Work_Breakdown_and_Contribution_Matrix_Template.md # SSOT Kế hoạch & Ma trận đóng góp
│       ├── WBS_1_1_Playwright_Overview_and_Core_Concepts.md
│       ├── WBS_1_2_Playwright_Pros_Cons_and_Applications.md
│       ├── WBS_1_3_Playwright_Installation_and_Tooling_Guide.md
│       ├── WBS_1_4_Web_UI_and_API_Core_Capabilities.md
│       ├── WBS_1_5_Playwright_vs_TestComplete_Comparison.md
│       ├── WBS_1_6_Multi_Project_Framework_Setup_and_CI.md
│       └── WBS_4_2_Slide_Presentation_Design.md
├── fixtures/                  # Custom Fixtures, Data Factory & Storage State
│   └── api.fixture.ts         # Service Object Model, Token Injection & Cleanup
├── pages/                     # Page Object Model (POM) & Component Objects (COM)
│   ├── components/            # UI Components dùng chung (Navbar, Cart Badge)
│   │   └── navbar.component.ts
│   ├── login.page.ts          # Page Object: Đăng nhập
│   ├── inventory.page.ts      # Page Object: Danh sách sản phẩm & Bộ lọc
│   ├── cart.page.ts           # Page Object: Giỏ hàng
│   ├── checkout-step-one.page.ts # Page Object: Điền thông tin giao hàng
│   ├── checkout-step-two.page.ts # Page Object: Xác nhận & Tính toán thuế
│   └── checkout-complete.page.ts # Page Object: Hoàn tất đơn hàng
├── tests/
│   ├── api/                   # Bộ kịch bản API Testing (ticket-booking backend)
│   │   ├── auth.spec.ts       # WBS 2.1: Auth Lifecycle & Token Rotation
│   │   ├── concurrency.spec.ts# WBS 2.2: Concurrency & Redis Redlock Race Condition
│   │   ├── booking.spec.ts    # WBS 2.3: Booking Transaction & Idempotency
│   │   └── error.spec.ts      # WBS 2.4: RFC 9457 Problem Details & Rate Limiting
│   └── e2e/                   # Bộ kịch bản Web UI Testing (SauceDemo)
│       ├── checkout.spec.ts   # WBS 3.1: Full E2E Checkout Flow POM
│       ├── network.spec.ts    # WBS 3.2: Network Mocking page.route() & Error
│       ├── glitch.spec.ts     # WBS 3.3: Trace Viewer Post-Mortem Analysis
│       └── visual.spec.ts     # WBS 3.4: Visual Regression & Dynamic Masking
├── playwright.config.ts       # Cấu hình Multi-Project (API, Chromium, Firefox, WebKit)
├── tsconfig.json              # Cấu hình TypeScript
├── package.json               # Dependencies & NPM Test Scripts
└── .env.example               # Mẫu biến môi trường (BASE_URL, Credentials)
```

---

## 3. Hướng Dẫn Cài Đặt & Chạy Kiểm Thử (Getting Started)

### Bước 1: Cài đặt dependencies và Trình duyệt

```bash
# 1. Cài đặt các gói phụ thuộc (ưu tiên dùng bun hoặc npm)
bun install
# hoặc: npm install

# 2. Tải các trình duyệt Playwright binaries (Chromium, Firefox, WebKit)
bunx playwright install --with-deps
# hoặc: npx playwright install --with-deps
```

### Bước 2: Thiết lập biến môi trường

```bash
cp .env.example .env
```

### Bước 3: Thực thi kiểm thử (Test Execution Commands)

```bash
# 1. Chạy toàn bộ kịch bản kiểm thử API
bun run test:api
# hoặc: npm run test:api

# 2. Chạy toàn bộ kịch bản kiểm thử Web UI
bun run test:e2e
# hoặc: npm run test:e2e

# 3. Chạy toàn bộ Test Suite (Cả API và UI song song)
bun test
# hoặc: bunx playwright test

# 4. Mở chế độ trực quan tương tác (Playwright UI Mode)
bun run test:ui
# hoặc: bunx playwright test --ui

# 5. Xem báo cáo kiểm thử trực quan dạng HTML
bun run report
# hoặc: bunx playwright show-report

# 6. Mở trình phân tích lỗi trực quan Trace Viewer
bunx playwright show-trace playwright-report/trace.zip
```

---

## 4. Danh Mục Ca Kiểm Thử Thực Chiến (High-Leverage Test Cases)

### A. Tầng API Testing (`tests/api/` - Target: `ticket-booking`)

1. **WBS 2.1 - Auth Lifecycle & Single-use Token Rotation:**
   `Register` $\to$ `Login` $\to$ Trích xuất JWT & SHA-256 Refresh Token $\to$ `Get Profile` $\to$ `Refresh Token` $\to$ Kiểm tra Replay Attack (Assert 401 khi dùng lại token cũ) $\to$ `Logout All`.
2. **WBS 2.2 - High-Contention Concurrency & Redis Redlock:**
   Dùng `Promise.all()` bắn bão đồng thời 10 requests giữ cùng 1 ghế VIP trong đúng $1\text{ms}$ $\to$ Assert đúng 1 request thành công ($201$) và 9 requests bị từ chối ($409$ Conflict) $\to$ Kiểm tra Database không bao giờ bị Double-booking.
3. **WBS 2.3 - End-to-End Booking & Idempotency Boundary:**
   Thực hiện giữ ghế $\to$ Confirm thanh toán với `Idempotency-Key` $\to$ Gửi lại đúng key đó (Assert $200$ OK không trừ tiền lần 2) $\to$ Cố tình gửi sai số tiền thanh toán (Assert $400$ Bad Request và kích hoạt `requires_refund`).
4. **WBS 2.4 - RFC 9457 Problem Details & Rate Limiting Throttler:**
   Dùng Zod Schema kiểm định cấu trúc lỗi chuẩn `application/problem+json` $\to$ Bắn liên tiếp 15 requests vào `/auth/login` để kích hoạt `CustomThrottlerGuard` $\to$ Assert $429$ Too Many Requests kèm header `Retry-After`.

### B. Tầng Web UI Testing (`tests/e2e/` - Target: SauceDemo)

1. **WBS 3.1 - Full E2E Checkout Flow với Page Object Model:**
   Đăng nhập `standard_user` $\to$ Lọc theo giá `Price (low to high)` $\to$ Thêm 2 món hàng $\to$ Assert giỏ hàng $\to$ Điền form thanh toán $\to$ Assert tính đúng thuế $8\%$ và tổng tiền `Total = Item total + Tax` $\to$ Hoàn tất đơn hàng.
2. **WBS 3.2 - Network Interception `page.route()` & Error Resilience:**
   Dùng `page.route()` can thiệp tầng CDP chặn bắt request ảnh `**/*.jpg` và mock trả về HTTP 500 $\to$ Assert giao diện hiển thị ảnh fallback an toàn $\to$ Đăng nhập tài khoản `locked_out_user` $\to$ Assert thông báo lỗi khóa tài khoản.
3. **WBS 3.3 - Post-Mortem Diagnostics với Trace Viewer:**
   Đăng nhập `performance_glitch_user` (bị nghẽn mạng $5000\text{ms}$) $\to$ Kiểm chứng Auto-waiting tự động polling vượt qua test case mà không cần sleep cứng $\to$ Xuất `trace.zip` và xem 4 luồng dữ liệu lỗi.
4. **WBS 3.4 - Visual Regression Testing & Dynamic Data Masking:**
   So khớp pixel giao diện trang thanh toán `expect(page).toHaveScreenshot()` với Baseline chuẩn $\to$ Áp dụng Dynamic Masking che vùng dữ liệu biến động $\to$ Thử nghiệm với tài khoản `visual_user` (bị lỗi CSS) $\to$ Xuất ảnh Diff trực quan.

---

## 5. Quản Trị Nhóm, Kỷ Luật Git & Đánh Giá Đóng Góp

Toàn bộ tiến độ phân rã 16 gói công việc (WBS), phân công nhiệm vụ 7 thành viên, ma trận RACI và bảng tính điểm đóng góp thực tế được quản lý trực tiếp tại:  
👉 **Google Sheets Master WBS (Live):** [Bảng Phân Công & Theo Dõi Tiến Độ Đồ Án Playwright](https://docs.google.com/spreadsheets/d/1jc5ae9wDK6p7h40i_gdDkzsnAYVMor-UWrUUTGSdZRo/edit?usp=sharing)  
👉 **Tài liệu hướng dẫn & Snapshot ngoại tuyến:** [`docs/wbs/Team_Work_Breakdown_and_Contribution_Matrix_Template.md`](./docs/wbs/Team_Work_Breakdown_and_Contribution_Matrix_Template.md)

- **Luật cấm Push trực tiếp `main`:** Mọi thành viên phải tạo nhánh theo cú pháp: `feat/wbs-<mã_wbs>-<tên_task>`.
- **Quy tắc Pull Request (PR):** Mỗi task gắn với 1 PR, đính kèm kết quả chạy test và cần Approval từ Trưởng nhóm.
- **Quy định Deadline & Chế tài:**
  - Hạn chót $23:59$ của ngày ghi trên bảng. Dự án kết thúc trước ngày nộp trường $03$ ngày (Buffer).
  - Trễ $< 24\text{h}$: Trừ $10\%$ điểm task.
  - Trễ $24 - 48\text{h}$: Trừ $30\%$ điểm task.
  - Trễ $> 48\text{h}$ không phép: Thu hồi task, nhận $0\%$ cho task đó.
  - Không có đóng góp trên Git/Docs: Nhận $0\%$ Đóng Góp Thực Tế trong file nộp cho Giảng viên (`STT nhom_Danh gia.docx`).
