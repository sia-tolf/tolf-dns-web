// The credential is embedded only in the locally copied script. It is never sent
// to another service by this page.
function buildWindowsSmartDnsSetup(dohUrl) {
  const url = new URL(dohUrl);
  if (url.protocol !== "https:" || url.hostname !== "dns.tolf.is" ||
      !/^\/dns-query\/tdns_[A-Za-z0-9_-]+\/?$/.test(url.pathname) ||
      url.search || url.hash) {
    throw new Error("Unexpected Smart DNS endpoint");
  }
  const template = url.toString().replaceAll("'", "''");

  return `# TOLF Smart DNS — Windows 11. Paste into PowerShell as Administrator.
$ErrorActionPreference = 'Stop'
$DoHTemplate = '${template}'
if ([Environment]::OSVersion.Version.Build -lt 22000) {
  throw 'Native system DoH setup requires Windows 11.'
}

$required = 'Get-DnsClientDohServerAddress', 'Add-DnsClientDohServerAddress', 'Remove-DnsClientDohServerAddress', 'Get-NetAdapter', 'Set-DnsClientServerAddress', 'Clear-DnsClientCache'
foreach ($command in $required) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "This Windows version does not provide $command. DNS settings were not changed."
  }
}

$ipv4 = @(
  Resolve-DnsName -Name 'dns.tolf.is' -Type A -DnsOnly -ErrorAction Stop |
  Where-Object { $_.IPAddress } | Select-Object -ExpandProperty IPAddress -Unique
)
if (-not $ipv4.Count) { throw 'Could not resolve dns.tolf.is. DNS settings were not changed.' }
$ipv6 = @(
  Resolve-DnsName -Name 'dns.tolf.is' -Type AAAA -DnsOnly -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress } | Select-Object -ExpandProperty IPAddress -Unique
)
$servers = @($ipv4 + $ipv6 | Select-Object -Unique)

$adapters = @(Get-NetAdapter -Physical | Where-Object Status -eq 'Up')
if (-not $adapters.Count) { throw 'No active physical network adapter was found.' }
Write-Host 'Choose the network adapter to configure:'
for ($n = 0; $n -lt $adapters.Count; $n++) {
  Write-Host ("{0}: {1}" -f ($n + 1), $adapters[$n].Name)
}
$choice = Read-Host 'Adapter number (Enter to cancel)'
if ($choice -notmatch '^[1-9][0-9]*$' -or [int]$choice -gt $adapters.Count) {
  throw 'Cancelled. DNS settings were not changed.'
}
$adapter = $adapters[[int]$choice - 1]
$existingServers = @()
foreach ($server in $servers) {
  $existing = Get-DnsClientDohServerAddress -ServerAddress $server -ErrorAction SilentlyContinue
  if ($existing -and ($existing.DohTemplate -ne $DoHTemplate -or
      -not $existing.AutoUpgrade -or $existing.AllowFallbackToUdp)) {
    throw "DNS IP $server already has a different Windows DoH configuration. Nothing was changed."
  }
  if ($existing) { $existingServers += $server }
}

$previous = @(Get-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex |
  ForEach-Object { $_.ServerAddresses })
$registry = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\' + $adapter.InterfaceGuid
$staticNameServer = (Get-ItemProperty -Path $registry -Name NameServer -ErrorAction SilentlyContinue).NameServer
$registry6 = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip6\\Parameters\\Interfaces\\' + $adapter.InterfaceGuid
$staticNameServer6 = (Get-ItemProperty -Path $registry6 -Name NameServer -ErrorAction SilentlyContinue).NameServer
$wasAutomatic = [string]::IsNullOrWhiteSpace($staticNameServer) -and [string]::IsNullOrWhiteSpace($staticNameServer6)
$backupDir = Join-Path $env:ProgramData 'TOLF'
$backupPath = Join-Path $backupDir ('SmartDNS-' + $adapter.ifIndex + '.json')
if (Test-Path $backupPath) {
  throw "An earlier DNS backup already exists at $backupPath. Nothing was changed."
}
Write-Host ("Adapter: {0}; DNS IPs: {1}; encrypted DNS only (no plaintext fallback)." -f $adapter.Name, ($servers -join ', '))
$confirm = Read-Host 'Type YES to save the previous DNS settings and continue'
if ($confirm -cne 'YES') { throw 'Cancelled. DNS settings were not changed.' }

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
@{ InterfaceIndex = $adapter.ifIndex; Automatic = $wasAutomatic;
   PreviousDns = $previous; TolfServers = $servers; SavedAt = (Get-Date).ToString('o') } |
  ConvertTo-Json | Set-Content -LiteralPath $backupPath -Encoding UTF8
$added = @()
try {
  foreach ($server in $servers) {
    if ($server -notin $existingServers) {
      Add-DnsClientDohServerAddress -ServerAddress $server -DohTemplate $DoHTemplate -AutoUpgrade $true -AllowFallbackToUdp $false -ErrorAction Stop
      $added += $server
    }
  }
  Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses $servers -ErrorAction Stop
  Clear-DnsClientCache
  $current = @(Get-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex |
    ForEach-Object { $_.ServerAddresses })
  if (@($current | Where-Object { $_ -notin $servers }).Count) {
    throw 'Another DNS server remains configured on this adapter.'
  }
  Resolve-DnsName -Name example.com -Type A -DnsOnly -ErrorAction Stop | Out-Null
} catch {
  if ($wasAutomatic) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ResetServerAddresses -ErrorAction SilentlyContinue
  } elseif ($previous.Count) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses $previous -ErrorAction SilentlyContinue
  }
  foreach ($server in $added) {
    Remove-DnsClientDohServerAddress -ServerAddress $server -ErrorAction SilentlyContinue
  }
  throw
}
Write-Host 'TOLF Smart DNS is configured for the selected adapter.' -ForegroundColor Green
Write-Host "Previous DNS settings: $backupPath"
`;
}

