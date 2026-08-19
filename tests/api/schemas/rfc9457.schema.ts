import { z } from 'zod';

/**
 * Zod Schema kiem dinh cau truc phan hoi loi theo chuan quoc te RFC 9457
 * Content-Type: application/problem+json
 */
export const ProblemDetailsSchema = z.object({
  // URI dinh danh loai loi
  type: z.string().url(),
  // Tieu de ngan gon cua loai loi
  title: z.string().min(1),
  // Ma trang thai HTTP (4xx hoac 5xx)
  status: z.number().int().min(400).max(599),
  // Mo ta chi tiet nguyen nhan loi
  detail: z.string().min(1),
  // Dinh danh duy nhat cua request (Request ID / Trace ID - Khong bat buoc)
  instance: z.string().optional(),
  // Danh sach cac truong du lieu khong hop le (neu la loi 422 - Khong bat buoc)
  invalid_params: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
    })
  ).optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;