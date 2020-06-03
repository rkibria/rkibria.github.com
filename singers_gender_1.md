+++
categories = []
date = "2017-06-25T22:08:17+01:00"
tags = [ "data science" ]
title = "Billboard Top 100 genders Pt. 1"

+++

Here is the first, very preliminary result from my attempt to analyze the [Billboard Hot 100 Archive dataset](http://daynebatten.com/2015/12/billboard-hot-100-archive/) which lists the 100 most popular US music tracks each week since 1958 up to 2015.
As a toy problem, I wanted to see if there's any pattern in the gender makeup of the list to maybe give an indication if male or female singing voices are more popular on average.

The first question I wanted to explore is "were male or female solo artists more popular over the years".
To determine this I obviously needed another dataset that would label artists with their gender.
I couldn't find a premade one, so I made it myself by [scraping Wikipedia categories](https://www.kaggle.com/rkibria/singersgender).
That dataset currently contains only contains solo artists, in a next step I would like to add bands with known male or female singers to the gender dataset, as well as "pure" boy- or girl-groups.

Merging the Billboard and gender datasets together then allowed me to count the totals of hits by solo male and female artists.
Every artist entry that was either not in the gender dataset at all or simply not recognized was marked as "UNKNOWN".
This was sometimes because of some spelling difference, e.g. "M.C. Hammer" with periods, instead of "MC Hammer" as present in the dataset.
I dealt with some of the oddly spelled names with some filtering (e.g. replacing "!" with "i" because "P!nk" is in the Billboard dataset but "Pink" is in the gender dataset) but likely haven't caught them all.

The total counts over all years from 1958 (noting that year's records are incomplete) to 2015 are then:

Gender        | Count         | Percent
------------- | ------------- | -------------
UNKNOWN       | 173855        | 58.1%
male          | 81849         | 27.4%
female        | 43338         | 14.5%

So about 40% of all Billboard dataset entries were identified as either male or female solo artists.
Of those identified, over all time almost twice as many Billboard hit entries were by male solo artists than by female ones.

But was this proportion the same in every year?
I repeated the analysis for each year in isolation and charted the resulting counts in this image:

![Solo artists gender over time](../../images/singers_gender_1.png)

According to this chart then male solo artists had many more popular hits initially, but female artists improved steadily and even reached a brief period ca. 1995-1998 where the proportion actually inverted.
After that the proportion seems to be going the opposite way, with male artists becoming more popular again.

It is probably too early to interpret too much into this chart since so many entries are not identified yet, so I am curious how this chart will look once I add groups into the gender dataset as well!
