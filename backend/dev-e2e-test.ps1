$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $shows = Invoke-RestMethod -Uri http://localhost:8080/api/showtimes -WebSession $s -ErrorAction Stop
    Write-Output 'SHOWTIMES_OK'
    $shows | Select-Object -First 1 | ConvertTo-Json -Depth 5
} catch {
    Write-Output "SHOWTIMES_ERR: $($_.Exception.Message)"
}

try {
    $imp = Invoke-RestMethod -Uri http://localhost:8080/api/dev/impersonate -Method Post -Body (@{accountId=1} | ConvertTo-Json) -ContentType 'application/json' -WebSession $s -ErrorAction Stop
    Write-Output 'IMPERSONATE_OK:'
    $imp | ConvertTo-Json -Depth 5
} catch {
    Write-Output "IMPERSONATE_ERR: $($_.Exception.Message)"
}

# Determine showtimeId
$showtimeId = $null
if ($shows -is [System.Collections.IEnumerable]) { $first = $shows | Select-Object -First 1 } else { $first = $shows }
if ($first -ne $null) {
    if ($first.PSObject.Properties.Name -contains 'showtimeId') { $showtimeId = $first.showtimeId }
    elseif ($first.PSObject.Properties.Name -contains 'id') { $showtimeId = $first.id }
}
Write-Output "Selected showtimeId: $showtimeId"

if ($showtimeId -ne $null) {
    try {
        $hold = Invoke-RestMethod -Uri "http://localhost:8080/api/showtimes/$showtimeId/holds" -Method Post -Body (@{seats=@('A1'); action='hold'} | ConvertTo-Json) -ContentType 'application/json' -WebSession $s -ErrorAction Stop
        Write-Output "HOLD_OK: $hold"
    } catch {
        Write-Output "HOLD_ERR: $($_.Exception.Message)"
    }

    try {
        $holds = Invoke-RestMethod -Uri "http://localhost:8080/api/dev/holds/$showtimeId/1" -WebSession $s -ErrorAction Stop
        Write-Output "DEV_HOLDS_AFTER_HOLD:"
        $holds | ConvertTo-Json -Depth 5
    } catch {
        Write-Output "DEV_HOLDS_ERR: $($_.Exception.Message)"
    }

    # Create booking
    $bookingBody = @{ showtimeId = [int64]$showtimeId; seats = @(@{ code='A1'; type='adult' }) }
    try {
        $book = Invoke-RestMethod -Uri http://localhost:8080/api/bookings -Method Post -Body ($bookingBody | ConvertTo-Json) -ContentType 'application/json' -WebSession $s -ErrorAction Stop
        Write-Output 'BOOKING_OK:'
        $book | ConvertTo-Json -Depth 6
    } catch {
        Write-Output "BOOKING_ERR: $($_.Exception.Message)"
    }

    try {
        $holds2 = Invoke-RestMethod -Uri "http://localhost:8080/api/dev/holds/$showtimeId/1" -WebSession $s -ErrorAction Stop
        Write-Output "DEV_HOLDS_AFTER_BOOKING:"
        $holds2 | ConvertTo-Json -Depth 5
    } catch {
        Write-Output "DEV_HOLDS_AFTER_BOOKING_ERR: $($_.Exception.Message)"
    }
} else { Write-Output 'NO_SHOWTIME_FOUND' }
