console.log ("********* P2P PDM App Log ***********");

// Load the modules to create our 'server'.
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var async = require("async");

//Configuration Options
var gitPath = "D:\\Git\\bin\\git";
var gitRepo = "D:\\peerTopeer\\GITRepo";
var gitChillAppDir = "D:\\peerTopeer\\App";
var gitUserName = "Chris Lewis";
var gitUserEmail = "chrislewis@proetoolbox.co.uk";
var WSpath = "D:\\peerTopeer\\Workspace";
			
//We read a text setup file that contains only one line (maybe change to JSON later)
fs.exists(WSpath+'\\p2ppdm.pro', function(exists) {
	if (exists) 
	{
		//Read p2ppdm.pro
		var Repo = fs.readFileSync(WSpath+'\\p2ppdm.pro', "utf8");

		var firstspace = Repo.indexOf(" ")+1;
		gitRepo = Repo.substring(firstspace)+"\\Private";
	}
});

//Report out the various application variables for de-bugging purposes only
console.log ("----------------");
console.log ("Global Variables");
console.log ("----------------");
console.log ("Git Path: "+gitPath);
console.log ("Git Repo: "+gitRepo);
console.log ("Git Chill App Dir: "+gitChillAppDir);
console.log ("Git User Name: "+gitUserName);
console.log ("Git User Email: "+gitUserEmail);
console.log ("Workspace Path: "+WSpath);
console.log ("                ");


console.log ("----------------");
console.log ("Server Session  ");
console.log ("----------------");

