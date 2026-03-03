<#
.SYNOPSIS
    .env.local    key=value  GitHub Actions repository secrets  gh (GitHub CLI).

.NOTE
  -   GitHub CLI (gh)    (gh auth login).
  -       .   JSON              .
  -    (    ).

.PARAMETER EnvFile
    env. : .env.local

.PARAMETER Repo
  repo  owner/repo. : Stampcoin-platform/stampcoin-platform

.PARAMETER DryRun
          .

.PARAMETER Prefix
           ( "PROD_").

.PARAMETER Force
         (   DryRun).

.EXAMPLE
  .\bulk-set-secrets-from-env.ps1 -EnvFile .env.local -Repo "Stampcoin-platform/stampcoin-platform"

   Dry-Run:
  .\bulk-set-secrets-from-env.ps1 -DryRun

#>

param(
  [string]$EnvFile = ".env.local",
  [string]$Repo = "Stampcoin-platform/stampcoin-platform",
  [switch]$DryRun,
  [string]$Prefix = "",
  [switch]$Force
)

function Write-Masked {
  param([string]$val)
  if ($null -eq $val -or $val.Length -eq 0) { return "***empty***" }
  if ($val.Length -le 8) { return ("*" * $val.Length) }
  return ($val.Substring(0,4) + "..." + $val.Substring($val.Length-4))
}

#    gh
try {
  $ghVersion = & gh --version 2>$null
} catch {
  Write-Error "GitHub CLI (gh)       PATH.    : gh auth login"
  exit 1
}

#    gh  
try {
  $authStatus = & gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "  gh   . : gh auth login"
    #         
  }
} catch {
  Write-Warning "      gh.    ."
}

if (-not (Test-Path $EnvFile)) {
  Write-Error " '$EnvFile'  .     ."
  exit 1
}

#     key=value
$entries = @()
Get-Content $EnvFile -Raw | ForEach-Object {
  #        
  $_ -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    #      =  -    =
    $idx = $line.IndexOf("=")
    if ($idx -lt 0) { 
      Write-Warning ":    key=value -> '$line'"
      return
    }
    $key = $line.Substring(0,$idx).Trim()
    $rawVal = $line.Substring($idx+1).Trim()

    #    '  "
    if (($rawVal.StartsWith("'") -and $rawVal.EndsWith("'")) -or ($rawVal.StartsWith('"') -and $rawVal.EndsWith('"'))) {
      $value = $rawVal.Substring(1, $rawVal.Length-2)
    } else {
      $value = $rawVal
    }

    #     $VAR  ${VAR}    
    # (      $NAME  ${NAME})
    $value = $value -replace '\$\{([^}]+)\}', { param($m) (Get-Item -Path Env:$($m.Groups[1].Value) -ErrorAction SilentlyContinue).Value }
    $value = $value -replace '\$([A-Za-z_][A-Za-z0-9_]*)', { param($m) (Get-Item -Path Env:$($m.Groups[1].Value) -ErrorAction SilentlyContinue).Value }

    $entries += [pscustomobject]@{ Key = $key; Value = $value }
  }
}

if ($entries.Count -eq 0) {
  Write-Error "         ."
  exit 1
}

#     
if ($Prefix -ne "") {
  $entries = $entries | Where-Object { $_.Key.StartsWith($Prefix) }
  if ($entries.Count -eq 0) {
    Write-Error "     '$Prefix'."
    exit 1
  }
}

Write-Host "  $($entries.Count) ()  '$EnvFile'  repository '$Repo'."

if (-not $DryRun -and -not $Force) {
  $ok = Read-Host "  Y "
  if ($ok -ne "Y" -and $ok -ne "y") {
    Write-Host "     ."
    exit 0
  }
}

#  ( )     GitHub secret
foreach ($entry in $entries) {
  $name = $entry.Key
  $value = $entry.Value

  if ([string]::IsNullOrEmpty($value)) {
    Write-Warning " '$name'   ."
    continue
  }

  $masked = Write-Masked -val $value

  if ($DryRun) {
    Write-Host "[DryRun] / secret '$name' : $masked"
    continue
  }

  try {
    #  gh   secret; gh    
    #      --body
    & gh secret set $name --body $value --repo $Repo 2>&1 | ForEach-Object { $_ } 
    if ($LASTEXITCODE -eq 0) {
      Write-Host "  secret '$name' ($masked)"
    } else {
      Write-Warning "  '$name'.   gh ."
    }
  } catch {
    Write-Error "    '$name': $_"
  }
}

Write-Host " ."