function buildWindowsSmartDnsRestore() {
  return `# TOLF Smart DNS — restore a Windows 11 adapter from its local backup.
$ErrorActionPreference = 'Stop'
$folder = Join-Path $env:ProgramData 'TOLF'
$files = @(Get-ChildItem -LiteralPath $folder -Filter 'SmartDNS-*.json' -File -ErrorAction Stop)
if (-not $files.Count) { throw 'No TOLF Smart DNS backup was found on this computer.' }
Write-Host 'Choose the DNS backup to restore:'
for ($n = 0; $n -lt $files.Count; $n++) {
  Write-Host ("{0}: {1}" -f ($n + 1), $files[$n].Name)
}
$choice = Read-Host 'Backup number (Enter to cancel)'
if ($choice -notmatch '^[1-9][0-9]*$' -or [int]$choice -gt $files.Count) { throw 'Cancelled.' }
$file = $files[[int]$choice - 1]
$backup = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
$index = [int]$backup.InterfaceIndex
if (-not (Get-NetAdapter -InterfaceIndex $index -ErrorAction SilentlyContinue)) {
  throw 'The network adapter from this backup is no longer present.'
}
$confirm = Read-Host 'Type YES to restore the previous DNS settings'
if ($confirm -cne 'YES') { throw 'Cancelled.' }
if ($backup.Automatic) {
  Set-DnsClientServerAddress -InterfaceIndex $index -ResetServerAddresses -ErrorAction Stop
} elseif (@($backup.PreviousDns).Count) {
  Set-DnsClientServerAddress -InterfaceIndex $index -ServerAddresses @($backup.PreviousDns) -ErrorAction Stop
} else {
  throw 'The backup has no previous DNS addresses; no changes were made.'
}
Clear-DnsClientCache
foreach ($server in @($backup.TolfServers)) {
  $usedElsewhere = @(Get-DnsClientServerAddress | Where-Object { $_.InterfaceIndex -ne $index } |
    ForEach-Object { $_.ServerAddresses }) -contains $server
  if (-not $usedElsewhere) {
    Remove-DnsClientDohServerAddress -ServerAddress $server -ErrorAction SilentlyContinue
  }
}
Rename-Item -LiteralPath $file.FullName -NewName ($file.Name + '.restored') -ErrorAction Stop
Write-Host 'Previous DNS settings restored.' -ForegroundColor Green
`;
}
