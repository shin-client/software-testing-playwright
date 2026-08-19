# WBS 3.1: Web UI Test Suite - E2E Checkout Flow with POM and COM

## Metadata

- **WBS Code:** `3.1`
- **Task Name:** Web UI Ca 1: Luồng Mua Hàng E2E Checkout POM & COM trên SauceDemo
- **Assignee:** Lê Minh Quân (MSSV: 0306241143)
- **Task Weight:** `7.0%`
- **Deliverable Artifacts:** File mã nguồn `tests/e2e/checkout.spec.ts`, các lớp đối tượng `pages/` (`LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutPage.ts`) và `pages/components/` (`HeaderComponent.ts`, `FooterComponent.ts`), Pull Request GitHub, Mục 3.3.1 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực ca kiểm thử tự động giao diện Web UI Ca 1: Luồng nghiệp vụ mua hàng xuyên suốt (End-to-End Checkout Flow) trên hệ thống thương mại điện tử SauceDemo (`https://www.saucedemo.com`).
- **Mục đích:** Áp dụng kết hợp mẫu thiết kế **Page Object Model (POM)** và **Component Object Model (COM)** để đóng gói toàn bộ tương tác giao diện thành các hàm nghiệp vụ, loại bỏ lặp code và tăng khả năng bảo trì khi giao diện thay đổi.
- **Điểm mấu chốt:** Khử sạch $100\%$ các bộ định vị dễ vỡ (Brittle Locators như XPath tuyệt đối hoặc CSS selector ngẫu nhiên), bắt buộc sử dụng User-Facing Locators chuẩn của Playwright (`getByRole`, `getByTestId`, `getByText`, `getByPlaceholder`).

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh ứng dụng SauceDemo:**
  - Ứng dụng SauceDemo là nền tảng thương mại điện tử tiêu chuẩn quốc tế để đánh giá năng lực kiểm thử giao diện Web UI.
  - Luồng mua hàng hoàn chỉnh gồm 6 bước nghiệp vụ liên tiếp:
    1. **Đăng nhập (Login):** Nhập `standard_user` / `secret_sauce` tại trang chủ `/`.
    2. **Danh mục sản phẩm (Inventory):** Chọn thêm 2 sản phẩm vào giỏ hàng (`Sauce Labs Backpack`, `Sauce Labs Bike Light`), kiểm tra số lượng trên biểu tượng giỏ hàng (Cart Badge).
    3. **Giỏ hàng (Cart):** Xác nhận 2 sản phẩm đã chọn có trong danh sách và bấm nút `Checkout`.
    4. **Thông tin giao hàng (Checkout Step One):** Nhập `First Name`, `Last Name`, `Postal Code` và bấm `Continue`.
    5. **Xác nhận đơn hàng (Checkout Step Two):** Kiểm tra chi tiết đơn hàng, đơn giá từng món và xác thực công thức thanh toán: $\text{Total} = \text{Item total} + \text{Tax}$.
    6. **Hoàn tất (Checkout Complete):** Bấm `Finish` và xác nhận hiển thị thông báo `Thank you for your order!`.

- **Kiến trúc phân lớp POM & COM bắt buộc:**
  ```
  pages/
  ├── components/
  │   ├── HeaderComponent.ts    # Thanh điều hướng trên cùng, giỏ hàng, menu
  │   └── FooterComponent.ts    # Chân trang, bản quyền, liên kết mạng xã hội
  ├── LoginPage.ts              # Đóng gói form đăng nhập và thông báo lỗi
  ├── InventoryPage.ts          # Đóng gói danh mục sản phẩm và thao tác thêm/xóa giỏ hàng
  ├── CartPage.ts               # Đóng gói danh sách giỏ hàng và nút chuyển sang Checkout
  └── CheckoutPage.ts           # Đóng gói các bước điền thông tin, tính tiền và hoàn tất
  ```

---

## 2. Đặc Tả Chi Tiết Các Lớp Đối Tượng (POM & COM Specifications)

