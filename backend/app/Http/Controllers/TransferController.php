<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->transfers()->with(['fromWallet', 'toWallet'])->orderBy('transfer_date', 'desc')->orderBy('id', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'from_wallet_id' => 'required|exists:wallets,id',
            'to_wallet_id' => 'required|exists:wallets,id|different:from_wallet_id',
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string',
            'transfer_date' => 'required|date',
        ]);

        $fromWallet = Wallet::where('id', $request->from_wallet_id)->where('user_id', $request->user()->id)->firstOrFail();
        $toWallet = Wallet::where('id', $request->to_wallet_id)->where('user_id', $request->user()->id)->firstOrFail();

        $transfer = null;

        DB::transaction(function () use ($request, $fromWallet, $toWallet, &$transfer) {
            $fromWallet->decrement('balance', $request->amount);
            $toWallet->increment('balance', $request->amount);

            $transfer = $request->user()->transfers()->create($request->all());
        });

        return response()->json($transfer->load(['fromWallet', 'toWallet']), 201);
    }

    public function destroy(Request $request, Transfer $transfer)
    {
        if ($transfer->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($transfer) {
            // Hoàn lại tiền
            $fromWallet = Wallet::find($transfer->from_wallet_id);
            if ($fromWallet) $fromWallet->increment('balance', $transfer->amount);
            
            $toWallet = Wallet::find($transfer->to_wallet_id);
            if ($toWallet) $toWallet->decrement('balance', $transfer->amount);

            $transfer->delete();
        });

        return response()->json(['message' => 'Xóa giao dịch chuyển tiền thành công']);
    }
}
