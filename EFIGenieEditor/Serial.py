"""This module provides a simple serial console and HTTP request
library for communicating with the EFIGenie.
"""
import serial
import struct
import http.server
import argparse
import urllib.parse


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

    def do_GET(self):
        urlp = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(urlp.query)
        if(urlp.path == "/GetVariable") :
            varID = 0
            offset = 0
            if "id" in query: varID = int(query["id"][0])
            if "offset" in query: offset = int(query["offset"][0])
            sendBytes = struct.pack("<IB", varID, offset)
            self.serial_conn.write(sendBytes)
            readType = self.serial_conn.read(1)[0]
            # if readType == 12 or readType == 14:
                # ser.write(struct.pack("<I", offset))
            readBytes = self.serial_conn.read(8)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(str(parse_readbytes(readBytes, readType)).encode('utf-8'))

def parse_readbytes(readBytes, readType):
    """Parse the bytes read off the serial console.

    Args:
        readBytes: The bytes data read off the console. Will always be 8 bytes long
            but sometimes only a portion of the bytes are valid depending on the readType.
        readType: Type of info the readBytes should be interpreted as. Mostly designates
            which struct the data should be unpacked into, but a couple of edge cases exist.

    Returns:
        readBytes parsed into a string or possibly a bool. 
    """
    # For the simple cases lets make a dictionary of the read type
    # key mapping to a tuple containing the struct format and the slice
    # of byte data that should be unpacked.
    fmtslc_switch = {
        1: ("B", slice(0, 1)),
        2: ("H", slice(0, 2)),
        3: ("I", slice(0, 4)),
        4: ("L", slice(0, 8)),
        5: ("b", slice(0, 1)),
        6: ("h", slice(0, 2)),
        7: ("i", slice(0, 4)),
        8: ("l", slice(0, 8)),
        9: ("f", slice(0, 4)),
        10: ("d", slice(0, 8)),
    }
    # For all cases we'll just use a simple if/else construct to parse
    if readType == 0:
        return "VOID"
    elif 1 <= readType <= 10:
        fmt, slc = fmtslc_switch[readType][:]
        return struct.unpack(fmt, readBytes[slc])[0]
    elif readType == 11:
        return bool(readBytes[0])
    elif 12 <= readType <= 14:
        return " ".join(readBytes[0:8])

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

    readBytes = bytearray([0, 0, 0, 0, 0, 0, 0, 0, 0])

    while True:
        variableID = input("Enter ID of variable to check (q to quit): ")
        if variableID.lower() == "q":
            break
        else:
            variableID = int(variableID)
        sendBytes = struct.pack("<IB", variableID, 0)
        ser.write(sendBytes)
        readType = ser.read(1)
        readBytes = ser.read(8)
        if len(readType) == 0:
            continue 
        if readType[0] == 12 or readType[0] == 14:
            offset = int(input("Enter Offset: "))
            ser.write(struct.pack("<IB", variableID, offset))
            readType = ser.read(1)
            readBytes = ser.read(8)
        print(parse_readbytes(readBytes, readType[0]))

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
