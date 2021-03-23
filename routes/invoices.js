const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();

// get all invoices 
router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`);
        return res.json({ invoices: result.rows });
    } catch (e) {
        return next(e)
    }
});

// get all invoices based on id 
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date 
                                        FROM invoices
                                        WHERE id =$1`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Id number ${id} is not found`, 404)
        }
        return res.json({ invoice: result.rows });
    } catch (e) {
        return next(e)
    }
});

// add new invoice
router.post("/", async (req, res, next) => {
    const { code, amt } = req.body
    try {
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) 
                                        VALUES ($1,$2)
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                        [code, amt]);
        return res.json({ invoice: result.rows });
    } catch (e) {
        if (e.code = 23503) {
            return next(new ExpressError(`No such company ${code}`, 404))
        }
        return next(e)
   }
});

// update invoice amount
router.put("/:id", async (req, res, next) => {
    try {
        const { amt } = req.body
        const { id } = req.params
        const result = await db.query(`UPDATE invoices 
                                        SET amt = $1
                                        WHERE id = $2
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`No such company id ${id}`, 404);
        }
        return res.json({ invoice: result.rows });
    } catch (e) {
        return next (e)
    }
})

// delete an invoice based on ID

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await db.query(`DELETE FROM invoices 
                                        WHERE id = $1
                                        RETURNING comp_code`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`No such company id ${id}`, 404);
        }
        return res.json({ "status": "deleted" });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;