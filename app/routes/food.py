from flask import render_template, Blueprint, redirect, url_for


food = Blueprint('food', __name__)

@food.route('/')
def allListing():
    return "Here is all listings"

#New route
@food.route("/new")
def renderNewForm():
    return "Render new form"

#Create route
@food.route("/", methods=["POST"])
def createListing():
    return "Listing created"

#Show route
@food.route("/id")
def showListing():
    return "This is show page"

#Edit route
@food.route("/id/edit")
def renderEditForm():
    return "You are editing a food item"

#Update route
@food.route("/id", methods=["POST"])
def updateListing():
    return "Listing updated"

#Delete route
@food.route("/id/delete", methods=["POST"])
def destroyListing():
    return "Listing deleted"


#Claims routes

#Render claim page
@food.route("/claim-now/<id>")
def renderClaimPage(id):
    return f"Claim page rendered for item {id}"

#Process claim
@food.route("/claim-now/<id>", methods=["POST"])
def processClaim(id):
    return f"Processing claim for item {id}"

#Render claimed/success page 
@food.route("/claimed/<id>")
def renderClaimedPage(id):
    return f"Item {id} successfully claimed!"

#Cancel claim route
@food.route("/claim-cancel/<id>")
def cancelClaim(id):
    return f"Claim cancelled for item {id}"

