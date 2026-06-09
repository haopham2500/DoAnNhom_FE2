<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers = User::count();
        $totalWallets = Wallet::count();
        $totalTransactions = Transaction::count();
        
        $totalCategories = Category::count();
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');

        // Growth data for charts
        $usersGrowth = User::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $transactionsGrowth = Transaction::select(
                DB::raw('DATE(transaction_date) as date'), 
                'type',
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date', 'type')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalWallets' => $totalWallets,
            'totalTransactions' => $totalTransactions,
            'totalCategories' => $totalCategories,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'usersGrowth' => $usersGrowth,
            'transactionsGrowth' => $transactionsGrowth,
        ]);
    }

    public function users()
    {
        // Get users with their wallet and transaction counts
        $users = User::withCount('wallets', 'transactions')->get();
        return response()->json($users);
    }

    public function showUser(User $user)
    {
        $user->load('wallets');
        return response()->json($user);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:admin,user',
            'is_locked' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'role' => $request->role,
            'is_locked' => $request->is_locked ?? false,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_user',
            'details' => "Cập nhật thông tin user ID {$user->id} ({$user->name})"
        ]);

        return response()->json($user);
    }

    public function destroyUser(Request $request, User $user)
    {
        $userName = $user->name;
        $userId = $user->id;
        $user->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_user',
            'details' => "Xóa user ID {$userId} ({$userName})"
        ]);

        return response()->json(['message' => 'Xóa tài khoản thành công']);
    }

    public function logs()
    {
        $logs = ActivityLog::with('user:id,name,email')->orderBy('created_at', 'desc')->get();
        return response()->json($logs);
    }

    public function transactions()
    {
        $transactions = Transaction::with(['user:id,name,email', 'category', 'wallet'])->orderBy('transaction_date', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($transactions);
    }

    public function transfers()
    {
        $transfers = Transfer::with(['user:id,name,email', 'fromWallet', 'toWallet'])->orderBy('transfer_date', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($transfers);
    }
}
