import pandas as pd
import numpy as np
from pathlib import Path
from app.config import SAMPLE_DATA_DIR

def create_sample_messy_csv() -> Path:
    sample_path = SAMPLE_DATA_DIR / "sample_messy_data.csv"
    
    # Generate representative dataset with realistic messy data
    data = [
        # Customer Name, Email Address, PHONE_NUMBER, Joining Date, Sales Amount($), Category, Status
        [" Alice Smith ", "alice.smith@example.com", " 555-0192 ", "2023-01-15", "$1,250.50", "Electronics", "active"],
        ["BOB JOHNSON", "BOB.J@EXAMPLE.COM", "555-0193", "15/01/2023", "2,400.00", "electronics", "Active"],
        ["Charlie Brown", "charlie@@gmail.com", "555-0194", "2023/02/01", "$850.00", " Home & Kitchen ", "PENDING"],
        ["Diana Prince", "diana.prince@wonder.org", "N/A", "Feb 10, 2023", "1200", "Fashion", "Active"],
        ["   Ethan Hunt   ", "ethan.hunt@impossible.com", "555-0196", "2023-03-05", "$3,100.75", "electronics", "active"],
        
        # Exact Duplicate 1 (of Alice Smith)
        [" Alice Smith ", "alice.smith@example.com", " 555-0192 ", "2023-01-15", "$1,250.50", "Electronics", "active"],
        
        ["Fiona Gallagher", "fiona@gallagher.net", "555-0197", "2023-03-20", "null", "Home & Kitchen", "INACTIVE"],
        ["George Clark", "", "555-0198", "2023-04-02", "$450.25", "Books", "Active"],
        ["Hannah Abbott", "hannah.a@hogwarts.edu", "555-0199", "2023-04-18", "$920.00", " Books ", "active"],
        
        # Exact Duplicate 2 (of Bob Johnson)
        ["BOB JOHNSON", "BOB.J@EXAMPLE.COM", "555-0193", "15/01/2023", "2,400.00", "electronics", "Active"],
        
        ["Ian Malcolm", "ian.chaos@jurassic.com", "555-0200", "2023-05-01", "3500.50", "Electronics", "PENDING"],
        ["Julia Roberts", "julia@pretty.com", "555-0201", "05/12/2023", "$1,890.00", "Fashion", "Active"],
        ["Kevin Bacon", "kevin.bacon@sixdegrees.com", "N/A", "2023-06-01", "NaN", " Home & Kitchen ", "active"],
        ["Laura Croft", "laura@tomb.org", " 555-0203 ", "2023-06-15", "$5,400.00", "Fashion", "INACTIVE"],
        ["Michael Scott", "michael.scott@dundermifflin.com", "555-0204", "2023-07-04", "$750.00", "office supplies", "Active"],
        
        # Row with missing email and invalid numeric
        ["Nina Williams", "N/A", "555-0205", "2023-07-20", "ERROR", "Office Supplies", "active"],
        ["Oscar Martinez", "oscar.m@dundermifflin.com", "555-0206", "2023-08-01", "$1,420.80", "office supplies", "Active"],
        
        # Exact Duplicate 3 (of Michael Scott)
        ["Michael Scott", "michael.scott@dundermifflin.com", "555-0204", "2023-07-04", "$750.00", "office supplies", "Active"],

        ["Pam Beesly", "pam.b@dundermifflin.com", "555-0207", "2023-08-15", "$620.00", "office supplies", "Active"],
        ["Quentin Tarantino", "quentin@cinema.com", "555-0208", "2023-09-01", "$4,800.00", "Books", "PENDING"]
    ]
    
    columns = [
        " Customer Name ", 
        "Email Address", 
        "PHONE_NUMBER", 
        "Joining Date", 
        "Sales Amount($)", 
        "Category", 
        "Status"
    ]
    
    df = pd.DataFrame(data, columns=columns)
    df.to_csv(sample_path, index=False)
    return sample_path
