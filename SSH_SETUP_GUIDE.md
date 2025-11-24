# SSH Setup Guide for Footy Oracle LM Automation

This guide enables your Language Model (LM) to automatically execute PowerShell scripts in your Footy Oracle v2 repository via SSH connection.

## Prerequisites

- Windows 10/11 or Windows Server
- Administrator access
- Footy Oracle v2 repository cloned locally

## Step 1: Enable OpenSSH Server on Windows

### Via Settings (GUI)
1. Open **Settings** → **Apps** → **Optional Features**
2. Click **Add a feature**
3. Search for **OpenSSH Server**
4. Click **Install**

### Via PowerShell (Admin)
```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the service
Start-Service sshd

# Set service to start automatically
Set-Service -Name sshd -StartupType 'Automatic'

# Confirm the firewall rule is configured
Get-NetFirewallRule -Name *ssh*
```

## Step 2: Configure SSH Service

### Start and Enable SSH
```powershell
# Ensure SSH is running
Start-Service sshd

# Verify service status
Get-Service sshd

# Expected output: Status should be "Running"
```

### Configure Firewall (if needed)
```powershell
# Allow SSH through Windows Firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

## Step 3: Set PowerShell as Default SSH Shell

```powershell
# Set PowerShell as default shell for SSH
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -PropertyType String -Force

# Or for PowerShell Core (pwsh)
# New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Program Files\PowerShell\7\pwsh.exe" -PropertyType String -Force
```

## Step 4: Prepare SSH Key Authentication

### Create .ssh Directory
```powershell
# Create .ssh directory in your user profile
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir
}

# Create authorized_keys file
$authKeysFile = "$sshDir\authorized_keys"
if (!(Test-Path $authKeysFile)) {
    New-Item -ItemType File -Path $authKeysFile
}
```

### Set Correct Permissions
```powershell
# Set permissions for .ssh directory
icacls $sshDir /inheritance:r
icacls $sshDir /grant:r "$env:USERNAME:(OI)(CI)F"

# Set permissions for authorized_keys
icacls $authKeysFile /inheritance:r
icacls $authKeysFile /grant:r "$env:USERNAME:F"
```

## Step 5: Get Your Machine's IP Address

```powershell
# Get your local IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object IPAddress, InterfaceAlias

# Or for external IP (if accessing remotely)
Invoke-RestMethod -Uri 'https://api.ipify.org?format=json' | Select-Object -ExpandProperty ip
```

**Note your IP address** - you'll provide this to your LM.

## Step 6: Connect Your LM

### Provide Connection Details to LM
When ready to connect, tell your LM:
```
My IP address is: [YOUR_IP_HERE]
Please connect via SSH
```

### LM Will Generate SSH Keys
Your LM will automatically:
1. Generate SSH key pair
2. Provide you with the public key
3. Wait for you to add it to authorized_keys

### Add LM's Public Key
```powershell
# Open authorized_keys in notepad
notepad "$env:USERPROFILE\.ssh\authorized_keys"

# Paste the public key provided by LM (one line)
# Save and close
```

## Step 7: Test Connection

Your LM will test the connection with:
```bash
ssh username@your-ip-address
```

## Step 8: Navigate to Repository

Once connected, your LM can navigate to your repo:
```powershell
# Navigate to footy-oracle-v2
cd C:\path\to\footy-oracle-v2

# List available scripts
Get-ChildItem -Recurse -Filter *.ps1
```

## Available Scripts for LM Automation

Your LM can now execute any PowerShell scripts in your repository:

### Example Commands
```powershell
# Run data collection
.\scripts\collect-data.ps1

# Execute ML training
.\scripts\train-model.ps1

# Generate predictions
.\scripts\generate-predictions.ps1

# Run analytics
.\scripts\run-analytics.ps1
```

## Security Best Practices

1. **Use Key-Based Authentication Only**
   - Disable password authentication in `C:\ProgramData\ssh\sshd_config`
   - Add line: `PasswordAuthentication no`

2. **Restrict SSH Access**
   ```powershell
   # Only allow specific users
   # Edit C:\ProgramData\ssh\sshd_config
   # Add: AllowUsers your-username
   ```

3. **Firewall Rules**
   - Only allow SSH from trusted IPs if possible
   - Use Windows Firewall advanced settings

4. **Monitor SSH Logs**
   ```powershell
   # View SSH logs
   Get-EventLog -LogName Security -Newest 50 | Where-Object {$_.EventID -eq 4624}
   ```

## Troubleshooting

### SSH Service Won't Start
```powershell
# Check service status
Get-Service sshd

# View error logs
Get-EventLog -LogName Application -Source OpenSSH -Newest 10
```

### Connection Refused
```powershell
# Verify firewall rule
Get-NetFirewallRule -Name *ssh* | Select-Object Name, Enabled, Direction, Action

# Test local connection
ssh localhost
```

### Permission Denied
```powershell
# Reset authorized_keys permissions
icacls "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "$env:USERNAME:F"
```

### Wrong Shell
```powershell
# Verify default shell setting
Get-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell
```

## Integration with LM Workflow

Once connected, your LM can:

1. **Execute Scripts Automatically**
   - Run data collection on schedule
   - Trigger ML training pipelines
   - Generate predictions on demand

2. **Monitor Execution**
   - Check script output
   - Verify data integrity
   - Report errors

3. **Manage Repository**
   - Pull latest changes
   - Run tests
   - Deploy updates

4. **Coordinate Tasks**
   - Chain multiple scripts
   - Handle dependencies
   - Manage execution order

## Next Steps

1. Complete this SSH setup
2. Provide your IP to LM
3. Add LM's public key to authorized_keys
4. Test connection
5. Start automating your Footy Oracle workflows!

## Related Documentation

- [ORACLE_LM_INTEGRATION.md](./ORACLE_LM_INTEGRATION.md) - LM integration overview
- [BUILD_BLUEPRINT.md](./BUILD_BLUEPRINT.md) - Project architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## Support

For issues or questions:
- Check troubleshooting section above
- Review Windows OpenSSH documentation
- Verify firewall and network settings
