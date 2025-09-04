<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FuncController extends Controller
{
    public function settg(Request $request)
    {
        $request->validate([
            'telegram_id' => 'required|string|regex:/^[0-9]+$/|min:5|max:15'
        ]);

        $user = User::find(auth()->id());
        $user->update(['tg'=>$request->telegram_id]);
        return response()->json(['status'=>'ok']);
    }
}
