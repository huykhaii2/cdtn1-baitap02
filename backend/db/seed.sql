INSERT INTO issue_category(name,description) VALUES
('Lỗi nguồn','Thiết bị không khởi động hoặc không nhận sạc'),
('Màn hình','Nứt, sọc, liệt cảm ứng hoặc hiển thị bất thường'),
('Pin','Pin chai, phồng hoặc thời lượng bất thường'),
('Phần mềm','Lỗi hệ điều hành hoặc ứng dụng'),
('Khác','Các sự cố khác') ON CONFLICT(name) DO NOTHING;
INSERT INTO customer(full_name,phone,email) VALUES
('Nguyễn Minh Anh','0901000001','minhanh@example.com'),
('Trần Quốc Bảo','0901000002','quocbao@example.com'),
('Lê Thu Hà','0901000003','thuha@example.com') ON CONFLICT(phone) DO NOTHING;
INSERT INTO device(customer_id,device_name,serial_number,purchase_date,warranty_expiry)
SELECT c.id,'Samsung Galaxy A55','SN-MM-A55001','2026-03-10','2027-03-10' FROM customer c WHERE c.phone='0901000001' ON CONFLICT(serial_number) DO NOTHING;
INSERT INTO device(customer_id,device_name,serial_number,purchase_date,warranty_expiry)
SELECT c.id,'iPhone 13','SN-MM-IP13002','2025-12-05','2026-12-05' FROM customer c WHERE c.phone='0901000002' ON CONFLICT(serial_number) DO NOTHING;
INSERT INTO device(customer_id,device_name,serial_number,purchase_date,warranty_expiry)
SELECT c.id,'Xiaomi Redmi Note 13','SN-MM-RN13003','2026-05-20','2027-05-20' FROM customer c WHERE c.phone='0901000003' ON CONFLICT(serial_number) DO NOTHING;
INSERT INTO ticket(ticket_code,customer_id,device_id,category_id,issue_description,status,priority)
SELECT 'MM-DEMO-001',c.id,d.id,ic.id,'Thiết bị không nhận sạc sau khi sử dụng bình thường.','NEW','HIGH' FROM customer c JOIN device d ON d.customer_id=c.id JOIN issue_category ic ON ic.name='Lỗi nguồn' WHERE c.phone='0901000001' AND d.serial_number='SN-MM-A55001' ON CONFLICT(ticket_code) DO NOTHING;
INSERT INTO ticket(ticket_code,customer_id,device_id,category_id,issue_description,status,priority)
SELECT 'MM-DEMO-002',c.id,d.id,ic.id,'Màn hình xuất hiện sọc dọc khi sử dụng.','IN_PROGRESS','NORMAL' FROM customer c JOIN device d ON d.customer_id=c.id JOIN issue_category ic ON ic.name='Màn hình' WHERE c.phone='0901000002' AND d.serial_number='SN-MM-IP13002' ON CONFLICT(ticket_code) DO NOTHING;
INSERT INTO ticket_status_log(ticket_id,new_status,note) SELECT id,status,'Dữ liệu mẫu khởi tạo' FROM ticket WHERE ticket_code IN ('MM-DEMO-001','MM-DEMO-002') AND NOT EXISTS (SELECT 1 FROM ticket_status_log l WHERE l.ticket_id=ticket.id);
