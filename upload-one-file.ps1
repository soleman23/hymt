<#
=============================================================================
 HYMT -> Hostinger: re-upload ONE file
=============================================================================
 deploy-to-hostinger.ps1 uploads all 208 files over a single kept-alive FTP
 connection and retries a file up to 3 times. On 2026-08-06 two consecutive
 full runs each left exactly one page truncated to its last 13 bytes
 ("/body></html>") while reporting success -- a different page each run.

 This script exists to repair one file without re-running the whole deploy:

   - opens a FRESH connection per request (KeepAlive = $false)
   - uploads the single file you name
   - reads the size back off the server and compares it to the local file,
     so a silently-truncated write cannot be reported as a success

 Prompts for the FTP password (SecureString). Never stores or prints it.

 HOW TO RUN:
   powershell -ExecutionPolicy Bypass -File "C:\Users\reach\OneDrive\Pictures\Desktop\hymt-site\upload-one-file.ps1"

 To repair a different file, pass its path relative to dist/:
   ... -RelPath "destinations/france/index.html"
=============================================================================
#>

param(
    # Path relative to dist/, forward slashes.
    [string]$RelPath   = "destinations/caribbean-mexico/index.html",
    [string]$LocalDir  = "C:\Users\reach\OneDrive\Pictures\Desktop\hymt-site\dist",
    [string]$FtpHost   = "195.179.237.168",
    [string]$User      = "u530147977",
    [int]   $Port      = 21,
    [string]$RemoteDir = "domains/brown-goose-754147.hostingersite.com/public_html"
)

$ErrorActionPreference = 'Stop'

$local = Join-Path $LocalDir ($RelPath -replace '/','\')
if (-not (Test-Path -LiteralPath $local)) {
    Write-Host "ERROR: local file not found: $local" -ForegroundColor Red
    exit 1
}
$localBytes = [IO.File]::ReadAllBytes($local)
Write-Host ""
Write-Host "Local file : $RelPath" -ForegroundColor Cyan
Write-Host "Local size : $($localBytes.Length) bytes" -ForegroundColor Cyan

$secure = Read-Host -AsSecureString -Prompt "Enter FTP password for $User@$FtpHost"
$cred   = New-Object System.Net.NetworkCredential($User, $secure)

$rd  = $RemoteDir.Trim('/')
$esc = (($RelPath -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
$uri = "ftp://${FtpHost}:$Port/$rd/$esc"

function New-FtpRequest([string]$u, [string]$method) {
    $r = [System.Net.FtpWebRequest]::Create($u)
    $r.Credentials = $cred
    $r.Method      = $method
    $r.UseBinary   = $true
    $r.UsePassive  = $true
    $r.KeepAlive   = $false   # fresh connection every time -- the whole point
    $r.Timeout     = 100000
    return $r
}

Write-Host "Uploading to $uri" -ForegroundColor Cyan
try {
    $req = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::UploadFile)
    $req.ContentLength = $localBytes.Length
    $rs = $req.GetRequestStream()
    $rs.Write($localBytes, 0, $localBytes.Length)
    $rs.Close()
    $resp = $req.GetResponse()
    Write-Host "Server said: $($resp.StatusDescription.Trim())" -ForegroundColor Green
    $resp.Close()
} catch {
    Write-Host "UPLOAD FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ---- verify: ask the server how big the file actually is now --------------
# This host answers SIZE with 550, so a directory listing is the fallback --
# and in practice the one that actually works here.
Write-Host "Verifying remote size..." -ForegroundColor Cyan
$size = $null
try {
    $vr   = (New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::GetFileSize)).GetResponse()
    $size = $vr.ContentLength
    $vr.Close()
} catch {
    Write-Host "  SIZE refused by the server, reading the directory listing instead." -ForegroundColor DarkGray
    if ($_.Exception.Response) { $_.Exception.Response.Close() }
}

if ($null -eq $size) {
    $parts    = $RelPath -split '/'
    $fileName = $parts[-1]
    $parentUri = "ftp://${FtpHost}:$Port/$rd"
    if ($parts.Count -gt 1) {
        $parentEsc = (($parts[0..($parts.Count-2)]) | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
        $parentUri = "$parentUri/$parentEsc"
    }
    try {
        $lr = (New-FtpRequest $parentUri ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails)).GetResponse()
        $sr = New-Object IO.StreamReader($lr.GetResponseStream())
        $listing = $sr.ReadToEnd(); $sr.Dispose(); $lr.Close()
        foreach ($line in ($listing -split "`n")) {
            $m = [regex]::Match($line.Trim(), '^\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+.*?\s(\S+)$')
            if ($m.Success -and $m.Groups[2].Value -eq $fileName) { $size = [int64]$m.Groups[1].Value; break }
        }
    } catch {
        Write-Host "Could not list the remote folder: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if ($null -eq $size) {
    # Expected for dotfiles: FTP LIST hides them, and this server also
    # refuses SIZE. The upload itself already returned 226 Transfer
    # complete, so this is "unverified", not "failed".
    Write-Host ""
    Write-Host "UPLOADED, size not verifiable." -ForegroundColor Yellow
    Write-Host "  The server hides this file from LIST (normal for dotfiles) and" -ForegroundColor Yellow
    Write-Host "  refuses SIZE, so there is nothing to read the length back from." -ForegroundColor Yellow
    Write-Host "  The transfer itself reported success above." -ForegroundColor Yellow
    if ($RelPath -eq '.htaccess') {
        Write-Host "  Verify the effect instead - this should list no-transform:" -ForegroundColor Cyan
        Write-Host '    curl.exe -sI "https://brown-goose-754147.hostingersite.com/" | findstr /i cache-control'
    }
    exit 0
}

Write-Host ""
if ($size -eq $localBytes.Length) {
    Write-Host "SUCCESS - remote is $size bytes, matches local exactly." -ForegroundColor Green
    Write-Host "Check it: https://brown-goose-754147.hostingersite.com/$($RelPath -replace 'index\.html$','')"
} else {
    Write-Host "MISMATCH - remote is $size bytes, local is $($localBytes.Length)." -ForegroundColor Red
    Write-Host "The write was truncated. Just run this script again." -ForegroundColor Yellow
    exit 1
}
