const express = require('express');
const router = express.Router();

const { renderDashboard } = require('./admin.buildings.routes');
const { REPORT_TYPES } = require('../../config/consts');
const { generateReportJSON } = require('../../modules/admin/admin.reports.module');
const { formatDate } = require('../../modules/utils/dates.utils.module');

router.post('/report/generate', async (req, res) => {
    try {
        // get data from body
        let { initDate, endDate, reportType } = req.body;
        let _table_data = await generateReportJSON(initDate, endDate, reportType);
        // render view dynamic-table-report.ejs
        res.render('users/admin/reports/dynamic-table-report', { name: req.session.user.id, table_data: _table_data, reportType: reportType, formatDate: formatDate });
        // res.status(200).json({ table_data: _table_data, reportType: reportType });
    } catch (error) {
        renderDashboard(req, res, '', error);
    }
});

router.get('/report/search/report-types/', async (req, res) => {
    // return possible reports to GUI
    try {
        res.status(200).json({ reports: REPORT_TYPES })
    } catch (error) {
        renderDashboard(req, res, '', error);
    }
});

module.exports = router;

