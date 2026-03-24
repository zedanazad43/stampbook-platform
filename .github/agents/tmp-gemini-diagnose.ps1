Set-Location 'C:\agent-system'
$ErrorActionPreference = 'Stop'

$envPath = '.env'
$line = Select-String -Path $envPath -Pattern '^GEMINI_API_KEY=' | Select-Object -First 1 -ExpandProperty Line
if (-not $line) {
  Write-Output 'NO_KEY'
  exit 1
}
$key = $line.Split('=')[1].Trim()

function Invoke-GeminiPost([string]$apiVersion, [string]$model) {
  $url = "https://generativelanguage.googleapis.com/$apiVersion/models/$model`:generateContent?key=$key"
  $body = @{ contents = @(@{ parts = @(@{ text = 'Reply with OK' }) }) } | ConvertTo-Json -Depth 8
  try {
    $resp = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 45 -ErrorAction Stop
    return [pscustomobject]@{
      api = $apiVersion
      model = $model
      ok = $true
      status = 200
      message = 'ok'
      text = ($resp.candidates[0].content.parts[0].text)
    }
  }
  catch {
    $status = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    }
    $details = $_.ErrorDetails.Message
    if (-not $details) {
      $details = $_.Exception.Message
    }
    return [pscustomobject]@{
      api = $apiVersion
      model = $model
      ok = $false
      status = $status
      message = $details
      text = ''
    }
  }
}

$listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=$key"
try {
  $list = Invoke-RestMethod -Uri $listUrl -Method Get -TimeoutSec 30 -ErrorAction Stop
  Write-Output ("LIST_OK count=" + $list.models.Count)
  $list.models | Select-Object -First 8 | ForEach-Object {
    Write-Output ("MODEL " + $_.name + " methods=" + ($_.supportedGenerationMethods -join '|'))
  }
}
catch {
  $errMsg = $_.ErrorDetails.Message
  if (-not $errMsg) {
    $errMsg = $_.Exception.Message
  }
  Write-Output ("LIST_ERR " + $errMsg)
}

$models = @('gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-1.5-flash')
$apis = @('v1beta', 'v1')
$results = foreach ($a in $apis) {
  foreach ($m in $models) {
    Invoke-GeminiPost -apiVersion $a -model $m
  }
}

Write-Output 'GEN_RESULTS_BEGIN'
$results | ForEach-Object { $_ | ConvertTo-Json -Compress }
Write-Output 'GEN_RESULTS_END'
