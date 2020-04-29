function initializeMultiselect() {
    $('.multiselect').on('click', function() {
        if(!$(this).hasClass('multiselect-selected')) {
            $(this).addClass('multiselect-selected')
        } else {
            $(this).removeClass('multiselect-selected')
        }
    })
}
initializeMultiselect()

function getSelected(className) {
    res = []
    $('.' + className + '.multiselect-selected').each(function() {
        res.push($(this).attr('value'))
    })
    return res
}
