/*

07-Feb-00  I-03-26  JCN  $$1   Renamed and upgraded.
30-Jan-03  J-03-41  JCN  $$2   Install test adds menu button.

*/
import java.io.*;
import java.util.*;
import com.ptc.cipjava.*;
import com.ptc.pfc.pfcSession.*;
import com.ptc.pfc.pfcWindow.*;
import com.ptc.pfc.pfcGlobal.*;
import com.ptc.pfc.pfcCommand.*;
import com.ptc.pfc.pfcExceptions.*;
import com.ptc.pfc.pfcExport.*; 
import com.ptc.pfc.pfcModel.*;
import com.ptc.pfc.pfcArgument.*;
import com.ptc.pfc.pfcUI.*;


/**
 * This class is used to start the jlink application in proe.
 * The name of the class has to appear in the protk.dat
 * under the java_app_class option.
 **/
public class P2PPDM{

	private static String topMenu = "P2PPDM";
	public static String msgTxt = "msgs.txt";
	private static String MenuCmd1Txt =  "Initialize";
	private static String MenuCmd2Txt = "AddFiles";
	private static String MenuCmd3Txt = "NewBranch";
	private static String MenuCmd4Txt = "SwitchBranch";
	private static String MenuCmd5Txt = "DeleteBranch";
	private static String MenuCmd6Txt = "MergeContent";
	private static String MenuCmd7Txt = "AutoCommitContent";
	private static String MenuCmd8Txt = "ResetWorkspace";
	private static String MenuCmd9Txt = "UpdateInSession";
	private static String MenuCmd10Txt = "SetWSLocks";
	private static String MenuCmd11Txt = "PushChanges";
	private static String MenuCmd12Txt = "PullChanges";
	private static String MenuCmd14Txt = "ShowHistory";
	private static String MenuCmd15Txt = "DeleteFiles";
	private static String MenuCmd16Txt = "SetSharedRepo";
	private static String MenuCmd17Txt = "ExportPatch";

	private static String cmdIcon1 = "P2PPDM1.png";
	private static String cmdIcon2 = "P2PPDM2.png";
	private static String cmdIcon3 = "P2PPDM3.png";
	private static String cmdIcon4 = "P2PPDM4.png";
	private static String cmdIcon5 = "P2PPDM5.png";
	private static String cmdIcon6 = "P2PPDM6.png";
	private static String cmdIcon7 = "P2PPDM7.png";
	private static String cmdIcon8 = "P2PPDM8.png";
	private static String cmdIcon9 = "P2PPDM9.png";
	private static String cmdIcon10 = "P2PPDM10.png";
	private static String cmdIcon11 = "P2PPDM11.png";
	private static String cmdIcon12 = "P2PPDM12.png";
	private static String cmdIcon14 = "P2PPDM14.png";
	private static String cmdIcon15 = "P2PPDM15.png";
	private static String cmdIcon16 = "P2PPDM16.png";
	private static String cmdIcon17 = "P2PPDM17.png";
	
