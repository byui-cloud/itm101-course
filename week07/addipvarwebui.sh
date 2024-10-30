#!/bin/bash
# Get the public IP address using curl
public_ip=$(curl -s http://checkip.amazonaws.com)

# Define the environment variables with the dynamic IP address
ollama_host="Environment=\"OLLAMA_HOST=0.0.0.0\""
ollama_origins="Environment=\"OLLAMA_ORIGINS=${public_ip}:*\""

# Path to the file where you want to append these environment variables
file_path="/etc/systemd/system/ollama.service" # Update with the correct file path

sed -i "/Environment=\"PATH=\/usr\/local\/sbin:\/usr\/local\/bin:\/usr\/sbin:\/usr\/bin\"/a $ollama_host\n$ollama_origins" "$file_path"

echo "Environment variables have been appended to $file_path."
systemctl daemon-reload
systemctl restart ollama