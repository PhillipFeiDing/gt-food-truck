const url = '/api/admin/manageFood'

$('#back-button').on('click', () => {
    window.location.href = 'home'
})
$('#create-button').on('click', () => {
    window.location.href = 'createFood'
})
$('#delete-button').on('click', () => {
    const foodName = toggleFoodSelectError()
    if (!foodName) {
        return
    }
    const data = {
        name: foodName
    }
    post('/api/admin/deleteFood', data).then(res => {
        if (res.okay) {
            window.alert(`Successfully deleted food ${foodName}.`)
            requestDataAndRefresh()
        } else {
            if (res.error.errno == 0) {
                window.alert('Food does not exist.')
            } else if (res.error.errno == 1) {
                window.alert('Bad request.')
            } else if (res.error.errno == 2) {
                window.alert('Database error.')
            }
        }
    })
})
$('#filter-button').on('click', () => {
    const foodName = $('#food-name-select').children('option:selected').val()
    let data = {}
    if (foodName) {
        data.name = foodName
    }
    filterOptions = data
    requestDataAndRefresh()
})

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
    let foodName = $('#food-name-select').children('option:selected').val()
    if (foodName != '') {
        data.name = foodName
    }
    filterOptions = data
    requestDataAndRefresh()
})

let lastCheckedRadioButtonValue = null
bindRadioButtons()
function bindRadioButtons() {
    $("input[name='food-name']").on('click', function() {
        if (!lastCheckedRadioButtonValue || lastCheckedRadioButtonValue !== this.value) {
            lastCheckedRadioButtonValue = this.value
            $('#none-selected-error').css('display', 'none')
        } else {
            this.checked = false
            lastCheckedRadioButtonValue = null
        }
    })
}

function toggleFoodSelectError() {
    const ret = $("input[name='food-name']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
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

let filterOptions = ''
function requestDataAndRefresh() {
    if (filterOptions === '') {
        targetURL = url
    } else {
        targetURL = url + '?data=' + encodeURIComponent(JSON.stringify(filterOptions))
    }
    get(targetURL).then((res) => {
        if (res.okay) {
            refresh(res.data)
        } else {
            if (res.error.errno == 0) {
                window.alert('Fail to retrieve food table.')
            } else if (res.error.errno == 1) {
                window.alert('Fail to retrieve food list.')
            }
        }
    })
}
requestDataAndRefresh()

function refresh(data) {
    $('#target-table tr:not(:first)').remove()
    data.table.forEach((row) => {
        $('#target-table').append(`
            <tr>
                <td>
                    <div class="radio-button-wrapper">
                        <span class="radio-button-prompt"><input type="radio" name="food-name" value="${row.foodName}" class="radio-button-left">${row.foodName}</span>
                    </div>
                </td>
                <td>${row.menuCount}</td>
                <td>${row.purchaseCount}</td>
            </tr>
        `)
    })
    bindRadioButtons()

    let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    data.foodList.forEach((food) => {
        options += `<option value="${food.foodName}">${food.foodName}</option>`
    })
    $('#food-name-select-wrapper').html(`
        <div class="custom-select unselectable" style="margin: 0 0 0 25px;">
            <select id="food-name-select">
                ${options}
            </select>
        </div>
    `)
    initializeSelect()
}
