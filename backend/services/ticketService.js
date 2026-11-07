const repo = require('../repositories/ticketRepository');
const STATUSES = ['NEW','CLASSIFYING','IN_PROGRESS','WAITING_PARTS','COMPLETED','REJECTED'];
async function list(filters) { return repo.list(filters); }
async function create(data) {
  if (!data.customer_id || !data.device_id || !data.category_id || !String(data.issue_description || '').trim()) {
    const err = new Error('Vui lòng nhập khách hàng, thiết bị, loại lỗi và mô tả sự cố.'); err.status = 400; throw err;
  }
  return repo.create(data);
}
async function updateStatus(id, status) {
  if (!STATUSES.includes(status)) { const err = new Error('Trạng thái không hợp lệ.'); err.status = 400; throw err; }
  const result = await repo.updateStatus(id, status);
  if (!result) { const err = new Error('Không tìm thấy phiếu bảo hành.'); err.status = 404; throw err; }
  return result;
}
module.exports = { list, create, updateStatus };
