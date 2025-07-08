from flask import render_template, Blueprint, redirect, url_for


food = Blueprint('food', __name__)

@food.route('/')
def allListing():
    return render_template("listing.html")

#New route
@food.route("/new")
def renderNewForm():
    return render_template("new.html")

#Create route
@food.route("/", methods=["POST"])
def createListing():
    return redirect("/")

#Show route
@food.route("/id")
def showListing():
    return render_template("show.html")

#Edit route
@food.route("/<id>/edit")
def renderEditForm():
    return render_template("edit.html")

#Update route
@food.route("/<id>", methods=["POST"])
def updateListing(id):
    return redirect(f"/{id}")

#Delete route
@food.route("/<id>/delete", methods=["POST"])
def destroyListing():
    return redirect("/")


#Claims routes

#Render claim page
@food.route("/claim-now/<id>")
def renderClaimPage(id):
    return f"Claim page rendered for item {id}"

#Process claim
@food.route("/claim-now/<id>", methods=["POST"])
def processClaim(id):
    return f"Processing claim for item {id} and flash a success message"

#Render claimed/success page 
# @food.route("/claimed/<id>")
# def renderClaimedPage(id):
#     return f"Item {id} successfully claimed!"

#Cancel claim route
@food.route("/claim-cancel/<id>")
def cancelClaim(id):
    return f"Claim cancelled for item {id} and render to food page"

