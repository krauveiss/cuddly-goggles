<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
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

    
});

//base user logic
Route::post('login', [AuthController::class,'login']);
Route::post('register', [AuthController::class,'register']);
Route::get('test',function(){
    return response()->json(['1'=>'123']);
});
