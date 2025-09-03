<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Get orders from user
     *
     * @return array
     */
    public function index()
    {
        $user = auth()->user();

        $orders = $user->orders()->with('cargos')->get();

        return response()->json($orders);
    }

    public function store()
    {
        $validated = request()->validate([
            'from_address' => "required|string|max:255",
            'to_address' => "required|string|max:255",
            'price' => "numeric",
            'cargos' => "required|array|min:1",
            'cargos.*.title' => "required|string|max:255",
            'cargos.*.weight' => "required|numeric|min:0",
            'cargos.*.type' => "required|string|max:255",
            'cargos.*.size' => "required|string|max:255",
        ]);

        $order = Order::create([
            'user_id' => auth()->id(),
            'status' => 'pending',
            'from_address' => $validated['from_address'],
            'to_address' => $validated['to_address'],
            'price' => $validated['price'] ?? 0,
        ]);

        foreach ($validated['cargos'] as $cargoData) {
            $order->cargos()->create($cargoData);
        }

        return response()->json($order->load('cargos'), 201);
    }
}

/*
{
  "from_address": "ул. Ленина, 1",
  "to_address": "ул. Победы, 10",
  "price": 500.00,
  "cargos": [
    {
      "title": "Laptop",
      "weight": 2,
      "size": "30x20x5",
      "type": "electronics"
    },
    {
      "title": "Ship",
      "weight": 3,
      "size": "40x30x20",
      "type": "electronics"
    }
  ]
}
*/
