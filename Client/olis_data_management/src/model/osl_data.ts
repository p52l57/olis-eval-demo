export class Legislator{
	public first_name:string = '';
	public last_name:string = '';
	public ID:number = 0;
	public hometown:string = '';
}

export class Legislation{
	public title:string = '';
	public text:string = '';
	public ID:number = 0;
	public sponsors:number[] = [];
	public sponsor_list:string = ''; //a summary of the sponsors for display purposes
}