### `LoginPage.ts`
- **Thuộc tính & Locators:**
  - `usernameInput`: `page.getByRole('textbox', { name: 'Username' })` hoặc `page.locator('[data-test="username"]')`.
  - `passwordInput`: `page.getByRole('textbox', { name: 'Password' })` hoặc `page.locator('[data-test="password"]')`.
  - `loginButton`: `page.getByRole('button', { name: 'Login' })` hoặc `page.locator('[data-test="login-button"]')`.
  - `errorMessage`: `page.locator('[data-test="error"]')`.
- **Phương thức nghiệp vụ:**
  - `goto()`: Mở trang chủ SauceDemo.
  - `login(username: string, password: string)`: Nhập tài khoản, mật khẩu và bấm đăng nhập.

### `InventoryPage.ts` & `HeaderComponent.ts`
- **Thuộc tính & Locators:**
  - `header`: Khởi tạo đối tượng `new HeaderComponent(page)`.
  - `inventoryItems`: `page.locator('[data-test="inventory-item"]')`.
- **Phương thức nghiệp vụ:**
  - `addItemToCart(productName: string)`: Định vị sản phẩm theo tên và bấm nút `Add to cart` tương ứng.
  - `removeItemFromCart(productName: string)`: Bấm nút `Remove` của sản phẩm tương ứng.
  - `goToCart()`: Gọi `this.header.openCart()`.

### `HeaderComponent.ts` (COM)
- **Thuộc tính & Locators:**
  - `cartLink`: `page.locator('[data-test="shopping-cart-link"]')`.
  - `cartBadge`: `page.locator('[data-test="shopping-cart-badge"]')`.
- **Phương thức nghiệp vụ:**
  - `getCartCount()`: Lấy số lượng sản phẩm hiển thị trên Badge (trả về số nguyên hoặc 0 nếu không có badge).
  - `openCart()`: Nhấp vào biểu tượng giỏ hàng để chuyển sang `/cart.html`.

### `CheckoutPage.ts`
- **Phương thức nghiệp vụ:**
  - `fillInformation(firstName: string, lastName: string, postalCode: string)`: Nhập thông tin khách hàng tại Step One và bấm Continue.
  - `getPaymentSummary()`: Đọc `Item total`, `Tax`, `Total` tại Step Two và chuyển đổi sang dạng số thực (`number`).
  - `finishOrder()`: Bấm nút `Finish` tại Step Two.
  - `getCompleteMessage()`: Lấy tiêu đề xác nhận tại trang Complete (`Thank you for your order!`).

---

## 3. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực 3 kịch bản kiểm thử trong `tests/e2e/checkout.spec.ts`:

### `TC-UI-CHK-01: Full E2E Happy Path Checkout with Mathematical Price Assertion`
- **Mục tiêu:** Kiểm tra luồng mua hàng thông suốt 6 bước từ đăng nhập đến khi hoàn tất.
- **Thao tác thực hiện:**
  1. Đăng nhập với `standard_user` / `secret_sauce`.
  2. Chọn thêm 2 sản phẩm: `"Sauce Labs Backpack"` và `"Sauce Labs Bike Light"`.
  3. Kiểm tra `header.getCartCount()` hiển thị đúng `2`.
  4. Mở giỏ hàng, bấm `Checkout`.
  5. Điền thông tin giao hàng: `firstName: "John"`, `lastName: "Doe"`, `postalCode: "700000"`.
  6. Tại trang xác nhận Step Two:
     - Lấy giá trị: `itemTotal`, `tax`, `total`.
     - **Bất biến toán học (Mathematical Invariant):**
       $$\text{Total} = \text{Item Total} + \text{Tax} \quad (\text{với dung sai } \epsilon < 0.01)$$
  7. Bấm `Finish` $\to$ Xác thực thông báo hoàn tất: `Thank you for your order!`.

---

### `TC-UI-CHK-02: Form Validation on Missing Mandatory Shipping Info`
- **Mục tiêu:** Kiểm tra cơ chế validation của form thông tin thanh toán khi người dùng bỏ trống trường bắt buộc.
- **Thao tác thực hiện:**
  1. Đăng nhập, thêm 1 sản phẩm vào giỏ hàng, bấm `Checkout`.
  2. Nhập `firstName: "John"`, `lastName: "Doe"`, nhưng **bỏ trống `postalCode: ""`**.
  3. Bấm `Continue`.
