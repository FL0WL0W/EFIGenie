"""This module provides a simple serial console and HTTP request
library for communicating with the EFIGenie.
"""
from telnetlib import NOP
import serial
import struct
import http.server
import argparse
import base64
import json
import time
import posixpath
import shutil
from sys import version as python_version
from cgi import parse_header, parse_multipart
from os.path import exists

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

    extensions_map = _encodings_map_default = {
        '.gz': 'application/gzip',
        '.Z': 'application/octet-stream',
        '.bz2': 'application/x-bzip2',
        '.xz': 'application/x-xz',
        '.manifest': 'text/cache-manifest',
	    '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg':	'image/svg+xml',
        '.css':	'text/css',
        '.js':	'application/x-javascript',
        '': 'application/octet-stream', # Default
    }
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

    def guess_type(self, path):
        """Guess the type of a file.
        Argument is a PATH (a filename).
        Return value is a string of the form type/subtype,
        usable for a MIME Content-type header.
        The default implementation looks the file's extension
        up in the table self.extensions_map, using application/octet-stream
        as a default; however it would be permissible (if
        slow) to look inside the data to make a better guess.
        """
        base, ext = posixpath.splitext(path)
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        ext = ext.lower()
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        guess, _ = mimetypes.guess_type(path)
        if guess:
            return guess
        return 'application/octet-stream'

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

    def do_GET(self):
        if(self.path == "/GetVariableMetaData") :
            self.serial_conn.flushOutput()
            self.serial_conn.flushInput()
            sendBytes = struct.pack("<BI", 109, 0)
            self.serial_conn.write(sendBytes)
            metadatalength = struct.unpack('I', self.serial_conn.read(4))[0] + 4
            metadata = self.serial_conn.read(60)
            for i in range(1, int(metadatalength/64)):
                sendBytes = struct.pack("<BI", 109, i)
                self.serial_conn.write(sendBytes)
                metadata += self.serial_conn.read(64)
            sendBytes = struct.pack("<BI", 109, int(metadatalength/64))
            self.serial_conn.write(sendBytes)
            metadata += self.serial_conn.read(64)[0:(metadatalength%64)]
            resp = base64.b64encode(metadata)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(resp)
        else:
            path = self.path[1:]
            if(exists(path)) :
                with open(path, "rb") as f:
                    self.send_response(200)
                    self.send_header("Content-type", self.guess_type(path) + ";charset=UTF-8")
                    self.end_headers()
                    shutil.copyfileobj(f, self.wfile)
            else:
                self.send_response(404)
                self.end_headers()



    def do_POST(self):
        if(self.path == "/GetVariable") :
            body = self.rfile.read(int(self.headers['content-length']))
            postvars = json.loads(body)
            variables = postvars['Variables']
            offsets = postvars['Offsets']
            resp = ""
            sendBytes = bytearray([])
            totalbytes = bytearray([])
            self.serial_conn.flushOutput()
            self.serial_conn.flushInput()
            for i in range(len(variables)):
                varID = int(variables[i])
                offset = int(offsets[i])
                if offset > -1:
                    sendBytes += struct.pack("<BIB", 103, varID, offset)
                else:
                    sendBytes += struct.pack("<BI", 103, varID)

            self.serial_conn.write(sendBytes)
            self.serial_conn.flushOutput()
            for v in range(len(variables)):
                ( val, readBytes ) = parse_readbytes(self.serial_conn)
                totalbytes += readBytes
                resp += str(val) + "\n"

            resp = base64.b64encode(totalbytes).decode('ascii') + "\n" + resp
            self.send_response(200)
            self.end_headers()
            self.wfile.write(resp.encode('utf-8'))
        if(self.path == "/BurnConfig") :
            burn_config(self.serial_conn, self.rfile.read(int(self.headers['content-length'])))

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
    readBytes = ser.read(1)
    if len(readBytes) == 0:
        return ("No Response", readBytes)
    val = "VOID"
    # For all cases we'll just use a simple if/else construct to parse
    if readBytes[0] == 0:
        NOP
    elif 1 <= readBytes[0] <= 10:
        fmt = fmt_switch[readBytes[0]]
        size = struct.Struct(fmt).size
        readBytes += ser.read(size)
        val = struct.unpack(fmt, readBytes[1:])[0]
    elif readBytes[0] == 11:
        readBytes += ser.read(1)
        val = bool(readBytes[1])
    elif 12 <= readBytes[0] <= 14:
        time.sleep(0.1)
        readBytes = ser.read(ser.in_waiting)
        val = ''.join('{:02x}'.format(x) for x in readBytes)

    return (val, readBytes)

def burn_config(ser, config):
    ser.flushOutput()
    ser.flushInput()
    sendBytes = struct.pack("<B", 99)
    ser.write(sendBytes)
    readBytes = ser.read(4)
    configAddress = struct.unpack("<I", readBytes)[0]
    print(configAddress)

    sendBytes = struct.pack("<B", 113)
    ser.write(sendBytes)
    time.sleep(1)
    ser.read(ser.in_waiting)

    length = len(config)
    i = 0
    while length > 0:
        sendSize = min(52, length)
        sendBytes = struct.pack("<BII", 119, configAddress + i, sendSize)
        sendBytes += config[i:(i+sendSize)]
        length -= sendSize
        i += sendSize
        ser.write(sendBytes)
        if(ser.read(1)[0] != 6) :
            break

    sendBytes = struct.pack("<B", 115)
    ser.write(sendBytes)

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

def run_config(ser, config):
    with open(config, "rb") as f:
        f.seek(0, 2)
        f_length = f.tell()
        f.seek(0, 0)
        burn_config(ser, f.read(f_length))

    ser.close()

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
        sendBytes = struct.pack("<BI", 103, variableID)
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
    ap.add_argument(
        "--config",
        help="to upload a config to the device"
    )
    args = ap.parse_args()
    serial_connection = serial.Serial(args.comport, 115200, serial.EIGHTBITS, serial.PARITY_NONE, serial.STOPBITS_ONE, 1)
    # serial_connection = "serial"
    if args.server:
        run_server(serial_connection, "localhost", 8080)
    elif args.config:
        run_config(serial_connection, args.config)
    else:
        run_serial(serial_connection)
    
if __name__ == "__main__":
    main()