  //=========================================================================
  /**
   * This method is called by proe upon starting a jlink application
   * This method gets the current session from the pfcGlobal(environment)
   * Then it calls the install test with the session as the argument.
   **/
	public static void start () throws Exception
	{
		try
		{	 
			Session curSession = pfcGlobal.GetProESession();
			String curWorkDir = curSession.GetCurrentDirectory();
			
			//Spawn Node WebServer
			//String NodeCmd = "cmd /c \"D:\\peerTopeer\\App\\NodeStart.bat\" "+"\""+curWorkDir+"\"";
			//Runtime.getRuntime().exec(NodeCmd);
			
			
			
			ClickP2PPDMButton Listener1 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/Initialize");
			UICommand cmd1 = curSession.UICreateCommand("JL."+topMenu+"1", Listener1); 
			cmd1.SetIcon(cmdIcon1);
			cmd1.Designate (msgTxt, 
								topMenu+"1",
								MenuCmd1Txt,
								MenuCmd1Txt+"Help")  ;
			
			ClickP2PPDMButton Listener2 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/AddFiles");
			UICommand cmd2 = curSession.UICreateCommand("JL."+topMenu+"2", Listener2); 
			cmd2.SetIcon(cmdIcon2);
			cmd2.Designate (msgTxt, 
								topMenu+"2",
								MenuCmd2Txt,
								MenuCmd2Txt+"Help")  ;
			
			ClickP2PPDMButton Listener3 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/NewBranch");
			UICommand cmd3 = curSession.UICreateCommand("JL."+topMenu+"3", Listener3); 
			cmd3.SetIcon(cmdIcon3);
			cmd3.Designate (msgTxt, 
								topMenu+"3",
								MenuCmd3Txt,
								MenuCmd3Txt+"Help")  ;
								
			ClickP2PPDMButton Listener4 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/SwitchBranch");
			UICommand cmd4 = curSession.UICreateCommand("JL."+topMenu+"4", Listener4); 
			cmd4.SetIcon(cmdIcon4);
			cmd4.Designate (msgTxt, 
								topMenu+"4",
								MenuCmd4Txt,
								MenuCmd4Txt+"Help")  ;
								
			ClickP2PPDMButton Listener5 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/DeleteBranch");
			UICommand cmd5 = curSession.UICreateCommand("JL."+topMenu+"5", Listener5); 
			cmd5.SetIcon(cmdIcon5);
			cmd5.Designate (msgTxt, 
								topMenu+"5",
								MenuCmd5Txt,
								MenuCmd5Txt+"Help")  ;
								
			ClickP2PPDMButton Listener6 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/MergeContent");
			UICommand cmd6 = curSession.UICreateCommand("JL."+topMenu+"6", Listener6); 
			cmd6.SetIcon(cmdIcon6);
			cmd6.Designate (msgTxt, 
								topMenu+"6",
								MenuCmd6Txt,
								MenuCmd6Txt+"Help")  ;
								
			ClickP2PPDMButton Listener7 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/AutoCommit");
			UICommand cmd7 = curSession.UICreateCommand("JL."+topMenu+"7", Listener7); 
			cmd7.SetIcon(cmdIcon7);
			cmd7.Designate (msgTxt, 
								topMenu+"7",
								MenuCmd7Txt,
								MenuCmd7Txt+"Help")  ;
								
			ClickP2PPDMButton Listener8 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/ResetWS");
			UICommand cmd8 = curSession.UICreateCommand("JL."+topMenu+"8", Listener8); 
			cmd8.SetIcon(cmdIcon8);
			cmd8.Designate (msgTxt, 
								topMenu+"8",
								MenuCmd8Txt,
								MenuCmd8Txt+"Help")  ;
			
			
			//Update in Memory
			UpdateInMemory Listener9 = new UpdateInMemory(curSession);
			UICommand cmd9 = curSession.UICreateCommand("JL."+topMenu+"9", Listener9); 
			cmd9.SetIcon(cmdIcon9);
			cmd9.Designate (msgTxt, 
								topMenu+"9",
								MenuCmd9Txt,
								MenuCmd9Txt+"Help")  ;
								
			//Set WS locks
			ClickP2PPDMButton Listener10 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/setlocks");
			UICommand cmd10 = curSession.UICreateCommand("JL."+topMenu+"10", Listener10); 
			cmd10.SetIcon(cmdIcon10);
			cmd10.Designate (msgTxt, 
								topMenu+"10",
								MenuCmd10Txt,
								MenuCmd10Txt+"Help")  ;
								
			//Push Data to Public
			ClickP2PPDMButton Listener11 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/Push");
			UICommand cmd11 = curSession.UICreateCommand("JL."+topMenu+"11", Listener11); 
			cmd11.SetIcon(cmdIcon11);
			cmd11.Designate (msgTxt, 
								topMenu+"11",
								MenuCmd11Txt,
								MenuCmd11Txt+"Help")  ;
								
			//Pull Data from Public
			ClickP2PPDMButton Listener12 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/Pull");
			UICommand cmd12 = curSession.UICreateCommand("JL."+topMenu+"12", Listener12); 
			cmd12.SetIcon(cmdIcon12);
			cmd12.Designate (msgTxt, 
								topMenu+"12",
								MenuCmd12Txt,
								MenuCmd12Txt+"Help")  ;
								
			//Show History
			ClickP2PPDMButton Listener14 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/History");
			UICommand cmd14 = curSession.UICreateCommand("JL."+topMenu+"14", Listener14); 
			cmd14.SetIcon(cmdIcon14);
			cmd14.Designate (msgTxt, 
								topMenu+"14",
								MenuCmd14Txt,
								MenuCmd14Txt+"Help")  ;
								
			//Delete File
			ClickP2PPDMButton Listener15 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/Delete");
			UICommand cmd15 = curSession.UICreateCommand("JL."+topMenu+"15", Listener15); 
			cmd15.SetIcon(cmdIcon15);
			cmd15.Designate (msgTxt, 
								topMenu+"15",
								MenuCmd15Txt,
								MenuCmd15Txt+"Help")  ;
								
			//Setup Shared Repo
			ClickP2PPDMButton Listener16 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/LinkToRepo");
			UICommand cmd16 = curSession.UICreateCommand("JL."+topMenu+"16", Listener16); 
			cmd16.SetIcon(cmdIcon16);
			cmd16.Designate (msgTxt, 
								topMenu+"16",
								MenuCmd16Txt,
								MenuCmd16Txt+"Help")  ;
								
			//Export Patch
			ClickP2PPDMButton Listener17 = new ClickP2PPDMButton(curSession, "http://localhost:8000/p2ppdm/ExportPatch");
			UICommand cmd17 = curSession.UICreateCommand("JL."+topMenu+"17", Listener17); 
			cmd17.SetIcon(cmdIcon17);
			cmd17.Designate (msgTxt, 
								topMenu+"17",
								MenuCmd17Txt,
								MenuCmd17Txt+"Help")  ;
			
			
		}
		catch (jxthrowable x)
		{
			printMsg ("something wrong: " + x);
			x.printStackTrace ();
			System.out.println ("------------------------------------");
		}
	}
  
 

  

