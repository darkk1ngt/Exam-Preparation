$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000/api'
$results = @()

function Add-Result {
    param(
        [string]$Step,
        [bool]$Ok,
        [string]$Detail
    )

    $script:results += [pscustomobject]@{
        Step   = $Step
        Status = if ($Ok) { 'PASS' } else { 'FAIL' }
        Detail = $Detail
    }
}

try {
    $health = Invoke-RestMethod "$base/health"
    Add-Result 'health' ($health.status -eq 'ok') ("status=$($health.status)")
} catch {
    Add-Result 'health' $false $_.Exception.Message
}

$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $adminLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -WebSession $adminSession -ContentType 'application/json' -Body (@{ email = 'admin@glh.co.uk'; password = 'Admin123!' } | ConvertTo-Json)
    Add-Result 'admin login' $true $adminLogin.message

    $pending = Invoke-RestMethod -Uri "$base/admin/producers" -WebSession $adminSession
    Add-Result 'admin list producers' $true ("count=$($pending.producers.Count)")

    $slots = Invoke-RestMethod -Uri "$base/admin/slots" -WebSession $adminSession
    Add-Result 'admin list slots' $true ("count=$($slots.slots.Count)")
} catch {
    Add-Result 'admin flow' $false $_.Exception.Message
}

$producerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $producerLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -WebSession $producerSession -ContentType 'application/json' -Body (@{ email = 'greenacre@glh.co.uk'; password = 'Producer123!' } | ConvertTo-Json)
    Add-Result 'producer login' $true $producerLogin.message

    $overview = Invoke-RestMethod -Uri "$base/dashboard/overview" -WebSession $producerSession
    Add-Result 'producer overview' $true ("products=$($overview.product_count)")

    $producerProducts = Invoke-RestMethod -Uri "$base/dashboard/products" -WebSession $producerSession
    Add-Result 'producer products' $true ("count=$($producerProducts.products.Count)")

    if ($producerProducts.products.Count -gt 0) {
        $producerOrderList = Invoke-RestMethod -Uri "$base/dashboard/orders" -WebSession $producerSession
        if ($producerOrderList.orders.Count -gt 0) {
            $targetOrder = $producerOrderList.orders | Where-Object { $_.status -eq 'pending' } | Select-Object -First 1
            if ($null -ne $targetOrder) {
                $confirmRes = Invoke-RestMethod -Method Put -Uri "$base/dashboard/orders/$($targetOrder.id)/status" -WebSession $producerSession -ContentType 'application/json' -Body (@{ status = 'confirmed' } | ConvertTo-Json)
                Add-Result 'producer order confirm' $true $confirmRes.message

                try {
                    Invoke-RestMethod -Method Put -Uri "$base/dashboard/orders/$($targetOrder.id)/status" -WebSession $producerSession -ContentType 'application/json' -Body (@{ status = 'pending' } | ConvertTo-Json) | Out-Null
                    Add-Result 'producer invalid transition blocked' $false 'Invalid transition unexpectedly allowed'
                } catch {
                    $errBody = $_.ErrorDetails.Message
                    $blocked = $errBody -like '*Invalid status transition*'
                    Add-Result 'producer invalid transition blocked' $blocked ($errBody -replace "`r|`n", ' ')
                }
            } else {
                Add-Result 'producer order confirm' $true 'No pending producer order available to transition'
                Add-Result 'producer invalid transition blocked' $true 'Skipped transition check (no pending order)'
            }
        } else {
            Add-Result 'producer order confirm' $true 'No producer orders available'
            Add-Result 'producer invalid transition blocked' $true 'Skipped transition check (no producer orders)'
        }
    }
} catch {
    Add-Result 'producer flow' $false $_.Exception.Message
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$email = "e2e_customer_$stamp@example.com"
$password = 'Customer123!'
$token = $null
$customerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

try {
    $register = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{ email = $email; password = $password; role = 'customer' } | ConvertTo-Json)
    $token = $register.verifyToken
    Add-Result 'customer register' $true ("email=$email")
} catch {
    Add-Result 'customer register' $false $_.Exception.Message
}

try {
    if (-not $token) {
        throw 'No verification token returned from register endpoint.'
    }

    $verify = Invoke-RestMethod -Uri "$base/auth/verify-email?token=$token"
    Add-Result 'customer verify' $true $verify.message
} catch {
    Add-Result 'customer verify' $false $_.Exception.Message
}

try {
    $customerLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -WebSession $customerSession -ContentType 'application/json' -Body (@{ email = $email; password = $password } | ConvertTo-Json)
    Add-Result 'customer login' $true $customerLogin.message

    $me = Invoke-RestMethod -Uri "$base/auth/me" -WebSession $customerSession
    Add-Result 'customer me' ($me.role -eq 'customer') ("role=$($me.role)")
} catch {
    Add-Result 'customer auth flow' $false $_.Exception.Message
}

$productId = $null
try {
    $products = Invoke-RestMethod -Uri "$base/products?limit=5&page=1"
    if ($products.products.Count -eq 0) {
        throw 'No products returned by /products.'
    }

    $productId = $products.products[0].id
    Add-Result 'products list' $true ("firstId=$productId")

    $product = Invoke-RestMethod -Uri "$base/products/$productId"
    Add-Result 'product detail' ($product.id -eq $productId) ("name=$($product.name)")
} catch {
    Add-Result 'products flow' $false $_.Exception.Message
}

