
// A $( document ).ready() block.
$(document).ready(function () {
    // generic GET request JSON function
    function callBackendJSON(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    // Check if the response is successful (status 200)
                    if (!response.ok) {
                        // If not successful, reject the promise with an error message
                        reject('Error: ' + response.status);
                    }
                    // If successful, parse the response body as JSON and resolve the promise with the parsed data
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    // If there's any error during the fetch process, reject the promise with the error message
                    reject('Error: ' + error.message);
                });
        });
    }

    // fetch all users and display modal
    $('.edit-btn').on('click', async function () {
        let working_areas = await callBackendJSON('/user/get-areas');
        let user_data = await callBackendJSON('/admin/user/get/' + $(this).data('id'));

        // cast allowed
        user_data.user.allowed = !!user_data.user.allowed

        // fill data from modal
        $('#edit-id').val(user_data.user.id);
        $('#edit-name').val(user_data.user.name);
        $('#edit-password').val('*************');
        // set true or false to checkbox
        $('#edit-allowed').prop('checked', user_data.user.allowed);
        $('#edit-worker-area').empty();
        working_areas.areas.forEach(area => {
            $('#edit-Working_Area_id').append(`<option value="${area.id}">${area.name}</option>`);
        });
        $('#edit-Working_Area_id').val(user_data.user.Worker_Area_id);
    });

    // allow password edit by access id edit-update-password
    $('#edit-update-password').on('click', function () {
        // toggle prop disabled on password input
        $('#edit-password').prop('readonly', !$('#edit-password').prop('readonly'));
        // toggle password text from ('*************'); to empty on toggle
        $('#edit-password').val($('#edit-password').val() == '*************' ? '' : '*************');
    });
});
