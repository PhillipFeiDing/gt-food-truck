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
    }
})
