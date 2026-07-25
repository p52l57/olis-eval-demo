from flask import Flask, request, jsonify
from flask_cors import CORS
from osl_model import legislator, legislation
from osl_data import data
import json

app = Flask(__name__)
CORS(app) #clearly this is a demo if we are letting everything in.

def loadConfig(): #roll your own config...
	lookup:dict = {}
	file = open("config.txt", "rt")
	try:
		lines = file.readlines()
		for line in lines: #why does it include the newline? mystery.
			vals = line.replace("\n","").split("=")
			lookup[vals[0]] = vals[1]
	finally:
		file.close()
	return lookup

config = loadConfig()

#get the list of congressmen (in reality there's be pagination, filter, etc.)
@app.route("/legislator", methods=['GET'])
def get_legislators():
	db = data(config['ConnectionString'])
	list = db.get_legislators()
	return jsonify([leg.to_dict() for leg in list])

#add a congressman
@app.route("/legislator", methods=['POST'])
def add_legislator():
	db = data(config['ConnectionString'])
	post_data = request.get_json() 
	first_name = post_data.get('first_name')
	last_name = post_data.get('last_name')
	home_town = post_data.get('hometown')
	cman = legislator(first_name, last_name, home_town)
	db.add_cman(cman)
	return json.dumps(vars(cman)) #why does this jsonifying not come out of the box like it does in .NET?

#get the list of bills. skip the text because we are not showing it in the report
@app.route("/legislation", methods=['GET'])
def get_bills():
	db = data(config['ConnectionString'])
	list = db.get_bills()
	return jsonify([bill.to_dict() for bill in list])

# add a bill
@app.route("/legislation", methods=['POST'])
def add_bill():
	db = data(config['ConnectionString'])
	bill = request.get_json() 
	cman_list = bill.get('sponsors', [])
	leg = legislation(bill.get('title'), bill.get('text'))
	leg.sponsors = cman_list
	leg.ID = db.add_bill(leg)
	return json.dumps(vars(leg))

@app.route("/config", methods=['GET'])
def show_config():
	return config

# if __name__ == '__main__':
# 	config = loadConfig()