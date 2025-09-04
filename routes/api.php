<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FuncController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TelegramController;
use App\Http\Middleware\VerifyTelegramWebhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::group([

    'middleware' => 'auth:api',

], function () {
    //base user logic
    Route::post('logout', [AuthController::class,'logout']);
    Route::post('refresh', 'AuthController@refresh');
    Route::post('me', [AuthController::class,'me']);

    //order
    Route::get('orders',[OrderController::class,'index']);
    Route::post('orders',[OrderController::class,'store']);
    Route::get('orders/{order}',[OrderController::class,'show']);
    Route::put('orders/{order}',[OrderController::class,'update']);
    Route::delete('orders/{order}',[OrderController::class,'delete']);
    //func
    Route::post('func/settg',[FuncController::class,'settg']);

});

//base user logic
Route::post('login', [AuthController::class,'login']);
Route::post('register', [AuthController::class,'register']);
Route::get('test',function(){
    return response()->json(['1'=>'123']);
});

//telegram
Route::group([

    'middleware' => [VerifyTelegramWebhook::class],

], function () {
Route::get('telegram/test',[TelegramController::class,'test']);

});