export class CreateInvoiceDto {
  user_id: string;
  register_no: string;
  submit_date: string;
  silo_id: string;
  pic_id: string;
  vendor_id?: string | null;
  invoice_no?: string | null;
  po_no?: string | null;
  latest_date?: string | null;
  note?: string | null;
  scan_date?: string | null;
  upload_date?: string | null;
  is_urgent?: boolean;
  is_done?: boolean;
}
