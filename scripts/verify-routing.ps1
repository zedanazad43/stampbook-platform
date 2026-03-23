$ErrorActionPreference = "Continue"

$targets = @(
  @{ Name = "apex-health"; Url = "https://ecostamp.net/health" },
  @{ Name = "apex-api-site"; Url = "https://ecostamp.net/api/site" },
  @{ Name = "origin-cloud-health"; Url = "https://origin-cloud.ecostamp.net/health" },
  @{ Name = "origin-local-health"; Url = "https://origin-local.ecostamp.net/health" },
  @{ Name = "render-origin-health"; Url = "https://stampcoin-platform.onrender.com/health" }
)

Write-Host "== HTTP checks =="
$httpResults = foreach ($t in $targets) {
  try {
    $res = Invoke-WebRequest -Uri $t.Url -Method GET -TimeoutSec 10 -UseBasicParsing
    $body = if ($res.Content.Length -gt 120) { $res.Content.Substring(0, 120) + "..." } else { $res.Content }
    [PSCustomObject]@{
      Check = $t.Name
      Status = $res.StatusCode
      Url = $t.Url
      Snippet = $body.Replace("`r", " ").Replace("`n", " ")
    }
  } catch {
    [PSCustomObject]@{
      Check = $t.Name
      Status = "ERROR"
      Url = $t.Url
      Snippet = $_.Exception.Message
    }
  }
}

$httpResults | Format-Table -AutoSize

Write-Host "`n== DNS checks =="
$dnsHosts = @("ecostamp.net", "origin-cloud.ecostamp.net", "origin-local.ecostamp.net")
$dnsResults = foreach ($hostName in $dnsHosts) {
  try {
    $records = Resolve-DnsName -Name $hostName -Type A -ErrorAction Stop |
      Where-Object { $_.Type -eq "A" -and $_.IPAddress }

    if ($records -and $records.Count -gt 0) {
      [PSCustomObject]@{ Host = $hostName; A = (($records | Select-Object -ExpandProperty IPAddress) -join ", ") }
    } else {
      [PSCustomObject]@{ Host = $hostName; A = "NO_A_RECORD" }
    }
  } catch {
    [PSCustomObject]@{ Host = $hostName; A = "NO_A_RECORD" }
  }
}

$dnsResults | Format-Table -AutoSize
