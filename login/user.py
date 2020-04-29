from flask_login import UserMixin


class User(UserMixin):

    users = {}

    def __init__(self, username, roles):
        UserMixin.__init__(self)
        self.id = username
        self.roles = roles
        User.users[self.id] = self
    
    def is_authenticated(self):
        print('called')
        return super().is_authenticated()

    @classmethod
    def get(cls, userid):
        return User.users.get(userid, None)
