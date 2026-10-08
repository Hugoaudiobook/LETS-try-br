#!/usr/bin/env python3
import json,time,pathlib,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1];DUB=ROOT/"dubs/confidence/low/dubbed_portuguese.json";OUT=ROOT/"site/data/anime.json";API="https://graphql.anilist.co"
QUERY="""query($ids:[Int]){Page(page:1,perPage:50){media(idMal_in:$ids,type:ANIME){id idMal title{romaji english native} synonyms startDate{year} seasonYear episodes duration genres format status coverImage{large}}}}"""
def post(ids):
 body=json.dumps({"query":QUERY,"variables":{"ids":ids}}).encode();req=urllib.request.Request(API,body,headers={"Content-Type":"application/json","User-Agent":"LETS-try-br/1.0"})
 with urllib.request.urlopen(req,timeout=30) as r:return json.load(r)
def main():
 ids=json.load(open(DUB,encoding="utf8"))["dubbed"];by={}
 for i in range(0,len(ids),50):
  try:
   for x in post(ids[i:i+50])["data"]["Page"]["media"]:by[x["idMal"]]=x
  except Exception as e: print("batch failed",i,e)
  time.sleep(2.1)
 out=[]
 for mid in ids:
  x=by.get(mid)
  if not x: out.append({"malId":mid});continue
  genres=x.get("genres") or []
  out.append({"malId":mid,"anilistId":x["id"],"titleEnglish":x["title"].get("english"),"titleRomaji":x["title"].get("romaji"),"titleNative":x["title"].get("native"),"synonyms":x.get("synonyms") or [],"year":(x.get("startDate") or {}).get("year") or x.get("seasonYear"),"episodes":x.get("episodes"),"duration":x.get("duration"),"genres":genres,"primaryGenre":genres[0] if genres else None,"format":x.get("format"),"status":x.get("status"),"cover":(x.get("coverImage") or {}).get("large")})
 OUT.parent.mkdir(parents=True,exist_ok=True);json.dump({"updated":int(time.time()),"source":"MyDubList Portuguese (BR) + AniList","anime":out},open(OUT,"w",encoding="utf8"),ensure_ascii=False,separators=(",",":"));print("Wrote",len(out),"titles; matched",len(by))
if __name__=="__main__":main()
