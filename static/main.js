// Initialize a variable to keep track of the item ID being edited
var editingItemId = null;

// Define a custom button
$.fn.dataTable.ext.buttons.newEntryButton = {
    text: 'New Entry',
    action: function (e, dt, node, config) {
        // Handle the click event for the custom button here
        alert('Custom button clicked');
    }
};

$('#viewLogModal').on('shown.bs.modal', function () {
       var table = $('#log-table').DataTable();
       console.log('adjusting columns!')
       table.columns.adjust();
   });


var table = $('#item-table').DataTable({
    dom: 'Bfrtip',
    ajax: {
        url: '/items',
        dataSrc: 'data'
    },
    columns: [
        { data: 'id', visible: false },
        { data: 'name' },
        { data: 'value' },
        {
            data: 'id',
            render: function (data) {
                return '<button class="btn btn-warning edit action-btn" data-id="' + data + '">Edit</button>' +
                    '<button class="btn btn-danger delete action-btn" data-id="' + data + '">Delete</button>' +
                    '<button class="btn btn-info view-log action-btn" data-id="' + data + '">Log</button>' +
                    '<button class="btn btn-primary send-email action-btn" data-id="' + data + '">Mail</button>';
            }
        }
    ],
    columnDefs: [
        {
            targets: [0],
            searchable: false,
        }
    ],
    buttons: [
        {
            extend: 'copy',
            text: 'Copy',
            exportOptions: {
                columns: ':not(.exclude-from-exports)' // Exclude columns with the class "exclude-column"
            }
        },
        {
            extend: 'csv',
            text: 'CSV',
            exportOptions: {
                columns: ':not(.exclude-from-exports)' // Exclude columns with the class "exclude-column"
            }
        },
        {
            extend: 'print',
            text: 'Print',
            exportOptions: {
                columns: ':not(.exclude-from-exports)' // Exclude columns with the class "exclude-column"
            }
        }
    ]
});


// Add Item Button Click Handler
$('#addButton').on('click', function () {
    console.log("Add button clicked.");

    // Clear any previous input values in the modal
    $('#newItemName').val('');

    // Show the modal for adding a new item
    $('#addItemModal').modal('show');
});

// Save New Item Button Click Handler
$('#saveNewItemButton').on('click', function () {
    console.log("Save New Item button clicked.");

    // Get the new item data from the modal
    var newItemName = $('#newItemName').val();

    // Make sure the data is valid
    if (newItemName) {
        var newItemData = {
            name: newItemName
        };

        // Send a POST request to create the new item
        $.ajax({
            url: '/items',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newItemData),
            success: function (response) {
                console.log('Item created successfully:', response.message);

                // Clear the input field
                $('#newItemName').val('');

                // Refresh the DataTable to display the new item
                table.ajax.reload(null, false);

                // Close the modal
                $('#addItemModal').modal('hide');
            },
            error: function (error) {
                console.log('Error creating item:', error);
            }
        });
    } else {
        // Handle validation or show an error message
        console.log('Item name is required.');
    }
});


// Edit Item Button Click Handler
$('#item-table tbody').on('click', 'button.edit', function () {
    editingItemId = $(this).data('id'); // Store the item ID being edited
    console.log("Edit button clicked for Item ID:", editingItemId);
    // Implement logic for opening the edit modal and populating data
    $('#editModal').modal('show');
});

function saveChanges() {
    console.log("Save Changes button clicked.");

    // Retrieve the new data from the modal
    var newItemName = $('#editItemName').val();
    var newItemValue = $('#editItemValue').val();

    // Update the data in your DataTable
    var selectedRow = table.row(function (idx, data, node) {
        return data.id === editingItemId;
    });

    if (selectedRow.data()) {
        var item = selectedRow.data();
        item.name = newItemName;
        selectedRow.data(item).draw();

        // Send the updated data to the server
        $.ajax({
            url: '/items/' + editingItemId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ name: newItemName, id: editingItemId}),
            success: function (response) {
                console.log('Item updated successfully:', response.message);
            },
            error: function (error) {
                console.log('Error updating item:', error);
            }
        });
    }

    // Reset the editing item ID
    editingItemId = null;

    // Close the modal
    $('#editModal').modal('hide');
}

