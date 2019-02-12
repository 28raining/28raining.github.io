import serial
import matplotlib.pyplot as plt

#If plotting is too slow, then use Plotly extend. Otherwise, will just replot all the data

#read the serial data, update the plot every 10ms

# Create a trace
data_y=[]
#data_x=[]
counter=0

plt.ion()

with serial.Serial('COM14', 115200, timeout=1) as ser:
    while 1:
            # print(data_y)
            # plot_data = Data(Scatter(data_y) )
            # plot_url = py.plot(plot_data, filename='extend plot', fileopt='extend')
            # data_x={}
            #data_y={}
            
        
            #print(data)
            try: 
                print(ser.readline().decode('utf-8').strip())
                #data_x.append(counter)
                #print("read something good")
                #counter=counter+1
                #print(int(data_y))   # read a '\n' terminated line
            except KeyboardInterrupt:
                print ("keybi")
                exit(0)
            except: 
                print("read back some crap")

            counter = counter+ 1
            if (counter==20):
                print("plotting...")
                # plt.plot(data_y)
                # plt.title(str(counter))
                # plt.draw()
                # plt.pause(0.1)
                #plt.show(block=True) # block=True lets the window stay open at the end of the animation.

                counter=0
                data_y =[]

