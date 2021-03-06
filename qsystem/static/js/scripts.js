﻿function checkValid(){

	var subject = $("select[name^=subject]")[0];
	console.log(subject.selectedIndex);
	if (subject.selectedIndex == 0) {
		subject.style.background = "Aquamarine";
		alert("Please choose a subject.");
		subject.style.background = "white";
		return false;
	}

    var questElement = document.quest.elements;
    for(var i=0; i<questElement.length-1;i++){
		if (questElement[i].name=="anonymous_limit")
			continue;
		if(trim(questElement[i].value)==""){
			questElement[i].focus();
			questElement[i].style.background = "SpringGreen";
			alert("Please fill the form completely.");
			questElement[i].style.background = "white";
			return false;
			break;
		}
    }
	
	
	
    var questionNum = $("div.question").length;
    if (questionNum == 0) {
	alert("Please add some questions.");
	return false;
    }
    for (var i=0; i<questionNum; ++i) {
		//var question = $(".question")[i];
		//var itemNum = question.$(".item").length;
		if (($("div.question")[i].id == 'judge') || ($("div.question")[i].id == 'essay')) {
			var items = $("div.question:eq("+i+")").find("div.item");
			var itemNum = items.length;
			if (itemNum > 0) {
				$("div.question:eq("+i+")").find("textarea").css("background", "PapayaWhip");
				alert("Too more choices.");
				$("div.question:eq("+i+")").find("textarea").css("background", "white");
				return false;
			}
		} else {
			var items = $("div.question:eq("+i+")").find("div.item");
			var itemNum = items.length;
			if (itemNum < 2) {
				$("div.question:eq("+i+")").find("textarea").css("background", "PapayaWhip");
				alert("Too less choices.");
				$("div.question:eq("+i+")").find("textarea").css("background", "white");
				return false;
			}
		}
    }
    return true;
}

function trim(str){
    return str.replace(/^\s\s*/,'').replace(/\s\s*$/,'');
}


function addQuestion() {
/*
	在id为upload的Form里，在添加问题的按钮的上方追加一个question div。
	
*/
    var parent = document.getElementById("upload");
    // 如何维护一个全局的no?
    var no = document.getElementsByClassName("question").length;
    
    var question = document.createElement("div");
    question.setAttribute("class", "question form-group");
    
    var select = document.getElementById('select');
    var index = select.selectedIndex;
    var selected = select.options[index];
    var para = document.createElement("p");
    para.textContent = (no + 1) + '.' + selected.text;
	
	var type = document.createElement("input");
	type.setAttribute("type", "hidden");
	type.setAttribute("name", "type");
	type.setAttribute("value", selected.value);
	
    question.id = selected.value;
    question.setAttribute("no", no);
	var describe = document.createElement("textarea");
	describe.setAttribute("class", "form-control");
    describe.setAttribute("name", "question");
	
	var container = document.createElement("div");
	//container.setAttribute("class", "col-sm-offset-4");
	
    var delQue = document.createElement("input");
    delQue.setAttribute("type", "button");
    delQue.setAttribute("class", "delItem btn btn-danger btn-xs");
    delQue.setAttribute("onclick", "deleteQuestion(this)");
    delQue.setAttribute("value", "Delete");

    var inc = document.createElement("a");
    inc.setAttribute("class", "addItem btn btn-link btn-xs");
    inc.setAttribute("onclick", "addItem(this)");
	inc.textContent = "Add an item";

    var del = document.createElement("a");

    del.setAttribute("class", "delItem btn btn-link btn-xs");
    del.setAttribute("onclick", "deleteItem(this)");
	del.textContent = "Delete items";

	question.appendChild(type);
    question.appendChild(para);
    question.appendChild(describe);
    question.appendChild(delQue);
	if (question.id == "single" || question.id == "multiply") {
		question.appendChild(inc);
		question.appendChild(del);
	}
    //appendNewLine(question);
    
    var submit = document.getElementById("addQuestion");
    
    parent.insertBefore(question, submit);

    if (question.id == "single" || question.id == "multiply") {
		addItem(inc);
		addItem(inc);
	}
}

function deleteQuestion(obj) {
/*
	寻找当前节点的父节点，然后删除该父节点。
	删除之后更新各个question div的编号。
*/
    var parent = document.getElementById("upload");
    parent.removeChild(obj.parentNode);
    var questions = document.getElementsByClassName("question");
    for (var i=0; i<questions.length; ++i) {
		var question = questions[i];
		var type = "";
		switch (question.id) {
		case "single":
			type = "Single Choice";
			break;
		case "multiply":
			type = "Multiply Choice";
			break;
		case "judge":
			type = "Judge";
			break;
		case "essay":
			type = "Essay";
			break;
		}
		var para = question.getElementsByTagName("p")[0];
		para.textContent = (i + 1) + '.' + type;
		question.setAttribute("no", i);

    }
}

