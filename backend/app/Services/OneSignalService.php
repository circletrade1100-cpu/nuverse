<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OneSignalService
{
    protected $appId;
    protected $restApiKey;
    protected $apiUrl = 'https://onesignal.com/api/v1';

    public function __construct()
    {
        $this->appId = config('services.onesignal.app_id', env('ONESIGNAL_APP_ID'));
        $this->restApiKey = config('services.onesignal.rest_api_key', env('ONESIGNAL_REST_API_KEY'));
    }

    /**
     * Kirim notifikasi ke user tertentu berdasarkan External User ID
     *
     * @param string $message
     * @param string|array $externalUserId
     * @param string|null $title
     * @param string|null $url
     * @param array $data
     * @return array
     */
    public function sendToExternalUser(
        string $message,
        $externalUserId,
        ?string $title = null,
        ?string $url = null,
        array $data = []
    ): array {
        try {
            // Pastikan external user ID dalam format array
            $userIds = is_array($externalUserId) ? $externalUserId : [$externalUserId];

            $payload = [
                'app_id' => $this->appId,
                'contents' => ['en' => $message],
                'include_external_user_ids' => $userIds,
            ];

            // Tambahkan title jika ada
            if ($title) {
                $payload['headings'] = ['en' => $title];
            }

            // Tambahkan URL jika ada
            if ($url) {
                $payload['url'] = $url;
            }

            // Tambahkan custom data jika ada
            if (!empty($data)) {
                $payload['data'] = $data;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $this->restApiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/notifications", $payload);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('OneSignal notification sent successfully', [
                    'external_user_ids' => $userIds,
                    'recipients' => $result['recipients'] ?? 0,
                ]);
                return [
                    'success' => true,
                    'data' => $result,
                ];
            } else {
                $error = $response->json();
                Log::error('OneSignal notification failed', [
                    'status' => $response->status(),
                    'error' => $error,
                    'external_user_ids' => $userIds,
                ]);
                return [
                    'success' => false,
                    'error' => $error,
                ];
            }
        } catch (\Exception $e) {
            Log::error('OneSignal notification exception', [
                'message' => $e->getMessage(),
                'external_user_ids' => $userIds ?? null,
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim notifikasi ke semua subscribers
     *
     * @param string $message
     * @param string|null $title
     * @param string|null $url
     * @param array $data
     * @return array
     */
    public function sendToAll(
        string $message,
        ?string $title = null,
        ?string $url = null,
        array $data = []
    ): array {
        try {
            $payload = [
                'app_id' => $this->appId,
                'contents' => ['en' => $message],
                'included_segments' => ['All'],
            ];

            if ($title) {
                $payload['headings'] = ['en' => $title];
            }

            if ($url) {
                $payload['url'] = $url;
            }

            if (!empty($data)) {
                $payload['data'] = $data;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $this->restApiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/notifications", $payload);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('OneSignal broadcast sent successfully', [
                    'recipients' => $result['recipients'] ?? 0,
                ]);
                return [
                    'success' => true,
                    'data' => $result,
                ];
            } else {
                $error = $response->json();
                Log::error('OneSignal broadcast failed', [
                    'status' => $response->status(),
                    'error' => $error,
                ]);
                return [
                    'success' => false,
                    'error' => $error,
                ];
            }
        } catch (\Exception $e) {
            Log::error('OneSignal broadcast exception', [
                'message' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim notifikasi berdasarkan tags/filters
     *
     * @param string $message
     * @param array $filters
     * @param string|null $title
     * @param string|null $url
     * @param array $data
     * @return array
     */
    public function sendByTags(
        string $message,
        array $filters,
        ?string $title = null,
        ?string $url = null,
        array $data = []
    ): array {
        try {
            $payload = [
                'app_id' => $this->appId,
                'contents' => ['en' => $message],
                'filters' => $filters,
            ];

            if ($title) {
                $payload['headings'] = ['en' => $title];
            }

            if ($url) {
                $payload['url'] = $url;
            }

            if (!empty($data)) {
                $payload['data'] = $data;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $this->restApiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/notifications", $payload);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('OneSignal tag-based notification sent successfully', [
                    'recipients' => $result['recipients'] ?? 0,
                ]);
                return [
                    'success' => true,
                    'data' => $result,
                ];
            } else {
                $error = $response->json();
                Log::error('OneSignal tag-based notification failed', [
                    'status' => $response->status(),
                    'error' => $error,
                ]);
                return [
                    'success' => false,
                    'error' => $error,
                ];
            }
        } catch (\Exception $e) {
            Log::error('OneSignal tag-based notification exception', [
                'message' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}

