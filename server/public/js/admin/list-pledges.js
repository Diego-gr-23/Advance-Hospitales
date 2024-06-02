// wait for DOM loaded
$(document).ready(function () {
    // Add click event handler to the update button
    $('.update-btn').click(async function (event) {
        // Prevent the default action of the link
        event.preventDefault();
        // fetch DB data
        // Get the href attribute of the clicked link
        let href = $(this).attr('href');

        // Split the href into parts using the "/" delimiter
        let parts = href.split('/');

        // /admin/load-inventory/edit/<%=_product.Pledge_id%>/<%=_product.Size_id%>/<%=_prod_row.Size_id%>"

        // Extract dynamic values from the parts array
        let pledge_id = parts[parts.length - 1]; // Assuming item size is the last part

        try {
            const _fetched_data = await fetchData(pledge_id);
            displayModal(_fetched_data);
        } catch (error) {
            alert('No se pudo cargar los datos ')
        }
    });


    // get data from DB without reloading DOM
    function fetchData(pledge_id) {
        return new Promise(async (resolve, reject) => {
            const url = `/admin/load-pledges/search/${pledge_id}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('No se pudo obtener los datos de productos del servidor. Intente de nuevo mas tarde. ');
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }

    // unhide the modal and show popup
    function displayModal(_fetched_data) {
        // Populate form fields with data
        $('#Pledge_id').val(_fetched_data.id);
        $('#id-product-display').val(_fetched_data.id);
        $('#Pledge_name').val(_fetched_data.name);
        // Show the modal
        $('#updateModal').modal('show');
    }
});