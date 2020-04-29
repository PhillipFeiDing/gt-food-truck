$('#back-button').on('click', () => {
    window.location.href = 'manageBuildingAndStation'
})

$('#building-name-input').on('input', () => {
    $('#building-name-error').css('display', 'none')
})

$('#description-textarea').on('input', () => {
    $('#building-description-error').css('display', 'none')
})

$('#create-button').on('click', () => {
    let passed = true
    if ($('#building-name-input').val() === '') {
        $('#building-name-error').css('display', 'inline')
        passed = false
    }
    if ($('#description-textarea').val() === '') {
        $('#building-description-error').css('display', 'inline')
        passed = false
    }
    let data = {
        name: $('#building-name-input').val(),
        description: $('#description-textarea').val(),
    }
    let tags = []
    $('.tag-target').each(function() {
        tags.push($(this).text())
    })
    data.tags = tags
    if (tags.length == 0) {
        $('#no-tag-error').css('display', 'inline');
        passed = false
    }
    if (passed) {
        post('/api/admin/createBuilding', data).then((res) => {
            if (res.okay) {
                window.alert(`Succesfully created building ${data.name}.`)
                window.location.href = '/manageBuildingAndStation'
            } else if (res.error.errno == 0) {
                window.alert('Database error.')
            } else if (res.error.errno == 1) {
                window.alert('Bad request.')
            } else if (res.error.errno == 2) {
                $('#building-name-error').css('display', 'inline')
            }
        })
    }
})

$('.add-tag-button').on('click', () => {
    const newTag = $("#new-tag-input").val()
    if (newTag !== '') {
        $('#tag-table').find("tr:last").before(`
        <tr>
            <td class="inner-table-cell tag-target">${newTag}</td>
            <td class="inner-table-cell" style="text-align: left"></td>
            <td class="inner-table-cell" style="text-align: right"><img src="${$('#minus-button-image-path-data').html()}" class="dash-icon image-icon-click remove-tag-button"/></td>
        </tr>
        `)
        $('#no-tag-error').css('display', 'none');
        bindRemoveTag()
        $('#new-tag-input').val('')
    }
})

function bindRemoveTag() {
    $('.remove-tag-button').on('click', function() {
        $(this).parent().parent().remove()
    })
}
bindRemoveTag()

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
