const path = require('path');
const { swapDatesIfPossible } = require('../utils/dates.utils.module');
const { REPORT_TYPES, MOST_SOLD_PRODUCTS_REPORT_QUERY, LESS_SOLD_PRODUCTS_REPORT_QUERY, EARNINGS_REPORT_QUERY, EXPENSE_REPORT_QUERY, BUILDING_SELECT_REPORT_QUERY, USER_SELECT_ALL_NO_PASS_QUERY, SIZE_SELECT_ALL_QUERY, PLEDGE_SELECT_QUERY, INVENTORY_SELECT_QUERY, MOST_SOLD_PRODUCTS_FILTER_DATES_REPORT_QUERY, LESS_SOLD_PRODUCTS_FILTER_DATES_REPORT_QUERY, EARNINGS_FILTER_DATES_REPORT_QUERY, EXPENSE_FILTER_DATES_REPORT_QUERY, LOW_STOCK_REPORT_QUERY } = require('../../config/consts');
const db_connection = require(path.join(__dirname, "../database/db-connection"));


// main function to generate JSON, used to display a dynamic report table
async function generateReportJSON(_init_date, _end_date, reportType) {
    try {
        // get dates
        let _dates = swapDatesIfPossible(_init_date, _end_date);
        _end_date = _dates.end_date;
        _init_date = _dates.init_date;


        // check if using dates or not
        if (_dates.status) {
            return generateReportJSONNoDates(reportType);
        } else {
            return generateReportJSONWithDates(reportType, _init_date, _end_date);
        }
    } catch (error) {
        throw new Error("Unable to generate report: " + error);
    }
}

// generate report without dates
async function generateReportJSONNoDates(reportType) {
    let table_data = { titles: [], data: [] };
    switch (reportType) {
        case REPORT_TYPES.MOST_SOLD_PRODUCTS:
            table_data.titles = ["PRENDA", "NOMBRE", "TALLA", "TOTAL"];
            table_data.data = await queryReportNoDates(MOST_SOLD_PRODUCTS_REPORT_QUERY);
            break;
        case REPORT_TYPES.LESS_SOLD_PRODUCTS:
            table_data.titles = ["PRENDA", "NOMBRE", "TALLA", "TOTAL"];
            table_data.data = await queryReportNoDates(LESS_SOLD_PRODUCTS_REPORT_QUERY);
            break;
        case REPORT_TYPES.EARNINGS:
            table_data.titles = ["CÓDIGO", "NIT", "TOTAL(GTQ)", "FECHA", "USUARIO"];

            table_data.data = await queryReportNoDates(EARNINGS_REPORT_QUERY);
            break;
        case REPORT_TYPES.EXPENSES:
            table_data.titles = ["CÓDIGO", "GASTOS (GTQ)", "FECHA", "USUARIO", "TIPO DE GASTO"];
            table_data.data = await queryReportNoDates(EXPENSE_REPORT_QUERY);
            break;
        case REPORT_TYPES.BUILDINGS:
            table_data.titles = ["CÓDIGO", "NOMBRE", "DIRECCIÓN"];
            table_data.data = await queryReportNoDates(BUILDING_SELECT_REPORT_QUERY);
            break;
        case REPORT_TYPES.USERS:
            table_data.titles = ["CÓDIGO", "NOMBRE", "AUTORIZADO", "AREA DE TRABAJO"];
            table_data.data = await queryReportNoDates(USER_SELECT_ALL_NO_PASS_QUERY);
            break;
        case REPORT_TYPES.SIZES:
            table_data.titles = ["TALLA"];
            table_data.data = await queryReportNoDates(SIZE_SELECT_ALL_QUERY);
            break;
        case REPORT_TYPES.PLEDGES:
            table_data.titles = ["CÓDIGO", "NOMBRE"];
            table_data.data = await queryReportNoDates(PLEDGE_SELECT_QUERY);
            break;
        case REPORT_TYPES.LOW_STOCK:
            table_data.titles = ["PRENDA", "TALLA", "EDIFICIO", "STOCK"];
            table_data.data = await queryReportNoDates(LOW_STOCK_REPORT_QUERY);
            break;
        default:
            table_data.titles = ["OPCIÓN INVALIDA"]; // ignore
            break;
    }
    return table_data;
}

// generate report with dates
async function generateReportJSONWithDates(reportType, _init_date, _end_date) {
    let table_data = { titles: [], data: [] };
    // cast dates
    switch (reportType) {
        case REPORT_TYPES.MOST_SOLD_PRODUCTS:
            table_data.titles = ["CÓDIGO", "NOMBRE", "TALLA", "TOTAL"];
            table_data.data = await queryReportWithDates(MOST_SOLD_PRODUCTS_FILTER_DATES_REPORT_QUERY, _init_date, _end_date);
            break;
        case REPORT_TYPES.LESS_SOLD_PRODUCTS:
            table_data.titles = ["CÓDIGO", "NOMBRE", "TALLA", "TOTAL"];
            table_data.data = await queryReportWithDates(LESS_SOLD_PRODUCTS_FILTER_DATES_REPORT_QUERY, _init_date, _end_date);
            break;
        case REPORT_TYPES.EARNINGS: // exclude cancelled bills
            table_data.titles = ["CÓDIGO", "NIT", "TOTAL(GTQ)", "FECHA", "USUARIO", "TIPO DE PAGO"];
            table_data.data = await queryReportWithDates(EARNINGS_FILTER_DATES_REPORT_QUERY, _init_date, _end_date);
            break;
        case REPORT_TYPES.EXPENSES:
            table_data.titles = ["CÓDIGO", "GASTOS (GTQ)", "FECHA", "USUARIO", "TIPO DE GASTO"];
            table_data.data = await queryReportWithDates(EXPENSE_FILTER_DATES_REPORT_QUERY, _init_date, _end_date);
            break;
        default:
            return generateReportJSONNoDates(reportType);
    }
    return table_data;
}

// generic function to execute queries with no parameters
async function queryReportNoDates(REPORT_QUERY) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        connection.query(REPORT_QUERY, (error, result) => {
            if (error) {
                reject("No ha sido posible recuperar los datos necesarios para el reporte " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// generic function to execute queries with no parameters
async function queryReportWithDates(REPORT_QUERY, _init_date, _end_date) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        // cast dates if string to Date
        connection.query(REPORT_QUERY, [_init_date, _end_date], (error, result) => {
            // print the current query with dates
            if (error) {
                reject("No ha sido posible recuperar los datos necesarios para el reporte " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

module.exports = { generateReportJSON }