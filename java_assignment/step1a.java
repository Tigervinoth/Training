package java_assignment;

import java.util.Scanner;

public class step1a {

	
	public static void main(String args[]){

		//User Input
		Scanner sc=new Scanner(System.in);
		System.out.println("Please enter your query here");
		String myquery= sc.nextLine().toLowerCase();
		System.out.println("Your Query is "+myquery);		
		String[] query=myquery.trim().split("from");
		if(query[0].toLowerCase().contains("select")) {
						
			String[] split=myquery.split("\\s+");
			for(String vin:split){
			System.out.println(vin);
			}
		}
	
		else System.out.println("invalid selec");

	}
		
}