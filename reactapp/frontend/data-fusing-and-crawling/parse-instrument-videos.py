import json
import csv

instrument_videos = {}
with open('./downloaded-data/Musical Instrumets - You Tube music pieces.csv', mode='r', encoding="utf-8") as file:
    instrument_videos_reader = csv.DictReader(file, delimiter=";")
    instrument_rows = list(instrument_videos_reader)

    for row in instrument_rows:
        print(row)
        try:
            instruments = row["Instruments"]
            if instruments in instrument_videos:
                print("Already here", instruments)
            else:
                instrument_videos[instruments] = {"solo": row["YouTube Link (Solo Instrument)"] if row["YouTube Link (Solo Instrument)"] != "" else None, "orchestra": row["YouTube Link (Solo Instrument with Orchestra)"] if row["YouTube Link (Solo Instrument with Orchestra)"] != "" else None, "chamber": row["YouTube Link (Chamber music)"] if row["YouTube Link (Chamber music)"] != "" else None}
        except:
            pass

instrument_videosFile = open('output/instrument_videos.json', "w")
instrument_videosFile.write(json.dumps(instrument_videos, indent=2).replace('NaN', 'null'))
instrument_videosFile.close()
