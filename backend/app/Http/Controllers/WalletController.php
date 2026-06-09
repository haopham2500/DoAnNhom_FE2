<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->wallets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:10',
        ]);

        $wallet = $request->user()->wallets()->create($request->all());

        return response()->json($wallet, 201);
    }

    public function show(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($wallet);
    }

    public function update(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'string|max:255',
            'balance' => 'numeric|min:0',
            'currency' => 'string|max:10',
        ]);

        $wallet->update($request->all());

        return response()->json($wallet);
    }

    public function destroy(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $wallet->delete();

        return response()->json(null, 204);
    }
}
