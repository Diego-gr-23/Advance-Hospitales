// check if functions are valid, if not, return invalid operation, if both are valid but init_date > end_date, swap them
function swapDatesIfPossible(_init_date, _end_date) {
    try {
        // cast '' to NULL
        // check which date is higher or lower to send it 
        if (!_init_date || !_end_date) {
            return { status: true, init_date: null, end_date: null }
        }
        // swap if _end_date < _init_date
        _init_date = new Date(_init_date);
        _end_date = new Date(_end_date);
        let _tmp_date = _init_date;
        _init_date = _init_date < _end_date ? _init_date : _end_date;
        _end_date = _init_date === _tmp_date ? _end_date : _tmp_date;
        // change possible values of NaN, undefined... to NULL
        _init_date = _init_date === '' || _init_date === undefined ? null : _init_date;
        _end_date = _end_date === '' || _end_date === undefined ? null : _end_date;
        return { status: _init_date === null || _end_date === null, init_date: _init_date, end_date: _end_date }
    } catch (error) {
        return { status: false, _init_date: null, _end_date: null }
    }
}

// format a date to a custom format
function formatDate(date) {
    // Extract day, month, and year
    var day = date.getDate();
    var month = date.getMonth() + 1; // Months are zero based
    var year = date.getFullYear();

    // Add leading zeros if needed
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    // Format the date as "dd/mm/yyyy"
    return day + '/' + month + '/' + year;
}
module.exports = { swapDatesIfPossible, formatDate }