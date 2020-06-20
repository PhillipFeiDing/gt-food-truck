from flask import Flask
from db.mysql import MySQL
from login.loginHelper import LoginHelper
import settings

app = Flask(__name__)
settings.app = app

mysqlDB = MySQL()
settings.mysqlDB = mysqlDB

loginHelper = LoginHelper(app)

# REGISTER VIEW
import routes.view
# REGISTER APIs
import routes.user
import routes.admin
import routes.manager
import routes.customer


if __name__ == '__main__':
    app.run()