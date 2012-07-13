var xt="",h3OK=1,tabStr = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",NewLineStr = "<br>";
function checkErrorXML(x){
    xt="";
    h3OK=1;
    checkXML(x);
}

function checkXML(n){
    var l,i,nam=n.nodeName;
    if (nam=="h3"){
	    if (h3OK==0){return;}
	    h3OK=0;
    }
    if (nam=="#text"){
	    xt=xt + n.nodeValue + "\n";
    }
    l=n.childNodes.length;
    for (i=0;i<l;i++){
        checkXML(n.childNodes[i])
    }
}

function validXml(xmlObj){
    var chk = true;
    if (window.DOMParser){
        if (xmlObj.getElementsByTagName("parsererror").length>0){
            checkErrorXML(xmlObj.getElementsByTagName("parsererror")[0]);
            chk = false;  
        }
    }
    else{
        if(xmlHttp.parseError.errorCode!=0){
            chk = false;
            xt = "Error Code: " + xmlHttp.parseError.errorCode + "\nError Reason: " + xmlHttp.parseError.reason+"\nError Line: " + xmlHttp.parseError.line;
        }
    }
return chk;
}

function getXmlDoc(path,swDebug){
    var xmlHttp,
        parser,
        s="";
    try{xmlHttp=new XMLHttpRequest();}
    catch(e){    
	    try{xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");}
     	catch(e){      
	        try{xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");}
	        catch (e){        
		        alert("Your browser does not support AJAX!");       
		        return null;        
		    }      
        } 
	}
    try{
		xmlHttp.open("GET",path,false);
		xmlHttp.send("null");
		s=xmlHttp.responseText;
    }
	catch(e){alert("\ns=\n"+s+"\ne.description=\n"+e.description);window.open(path);}
    if(swDebug==1){window.open(path);}
    
    if (window.DOMParser){
        parser=new DOMParser();
        xmlHttp=parser.parseFromString(s,"text/xml");
    }else{
        xmlHttp=new ActiveXObject("Microsoft.XMLDOM");
        xmlHttp.async=false;
        xmlHttp.loadXML(s);
    }
    
return xmlHttp;
}

function getTabStrByLayer(layerNum){
    var tmpLayerNum = parseInt(layerNum,10), tabStrTmp = tabStr;
    if(tmpLayerNum>0){
        for(var i=0;i<tmpLayerNum;i++){tabStrTmp+=tabStr;}
    }
return tabStrTmp;
}
function getXMLNodeText(node){return node.text || node.textContent;}
function getXMLNodeTagName(node){return node.tagName;}
function getAttributes(node,layerNum){  
    var tmp = "", max = node.attributes.length;
    if(max>0){
        tmp +=NewLineStr+getTabStrByLayer(layerNum)+"attributes : {";
        for(var i=0; i<max; i++){  
            var attr = node.attributes[i];
            if(i>0){tmp +=",";}
            tmp +=NewLineStr + getTabStrByLayer(layerNum+1) + attr.name + " : '" + attr.value + "'";
        }
        tmp +=NewLineStr+getTabStrByLayer(layerNum)+"},";
    }
return tmp;  
}

function checkChildNode_TagName(n){
    var chck = false;
    if(n.tagName=="question"){chck = true;}
return chck;
}
function getValueLines_FromChildNode_Answer(chlds_nodes,max_nodes){
    var i,j,
        cnt = 0,
        tmp = "",
        mx  = parseInt(max_nodes,10);
    if(mx>0){
        tmp = NewLineStr+getTabStrByLayer(2)+ "option : {";
        for (i=0;i<mx;i++){
            var n = chlds_nodes[i];
            if (n.nodeType == 1){
                var atrr_lnght  = n.attributes.length;
                if(atrr_lnght>0){
                    tmp += NewLineStr + getTabStrByLayer(3) + n.getAttribute("id") + " : {";
                        if(atrr_lnght>1){
                            tmp += NewLineStr + getTabStrByLayer(4) + "attributes : {";
                            for(j=1; j<atrr_lnght; j++){
                                if(j>1){tmp +=",";}
                                tmp += NewLineStr + getTabStrByLayer(5) + n.attributes[j].name + " : " + n.attributes[j].value;
                            }
                            tmp += NewLineStr + getTabStrByLayer(4) + "},";
                        }
                        //if(cnt>0){tmp +=",";}
                        var n_text=n.getElementsByTagName("text");
                        tmp += NewLineStr + getTabStrByLayer(4) +"text : '"+getXMLNodeText(n_text[0])+ "'";
                    tmp += NewLineStr + getTabStrByLayer(3) + "}";
                }
                cnt+=1;
            }
        }
        tmp += NewLineStr+getTabStrByLayer(2)+ "}";
    }   

        
//function getXMLNodeText(node){return node.text || node.textContent;}
//function getXMLNodeTagName(node){return node.tagName;}   
//    switch (tg_nm){
//        case "sequence":

//            break;
//        case "task":
//            //statements
//            break;
//        case "question":
//            //statements
//            break;
//        case "answer":
//            //statements
//            break;
//        case "option":
//            //statements
//            break;
//        default:
//            //statements
//            break;
//    }
return tmp;
}

function setXml2Json(path,swDebug){
    var jsonTxt="", xmlTmp;
    try{
        xmlTmp=getXmlDoc(path,swDebug);
        if(validXml(xmlTmp)){
            var _tasks=xmlTmp.getElementsByTagName("task");
            var mx_i=_tasks.length;
            
            for(var i=0; i<mx_i; i++){
                jsonTxt +=NewLineStr+getTabStrByLayer(0)+getXMLNodeTagName(_tasks[i]) + " : {";
                jsonTxt += getAttributes(_tasks[i],1);// fill Attributes for first layer (task)
                var _tasks_children = _tasks[i].childNodes;
                var mx_j =_tasks_children.length;
                for (var j=0; j < mx_j; j++){
                    if (_tasks_children[j].nodeType == 1){
                        jsonTxt +=NewLineStr+getTabStrByLayer(1)+getXMLNodeTagName(_tasks_children[j])+" : {";
                        jsonTxt += getAttributes(_tasks_children[j],2);// fill Attributes for second layer (question,answer)
                        var _tasks_children1 = _tasks_children[j].childNodes;
                        var mx_j1 =_tasks_children1.length;
                        if(checkChildNode_TagName(_tasks_children[j])){//check if this is question
                            for (var j1=0; j1 < mx_j1; j1++){
                                if (_tasks_children1[j1].nodeType == 1){
                                    
                                    
                                        jsonTxt +=NewLineStr+getTabStrByLayer(2)+getXMLNodeTagName(_tasks_children1[j1])+" : {";
                                        jsonTxt += getAttributes(_tasks_children1[j1],3);// fill Attributes for fird layer (option)
                                            if(_tasks_children1[j1].childNodes.length==1){
                                                jsonTxt +=NewLineStr+getTabStrByLayer(4)+getXMLNodeText(_tasks_children1[j1]);
                                            }else{
                                                jsonTxt +=NewLineStr+getTabStrByLayer(4)+getXMLNodeText(_tasks_children1[j1]);
                                            }
                                        jsonTxt +=NewLineStr+getTabStrByLayer(2)+"}";
                                        
                                        
                                }
                            }
                        }else{//this is answer
                            jsonTxt += getValueLines_FromChildNode_Answer(_tasks_children1,mx_j1);
                        }
                        jsonTxt +=NewLineStr+getTabStrByLayer(1)+"}";
                    }
                }
                jsonTxt +=NewLineStr+getTabStrByLayer(0)+"}";
            }
        }else{jsonTxt = "<b class='error'>"+xt+"</b>";}
    }
    catch(e){jsonTxt = "<b class='error'>error message: \n\n"+e.message+"</b>";}
    
return "var xml={"+jsonTxt+"}";
}



