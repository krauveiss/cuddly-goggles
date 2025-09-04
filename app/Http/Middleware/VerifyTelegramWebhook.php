<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyTelegramWebhook
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response

    {
        $secretToken = config('telegram.secret_token', env('TELEGRAM_SECRET_TOKEN'));
        if ($request->header('X-Telegram-Bot-Api-Secret-Token') !== $secretToken) {
            abort(403, 'Invalid secret token');
        }

        return $next($request);
    }
}
