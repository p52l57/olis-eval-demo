from osl_data import data
from osl_model import legislator, legislation
def add_bill():
	#put the data layer through its paces...
	d = data('/Users/paulshelton/Projects/OhioSLDemoProject/DB/OhioLegislators.db')
	#d.clear_database()
	cman = legislator('Paul', 'Shelton', 'Austin')
	cman.ID = d.add_cman(cman)
	cman2 = legislator('Amanda', 'Blackwelder', 'Austin')
	cman2.ID = d.add_cman(cman2)

	leg = legislation('A bill', 'Related to the agricultural classification of EMUs')
	leg.sponsors.append(cman.ID)
	leg.sponsors.append(cman2.ID)

	d.add_bill(leg)
	legs = d.get_legislators()




def load_test_data():
	d = data('/Users/paulshelton/Projects/OhioSLDemoProject/DB/OhioLegislators.db')
	d.clear_database()
	file = open("cman_sample_data.csv", "rt")
	try:
		lines = file.readlines()
		for line in lines: #why does it include the newline? mystery.
			vals = line.replace("\n","").split(",")
			d.add_cman(legislator(vals[0], vals[1], vals[2]))
	finally:
		file.close()

if __name__ == '__main__':
	add_bill()