// Configure our HTTP server to respond with and to local requests.
var server = http.createServer(function (request, response) {
	
	var ClientIP = request.connection.remoteAddress+"";
	console.log ("                ");
	console.log ("Request IP: "+ClientIP);  
	console.log ("Request URL: "+request.url);  
	console.log ("Request Method: "+request.method);  
	
	//We're only going to deal with requests from the local machine right now
	if ( ClientIP.indexOf("127.0.0.1")>-1)
	{
		//INITIALIZATION STUFF
		if (request.url=="/p2ppdm/Initialize" && request.method === "GET" )
		{	
		    console.log ("Request Goal: Initialize a Repo Step 1");	
          
			response.writeHead(200, {"Content-Type": "text/html"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/git_init.html');
			fileStream.pipe(response);
            
			console.log ("Request Result: Piped "+gitChillAppDir+"/git_init.html to Browser.");  
			console.log ("                ");
		}
		
		if (request.url=="/p2ppdm/Initialize" && request.method === "POST" )
		{
			console.log ("Request Goal: Initialize a Repo Step 2");
          
			var HTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
			HTMLtemplate = HTMLtemplate.replace("##REPLACEME1##","Initialize Result");
			
			var Results = '<TABLE cellpadding=10px><TR><TH>Checks</TH><TH>Result</TH></TR></TR>';
			Results+='<TR><TD>IP</TD><TD>'+ClientIP+'</TD></TR>';
			
			
			response.writeHead(200, {"Content-Type": "text/html"});
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data.toString();
				if(requestBody.length > 1e7) {
				  response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
				  response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
				}
			});
			
			request.on('end', function() {
				var decodedBody = qs.parse(requestBody);
				var UName = decodedBody.UserName;
				var EMail = decodedBody.EmailAddress;
				var NewLocn = decodedBody.RepoLocn;
				var MakePublicRepo = decodedBody.PublicRepoCB;
				
				
				
				console.log("UserName: "+decodedBody.UserName);
				console.log("EmailAddress: "+decodedBody.EmailAddress);
				console.log("Location: "+decodedBody.RepoLocn);
				console.log ("Make Public Repo: "+decodedBody.PublicRepoCB);
				
				if (NewLocn != "Default")
				{
					gitRepo = NewLocn;
				}
				
				if (UName.length>5)
				{
					gitUserName = UName;
				}
				
				if (EMail.length>5)
				{
					gitUserEmail = EMail;
				}
				
				if (MakePublicRepo=="True")
				{
					gitMakePublicRepo = "True";
				}
				else
				{
					gitMakePublicRepo = "False";
				}
				
				console.log("UserName: "+decodedBody.UserName);
				console.log("EmailAddress: "+decodedBody.EmailAddress);
				console.log("Location: "+decodedBody.RepoLocn);
				console.log ("Make Public Repo: "+decodedBody.PublicRepoCB);
				
				Results+='<TR><TD>User</TD><TD>'+gitUserName+'</TD></TR>';
				Results+='<TR><TD>EMail</TD><TD>'+gitUserEmail+'</TD></TR>';
				Results+='<TR><TD>Public</TD><TD>'+gitMakePublicRepo+'</TD></TR>';
				Results+='<TR><TD>Private</TD><TD>'+gitRepo+'</TD></TR>';
				
				fs.exists(gitRepo+'\\.git\\info\\.gitattributes', function(exists) {
					if (exists) 
					{
						//do nothing other than tell the user
						Results+='<TR><TD>Initalization</TD><TD>Repo Already Exists, nothing done</TD></TR>';
						Results+='</TABLE>';
						HTMLtemplate = HTMLtemplate.replace("##REPLACEME2##",Results);
						response.end(HTMLtemplate);
				
						console.log ("Request Result: Sent "+gitChillAppDir+"/git_result.html to Browser.");  
						console.log ("                ");
					} 
					else 
					{
						// make a repo
						var exec = require('child_process').exec,
							child;
						
						//Setup one above path for gitRepo
						var oneAbovegitRepo = gitRepo.replace("\\Private","");
						
						var command = 'build_repo_params.bat "'+gitPath+'" "'+oneAbovegitRepo+'" "'+gitUserName+'" "'+gitUserEmail+'" "'+gitRepo+'\\.git\\info\\.gitattributes'+'" '+gitMakePublicRepo;
						
						console.log ("Request Generation Command: "+command); 
				  
						child = exec(command,
								{ encoding: 'utf8',cwd: gitChillAppDir},
							function (error, stdout, stderr) {
							    console.log('Request stdout: ' + stdout);
								
							    console.log('Request stderr: ' + stderr);
							    if (error !== null) {
								console.log('Request exec error: ' + error);
							    }
							    else
							    {
								    response.write(stdout);
							    }
						});
						
						var cmdstuff = '';
						child.stdout.on('data', function(chunk){
							cmdstuff+=chunk;
						});
						
						child.stdout.on('end', function(){
							if (cmdstuff.indexOf('Initialized empty Git repository')>-1)
							{
								Results+='<TR><TD>Initalization</TD><TD>Successfull</TD></TR>';
							}
							else
							{
								Results+='<TR><TD>Initalization</TD><TD>Failed</TD></TR>';
							}
							Results+='</TABLE>';
							HTMLtemplate = HTMLtemplate.replace("##REPLACEME2##",Results);
							response.end(HTMLtemplate);
					
							console.log ("Request Result: Sent "+gitChillAppDir+"/git_result.html to Browser.");  
							console.log ("                ");
						});
					}
				});
			});
		}
		
		//ADDING FILES TO A REPOSITORY STUFF
		if (request.url=="/p2ppdm/AddFiles" && request.method === "GET" )
		{
			console.log ("Request Goal: Add Files to Repo Step 1");
          
			response.writeHead(200, {"Content-Type": "text/html"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/git_add.html');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/listofFiles.js" && request.method === "GET" )
		{
			console.log ("Request Goal: Add Files to Repo (Helper)");
          
			response.writeHead(200, {'Content-Type': 'application/javascript',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
          
			fs.readdir(WSpath, function(err, files){	
				var now = new Date();
				response.end('var todaysdate="'+now.toJSON()+'";var wsfiles = '+JSON.stringify(GetStats(files)));
              
				console.log ("Request Result: Sent p2ppdm/listofFiles.js to Browser.");  
				console.log ("                ");
			});
		}
		
		if (request.url=="/p2ppdm/stage" && request.method === "POST" )
		{
			console.log ("Request Goal: Add Files to Repo Step 2");
          
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data.toString();
				if(requestBody.length > 1e7) {
				  response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
				  response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
				}
			});
			
				request.on('end', function() {
					var decodedBody = qs.parse(requestBody);
					var commitHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_commit.html', "utf8");
					response.writeHead(200, {'Content-Type': 'text/html'});
				
					var items = decodedBody.ProcessCB;
					
					var tmp = [];
					for (var i=0;i<items.length;i++)
					{
						var file = items[i];
						if (file!="on")
						{
							tmp[tmp.length] = file;
							console.log(file);
						}
					}
					items = tmp;
					
					var results = [];
					
					//What i want to happen
					//1) Copy the file from WS to Repo 123.prt.2 => 123.prt
					//2) Remove from WS any previous versions 123.prt.1 and 123.prt
					//3) Rename 123.prt.2 to 123.prt
				
					items.forEach(function(item) {
						var bits = item.split(".");
						var from = WSpath+"\\"+item;
						var to = gitRepo;
						console.log("from "+ from);
						console.log("to "+ to);
						
						copyFileToRepo(from,to, function(err, file){
							results.push(file);
							
							if(results.length == items.length) {
								var resultsStr = results.join("#");
								var resultsArray = 'var wsfiles = '+JSON.stringify(results);
								console.log('results ' +results.join(','));		
								console.log('resultsArray ' +resultsArray);									
								response.end(commitHTMLtemplate.replace("##REPLACEME##",resultsArray));
								console.log ("Request Result: Confirmed copy of files to Browser.");  
							}
							
							unLinkOld(from, function(){
								renameLatest(from,function(){
						
									
									
									
								});
							});
						});//
					});
					
					console.log ("                ");
				});
		}
		
		if (request.url=="/p2ppdm/AutoCommit" && request.method === "GET" )
		{
			console.log ("Request Goal: Commit Files to Repo");
          
			var commitHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
			commitHTMLtemplate = commitHTMLtemplate.replace("##REPLACEME1##","Commit Result");
			console.log ("Request Commit Message: Auto-Commit");
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			var commit_msg = 'Commit Message: Auto-Commit';
			//Do Commit
			var exec = require('child_process').exec,
			    child;
			var command = 'git_commit_params.bat "'+gitPath+'" "'+gitRepo+'" "Auto-Commit"';
			console.log (command)
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
			    }
			});
			
			var cmdstuff = '';
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
			
			child.stdout.on('end', function(){
				response.end(commitHTMLtemplate.replace("##REPLACEME2##",commit_msg ));
				console.log ("Request Result: Sent /git_result.html to Browser.");  
				console.log (" ");  
			});
		}
		
		if (request.url=="/p2ppdm/commit" && request.method === "POST" )
		{
			console.log ("Request Goal: Commit Files to Repo");
          
			var requestBody = '';
			console.log('here');
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var CommitMsg = formData.CommitTB;
				var commitHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				commitHTMLtemplate = commitHTMLtemplate.replace("##REPLACEME1##","Commit Result");
				console.log ("Request Commit Message: "+CommitMsg);
				
				response.writeHead(200, {'Content-Type': 'text/html'});
				var commit_msg = 'Commit Message: '+CommitMsg;
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				var command = 'git_commit_params.bat "'+gitPath+'" "'+gitRepo+'" "'+CommitMsg+'"';
				console.log (command)
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
				    }
				});
				
				var cmdstuff = '';
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				child.stdout.on('end', function(){
					response.end(commitHTMLtemplate.replace("##REPLACEME2##",commit_msg ));
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" ");  
				});
			});
			
		}
		
		//BRANCHING STUFF
		if (request.url=="/p2ppdm/NewBranch" && request.method === "GET")
		{
			//process a get request indicating user would like to make a new branch
			console.log ("Request Goal: Make a New Branch Step 1");
			
			response.writeHead(200, {"Content-Type": "text/html"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/git_branch.html');
			fileStream.pipe(response);
          
			console.log ("Request Result: Piped /git_branch.html to Browser.");  
			console.log (" "); 
		}
		
		if (request.url=="/p2ppdm/NewBranch" && request.method === "POST")
		{
			//process a post request indicating what the new branch would be called
			console.log ("Request Goal: Make a New Branch Step 2");
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var BranchName = formData.BranchName;
				console.log('User Input: Branch Name = '+BranchName);
				var branchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				branchHTMLtemplate = branchHTMLtemplate.replace("##REPLACEME1##","New Branch Result");
				
				response.writeHead(200, {'Content-Type': 'text/html'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 branch %3
					%1 checkout %3 --force
				*/
				var command = 'git_branch_params.bat "'+gitPath+'" "'+gitRepo+'" "'+BranchName+'"';
				console.log ('GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stderr.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stderr.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                    
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
				});
			});
		}
		
		if (request.url=="/p2ppdm/SwitchBranch" && request.method === "GET")
		{
			//process a post request indicating user would like to switch branch
			console.log ("Request Goal: Switch to another Branch Step 1");
			
			var switchbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_switchbranch.html', "utf8");
				
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%2 branch
			*/
			var command = 'git_list_branches.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}	
					else if (stuff[i].indexOf('*')>-1)
					{
						currentbranch = stuff[i].substring(2);
					}
					
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(switchbranchHTMLtemplate.replace("##REPLACEME##",
					"var now = "+now+";var branches = "+cmdstuff+";var currentbranch = \""+currentbranch+"\";" ));
              
				console.log ("Request Result: Sent /git_switchbranch.html to Browser.");  
				console.log (" "); 
			});
			
		}
		
		if (request.url=="/p2ppdm/SwitchBranch" && request.method === "POST")
		{
			//Process the request to actually switch branch
			console.log ("Request Goal: Switch to another Branch Step 2");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var BranchName = formData.ProcessCB;
				var switchbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				switchbranchHTMLtemplate = switchbranchHTMLtemplate.replace("##REPLACEME1##","Switch Branch Result");
			
				console.log('Request Switch-to Branch Name: '+BranchName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 branch %3
					%1 checkout %3 --force
				*/
				var command = 'git_switch_branch.bat "'+gitPath+'" "'+gitRepo+'"'+BranchName;
				console.log ('Request GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('Request stdout: ' + stdout);
				    console.log('Request stderr: ' + stderr);
				    if (error !== null) {
				      console.log('Request exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stderr.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stderr.on('end', function(){
					if (cmderror.length>0)
					{
						switchbranchHTMLtemplate = switchbranchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE><H2>##REPLACEME2##</H2>");
					}
					else
					{
						switchbranchHTMLtemplate = switchbranchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE><H2>##REPLACEME2##</H2>" );
					}
                  
                  
					//***********NEED TO RECOPY THE FILES BACK TO WORKING DIRECTORY RIGHT HERE *********
					//to copy files from working tree to current working directory
					async.series([deleteFilesinWS, 
						copyRepoFilestoWS],
						function(err){
							// if any of the file processing produced an error, err would equal that error
							if( err ) {
								// One of the iterations produced an error.
								// All processing will now stop.
								console.log('Request Error: A file failed to process');
								response.end(switchbranchHTMLtemplate.replace("##REPLACEME2##","Some kind of glitch occurred, please investigate and fix manually"));
								console.log ("Request Result: Sent /git_result.html to Browser.");  
								console.log (" "); 
							} 
							else {
								console.log('Request Result: All files have been processed successfully');
								response.end(switchbranchHTMLtemplate.replace("##REPLACEME2##","Updated Workspace to Match Repo Tree"));
								console.log ("Request Result: Sent /git_result.html to Browser.");  
								console.log (" "); 
							}
						});
					
				});
			});
		}
		
		if (request.url=="/p2ppdm/MergeContent" && request.method === "GET")
		{
			//Process the request to start a merge from another branch
			console.log ("Request Goal: Merge Content from another Branch Step 1");
          
			var comparebranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_comparebranch.html', "utf8");
				
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%2 branch
			*/
			var command = 'git_list_branches.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('Request GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('Request stdout: ' + stdout);
			    console.log('Request stderr: ' + stderr);
			    if (error !== null) {
			      console.log('Request exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i].replace(/\s/g, "");
					}	
					else if (stuff[i].indexOf('*')>-1)
					{
						stuff[i]=stuff[i].replace(/\s/g, "")
						currentbranch = stuff[i].substring(1);
					}
					
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(comparebranchHTMLtemplate.replace("##REPLACEME##",
					"var now = "+now+";var branches = "+cmdstuff+";var currentbranch = \""+currentbranch+"\";" ));
              
				console.log ("Request Result: Sent /git_comparebranch.html to Browser.");  
				console.log (" "); 
			});
		}
		
		if (request.url=="/p2ppdm/MergeContent" && request.method === "POST")
		{
			//Process the request to start a merge from another branch
			console.log ("Request Goal: Merge Content from another Branch Step 2");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var CurBranch = formData.CurrentBranch;
				var BranchName = formData.ProcessCB;
				var comparebranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_MergeContent.html', "utf8");
			
				console.log('User Input: Branch Name = '+BranchName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				//to compare branch1 [%3] to branch2[%4]
				/*
					cd /D %2
					%1 diff --name-status %3..%4
				*/
				var command = 'git_compare_branches.bat "'+gitPath+'" "'+gitRepo+'" '+CurBranch+" "+BranchName+ " > result.txt";
				console.log ('GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					var compareresults = fs.readFileSync(gitChillAppDir+'/result.txt', "utf8");
			
					var cmdlines = [];
					console.log(compareresults);
					if (compareresults.length>0)
					{
						cmdstuff = compareresults.replace(/\t/g, ' ' );
						cmdlines = cmdstuff.split("\n");
					}
					var tmp = [];
					for (var i=0;i<cmdlines.length;i++)
					{
						if (cmdlines[i].length>0)
						{
							tmp[tmp.length]=cmdlines[i];
						}
					}
					
					
					response.end(comparebranchHTMLtemplate.replace("##REPLACEME##",
						"var compareresults="+JSON.stringify(tmp) +";var branchName = \""+BranchName+"\";"));
                  
					console.log ("Request Result: Sent /git_mergecontent.html to Browser.");  
					console.log (" "); 
					
				});
			});
		}
		
		if (request.url=="/p2ppdm/cherrypick" && request.method === "POST")
		{
			//merging changes from other branches
			console.log ("Request Goal: Merge Content from another Branch Step 3");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				console.log('Request Goal Body: '+requestBody);
              
				var formData = qs.parse(requestBody);
				var BranchName = formData.BranchName;
				var items = [];
				for (var i=0;i<formData.ProcessCB.length;i++)
				{
					var curProcessCBVal = formData.ProcessCB[i];
					if (curProcessCBVal!="ignore")
					{
						var item = new Object();
						item.FileName = curProcessCBVal;
						item.BranchName = BranchName;
						items[items.length] = item;
					}
				}
				
				response.writeHead(200, {'Content-Type': 'text/html',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
						'Pragma': 'no-cache',
						'Expires': '0'});

				async.eachLimit(items, 20, merge , function(err){
					// if any of the file processing produced an error, err would equal that error
					if( err ) {
						// One of the iterations produced an error.
						// All processing will now stop.
						console.log('Request Error: A file failed to process');
					} 
					else {
						console.log('Request Result: All files have been processed successfully');
						sendMergeResult();
					}
				});
				
								
				function sendMergeResult()
				{
					var mergeHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_merged.html', "utf8");
			
					response.end(mergeHTMLtemplate.replace("##REPLACEME##","var results="+JSON.stringify(items) +";" ));
                  
					console.log ("Request Result: Sent /git_merged.html to Browser.");  
					console.log (" ");
                  
					///***** WE SHOULD DO AN AUTO MERGE RIGHT HERE *******
					
					
					
				}
			});
		}
		
		if (request.url=="/p2ppdm/DeleteBranch" && request.method === "GET")
		{
			//to delete a branch
			console.log ("Request Goal: Delete a Non-Active Branch Step 1");
						
			var switchbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_deletebranch.html', "utf8");
				
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%2 branch
			*/
			var command = 'git_list_branches.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}	
					else if (stuff[i].indexOf('*')>-1)
					{
						currentbranch = stuff[i].substring(2);
					}
					
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(switchbranchHTMLtemplate.replace("##REPLACEME##",
					"var now = "+now+";var branches = "+cmdstuff+";var currentbranch = \""+currentbranch+"\";" ));
              
				console.log ("Request Result: Sent /git_deletebranch.html to Browser.");  
				console.log (" "); 
			});
		}
		
		if (request.url=="/p2ppdm/DeleteBranch" && request.method === "POST")
		{
			//Process the request to actually switch branch
			console.log ("Request Goal: Delete another Branch Step 2");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var BranchName = formData.ProcessCB;
				var deletebranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				deletebranchHTMLtemplate = deletebranchHTMLtemplate.replace("##REPLACEME1##","Delete Branch Result");
			
				console.log('Request Delete Branch Name: '+BranchName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 branch %3
					%1 checkout %3 --force
				*/
				var command = 'git_delete.bat "'+gitPath+'" "'+gitRepo+'"'+BranchName;
				console.log ('Request GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('Request stdout: ' + stdout);
				    console.log('Request stderr: ' + stderr);
				    if (error !== null) {
				      console.log('Request exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(deletebranchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(deletebranchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                  
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
		
				});
			});
		}
		
		
		
		if (request.url=="/p2ppdm/ResetWS" )
		{
			var ResetWSHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
			ResetWSHTMLtemplate = ResetWSHTMLtemplate.replace("##REPLACEME1##","Reset Workspace");
			
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
			
			//to copy files from working tree to current working directory
			async.series([deleteFilesinWS, 
				copyRepoFilestoWS],
				function(err){
					// if any of the file processing produced an error, err would equal that error
					if( err ) {
						// One of the iterations produced an error.
						// All processing will now stop.
						console.log('Request Error: A file failed to process');
						response.end(ResetWSHTMLtemplate.replace("##REPLACEME2##","Some kind of glitch occurred, please investigate and fix manually"));
						console.log ("Request Result: Sent /git_result.html to Browser.");  
						console.log (" "); 
					} 
					else {
						console.log('Request Result: All files have been processed successfully');
						response.end(ResetWSHTMLtemplate.replace("##REPLACEME2##","Updated Workspace to Match Repo Tree"));
						console.log ("Request Result: Sent /git_result.html to Browser.");  
						console.log (" "); 
					}
				});
		}
		
		if (request.url=="/p2ppdm/setlocks" && request.method === "GET" )
		{
			console.log ("Request Goal: Provide UI from which user can choose to setup locks");
          
			response.writeHead(200, {"Content-Type": "text/html"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/git_locks.html');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/setlocks" && request.method === "POST" )
		{
			console.log ("Request Goal: Set Locks as per request, persist locks data into a file");
          
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data.toString();
				if(requestBody.length > 1e7) {
				  response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
				  response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
				}
			});
			
				request.on('end', function() {
					var decodedBody = qs.parse(requestBody);
					console.log(requestBody);
					var addLocksResultHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
					response.writeHead(200, {'Content-Type': 'text/html'});
					
					try{
					var items = decodedBody.ProcessCB;
						var tmp = [];
						if ( items[0].length ==1 )
						{
							var items = [];
							items[0] = decodedBody.ProcessCB;
							
						}
						else
						{
							for (var i=0;i<items.length;i++)
							{
								var file = items[i];
								if (file!="on")
								{
									var bits = file.split(".");
									tmp[tmp.length] = bits[0]+"."+bits[1];
									console.log(file);
								}
							}
							
							items = tmp;
						}
					}
					catch(er)
					{
						
					}
					
					
					
					
					var LocksFile = WSpath+'\\locks.js';
					var LocksFileContent = 'var wslocks = '+JSON.stringify(items);
					console.log (LocksFileContent);
					
					fs.writeFile(LocksFile, LocksFileContent, function (err) {
						if (err) throw err;
						addLocksResultHTMLtemplate = addLocksResultHTMLtemplate.replace("##REPLACEME1##","Locks Written");
						if (items.length!=0)
							addLocksResultHTMLtemplate = addLocksResultHTMLtemplate.replace("##REPLACEME2##",items.join("<BR>"));
						else
							addLocksResultHTMLtemplate = addLocksResultHTMLtemplate.replace("##REPLACEME2##",'No Locks Applied');
						response.end(addLocksResultHTMLtemplate);
						console.log ("Request Result: Confirmed locks written to Browser.");  
					});
					
					console.log ("                ");
				});
		}
		
		if (request.url=="/p2ppdm/updatewstoPDM" && request.method === "GET" )
		{
			//to copy files from PDM to current ????????why do we have this
		}
		
		if (request.url=="/p2ppdm/Pull" && request.method === "GET" )
		{
			//to pull changes from others
			console.log ("Request Goal: Provide a way to pull changes from others");
          
			var pullbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_pull.html', "utf8");
				
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%1 remote
			*/
			var command = 'git_list_remotes.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}						
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(pullbranchHTMLtemplate.replace("##REPLACEME##",
					"var now = "+now+";var remotes = "+cmdstuff+";" ));
              
				console.log ("Request Result: Sent /git_pull.html to Browser.");  
				console.log (" "); 
			});
		}
		
		if (request.url=="/p2ppdm/Pull" && request.method === "POST" )
		{
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				
				var RemoteName = formData.ProcessCB[1];
				//RemoteName = RemoteName.replace(",","");
				var pullRemoteBranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_pullbranch.html', "utf8");
							
				console.log('Request Pull Remote Name: '+RemoteName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 ls-remote --heads %3
				*/
				var command = 'git_list_remote_branch.bat "'+gitPath+'" "'+gitRepo+'" '+RemoteName;
				console.log ('Request GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('Request stdout: ' + stdout);
				    console.log('Request stderr: ' + stderr);
				    if (error !== null) {
				      console.log('Request exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					var stuff = cmdstuff.split("\n");
					var tmp = [];
					var currentbranch = '';
					for (var i=0;i<stuff.length;i++)
					{
						var line = stuff[i];
						
						var bits = line.split("refs");
						
						var branchname = bits[1];
						try{
							if (branchname.length>3 )
							{
								tmp[tmp.length] = "refs"+branchname;
							}
						}catch(er){}
					}
					cmdstuff = JSON.stringify(tmp);
					var now = new Date().getTime();
					response.end(pullRemoteBranchHTMLtemplate.replace("##REPLACEME##",
						"var remotebranches = "+cmdstuff+";var remote =\""+RemoteName+"\";" ));
		      
					console.log ("Request Result: Sent /git_pullbranch.html to Browser.");  
					console.log (" "); 
		
				});
			});
		}
		
		if (request.url=="/p2ppdm/PullBranch" && request.method === "POST")
		{
			//Process the request to actually push a branch
			console.log ("Request Goal: Pull Selected Branch to Current repo");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var RemoteName = formData.ProcessCB[0];
				var BranchName = formData.ProcessCB[1];
				var pullbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				pullbranchHTMLtemplate = pullbranchHTMLtemplate.replace("##REPLACEME1##","Pull Branch Result");
			
				console.log('Request Pull Remote Name: '+RemoteName);
				console.log('Request Pull Branch Name: '+BranchName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 pull %3 %4:%4
				*/
				var command = 'git_pull_branch.bat "'+gitPath+'" "'+gitRepo+'" '+RemoteName+' '+BranchName;
				console.log ('Request GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('Request stdout: ' + stdout);
				    console.log('Request stderr: ' + stderr);
				    if (error !== null) {
				      console.log('Request exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(pullbranchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(pullbranchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                  
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
		
				});
			});
		}
		
		if (request.url=="/p2ppdm/Push" && request.method === "GET" )
		{
			//to push changes to a selected public repository
			console.log ("Request Goal: Provide a way to Push changes to users shared Public Repo");
          
			var pushbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_push.html', "utf8");
				
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%2 branch
			*/
			var command = 'git_list_branches.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}	
					else if (stuff[i].indexOf('*')>-1)
					{
						currentbranch = stuff[i].substring(2);
					}
					
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(pushbranchHTMLtemplate.replace("##REPLACEME##",
					"var now = "+now+";var branches = "+cmdstuff+";var currentbranch = \""+currentbranch+"\";" ));
              
				console.log ("Request Result: Sent /git_push.html to Browser.");  
				console.log (" "); 
			});
		}
		
		
		if (request.url=="/p2ppdm/Push" && request.method === "POST")
		{
			//Process the request to actually push a branch
			console.log ("Request Goal: Push Selected Branch to PublicShare");
				
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var BranchName = formData.ProcessCB;
				var pushbranchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				pushbranchHTMLtemplate = pushbranchHTMLtemplate.replace("##REPLACEME1##","Push Branch Result");
			
				console.log('Request Push Branch Name: '+BranchName);
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 push PublicShare %3
				*/
				var command = 'git_push_branch.bat "'+gitPath+'" "'+gitRepo+'"'+BranchName;
				console.log ('Request GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('Request stdout: ' + stdout);
				    console.log('Request stderr: ' + stderr);
				    if (error !== null) {
				      console.log('Request exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(pushbranchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(pushbranchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                  
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
		
				});
			});
		}
		
		if (request.url=="/p2ppdm/History" && request.method === "GET" )
		{
			//to allow user to view and reset history
			console.log ("Request Goal: Provide a way for users to see history");

			var gitHistoryHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_history.html', "utf8");
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec1 = require('child_process').exec,
			    child1;
			var exec2 = require('child_process').exec,
			    child2;
			/*
				@echo off
				cd /D %2
				%2 branch
			*/
			var command1 = 'git_get_current_branch.bat "'+gitPath+'" "'+gitRepo+'"';
			
			console.log ('GitChill Command1: '+command1)
			
				
			
			
					
			child1 = exec1(command1,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
					var BranchName = stdout.replace("\n","");
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec error: ' + error);
					}
					else
					{
						var command2 = 'git_list_branch_history.bat "'+gitPath+'" "'+gitRepo+'" '+BranchName;
						console.log ('GitChill Command2: '+command2)
						var cmdstuff = '';
						child2 = exec2(command2,
								{ encoding: 'utf8',cwd: gitChillAppDir},
							function (error, stdout, stderr) {
						    console.log('stdout: ' + stdout);
						    console.log('stderr: ' + stderr);
						    if (error !== null) {
						      console.log('exec error: ' + error);
							    cmderror = 'Something Bad Happened';
						    }
						});
							
							
						child2.stdout.on('data', function(chunk){
							cmdstuff+=chunk;
						});
							
							
						child2.stdout.on('end', function(){
							var stuff = cmdstuff.split("\n");
							var tmp = [];
							var currentbranch = '';
							for (var i=0;i<stuff.length;i++)
							{
								if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
								{
									tmp[tmp.length] = stuff[i];
								}	
								else if (stuff[i].indexOf('*')>-1)
								{
									currentbranch = stuff[i].substring(2);
								}
								
							}
							cmdstuff = JSON.stringify(tmp);
														
							response.end(gitHistoryHTMLtemplate.replace("##REPLACEME##",
								"var commits = "+cmdstuff+";\nvar currentbranch = \""+BranchName+"\";" ));
				      
							console.log ("Request Result: Sent /git_history.html to Browser.");  
							console.log (" "); 
						});
					}
				});

			
		}
		
		if (request.url.indexOf("/p2ppdm/ReviewCommitHistory")>-1 && request.method === "GET" )
		{
			//to allow user to view and reset history
			console.log ("Request Goal: Provide a way for users to see history for a commit");
			
			var bits = request.url.split("?")
			var CommitID = bits[1];
			console.log ('Commit ID: '+CommitID);

			var gitHistoryHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_commit_details.html', "utf8");
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec1 = require('child_process').exec,
			    child1;

			var command1 = 'git_list_commit_details.bat "'+gitPath+'" "'+gitRepo+'" '+CommitID;
			
			console.log ('GitChill Command1: '+command1)
			
			child1 = exec1(command1,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
					var lines = stdout.split('\n');
					var cmdstuff = lines.join('<BR>');
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec error: ' + error);
					}
					
														
					response.end(gitHistoryHTMLtemplate.replace("##REPLACEME##",
						'var rawcommitinfo=\"'+cmdstuff+'\";'));
		      
					console.log ("Request Result: Sent /git_commit_details.html to Browser.");  
					console.log (" "); 
				});

			
		}
		
		if (request.url.indexOf("/p2ppdm/ReviewFileHistory")>-1 && request.method === "GET" )
		{
			//to allow user to view and reset history
			console.log ("Request Goal: Provide a way for users to see history for a file");
			
			var bits = request.url.split("?")
			var File = bits[1];
			console.log ('File: '+File);

			var gitHistoryHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_file_details.html', "utf8");
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
							
			//Do List
			var exec1 = require('child_process').exec,
			    child1;

			var command1 = 'git_list_file_details.bat "'+gitPath+'" "'+gitRepo+'" '+File;
			
			console.log ('GitChill Command1: '+command1)
			
			child1 = exec1(command1,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
					var lines = stdout.split('\n');
					var cmdstuff = lines.join('<BR>');
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec error: ' + error);
					}
					
														
					response.end(gitHistoryHTMLtemplate.replace("##REPLACEME##",
						'var theFile = \"'+File+'\";var rawfileinfo=\"'+cmdstuff+'\";'));
		      
					console.log ("Request Result: Sent /git_commit_details.html to Browser.");  
					console.log (" "); 
				});

			
		}
		
		
		if (request.url=="/p2ppdm/branchfromcommit" && request.method === "POST")
		{
			//process a post request indicating what the new branch would be called
			console.log ("Request Goal: Make a New Branch From A Commit");
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var BranchName = formData.BranchName;
				var CommitID = formData.CommitID;
				console.log('User Input: Branch Name = '+BranchName);
				console.log('User Input: Commit ID = '+CommitID);
				var branchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				branchHTMLtemplate = branchHTMLtemplate.replace("##REPLACEME1##","New Branch Result");
				
				response.writeHead(200, {'Content-Type': 'text/html'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 branch %3
					%1 checkout %3 --force
				*/
				var command = 'git_branch_from_commit.bat "'+gitPath+'" "'+gitRepo+'" "'+BranchName+'" '+CommitID;
				console.log ('GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stderr.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stderr.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                    
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
				});
			});
		}
		
		if (request.url=="/p2ppdm/Delete" && request.method === "GET" )
		{
			//toprovide a way for users to delete files
			console.log ("Request Goal: Provide a way to Delete a file from the Repo");
          
			response.writeHead(200, {"Content-Type": "text/html"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/git_delete.html');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/LinkToRepo" && request.method === "GET" )
		{
			//to LinkToRepo to a selected public repository
			//UI to also allow setup of a remote.
			//UI to allow deletion of the remotes
			console.log ("Request Goal: Provide a way to setup remotes");
          
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
			
			var remotesUIHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_link_to_remotes.html', "utf8");
			
			var exec = require('child_process').exec,
			    child;
			/*
				@echo off
				cd /D %2
				%1 remote
			*/
			var command = 'git_list_remotes.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}						
				}
				cmdstuff = JSON.stringify(tmp);
				var now = new Date().getTime();
				response.end(remotesUIHTMLtemplate.replace("##REPLACEME##",
					"var remotes = "+cmdstuff+";" ));
              
				console.log ("Request Result: Sent /git_link_to_remotes.html to Browser.");  
				console.log (" "); 
			});
		}
		
		
		if (request.url=="/p2ppdm/addRemote" && request.method === "POST" )
		{
			//process a post request indicating what the new branch would be called
			console.log ("Request Goal: Link up another remote");
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var remoteName = formData.remoteName;
				var remotePath = formData.remotePath;

				console.log('User Input: Remote Name = '+remoteName);
				console.log('User Input: Remote Path = '+remotePath);
				var addremoteresultHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_result.html', "utf8");
				addremoteresultHTMLtemplate = addremoteresultHTMLtemplate.replace("##REPLACEME1##","New Branch Result");
				
				response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
				*/
				var command = 'git_add_remote.bat "'+gitPath+'" "'+gitRepo+'" "'+remotePath+'" '+remoteName;
				console.log ('GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stderr.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stderr.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(addremoteresultHTMLtemplate.replace("##REPLACEME2##","Std.Err<BR><PRE>"+cmderror+"</PRE>" +
								"<BR>Std.Out<BR><PRE>"+cmdstuff+"</PRE>"));
					}
					else
					{
						response.end(addremoteresultHTMLtemplate.replace("##REPLACEME2##","<PRE>"+cmdstuff+"</PRE>" ));
					}
                    
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
				});
			});
		}
		
		
		if (request.url=="/p2ppdm/ExportPatch" && request.method === "GET" )
		{
			//to ExportPatch representing the changes between two commits
			console.log ("Request Goal: Provide a way to export a patch of changes between two commits");
          
			response.writeHead(200, {'Content-Type': 'text/html',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});	
			
			var exportPatchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_makepatch.html', "utf8");
			
			///////NEED THIS TO figure out the current sha1 and insert it into the UI posted for the user.
			var exec = require('child_process').exec,
			    child;

			var command = 'git_list_latest_shas.bat "'+gitPath+'" "'+gitRepo+'"';
			console.log ('GitChill Command: '+command)
				
			var cmdstuff = '';
				
			child = exec(command,
					{ encoding: 'utf8',cwd: gitChillAppDir},
				function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			      console.log('exec error: ' + error);
				    cmderror = 'Something Bad Happened';
			    }
			});
				
				
			child.stdout.on('data', function(chunk){
				cmdstuff+=chunk;
			});
				
				
			child.stdout.on('end', function(){
				var stuff = cmdstuff.split("\n");
				var tmp = [];
				var currentbranch = '';
				for (var i=0;i<stuff.length;i++)
				{
					if (stuff[i].length>3 && stuff[i].indexOf('*')==-1)
					{
						tmp[tmp.length] = stuff[i];
					}						
				}
				cmdstuff = JSON.stringify(tmp);
				
				response.end(exportPatchHTMLtemplate.replace("##REPLACEME##",
					"var cursha = "+cmdstuff+";" ));
              
				console.log ("Request Result: Sent /git_makepatch.html to Browser.");  
				console.log (" "); 
			});

			/////need to also get the sha-1 of every latest branch if possible so user only has to pick the branch to diff from.
		}
		
		if (request.url=="/p2ppdm/commitDiff" && request.method === "POST" )
		{
			
          
			//to ExportPatch representing the changes between two commits
			console.log ("Request Goal: Provide a way to export a patch of changes between two commits");
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				var sha1 = formData.sha1;
				var sha2 = formData.sha2;
				console.log('SHA-1: '+sha1);
				console.log('SHA-2: '+sha2);
				
				var branchHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_list_diffs.html', "utf8");
				
				
				response.writeHead(200, {'Content-Type': 'text/html'});
				
				//Do Commit
				var exec = require('child_process').exec,
				    child;
				/*
					@echo off
					cd /D %2
					%1 branch %3
					%1 checkout %3 --force
				*/
				var command = 'git_list_diffs.bat "'+gitPath+'" "'+gitRepo+'" ' +sha1+' '+sha2;
				console.log ('GitChill Command: '+command)
				var cmdstuff = '';
				var cmderror = '';
				child = exec(command,
						{ encoding: 'utf8',cwd: gitChillAppDir},
					function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
					    cmderror = 'Something Bad Happened';
				    }
				});
				
				
				child.stdout.on('data', function(chunk){
					cmdstuff+=chunk;
				});
				
				
				child.stdout.on('end', function(){
					if (cmderror.length>0)
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME1##","var wsfiles = '';" ));
					}
					else
					{
						response.end(branchHTMLtemplate.replace("##REPLACEME1##","var wsfiles = "+JSON.stringify(cmdstuff.split("\n"))+";" ));
					}
                    
					console.log ("Request Result: Sent /git_result.html to Browser.");  
					console.log (" "); 
				});
			});
		}
		
		if (request.url=="/p2ppdm/Export" && request.method === "POST" )
		{
			
          
			//to ExportPatch representing the changes between two commits
			console.log ("Request Goal: Provide a way to execute the export of changes between two commits");
			
			var exportHTMLtemplate = fs.readFileSync(gitChillAppDir+'/git_export.html', "utf8");
			response.writeHead(200, {'Content-Type': 'text/html'});
			
			var requestBody = '';
			request.on('data', function(data) {
				requestBody += data;
			});
			
			request.on('end', function() {
				var formData = qs.parse(requestBody);
				console.log(requestBody);
				var ProcessCB = formData.ProcessCB;
				var items = new Array();
				for (var i=1;i<ProcessCB.length;i++)
				{
					//Copy file to patch area
					console.log("Copy : "+ProcessCB[i]);
					items.push(ProcessCB[i]);
					
				}
				
				var results = [];
				
				if(!fs.existsSync(WSpath+"\\PATCH"))
				{
					fs.mkdirSync(WSpath+"\\PATCH");	
				}
				
				
				//What i want to happen
				//1) Copy the file from WS to patch Folder
				//2) Remove from WS any previous versions 123.prt.1 and 123.prt
				//3) Rename 123.prt.2 to 123.prt
			
				items.forEach(function(item) {
					var bits = item.split(".");
					var from = WSpath+"\\"+item;
					var to = WSpath+"\\PATCH";
					console.log("from "+ from);
					console.log("to "+ to);
					
					copyFileToRepo(from,to, function(err, file){
						results.push(file);
						
						if(results.length == items.length) {
							var resultsStr = results.join("#");
							var resultsArray = 'var wsfiles = '+JSON.stringify(results);
							console.log('results ' +results.join(','));		
							console.log('resultsArray ' +resultsArray);									
							response.end(exportHTMLtemplate.replace("##REPLACEME##",resultsArray));
							console.log ("Request Result: Confirmed copy of files to Browser.");  
						}
					});//
				});
			});
		}
		
		if (request.url=="/p2ppdm/footer.png" && request.method === "GET" )
		{
			response.writeHead(200, {"Content-Type": "image/png"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/src/footer.png');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/help_tablebutton.gif" && request.method === "GET" )
		{
			response.writeHead(200, {"Content-Type": "image/gif"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/src/help_tablebutton.gif');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/p2p.css" && request.method === "GET" )
		{
			response.writeHead(200, {"Content-Type": "text/css"});
			var fileStream = fs.createReadStream(gitChillAppDir+'/src/p2p.css');
			fileStream.pipe(response);
		}
		
		if (request.url=="/p2ppdm/locks.js" && request.method === "GET" )
		{
			
			console.log ("Request Goal: Pass locks.js over to the page");
          
			response.writeHead(200, {'Content-Type': 'application/javascript',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'});
			
			
			var locksFile = WSpath+'\\locks.js';
					
			// CHECK locks.js exists and if it doesn't then make an empty one with var wslocks = [];
			fs.exists(locksFile, function(exists){
				if (exists)
				{
					var fileStream = fs.createReadStream(locksFile);
					fileStream.pipe(response);
              
					console.log ("Request Result: Sent WS/locks.js to Browser.");  
					console.log ("                ");
				}
				else
				{
					response.end("var wslocks = [];");
					console.log ("Request Result: Sent WS/locks.js to Browser.");  
					console.log ("                ");
				}
			});
			     
		}
		
		
	}
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("GitChill running at http://127.0.0.1:8000/");

function IsCreoFile(filename)
{
	if (filename.indexOf('.prt')>1)
		return true;
	if (filename.indexOf('.asm')>1)
		return true;
	if (filename.indexOf('.drw')>1)
		return true;
	if (filename.indexOf('.frm')>1)
		return true;
	
	return false;
}

function deleteFilesinWS(cb)
{
	fs.readdir(WSpath, function(err, files){	
		var tmp = new Array();
		for (var i=0;i<files.length;i++)
		{
			if (IsCreoFile(files[i]))
			{
				tmp[tmp.length] = files[i];
				console.log(tmp[tmp.length-1] );
			}
		}
		
		async.eachLimit(tmp, 20, unlinkFile , function(err){
			// if any of the file processing produced an error, err would equal that error
			if( err ) {
				// One of the iterations produced an error.
				// All processing will now stop.
				console.log('Request Error: A file failed to delete '+ err);
			} 
			else {
				console.log('Request Result: All files have been processed successfully');
				cb();
			}
		});
	});
}

function	copyRepoFilestoWS(cb)
{
	console.log(gitRepo);
	fs.readdir(gitRepo, function(err, filesInRepo){	
		var tmp = new Array();
		console.log(filesInRepo);
		for (var i=0;i<filesInRepo.length;i++)
		{
			if (IsCreoFile(filesInRepo[i]))
			{
				tmp[tmp.length] = filesInRepo[i];
				console.log(tmp[tmp.length-1] );
			}
		}
							
		async.eachLimit(tmp, 20, copy2ws , function(err){
			// if any of the file processing produced an error, err would equal that error
			if( err ) {
				// One of the iterations produced an error.
				// All processing will now stop.
				console.log('Request Error: A file failed to copy '+err);
				cb(err);
			} 
			else {
				console.log('Request Result: All files have been processed successfully');
				cb();
			}
		});
	});
}

						
						
function copy2ws(arg, cb) {
	var file = arg;
	var  source = gitRepo+"\\"+file;
	
	//Copy file to Working Tree
	copyFileToRepo(source, WSpath, cb)
}

function unlinkFile(arg, cb)
{
	var file = arg;
	console.log('attempt to delete '+file);
	var  target = WSpath+"\\"+file;
	fs.unlink(target , function (err) {
		if (err) cb(err);
		console.log('successfully deleted '+target);
		cb();
	});
}

function merge(item, callback)
{
	var FileName = item.FileName;
	var CurBranch = item.BranchName;
	console.log ('Entering Merge: '+FileName);
	
	var exec = require('child_process').exec, child;
	//to compare branch1 [%3] to branch2[%4]
	/*
		@echo off
		cd /D %2
		%1 checkout %3 %4
	*/
					
	var command = 'git_cherrypick_from_branch.bat "'+gitPath+'" "'+gitRepo+'" '+CurBranch+" "+FileName +' "'+ WSpath+'"';
	console.log ('GitChill Command: '+command)
	child = exec(command,
		{ encoding: 'utf8',cwd: gitChillAppDir},
		
        function (error, stdout, stderr) {
	       console.log('stdout: ' + stdout);
	       console.log('stderr: ' + stderr);
	       if (error !== null) {
	          console.log('exec error: ' + error);
		      item.Processed = 'Failure';
		      callback( 'Something Bad Happened');
	       }
	       else {
			item.Processed = 'Success';
		    callback();
	       }
	   });
}

//GitChill functions
function GetStats(files)
{
	//doing this syncronously but should do it asynchronously really
	//see http://book.mixu.net/node/ch7.html when ready
	var tmp = new Array();
	try
	{
		for (var i=0;i<files.length;i++)
		{
			console.log(WSpath+'\\'+files[i]);
			var nObj = new Object();
			var stats  = fs.statSync(WSpath+'\\'+files[i]);
			try
			{
				nObj.filename = files[i];
				nObj.modifiedtime = stats.mtime;
			}
			catch(er)
			{
				nObj.filename=files[i];
			}
			tmp[i] = nObj;
		}
	}
	catch(er)
	{
	}
	
	return tmp;
}

/*function unlinkItem(result, cb){
	console.log ("unlink item called on "+result);
	var unlinkitems = [];
	var bits = result.split(".");
	var fileroot = bits[0]+'.'+bits[1];
	var Latest = bits[2]*1;
		
	for (var idx=0;idx<Latest;idx++)
	{
		if (idx==0)
		{
			unlinkitems.push[fileroot];
			console.log ("unlink item "+fileroot+"added to array");
			try{console.log("Request Result Unlinking: "+fileroot);
			fs.unlink(WSpath+"\\"+fileroot, function(err) {
				if (err)
					console.log("Result Unlinking: "+fileroot+" Failure");
				else
					console.log("Result Unlinking: "+fileroot+" Success");
				}	
			);}catch(er){}
		}
		else
		{
			unlinkitems.push[fileroot+"."+idx];
			console.log ("unlink item "+fileroot+"."+idx+"added to array");
			try{console.log("Request Result Unlinking: "+fileroot+"."+idx);
			fs.unlink(WSpath+"\\"+fileroot+"."+idx, function(err) {
				if (err)
					console.log("Result Unlinking: "+fileroot+"."+idx+" Failure");
				else
					console.log("Result Unlinking: "+fileroot+"."+idx+" Success");
				}	
			);}catch(er){}
		}
		
	}
	cb(null);
	
}*/


//From http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
function copyFileToRepo(sourceFile, targetDir, cb) {
	console.log('**********************');
	console.log('Function copyFile Called');
	console.log('**********************');
        
	var bits = sourceFile.split("\\");
	var filename = bits[bits.length-1];
	var bits2 = filename.split(".");
	var rootfilename = bits2[0]+"."+bits2[1];
	var cbCalled = false;

	var rd = fs.createReadStream(sourceFile);
	rd.on("error", function(err) {
	    done(err);
	});

	var wr = fs.createWriteStream(targetDir+"\\"+rootfilename);
	wr.on("error", function(err) {
		done(err);
	});

	wr.on("close", function(ex) {
		done();
	});

	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			console.log('**********************');
			console.log('Function copyFile Finished');
			console.log('**********************');
			cb(err, sourceFile);
			cbCalled = true;
		}
	}
}

function unLinkOld(source, cb){
	console.log('**********************');
	console.log('Function unlinkOld Called ');
	console.log('**********************');
	
	var cbCalled = false;
	var pathBits = source.split("\\");
	var bits = pathBits[pathBits.length-1].split(".");
	pathBits.pop();
	var fullPath = pathBits.join("\\");
	var fileroot = fullPath+"\\"+bits[0]+"."+bits[1];
	console.log('full path: '+fullPath);
	var latest = bits[2];

	var unLinkItems = [];
	var unLinkedCtr = 0;
	unLinkItems.push(fileroot);
	for (var i=1;i<latest;i++)
	{
		unLinkItems.push(fileroot+"."+i);
	}

	unLinkItems.forEach(function(Item, index){
		var bits = Item.split("\\");
		var fileroot = bits[bits.length-1];
		console.log('Want to delete '+fileroot);
		fs.unlink(Item, function (err) {
			if (err)
			{
				console.log('failed to delete '+fileroot);
			}                                                             
			else
			{
				console.log('successfully deleted '+fileroot);
			}

			unLinkedCtr++;
			if (unLinkedCtr>=latest)
			{
				done();
			}
		});
	});

                   

	function done(err) {
		if (!cbCalled) {
			console.log('**********************');
			console.log('Function unlinkOld Finished');
			console.log('**********************');
			cb(err);
			cbCalled = true;
		}
	}
}

 

function renameLatest(source,cb)
{
	console.log('**********************');
	console.log('Function renameLatest Called');
	console.log('**********************');
	
	var cbCalled = false;
	
	var pathBits = source.split("\\");
	var bits = pathBits[pathBits.length-1].split(".");
	pathBits.pop();
	var fileroot = pathBits.join("\\")+"\\"+bits[0]+"."+bits[1];
	console.log(fileroot);
       

	fs.rename(source, fileroot, function (err) {
		var bits2 = fileroot.split("\\");
		if (err)
		{
			console.log('failed to rename '+bits2[bits2.length-1]);
			done(err);
		}                                                             
		else
		{
			console.log('successfully renamed '+bits2[bits2.length-1]);
			done();
		}
	});

	function done(err) {
		if (!cbCalled) {
			console.log('**********************');
			console.log('Function renameLatest Finished');
			console.log('**********************');
			cb(err);
			cbCalled = true;
		}
	}
}