import { z } from 'zod';

export const InvalidParamSchema = z.object({
  name: z.string(),
  reason: z.string(),
});

export const ProblemDetailsSchema = z.object({
  // URI định danh loại lỗi (bắt buộc theo chuẩn RFC 9457)
  type: z.string().url(),
  // Tiêu đề ngắn gọn của loại lỗi
  title: z.string().min(1),
  // Mã trạng thái HTTP (400 <= status <= 599)
  status: z.number().int().min(400).max(599),
  // Chi tiết lỗi
  detail: z.string().min(1),
  // Endpoint/URI phát sinh lỗi
  instance: z.string().min(1),
  // Danh sách các tham số không hợp lệ (mảng các object { name, reason })
  invalidParams: z.array(InvalidParamSchema),
  // Thời gian phát sinh lỗi theo chuẩn ISO-8601 UTC
  timestamp: z.string().datetime(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;