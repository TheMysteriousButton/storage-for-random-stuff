            var codeViewer=class{
                static instances=0;
                lineWrap=false;
                currentLinepos="";
                constructor(divElement){
                    codeViewer.instances++;
                    this.div=divElement;//give div element
                    this.div.classList.add("editor-div");
                    var th=this;
                    this.div.oninput=function(e){
                        th.oninput(e);
                    }
                    this.div.onpaste=function(e){
                        th.onpaste(e);
                    }
                    this.div.onscroll=function(e){
                        th.onscroll(e);
                    }
                    this.div.onkeydown=function(){
                        setTimeout(function(){
                            if(window.getSelection().anchorOffset
<5){
                                th.div.scrollLeft=0;
                            }
                        },5);
                        var s=window.getSelection();
                        th.currentLineValue=s.anchorOffset;
                        if(
                            !s.anchorNode.isSameNode(s.focusNode)
                        ){
                            th.currentLineValue=null;
                        }
                    }
                    this.div.onkeyup=function(e){
                        
                        var s=window.getSelection();
                        th.currentLineValue=s.anchorOffset;
                        if(
                            !s.anchorNode.isSameNode(s.focusNode)
                        ){
                            th.currentLineValue=null;
                        }
                    }
                    this.number=codeViewer.instances;//give this class a unique number
                    var contentel=document.createElement("div");
                    contentel.classList.add('codefont');
                    contentel.classList.add('editor-content');
                    contentel.classList.add('no-include');
                    this.contentel=contentel;
                    this.contentel.spellcheck=false;
                    this.contentel.contentEditable="plaintext-only";
                    var bd=this.div.getBoundingClientRect();
                    
                    this.contentel.style.minWidth=(bd.width-70).toString()+"px";
                    
                    this.div.contentEditable="false";
                    this.div.appendChild(contentel);

                    var gutterel=document.createElement("div");
                    gutterel.id='editor-'+this.number+'-gutter';
                    gutterel.classList.add("codefont");
                    gutterel.classList.add("editor-gutter");
                    gutterel.classList.add('no-include');
                    this.gutterel=gutterel;
                    this.div.appendChild(gutterel);
                    this.boundingRect=this.div.getBoundingClientRect();
                }
                splitIntoNodes(txt){
                    var nodelist=[];
                    txt.split("\n").forEach(function(t){
                        nodelist.push(document.createTextNode(t+"\n"));
                    });
                    return nodelist;
                }
                oninput(e){
                    //if pasting, let the paste event handler do its magic
                    
                    if(this.currentLineValue===null){}
                    else if(e.inputType==="insertFromPaste"){return;}
                    else if(e.inputType==="insertLineBreak"){
                        //take all characters after caret
                        //make new textNode
                        //add the previously saved characters to new textNode
                        //move cursor to start of new textNode
                        var sel=window.getSelection();
                        var childnodes=Array.from(this.contentel.childNodes);
                        
                        
                        var edited=childnodes.indexOf(sel.anchorNode);
                        if(this.currentLineValue===0){
                            
                        }else{
                            childnodes[edited-2].textContent+="\n";
                        
                            this.contentel.removeChild(childnodes[edited-1]);
                        
                        }
                    }
                    else if(e.inputType==="deleteContentBackward"){
                        var sel=window.getSelection();
                        var childnodes=Array.from(this.contentel.childNodes);
                        var editedind=childnodes.indexOf(sel.anchorNode);
                        var edited=childnodes[editedind];
                        var next=childnodes[editedind+1];
                        if(next!==undefined&&edited!==undefined){
                            var range=new Range();
                            range.selectNode(edited);
                            var rectA=range.getBoundingClientRect();
                            var rangeb=new Range();
                            rangeb.selectNode(next);
                            var rectB=rangeb.getBoundingClientRect()
                            if(rectA.top===rectB.top){
                                var ln=edited.textContent.length;
                                edited.textContent+=next.textContent;
                                this.contentel.removeChild(next);
                                var newrange=new Range();
                                newrange.setStart(edited,ln)
                                //remove old selection range
                                sel.empty();
                                //add new selection range
                                sel.addRange(newrange);
                            }
                        }
                    }
                    this.updateLineNumbers()
                }
                setLineWrap(e){
                    if(e){
                        var bd=this.div.getBoundingClientRect();
                        this.contentel.style.width=(bd.width-70).toString()+"px";
                        this.contentel.whiteSpace="pre-wrap";
                    }else{
                        this.contentel.whiteSpace="pre";
                    }
                }
                onpaste(e){
                    e.preventDefault();
                    //the data that was pasted
                    var editedData=e.clipboardData.getData("text");
                    //the selection object
                    var selection=window.getSelection();
                    var edited=selection.anchorNode;
                    var editedIndex=Array.from(this.contentel.childNodes).indexOf(edited);
                    var editPosition=selection.anchorOffset;
                    
                    if(editedData.includes("\n")){
                        //if pasted text has line break
                        //store everything after cursor in edited line
                        if(edited.textContent[edited.textContent.length-1]!=="\n"){
                            edited.textContent+="\n";
                        }
                        var endingOfEditedLine=edited.textContent.slice(editPosition,edited.textContent.length-1);
                        edited.textContent=edited.textContent.replace(endingOfEditedLine,"");
                        
                        //add first line to current editing position
                        var firstline=editedData.slice(0,editedData.indexOf("\n"));
                        edited.textContent=edited.textContent.insertAt(firstline,editPosition);
                        //add lines after that line for each line in pasted content
                        editedData=editedData.replace(firstline+"\n","");
                        var nds=this.writeText(
                            editedData,
                            false,
                            editedIndex+1,
                        );
                        
                        //set cursor position to the end of the last text node of pasted content
                        var lastElement=nds[nds.length-1]
                        var newrange=new Range();
                        newrange.setStart(lastElement,lastElement.textContent.length);
                        //remove old selection range
                        selection.empty();
                        //add new selection range
                        selection.addRange(newrange);
                        //add what was after edit position in the edited line at the end of the last element in the pasted content
                        lastElement.textContent=lastElement.textContent.replace("\n","");
                        lastElement.textContent+=endingOfEditedLine+"\n";
                    }else{
                        //if no newline characters
                        //insert added text into line
                        edited.textContent=edited.textContent.insertAt(editedData,editPosition);
                        //set cursor position to after added content
                        var newrange=new Range();
                        newrange.setStart(edited,editPosition+editedData.length);
                        //remove old selection range
                        selection.empty();
                        //add new selection range
                        selection.addRange(newrange);
                        
                        
                    }
                    //code highlighting here
                    //on edited line and all added lines
                }
                writeText(vals,replace,start){
                    start=start||0;
                    replace=replace||false;
                    var startlength=this.contentel.childNodes.length;
                    var THIS=this;
                    if(typeof(vals)==="string"){
                        var nds=this.splitIntoNodes(vals);
                    }else{
                        nds=vals;
                    }
                    //code highlighting here
                    nds.forEach(function(c,ind){
                        var wrind=start+ind;
                        if(wrind>=startlength){
                            THIS.contentel.appendChild(c);
                        }
                        else if(replace){
                            THIS.contentel.replaceChild(c,THIS.contentel.childNodes[wrind]);
                        }else{
                            THIS.contentel.insertBefore(c,THIS.contentel.childNodes[start]);
                        }
                    });
                    this.updateLineNumbers()
                    return nds;
                }
                onscroll(){
                    //update line numbers here
                    this.updateLineNumbers();
                    //would-be highlighting here
                }
                getBoundariesFromTextNodeAtPoint(x,y){
                    if(document.caretRangeFromPoint){
                        //webkit (chrome,edge, etc)
                        var range=document.caretRangeFromPoint(x,y);
                        if(range===null){return undefined;}
                        return{
                            "node":range.startContainer,
                            "rect":range.getBoundingClientRect(),
                        }
                    }else{
                        //firefox
                        var range=document.caretPositionFromPoint(x,y);
                        if(range===null){return undefined;}
                        return{
                            "node":range.offsetNode,
                            "rect":range.getClientRect(),
                        }
                    }
                }
                updateLineNumbers(){
                    //find cursor element
                    var childnodes=Array.from(this.contentel.childNodes);
                    if(childnodes.length===0){return;}
                    var viewRect=this.div.getBoundingClientRect();
                    var up=viewRect.top+1;
                    var down=viewRect.bottom-1;
                    var left=viewRect.left+61;
                    var upel=this.getBoundariesFromTextNodeAtPoint(left,up);
                    var dnel=this.getBoundariesFromTextNodeAtPoint(left,down);
                    if(dnel===undefined){return;}
                    
                    //top and bottom elements on the screen
                    var stind=childnodes.indexOf(upel.node);//upper node
                    var ndind=childnodes.indexOf(dnel.node);//lower node
                    if(ndind===-1){
                        ndind=childnodes.length;
                    }
                    var nodes=childnodes.slice(stind+1,
                        Math.min(ndind+1,childnodes.length)
                    );
                    var nodeBoundingRects=[];
                    nodeBoundingRects.push(upel.rect);
                    nodes.forEach(function(t){
                        var range=new Range();
                        range.selectNode(t);
                        nodeBoundingRects.push(range.getBoundingClientRect());
                    });
                    this.gutterel.innerHTML="";
                    nodeBoundingRects.push(upel.rect);
                    nodeBoundingRects.pop();
                    var t=this;
                    nodeBoundingRects.forEach(function(c,ind){
                        var num=stind+ind;//line number
                        t.addLineNumber(c.top+t.div.scrollTop,num);
                    });
                    var lowerLimit=0;
                    //add the y coordinates of the bounding boxses to an array
                    //add line numbers at those y coordinates
                    
                    
                    
                }
                addLineNumber(y,number){
                    var h=this.boundingRect.top;
                    var addst="<span class='codefont editor-line-number' style='position:absolute;top:"+(y-h).toString()+"px;'>"+number.toString().padStart(6," ")+"</span>";
                    this.gutterel.innerHTML+=addst;
                }
                getText(start,stop){
                    var retst="";
                    start=start||0;
                    stop=stop||this.contentel.childNodes.length;
                    Array.from(this.contentel.childNodes).slice(start,stop).forEach(function(t){
                        retst+=t.textContent;
                    });
                    return retst;
                }
            };
            
