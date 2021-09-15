import re
import sys
f = open('svgOut.svg','w')
with open(sys.argv[1]) as svgIn:
  for line in svgIn:
    res = re.findall(r'd="M\s+([0-9]+)\s+([0-9]+)\s+L\s+([0-9]+)\s+([0-9]+)"', line)
    if res:
      # print (res[0][0])
      f.write('<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="black" stroke-linecap="round" />\n'.format(res[0][0], res[0][1], int(res[0][2]), int(res[0][3])))
    else:
      f.write(line)
f.close()