package java_assignment;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.HashMap;
import java.util.Scanner;

import org.json.JSONArray;
import org.json.JSONObject;

public class step5 {
	
	
	 public static String csvFile = "C:\\Users\\c588135\\Desktop\\test\\javatest\\ipldata.csv";
	 public static String line = "";
	 public static String cvsSplitBy = ",";
	 public static JSONObject internal = null;
	 public static JSONObject internal2 = null;
	 public static JSONArray arr = new JSONArray();
	 public static JSONArray arr2 = new JSONArray();
	 public static HashMap<String, JSONObject> map = new HashMap<String, JSONObject>();
	 public static HashMap<String, JSONObject> map2 = new HashMap<String, JSONObject>();
	 public static String[] queryvalues,queryvalues2;
     
	public static void main(String[] args) throws IOException {

		Scanner sc=new Scanner(System.in);
		System.out.println("Please enter your query here");
		String myquery= sc.nextLine().toLowerCase();
		System.out.println("Your Query is "+myquery);		
		String[] query=myquery.trim().split("from");
		if(query[0].toLowerCase().contains("select")) {
			six(myquery);
		}
		else{
			System.out.println("Invalid Query for this function");
		}

		
 }

public static void json(){
	
    try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
    	int count=-1;
        while ((line = br.readLine()) != null) {
        	
        	  count++;           
	          JSONObject json=new JSONObject();
	          String[] country = line.split(cvsSplitBy);
	          for(int i=0;i<queryvalues.length;i++){ 	 
	        	  if(queryvalues[i].toLowerCase().trim().equals("id")) json.put("id",country[0]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("season")) json.put("season",country[1]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("city")) json.put("city",country[2]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("date")) json.put("date",country[3]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("team1")) json.put("team1",country[4]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("team2")) json.put("team2",country[5]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("toss_winner")) json.put("toss_winner",country[6]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("toss_decision")) json.put("toss_decision",country[7]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("result")) json.put("result",country[8]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("dl_applied")) json.put("dl_applied",country[9]);      	  	 	 	 	 	 	 	 
	        	  if(queryvalues[i].toLowerCase().trim().equals("winner")) json.put("winner",country[10]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("win_by_runs")) json.put("win_by_runs",country[11]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("win_by_wickets")) json.put("win_by_wickets",country[12]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("player_of_match")) json.put("player_of_match",country[13]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("venue")) json.put("venue",country[14]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("umpire1")) json.put("umpire1",country[15]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("umpire2")) json.put("umpire2",country[16]);
	        	  if(queryvalues[i].toLowerCase().trim().equals("umpire3")) json.put("umpire3",country[17]);
	        	  
	        	  
	          }
	          
	          
	          internal = new JSONObject();
	          internal.put("data"+(count), json);
	          
	          map.put("json" + count, internal);
	          arr.put(map.get("json" + count));
	        
	            }

    } 
    catch (IOException e) {
        e.printStackTrace();
    }        
    
    int len = arr.length();
    JSONArray list = new JSONArray();
    if (arr != null) { 
       for (int i=0;i<len;i++)
       { 
           //Excluding the item at position
            if (i != 0) 
            {
                list.put(arr.get(i));
            }
       } 
    }

    System.out.println("The json string is " + list.toString());
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
		
		String[] output1=output.split(",");
		queryvalues=output1;
		json();
	
	}
}
