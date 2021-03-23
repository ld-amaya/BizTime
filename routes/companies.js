const express = require('express');
const slugify = require('slugify');
const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

// Return all companies 
router.get("/", async (req, res, next) => {
    try{
        const result = await db.query(`SELECT code,name FROM companies`);
        return res.json({ companies: result.rows });
    } catch (e) {
        return next(e);
    }
});

// Return company details 
router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const companyQuery = await db.query(`SELECT code, name, description 
                                        FROM companies
                                        WHERE code = $1`,
                                        [code]);
        const invoicesQuery = await db.query(`SELECT id, amt, paid, add_date, paid_date 
                                        FROM invoices
                                        WHERE comp_code =$1`,
                                        [code]);
        if (companyQuery.rows.length === 0) {
            throw new ExpressError(`No such company ${code}`, 404);
        }
        const company = companyQuery.rows[0];
        const invoices = invoicesQuery.rows;
        company.invoices = invoices.map(i => i);    
        return res.json({ "company": company});
    } catch (e) {
        return next(e);
    }
});

// Add a new company
router.post("/", async (req, res, next) => {
    try {
        let { name, description } = req.body
        const code = slugify(name, { replacement: '_', lower: true })
        const result = await db.query(`INSERT INTO companies
                                        (code, name, description)
                                        VALUES ($1, $2, $3)
                                        RETURNING code, name, description`,
                                        [code, name, description]);
        return res.json({ company: result.rows });
    } catch (e) {
        return next(e); 
    }
});

// Edit existing company
router.put("/:code", async (req, res, next) => {
    try {
        let { name, description } = req.body
        const { code } = req.params
        const result = await db.query(`UPDATE companies 
                                        SET name = $1, description =$2
                                        WHERE code = $3
                                        RETURNING code, name, description`,
                                        [name, description, code]);
        if (result.rows.length === 0) { 
            throw new ExpressError(`No such company ${code}`, 404);
        }
        return res.json({ company: result.rows });
    } catch (e) {
        return next(e);
    }
});

// Delete existing company
router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params
        const result = await db.query(`DELETE FROM companies 
                                        WHERE code = $1
                                        RETURNING code`,
                                        [code]);
        if (result.rows.length === 0) { 
            throw new ExpressError(`No such company ${code}`, 404);
        }
        return res.json({ "stauts": "deleted" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;