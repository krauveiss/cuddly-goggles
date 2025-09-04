<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TelegramController extends Controller
{
     public function test(Request $request)
    {
        return response()->json(['ok' => "OK"]);
    }
}
