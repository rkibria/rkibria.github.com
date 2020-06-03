+++
categories = []
date = "2017-06-18T11:34:12+01:00"
tags = [ "data science", "Python", "web scraping" ]
title = "Scraping Wikipedia categories"

+++

This Python 3 fragment uses the [Wikipedia API](https://en.wikipedia.org/w/api.php?action=help&modules=query%2Bcategorymembers) to retrieve all entries in a [category](https://en.wikipedia.org/wiki/Category:American_female_singers) and write them to a CSV file:

	import requests

	categoryName = 'American_female_singers'

	baseUrl = 'https://en.wikipedia.org/w/api.php?'
	baseUrl += 'action=query'
	baseUrl += '&format=json' # return in JSON format
	baseUrl += '&cmprop=ids|title|type|timestamp'
	baseUrl += '&cmlimit=100' # Number of entries to retrieve
	baseUrl += '&list=categorymembers'
	baseUrl += '&cmtitle=Category:' + categoryName

	continueCode = None
	allDone = False

	with open(categoryName + '.csv', encoding='utf-8', mode='w') as outFile:
		while not allDone:
			continueArg = ""
			if continueCode:
				continueArg = "&cmcontinue=" + continueCode

			url = baseUrl + continueArg
			print('# Get', url)
			r = requests.get(url)
			json_data = r.json()

			print('# Received', json_data)

			for entry in json_data['query']['categorymembers']:
				catName = entry['title']
				outFile.write(
					entry['title']
					+ ','
					+ str(entry['pageid'])
					+ ','
					+ entry['type']
					+ ','
					+ entry['timestamp']
					+ '\n'
					)

			continueCode = None
			if 'continue' in json_data:
				if 'cmcontinue' in json_data['continue']:
					continueCode = json_data['continue']['cmcontinue']
			if not continueCode:
				allDone = True

The CSV columns are the entry title, page ID, page type and timestamp, there is no header.
The output may contain both normal entries as well as subcategories:

	Aaliyah,2144,page,2016-01-23T17:50:29Z
	Paula Abdul,23300,page,2015-04-10T13:33:46Z
	Victoria Acosta,12779910,page,2013-03-06T05:06:25Z
	Sharon Aguilar,31164843,page,2016-05-13T18:54:20Z
	...
	Category:American female rock singers,38599888,subcat,2013-02-22T04:08:04Z
	Category:American sopranos,3625930,subcat,2016-09-13T21:54:23Z

You will need to install the requests module if you don't have it yet:

	python -m pip install -U pip setuptools
	python -m pip install requests


* Updated: Write file in UTF-8 to avoid character conversion exceptions.
