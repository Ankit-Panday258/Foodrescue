from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  
    app.config['SECRET_KEY'] = 'some key'  
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable warning
    # Initialize extensions
    db.init_app(app)
    
    
    from .routes.home import home
    
    app.register_blueprint(home, url_prefix='/')

   
   
    
    migrate = Migrate(app, db)
    return app