$('#back-button').on('click', () => {
    window.location.href = 'manageFoodTruck'
})

$('.add-tag-button').on('click', () => {
    const newFood = toggleFoodError()
    const newPrice = togglePriceError()
    if (!newFood || !newPrice) {
        return
    }

    $('#update-button').attr('disabled', false)
    $('.edit-tag-button').on('click')
    $('.select-selected').on('click')
    $('.remove-tag-button').on('click')

    if (isEditing) {
        $('#menu-item-table').find("tr:last").before(`
        <tr value="${newFood}">
            <td class="inner-table-cell">
                Food
            </td>
            <td class="inner-table-cell food-target" style="text-align: left;">
                ${newFood}
            </td>
            <td class="inner-table-cell">
                Price
            </td>
            <td class="inner-table-cell price-target">
                ${newPrice}
            </td>
            <td class="inner-table-cell" style="text-align: left"></td>
            <td class="inner-table-cell" style="text-align: right"><img src="${$('#edit-button-image-path-data').html()}" class="dash-icon image-icon-click edit-tag-button"/></td>
        </tr>
    `)
    } else {
        $('#menu-item-table').find("tr:last").before(`
            <tr value="${newFood}">
                <td class="inner-table-cell">
                    Food
                </td>
                <td class="inner-table-cell food-target" style="text-align: left;">
                    ${newFood}
                </td>
                <td class="inner-table-cell">
                    Price
                </td>
                <td class="inner-table-cell price-target">
                    ${newPrice}
                </td>
                <td class="inner-table-cell" style="text-align: left"></td>
                <td class="inner-table-cell" style="text-align: right"><img src="${$('#minus-button-image-path-data').html()}" class="dash-icon image-icon-click remove-tag-button"/></td>
            </tr>
        `)
    }
    $('#no-menu-item-error').css('display', 'none');
    bindRemoveTag()
    bindEditTag()
    isEditing = false
    $('#price-input').val('')

    currFoodList.push(newFood)
    
    let options = '<option value="">&nbsp;</option>'
    foodListAll.forEach((food) => {
        if (!currFoodList.includes(food)) {
            options += `<option value="${food}">${food}</option>`
        }
        $('#menu-item-select-wrapper').html(`
            <div class="custom-select unselectable narrow-select menu-item-select-div">
                <select id="menu-item-select">
                    ${options}
                </select>
            </div>
            <span class="error-message" id="no-food-selected-error" style="top: 30px;">* empty</span>
        `)
    })
    initializeSelect('menu-item-select-div')
    bindRemoveError()
})

$('#update-button').on('click', () => {
    const name = $('#food-name-input').val()
    const station = $('#station-select').children('option:selected').val()
    const assignedStaff = getSelected('select-assigned-staff')
    let foods = []
    $('.food-target').each(function() {
        foods.push($(this).text().trim())
    })
    let prices = []
    $('.price-target').each(function() {
        prices.push($(this).text().trim())
    })
    let menuItems = []
    for (let i = 0; i < foods.length; i++) {
        menuItems.push({
            food: foods[i],
            price: prices[i]
        })
    }

    let passed = true
    if (name === '') {
        $('#food-truck-name-error').css('display', 'inline')
        passed = false
    }
    if (station === '') {
        $('#station-error').css('display', 'inline')
        passed = false
    }
    if (assignedStaff.length < 1) {
        $('#staff-error').css('display', 'inline')
        passed = false
    }
    if (menuItems.length < 1) {
        $('#no-menu-item-error').css('display', 'inline')
        passed = false
    }
    if (!passed) {
        return
    }

    let data = {
        "oldName": oldFoodTruckName,
        "name": name,
        "station": station,
        "assignedStaff": assignedStaff,
        "menuItems": menuItems
    }
    
    post('/api/manager/updateFoodTruck', data).then((res) => {
        if (res.okay) {
            window.alert(`Successfully updated food truck ${name}.`)
            window.location.href = '/manageFoodTruck'
        } else {
            if (res.error.errno == 0) {
                window.alert('Bad request.')
            } else if (res.error.errno == 1) {
                $('#food-truck-name-error').css('display', 'inline')
            } else if (res.error.errno == 2) {
                window.alert('Database error.')
            }
        }
    })
})

$('#food-name-input').on('input', () => {
    $('#food-truck-name-error').css('display', 'none')
})
$('.station-select-div').on('click', () => {
    $('#station-error').css('display', 'none')
})
function bindStaffSelectError() {
    $('.select-assigned-staff').on('click', () => {
        $('#staff-error').css('display', 'none')
    })
}
bindStaffSelectError()

function toggleFoodError() {
    const newFood = $('#menu-item-select').children('option:selected').val()
    if (newFood === '') {
        $('#no-food-selected-error').css('display', 'inline')
        return false
    }
    return newFood
}
function togglePriceError() {
    const price = $('#price-input').val()
    if (!(/^[0-9]*\.{0,1}[0-9]{0,2}$/.test(price)) || price === '') {
        $('#price-error').css('display', 'inline')
        return false
    }
    return parseFloat(price).toFixed(2)
}

$('#price-input').on('input', () => {
    $('#price-error').css('display', 'none')
})

