package java_assignment;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;


public class step3 {
	
	public static void main (String[] args) throws IOException{
		
		String csvFile = "C:\\Users\\c588135\\Desktop\\test\\javatest\\ipldata.csv";
		String line=null;
		String cvsSplitBy = ",";
		String[] country = null;
		try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
	    	
	        while ((line = br.readLine()) != null) {
	                  
		        
		          country = line.split(cvsSplitBy);
		         
	}
	        int a =Integer.parseInt(country[0]);
	     
	        System.out.println("id:"+country[0].getClass().getName());
	        System.out.println("season:"+country[0].getClass().getName());
	        System.out.println("city:"+country[0].getClass().getName());
	        System.out.println("date:"+country[0].getClass().getName());
	        System.out.println("team1:"+country[0].getClass().getName());
	        System.out.println("team2:"+country[0].getClass().getName());
	        System.out.println("toss_winner:"+country[0].getClass().getName());
	        System.out.println("toss_decision:"+country[0].getClass().getName());
	        System.out.println("result:"+country[0].getClass().getName());
	        System.out.println("dl_applied:"+country[0].getClass().getName());
	        System.out.println("winner:"+country[0].getClass().getName());
	        System.out.println("win_by_runs:"+country[0].getClass().getName());
	        System.out.println("win_by_wickets:"+country[0].getClass().getName());
	        System.out.println("player_of_match:"+country[0].getClass().getName());
	        System.out.println("venue:"+country[0].getClass().getName());
	        System.out.println("umpire1:"+country[0].getClass().getName());
	        System.out.println("umpire2:"+country[0].getClass().getName());
	        System.out.println("umpire3:"+country[0].getClass().getName());
		}
}
}
