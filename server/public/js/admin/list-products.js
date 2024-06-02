
// A $( document ).ready() block.
$(document).ready(function () {
    //  AJAX call to data to edit product
    $('.edit-link-ref').on('click', async function (event) {
        // Prevent the default action of the link
        event.preventDefault();

        // Get the href attribute of the clicked link
        const href = $(this).attr('href');

        // Split the href into parts using the "/" delimiter
        const parts = href.split('/');

        // /admin/load-products/edit-product/<%=location.id%>/<%=product.id%>/<%=item.size%>"

        // Extract dynamic values from the parts array
        const locationId = parts[parts.length - 3]; // Assuming location ID is the third-to-last part
        const productId = parts[parts.length - 2]; // Assuming product ID is the second-to-last part
        const itemSize = parts[parts.length - 1]; // Assuming item size is the last part

        // fetch data
        try {
            const _fetched_data = await fetchData(locationId, productId, itemSize);
            displayModal(_fetched_data);
        } catch (error) {
            alert('No se pudo cargar los datos ')
        }
    });

    // get data from DB without reloading DOM
    function fetchData(locationId, productId, itemSize) {
        return new Promise(async (resolve, reject) => {
            const url = `/admin/load-products/edit-product/${locationId}/${productId}/${itemSize}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }

    // unhide the modal and
    function displayModal(_fetched_data) {
        // Populate form fields with data
        $('#building_id').val(_fetched_data.ids.building_id);
        $('#pledge_id').val(_fetched_data.ids.pledge_id);
        $('#size_id').val(_fetched_data.ids.size_id);
        $('#pledge_name').val(_fetched_data.data.pname);
        $('#building_name').val(_fetched_data.data.bname);
        $('#stock').val(_fetched_data.data.stock);

        // Display the modal
        $('#modelId').modal('show');
    }
});

// toggles the div and display content
function toggleBuildings(productId) {
    var buildingsContainer = document.getElementById(productId + 'Buildings');
    var toggleButton = document.getElementById('toggleButton' + productId);

    // Toggle the visibility of the buildings container
    buildingsContainer.style.display = (buildingsContainer.style.display === 'none') ? 'block' : 'none';

    // Change the text content of the button based on the current visibility state
    toggleButton.textContent = (buildingsContainer.style.display === 'none') ? 'Expandir' : 'Minimizar';
}