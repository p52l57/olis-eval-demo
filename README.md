
Watch the movie called OLIS_EVAL_DEMO.mov for a silent walkthrough of how this works.

Assumptions: 

    1) Python3 is installed and in the path
    2) Node is installed and npm is in the path

How to setup the application: 
  Run the API via Flask - serves the api and interacts with the sqlite database 
    
    1) Navigate to Services directory 
    2) setup a virtual environment: "python3 -m venv .venv" 
    3) activate the virtual environment: ". .venv/bin/activate" 
    4) install flask" "pip install Flask" 
    5) install flask cors: "pip install -U flask-cors" 
    6) run the api: "flask --app osl-api run" 
  
  Run the SPA via Angular: 
  
    1) navigate to Client/olis-data-management 
    2) run "npm install" 
    3) to fire up the web site, run "npm start"

Navigate your browser to http://localhost:4200 to run the web application. 

Click on the Legislator tab and click the "Legislators" tab and press the "Add Legislator" button to see the dialog to add a legislator.

Note the legislator report with rudimentary filter.

Click on the "Bills" table and click the "Add Bill" button to add a bill.

Note the bills report.

Read my email for editorial commentary and "insight"
