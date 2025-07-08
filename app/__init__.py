from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  
    app.config['SECRET_KEY'] = "teamTejaskaSupersecretkey-andehproductionKeLiyeNahiHai"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Session configuration
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_TYPE'] = 'filesystem'
    
    # Initialize extensions
    db.init_app(app)
    
    # Import models (important for migrations)
    from app.models import User, Listing, Claim

    
    from .routes.home import home
    from .routes.food import food
    from .routes.auth import auth
    from .routes.user import user
    
    app.register_blueprint(home, url_prefix='/')
    app.register_blueprint(food, url_prefix='/foods')
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(user, url_prefix='/user')
   
    migrate = Migrate(app, db)
    
    return app