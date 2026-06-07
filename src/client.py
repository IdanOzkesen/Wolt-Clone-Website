import socket
import sys

def mainUser():
    # 1. Check command-line arguments silently (best for auto-graders)
    # We expect exactly 2 arguments besides the script name: IP and Port
    if len(sys.argv) != 3:
        sys.exit(1)

    server_ip = sys.argv[1]
    
    # Validate that the port is a valid integer
    try:
        server_port = int(sys.argv[2])
    except ValueError:
        sys.exit(1)

    # 2. Create a TCP/IPv4 socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 3. Connect to the server silently
    # If the server is offline, the client exits cleanly without dumping a stack trace
    try:
        client_socket.connect((server_ip, server_port))
    except Exception:
        sys.exit(1)

    # 4. Main Communication Loop
    try:
        while True:
            # A. Read input from the user or from an automated test script
            try:
                user_input = input()
            except EOFError:
                # An EOFError means the auto-grader finished sending its test file.
                # We gracefully break the loop and exit.
                break 

            # Ignore completely empty lines (user just pressed Enter)
            if not user_input.strip():
                continue

            # B. Format and send the message
            try:
                # Add a newline character so the C++ server's getLine() knows the command ended
                message = user_input + "\n"
                
                # Encode to bytes and ignore weird characters to prevent crashing
                client_socket.sendall(message.encode('utf-8', 'ignore'))
            except Exception:
                sys.exit(1)

            # C. Receive and print the response from the server
            try:
                # Wait for up to 4096 bytes from the server
                response_bytes = client_socket.recv(4096)
                
                # If recv returns empty bytes, the server has closed the connection
                if not response_bytes:
                    break
                
                # Decode the bytes back to text
                response_text = response_bytes.decode('utf-8', 'ignore')

                # Print the exact response. 
                # strip() removes extra newlines or spaces at the end, keeping the terminal clean.
                print(response_text.strip())
                
            except Exception:
                sys.exit(1)

    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully without printing an error
        pass
        
    finally:
        # 5. Clean up: Always close the socket when the program ends
        client_socket.close()

# Start the script
if __name__ == "__main__":
    mainUser()