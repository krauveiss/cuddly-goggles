<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class TelegramController extends Controller
{
    public function test(Request $request)
    {
        return response()->json(['ok' => "OK"]);
    }

    public function getUser(Request $request)
    {

        $validated = $request->validate([
            'telegram_id' => 'required|string|regex:/^[0-9]+$/|min:5|max:15'
        ]);
        $user = User::where('tg', $validated['telegram_id'])->first();
        if ($user) {
            return response()->json($user);
        } else {
            abort(404, 'no user with this token');
        }
    }


    public function getUserTg(Request $request)
    {
        $validated = $request->validate([
            'telegram_id' => 'required|string|regex:/^[0-9]+$/|min:5|max:15'
        ]);
        $user = User::where('tg', $validated['telegram_id'])->first();
        if ($user) {
            return $user;
        } else {
            abort(404, 'no user with this telegram');
        }
    }

    public function createorder(Request $request)
    {
        $validated = request()->validate([
            'date_delivery' => "required|string|max:11",
            'type_delivery' => "required|string|max:255",
            'cargos' => "required|array|min:1",
            'cargos.*.id' => "integer|exists:cargos,id",
            'cargos.*.title' => "required|string|max:255",
            'cargos.*.weight' => "required|numeric|min:0",
            'cargos.*.type' => "required|string|max:255",
            'cargos.*.size' => "required|string|max:255",
        ]);


        $mult = 1;

        switch ($validated['type_delivery']) {
            case "Минимум":
                $mult *= 100;
                break;
            case "Стандарт":
                $mult *= 200;
                break;
            case "Экспресс":
                $mult *= 400;
                break;
        }
        $order = Order::create([
            'user_id' => $this->getUserTg($request)->id,
            'status' => 'pending',
            'place' => 'client',
            'date' => $validated['date_delivery'],
            'price' => $validated['cargos'][0]['weight'] * $mult,
            'type_delivery' => $validated['type_delivery'],
        ]);
        foreach ($validated['cargos'] as $cargoData) {
            $order->cargos()->create($cargoData);
        }


        return response()->json($order->load('cargos'), 201);
    }

    public function getorders(Request $request)
    {
        $user = $this->getUserTg($request);

        $orders = $user->orders()->with('cargos')->get();

        return response()->json($orders);
    }

    public function cancelorder(Order $order)
    {
        $user = $this->getUserTg(request());
        if ($order->user_id != $user->id) {
            abort(403, "forbidden");
        }

        $order->delete();
    }

    public function serviceOrders(){
        $user = $this->getUserTg(request());
        if ($user->role != 'worker'){
            abort(403, "forbidden");
        }
        return response()->json([Order::all()]);
    }

    public function changeOrderStatus(Order $order){

        request()->validate(['status'=>"required|string|max:255"]);
        $user = $this->getUserTg(request());
        if ($user->role != 'worker'){
            abort(403, "forbidden");
        }

        $order->update([
            'status'=>request()->status
        ]);

        return response()->json(['status'=>'ok']);
    }

    public function changeOrderPlace(Order $order){

        request()->validate(['place'=>"required|string|max:255"]);
        $user = $this->getUserTg(request());
        if ($user->role != 'worker'){
            abort(403, "forbidden");
        }

        $order->update([
            'place'=>request()->place
        ]);

        return response()->json(['status'=>'ok']);
    }
}
