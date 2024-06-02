// wait for DOM loaded
$(document).ready(function () {
    // function to fetch data for form
    $(() => {
        fetchData().then(result => {
            // add elements fetched to FORM
            for (let reportType in result.reports) {
                $('#reportType').append(`<option value="${result.reports[reportType]}">${result.reports[reportType]}</option>`); // BACKEND USES THE KEY TO GET THE VALUE
            }
        }).catch(error => {
            alert(error);
        });
    });

    // get data from DB without reloading DOM
    function fetchData() {
        return new Promise(async (resolve, reject) => {
            const url = `/admin/report/search/report-types/`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('No se pudo obtener los datos del servidor. Intente de nuevo mas tarde. ');
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
});