  //=========================================================================
  /**
   * This method is used for cleanup and etc...
   * Called when the jlink application exits
   */
  public static void stop (){
    printMsg ("Stop");
  }

  //=========================================================================
  /**
   * This method prints a string to the standard output.
   */
  public static void printMsg (String msg){
    System.out.println ("Start install test: " + msg);
  }
}




class ClickP2PPDMButton extends DefaultUICommandActionListener
{
	Session session;  
	String RequestURL;

	public ClickP2PPDMButton(Session currentSession, String RequestURL)
	{
		this.session = currentSession;
		this.RequestURL = RequestURL;
	}
	
	public void OnCommand ()
	{
		try
		{
			
			stringseq Messages = stringseq.create();
			Messages.set (0, "P2PPDM Tools Button Clicked");
			session.UIDisplayMessage ("msg_p2ppdmtools.txt", "P2PPDM Tools Info: %0s.", Messages)  ;
			session.UIClearMessage ()  ;
			
			//Figure out model type
			com.ptc.pfc.pfcWindow.Window curWin = session.GetCurrentWindow();
			curWin.SetURL (RequestURL)  ;

		}
		catch (Exception x)
		{
      			x.printStackTrace ();
      			System.out.println ("------------------------------------");
		}
	}

}

class UpdateInMemory extends DefaultUICommandActionListener
{
	Session session;  
	
	public UpdateInMemory(Session currentSession)
	{
		this.session = currentSession;
	}
	
	public void OnCommand ()
	{
		try
		{
			
			stringseq Messages = stringseq.create();
			Messages.set (0, "P2PPDM Tools Button Clicked");
			session.UIDisplayMessage ("msg_p2ppdmtools.txt", "P2PPDM Tools Info: %0s.", Messages)  ;
			session.UIClearMessage ()  ;
			
			//Close Windows
			com.ptc.pfc.pfcWindow.Windows openWins = session.ListWindows();
			int NumOpenWins = openWins.getarraysize();
			String[] InWindowsMdlsStrs;
			InWindowsMdlsStrs = new String[NumOpenWins];
			for (int i=0;i<NumOpenWins;i++)
			{
				com.ptc.pfc.pfcWindow.Window curWin = openWins.get (i) ;
				InWindowsMdlsStrs[i] = curWin.GetModel ().GetFileName();
				curWin.Close();
			}
			Models InSessionMdlsToRetreive = session.ListModels ()  ;
			int NumMdlsToRetreive = InSessionMdlsToRetreive.getarraysize();
			Messages.set (0, "InSessionMdlsToRetreive Number = "+NumMdlsToRetreive);
			session.UIDisplayMessage ("msg_p2ppdmtools.txt", "P2PPDM Tools Info: %0s.", Messages)  ;
			String[] InSessionMdlsStrs;
			InSessionMdlsStrs = new String[NumMdlsToRetreive];
			for (int i=0;i<NumMdlsToRetreive;i++)
			{
				InSessionMdlsStrs[i] = InSessionMdlsToRetreive.get(i).GetFileName();
			}
			
			session.EraseUndisplayedModels ();
			String Macro = "";
			for (int i=0;i<NumOpenWins;i++)
			{
				Macro = Macro + "~ Select `main_dlg_cur` `appl_casc`;"+
					"~ Close `main_dlg_cur` `appl_casc`;~ Command `ProCmdModelOpen` ;"+
					"~ Trail `UI Desktop` `UI Desktop` `DLG_PREVIEW_POST` `file_open`;"+
					"~ Update `file_open` `Inputname` `"+InWindowsMdlsStrs[i]+"`;"+
					"~ Activate `file_open` `Inputname`;";
			}
			
			session.RunMacro (Macro) ;
			
			
		}
		catch (Exception x)
		{
      			x.printStackTrace ();
      			System.out.println ("------------------------------------");
		}
	}

}
