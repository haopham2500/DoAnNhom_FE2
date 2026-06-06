<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'check_locked'])->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('wallets', \App\Http\Controllers\WalletController::class);
    Route::get('categories', [\App\Http\Controllers\CategoryController::class, 'index']); // Public/User can view
    Route::apiResource('transactions', \App\Http\Controllers\TransactionController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('transfers', \App\Http\Controllers\TransferController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('budgets', \App\Http\Controllers\BudgetController::class)->only(['index', 'store']);

    // Admin Routes
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        Route::get('/transactions', [\App\Http\Controllers\AdminController::class, 'transactions']);
        Route::get('/transfers', [\App\Http\Controllers\AdminController::class, 'transfers']);
        Route::get('/logs', [\App\Http\Controllers\AdminController::class, 'logs']);
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::get('/users/{user}', [\App\Http\Controllers\AdminController::class, 'showUser']);
        Route::put('/users/{user}', [\App\Http\Controllers\AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [\App\Http\Controllers\AdminController::class, 'destroyUser']);
        Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
        Route::put('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy']);
    });
});
