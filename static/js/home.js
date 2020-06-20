$('#manage-building-and-station-button').on('click', () => {
    window.location.href = 'manageBuildingAndStation'
})
$('#manage-food-button').on('click', () => {
    window.location.href = 'manageFood'
})
$('#manage-food-truck-button').on('click', () => {
    window.location.href = 'manageFoodTruck'
})
$('#view-food-truck-summary-button').on('click', () => {
    window.location.href = 'foodTruckSummary'
})
$('#explore-button').on('click', () => {
    window.location.href = 'explore'
})
$('#view-order-history-button').on('click', () => {
    window.location.href = 'orderHistory'
})
$('#view-current-information-button').on('click', () => {
    window.location.href = 'currentInformation'
})

const roles = JSON.parse(($.cookie('user-roles') || '[]').replace('\\054', ','))
roles.forEach((role) => {
    if (role == 'Customer') {
        $('#explore-button').prop('disabled', false)
        $('#view-order-history-button').prop('disabled', false)
        $('#view-current-information-button').prop('disabled', false)
    } else if (role == 'Manager') {
        $('#manage-food-truck-button').prop('disabled', false)
        $('#view-food-truck-summary-button').prop('disabled', false)
    } else if (role == 'Admin') {
        $('#manage-building-and-station-button').prop('disabled', false)
        $('#manage-food-button').prop('disabled', false)
        $('#reset-state-button').prop('disabled', false)
    }
})

$('#reset-state-button').on('click', () => {
    const disabled = true
    if (window.confirm('You are about to reset default database state. This is potentially destructive. Are you sure to continue?')) {
        if (disabled) {
            window.alert('Sorry, this feature has just been turned off by developer due to the unstable nature of free cloud database. If you are interested. Please clone the repository at https://github.com/PhillipFeiDing/gt-food-truck and run it locally.')
            return
        }
        post('/api/admin/resetState', {}).then(res => {
            if (res.okay) {
                window.location.href = '/'
            } else {
                window.alert('Database error.')
            }
        })
    }
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