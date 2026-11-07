const express = require('express');
const service = require('../services/ticketService');
const pool = require('../db/pool');
const router = express.Router();
router.get('/', async (req,res,next) => { try { res.json(await service.list({search:req.query.search || '', status:req.query.status || ''})); } catch(e){next(e);} });
router.post('/', async (req,res,next) => { try { res.status(201).json(await service.create(req.body)); } catch(e){next(e);} });
router.patch('/:id/status', async (req,res,next) => { try { res.json(await service.updateStatus(Number(req.params.id), req.body.status)); } catch(e){next(e);} });
router.get('/meta/options', async (_req,res,next) => { try {
 const [customers,devices,categories] = await Promise.all([pool.query('SELECT id,full_name,phone FROM customer ORDER BY full_name'), pool.query('SELECT id,device_name,serial_number,customer_id FROM device ORDER BY device_name'), pool.query('SELECT id,name FROM issue_category ORDER BY name')]);
 res.json({customers:customers.rows,devices:devices.rows,categories:categories.rows});
 } catch(e){next(e);} });
router.get('/meta/summary', async (_req,res,next) => { try { const r=await pool.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='NEW')::int AS new, COUNT(*) FILTER (WHERE status IN ('CLASSIFYING','IN_PROGRESS','WAITING_PARTS'))::int AS processing, COUNT(*) FILTER (WHERE status='COMPLETED')::int AS completed FROM ticket"); res.json(r.rows[0]); } catch(e){next(e);} });
module.exports = router;
