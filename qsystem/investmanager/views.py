#-- coding:utf-8 --
'''Process all requests relatived to questionnaire

include TODO and publish'''

import datetime
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render,render_to_response
from django.template import loader, RequestContext

from accounts.authentication import Authentication
from accounts.models import User

from models import Questionnaire
from form import QuestForm
from results.questions.questions import Question, Questions
from results.models import Result

from investmanager.context_processors import manage_proc
import sys
import math

reload(sys)
sys.setdefaultencoding('utf8')

def show_quest_fill_page(request):
	'''let investigator create the questionnaire'''
	auth = Authentication(request)
	if not auth.is_login():
		return HttpResponseRedirect("/message/loginfirst")
	return render(request, "investmanager/add_quest.html", {})

def publish(request):
	'''pass basic infomation to next page

	when the button is pressed, the arguments will be passed.'''

	for key in request.POST:
		print request.POST.getlist(key)
	questions = Questions()
	questions.clean()
	try:
		questionTitles = request.POST.getlist('question')
		questionTypes = request.POST.getlist('type')
		# 根据post的信息构造Question，将Question加入Questions
		# 太丑了救命
		for i, qtitle in enumerate(questionTitles):
			qtype = questionTypes[i]
			qitems = []
			if qtype == "single" or qtype == "multiply":
				value = 'items' + str(i)
				qitems = request.POST.getlist(value)
			print qtitle, qtype, qitems
			question = Question('', qtype, qtitle, qitems)
			questions.addQuestion(question)
	except Exception, e:
		print e
	form = QuestForm(request.POST, questions)
	if form.is_valid():
		quest = form.save(request)
		questions.clean()
		# this place manage the content to xml conversion, use the id which database automatic generate
	return HttpResponseRedirect(str(quest.id))


def quest(request, no):
	'''let people fill the questionnaire'''

	try:
		no = int(no)
		quest = Questionnaire.objects.get(id=no)
	except:
		raise Http404()

	id = quest.id
	title = quest.title
	subject = quest.subject
	description = quest.description

	return render(request, "investmanager/show_quest.html",{"id":id, "title":title, "subject":subject, "description":description,})

def close_or_open(request):
	if request.method == "POST":
		if request.POST.has_key("reopen"):
			re = int(request.POST["reopen"])
			quest = Questionnaire.objects.filter(id = re)[0]
			quest.closed = False
			quest.save()

		elif request.POST.has_key("close"):
			re = int(request.POST["close"])
			quest = Questionnaire.objects.filter(id = re)[0]
			quest.closed = True
			quest.save()

def created(request, page):
	'''go to the created_quest page'''
	auth = Authentication(request)
	current_user = auth.get_user()
	#current_email = user.email

	close_or_open(request)

	page = int(page)
	results = Questionnaire.objects.filter(author = current_user)
	max_page =int(math.ceil(len(results)/10.0))
	if page > max_page:
		raise Http404
	if page == max_page:
		last_result_index = len(results)
	else:
		last_result_index = 10 * (page - 1) + 10
	cre_quest = []
	cre_quest = results[10*(page-1): last_result_index]
	context = RequestContext(request, {'quest_list':cre_quest, 'current_page':page, 'max_page':max_page, }, processors = [manage_proc])
	return render(request, "investmanager/created_quest.html", context)

def published(request, page):
	'''go to the published_quest page'''

	auth = Authentication(request)
	current_user = auth.get_user()
	#current_email = user.email

	close_or_open(request)

	page = int(page)
	results = Questionnaire.objects.filter(author = current_user,released = True)
	max_page =int(math.ceil(len(results)/10.0))
	if page > max_page:
		raise Http404
	if page == max_page:
		last_result_index = len(results)
	else:
		last_result_index = 10 * (page - 1) + 10
	pub_quest = []
	pub_quest = results[10*(page-1): last_result_index]

	context = RequestContext(request, {'quest_list':pub_quest, 'current_page':page, 'max_page':max_page, }, processors = [manage_proc])
	return render(request, "investmanager/published_quest.html", context)