- **Kỳ vọng:**
  - Xuất hiện thông báo lỗi: `Error: Postal Code is required`.
  - Trình duyệt vẫn giữ nguyên ở trang `/checkout-step-one.html`, không được chuyển sang Step Two.

---

### `TC-UI-CHK-03: Cart State Persistence on Navigation Back`
- **Mục tiêu:** Kiểm tra tính toàn vẹn dữ liệu giỏ hàng khi người dùng chuyển hướng quay lại tiếp tục mua sắm.
- **Thao tác thực hiện:**
  1. Thêm sản phẩm `"Sauce Labs Backpack"` vào giỏ hàng $\to$ Badge hiển thị `1`.
  2. Mở trang giỏ hàng `/cart.html` $\to$ Bấm nút `Continue Shopping` quay lại `/inventory.html`.
- **Kỳ vọng:**
  - Badge giỏ hàng vẫn giữ nguyên giá trị `1`.
  - Nút bấm của `"Sauce Labs Backpack"` hiển thị trạng thái `Remove` thay vì `Add to cart`.

---

## 4. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Tại sao kết hợp Component Object Model (COM) với Page Object Model (POM) giúp triệt tiêu mã nguồn trùng lặp?** Khi thanh Header/Navbar xuất hiện trên cả 5 trang web khác nhau, việc thay đổi locator giỏ hàng chỉ cần sửa ở duy nhất 1 file `HeaderComponent.ts` mang lại lợi ích gì?
2. **Tại sao Playwright khuyến cáo cấm sử dụng XPath tuyệt đối (`/html/body/div[1]/...`)?** Khi lập trình viên Frontend chèn thêm một thẻ `<div>` bọc ngoài, điều gì sẽ xảy ra với bài test dùng XPath?
3. **Cơ chế Auto-waiting của Playwright hoạt động như thế nào khi click vào nút `Add to cart`?** Playwright tự động kiểm tra những điều kiện gì (Attached, Visible, Stable, Enabled, Editable) trước khi phát sự kiện click?

---

## 5. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Kiến Trúc Page Object Model & Locators:**
   - [Playwright Official Guide - Page Object Models](https://playwright.dev/docs/pom)
   - [Playwright Official Guide - Locators Best Practices](https://playwright.dev/docs/locators)
   - [Martin Fowler - Page Object Pattern](https://martinfowler.com/bliki/PageObject.html)
2. **Ứng Dụng Thực Nghiệm:**
   - [SauceDemo E-Commerce Testing Platform](https://www.saucedemo.com)

---

## 6. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.3.1 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích mô hình kiến trúc POM & COM, triết lý User-Facing Locators và cơ chế Auto-waiting.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng các bước kịch bản E2E Checkout kèm dữ liệu đầu vào và công thức kiểm tra tổng tiền.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code cấu trúc lớp `InventoryPage.ts`, `HeaderComponent.ts` và chuỗi hành động thanh toán.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp màn hình terminal chạy pass $100\%$ cả 3 ca test, ảnh chụp giao diện hoàn tất đơn hàng trên Chromium.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích rủi ro Flaky test khi dùng bộ định vị kém bền vững và chiến lược bảo trì POM trong dự án lớn.

---

## 7. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Khởi tạo đầy đủ các class trong `pages/` (`LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutPage.ts`) và `pages/components/` (`HeaderComponent.ts`, `FooterComponent.ts`).
  - [ ] Tạo file `tests/e2e/checkout.spec.ts` với đầy đủ 3 ca test (`TC-UI-CHK-01` $\to$ `TC-UI-CHK-03`).
  - [ ] Chạy lệnh `bunx playwright test tests/e2e/checkout.spec.ts --project=chromium` pass $100\%$ ổn định.
  - [ ] Tuyệt đối không dùng `page.waitForTimeout()` hoặc XPath tuyệt đối.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-3.1-ui-checkout-pom-com`.
  - [ ] Tạo Pull Request trên GitHub với mô tả chi tiết, ảnh test pass.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.3.1 trong Báo cáo đồ án.
