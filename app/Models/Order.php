<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = array();
    public function cargos(){
        return $this->hasMany(Cargo::class);
    }
}
