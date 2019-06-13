## Prerequisities

- Node.js v11.15.0
- Python 3.7.3
- pip dependencies: natsort, biosppy, pandas, numpy

## Instruction

1. Include the directory with data (`2019-afcai-spring`). Only `2019-afcai-spring/bitalino` and `2019-afcai-spring/procedura` directories will be used.

2. Run files from 1 to 7 in order using Node and Python.

```bash
export PERSON_ID=5900
node 1-process.js $PERSON_ID > output/$PERSON_ID.csv
node 2-cut.js $PERSON_ID
node 3-transform-gsr.js $PERSON_ID
node 4-normalize-gsr.js $PERSON_ID
python3 5-final-shape-csv.py > output/final-shape.csv
node 6-ekg.js $PERSON_ID
python3 7-final.py output/final/final-shape.csv output/final/final.csv
```

3. Profit.

