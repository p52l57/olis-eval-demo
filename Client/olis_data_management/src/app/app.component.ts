import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgIf} from '@angular/common';
import { osl } from '../services/osl';
import { CommonModule } from '@angular/common'; // Or import { NgStyle } 
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms';
import { Legislation, Legislator } from '../model/osl_data';

//NOTE: we're rolling everything together in one file to make life 
// easy for the reader/evaluator, but the prod solution would involve implementing 
// distinct components for each dialog and view to make things reusable 
// and simplify maintenance.

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers:[osl]
})
export class AppComponent {
  	title = 'osl_data_management';
	service = inject(osl);
	public loading:boolean = false;;
	public selectedTab:string = 'legislators'; //which tab is active - legs or bills
	public searchTerm:string = ''; //gold plating - filter the active list
	public showAddCManDialog:boolean = false; //show a dialog to add a legislator record?
	public showAddBillDialog:boolean = false; //show a dialog to add a bill record?
	public legislators:Legislator[] = []; //the master list of legislators
	public filteredLegislators:Legislator[] = []; //the filtered list we display in the report
	public bills:Legislation[] = []; //master list of bills
	public filteredBills:Legislation[]=[]; //the filtered list we show in the report
	public showErrorDialog:boolean = false; //show an error dialog when a communications related error happens
	public errorMessage:string = ''; //the message displayed in the error dialog
	public selectedCman:Legislator = new Legislator(); //cman record we are adding or editing
	public selectedBill:Legislation = new Legislation(); //bill record we are adding or editing
	public cmanSourceList:Legislator[] = []; //records available to add to sponsor list
	public pendingSponsorList:Legislator[] = []; //the selected sponsor list 
	public billErrMessage:string = ''; 

  	public constructor(){
		this.selectedTab = 'legislators';
		this.refreshLegislatorList();
	}

	//get the full list from the database. 
	//to simplify we're not paginating, sorting, or filtering on the backend
	public refreshLegislatorList():void{
		this.loading = true; //hide everything and show a rudimentary progress indicator
		this.service.getLegislators().subscribe(data=>{
			this.legislators = data;
			this.cmanSourceList = data;//for testing
			this.filterLegList();
		}, err => {
			this.handleError(err);
		}).add(()=>{
			this.loading = false;
		})
	}

	//populate the bill listing report
	public refreshBillsList():void{
		this.loading = true;
		this.service.getBills().subscribe(data=>{
			this.bills = data;
			this.filteredBills = data;
			this.filterBillsList();
		}, err=>{this.handleError(err);}).add(()=>{
			this.loading = false;
		});
	}


	private handleError(err:Error):void{
		//show the info dialog
		this.errorMessage = err.message;
		this.showErrorDialog = true;
	}

	public selectLegislatorsTab():void{
		this.selectedTab = 'legislators';
		this.refreshLegislatorList();
	}

	public selectBillsTab():void{
		this.selectedTab = 'bills';
		this.refreshBillsList();
	}

	public filterLegList():void{
		if(this.searchTerm.trim() == '') {
			this.filteredLegislators = this.legislators;
			return;
		}

		this.filteredLegislators = this.legislators.filter(a=>{
			let search = this.searchTerm.trim().toLowerCase();

			return a.first_name.toLowerCase().indexOf(search) != -1 ||
			a.last_name.toLowerCase().indexOf(search) != -1 ||
			a.hometown.toLowerCase().indexOf(search) != -1;
		})
	}

	public filterBillsList():void{
		if(this.searchTerm.trim() == '') {
			this.filteredBills = this.bills;
			return;
		}

		this.filteredBills = this.bills.filter(a=>{
			let search = this.searchTerm.trim().toLowerCase();

			return a.title.toLowerCase().indexOf(search) != -1 ||
			a.text.toLowerCase().indexOf(search) != -1 ||
			a.sponsor_list.toLowerCase().indexOf(search) != -1;
		});
	}

	public getTopic():string{
		if(this.selectedTab == 'bills') return 'bill';
		return 'legislator';
	}
	public cancelCmanAdd():void{
		this.selectedCman = new Legislator();
		this.showAddCManDialog = false;

	}

	public validationErrorMessage:string = '';

	public showAddDialog():void{
		if(this.selectedTab == 'bills'){
			this.cmanSourceList = this.legislators;
			this.sortLegList(this.cmanSourceList);
			this.showAddBillDialog = true;
		}else{
			this.showAddCManDialog = true;
		}
	}

	public addCman():void{
		let validErr = this.validateCmanRecord();

		if(validErr != '') {
			this.validationErrorMessage = validErr;
			return;
		}

		this.loading = true;

		this.service.addLegislator(this.selectedCman).subscribe(a=>{
			this.cancelCmanAdd();
			if(this.selectedTab == 'bills'){
				this.refreshBillsList();
			}
			else{
				this.refreshLegislatorList();
			}
		},err=>{
			this.handleError(err);
		}).add(()=>{
			this.loading = false;
		})
	}

	
	private validateCmanRecord():string{
		if(this.selectedCman.first_name.trim() == '') return 'First name is a required field.';
		if(this.selectedCman.last_name.trim() == '') return 'Last name is a required field.';
		if(this.selectedCman.hometown.trim() == '') return 'Hometown is a required field.';
		return '';
	}

	public targetCman = null;
	public targetSponsor = null;

	public commitCmanSelections():void{
		if(this.targetCman != null){
			if(this.pendingSponsorList.find(a=>a==this.targetCman) == undefined)
			{
				this.pendingSponsorList.push(this.targetCman);
				this.sortLegList(this.pendingSponsorList);
			}
			this.cmanSourceList = this.cmanSourceList.filter(a => a != this.targetCman);
			this.sortLegList(this.cmanSourceList);
		}
	}

	public removeCmanSelections():void{
		if(this.targetSponsor != null){
			if(this.cmanSourceList.find(a=>a==this.targetSponsor) == undefined){
				this.cmanSourceList.push(this.targetSponsor);
				this.sortLegList(this.cmanSourceList);
			}
			this.pendingSponsorList = 
				this.pendingSponsorList.filter(a => a != this.targetSponsor);
			this.sortLegList(this.pendingSponsorList);
		}
	}

	private sortLegList(list:Legislator[]):void{
		list.sort((a,b)=>{
			if(a.first_name > b.first_name) return 1;
			if(a.first_name < b.first_name) return -1;
			return 0;
		})

	}


	public addBill():void{
		this.billErrMessage = this.validateBillForm();
		if(this.billErrMessage != '') return;
		this.loading = true;

		for(let id of this.pendingSponsorList){
			this.selectedBill.sponsors.push(id.ID)
		}

		this.service.addBill(this.selectedBill).subscribe(data=>{
			this.refreshBillsList();
		},err=>{
			this.handleError(err);
		}).add(()=>{
			this.loading = false;
			this.cancelBillAdd();
			this.showAddBillDialog = false;
		});
	}

	public cancelBillAdd():void{
		this.selectedBill = new Legislation();
		this.targetCman = null;
		this.targetSponsor = null;
		this.showAddBillDialog = false;
		this.pendingSponsorList = [];
	}

	public validateBillForm():string{
		if(this.selectedBill.title.trim() == '') return 'Title is a required field.';
		if(this.selectedBill.text.trim() == '') return 'Text is a required field.';
		if(this.pendingSponsorList.length == 0) return 'Must select one or more bill sponsors.';
		return '';
	}
  }

