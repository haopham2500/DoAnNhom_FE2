<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()->with(['category', 'wallet'])->orderBy('transaction_date', 'desc')->get();
        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric',
            'transaction_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $wallet = $request->user()->wallets()->find($request->wallet_id);
        if (!$wallet) {
            return response()->json(['message' => 'Invalid wallet'], 403);
        }

        DB::beginTransaction();
        try {
            $transaction = $request->user()->transactions()->create($request->all());
            
            if ($request->type === 'income') {
                $wallet->balance += $request->amount;
            } else {
                $wallet->balance -= $request->amount;
            }
            $wallet->save();
            
            DB::commit();
            return response()->json($transaction->load(['category', 'wallet']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create transaction'], 500);
        }
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::beginTransaction();
        try {
            $wallet = $transaction->wallet;
            if ($wallet) {
                if ($transaction->type === 'income') {
                    $wallet->balance -= $transaction->amount;
                } else {
                    $wallet->balance += $transaction->amount;
                }
                $wallet->save();
            }
            
            $transaction->delete();
            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete transaction'], 500);
        }
    }
}
