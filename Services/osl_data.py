import sqlite3 #keeping it simple....
from osl_model import legislation, legislator

#to make things simple for the demo we'll use sqllite, but prod quality application will use an industrial strength relational database: postgres, sql server, etc. not using here because setup is too risky and cumbersome for a demo.

class data:
	def __init__(self, connectionString):
		self.connectionString = connectionString

	#get a list of congressmen. in a real application there's
	#pagination, filter criteria, sorting, etc.
	def get_legislators(self):	
		legislators:list = []

		conn = sqlite3.connect(self.connectionString)
		conn.row_factory = sqlite3.Row 
		try:
			cur = conn.cursor()
			cur.execute('select ID, FirstName, LastName, HomeTown from Legislator')
			rows = cur.fetchall()
			for row in rows:
				leg = legislator(row['FirstName'], row['LastName'], row['HomeTown'])
				leg.ID = row["ID"]
				legislators.append(leg)
		finally:
			conn.close() #keep it explicit.

		return legislators

	#get a list of bills. There should be pagination, sorting and filtering, etc.
	def get_bills(self):
		arr:list = []

		sql = """
			SELECT 
				l.ID AS bill_id,
				l.Title AS title,
				ll.LegislatorID AS sponsor_id,
				c.FirstName AS first_name,
				c.LastName AS last_name
			FROM Legislation_Legislator ll 
			INNER JOIN Legislation l on ll.LegislationID = l.ID
			INNER JOIN Legislator c ON c.ID = ll.LegislatorID
			ORDER BY l.ID DESC
			"""

		conn = sqlite3.connect(self.connectionString)
		conn.row_factory = sqlite3.Row #so we can use the column name as opposed to the index
		try:
			cur = conn.cursor()
			cur.execute(sql) #is it obvious i'm not getting paid for this?
			rows = cur.fetchall()
			id = 0
			bill = legislation('','')
			for row in rows:
				if id != row["bill_id"]: #we're ready to insert a new record
					bill = legislation(row['title'], '') #for the listing ignore the text - its not displayed in the report
					bill.ID = row["bill_id"]
					id = bill.ID
					arr.append(bill)
				bill.sponsors.append(row["sponsor_id"])
				sep = '' 
				if len(bill.sponsor_list) > 0:
					sep = ','
				#for displaying the sponsor list in the report.
				bill.sponsor_list +=  f"{sep} {row['first_name']} {row['last_name']}"
		finally:
			conn.close()

		return arr

	#add a congressman
	def add_cman(self, cman:legislator):
		id:int = 0
		conn = sqlite3.connect(self.connectionString)

		cur = conn.cursor()
		try:
			cur.execute(f""" 
				INSERT INTO Legislator (FirstName, LastName, HomeTown)
				VALUES ('{cman.first_name}', '{cman.last_name}', '{cman.hometown}')
			""")
			id = cur.lastrowid
			conn.commit()
		finally:
			conn.close()
		print(id)
		return id

	#useful for testing
	def clear_database(self):
		conn = sqlite3.connect(self.connectionString)

		cur = conn.cursor()
		try:
			cur.execute("DELETE FROM Legislation_Legislator")
			cur.execute("DELETE FROM Legislator")
			cur.execute("DELETE FROM Legislation")
			conn.commit()
		except sqlite3.Error:
			conn.rollback()
		finally:
			conn.close()
		print(id)
		return id

	def add_bill(self, bill:legislation):
		id:int = 0
		conn = sqlite3.connect(self.connectionString)

		cur = conn.cursor()
		sqlite3.isolation_level = None
		try:
			cur.execute(f"""
				INSERT INTO 
				Legislation 
					(title, text) 
				VALUES ('{bill.title}', '{bill.text}');		
				""") #TODO: guard against injection, escape ticks, etc. 
			id = cur.lastrowid
			for s in bill.sponsors:
				cur.execute(f"""
				INSERT INTO 
				Legislation_Legislator (LegislatorID, LegislationID) 
				VALUES ({s}, {id})
				""")
			conn.commit()
		except sqlite3.Error:
			conn.rollback()
		finally:
			conn.close()

		return id