function addItem(obj) {
/*
	寻找当前节点的父节点，然后在该父节点之后加上一个具有"class=item"属性的div。
	该div含有：
		1个checkbox，用以标识是否被选中（选中的行可被删除）
		1个label，用以标识选项号
		1个input text，用以填写选项内容
*/
    var parent = obj.parentNode;
    var no = parent.getElementsByClassName("item").length;
    var type = parent.id;
    
    var item = document.createElement("div");
    var choose = document.createElement("input");
    var label = document.createElement("label");
    var text = document.createElement("input");
    item.setAttribute("class", "item checkbox");
    choose.setAttribute("type", "checkbox");
    choose.setAttribute("class", "checkbox checkbox-inline");
    label.textContent = "No." + (no + 1);
    text.setAttribute("type", "text");
    text.setAttribute("class", "form-control");
    var index = document.getElementsByClassName("question").length - 1;
    text.setAttribute("name", "items" + parent.getAttribute("no"));
    item.appendChild(choose);
    item.appendChild(label);
    item.appendChild(text);
    parent.appendChild(item);
}

function deleteItem(obj) {
/*
	寻找当前节点的父节点，对该父节点下的所有具有"class=item"属性的div节点进行判断：
	如果该节点的子节点中有checkbox且该checkbox被选中，那么删除该节点。
	删除之后更新各个item div的编号。
*/
    var parent = obj.parentNode;
    var items = parent.getElementsByClassName("item");
    //alert(""+items.length);
    for (var i=items.length-1; i>=0; --i) {
	var checkBoxs = items[i].getElementsByClassName("checkbox");
	if (checkBoxs[0].checked) {
	    items[i].remove();
	}
    }
    items = parent.getElementsByClassName("item");
    for (var i=0; i<items.length; ++i) {
		var label = items[i].getElementsByTagName("label")[0];
		label.textContent = "No." + (i + 1);
    }	
}

function appendNewLine(obj) {
/*
	在当前节点之后增加一个<br>
*/
    obj.appendChild(document.createElement("br"));
}

function select_all(thisform)
{
	var inputs = thisform.getElementsByClassName("quest_checkbox");

	if(inputs[0].checked == true)
		for(var i=1;i<inputs.length;i++)
		{
			if (inputs[i].getAttribute("type")=="checkbox")
			{
				inputs[i].checked = true;
			}

		}
	else
		for(var i=1;i<inputs.length;i++)
		{
			if (inputs[i].getAttribute("type")=="checkbox")
			{
				inputs[i].checked = false;
			}

		}
	return 0;
}

function pass_selects(thisform)
{

	var inputs = thisform.getElementsByClassName("quest_checkbox");

	var true_selects = document.getElementById("hide_check");
	
	true_selects.value = selects;
	
	alert(selects);

	return true;
}



function addQuestionJQ() {
    var questionList = $(".panel-group[id^=accordion]");
	var lastQuestionField = $(".panel-group[id^=accordion]:last");
    var insertPlace = $("#addQuestion");
    var no = questionList.length;
    var selected = $("#select").find("option:selected");
    var type = selected.attr("value");

    var data = {
    	"id": no,
	"title": (no+1) + "." + selected.text(),
    	"type": type
    };
    var template = $.templates("#questionTmpl");  
    var newQuestionField = template.render(data);
	var toggle = $(lastQuestionField).find(".panel-collapse");
	toggle.collapse();

    insertPlace.before(newQuestionField);
	
	button = $(".panel-group[id^=accordion]:last").find("a.addItem");
	if ((type=="single") || (type=="multiply")) {
		addItemJQ(button[0]);
		addItemJQ(button[0]);
	} else {
		button.remove();
	}
	
}

function deleteQuestionJQ(obj) {
    
    var parent = $(obj).parents("div.panel-group");
    parent.remove();

    var questions = $(".question");
    for (var i=0; i<questions.length; ++i) {
		var question = questions[i];
		var type = "";
		switch (question.id) {
		case "single":
			type = "Single Choice";
			break;
		case "multiply":
			type = "Multiply Choice";
			break;
		case "judge":
			type = "Judge";
			break;
		case "essay":
			type = "Essay";
			break;
		}
		//var para = question.getElementsByTagName("p")[0];
		var para = $(question).find(".col-md-3")[0];
		para.textContent = (i + 1) + '.' + type;
		question.setAttribute("no", i);
    }
}

function addItemJQ(obj) {
	var parent = $(obj).parents("div.panel-group");
	var question = parent.find(".question");
	var no = question.attr("no");
	var num = parent.find(".item").length + 1;

	var data = {
		"no": no,
		"num": num
	}
	
	var template = $.templates("#itemTmpl");  
	var newItemField = template.render(data);
	var insertPlace = parent.find(".panel-body");
	insertPlace.append(newItemField);
}

function deleteItemJQ(obj) {
	var question = $(obj).parents(".question");
	var item = $(obj).parent();
	item.remove();

	var items = question.find(".item");
	for (var i=0; i<items.length; ++i) {
		var label = items[i].getElementsByTagName("label")[0];
		label.textContent = "" + (i + 1);
	}
}
