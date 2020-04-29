from flask import Flask
from db.mysql import MySQL
from login.loginHelper import LoginHelper


app = Flask(__name__)

mysqlDB = MySQL()

loginHelper = LoginHelper(app)

# REGISTER VIEW
import routes.view
# REGISTER APIs
import routes.user
import routes.admin
import routes.manager
import routes.customer


if __name__ == '__main__':
    app.run(debug=True)