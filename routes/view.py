from __main__ import app
from flask import render_template


@app.route('/')
@app.route('/login')
def loginPage():
    return render_template('login.html')

@app.route('/register')
def registerPage():
    return render_template('register.html')

@app.route('/createBuilding')
def createBuildingPage():
    return render_template('createBuilding.html')

@app.route('/createFood')
def createFoodPage():
    return render_template('createFood.html')

@app.route('/createFoodTruck')
def createFoodTruckPage():
    return render_template('createFoodTruck.html')

@app.route('/createStation')
def createStationPage():
    return render_template('createStation.html')

@app.route('/currentInformation')
def currentInformationPage():
    return render_template('currentInformation.html')

@app.route('/explore')
def explorePage():
    return render_template('explore.html')

@app.route('/foodTruckSummary')
def foodTruckSummaryPage():
    return render_template('foodTruckSummary.html')

@app.route('/home')
def homePage():
    return render_template('home.html')

@app.route('/manageBuildingAndStation')
def manageBuildingAndStationPage():
    return render_template('manageBuildingAndStation.html')

@app.route('/manageFood')
def manageFoodPage():
    return render_template('manageFood.html')

@app.route('/manageFoodTruck')
def manageFoodTruckPage():
    return render_template('manageFoodTruck.html')

@app.route('/order')
def orderPage():
    return render_template('order.html')

@app.route('/orderHistory')
def orderHistoryPage():
    return render_template('orderHistory.html')

@app.route('/summaryDetail')
def summaryDetailPage():
    return render_template('summaryDetail.html')

@app.route('/updateBuilding')
def updateBuildingPage():
    return render_template('updateBuilding.html')

@app.route('/updateFoodTruck')
def updateFoodTruckPage():
    return render_template('updateFoodTruck.html')

@app.route('/updateStation')
def updateStationPage():
    return render_template('updateStation.html')
