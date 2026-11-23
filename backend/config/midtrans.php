<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Server Key
    |--------------------------------------------------------------------------
    |
    | Server Key dari Midtrans Dashboard
    | Sandbox: https://dashboard.sandbox.midtrans.com
    | Production: https://dashboard.midtrans.com
    |
    */
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Midtrans Client Key
    |--------------------------------------------------------------------------
    |
    | Client Key untuk Snap integration di frontend
    |
    */
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Is Production
    |--------------------------------------------------------------------------
    |
    | Set true untuk production, false untuk sandbox
    |
    */
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    |--------------------------------------------------------------------------
    | Is Sanitized
    |--------------------------------------------------------------------------
    |
    | Enable/disable sanitization
    |
    */
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    /*
    |--------------------------------------------------------------------------
    | Is 3DS
    |--------------------------------------------------------------------------
    |
    | Enable 3D Secure
    |
    */
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
];

