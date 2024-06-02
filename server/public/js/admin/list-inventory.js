// wait for DOM loaded
$(document).ready(function () {
    // Add click event handler to all toggle buttons
    $('.toggle-button').click(function () {
        // Find the parent card element
        let card = $(this).closest('.card');
        // Toggle the visibility of the card body
        card.find('.hide-table-panel').toggleClass('d-none');

        // Toggle the text of the button
        let buttonText = $(this).text();
        if (buttonText.trim() === 'Expandir') {
            $(this).text('Minimizar');
        } else {
            $(this).text('Expandir');
        }
    });

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
        let pledge_id = parts[parts.length - 2]; // Assuming product ID is the second-to-last part
        let pledge_size = parts[parts.length - 1]; // Assuming item size is the last part

        try {
            const _fetched_data = await fetchData(pledge_id, pledge_size);
            displayModal(_fetched_data);
        } catch (error) {
            alert('No se pudo cargar los datos ')
        }
    });


    // get data from DB without reloading DOM
    function fetchData(pledge_id, pledge_size) {
        return new Promise(async (resolve, reject) => {
            const url = `/admin/load-inventory/search/${pledge_id}/${pledge_size}`;
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

    // unhide the modal and show popup
    function displayModal(_fetched_data) {
        // Populate form fields with data
        $('#Pledge_id').val(_fetched_data.Pledge_id);
        $('#id-product-display').val(_fetched_data.Pledge_id);
        $('#Size_id').val(_fetched_data.Size_id);
        $('#pledge-size-display').val(_fetched_data.Size_id);
        $('#price').val(_fetched_data.price);
        $("#pledge-name").val(_fetched_data.name);
        // Show the modal
        $('#updateModal').modal('show');
    }
});