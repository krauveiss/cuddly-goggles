<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $guarded = array();
    public function order(){
        
        return $this->belongsTo(Order::class);
    }
}
