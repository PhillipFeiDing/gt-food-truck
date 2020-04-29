const url = '/api/manager/foodTruckSummary'

$(document).ready(function () {
    $("#from-date-input").datepicker({
        showOn: "button",
        buttonImage: $('#calendar-image-path-data').html(),
        buttonImageOnly: true,
        buttonText: ""
    })
})
$(document).ready(function () {
    $("#to-date-input").datepicker({
        showOn: "button",
        buttonImage: $('#calendar-image-path-data').html(),
        buttonImageOnly: true,
        buttonText: ""
    })
})

$('#back-button').on('click', () => {
    window.location.href = 'home'
})

$('#filter-button').on('click', () => {
    const dateRangeResult = toggleDateRangeError()
    if (!dateRangeResult) {
        return
    }
    const foodTruckName = $('#food-truck-name-input').val()
    const stationName = $('#station-name-select').children('option:selected').val()
    let data = {}
    if (foodTruckName.length != 0) {
        data.foodTruckName = foodTruckName
    }
    if (stationName.length != 0) {
        data.stationName = stationName
    }
    if (!jQuery.isEmptyObject(dateRangeResult)) {
        data.dateRange = dateRangeResult
    }
    filterOptions = data
    requestDataAndRefresh()

    $('#food-truck-name-input').val('')
    $('#to-date-input').val('')
    $('#from-date-input').val('')
})

$('#view-detail-button').on('click', () => {
    const foodTruck = toggleFoodTruckSelectError()
    if (!foodTruck) {
        return
    }
    data = {'foodTruckName': foodTruck}
    window.location.href = 'summaryDetail?data=' + encodeURIComponent(JSON.stringify(data))
})

function toggleDateRangeError() {
    const dateFromStr = $('#from-date-input').val()
    const dateToStr = $('#to-date-input').val()
    if (dateFromStr === '' && dateToStr === '') {
        return {}
    } else if (dateFromStr == '') {
        const dateTo = new Date(dateToStr)
        if (isNaN(dateTo.getDate())) {
            $('#invalid-date-range-error').css('display', 'inline')
            return false
        }
        return {
            'dateTo': formatDate(dateTo)
        }
    } else if (dateToStr == '') {
        const dateFrom = new Date(dateFromStr)
        if (isNaN(dateFrom.getDate())) {
            $('#invalid-date-range-error').css('display', 'inline')
            return false
        }
        return {
            'dateFrom': formatDate(dateFrom)
        }
    }
    const dateFrom = new Date(dateFromStr)
    const dateTo = new Date(dateToStr)
    if (!(/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}$/.test(dateFromStr)) || isNaN(dateFrom.getDate()) || !(/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}$/.test(dateToStr))|| isNaN(dateTo.getDate()) || dateFrom > dateTo) {
        $('#invalid-date-range-error').css('display', 'inline')
        return false
    }
    return {
        'dateFrom': formatDate(dateFrom),
        'dateTo': formatDate(dateTo)
    }
}
function formatDate(date) {
    return pad(date.getFullYear(), 4) + '-' + pad((date.getMonth() + 1), 2) + '-' + pad(date.getDate(), 2)
}
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

$('#from-date-input, #to-date-input').on('change', () => {
    $('#invalid-date-range-error').css('display', 'none')
})
$('#from-date-input, #to-date-input').on('input', () => {
    $('#invalid-date-range-error').css('display', 'none')
})

let lastCheckedRadioButtonValue = null
function bindRadioButtons() {
    $("input[name='food-truck']").on('click', function() {
        if (!lastCheckedRadioButtonValue || lastCheckedRadioButtonValue !== this.value) {
            lastCheckedRadioButtonValue = this.value
            $('#none-selected-error').css('display', 'none')
        } else {
            this.checked = false
            lastCheckedRadioButtonValue = null
        }
    })
}
bindRadioButtons()

function toggleFoodTruckSelectError() {
    const ret = $("input[name='food-truck']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
}

let lastClickedSortImageIconValue = null
$('.sort-image-icon').on('click', function() {
    let data = {
        sortBy: $(this).attr('value')
    }
    if (!lastClickedSortImageIconValue || lastClickedSortImageIconValue !== $(this).attr('value')) {
        data.asc = true
        lastClickedSortImageIconValue = $(this).attr('value')
    } else {
        data.asc = false
        lastClickedSortImageIconValue = null
    }
    filterOptions.sortBy = data.sortBy
    filterOptions.asc = data.asc
    requestDataAndRefresh()
})

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

let filterOptions = {}
function requestDataAndRefresh() {
    if (jQuery.isEmptyObject(filterOptions)) {
        targetURL = url
    } else {
        targetURL = url + '?data=' + encodeURIComponent(JSON.stringify(filterOptions))
    }
    get(targetURL).then((res) => {
        if (res.okay) {
            refresh(res.data)
        } else {
            window.alert('Request Error.')
        }
    })
}
requestDataAndRefresh()

function refresh(data) {
    table = data.table
    stationList = data.stationList

    $('#target-table tr:not(:first)').remove()
    table.forEach((row) => {
        $('#target-table').append(`
            <tr>
                <td>
                    <div class="radio-button-wrapper">
                        <span class="radio-button-prompt"><input type="radio" name="food-truck" value="${row.foodTruckName}" class="radio-button-left">${row.foodTruckName}</span>
                    </div>
                </td>
                <td>${row.totalOrder}</td>
                <td>${row.totalRevenue}</td>
                <td>${row.totalCustomer}</td>
            </tr>
        `)
    })
    bindRadioButtons()

    let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    stationList.forEach((station) => {
        options += `<option value="${station.stationName}">${station.stationName}</option>`
    })
    $('#station-name-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="station-name-select">
                ${options}
            </select>
        </div>
    `)
    initializeSelect()
}
