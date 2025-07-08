from flask import render_template, Blueprint, redirect, url_for


auth = Blueprint('auth', __name__)


@auth.route("/login")
def renderLoginForm():
    render_template("login.html")

@auth.route("/signup")
def renderSignupForm():
    render_template("register.html")

@auth.route("/logout")
def logout():
    return "Logout successful"


