from tabulate import tabulate
import plotly.graph_objects as go
import numpy as np
import csv


accounts = []
transactions = []

with open('stakeholders.csv', newline='') as csvfile1:
    reader = csv.reader(csvfile1, delimiter=',', quotechar='|')
    for row in reader:
        accounts.append(row)
with open('transactions.csv', newline='') as csvfile2:
    reader = csv.reader(csvfile2, delimiter=',', quotechar='|')
    for row in reader:
        transactions.append(row)

# Get array of Column
def column(matrix, i):
    return [row[i] for row in matrix]

# Get array of RGBA Column (commas)
def rgba_column(matrix2, j):
    return [row[j].replace('"', '')+","+row[j+1]+","+row[j+2]+","+row[j+3].replace('"', '') for row in matrix2]

# Configure arrays
names = column(accounts,1)
colors = rgba_column(accounts,2)
sources = column(transactions,1)
targets = column(transactions,3)
values = column(transactions,5)
print(names)

# Create a dictionary of totals between accounts
d = dict.fromkeys(zip(sources, targets), 0)
for s, t, v in zip(sources, targets, values): d[(s, t)] += float(v)

# Convert dict to parallel arrays
totals = []
for value in d:
    totals.append([value[0],value[1],d[(value[0],value[1])]])

# Create a list of labeled totals
labeled_totals = []
for idz,total in enumerate(totals):
    total_sender = [int(total[0]),int(total[1])]
    labeled_totals.append([names[total_sender[0]],names[total_sender[1]],float(total[2])])
print(tabulate(labeled_totals))

# Update to summarized lists
new_sources = column(totals,0)
new_targets = column(totals,1)
new_values = column(totals,2)

#Configure diagram
fig = go.Figure(data=[go.Sankey(
    arrangement = "snap",
    node = dict(
      pad = 15,
      thickness = 20,
      line = dict(color = "black", width = 0.5),
      label = names,
      color = colors
    ),
    link = dict(
      source = new_sources,
      target = new_targets,
      value = new_values
  ))])
fig.update_layout(title_text="Rural Alaska Power Bills", font_size=10)

fig.write_html('index.html')