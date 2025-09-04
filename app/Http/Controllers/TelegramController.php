<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TelegramController extends Controller
{
     public function handleWebhook(Request $request)
    {
        $data = $request->all();
        
        $message = $data['message']['text'] ?? '';
        $chatId = $data['message']['chat']['id'] ?? null;
        
        if ($message === '/start') {

        }

        return response()->json(['ok' => "OK"]);
    }
}