let isEditing = false
function bindRemoveTag() {
    $('.remove-tag-button').on('click', function() {
        const removedFood = ($(this).parent().parent().attr('value'))
        currFoodList = currFoodList.filter(function(food) { return food !== removedFood })

        let options = `<option value="">&nbsp;</option>`
        foodListAll.forEach((food) => {
            if (!currFoodList.includes(food)) {
                options += `<option value="${food}">${food}</option>`
            }
        })
        $('#menu-item-select-wrapper').html(`
            <div class="custom-select unselectable narrow-select menu-item-select-div">
                <select id="menu-item-select">
                    ${options}
                </select>
            </div>
            <span class="error-message" id="no-food-selected-error" style="top: 30px;">* empty</span>
        `)
        initializeSelect('menu-item-select-div')
        bindRemoveError()

        $(this).parent().parent().remove()
        isEditing = false
    })
}
bindRemoveTag()
function bindRemoveError() {
    $('.menu-item-select-div').on('click', () => {
        $('#no-food-selected-error').css('display', 'none')
    })
}
bindRemoveError()

function bindEditTag() {
    $('.edit-tag-button').on('click', function() {
        const removedFood = ($(this).parent().parent().attr('value'))
        currFoodList = currFoodList.filter(function(food) { return food !== removedFood })

        let options = `<option value="${removedFood}">${removedFood}</option>`
        $('#menu-item-select-wrapper').html(`
            <div class="custom-select unselectable narrow-select menu-item-select-div">
                <select id="menu-item-select">
                    ${options}
                </select>
            </div>
            <span class="error-message" id="no-food-selected-error" style="top: 30px;">* empty</span>
        `)
        initializeSelect('menu-item-select-div')
        bindRemoveError()

        $(this).parent().parent().remove()

        $('#update-button').attr('disabled', true)
        $('.edit-tag-button').off('click')
        $('.remove-tag-button').off('click')
        $('.select-selected').off('click')

        isEditing = true
    })
}
bindEditTag()

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

initializePage()
let foodListAll = Array()
let currFoodList = Array()
let oldFoodTruckName = JSON.parse(decodeURIComponent(window.location.href.split('?')[1]).split('=')[1]).foodTruckName
async function initializePage() {
    const foodTruckName = JSON.parse(decodeURIComponent(window.location.href.split('?')[1]).split('=')[1]).foodTruckName
    $('#food-name-input').val(foodTruckName)
    let res = await get('/api/manager/getAvailableStation?' + window.location.href.split('?')[1])
    if (res.okay) {
        const data = res.data
        let options = ''
        data.forEach((station) => {
            options += `<option value="${station.stationName}">${station.stationName}</option>`
        })
        $('#station-name-select-wrapper').html(`
            <select id="station-select">
                ${options}
            </select>
        `)
        initializeSelect('station-name-select-class')
    } else {
        window.alert('Request station list error.')
    }

    res = await get('/api/manager/getAvailableStaff?' + window.location.href.split('?')[1])
    if (res.okay) {
        const data = res.data
        data.forEach((staff) => {
            if (staff.assignedStaff) {
                $('#staff-select-wrapper').append(`
                    <div class="select-assigned-staff multiselect unselectable multiselect-selected" value="${staff.username}">${staff.availableStaff || staff.assignedStaff}</div>
                `)
            } else {
                $('#staff-select-wrapper').append(`
                    <div class="select-assigned-staff multiselect unselectable" value="${staff.username}">${staff.availableStaff || staff.assignedStaff}</div>
                `)
            }
        })
        initializeMultiselect()
    } else {
        window.alert('Request available staff error.')
    }
    bindStaffSelectError()

    res = await get('/api/manager/getMenuItem?' + window.location.href.split('?')[1])
    res.data.forEach((row) => {
        $('#menu-item-table').find("tr:last").before(`
            <tr value="${row.foodName}">
                <td class="inner-table-cell">
                    Food
                </td>
                <td class="inner-table-cell food-target" style="text-align: left;">
                    ${row.foodName}
                </td>
                <td class="inner-table-cell">
                    Price
                </td>
                <td class="inner-table-cell price-target">
                    ${row.price}
                </td>
                <td class="inner-table-cell" style="text-align: left"></td>
                <td class="inner-table-cell" style="text-align: right"><img src="${$('#edit-button-image-path-data').html()}" class="dash-icon image-icon-click edit-tag-button"/></td>
            </tr>
        `)
        bindEditTag()
        currFoodList.push(row.foodName)
    })

    res = await get('/api/manager/getFoodList')
    if (res.okay) {
        const data = res.data
        data.forEach(food => {
            foodListAll.push(food.foodName)
        })
    } else {
        window.alert('Request food list error.')
    }

    let options = '<option value="">&nbsp;</option>'
    foodListAll.forEach((food) => {
        if (!currFoodList.includes(food)) {
            options += `<option value="${food}">${food}</option>`
        }
        $('#menu-item-select-wrapper').html(`
            <div class="custom-select unselectable narrow-select menu-item-select-div">
                <select id="menu-item-select">
                    ${options}
                </select>
            </div>
            <span class="error-message" id="no-food-selected-error" style="top: 30px;">* empty</span>
        `)
    })
    initializeSelect('menu-item-select-div')

}