try {
    if (-not $productId) {
        throw 'No product id available for cart flow.'
    }

    $cartAdd = Invoke-RestMethod -Method Post -Uri "$base/cart" -WebSession $customerSession -ContentType 'application/json' -Body (@{ productId = $productId; quantity = 2 } | ConvertTo-Json)
    Add-Result 'cart add' $true $cartAdd.message

    $cart = Invoke-RestMethod -Uri "$base/cart" -WebSession $customerSession
    Add-Result 'cart get' ($cart.items.Count -gt 0) ("items=$($cart.items.Count)")
} catch {
    Add-Result 'cart flow' $false $_.Exception.Message
}

$slotId = $null
try {
    $slots = Invoke-RestMethod -Uri "$base/slots"
    if ($slots.slots.Count -gt 0) {
        $slotId = $slots.slots[0].id
        Add-Result 'slots list' $true ("slotId=$slotId")
    } else {
        Add-Result 'slots list' $false 'No slots returned. Collection checkout cannot proceed.'
    }
} catch {
    Add-Result 'slots list' $false $_.Exception.Message
}

try {
    try {
        Invoke-RestMethod -Method Post -Uri "$base/orders" -WebSession $customerSession -ContentType 'application/json' -Body (@{
            fulfilment_type = 'delivery'
            delivery_address_line1 = '10 Demo Street'
            delivery_city = 'Gloucester, Gloucestershire'
            delivery_postcode = 'ABC123'
        } | ConvertTo-Json) | Out-Null
        Add-Result 'delivery invalid postcode blocked' $false 'Invalid postcode unexpectedly accepted'
    } catch {
        $msg = $_.ErrorDetails.Message
        $blocked = $msg -like '*Invalid UK postcode format*'
        Add-Result 'delivery invalid postcode blocked' $blocked ($msg -replace "`r|`n", ' ')
    }
} catch {
    Add-Result 'delivery invalid postcode blocked' $false $_.Exception.Message
}

try {
    if (-not $slotId) {
        throw 'Cannot create collection order without a slot.'
    }

    $order = Invoke-RestMethod -Method Post -Uri "$base/orders" -WebSession $customerSession -ContentType 'application/json' -Body (@{ fulfilment_type = 'collection'; collection_slot_id = $slotId } | ConvertTo-Json)
    Add-Result 'order create' $true ("orderId=$($order.orderId)")

    $orders = Invoke-RestMethod -Uri "$base/orders" -WebSession $customerSession
    Add-Result 'orders list' ($orders.orders.Count -gt 0) ("count=$($orders.orders.Count)")

    $singleOrder = Invoke-RestMethod -Uri "$base/orders/$($order.orderId)" -WebSession $customerSession
    Add-Result 'order detail' ($singleOrder.order.id -eq $order.orderId) ("status=$($singleOrder.order.status)")
} catch {
    Add-Result 'orders flow' $false $_.Exception.Message
}

try {
    $loyalty = Invoke-RestMethod -Uri "$base/loyalty" -WebSession $customerSession
    Add-Result 'loyalty get' $true ("points=$($loyalty.points_balance)")
} catch {
    Add-Result 'loyalty get' $false $_.Exception.Message
}

try {
    $notifications = Invoke-RestMethod -Uri "$base/notifications" -WebSession $customerSession
    Add-Result 'notifications get' $true ("count=$($notifications.notifications.Count)")
} catch {
    Add-Result 'notifications get' $false $_.Exception.Message
}

try {
    $profile = Invoke-RestMethod -Uri "$base/profile" -WebSession $customerSession
    Add-Result 'profile get' $true ("email=$($profile.email)")
} catch {
    Add-Result 'profile get' $false $_.Exception.Message
}

try {
    $logout = Invoke-RestMethod -Method Post -Uri "$base/auth/logout" -WebSession $customerSession
    Add-Result 'customer logout' $true $logout.message

    try {
        Invoke-RestMethod -Uri "$base/profile" -WebSession $customerSession | Out-Null
        Add-Result 'logout guard' $false 'Protected endpoint accessible after logout'
    } catch {
        $msg = $_.ErrorDetails.Message
        $is401 = ($msg -like '*Not authenticated*') -or ($msg -like '*Authentication Required*')
        Add-Result 'logout guard' $is401 ($msg -replace "`r|`n", ' ')
    }
} catch {
    Add-Result 'customer logout' $false $_.Exception.Message
}

# producer invalid product input should be rejected
try {
    try {
        Invoke-RestMethod -Method Post -Uri "$base/dashboard/products" -WebSession $producerSession -ContentType 'application/json' -Body (@{ name = 'X'; price = -5; stock_quantity = -1 } | ConvertTo-Json) | Out-Null
        Add-Result 'producer invalid product rejected' $false 'Invalid product payload unexpectedly accepted'
    } catch {
        $msg = $_.ErrorDetails.Message
        $isValidationError = ($msg -like '*price must be a positive number*') -or ($msg -like '*stock_quantity must be a non-negative integer*') -or ($msg -like '*name must be between 2 and 150 characters*')
        Add-Result 'producer invalid product rejected' $isValidationError ($msg -replace "`r|`n", ' ')
    }
} catch {
    Add-Result 'producer invalid product rejected' $false $_.Exception.Message
}

$results | Format-Table -AutoSize

$failed = @($results | Where-Object { $_.Status -eq 'FAIL' })
if ($failed.Count -gt 0) {
    Write-Host "\nE2E smoke completed with failures: $($failed.Count)" -ForegroundColor Red
    exit 1
}

Write-Host "\nE2E smoke completed successfully." -ForegroundColor Green
exit 0
