from biosppy.signals import ecg
from biosppy.signals import eda
import pandas as pd
import numpy as np
import os
import sys
import csv
import matplotlib.pyplot as plt
import operator
import statistics
plt.rcParams['figure.figsize'] = [15, 5]

vccConst = 3.3
bitalinoValue = 0.132
bitSize = 2**10
sensorGain = 1100

def calculate_ratio(filepath):
  ecg_data = pd.read_csv(filepath, sep=',', error_bad_lines=False, lineterminator="\n")
  ecg_df = ecg_data['ekg'].apply(lambda line: (((int(line) / bitSize) - 0.5) * vccConst) / sensorGain) * 1000
  ecg_np_array = ecg_df.to_numpy()
  out = ecg.ecg(signal=ecg_np_array, sampling_rate=1000., show=False)
  ecg_r_peaks = ecg.hamilton_segmenter(signal=ecg_np_array)
  res = list(map(operator.sub, ecg_r_peaks[0][1:], ecg_r_peaks[0][:-1]))
  median = statistics.median(res)
  final_val = min(res)/median
  return final_val

def run(filepath, dirpath, ecg_file):
  file_list = make_file_list(ecg_file)
  print(dirfiles)
  with open(filepath, "a") as f:
    os.chdir(dirpath)
    for file in dirfiles:
      tuple = processCsv(file)
      print(tuple)
      print(file)
      f.write(str(tuple)+"\n")

def extract_filename_from_line(line):
  print(line)
  return "./output/ekg-parts/{}_{}.csv".format(line[0], line[1])

def run(main_csv_path, main_csv_output_path):
  errors = 0

  with open(main_csv_output_path, 'w') as f_out:
    with open(main_csv_path) as f:
      lis = [line[:-2].split(",") for line in f]
      for i, line_array in enumerate(lis):
        if i == 0:
          final_line = line_array + ["heartrate_ratio"]
          f_out.write(",".join(final_line)+"\n")
          continue

        try:
          filename = extract_filename_from_line(line_array)
          print(filename)
          heartrate_ratio = calculate_ratio(filename)
          final_line = line_array + [heartrate_ratio]
          print(final_line)
          f_out.write(",".join(list(map(lambda x: str(x), final_line)))+"\n")
        except Exception as e:
          errors += 1

      print(errors)

run(sys.argv[1], sys.argv[2])
