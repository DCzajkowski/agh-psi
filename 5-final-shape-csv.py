from natsort import natsorted, ns
import re
import json
import os
import sys
from biosppy.signals import eda

files = natsorted(os.listdir('./output/cut-normalized'))

failed = 0
zero_onsets = 0

print(','.join(['user', 'answer-id', 'answer_valence', 'answer_arousal', 'peak_time', 'peak_value']))

for f in files:
  if f == '.DS_Store' or f == '.gitkeep':
    continue

  regex = re.search(r'(\d+)-answer-(\d+).json', f)

  user = regex.group(1)
  answer = regex.group(2)

  f = open('./output/cut-normalized/{}-answer-{}.json'.format(user, answer)).read()
  x = json.loads(f)

  if len(x['answerArousal']) == 0:
    continue

  try:
    y = eda.eda(signal = x['gsr'], sampling_rate = 1000, show = False)
  except Exception as e:
    failed += 1
    continue

  onsets = list(y['onsets'])

  if len(onsets) == 0:
    zero_onsets += 1
    continue

  onset = 0

  while len(onsets) > 0 and onset < 1000:
    onset = onsets.pop(0)

  peaks = list(y['peaks'])
  peak = list(filter(lambda x: x > onset, peaks))[0]

  peak_time = peak - onset
  peak_value = x['gsr'][peak]

  print(','.join([user, answer, x['answerValence'], x['answerArousal'], str(peak_time), str(peak_value)]))

# print((failed, zero_onsets))
