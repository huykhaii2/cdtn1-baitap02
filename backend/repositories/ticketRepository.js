const pool = require('../db/pool');
async function list({ search = '', status = '' } = {}) {
  const values = []; let where = [];
  if (search) { values.push(`%${search}%`); where.push(`(t.ticket_code ILIKE $${values.length} OR c.full_name ILIKE $${values.length} OR c.phone ILIKE $${values.length} OR d.serial_number ILIKE $${values.length})`); }
  if (status) { values.push(status); where.push(`t.status = $${values.length}`); }
  const sql = `SELECT t.*, c.full_name AS customer_name, c.phone, d.device_name, d.serial_number, ic.name AS category_name FROM ticket t JOIN customer c ON c.id=t.customer_id JOIN device d ON d.id=t.device_id JOIN issue_category ic ON ic.id=t.category_id ${where.length ? 'WHERE '+where.join(' AND ') : ''} ORDER BY t.received_at DESC`;
  return (await pool.query(sql, values)).rows;
}
async function create(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const code = `MM-${Date.now().toString().slice(-8)}`;
    const result = await client.query(`INSERT INTO ticket(ticket_code,customer_id,device_id,category_id,issue_description,priority) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [code, data.customer_id, data.device_id, data.category_id, data.issue_description, data.priority || 'NORMAL']);
    await client.query('INSERT INTO ticket_status_log(ticket_id,new_status,note) VALUES($1,$2,$3)', [result.rows[0].id, 'NEW', 'Phiếu được tiếp nhận']);
    await client.query('COMMIT'); return result.rows[0];
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
async function updateStatus(id, status) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT status FROM ticket WHERE id=$1 FOR UPDATE', [id]);
    if (!current.rowCount) { await client.query('ROLLBACK'); return null; }
    const updated = await client.query('UPDATE ticket SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, id]);
    await client.query('INSERT INTO ticket_status_log(ticket_id,old_status,new_status) VALUES($1,$2,$3)', [id, current.rows[0].status, status]);
    await client.query('COMMIT'); return updated.rows[0];
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
module.exports = { list, create, updateStatus };
