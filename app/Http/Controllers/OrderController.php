<?php

namespace App\Http\Controllers;

use App\Models\Cargo;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

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

  public function show(Order $order)
  {
    Gate::authorize('order-user', $order);
    return response()->json($order->load('cargos'), 201);
  }

  public function update(Order $order)
  {
    Gate::authorize('order-user', $order);

    if ($order->status != "pending") {
      return response()->json(['error' => 'it is impossible to change an order that is being processed']);
    }

    $validated = request()->validate([
      'from_address' => "required|string|max:255",
      'to_address' => "required|string|max:255",
      'price' => "numeric",
      'cargos' => "required|array|min:1",
      'cargos.*.id' => "integer|exists:cargos,id",
      'cargos.*.title' => "required|string|max:255",
      'cargos.*.weight' => "required|numeric|min:0",
      'cargos.*.type' => "required|string|max:255",
      'cargos.*.size' => "required|string|max:255",
    ]);
    $order->update([
      'user_id' => auth()->id(),
      'status' => 'pending',
      'from_address' => $validated['from_address'],
      'to_address' => $validated['to_address'],
      'price' => $validated['price'] ?? 0,
    ]);
    foreach ($validated['cargos'] as $cargoData) {
      if (isset($cargoData['id'])) {
        $cargo = Cargo::find($cargoData['id']);
        if (isset($cargo)) {
          if ($cargo->order_id === $order->id) {
            $cargo->update($cargoData);
          } else {
            return response()->json(['error' => 'forbidden'], 403);
          }
        } else {
          return response()->json(['error' => 'wrong cargo id to update']);
        }
      } else {
        $order->cargos()->create($cargoData);
      }
    }
    return response()->json(['status' => 'updated'], 200);
  }

  public function delete(Order $order){
    Gate::authorize('order-user', $order);
    $order->delete();
    return response()->json(['status' => 'deleted'], 200);
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
