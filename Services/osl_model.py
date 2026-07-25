class legislator:
	first_name:str = ''
	last_name:str = ''
	hometown:str = ''
	ID:int = 0

	def __init__(self, first, last, hometown):
		self.first_name = first
		self.last_name = last
		self.hometown = hometown

	def to_dict(self):
		return {
			"ID": str(self.ID),
			"first_name": self.first_name,
			"last_name": self.last_name,
			"hometown":self.hometown
		}

class legislation:
	ID:int = 0
	title:str = ''
	text:str = ''
	sponsor_list = ''
	sponsors = [] #array of legislator IDs

	def __init__(self, title, text):
		self.title = title
		self.text = text
		self.sponsors = []

	def to_dict(self):
		return {
			"ID": self.ID,
			"title":self.title,
			"text":self.text,
			"sponsor_list":self.sponsor_list,
			"sponsors": self.sponsors
		}
