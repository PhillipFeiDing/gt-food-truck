from flask_login import LoginManager, login_user, current_user, login_required
from login.user import User


class LoginHelper:
    
    def __init__(self, app):
        app.secret_key = b'Df990518!6' # set session secret key
        login_manager = LoginManager()
        login_manager.init_app(app)
        @login_manager.user_loader
        def load_user(user_id):
            return User.get(user_id)
