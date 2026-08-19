# WBS 1.2A: Auto-Waiting and Actionability Checks Mechanics

## Metadata

- **WBS Code:** `1.2A`
- **Task Name:** Nghiên cứu Cơ chế Auto-waiting 5 bước & Actionability Checks
- **Assignee:** Đặng Duy Lam (MSSV: 0306241125)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 1.3 Chương 1 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu cơ chế tự động đồng bộ hóa và 5 bước kiểm tra khả năng hành động (Actionability Checks) của Playwright.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách phân tích giải pháp triệt tiêu Flaky Tests và loại bỏ lệnh chờ tĩnh `sleep()`.
- **Điểm mấu chốt:** Nắm vững nguyên lý toán học và DOM polling đằng sau các trạng thái Attached, Visible, Stable, Enabled, Unobscured và Web-first Assertions.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Vấn đề Flaky Tests (Kiểm thử chập chờn) trong các ứng dụng Web hiện đại (Single Page Applications - React, Vue, Angular).
  - Phân tích hạn chế của 2 cách tiếp cận cũ: Lệnh chờ tĩnh (`Thread.sleep()` / `setTimeout()`) và lệnh chờ tường minh (`WebDriverWait.until()`).
  - Đi sâu vào 5 điều kiện kiểm tra Actionability Checks của Playwright: `Attached`, `Visible`, `Stable`, `Enabled`, `Unobscured` (Editable).
  - Cơ chế hoạt động của Web-first Assertions (Auto-retrying assertions với chu kỳ polling $100\text{ms}$).
- **Ranh giới ngoài phạm vi (Non-goals):** Không đi sâu vào phân tích Trace Viewer (đã phân bổ tại WBS 1.3B).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Bản Chất Flaky Tests & Lệnh Chờ Tĩnh:**
   - Tại sao việc lạm dụng lệnh chờ tĩnh `sleep(3000)` được coi là "Anti-pattern nguy hiểm nhất" trong tự động hóa kiểm thử (gây lãng phí tài nguyên và vẫn fail khi mạng nghẽn $> 3000\text{ms}$)?
   - `WebDriverWait` của Selenium yêu cầu SDET phải tự viết điều kiện chờ thủ công như thế nào, và tại sao nó vẫn dễ bị gãy khi gặp hiệu ứng CSS Animation hoặc Modal overlay?
2. **Về 5 Bước Kiểm Tra Actionability Checks:**
   - Trình bày định nghĩa và cơ chế xác thực của 5 điều kiện:
     1. **`Attached`:** Làm thế nào Playwright biết phần tử đã gắn vào Document DOM hoặc Iframe hợp lệ?
     2. **`Visible`:** Playwright kiểm tra các thuộc tính CSS nào (`display: none`, `visibility: hidden`, `opacity: 0`, kích thước bounding box)?
     3. **`Stable`:** Playwright sử dụng `requestAnimationFrame` như thế nào để đảm bảo phần tử không thay đổi tọa độ qua 2 animation frames liên tiếp?
     4. **`Enabled`:** Thuộc tính `disabled` hoặc thuộc tính ARIA `aria-disabled` được đánh giá ra sao?
     5. **`Unobscured`:** Cơ chế `document.elementFromPoint(x, y)` hoạt động thế nào để đảm bảo điểm tâm của phần tử không bị che bởi Modal, Toast notification hoặc Spinner?
3. **Về Cơ Chế Web-First Assertions:**
   - Tại sao các assertion như `await expect(locator).toHaveText('Success')` lại không kiểm tra 1 lần tức thì mà tự động retry liên tục?
   - Chu kỳ polling mặc định là bao nhiêu ($100\text{ms}$) và timeout mặc định là bao nhiêu ($5000\text{ms}$)?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright Actionability Checks & Auto-waiting Guide](https://playwright.dev/docs/actionability)
   - [Playwright Web-first Assertions Reference](https://playwright.dev/docs/test-assertions)
2. **Tài Liệu Tiêu Chuẩn Trình Duyệt & Web APIs:**
   - [MDN Web Docs - Window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
   - [MDN Web Docs - Document.elementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 1.3 Chương 1)
- **1.3.1. Vấn đề bất đồng bộ & Flaky tests trong SPA:** Phân tích nguyên nhân gốc rễ và phê phán việc sử dụng `sleep()`.
- **1.3.2. Chi tiết 5 bước kiểm tra Actionability Checks:**
  - Trình bày chi tiết 5 tiêu chí (Attached, Visible, Stable, Enabled, Unobscured).
  - Tự vẽ 01 sơ đồ luồng ra quyết định (Flowchart) quá trình Playwright thăm dò Actionability trước khi click.
- **1.3.3. Cơ chế Web-first Assertions:** Bảng so sánh giữa Non-retrying Assertions (Jest/Chai) và Web-first Assertions của Playwright.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Trả lời trôi chảy các câu hỏi về cơ chế `requestAnimationFrame` và `elementFromPoint` khi được phản biện.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ luồng Flowchart 5 bước được thiết kế chỉn chu, có nhánh rẽ Decision (Pass -> Execute / Fail -> Polling retry).
  - [ ] Bảng so sánh 3 phương pháp chờ (Sleep tĩnh, WebDriverWait, Auto-waiting) đầy đủ thông số.