// Save Changes Button Click Handler
$('#saveChangesButton').on('click', function () {
    saveChanges();
});

// Keypress Event Handler for Enter Key
$('#edit-modal-form').on('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveChanges();
    }
});


// Delete Item Button Click Handler
$('#item-table tbody').on('click', 'button.delete', function () {
    var itemId = $(this).data('id');
    console.log("Delete button clicked for Item ID:", itemId);
    // Implement logic for deleting an item
});




// Refresh table
// Refresh Button Click Handler
$('#refreshButton').on('click', function () {
    console.log("Refresh button clicked.");
    // Reload the DataTable
    table.ajax.reload();
});


// View Log Button Click Handler
$('#item-table tbody').on('click', 'button.view-log', function () {

    console.log('fixing column widths2')
    $('#log-table').DataTable().columns.adjust()

    var itemId = $(this).data('id');
    console.log("View Log button clicked for Item ID:", itemId);

    // Destroy the existing DataTable instance
    console.log("Destroying datatable instance")
    if ($.fn.DataTable.isDataTable('#log-table')) {
        $('#log-table').DataTable().destroy();
    }

    // Initialize or reload the DataTable for the log table with data specific to the selected item (replace '/log/{itemId}' with the actual URL)
    console.log("Requesting LOG data for item_id=" + itemId)
    var logTable = $('#log-table').DataTable({
        dom: 'Bfrtip', // Add DataTables buttons
        scrollY: '400px',
        scrollX: true,
        title: 'View Log',
        ajax: {
            url: '/log/' + itemId, // Replace with the actual URL to fetch log data specific to the selected item
            dataSrc: 'data'
        },
        columns: [
            { data: 'id', visible: false },
            { data: 'name' },
            { data: 'user' },
            {
            data: 'update_ts',
            render: function (data) {
                var date = new Date(data); // Convert JSON string to a Date object
                // Format the date to 'YYYY-MM-DD' format
                var formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
                return formattedDate;
            }
        },
        {
            data: 'create_ts',
            render: function (data) {
                var date = new Date(data); // Convert JSON string to a Date object
                // Format the date to 'YYYY-MM-DD' format
                var formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
                return formattedDate;
            }
        },
        {
            data: 'update_ts',
            render: function (data) {
                var date = new Date(data); // Convert JSON string to a Date object
                // Format the date to 'YYYY-MM-DD' format
                var formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
                return formattedDate;
            }
        },
        {
            data: 'update_ts',
            render: function (data) {
                var date = new Date(data); // Convert JSON string to a Date object
                // Format the date to 'YYYY-MM-DD' format
                var formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
                return formattedDate;
            }
        },
        ],
        buttons: [
        {
            extend: 'print',
            title: 'LOG', // Set the custom print title here
        },
        {
            extend: 'csv',
            title: 'LOG', // Set the custom print title here
        },
    ],
    });

    // Show the modal for viewing the log
    $('#viewLogModal').modal('show');
});

// Send Email Button Click Handler
$('#item-table tbody').on('click', 'button.send-email', function () {
    var itemId = $(this).data('id');
    console.log("Send Email button clicked for Item ID:", itemId);

    // Define the email subject and body content
    var emailSubject = "Regarding Item ID: " + itemId;
    var emailBody = "Hello,\n\nI would like to inquire about Item with ID " + itemId + ".\n\n";

    // Open the default mail app with predefined email
    var emailUrl = "mailto:?subject=" + encodeURIComponent(emailSubject) + "&body=" + encodeURIComponent(emailBody);
    window.location.href = emailUrl;
});



// Accept numbers only
// Get the float input field
const floatInput = document.getElementById('editItemValue');

// Add an input event listener to validate and format input
floatInput.addEventListener('input', function (e) {
    // Get the input value
    let inputValue = e.target.value;

    // Remove any characters that are not digits, commas, or dots
    inputValue = inputValue.replace(/[^\d.]/g, '');

    // Remove leading zeros and multiple consecutive dots
    inputValue = inputValue.replace(/^0+(?!$)/, ''); // Remove leading zeros
    inputValue = inputValue.replace(/(\.\d*?)\./g, '$1'); // Remove multiple consecutive dots

    // Update the input field with the sanitized value
    e.target.value = inputValue;
});