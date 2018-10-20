package java_assignment;

import java.util.Scanner;

public class step1b {
	
	public static void main (String[] args){
		
		//User Input
		Scanner sc=new Scanner(System.in);
		System.out.println("Please enter your query here");
		String myquery= sc.nextLine().toLowerCase();
		System.out.println("Your Query is "+myquery);		
		String[] query=myquery.trim().split("from");
		if(query[0].toLowerCase().contains("select")) {
			// All actions in Step1b Assignmnet
			one(myquery);
			two(myquery);
			three(myquery);
			four(myquery);
			nine(myquery);			
			five(myquery);
			six(myquery);
			seven(myquery);
			eight(myquery);
		}
		else System.out.println("invalid selec");

	}	
	
	public static void one(String query){
		
		String[] splitted=query.split("from");		
			
			if(splitted[1].contains("where")){
				String[] splitted1=splitted[1].split("where");	
				System.out.println("File Name/DB: "+splitted1[0].trim());
				
			}
			else System.out.println("File Name/DB: "+splitted[1].trim());
			
			
		
	}
	
	public static void two(String query){
		
		if(query.contains("where")){
		
		String[] splitted=query.split("where");
		System.out.println("Base part Before where "+splitted[0]);
		
		}
		else System.out.println("Base part Before where: "+query);
		
		
	}

	public static void three(String query){
		
		if(query.contains("where")){
		String[] splitted=query.split("where");
		System.out.println("Filter part After where: "+splitted[1]);
		}
		else System.out.println("No where condition");
	}
	
	public static void four(String query){
		
		if(query.contains("where")){
		String[] splitted=query.split("where");

		String[] vin1=splitted[1].split("\\sand\\s|\\sor\\s");
		for(String str:vin1) System.out.println("Seperated condition are: "+str.trim());
	}
	else System.out.println("No where Condition");
	}
	
	
	public static void five(String query){
		
		int count=0;
		int count1=0;
		if(query.contains("where")){
		String[] splitted=query.split("\\s+");
		
		for (int i=0;i<splitted.length;i++){
			
			String vin=splitted[i];

			if(vin.equals("and")){
				count++;
			}
		
			if(vin.equals("or")){
				count1++;
			}
			
			
		}
		if (count==0) System.out.println("no and condition");
		else System.out.println("Query has "+count+" and condition");
		if (count1==0) System.out.println("no or condition");
		else System.out.println("Query has "+count1+" or condition");
		}
		else System.out.println("No where");
	}
	
	public static void six(String query){
		
		String[] splitted=query.split("from");
		String[] splitted2=splitted[0].split("\\s");
		String output="";
		
		for (int i=0;i<splitted2.length;i++){
			
			if(!splitted2[i].trim().equals("select" )){
				output+=splitted2[i];					
			}
		}
		System.out.println("The selected fields/information: "+output);
		
		
	}
	public static void seven(String query){
		
		if(query.contains("where")){
			String vin="";
		
		String[] splitted=query.split("\\s+");
		
		for (int i=0;i<splitted.length;i++){	
			if(splitted[i].equals("order") && splitted[i+1].equals("by")){
				vin=splitted[i+2];
				System.out.println("Order By String is; "+splitted[i+2]);
				break;		
			}
		}
		if(vin=="") System.out.println("No Oder By Elements");
		}
		else System.out.println("No where");
		
	}
	
	public static void eight(String query){
		
		if(query.contains("where")){
		String[] splitted=query.split("\\s+");
		String vin="";
		for (int i=0;i<splitted.length;i++){	
			if(splitted[i].equals("group") && splitted[i+1].equals("by")){
				vin=splitted[i+2];
				System.out.println("Group By String is; "+splitted[i+2]);
				break;		
			}
		}
		if(vin=="") System.out.println("No Group By Elements");
	}
		else System.out.println("No where");
		
	}
	
	public static void nine(String query){
		
		String[] splitted=query.split("\\s+");
		String output="";
		String vin="";
		
		for (int i=0;i<splitted.length;i++){
			
			if(splitted[i]!="select" ){
				output=splitted[1];					
			if(splitted[i].equals("from"))break;		
			}
		}

		String[] splitted1=output.split(",");
		for (String str:splitted1){	
			if(str.contains("avg")||str.contains("min")||str.contains("max")||str.contains("sum")){
			System.out.println("AggregateFunciton is "+str);
			vin=str;
			}
		
		}
		if(vin=="") System.out.println("No aggregate functions");
	}
	
}
