from flask import render_template, Blueprint, redirect, url_for
from app.routes.auth import login_required, get_current_user
from app.models import Listing, Claim, User
from app import db

user = Blueprint('user', __name__)

@user.route("/profile")
@login_required
def renderProfile():
    return render_template("profile.html")

@user.route("/my-listings")
@login_required
def myListings():
    current_user = get_current_user()
    listings = Listing.query.filter_by(donor_id=current_user.user_id).all()
    return render_template("my_listing.html", listings=listings)

@user.route("/my-claims")
@login_required
def myClaims():
    current_user = get_current_user()
    claims = Claim.query.filter_by(recipient_id=current_user.user_id).all()
    return render_template("my_claims.html", claims=claims)