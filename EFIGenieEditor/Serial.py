"""This module provides a simple serial console and HTTP request
library for communicating with the EFIGenie.
"""
import serial
import struct
import http.server
import argparse
from sys import version as python_version
from cgi import parse_header, parse_multipart

if python_version.startswith('3'):
    from urllib.parse import parse_qs
    from http.server import BaseHTTPRequestHandler
else:
    from urlparse import parse_qs
    from BaseHTTPServer import BaseHTTPRequestHandler

class HTTPEFIGenieConsoleHandler(http.server.BaseHTTPRequestHandler):
    """The EFI Genie Console HTTP Handler extension accepts a serial_handler
    object that will be used during requests to communicate with the serial.

    Args:
        serial_conn: An instance of a connection to a serial or COM port.
    """
    def __init__(self, serial_conn):
        self.serial_conn = serial_conn

    def __call__(self, *args, **kwargs):
        """ Handle a request """
        super().__init__(*args, **kwargs)

    def end_headers(self):
        self.send_my_headers()

        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")

    def parse_POST(self):
        ctype, pdict = parse_header(self.headers['content-type'])
        if ctype == 'multipart/form-data':
            postvars = parse_multipart(self.rfile, pdict)
        elif ctype == 'application/x-www-form-urlencoded':
            length = int(self.headers['content-length'])
            postvars = parse_qs(
                    self.rfile.read(length), 
                    keep_blank_values=1)
        else:
            postvars = {}
        return postvars

    def do_POST(self):
        if(self.path == "/GetVariable") :
            postvars = self.parse_POST()
            variables = postvars[b'Variables[]']
            offsets = postvars[b'Offsets[]']
            # sendBytes = struct.pack("<IB", varID, offset)
            sendBytes = bytearray([])
            for i in range(len(variables)):
                varID = int(variables[i])
                offset = int(offsets[i])
                sendBytes += struct.pack("<IB", varID, offset)
            self.serial_conn.flushOutput()
            self.serial_conn.flushInput()
            self.serial_conn.write(sendBytes)
            resp = ""
            for i in range(len(variables)):
                val = str(parse_readbytes(self.serial_conn));
                # print(val)
                resp += val + "\n"
            self.send_response(200)
            self.end_headers()
            self.wfile.write(resp.encode('utf-8'))

# For the simple cases lets make a dictionary of the read type
# key mapping to a tuple containing the struct format and the slice
# of byte data that should be unpacked.
fmt_switch = {
    1: "B",
    2: "H",
    3: "I",
    4: "L",
    5: "b",
    6: "h",
    7: "i",
    8: "l",
    9: "f",
    10: "d"
}

def parse_readbytes(ser):
    """Parse the bytes read off the serial console.

    Args:
        readBytes: The bytes data read off the console. Will always be 8 bytes long
            but sometimes only a portion of the bytes are valid depending on the readType.
        readType: Type of info the readBytes should be interpreted as. Mostly designates
            which struct the data should be unpacked into, but a couple of edge cases exist.

    Returns:
        readBytes parsed into a string or possibly a bool. 
    """
    readType = ser.read(1)[0]
    # For all cases we'll just use a simple if/else construct to parse
    if readType == 0:
        return "VOID"
    elif 1 <= readType <= 10:
        fmt = fmt_switch[readType]
        return struct.unpack(fmt, ser.read(struct.Struct(fmt).size))[0]
    elif readType == 11:
        return bool(ser.read(1)[0])
    elif 12 <= readType <= 14:
        return ''.join('{:02x}'.format(x) for x in ser.read(8))

def run_server(ser, interface, port):
    """Run a simple HTTP server that relays request information to the serial
    interface given by com_port and responds with the parsed info.

    Args:
        ser: COM or serial port connection.
        interface: The network interface to start the HTTP server on.
        port: The port to listen to on the HTTP server.
    """
    httpgeniehandler = HTTPEFIGenieConsoleHandler(ser)
    httpgenie = http.server.HTTPServer((interface, port), httpgeniehandler)
    httpgenie.serve_forever()

def run_serial(ser):
    """Open and run a simple REPL loop connected to the serial console.

    Args:
        ser: An open connection to a serial port.
    """

    while True:
        variableID = input("Enter ID of variable to check (q to quit): ")
        if variableID.lower() == "q":
            break
        else:
            variableID = int(variableID)
        sendBytes = struct.pack("<IB", variableID, 0)
        ser.write(sendBytes)
        readType = ser.read(1)
        if len(readType) == 0:
            continue 
        if readType[0] == 12 or readType[0] == 14:
            ser.read(8) # clear read variable bytes and ask user for offset
            offset = int(input("Enter Offset: "))
            ser.write(struct.pack("<IB", variableID, offset))
        elif readType[0] == 11:
            ser.read(1)
            ser.write(sendBytes)
        elif readType[0] == 0:
            ser.write(sendBytes)
        else:
            ser.read(struct.Struct(fmt_switch[readType[0]]).size)
            ser.write(sendBytes)
        print(parse_readbytes(ser))

    ser.close()

def main():
    ap = argparse.ArgumentParser(
        description="A simple serial console/http server for interfacing with the EFIGenie."
    )
    ap.add_argument(
        "--server",
        action="store_true",
        help=(
            "Run in server mode. Server mode starts an http server that accepts GET requests"
            " which it will turn into serial commands and will respond with the serial outputs"
            " parsed as strings. Currently it only listens on localhost port 8080."
        )
    )
    ap.add_argument(
        "--comport",
        required=True,
        help="The COM or serial port to connect to.",
        default='/dev/ttyACM0'
    )
    args = ap.parse_args()
    serial_connection = serial.Serial(args.comport, 9600, serial.EIGHTBITS, serial.PARITY_NONE, serial.STOPBITS_ONE, 1)
    # serial_connection = "serial"
    if args.server:
        run_server(serial_connection, "localhost", 8080)
    else:
        run_serial(serial_connection)
    
if __name__ == "__main__":
    main()
