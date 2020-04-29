$(document).ready(function () {
    $("#date-input").datepicker({
        showOn: "button",
        buttonImage: $('#calendar-image-path-data').html(),
        buttonImageOnly: true,
        buttonText: ""
    })
})

$('#back-button').on('click', () => {
    window.location.href = 'currentInformation'
})

$('#submit-button').on('click', () => {
    const data = {}
    let passed = true
    data.menuItems = []
    let foodCount = 0;
    $('.menu-item-input').each(function() {
        const orderedThisItem = $('#menu-item-' + $(this).val() + '-input:checked').val()
        if (orderedThisItem) {
            const quantityStr = $('#quantity-' + $(this).val() + '-input').val()
            if (/^[0-9]+$/.test(quantityStr) && parseInt(quantityStr) > 0) {
                data.menuItems.push({
                    'food': $(this).val(),
                    'quantity': parseInt(quantityStr)
                })
                foodCount++
            } else {
                $('#invalid-order-error').css('display', 'inline')
                passed = false
            }
        }
    })
    if (foodCount == 0) {
        $('#invalid-order-error').css('display', 'inline')
        passed = false
    }
    const dateStr = $('#date-input').val()
    const date = new Date(dateStr)
    if (!(/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}$/.test(dateStr)) || isNaN(date.getDate())) {
        $('#invalid-date-error').css('display', 'inline')
        passed = false
    } else {
        data.date = formatDate(date)
    }

    if (!passed) {
        return
    }
    
    data.foodTruck = foodTruck
    post('/api/customer/makeOrder', data).then((res) => {
        if (res.okay) {
            window.alert('You successfully made an order.')
            window.location.href = 'orderHistory'
        } else {
            if (res.error.errno == 0) {
                window.alert('Bad request.')
            } else if (res.error.errno == 1) {
                window.alert('Failed to create order.')
            } else if (res.error.errno == 2) {
                window.alert('Balance not enough.')
            } else if (res.error.errno == 3) {
                window.alert('Database error.')
            }
        }
    })
})

function formatDate(date) {
    return pad(date.getFullYear(), 4) + '-' + pad((date.getMonth() + 1), 2) + '-' + pad(date.getDate(), 2)
}
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// Send get request
function get(url) {
    return $.get(url)
}

// Send post request
function post(url, data = {}) {
    return $.ajax({
        type: 'post',
        url,
        data: JSON.stringify(data),
        contentType: "application/json",
    })
}

const foodTruck = JSON.parse(decodeURIComponent(window.location.href.split('?')[1]).split('=')[1]).foodTruck
$('#foodTruck-name-display').text(foodTruck) || 'N/A'
get('/api/customer/foodTruckMenu?data=' + encodeURIComponent(JSON.stringify({'foodTruck': foodTruck}))).then(res => {
    if (res.okay) {
        data = res.data
        $('#target-table tr:not(:first)').remove()
        data.forEach((row) => {
            $('#target-table').append(`
                <tr>
                    <td>
                        <label class="checkbox-wrapper">
                        ${row.foodName}
                            <input type="checkbox" value="${row.foodName}" class="menu-item-input" id="menu-item-${row.foodName}-input"> 
                            <span class="geekmark"></span>
                        </label>
                    </td>
                    <td>${row.price}</td>
                    <td><input type="text" class="narrowest-input-textbox quantity-input" style="text-align: center;" id="quantity-${row.foodName}-input"/></td>
                </tr>
            `)
        })
        bindRemoveError()
    } else {
        window.alert('Request failed.')
    }
})

function bindRemoveError() {
    $('.menu-item-input').on('click', () => {
        $('#invalid-order-error').css('display', 'none')
    })
    $('.quantity-input').on('input', () => {
        $('#invalid-order-error').css('display', 'none')
    })
}

$('#date-input').on('change', () => {
    $('#invalid-date-error').css('display', 'none')
})
$('#date-input').on('input', () => {
    $('#invalid-date-error').css('display', 'none')
})
