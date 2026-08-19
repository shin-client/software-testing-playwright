# WBS 1.6: Multi-Project Framework Setup and CI Pipeline

## Metadata

- **WBS Code:** `1.6`
- **Task Name:** Khởi tạo cấu trúc Multi-Project Framework, TypeScript, .env & CI Pipeline
- **Assignee:** Trần Văn Ngọc (MSSV: 0306241131)
- **Task Weight:** `2.0%`
- **Deliverable Artifacts:** File `playwright.config.ts`, `package.json`, `.github/workflows/playwright.yml` trong repository `software-testing-playwright`, Pull Request #1 pass base command.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ khởi tạo khung dự án kiểm thử chuẩn công nghiệp, cấu hình Playwright Multi-Project phân tách độc lập các tầng `api`, `chromium` (e2e), và `smoke`.
- **Mục đích:** Thiết lập nền tảng dự án, biến môi trường `.env`, cấu hình TypeScript và xây dựng pipeline CI/CD trên GitHub Actions với Bun Runtime.
- **Điểm mấu chốt:** Thống nhất $100\%$ cấu trúc thư mục `tests/api/`, `tests/e2e/`, `fixtures/`, `pages/`, `schemas/` và thiết lập Branch Protection Rules.

---

## 1. Mục Tiêu & Phạm Vi Nhiệm Vụ (Scope of Work)

- **Phạm vi trọng tâm:**
  - Thiết lập cấu trúc thư mục repository theo chuẩn Playwright Native (loại bỏ nesting sâu không cần thiết).
  - Cài đặt và quản lý dependencies qua Bun: `@playwright/test`, `typescript`, `zod`, `dotenv`.
  - Cấu hình tệp điều phối trung tâm `playwright.config.ts` hỗ trợ Multi-Project:
    - Project `api`: Ánh xạ thư mục `tests/api/`, cấu hình `baseURL` backend, thiết lập headers JSON mặc định, không khởi động trình duyệt.
    - Project `chromium`: Ánh xạ thư mục `tests/e2e/`, cấu hình `baseURL` frontend SauceDemo, thu thập trace khi retry (`on-first-retry`), chụp ảnh khi lỗi (`only-on-failure`).
    - Project `smoke`: Ánh xạ thư mục `tests/smoke/` phục vụ kiểm tra sức khỏe ban đầu.
  - Xây dựng GitHub Actions CI Workflow (`.github/workflows/playwright.yml`): Tích hợp action `oven-sh/setup-bun@v2`, tự động cài đặt browser dependencies, thực thi test suite, và đính kèm HTML Test Report vào GitHub Artifacts.
- **Ranh giới ngoài phạm vi (Non-goals):** Không viết kịch bản kiểm thử nghiệp vụ chi tiết của Phase 2 và Phase 3.

---

## 2. Các Yêu Cầu Kỹ Thuật Bắt Buộc (Technical Requirements)

Người phụ trách cần thiết lập các tệp cấu hình đáp ứng đầy đủ các tiêu chuẩn sau:

1. **Yêu Cầu Cấu Trúc Thư Mục Chuẩn:**
   - Thư mục kiểm thử: `tests/api/` (chứa API test specs), `tests/e2e/` (chứa UI test specs), `tests/smoke/` (chứa baseline healthcheck).
   - Thư mục đối tượng: `pages/` (chứa POM classes) và `pages/components/` (chứa COM classes).
   - Thư mục schema & fixtures: `schemas/` (chứa Zod schemas) và `fixtures/` (chứa custom fixtures mở rộng).
2. **Yêu Cầu Cấu Hình Multi-Project (`playwright.config.ts`):**
   - Đọc biến môi trường từ `.env` an toàn (`API_BASE_URL`, `WEB_BASE_URL`).
   - Thiết lập `fullyParallel: true` để tối ưu hóa CPU đa nhân.
   - Cơ chế chạy lại (Retries): `retries: 2` trên môi trường CI và `0` ở môi trường local.
   - Báo cáo đầu ra: Kết hợp `html` (lưu vào thư mục `playwright-report`) và `list` (hiển thị terminal).
3. **Yêu Cầu Tích Hợp CI/CD Workflow (`playwright.yml`):**
   - Kích hoạt tự động trên các sự kiện `push` và `pull_request` vào nhánh `main`.
   - Sử dụng action `oven-sh/setup-bun@v2` phiên bản mới nhất.
   - Cài đặt dependencies qua lệnh `bun install --frozen-lockfile`.
   - Lưu trữ Artifacts báo cáo HTML với thời gian lưu giữ (Retention days) tối thiểu 14 ngày.

---

## 3. Tài Liệu Nghiên Cứu & Hướng Dẫn Kỹ Thuật (Primary Sources)

1. **Tài Liệu Cấu Hình Playwright:**
   - [Playwright Multi-Project Configuration](https://playwright.dev/docs/test-projects)
   - [Playwright Test Configuration Reference](https://playwright.dev/docs/test-configuration)
   - [Playwright Continuous Integration Guide](https://playwright.dev/docs/ci-intro)
2. **Tài Liệu CI/CD & Package Manager:**
   - [Oven Bun GitHub Actions Setup (oven-sh/setup-bun)](https://github.com/oven-sh/setup-bun)
   - [GitHub Actions Workflow Syntax Reference](https://docs.github.com/en/actions/writing-workflows)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Khởi Tạo Repository & Cấu Trúc Thư Mục:**
  - [ ] Khởi tạo hoàn tất cấu trúc thư mục `tests/api/`, `tests/e2e/`, `tests/smoke/`, `fixtures/`, `pages/`, `schemas/`.
  - [ ] Cài đặt đầy đủ dependencies trong `package.json` bằng Bun.
- [ ] **Cấu Hình Multi-Project Hoàn Chỉnh:**
  - [ ] Tệp `playwright.config.ts` phân tách chính xác 3 projects (`api`, `chromium`, `smoke`).
  - [ ] Chạy lệnh `bunx playwright test --list` hiển thị đúng danh sách các projects.
- [ ] **Tích Hợp CI/CD Pipeline:**
  - [ ] Tệp `.github/workflows/playwright.yml` chạy thành công (Green Checkmark) khi tạo Pull Request trên GitHub.
  - [ ] Báo cáo HTML được upload thành công lên GitHub Actions Artifacts.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo Pull Request #1 (`feat/wbs-1.6-multi-project-ci-setup`) và merge vào nhánh `main` sau khi được review duyệt.
