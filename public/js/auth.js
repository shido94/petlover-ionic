$(function () {

    $('#loginForm').click(function () {
        event.preventDefault();
        const email = $('#user_email').val();
        const password = $('#user_password').val();
        const user = { email: email, password: password };
        $.ajax({
            url: "/auth/login",
            method: 'POST',
            data: JSON.stringify(user),
            contentType: 'application/json',
            success: function (result) {
                if(result) {
                    result = JSON.parse(result);
                    // Materialize.toast(result.message,5000);
                }
            },
            error : function (err) {

                console.log('err: ', err.responseJSON);
            }
        })

    });
});