def draft(request, page):
	'''go to the draft_quest page'''

	auth = Authentication(request)
	current_user = auth.get_user()
	#current_email = user.email
	page = int(page)
	results = Questionnaire.objects.filter(author = current_user,released = False)
	max_page =int(math.ceil(len(results)/10.0))

	if page > max_page:
		raise Http404
	if page == max_page:
		last_result_index = len(results)
	else:
		last_result_index = 10 * (page - 1) + 10
	draft_quest = []
	draft_quest = results[10*(page-1): last_result_index]
	context = RequestContext(request, {'quest_list':draft_quest, 'current_page':page, 'max_page':max_page,}, processors = [manage_proc])
	return render(request, "investmanager/draft_quest.html", context)

def manage_all(request):
	auth = Authentication(request)
	if not auth.is_login():
		return HttpResponseRedirect("/message/loginfirst")
	user = auth.get_user()
	pub_questionnaires = Questionnaire.objects.filter(author = user)
	results = Result.objects.filter(participant_id = user.email)

	close_or_open(request)

	created_quest = []
	created_num = 1
	filled_quest = []
	filled_num = 1

	for quest in pub_questionnaires:
		created_quest.append((created_num, quest.title, quest.closed,quest.id))
		created_num += 1
		if created_num > 5:
			break
	for result in results:
		quest = Questionnaire.objects.get(id = result.questionnaire_id)
		filled_quest.append((filled_num, quest.title, quest.closed))
		filled_num += 1
		if filled_num > 5:
			break
	context = RequestContext(request, {"created_quest": created_quest, "filled_quest": filled_quest}, processors = [manage_proc])
	return render(request, "investmanager/index.html", context)

def manage_filled(request, page):
	page = int(page)
	auth = Authentication(request)
	if not auth.is_login():
		return HttpResponseRedirect("/message/loginfirst")
	user = auth.get_user()
	results = Result.objects.filter(participant_id = user.email)
	max_page =int(math.ceil(len(results)/10.0))
	if page > max_page:
		raise Http404
	if page == max_page:
		last_result_index = len(results)
	else:
		last_result_index = 10 * (page - 1) + 10
	filled_quest = []
	for index in range(10 * (page - 1), last_result_index):
		quest = Questionnaire.objects.get(id = results[index].questionnaire_id)
		filled_quest.append((quest.id, quest.title, quest.subject, quest.description, quest.closed))
	context = RequestContext(request, {"filled_quest": filled_quest, "current_page": page, "max_page": max_page}, processors = [manage_proc])
	return render(request, "investmanager/filled_quest.html", context)

def manage_cao(request, type, page):
	page = int(page)
	auth = Authentication(request)
	if not auth.is_login():
		return HttpResponseRedirect("/message/loginfirst")
	current_user = auth.get_user()
	close_or_open(request)
	if type == "filled":
		results = Result.objects.filter(participant_id = current_user.email)
	elif type == "created":
		results = Questionnaire.objects.filter(author = current_user)
	elif type == "published":
		results = Questionnaire.objects.filter(author = current_user, released = True)
	elif type == "draft":
		results = Questionnaire.objects.filter(author = current_user, released = False)
	else:
		raise Http404
	max_page =int(math.ceil(len(results)/10.0))
	if page > max_page:
		raise Http404
	if page == max_page:
		last_result_index = len(results)
	else:
		last_result_index = 10 * (page - 1) + 10
	quest_list = []
	if type == "filled":
		for index in range(10 * (page - 1), last_result_index):
			quest = Questionnaire.objects.get(id = results[index].questionnaire_id)
			quest_list.append(quest)
		context = RequestContext(request, {'quest_list':quest_list, "current_page": page, "max_page": max_page}, processors = [manage_proc])
		return render(request, "investmanager/filled_quest.html", context)
	else:
		quest_list = results[10*(page-1): last_result_index]
	context = RequestContext(request, {'quest_list':quest_list, 'current_page':page, 'max_page':max_page, 'type': type}, processors = [manage_proc])
	return render(request, "investmanager/quest_template.html", context)

