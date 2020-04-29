import re

def isUsername(username):
    return username is not None and type(username) is str and username != ''


def isPassword(password):
    return password is not None and type(password) is str and len(password) >= 8


def isFirstName(firstName):
    return firstName is not None and type(firstName) is str and firstName != ''


def isLastName(lastName):
    return isFirstName(lastName)


def isBalance(balance):
    return balance is not None and type(balance) in (float, int) and balance > 0
    

def isEmail(email):
    return email is not None and type(email) is str and re.match('^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$', email) is not None