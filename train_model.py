import os
import sys

# Wrapper script allowing direct execution: python train_model.py
scripts_dir = os.path.join(os.path.dirname(__file__), "scripts")
if scripts_dir not in sys.path:
    sys.path.insert(0, scripts_dir)

from train_model import train_domain_classifier

if __name__ == "__main__":
    train_domain_classifier()
